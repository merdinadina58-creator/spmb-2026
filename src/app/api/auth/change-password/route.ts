import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, hashPassword, verifyPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: 'Password lama dan baru harus diisi' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, error: 'Password baru minimal 6 karakter' }, { status: 400 })
    }

    // Get full user record with password
    const fullUser = await db.user.findUnique({ where: { id: user.id } })
    if (!fullUser) {
      return NextResponse.json({ success: false, error: 'User tidak ditemukan' }, { status: 401 })
    }

    // Verify current password safely
    if (!verifyPassword(currentPassword, fullUser.password)) {
      return NextResponse.json({ success: false, error: 'Password lama salah' }, { status: 401 })
    }

    // Hash new password
    const newPasswordField = hashPassword(newPassword)

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
