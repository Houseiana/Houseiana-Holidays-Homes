// ⚠️ DEPRECATED: DO NOT USE THIS FILE
//
// This file is kept for backward compatibility during migration only.
// The frontend MUST NOT access the database directly.
//
// ALL data operations should use Railway Backend API via:
//   import { railwayApi } from '@/lib/railway-api'
//
// Example:
//   const users = await railwayApi.getUsers()        ❌ OLD: await prisma.user.findMany()
//   const user = await railwayApi.getUser(id)        ❌ OLD: await prisma.user.findUnique()
//   await railwayApi.createUser(data)                ❌ OLD: await prisma.user.create()
//
// If you see code importing this file, please refactor to use Railway API instead.

// Export null to prevent accidental usage
export const prisma = null;
export default null;

// Log warning if this file is imported
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  console.warn(
    '⚠️  WARNING: lib/prisma.ts is deprecated!\n' +
    '   The frontend should NOT access the database directly.\n' +
    '   Please use Railway API: import { railwayApi } from "@/lib/railway-api"'
  );
}
