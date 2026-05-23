import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Cache for 5 minutes to avoid hitting DB on every icon request
let cachedIcon: { dataUrl: string; timestamp: number } | null = null
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const size = searchParams.get('size') || '192'

    // Check in-memory cache first
    let appIconDataUrl: string | null = null
    if (cachedIcon && Date.now() - cachedIcon.timestamp < CACHE_TTL) {
      appIconDataUrl = cachedIcon.dataUrl
    } else {
      // Fetch from database
      const setting = await db.setting.findUnique({ where: { key: 'appIcon' } })
      if (setting?.value) {
        appIconDataUrl = setting.value
        cachedIcon = { dataUrl: appIconDataUrl, timestamp: Date.now() }
      }
    }

    // If no custom icon, redirect to default
    if (!appIconDataUrl) {
      return NextResponse.redirect(new URL(`/icon-${size}.png`, request.url))
    }

    // Parse data URL: "data:image/png;base64,xxxxx"
    const dataUrlMatch = appIconDataUrl.match(/^data:([^;]+);base64,(.+)$/)
    if (!dataUrlMatch) {
      // Invalid format, fallback to default
      return NextResponse.redirect(new URL(`/icon-${size}.png`, request.url))
    }

    const mimeType = dataUrlMatch[1]
    const base64Data = dataUrlMatch[2]

    // Decode base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64')

    // Return image with appropriate content type and caching headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error serving app icon:', error)
    // Fallback to default icon on error
    const size = new URL(request.url).searchParams.get('size') || '192'
    return NextResponse.redirect(new URL(`/icon-${size}.png`, request.url))
  }
}
