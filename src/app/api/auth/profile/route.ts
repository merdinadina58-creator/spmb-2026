import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, hashPassword, unauthenticatedResponse } from '@/lib/auth'

// PUT - Update own profile
export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getAuthUser(request)
    if (!currentUser) {
      return unauthenticatedResponse()
    }

    const body = await request.json()
    const { username, password, namaLengkap } = body

    const updateData: Record<string, unknown> = {}

    if (username !== undefined) {
      if (typeof username !== 'string' || username.length < 3) {
        return NextResponse.json({ success: false, error: 'Username minimal 3 karakter' }, { status: 400 })
      }
      // Check if username is taken
      const duplicate = await db.user.findUnique({ where: { username } })
      if (duplicate && duplicate.id !== currentUser.id) {
        return NextResponse.json({ success: false, error: 'Username sudah digunakan' }, { status: 400 })
      }
      updateData.username = username
    }

    if (password !== undefined && password !== '') {
      if (typeof password !== 'string' || password.length < 6) {
        return NextResponse.json({ success: false, error: 'Password minimal 6 karakter' }, { status: 400 })
      }
      updateData.password = hashPassword(password)
    }

    if (namaLengkap !== undefined) {
      updateData.namaLengkap = namaLengkap
    }

    const user = await db.user.update({
      where: { id: currentUser.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        namaLengkap: true,
        role: true,
      },
    })

    // Update session data if username or namaLengkap changed
    if (username || namaLengkap) {
      const sessionToken = request.cookies.get('spmb_session')?.value
      if (sessionToken) {
        const session = await db.setting.findUnique({ where: { key: `session:${sessionToken}` } })
        if (session) {
          let sessionData: Record<string, unknown>
          try {
            sessionData = JSON.parse(session.value)
          } catch {
            sessionData = {}
          }
          await db.setting.update({
            where: { key: `session:${sessionToken}` },
            data: {
              value: JSON.stringify({
                ...sessionData,
                username: user.username,
                namaLengkap: user.namaLengkap,
              }),
            },
          })
        }
      }
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
