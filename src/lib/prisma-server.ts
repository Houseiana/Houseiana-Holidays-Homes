/**
 * Prisma Client for Server-Side API Routes Only
 *
 * This file provides Prisma database access exclusively for Next.js API routes.
 * Frontend components should use the Railway API client instead.
 *
 * Usage:
 *   import { prisma } from '@/lib/prisma-server'
 *   const users = await prisma.user.findMany()
 */

import { PrismaClient } from '@prisma/client'

// Prevent multiple Prisma Client instances in development
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
