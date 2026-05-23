import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createHash, randomBytes } from 'crypto'

// Simple password hashing with SHA-256 + salt
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = createHash('sha256').update(password + salt).digest('hex')
  return `${salt}:${hash}`
}

// Check if setup is needed (no users exist)
export async function GET() {
  try {
    const userCount = await db.user.count()

    return NextResponse.json({
      success: true,
      needsSetup: userCount === 0,
      userCount,
    })
  } catch (error) {
    console.error('Setup check error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}

// Create initial admin user
export async function POST(request: NextRequest) {
  try {
    // Check if users already exist
    const userCount = await db.user.count()
    if (userCount > 0) {
      return NextResponse.json(
        { success: false, error: 'Setup sudah dilakukan. Akun admin sudah ada.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { username, password, namaLengkap } = body

    if (!username || !password || !namaLengkap) {
      return NextResponse.json(
        { success: false, error: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    if (username.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Username minimal 3 karakter' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password minimal 6 karakter' },
        { status: 400 }
      )
    }

    // Create admin user
    const hashedPassword = hashPassword(password)
    const user = await db.user.create({
      data: {
        username,
        password: hashedPassword,
        namaLengkap,
        role: 'admin',
        aktif: true,
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        namaLengkap: user.namaLengkap,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
