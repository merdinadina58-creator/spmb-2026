import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get all registrations ordered by NISN
    const registrations = await db.registration.findMany({
      select: {
        id: true,
        noRegistrasi: true,
        nama: true,
        nisn: true,
        subJalur: true,
        namaSekolahPilihan: true,
        namaSekolahAsal: true,
        verificationStatus: true,
        statusLulus: true,
        statusDaftarUlang: true,
      },
      orderBy: { nisn: 'asc' },
    })

    // 1. Find duplicates by NISN (same NISN appearing more than once)
    const nisnMap = new Map<string, typeof registrations>()
    for (const reg of registrations) {
      const key = reg.nisn
      if (!nisnMap.has(key)) nisnMap.set(key, [])
      nisnMap.get(key)!.push(reg)
    }

    const nisnDuplicates = Array.from(nisnMap.entries())
      .filter(([nisn, regs]) => regs.length > 1 && nisn && nisn.trim() !== '')
      .map(([nisn, regs]) => ({
        type: 'nisn' as const,
        key: nisn,
        label: `NISN: ${nisn}`,
        count: regs.length,
        registrations: regs,
      }))

    // 2. Find potential duplicates by similar name (same name, different NISN)
    const nameMap = new Map<string, typeof registrations>()
    for (const reg of registrations) {
      // Normalize name: lowercase, remove extra spaces
      const normalizedName = reg.nama.toLowerCase().replace(/\s+/g, ' ').trim()
      if (!nameMap.has(normalizedName)) nameMap.set(normalizedName, [])
      nameMap.get(normalizedName)!.push(reg)
    }

    const nameDuplicates = Array.from(nameMap.entries())
      .filter(([name, regs]) => {
        if (regs.length < 2 || !name || name.trim() === '') return false
        // Only flag if NISN is different (same NISN already caught above)
        const uniqueNisns = new Set(regs.map(r => r.nisn))
        return uniqueNisns.size > 1
      })
      .map(([name, regs]) => ({
        type: 'nama' as const,
        key: name,
        label: `Nama: ${regs[0].nama}`,
        count: regs.length,
        registrations: regs,
      }))

    const allDuplicates = [...nisnDuplicates, ...nameDuplicates]
    const summary = {
      totalChecked: registrations.length,
      nisnDuplicateGroups: nisnDuplicates.length,
      nisnDuplicateCount: nisnDuplicates.reduce((sum, d) => sum + d.count, 0),
      nameDuplicateGroups: nameDuplicates.length,
      nameDuplicateCount: nameDuplicates.reduce((sum, d) => sum + d.count, 0),
    }

    return NextResponse.json({
      success: true,
      summary,
      duplicates: allDuplicates,
    })
  } catch (error) {
    console.error('Duplicates check error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
