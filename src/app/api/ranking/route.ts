import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminUser } from '@/lib/auth'

// Parse Indonesian number format: "1.383,854" -> 1383.854
function parseIndonesianNumber(val: string | null | undefined): number {
  if (!val) return -1 // -1 means "no data", will be sorted to bottom
  const cleaned = val.replace(/[^\d.,-]/g, '').trim()
  if (!cleaned) return -1

  // Indonesian format: dots = thousands separator, comma = decimal
  if (cleaned.includes(',')) {
    const parts = cleaned.split(',')
    const intPart = parts[0].replace(/\./g, '')
    const decPart = parts[1] || '0'
    const result = parseFloat(`${intPart}.${decPart}`)
    return isNaN(result) ? -1 : result
  }

  // No comma - could be a plain number or use dots as thousands
  // Strategy: look at the pattern of dot-separated groups
  const dotParts = cleaned.split('.')
  
  if (dotParts.length === 1) {
    // No dots at all - plain number
    const result = parseFloat(cleaned)
    return isNaN(result) ? -1 : result
  }

  if (dotParts.length === 2) {
    // "83.286" or "1.383" - ambiguous
    const before = dotParts[0]
    const after = dotParts[1]
    
    // If the part after dot has 1-2 digits -> decimal point (e.g. "83.2", "83.28")
    if (after.length <= 2) {
      const result = parseFloat(cleaned)
      return isNaN(result) ? -1 : result
    }
    
    // If the part after dot has 3 digits, it could be:
    // - thousands separator: "1.383" = 1383  (when part of larger number with comma elsewhere)
    // - decimal: "83.286" = 83.286  (common in Indonesian scores/grades)
    // 
    // KEY INSIGHT: In Indonesian number format:
    // - If there's a comma somewhere, then dots are thousands separators
    // - If there's NO comma, then a single dot with 3+ digits after is usually a decimal
    //   because Indonesian uses comma for decimal, but sometimes dots are used too
    //
    // Since we already handled the comma case above, here (no comma):
    // A value like "83.286" is most likely a decimal (score/grade)
    // A value like "1.383" could be 1.383 or 1383
    
    const withDot = parseFloat(`${before}.${after}`)
    const withoutDot = parseFloat(`${before}${after}`)
    
    if (isNaN(withDot) && isNaN(withoutDot)) return -1
    if (isNaN(withDot)) return withoutDot
    if (isNaN(withoutDot)) return withDot
    
    // No comma present -> dot is more likely a decimal separator
    // Use the decimal interpretation unless it makes no sense
    // (i.e., the number with dot as decimal is negative or the integer interpretation is clearly better)
    
    // Exception: if before-dot is >= 1 and after-dot has exactly 3 digits and
    // the combined number is clearly a distance (large number), use thousands
    // E.g. "1.383" for distance = 1383 meters, not 1.383 meters
    
    // For context: this function is called for both jarak and nilai
    // For nilai: "83.286" = 83.286 (dot = decimal)
    // For jarak: "1.383" could be either, but since we have comma for decimal
    // in Indonesian format, "1.383" without comma = likely 1383
    
    // Simple heuristic: if withDot < 1, it's probably thousands separator
    // If withDot is between 0-100, it's a valid grade/score -> use decimal
    // If withDot > 100, less likely a decimal -> use thousands interpretation
    if (withDot >= 0 && withDot <= 100) return withDot
    if (withoutDot > 1000) return withoutDot
    return withDot
  }

  // 3+ parts: "1.383.854" -> definitely thousand separators
  const result = parseFloat(cleaned.replace(/\./g, ''))
  return isNaN(result) ? -1 : result
}

// Parse distance specifically - returns -1 for no data, positive number for meters
function parseDistance(val: string | null | undefined): number {
  if (!val) return -1
  // Remove "Meter", spaces
  const cleaned = val.replace(/[^\d.,-]/g, '').trim()
  if (!cleaned) return -1
  return parseIndonesianNumber(val)
}

