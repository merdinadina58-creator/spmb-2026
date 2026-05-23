import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Helper to verify admin session
async function verifyAdmin(request: NextRequest) {
  const sessionToken = request.cookies.get('spmb_session')?.value
  if (!sessionToken) return null

  const session = await db.setting.findUnique({ where: { key: `session:${sessionToken}` } })
  if (!session) return null

  const sessionData = JSON.parse(session.value)
  const user = await db.user.findUnique({ where: { id: sessionData.userId } })
  if (!user || !user.aktif || user.role !== 'admin') return null

  return user
}

// PATCH update user (toggle active status, update role)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Akses ditolak' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    // Don't allow admin to deactivate themselves
    if (id === admin.id && body.aktif === false) {
      return NextResponse.json({ success: false, error: 'Tidak dapat menonaktifkan akun sendiri' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (body.aktif !== undefined) updateData.aktif = body.aktif
    if (body.role !== undefined) updateData.role = body.role
    if (body.namaLengkap !== undefined) updateData.namaLengkap = body.namaLengkap

    const user = await db.user.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        namaLengkap: user.namaLengkap,
        role: user.role,
        aktif: user.aktif,
      },
    })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// DELETE user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Akses ditolak' }, { status: 403 })
    }

    const { id } = await params

    // Don't allow admin to delete themselves
    if (id === admin.id) {
      return NextResponse.json({ success: false, error: 'Tidak dapat menghapus akun sendiri' }, { status: 400 })
    }

    await db.user.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
