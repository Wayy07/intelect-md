import { PrismaClient } from '@prisma/client'

// Use a single instance of Prisma Client in development
// This prevents too many connections being created during hot reloading
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

// Log when Prisma connects
prisma.$connect()
  .then(() => {
    console.log('Successfully connected to the database')
  })
  .catch((error) => {
    console.error('Failed to connect to the database:', error)
  })

// Cache the client in development
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
