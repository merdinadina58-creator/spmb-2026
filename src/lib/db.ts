import dotenv from 'dotenv'
import path from 'path'

// Force override DATABASE_URL from .env file (system env may have old SQLite URL)
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true })

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? [] : ['warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
