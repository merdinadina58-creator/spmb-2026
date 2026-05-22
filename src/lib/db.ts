import dotenv from 'dotenv'
import path from 'path'

// Force override DATABASE_URL from .env file (system env may have old URL)
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true })

import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  // Use Neon serverless adapter - no native binary required
  // Compatible with all serverless/edge environments
  const adapter = new PrismaNeon({ connectionString })
  
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'production' ? [] : ['warn', 'error'],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
