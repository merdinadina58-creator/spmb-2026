import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Cache manifest for 5 minutes
let cachedManifest: { data: Record<string, unknown>; timestamp: number } | null = null
const CACHE_TTL = 5 * 60 * 1000

export async function GET() {
  try {
    let appName = 'SPMB 2026'
    let schoolName = ''
    let appSubtitle = 'Sistem Verifikasi Penerimaan Murid Baru'

    // Check cache
    if (cachedManifest && Date.now() - cachedManifest.timestamp < CACHE_TTL) {
      return NextResponse.json(cachedManifest.data, {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
          'Content-Type': 'application/manifest+json',
        },
      })
    }

    // Fetch settings from database
    const settings = await db.setting.findMany({
      where: {
        key: { in: ['appName', 'schoolName', 'appSubtitle'] },
      },
    })

    const settingsMap: Record<string, string> = {}
    for (const s of settings) {
      settingsMap[s.key] = s.value
    }

    appName = settingsMap.appName || 'SPMB 2026'
    schoolName = settingsMap.schoolName || ''
    appSubtitle = settingsMap.appSubtitle || 'Sistem Verifikasi Penerimaan Murid Baru'

    const fullName = schoolName ? `${appName} — ${schoolName}` : appName
    const appSubtitleSingleLine = appSubtitle.replace(/\n/g, ' ')

    const manifest = {
      name: `${fullName} - Sistem Verifikasi Pendaftaran`,
      short_name: appName,
      description: `${appSubtitleSingleLine}${schoolName ? ' ' + schoolName : ''} Tahun 2026`,
      start_url: '/',
      display: 'standalone' as const,
      background_color: '#0f172a',
      theme_color: '#059669',
      orientation: 'any',
      scope: '/',
      icons: [
        {
          src: '/api/app-icon?size=192',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable',
        },
        {
          src: '/api/app-icon?size=512',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
      categories: ['education', 'productivity'],
      lang: 'id',
      dir: 'ltr',
    }

    // Cache it
    cachedManifest = { data: manifest, timestamp: Date.now() }

    return NextResponse.json(manifest, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'Content-Type': 'application/manifest+json',
      },
    })
  } catch (error) {
    console.error('Error generating manifest:', error)
    // Fallback to basic manifest
    return NextResponse.json(
      {
        name: 'SPMB 2026 - Sistem Verifikasi Pendaftaran',
        short_name: 'SPMB 2026',
        description: 'Sistem Verifikasi Penerimaan Murid Baru Tahun 2026',
        start_url: '/',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#059669',
        orientation: 'any',
        scope: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        categories: ['education', 'productivity'],
        lang: 'id',
        dir: 'ltr',
      },
      {
        headers: {
          'Content-Type': 'application/manifest+json',
        },
      }
    )
  }
}
