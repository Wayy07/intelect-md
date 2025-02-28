import { PrismaClient } from '@prisma/client';

// Create a new PrismaClient instance
const prisma = new PrismaClient();

// Log available exports from @prisma/client
console.log('All exports from @prisma/client:');
// Use require to get all exports
const prismaClient = require('@prisma/client');
console.log(Object.keys(prismaClient));

// Check if StareProdus exists
if ('StareProdus' in prismaClient) {
  console.log('\nStareProdus enum exists:');
  console.log(prismaClient.StareProdus);
} else {
  console.log('\nStareProdus enum does not exist in the Prisma client.');
}

// Disconnect the client
prisma.$disconnect();
