import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/format";
import { AUTO_DISCOUNT_PERCENT } from "@/lib/constants";
import type { Product, ProductVariant } from "@prisma/client";

export class OrderValidationError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export type CartItemInput = { productId: string; quantity: number; variantId?: string };

type ProductWithVariants = Product & { variants: ProductVariant[] };

export type OrderQuote = {
  products: ProductWithVariants[];
  subtotal: number;
  discount: number;
  couponCode: string | null;
  total: number;
};

export async function quoteOrder(items: CartItemInput[], couponCode?: string): Promise<OrderQuote> {
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { variants: true },
  });

  if (products.length !== productIds.length) {
    throw new OrderValidationError("Some products were not found");
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

  // Every order gets at least the sitewide auto-discount, no code needed.
  let discount = Math.round((subtotal * AUTO_DISCOUNT_PERCENT) / 100);
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
          ? Math.round((subtotal * coupon.value) / 100)
          : Math.min(coupon.value, subtotal);
      if (couponDiscount > discount) {
        discount = couponDiscount;
        resolvedCouponCode = coupon.code;
      }
    }
  }

  return { products, subtotal, discount, couponCode: resolvedCouponCode, total: subtotal - discount };
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
  }
) {
  const { products, subtotal, discount, couponCode, total } = quote;

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerName: shipping.customerName,
        email: shipping.email,
        phone: shipping.phone,
        address: shipping.address,
        city: shipping.city,
        state: shipping.state,
        pincode: shipping.pincode,
        notes: shipping.notes,
        subtotal,
        discount,
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

  return order;
}
