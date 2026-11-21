import { PrismaClient } from "@prisma/client";
import { normalizeDbUrl } from "@/lib/dbUrl";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const url = normalizeDbUrl(process.env.DATABASE_URL);

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient(url ? { datasources: { db: { url } } } : undefined);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
