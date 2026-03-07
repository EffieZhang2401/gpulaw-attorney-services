import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  _prisma: PrismaClient | undefined
}

/**
 * Lazy-initialized Prisma client.
 * Uses a Proxy to defer PrismaClient construction until first actual DB call,
 * preventing build-time errors when DATABASE_URL is not available.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    if (!globalForPrisma._prisma) {
      globalForPrisma._prisma = new PrismaClient();
    }
    const client = globalForPrisma._prisma;
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
