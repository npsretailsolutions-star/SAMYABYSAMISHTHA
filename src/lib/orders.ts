import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/format";
import type { Product } from "@prisma/client";

export class OrderValidationError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export type CartItemInput = { productId: string; quantity: number };

export type OrderQuote = {
  products: Product[];
  subtotal: number;
  discount: number;
  couponCode: string | null;
  total: number;
};

export async function quoteOrder(items: CartItemInput[], couponCode?: string): Promise<OrderQuote> {
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

  if (products.length !== productIds.length) {
    throw new OrderValidationError("Some products were not found");
  }

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product || product.stock < item.quantity) {
      throw new OrderValidationError(`Insufficient stock for ${product?.name || "a product"}`);
    }
  }

  const subtotal = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId)!;
    return sum + product.price * item.quantity;
  }, 0);

  let discount = 0;
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
      discount =
        coupon.type === "PERCENT"
          ? Math.round((subtotal * coupon.value) / 100)
          : Math.min(coupon.value, subtotal);
      resolvedCouponCode = coupon.code;
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
            return {
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity: item.quantity,
              image: JSON.parse(product.images)[0] || null,
            };
          }),
        },
      },
      include: { items: true },
    });

    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
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
