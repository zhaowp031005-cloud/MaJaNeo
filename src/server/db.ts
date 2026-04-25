import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const databaseUrl =
  process.env["DATABASE_URL"] ??
  "postgresql://placeholder:placeholder@localhost:5432/placeholder?sslmode=disable";

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString: databaseUrl,
    }),
    log: ["error"],
  });

if (process.env["NODE_ENV"] !== "production") globalForPrisma.prisma = prisma;
