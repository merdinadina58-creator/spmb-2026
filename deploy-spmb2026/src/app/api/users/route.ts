import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createHash, randomBytes } from 'crypto'

function hashPassword(password: string, salt: string): string {
  return createHash('sha256').update(password + salt).digest('hex')
}

export async function GET() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        username: true,
        namaLengkap: true,
        role: true,
        aktif: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Gagal memuat data pengguna' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, namaLengkap, role } = body

    if (!username || !password || !namaLengkap) {
      return NextResponse.json({ error: 'Username, password, dan nama lengkap wajib diisi' }, { status: 400 })
    }
    if (username.length < 3) {
      return NextResponse.json({ error: 'Username minimal 3 karakter' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })
    }

    const existing = await db.user.findUnique({ where: { username } })
    if (existing) {
      return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 })
    }

    const salt = randomBytes(16).toString('hex')
    const hashedPassword = hashPassword(password, salt)
    const storedPassword = `${salt}:${hashedPassword}`

    const user = await db.user.create({
      data: { username, password: storedPassword, namaLengkap, role: role || 'verifikator', aktif: true },
      select: { id: true, username: true, namaLengkap: true, role: true, aktif: true, createdAt: true },
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Gagal membuat pengguna' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, username, password, namaLengkap, role, aktif } = body

    if (!id) return NextResponse.json({ error: 'ID pengguna wajib diisi' }, { status: 400 })

    const existing = await db.user.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 })

    if (username && username !== existing.username) {
      const duplicate = await db.user.findUnique({ where: { username } })
      if (duplicate) return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (username) updateData.username = username
    if (namaLengkap) updateData.namaLengkap = namaLengkap
    if (role) updateData.role = role
    if (typeof aktif === 'boolean') updateData.aktif = aktif

    if (password && password.trim()) {
      if (password.length < 6) return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })
      const salt = randomBytes(16).toString('hex')
      const hashedPassword = hashPassword(password, salt)
      updateData.password = `${salt}:${hashedPassword}`
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
      select: { id: true, username: true, namaLengkap: true, role: true, aktif: true, lastLogin: true, createdAt: true },
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Gagal memperbarui pengguna' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 })

    const existing = await db.user.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 })

    if (existing.role === 'admin') {
      const adminCount = await db.user.count({ where: { role: 'admin', aktif: true } })
      if (adminCount <= 1) return NextResponse.json({ error: 'Tidak dapat menghapus admin terakhir' }, { status: 400 })
    }

    // Delete sessions for this user
    const sessions = await db.setting.findMany({ where: { key: { startsWith: 'session:' } } })
    for (const session of sessions) {
      try {
        const data = JSON.parse(session.value)
        if (data.userId === id) await db.setting.delete({ where: { id: session.id } })
      } catch { /* ignore */ }
    }

    await db.user.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Gagal menghapus pengguna' }, { status: 500 })
  }
}
