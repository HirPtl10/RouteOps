import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient | null;
};

// Only initialise a real PrismaClient when a proper DATABASE_URL is available.
// Developer 2 owns the DB setup; until then, API routes fall back to mock data.
const isDbAvailable =
  typeof process.env.DATABASE_URL === "string" &&
  process.env.DATABASE_URL.startsWith("postgres");

function createPrismaClient(): PrismaClient | null {
  if (!isDbAvailable) return null;
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  } catch {
    return null;
  }
}

export const prisma: PrismaClient | null =
  globalForPrisma.prisma !== undefined
    ? globalForPrisma.prisma
    : createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
