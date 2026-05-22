import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { createHash, randomBytes } from 'crypto'

export interface AuthUser {
  id: string
  username: string
  namaLengkap: string
  role: string
  aktif: boolean
}

/**
 * Get authenticated user from session cookie.
 * Returns null if not authenticated, session expired, or user inactive.
 * Safe against corrupt session data.
 */
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const sessionToken = request.cookies.get('spmb_session')?.value
    if (!sessionToken) return null

    const session = await db.setting.findUnique({
      where: { key: `session:${sessionToken}` },
    })
    if (!session) return null

    // Safely parse session data
    let sessionData: { userId?: string; createdAt?: string }
    try {
      sessionData = JSON.parse(session.value)
    } catch {
      // Corrupt session data — delete and return null
      try { await db.setting.delete({ where: { key: `session:${sessionToken}` } }) } catch {}
      return null
    }

    if (!sessionData?.userId) {
      try { await db.setting.delete({ where: { key: `session:${sessionToken}` } }) } catch {}
      return null
    }

    const user = await db.user.findUnique({
      where: { id: sessionData.userId },
    })

    if (!user || !user.aktif) {
      try { await db.setting.delete({ where: { key: `session:${sessionToken}` } }) } catch {}
      return null
    }

    // Check session age (max 7 days)
    if (sessionData.createdAt) {
      const sessionAge = Date.now() - new Date(sessionData.createdAt).getTime()
      const maxAge = 7 * 24 * 60 * 60 * 1000
      if (sessionAge > maxAge) {
        try { await db.setting.delete({ where: { key: `session:${sessionToken}` } }) } catch {}
        return null
      }
    }

    return {
      id: user.id,
      username: user.username,
      namaLengkap: user.namaLengkap,
      role: user.role,
      aktif: user.aktif,
    }
  } catch {
    return null
  }
}

/**
 * Get authenticated user that must be admin.
 * Returns null if not authenticated or not admin.
 */
export async function getAdminUser(request: NextRequest): Promise<AuthUser | null> {
  const user = await getAuthUser(request)
  if (!user || user.role !== 'admin') return null
  return user
}

/**
 * Safely verify a password against a stored "salt:hash" format.
 * Returns false if the stored password is invalid or doesn't match.
 */
export function verifyPassword(password: string, storedPassword: string): boolean {
  if (!storedPassword || !storedPassword.includes(':')) return false
  const [salt, storedHash] = storedPassword.split(':')
  if (!salt || !storedHash) return false
  const inputHash = createHash('sha256').update(password + salt).digest('hex')
  return inputHash === storedHash
}

/**
 * Hash a password with a random salt.
 * Returns "salt:hash" format.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = createHash('sha256').update(password + salt).digest('hex')
  return `${salt}:${hash}`
}
