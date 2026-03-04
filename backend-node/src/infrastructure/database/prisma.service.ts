import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton.
 * In production, we instantiate it once.
 * In development, we use a global variable to prevent opening too many connections
 * during hot-reloading (ts-node-dev).
 */

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const prismaClientSingleton = () => {
    const connectionString = process.env.DATABASE_URL;

    // Create a new pg Pool
    const pool = new Pool({ connectionString });

    // Create the pg adapter for Prisma
    const adapter = new PrismaPg(pool);

    return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
