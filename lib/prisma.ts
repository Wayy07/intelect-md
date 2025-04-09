// Mock PrismaClient implementation
// This replaces the actual PrismaClient to avoid database connection issues

class MockPrismaClient {
  // Mock implementation of favoriteProduct model
  favoriteProduct = {
    findMany: async () => [],
    findFirst: async () => null,
    create: async (data: any) => ({
      id: Math.random().toString(36).substring(2, 15),
      ...data.data,
      createdAt: new Date()
    }),
    deleteMany: async () => ({ count: 0 })
  };

  // Mock implementation of user model
  user = {
    findUnique: async () => null,
    findFirst: async () => null,
    create: async (data: any) => ({
      id: Math.random().toString(36).substring(2, 15),
      ...data.data,
      createdAt: new Date()
    }),
    update: async () => ({})
  };

  // Mock implementation of other models as needed
  account = {
    create: async () => ({}),
    findFirst: async () => null
  };

  session = {
    create: async () => ({}),
    findUnique: async () => null,
    deleteMany: async () => ({ count: 0 })
  };

  // Add a mock $connect method
  $connect() {
    console.log("Mock PrismaClient connected");
    return Promise.resolve();
  }

  // Add a mock $disconnect method
  $disconnect() {
    console.log("Mock PrismaClient disconnected");
    return Promise.resolve();
  }
}

// Export the mock client as if it were the real Prisma client
const globalForPrisma = global as unknown as { prisma: MockPrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new MockPrismaClient();

// Cache the client in development
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
