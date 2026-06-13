import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminUser } from '@/lib/auth'

/**
 * One-time migration: Fix skorPrestasiNonAkademik for Non-Akademik records.
 *
 * The SPMB Portal always shows "Skor Prestasi Akademik" as the label,
 * even for Non-Akademik pathway records. This caused the score to be
 * saved into skorPrestasiAkademik instead of skorPrestasiNonAkademik.
 *
 * This API fixes existing data by:
 * 1. Finding all Non-Akademik records where skorPrestasiNonAkademik is empty
 *    but skorPrestasiAkademik has a value
 * 2. Moving the value from skorPrestasiAkademik to skorPrestasiNonAkademik
 * 3. Clearing skorPrestasiAkademik for those records
 */
export async function POST(request: NextRequest) {
  try {
    // Admin only
    const user = await getAdminUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find all Non-Akademik records that have a prestasi score
    // Using mode: 'insensitive' for PostgreSQL case-insensitive search
    const nonAkademikRecords = await db.registration.findMany({
      where: {
        subJalur: {
          contains: 'onakademik',
          mode: 'insensitive',
        },
        skorPrestasiAkademik: { not: null },
      },
      select: {
        id: true,
        nama: true,
        subJalur: true,
        skorPrestasiAkademik: true,
        skorPrestasiNonAkademik: true,
      },
    })

    // Filter to only records where NonAkademik is empty/null AND Akademik has a value
    const recordsToFix = nonAkademikRecords.filter(r =>
      r.skorPrestasiAkademik && r.skorPrestasiAkademik.trim() !== '' &&
      (!r.skorPrestasiNonAkademik || r.skorPrestasiNonAkademik.trim() === '')
    )

    if (recordsToFix.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Tidak ada data yang perlu diperbaiki. Semua skor prestasi sudah benar.',
        fixed: 0,
      })
    }

    // Fix each record
    let fixedCount = 0
    const fixedRecords: Array<{ id: string; nama: string; skorPrestasiAkademik: string | null; skorPrestasiNonAkademik: string | null }> = []

    for (const record of recordsToFix) {
      if (record.skorPrestasiAkademik && record.skorPrestasiAkademik.trim() !== '') {
        await db.registration.update({
          where: { id: record.id },
          data: {
            skorPrestasiNonAkademik: record.skorPrestasiAkademik,
            skorPrestasiAkademik: null,
          },
        })
        fixedRecords.push({
          id: record.id,
          nama: record.nama,
          skorPrestasiAkademik: record.skorPrestasiAkademik,
          skorPrestasiNonAkademik: record.skorPrestasiAkademik, // now moved here
        })
        fixedCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil memperbaiki ${fixedCount} data Prestasi Non-Akademik. Skor dipindahkan dari skorPrestasiAkademik ke skorPrestasiNonAkademik.`,
      fixed: fixedCount,
      records: fixedRecords,
    })
  } catch (error) {
    console.error('Fix prestasi scores error:', error)
    const message = error instanceof Error ? error.message : 'Gagal memperbaiki data skor prestasi'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
