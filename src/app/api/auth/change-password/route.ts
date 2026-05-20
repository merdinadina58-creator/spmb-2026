import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createHash, randomBytes } from 'crypto'

function hashPassword(password: string, salt: string): string {
  return createHash('sha256').update(password + salt).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('spmb_session')?.value
    if (!sessionToken) {
      return NextResponse.json({ success: false, error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const session = await db.setting.findUnique({ where: { key: `session:${sessionToken}` } })
    if (!session) {
      return NextResponse.json({ success: false, error: 'Sesi tidak valid' }, { status: 401 })
    }

    const sessionData = JSON.parse(session.value)
    const user = await db.user.findUnique({ where: { id: sessionData.userId } })
    if (!user || !user.aktif) {
      return NextResponse.json({ success: false, error: 'User tidak valid' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: 'Password lama dan baru harus diisi' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, error: 'Password baru minimal 6 karakter' }, { status: 400 })
    }

    // Verify current password
    const [salt, storedHash] = user.password.split(':')
    const inputHash = hashPassword(currentPassword, salt)
    if (inputHash !== storedHash) {
      return NextResponse.json({ success: false, error: 'Password lama salah' }, { status: 401 })
    }

    // Hash new password
    const newSalt = randomBytes(16).toString('hex')
    const newHash = hashPassword(newPassword, newSalt)
    const newPasswordField = `${newSalt}:${newHash}`

    await db.user.update({
      where: { id: user.id },
      data: { password: newPasswordField },
    })

    return NextResponse.json({ success: true, message: 'Password berhasil diubah' })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
