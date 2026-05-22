import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('spmb_session')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, authenticated: false },
        { status: 401, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
      )
    }

    // Look up session
    const session = await db.setting.findUnique({
      where: { key: `session:${sessionToken}` },
    })

    if (!session) {
      return NextResponse.json(
        { success: false, authenticated: false },
        { status: 401 }
      )
    }

    // Parse session data safely
    let sessionData: { userId?: string; createdAt?: string }
    try {
      sessionData = JSON.parse(session.value)
    } catch {
      // Corrupt session — clean up and reject
      try { await db.setting.delete({ where: { key: `session:${sessionToken}` } }) } catch {}
      return NextResponse.json(
        { success: false, authenticated: false },
        { status: 401 }
      )
    }

    if (!sessionData?.userId) {
      try { await db.setting.delete({ where: { key: `session:${sessionToken}` } }) } catch {}
      return NextResponse.json(
        { success: false, authenticated: false },
        { status: 401 }
      )
    }

    // Check if user still exists and is active
    const user = await db.user.findUnique({
      where: { id: sessionData.userId },
    })

    if (!user || !user.aktif) {
      // Clean up invalid session
      try { await db.setting.delete({ where: { key: `session:${sessionToken}` } }) } catch {}
      return NextResponse.json(
        { success: false, authenticated: false },
        { status: 401 }
      )
    }

    // Check session age (max 7 days)
    const sessionAge = Date.now() - new Date(sessionData.createdAt || Date.now()).getTime()
    const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days in ms
    if (sessionAge > maxAge) {
      // Expired session
      try { await db.setting.delete({ where: { key: `session:${sessionToken}` } }) } catch {}
      return NextResponse.json(
        { success: false, authenticated: false },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        namaLengkap: user.namaLengkap,
        role: user.role,
      },
    }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { success: false, authenticated: false },
      { status: 500 }
    )
  }
}
