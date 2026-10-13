import { prisma } from "@/lib/prisma";
import { PREPAID_DISCOUNT_PERCENT, COD_CHARGE, getAutoDiscountPercent } from "@/lib/constants";
import { computeBundleDiscount } from "@/lib/discounts";
import { sendOrderNotificationEmail, sendCustomerOrderConfirmationEmail } from "@/lib/email";
import type { Product, ProductVariant } from "@prisma/client";

export class OrderValidationError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export type CartItemInput = {
  productId: string;
  quantity: number;
  variantId?: string;
  giftCharge?: number;
  giftNote?: string;
  isGiftItem?: boolean;
};

type ProductWithVariants = Product & {
  variants: ProductVariant[];
  category: { slug: string; name: string };
};

export type OrderQuote = {
  products: ProductWithVariants[];
  subtotal: number;
  discount: number;
  codCharge: number;
  giftTotal: number;
  couponCode: string | null;
  total: number;
};

export async function quoteOrder(
  items: CartItemInput[],
  couponCode?: string,
  paymentMethod: "COD" | "RAZORPAY" = "RAZORPAY"
): Promise<OrderQuote> {
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { variants: true, category: { select: { slug: true, name: true } } },
  });

  if (products.length !== productIds.length) {
    throw new OrderValidationError("Some products were not found");
  }

  // Gifting-category products and Build-Your-Own bouquet/hamper items are prepaid only.
  const hasGiftItem = items.some((item) => {
    if (item.isGiftItem) return true;
    const product = products.find((p) => p.id === item.productId);
    return product?.category.slug === "gifting";
  });
  if (hasGiftItem && paymentMethod === "COD") {
    throw new OrderValidationError(
      "Cash on Delivery is not available for Gifting / bouquet / hamper items. Please pay online."
    );
  }

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      throw new OrderValidationError("A product was not found");
    }
    if (item.variantId) {
      const variant = product.variants.find((v) => v.id === item.variantId);
      if (!variant || variant.stock < item.quantity) {
        throw new OrderValidationError(
          `Insufficient stock for ${product.name} (${variant?.label || "selected option"})`
        );
      }
    } else if (product.stock < item.quantity) {
      throw new OrderValidationError(`Insufficient stock for ${product.name}`);
    }
  }

  const subtotal = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId)!;
    return sum + product.price * item.quantity;
  }, 0);
  const giftTotal = items.reduce((sum, item) => sum + (item.giftCharge || 0), 0);

  // Shagun Days bundle offers (any 3 earrings / any 3 selected bangles at a flat
  // price) are final — they don't stack with the sitewide auto-discount below.
  const bundleResult = computeBundleDiscount(
    items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return {
        price: product.price,
        quantity: item.quantity,
        categorySlug: product.category.slug,
        categoryName: product.category.name,
        sku: product.sku,
      };
    })
  );
  const remainingSubtotal = subtotal - bundleResult.totalBundledValue;

  // Every order gets at least the sitewide auto-discount, no code needed —
  // it steps up to 20% once the cart crosses the Shagun Days threshold. This
  // only applies to the portion of the cart not already covered by a bundle.
  let autoDiscount = Math.round((remainingSubtotal * getAutoDiscountPercent(subtotal)) / 100);
  let resolvedCouponCode: string | null = null;
  if (couponCode) {
    const code = couponCode.trim().toUpperCase();
    const coupon = await prisma.coupon.findUnique({ where: { code } });
    if (
      coupon &&
      coupon.isActive &&
      (!coupon.expiresAt || coupon.expiresAt >= new Date()) &&
      (coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit) &&
      subtotal >= coupon.minOrderValue
    ) {
      const couponDiscount =
        coupon.type === "PERCENT"
          ? Math.round((remainingSubtotal * coupon.value) / 100)
          : Math.min(coupon.value, remainingSubtotal);
      if (couponDiscount > autoDiscount) {
        autoDiscount = couponDiscount;
        resolvedCouponCode = coupon.code;
      }
    }
  }

  // Extra incentive discount for paying online, on top of the base discount above.
  if (paymentMethod === "RAZORPAY") {
    autoDiscount += Math.round((remainingSubtotal * PREPAID_DISCOUNT_PERCENT) / 100);
  }
  const discount = bundleResult.totalDiscount + autoDiscount;
  const codCharge = paymentMethod === "COD" ? COD_CHARGE : 0;

  return {
    products,
    subtotal,
    discount,
    codCharge,
    giftTotal,
    couponCode: resolvedCouponCode,
    total: subtotal - discount + codCharge + giftTotal,
  };
}

