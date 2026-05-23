import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('spmb_session')?.value

    if (sessionToken) {
      // Delete session from database
      try {
        await db.setting.delete({ where: { key: `session:${sessionToken}` } })
      } catch {
        // Session might not exist, ignore
      }
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set('spmb_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Delete cookie
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