export async function GET(request: NextRequest) {
  try {
    // Admin only — return empty data instead of 403 to prevent console errors
    const user = await getAdminUser(request)
    if (!user) {
      return NextResponse.json({
        success: true,
        data: [],
        filters: { jalurOptions: [], sekolahOptions: [], jurusanOptions: [] },
        kuota: 0,
        kuotaPerJalur: [],
        jalurConfigs: [],
      })
    }

    const { searchParams } = new URL(request.url)
    const jalur = searchParams.get('jalur') || 'all'
    const sekolah = searchParams.get('sekolah') || 'all'
    const jurusan = searchParams.get('jurusan') || 'all'
    const tampilan = searchParams.get('tampilan') || 'jarak'
    const statusFilter = searchParams.get('status') || 'all'
    const tahapParam = searchParams.get('tahap') || ''

    // Build where clause
    const where: Record<string, unknown> = {}

    // Tahap filter
    if (tahapParam) {
      where.tahap = parseInt(tahapParam)
    }

    if (jalur !== 'all') {
      const jalurList = jalur.split(',').map(s => s.trim())
      if (jalurList.length === 1) {
        where.subJalur = jalurList[0]
      } else {
        where.subJalur = { in: jalurList }
      }
    }

    if (sekolah !== 'all') {
      where.namaSekolahAsal = sekolah
    }

    if (jurusan !== 'all') {
      where.jurusan = jurusan
    }

    if (statusFilter !== 'all') {
      where.verificationStatus = statusFilter
    }

    // Fetch registrations
    const registrations = await db.registration.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    })

    // Get settings for kuota
    const kuotaSetting = await db.setting.findUnique({ where: { key: 'kuota' } })
    const kuota = kuotaSetting ? parseInt(kuotaSetting.value) || 0 : 0

    // Get jalur configs for kuota per jalur
    const jalurConfigs = await db.jalurConfig.findMany({ where: { aktif: true }, orderBy: { urutan: 'asc' } })

    // Enrich registrations with parsed numeric values
    // -1 means "no data" - will be sorted to bottom
    const enriched = registrations.map(r => {
      const jarakNum = parseDistance(r.lokasiJarak || r.skorJarak)
      const nilaiNum = parseIndonesianNumber(r.nilaiRataRata || r.skorNilaiRaport)
      const skorNum = parseIndonesianNumber(r.skor)
      const skorPrestasiAkademikNum = parseIndonesianNumber(r.skorPrestasiAkademik)

      return {
        ...r,
        _jarakNum: jarakNum,
        _nilaiNum: nilaiNum,
        _skorNum: skorNum,
        _skorPrestasiAkademikNum: skorPrestasiAkademikNum,
        _hasData: jarakNum > 0 || nilaiNum > 0 || skorNum > 0,
      }
    })

    // Sort based on tampilan
    // Records with data come FIRST, records without data go to BOTTOM
    let sorted = [...enriched]
    if (tampilan === 'jarak') {
      sorted.sort((a, b) => {
        // Both have data: sort ascending (nearest first)
        if (a._jarakNum > 0 && b._jarakNum > 0) return a._jarakNum - b._jarakNum
        // Only one has data: data comes first
        if (a._jarakNum > 0) return -1
        if (b._jarakNum > 0) return 1
        // Neither has data: keep original order
        return 0
      })
    } else if (tampilan === 'nilai') {
      sorted.sort((a, b) => {
        if (a._nilaiNum > 0 && b._nilaiNum > 0) return b._nilaiNum - a._nilaiNum
        if (a._nilaiNum > 0) return -1
        if (b._nilaiNum > 0) return 1
        return 0
      })
    } else if (tampilan === 'komposit') {
      sorted.sort((a, b) => {
        if (a._skorNum > 0 && b._skorNum > 0) return b._skorNum - a._skorNum
        if (a._skorNum > 0) return -1
        if (b._skorNum > 0) return 1
        return 0
      })
    }

    // Add ranking number (global and per-jalur)
    const jalurRankCounters: Record<string, number> = {}
    const ranked = sorted.map((r, idx) => {
      const jalur = r.subJalur as string
      if (!jalurRankCounters[jalur]) jalurRankCounters[jalur] = 0
      jalurRankCounters[jalur]++

      // Per-jalur ranking only counts records that have data for the current sort
      let jalurRank = jalurRankCounters[jalur]
      if (tampilan === 'jarak' && r._jarakNum <= 0) jalurRank = -1
      if (tampilan === 'nilai' && r._nilaiNum <= 0) jalurRank = -1
      if (tampilan === 'komposit' && r._skorNum <= 0) jalurRank = -1

      return {
        ...r,
        _ranking: idx + 1,
        _jalurRank: jalurRank,
      }
    })

    // Get available filter options (lightweight distinct queries instead of fetching all)
    const [jalurRaw, sekolahRaw, jurusanRaw] = await Promise.all([
      db.registration.findMany({ select: { subJalur: true }, distinct: ['subJalur'] }),
      db.registration.findMany({ select: { namaSekolahAsal: true }, distinct: ['namaSekolahAsal'] }),
      db.registration.findMany({ select: { jurusan: true }, distinct: ['jurusan'] }),
    ])
    const jalurOptions = jalurRaw.map(r => r.subJalur).filter(Boolean).sort()
    const sekolahOptions = sekolahRaw.map(r => r.namaSekolahAsal).filter(Boolean).sort()
    const jurusanOptions = jurusanRaw.map(r => r.jurusan).filter(Boolean).sort()

    // Calculate kuota per jalur
    const kuotaPerJalur = jalurConfigs.map(jc => ({
      nama: jc.nama,
      persentase: jc.persentase,
      kuota: Math.round(kuota * jc.persentase / 100),
    }))

    return NextResponse.json({
      success: true,
      data: ranked,
      filters: {
        jalurOptions,
        sekolahOptions,
        jurusanOptions,
      },
      kuota,
      kuotaPerJalur,
      jalurConfigs,
    })
  } catch (error) {
    console.error('Ranking error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal memuat data perangkingan' },
      { status: 500 }
    )
  }
}
