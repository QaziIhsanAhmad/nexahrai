import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL!;
  const isRemote = connectionString?.includes("render.com") || connectionString?.includes("neon.tech");
  const adapter = new PrismaPg({
    connectionString,
    max: process.env.NODE_ENV === "production" ? 1 : 10,
    ssl: isRemote ? { rejectUnauthorized: false } : undefined,
  });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
