import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createHash, randomBytes } from 'crypto'

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = createHash('sha256').update(password + salt).digest('hex')
  return `${salt}:${hash}`
}

// Helper to get authenticated user
async function getAuthUser(request: NextRequest) {
  const sessionToken = request.cookies.get('spmb_session')?.value
  if (!sessionToken) return null

  const session = await db.setting.findUnique({ where: { key: `session:${sessionToken}` } })
  if (!session) return null

  const sessionData = JSON.parse(session.value)
  const user = await db.user.findUnique({ where: { id: sessionData.userId } })
  if (!user || !user.aktif) return null

  return user
}

// PUT - Update own profile
export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getAuthUser(request)
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const body = await request.json()
    const { username, password, namaLengkap } = body

    const updateData: Record<string, unknown> = {}

    if (username !== undefined) {
      if (username.length < 3) {
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
      if (password.length < 6) {
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
          const sessionData = JSON.parse(session.value)
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
