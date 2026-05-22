import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createHash, randomBytes } from 'crypto'
import { cleanupExpiredSessions } from '@/lib/session-cleanup'

// Simple password hashing with SHA-256 + salt
function hashPassword(password: string, salt: string): string {
  return createHash('sha256').update(password + salt).digest('hex')
}

function generateSessionToken(): string {
  return randomBytes(32).toString('hex')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username dan password harus diisi' },
        { status: 400 }
      )
    }

    // Find user
    const user = await db.user.findUnique({
      where: { username },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Username atau password salah' },
        { status: 401 }
      )
    }

    if (!user.aktif) {
      return NextResponse.json(
        { success: false, error: 'Akun Anda tidak aktif. Hubungi administrator.' },
        { status: 403 }
      )
    }

    // Verify password — guard against corrupt password field
    if (!user.password || !user.password.includes(':')) {
      return NextResponse.json(
        { success: false, error: 'Akun bermasalah. Hubungi administrator.' },
        { status: 401 }
      )
    }
    const [salt, storedHash] = user.password.split(':')
    if (!salt || !storedHash) {
      return NextResponse.json(
        { success: false, error: 'Akun bermasalah. Hubungi administrator.' },
        { status: 401 }
      )
    }
    const inputHash = hashPassword(password, salt)

    if (inputHash !== storedHash) {
      return NextResponse.json(
        { success: false, error: 'Username atau password salah' },
        { status: 401 }
      )
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })

    // Clean up expired sessions (non-blocking, don't await)
    cleanupExpiredSessions().catch(() => {})

    // Generate session token
    const sessionToken = generateSessionToken()

    // Store session in Setting table (key = session:{token}, value = userId)
    await db.setting.create({
      data: {
        key: `session:${sessionToken}`,
        value: JSON.stringify({
          userId: user.id,
          username: user.username,
          namaLengkap: user.namaLengkap,
          role: user.role,
          createdAt: new Date().toISOString(),
        }),
      },
    })

    // Set session cookie (7 days expiry)
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        namaLengkap: user.namaLengkap,
        role: user.role,
      },
    })

    response.cookies.set('spmb_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
