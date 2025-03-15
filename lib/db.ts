/**
 * This file re-exports the Prisma client as 'db' to maintain compatibility
 * with existing imports in API routes that use @/lib/db
 */

// Re-export the Prisma client as 'db' for easier imports
import { prisma } from './prisma';

// Export the Prisma client as 'db'
export const db = prisma;
