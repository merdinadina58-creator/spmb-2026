import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createHash, randomBytes } from 'crypto'

function hashPassword(password: string, salt: string): string {
  return createHash('sha256').update(password + salt).digest('hex')
}

function hashNewPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = createHash('sha256').update(password + salt).digest('hex')
  return `${salt}:${hash}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, newUsername, oldPassword, newPassword } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID diperlukan' },
        { status: 400 }
      )
    }

    // Find the user
    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Pengguna tidak ditemukan' },
        { status: 404 }
      )
    }

    // Verify old password
    const [salt, storedHash] = user.password.split(':')
    const inputHash = hashPassword(oldPassword, salt)

    if (inputHash !== storedHash) {
      return NextResponse.json(
        { success: false, error: 'Password lama tidak sesuai' },
        { status: 401 }
      )
    }

    // Build update data
    const updateData: Record<string, string> = {}

    // Update username if provided and different
    if (newUsername && newUsername !== user.username) {
      if (newUsername.length < 3) {
        return NextResponse.json(
          { success: false, error: 'Username minimal 3 karakter' },
          { status: 400 }
        )
      }

      // Check if username is taken
      const existing = await db.user.findUnique({
        where: { username: newUsername },
      })
      if (existing && existing.id !== userId) {
        return NextResponse.json(
          { success: false, error: 'Username sudah digunakan' },
          { status: 400 }
        )
      }

      updateData.username = newUsername
    }

    // Update password if provided
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Password baru minimal 6 karakter' },
          { status: 400 }
        )
      }
      updateData.password = hashNewPassword(newPassword)
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada perubahan yang dilakukan' },
        { status: 400 }
      )
    }

    // Apply updates
    const updated = await db.user.update({
      where: { id: userId },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        username: updated.username,
        namaLengkap: updated.namaLengkap,
        role: updated.role,
      },
    })
  } catch (error) {
    console.error('Change credentials error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
