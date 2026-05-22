import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createHash, randomBytes } from 'crypto'

// Simple password hashing with SHA-256 + salt
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = createHash('sha256').update(password + salt).digest('hex')
  return `${salt}:${hash}`
}

function verifyPassword(password: string, storedPassword: string): boolean {
  const [salt, storedHash] = storedPassword.split(':')
  const inputHash = createHash('sha256').update(password + salt).digest('hex')
  return inputHash === storedHash
}

// Helper to check if current user is admin
async function getAdminUser(request: NextRequest) {
  const sessionToken = request.cookies.get('spmb_session')?.value
  if (!sessionToken) return null

  const session = await db.setting.findUnique({ where: { key: `session:${sessionToken}` } })
  if (!session) return null

  const sessionData = JSON.parse(session.value)
  const user = await db.user.findUnique({ where: { id: sessionData.userId } })
  if (!user || !user.aktif || user.role !== 'admin') return null

  return user
}

// GET - List all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const adminUser = await getAdminUser(request)
    if (!adminUser) {
      return NextResponse.json({ success: false, error: 'Akses ditolak. Hanya admin yang dapat mengakses.' }, { status: 403 })
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        username: true,
        namaLengkap: true,
        role: true,
        aktif: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ success: true, users })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// POST - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const adminUser = await getAdminUser(request)
    if (!adminUser) {
      return NextResponse.json({ success: false, error: 'Akses ditolak. Hanya admin yang dapat menambah user.' }, { status: 403 })
    }

    const body = await request.json()
    const { username, password, namaLengkap, role } = body

    if (!username || !password || !namaLengkap || !role) {
      return NextResponse.json({ success: false, error: 'Semua field harus diisi' }, { status: 400 })
    }

    if (username.length < 3) {
      return NextResponse.json({ success: false, error: 'Username minimal 3 karakter' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password minimal 6 karakter' }, { status: 400 })
    }

    if (!['admin', 'verifikator'].includes(role)) {
      return NextResponse.json({ success: false, error: 'Role tidak valid. Gunakan admin atau verifikator.' }, { status: 400 })
    }

    // Check if username already exists
    const existing = await db.user.findUnique({ where: { username } })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Username sudah digunakan' }, { status: 400 })
    }

    const hashedPassword = hashPassword(password)
    const user = await db.user.create({
      data: {
        username,
        password: hashedPassword,
        namaLengkap,
        role,
        aktif: true,
      },
      select: {
        id: true,
        username: true,
        namaLengkap: true,
        role: true,
        aktif: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// PUT - Update user (admin only)
export async function PUT(request: NextRequest) {
  try {
    const adminUser = await getAdminUser(request)
    if (!adminUser) {
      return NextResponse.json({ success: false, error: 'Akses ditolak. Hanya admin yang dapat mengubah user.' }, { status: 403 })
    }

    const body = await request.json()
    const { id, username, password, namaLengkap, role, aktif } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID user diperlukan' }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({ where: { id } })
    if (!existingUser) {
      return NextResponse.json({ success: false, error: 'User tidak ditemukan' }, { status: 404 })
    }

    // Build update data
    const updateData: Record<string, unknown> = {}

    if (username !== undefined) {
      if (username.length < 3) {
        return NextResponse.json({ success: false, error: 'Username minimal 3 karakter' }, { status: 400 })
      }
      // Check if username is taken by another user
      const duplicate = await db.user.findUnique({ where: { username } })
      if (duplicate && duplicate.id !== id) {
        return NextResponse.json({ success: false, error: 'Username sudah digunakan' }, { status: 400 })
      }
      updateData.username = username
    }

    if (password !== undefined && password !== '') {
      if (password.length < 6) {
        return NextResponse.json({ success: false, error: 'Password minimal 6 karakter' }, { status: 400 })
      }
      updateData.password = hashPassword(password)
    }

    if (namaLengkap !== undefined) {
      updateData.namaLengkap = namaLengkap
    }

    if (role !== undefined) {
      if (!['admin', 'verifikator'].includes(role)) {
        return NextResponse.json({ success: false, error: 'Role tidak valid' }, { status: 400 })
      }
      updateData.role = role
    }

    if (aktif !== undefined) {
      updateData.aktif = aktif
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        namaLengkap: true,
        role: true,
        aktif: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// DELETE - Delete user (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const adminUser = await getAdminUser(request)
    if (!adminUser) {
      return NextResponse.json({ success: false, error: 'Akses ditolak. Hanya admin yang dapat menghapus user.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID user diperlukan' }, { status: 400 })
    }

    // Cannot delete self
    if (id === adminUser.id) {
      return NextResponse.json({ success: false, error: 'Tidak dapat menghapus akun sendiri' }, { status: 400 })
    }

    const existingUser = await db.user.findUnique({ where: { id } })
    if (!existingUser) {
      return NextResponse.json({ success: false, error: 'User tidak ditemukan' }, { status: 404 })
    }

    await db.user.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'User berhasil dihapus' })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