export type ShippingInfo = {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  notes?: string;
};

export async function createOrderRecord(
  shipping: ShippingInfo,
  items: CartItemInput[],
  quote: OrderQuote,
  payment: {
    paymentMethod: "COD" | "RAZORPAY";
    paymentStatus: "PENDING" | "PAID";
    status?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
  },
  customerId?: string | null
) {
  const { products, subtotal, discount, codCharge, giftTotal, couponCode, total } = quote;

  const order = await prisma.$transaction(async (tx) => {
    const counter = await tx.orderCounter.upsert({
      where: { id: "default" },
      create: { id: "default", value: 2026001 },
      update: { value: { increment: 1 } },
    });
    const orderNumber = `SBS${counter.value}`;

    const created = await tx.order.create({
      data: {
        orderNumber,
        customerName: shipping.customerName,
        email: shipping.email,
        phone: shipping.phone,
        address: shipping.address,
        city: shipping.city,
        state: shipping.state,
        pincode: shipping.pincode,
        notes: shipping.notes,
        customerId: customerId || null,
        subtotal,
        discount,
        codCharge,
        giftTotal,
        couponCode,
        total,
        status: payment.status || "PENDING",
        paymentMethod: payment.paymentMethod,
        paymentStatus: payment.paymentStatus,
        razorpayOrderId: payment.razorpayOrderId || null,
        razorpayPaymentId: payment.razorpayPaymentId || null,
        items: {
          create: items.map((item) => {
            const product = products.find((p) => p.id === item.productId)!;
            const variant = item.variantId
              ? product.variants.find((v) => v.id === item.variantId)
              : undefined;
            const image = variant
              ? JSON.parse(variant.images)[0]
              : JSON.parse(product.images)[0];
            return {
              productId: product.id,
              variantId: variant?.id || null,
              variantLabel: variant?.label || null,
              name: product.name,
              price: product.price,
              quantity: item.quantity,
              image: image || null,
              giftCharge: item.giftCharge || 0,
              giftNote: item.giftNote || null,
            };
          }),
        },
      },
      include: { items: true },
    });

    for (const item of items) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      } else {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    if (couponCode) {
      await tx.coupon.update({
        where: { code: couponCode },
        data: { usedCount: { increment: 1 } },
      });
    }

    return created;
  });


  const emailPayload = {
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    email: order.email,
    phone: order.phone,
    address: order.address,
    city: order.city,
    state: order.state,
    pincode: order.pincode,
    subtotal: order.subtotal,
    discount: order.discount,
    codCharge: order.codCharge,
    giftTotal: order.giftTotal,
    total: order.total,
    paymentMethod: order.paymentMethod,
    items: order.items.map((i) => ({
      name: i.name,
      variantLabel: i.variantLabel,
      price: i.price,
      quantity: i.quantity,
    })),
  };

  // Awaited (not fire-and-forget): Vercel stops the function once the response is sent.
  // Emails go one after another to stay under Resend's rate limit.
  await sendOrderNotificationEmail(emailPayload).catch((e) => console.error("Admin email", e));
  await sendCustomerOrderConfirmationEmail({ ...emailPayload, createdAt: order.createdAt }).catch((e) =>
    console.error("Customer email", e)
  );

  return order;
}
