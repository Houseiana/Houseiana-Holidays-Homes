import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client only if not in build phase
let prismaInstance: any = null

try {
  if (process.env.NODE_ENV !== 'production' || process.env.DATABASE_URL) {
    prismaInstance = globalForPrisma.prisma ?? new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    })

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prismaInstance
    }
  }
} catch (error) {
  console.warn('Prisma client not available during build time. This is normal for static generation.')
  // Create a mock Prisma client for build time
  prismaInstance = null
}

export const prisma = prismaInstance

export default prisma