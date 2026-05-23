import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createHash, randomBytes } from 'crypto'

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = createHash('sha256').update(password + salt).digest('hex')
  return `${salt}:${hash}`
}

// POST reset user password (admin only)
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('spmb_session')?.value
    if (!sessionToken) {
      return NextResponse.json({ success: false, error: 'Akses ditolak' }, { status: 403 })
    }

    const session = await db.setting.findUnique({ where: { key: `session:${sessionToken}` } })
    if (!session) {
      return NextResponse.json({ success: false, error: 'Akses ditolak' }, { status: 403 })
    }

    const sessionData = JSON.parse(session.value)
    const admin = await db.user.findUnique({ where: { id: sessionData.userId } })
    if (!admin || !admin.aktif || admin.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Akses ditolak' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, newPassword } = body

    if (!userId || !newPassword) {
      return NextResponse.json({ success: false, error: 'User ID dan password baru harus diisi' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, error: 'Password baru minimal 6 karakter' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ success: false, error: 'User tidak ditemukan' }, { status: 404 })
    }

    const hashedPassword = hashPassword(newPassword)
    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    // Also invalidate all sessions for this user
    const allSettings = await db.setting.findMany()
    for (const setting of allSettings) {
      if (setting.key.startsWith('session:')) {
        try {
          const sessData = JSON.parse(setting.value)
          if (sessData.userId === userId) {
            await db.setting.delete({ where: { key: setting.key } })
          }
        } catch {}
      }
    }

    return NextResponse.json({ success: true, message: `Password ${user.username} berhasil direset` })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
