/**
 * Prisma client configuration and database utilities
 */

import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * Prisma client instance with connection pooling
 * Uses global instance in development to prevent multiple connections
 */
export const prisma = globalThis.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

/**
 * Database connection health check
 * @returns Promise<boolean> - True if database is connected
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

/**
 * Gracefully close database connection
 */
export async function closeDatabaseConnection(): Promise<void> {
  await prisma.$disconnect();
}

/**
 * Database transaction wrapper with error handling
 * @param fn - Function to execute within transaction
 * @returns Promise<T> - Result of the transaction
 */
export async function withTransaction<T>(
  fn: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(fn);
}

/**
 * Initialize database with sample data if empty
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Check if players table has data
    const playerCount = await prisma.player.count();
    
    if (playerCount === 0) {
      console.log('Database is empty. Please import NBA data.');
    } else {
      console.log(`Database initialized with ${playerCount} players`);
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}
