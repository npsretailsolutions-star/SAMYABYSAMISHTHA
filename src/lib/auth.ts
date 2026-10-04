import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, CUSTOMER_COOKIE } from "@/lib/constants";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
export { ADMIN_COOKIE, CUSTOMER_COOKIE };

export type AdminTokenPayload = {
  id: string;
  email: string;
  name: string;
};

export function signAdminToken(payload: AdminTokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
  } catch {
    return null;
  }
}

export function getAdminSession(): AdminTokenPayload | null {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export type CustomerTokenPayload = {
  id: string;
  email: string;
  name: string;
};

export function signCustomerToken(payload: CustomerTokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyCustomerToken(token: string): CustomerTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as CustomerTokenPayload;
  } catch {
    return null;
  }
}

export function getCustomerSession(): CustomerTokenPayload | null {
  const token = cookies().get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  return verifyCustomerToken(token);
}
