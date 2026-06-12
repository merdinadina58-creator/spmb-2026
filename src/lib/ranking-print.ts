import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

/**
 * Safely get a string value from ranking data record
 */
function v(r: Record<string, unknown>, key: string): string {
  const val = r[key]
  if (val === null || val === undefined) return '-'
  return String(val) || '-'
}

// Helper: check if a jalur name is Non-Akademik variant
function isNonAkademikJalur(subJalur: string): boolean {
  const lower = subJalur.toLowerCase().replace(/[^a-z0-9]/g, '')
  return lower.includes('nonakademik')
}

// Helper: check if a jalur name is Akademik variant (includes "Prestasi" without "Nonakademik")
function isAkademikJalur(subJalur: string): boolean {
  const lower = subJalur.toLowerCase().replace(/[^a-z0-9]/g, '')
  return (lower.includes('akademik') || lower === 'prestasi') && !lower.includes('nonakademik')
}

// Helper: check if a jalur is a prestasi type (either Akademik or Non-Akademik)
function isPrestasiJalur(subJalur: string): boolean {
  const lower = subJalur.toLowerCase().replace(/[^a-z0-9]/g, '')
  return lower.includes('prestasi') || lower.includes('akademik')
}

// Re-sort data by the appropriate prestasi score based on jalur
// Prestasi Akademik → sort by _skorPrestasiAkademikNum (desc)
// Prestasi Non Akademik → sort by _skorPrestasiNonAkademikNum (desc)
function reSortByPrestasiJalur(data: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  return [...data].sort((a, b) => {
    const subJalurA = (a.subJalur as string) || ''
    const subJalurB = (b.subJalur as string) || ''

    // Get the appropriate score for each record based on its jalur
    const getScore = (r: Record<string, unknown>, subJalur: string): number => {
      if (isNonAkademikJalur(subJalur)) {
        return (r._skorPrestasiNonAkademikNum as number) || -1
      }
      if (isAkademikJalur(subJalur)) {
        return (r._skorPrestasiAkademikNum as number) || -1
      }
      // Fallback for other jalur: use the jalur-aware prestasi score
      return getPrestasiNumValue(r)
    }

    const scoreA = getScore(a, subJalurA)
    const scoreB = getScore(b, subJalurB)

    // Both have data: sort descending (highest first)
    if (scoreA > 0 && scoreB > 0) return scoreB - scoreA
    // Only one has data: data comes first
    if (scoreA > 0) return -1
    if (scoreB > 0) return 1
    return 0
  })
}

// Helper: get prestasi score for display from a record
function getPrestasiDisplayValue(r: Record<string, unknown>): string {
  const subJalur = (r.subJalur as string) || ''
  if (isNonAkademikJalur(subJalur)) {
    return v(r, 'skorPrestasiNonAkademik') !== '-' ? v(r, 'skorPrestasiNonAkademik') : v(r, 'skorPrestasiAkademik')
  }
  return v(r, 'skorPrestasiAkademik') !== '-' ? v(r, 'skorPrestasiAkademik') : v(r, 'skorPrestasiNonAkademik')
}

// Helper: get numeric prestasi score from a record
function getPrestasiNumValue(r: Record<string, unknown>): number {
  const subJalur = (r.subJalur as string) || ''
  const akdNum = (r._skorPrestasiAkademikNum as number) || -1
  const nonAkdNum = (r._skorPrestasiNonAkademikNum as number) || -1
  if (isNonAkademikJalur(subJalur)) {
    return nonAkdNum > 0 ? nonAkdNum : akdNum
  }
  return akdNum > 0 ? akdNum : nonAkdNum
}

/**
 * Generate print HTML content for ranking report.
 * Designed to match the detail level of Lembar Verifikasi.
 */
export function getRankingPrintHTML(params: {
  selectedJalur: string
  rankingTampilan: string
  rankingSekolah: string
  rankingJurusan: string
  rankingStatus: string
  rankingData: Array<Record<string, unknown>>
  rankingKuota: number
  rankingKuotaPerJalur: Array<{ nama: string; persentase: number; kuota: number }>
  appName: string
  schoolName: string
}): string {
  const {
    selectedJalur,
    rankingTampilan,
    rankingSekolah,
    rankingJurusan,
    rankingStatus,
    rankingData,
    rankingKuota,
    rankingKuotaPerJalur,
    appName,
    schoolName,
  } = params

  const sortLabel = rankingTampilan === 'jarak' ? 'Jarak Terdekat' : rankingTampilan === 'nilai' ? 'Nilai Tertinggi' : rankingTampilan === 'komposit' ? 'Skor Komposit' : 'Skor Prestasi'
  const prestasiNote = isPrestasiJalur(selectedJalur) ? ' (diurutkan berdasarkan Skor Prestasi sesuai jalur)' : ''
  const jalurLabel = selectedJalur !== 'all' ? selectedJalur : 'Semua Jalur'
  const sekolahLabel = rankingSekolah !== 'all' ? rankingSekolah : 'Semua Sekolah'
  const jurusanLabel = rankingJurusan !== 'all' ? rankingJurusan : 'Semua Jurusan'
  const statusLabel = rankingStatus !== 'all' ? (rankingStatus === 'VERIFIED' ? 'Diterima' : rankingStatus === 'REJECTED' ? 'Ditolak' : 'Menunggu') : 'Semua Status'

  // Filter data by selected jalur
  const filteredData = selectedJalur === 'all'
    ? rankingData
    : rankingData.filter((r: Record<string, unknown>) => (r.subJalur as string) === selectedJalur)

  // Re-sort by appropriate prestasi score based on jalur for printing
  // This ensures the print always ranks by the correct prestasi score
  // regardless of the current tampilan mode
  const sortedForPrint = isPrestasiJalur(selectedJalur)
    ? reSortByPrestasiJalur(filteredData)
    : filteredData

  // Re-rank within selected jalur
  const jalurRankCounters: Record<string, number> = {}
  const reRanked = sortedForPrint.map((r: Record<string, unknown>, idx: number) => {
    const jalur = r.subJalur as string
    if (!jalurRankCounters[jalur]) jalurRankCounters[jalur] = 0
    jalurRankCounters[jalur]++
    return { ...r, _newRank: idx + 1, _newJalurRank: jalurRankCounters[jalur] }
  })

  // Helper to find kuota for a jalur
  function findKuota(subJalur: string): number {
    return rankingKuotaPerJalur.find(k => {
      const jalurName = subJalur.toLowerCase()
      return k.nama.toLowerCase().includes(jalurName) || jalurName.includes(k.nama.toLowerCase())
        || (k.nama.toLowerCase().includes('prestasi') && jalurName.includes('prestasi'))
        || (k.nama.toLowerCase().includes('domisili') && jalurName.includes('domisili'))
        || (k.nama.toLowerCase().includes('mutasi') && jalurName.includes('mutasi'))
        || (k.nama.toLowerCase().includes('afirmasi') && (jalurName.includes('keluarga') || jalurName.includes('ktm')))
    })?.kuota || 0
  }

  // Build per-jalur summary stats
  const jalurGroups: Record<string, { total: number; verified: number; rejected: number; pending: number; kuota: number }> = {}
  for (const r of reRanked) {
    const jalur = r.subJalur as string
    if (!jalurGroups[jalur]) {
      jalurGroups[jalur] = { total: 0, verified: 0, rejected: 0, pending: 0, kuota: findKuota(jalur) }
    }
    jalurGroups[jalur].total++
    if (r.verificationStatus === 'VERIFIED') jalurGroups[jalur].verified++
    else if (r.verificationStatus === 'REJECTED') jalurGroups[jalur].rejected++
    else jalurGroups[jalur].pending++
  }

  // Generate rows
  const rows = reRanked.map((r: Record<string, unknown> & { _newRank: number; _newJalurRank: number }) => {
    const rankNum = r._newRank
    const jalurRank = r._newJalurRank
    const jarakNum = r._jarakNum as number
    const nilaiNum = r._nilaiNum as number
    const skorNum = r._skorNum as number
    const skorPrestasiNum = getPrestasiNumValue(r)
    const prestasiDisplay = getPrestasiDisplayValue(r)

    // Determine kuota cutoff
    const currentKuota = findKuota(r.subJalur as string)

    const sameJalurAbove = reRanked
      .filter((other: Record<string, unknown> & { _newRank: number; _newJalurRank: number }) =>
        (other.subJalur as string) === (r.subJalur as string) &&
        other._newJalurRank < jalurRank
      ).length

    const withinKuota = currentKuota > 0 && sameJalurAbove < currentKuota
    const isVerified = r.verificationStatus === 'VERIFIED'

    const rowBg = withinKuota && !isVerified ? '#f0fdf4' : isVerified ? '#f0fdf4' : r.verificationStatus === 'REJECTED' ? '#fef2f2' : ''
    const rankBg = rankNum === 1 ? '#fbbf24' : rankNum === 2 ? '#d1d5db' : rankNum === 3 ? '#b45309' : withinKuota ? '#d1fae5' : '#f3f4f6'
    const rankColor = rankNum <= 3 ? '#fff' : withinKuota ? '#047857' : '#6b7280'

    // Status badge
    const statusBadge = r.verificationStatus === 'VERIFIED'
      ? '<span style="background:#d1fae5;color:#047857;padding:1px 6px;border-radius:8px;font-size:9px">Diterima</span>'
      : r.verificationStatus === 'REJECTED'
        ? '<span style="background:#fee2e2;color:#b91c1c;padding:1px 6px;border-radius:8px;font-size:9px">Ditolak</span>'
        : '<span style="background:#fef3c7;color:#b45309;padding:1px 6px;border-radius:8px;font-size:9px">Menunggu</span>'

    // Kekurangan verifikasi
    const kekurangan = v(r, 'kekuranganVerifikasi')
    const kekuranganText = kekurangan !== '-'
      ? kekurangan.split(' | ').map(k => `<span style="display:block;font-size:8px;color:#b91c1c;line-height:1.2">${k}</span>`).join('')
      : '<span style="color:#ccc">-</span>'

    // Detail Portal values
    const skorLomba = v(r, 'skorLomba')
    const nilaiRataRataTKA = v(r, 'nilaiRataRataTKA')
    const skorPrestasiAkademik = v(r, 'skorPrestasiAkademik')

    return `<tr style="background:${rowBg}">
      <td style="padding:4px 3px;border:1px solid #ddd;text-align:center"><span style="display:inline-block;width:22px;height:22px;line-height:22px;border-radius:50%;background:${rankBg};color:${rankColor};font-size:9px;font-weight:bold">${rankNum}</span></td>
      <td style="padding:4px 3px;border:1px solid #ddd;text-align:center;font-size:9px;line-height:1.2">${r.subJalur as string}<br><span style="font-size:8px;color:#0369a1">#${jalurRank}</span></td>
      <td style="padding:4px 3px;border:1px solid #ddd;font-size:9px;line-height:1.3"><strong>${v(r, 'nama')}</strong><br><span style="font-size:8px;color:#666">NISN: ${v(r, 'nisn')}</span></td>
      <td style="padding:4px 3px;border:1px solid #ddd;font-size:8px;text-align:center">${v(r, 'noRegistrasi')}</td>
      <td style="padding:4px 3px;border:1px solid #ddd;font-size:9px;line-height:1.2">${v(r, 'namaSekolahAsal')}</td>
      <td style="padding:4px 3px;border:1px solid #ddd;font-size:8px;text-align:center">${v(r, 'jurusan')}</td>
      <td style="padding:4px 3px;border:1px solid #ddd;text-align:right;font-size:9px;font-weight:${rankingTampilan === 'jarak' ? 'bold' : 'normal'};color:${jarakNum > 0 ? '#0369a1' : '#ccc'}">${v(r, 'lokasiJarak')}</td>
      <td style="padding:4px 3px;border:1px solid #ddd;text-align:center;font-size:9px;color:${jarakNum > 0 ? '#0369a1' : '#ccc'}">${v(r, 'skorJarak')}</td>
      <td style="padding:4px 3px;border:1px solid #ddd;text-align:right;font-size:9px;font-weight:${rankingTampilan === 'nilai' ? 'bold' : 'normal'};color:${nilaiNum > 0 ? '#047857' : '#ccc'}">${v(r, 'nilaiRataRata')}</td>
      <td style="padding:4px 3px;border:1px solid #ddd;text-align:center;font-size:9px;color:${nilaiNum > 0 ? '#047857' : '#ccc'}">${v(r, 'skorNilaiRaport')}</td>
      <td style="padding:4px 3px;border:1px solid #ddd;text-align:center;font-size:9px;color:#7c3aed">${skorLomba}</td>
      <td style="padding:4px 3px;border:1px solid #ddd;text-align:center;font-size:9px;color:#7c3aed">${nilaiRataRataTKA}</td>
      <td style="padding:4px 3px;border:1px solid #ddd;text-align:center;font-size:9px;color:#7c3aed">${skorPrestasiAkademik}</td>
      <td style="padding:4px 3px;border:1px solid #ddd;text-align:center;font-size:9px;color:${skorNum > 0 ? '#b45309' : '#ccc'}">${v(r, 'totalNilai')}</td>
      <td style="padding:4px 3px;border:1px solid #ddd;text-align:center;font-size:9px;font-weight:${rankingTampilan === 'komposit' ? 'bold' : 'normal'};color:${skorNum > 0 ? '#b45309' : '#ccc'}">${v(r, 'skor')}</td>
      <td style="padding:4px 6px;border:1px solid #ddd;text-align:right;font-size:10px;font-weight:${rankingTampilan === 'prestasi' ? 'bold' : 'normal'};color:${skorPrestasiNum > 0 ? '#0d9488' : '#ccc'}">${prestasiDisplay}</td>
      <td style="padding:4px 3px;border:1px solid #ddd;font-size:8px;line-height:1.2;max-width:120px;overflow:hidden">${kekuranganText}</td>
      <td style="padding:4px 3px;border:1px solid #ddd;font-size:8px;text-align:center">${v(r, 'tanggalVerif')}</td>
      <td style="padding:4px 3px;border:1px solid #ddd;font-size:8px;text-align:center">${v(r, 'jamVerif')}</td>
      <td style="padding:4px 3px;border:1px solid #ddd;font-size:8px;text-align:center">${v(r, 'terbitKK')}</td>
      <td style="padding:4px 3px;border:1px solid #ddd;font-size:8px;text-align:center">${v(r, 'lamaKK')}</td>
      <td style="padding:4px 3px;border:1px solid #ddd;text-align:center;font-size:9px">${statusBadge}</td>
      <td style="padding:4px 3px;border:1px solid #ddd;text-align:center;font-size:8px">${withinKuota ? '<span style="color:#047857;font-weight:bold">&#10003;</span>' : '<span style="color:#ccc">-</span>'}</td>
    </tr>`
  }).join('')

  // Build jalur summary table
  const jalurSummaryRows = Object.entries(jalurGroups).map(([jalur, s]) => {
    const kuotaText = s.kuota > 0 ? String(s.kuota) : '-'
    const pct = s.total > 0 ? Math.round((s.verified / s.total) * 100) : 0
    return `<tr>
      <td style="padding:4px 8px;border:1px solid #ddd;font-size:10px;font-weight:500">${jalur}</td>
      <td style="padding:4px 8px;border:1px solid #ddd;text-align:center;font-size:10px">${kuotaText}</td>
      <td style="padding:4px 8px;border:1px solid #ddd;text-align:center;font-size:10px">${s.total}</td>
      <td style="padding:4px 8px;border:1px solid #ddd;text-align:center;font-size:10px;color:#047857">${s.verified}</td>
      <td style="padding:4px 8px;border:1px solid #ddd;text-align:center;font-size:10px;color:#b91c1c">${s.rejected}</td>
      <td style="padding:4px 8px;border:1px solid #ddd;text-align:center;font-size:10px;color:#b45309">${s.pending}</td>
      <td style="padding:4px 8px;border:1px solid #ddd;text-align:center;font-size:10px">${pct}%</td>
    </tr>`
  }).join('')

  // Total verified / rejected / pending counts
  const totalVerified = reRanked.filter(r => r.verificationStatus === 'VERIFIED').length
  const totalRejected = reRanked.filter(r => r.verificationStatus === 'REJECTED').length
  const totalPending = reRanked.filter(r => r.verificationStatus !== 'VERIFIED' && r.verificationStatus !== 'REJECTED').length

  return `<!DOCTYPE html><html><head><title>Perangkingan ${appName} - ${sortLabel}</title>
    <style>
      @page { size: A3 landscape; margin: 10mm; }
      body { font-family: Arial, sans-serif; margin: 0; padding: 10px; font-size: 10px; }
      .header { text-align: center; margin-bottom: 10px; border-bottom: 3px double #333; padding-bottom: 8px; }
      .header h1 { font-size: 16px; margin: 0 0 2px 0; letter-spacing: 2px; }
      .header h2 { font-size: 13px; margin: 0 0 2px 0; color: #555; }
      .header h3 { font-size: 11px; margin: 0 0 2px 0; color: #777; }
      .header p { font-size: 9px; color: #888; margin: 2px 0; }
      .filters { display: flex; gap: 10px; justify-content: center; margin-bottom: 8px; font-size: 9px; color: #666; }
      .filters span { background: #f5f5f5; padding: 2px 6px; border-radius: 4px; border: 1px solid #ddd; }
      .summary-section { margin-bottom: 8px; }
      .summary-section h4 { font-size: 11px; margin: 0 0 4px 0; color: #333; }
      .kuota-info { text-align: center; margin-bottom: 8px; font-size: 10px; }
      .kuota-info span { background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 4px; margin: 0 3px; }
      .stats-row { display: flex; gap: 8px; justify-content: center; margin-bottom: 8px; }
      .stat-box { text-align: center; padding: 4px 12px; border-radius: 6px; border: 1px solid #ddd; }
      .stat-box .stat-val { font-size: 16px; font-weight: bold; }
      .stat-box .stat-label { font-size: 8px; color: #666; }
      table { width: 100%; border-collapse: collapse; font-size: 9px; }
      th { background: #f0f4f8; padding: 4px 3px; border: 1px solid #cbd5e1; text-align: center; font-size: 8px; font-weight: 600; color: #334155; }
      th.active { background: #fef3c7; color: #92400e; }
      th.group-header { background: #1e293b; color: #fff; font-size: 9px; padding: 3px 5px; letter-spacing: 0.5px; }
      .legend { margin-top: 8px; font-size: 9px; color: #888; text-align: center; }
      .legend span { margin: 0 6px; }
      .footer-note { margin-top: 10px; font-size: 8px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 6px; }
      @media print { body { padding: 0; } .page-break { page-break-before: always; } }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>LAPORAN PERANGKINGAN PESERTA SPMB</h1>
      <h2>${appName}</h2>
      ${schoolName ? `<h3>${schoolName}</h3>` : ''}
      <p>Diurutkan berdasarkan: <strong>${sortLabel}${prestasiNote}</strong> &middot; Dicetak pada: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
    </div>

    <div class="filters">
      <span>Jalur: ${jalurLabel}</span>
      <span>Sekolah: ${sekolahLabel}</span>
      <span>Jurusan: ${jurusanLabel}</span>
      <span>Status: ${statusLabel}</span>
    </div>

    <!-- Stats Overview -->
    <div class="stats-row">
      <div class="stat-box" style="background:#f0f9ff;border-color:#bae6fd">
        <div class="stat-val" style="color:#0369a1">${reRanked.length}</div>
        <div class="stat-label">Total Pendaftar</div>
      </div>
      <div class="stat-box" style="background:#f0fdf4;border-color:#bbf7d0">
        <div class="stat-val" style="color:#047857">${totalVerified}</div>
        <div class="stat-label">Diterima</div>
      </div>
      <div class="stat-box" style="background:#fef2f2;border-color:#fecaca">
        <div class="stat-val" style="color:#b91c1c">${totalRejected}</div>
        <div class="stat-label">Ditolak</div>
      </div>
      <div class="stat-box" style="background:#fffbeb;border-color:#fde68a">
        <div class="stat-val" style="color:#b45309">${totalPending}</div>
        <div class="stat-label">Menunggu</div>
      </div>
      ${rankingKuota > 0 ? `<div class="stat-box" style="background:#eff6ff;border-color:#bfdbfe">
        <div class="stat-val" style="color:#1e40af">${rankingKuota}</div>
        <div class="stat-label">Total Kuota</div>
      </div>` : ''}
    </div>

    ${rankingKuota > 0 ? `<div class="kuota-info">${rankingKuotaPerJalur.map(kj => `<span>${kj.nama}: ${kj.kuota} (${kj.persentase}%)</span>`).join('')}</div>` : ''}

    <!-- Per-Jalur Summary -->
    <div class="summary-section">
      <h4>Ringkasan Per Jalur</h4>
      <table style="width:auto;min-width:500px">
        <thead>
          <tr>
            <th style="text-align:left">Jalur</th>
            <th>Kuota</th>
            <th>Total</th>
            <th style="color:#047857">Diterima</th>
            <th style="color:#b91c1c">Ditolak</th>
            <th style="color:#b45309">Menunggu</th>
            <th>Progres</th>
          </tr>
        </thead>
        <tbody>${jalurSummaryRows}</tbody>
      </table>
    </div>

    <!-- Detailed Ranking Table -->
    <div style="margin-top:8px">
      <table>
        <thead>
          <!-- Group Headers -->
          <tr>
            <th class="group-header" rowspan="2" style="width:32px">No</th>
            <th class="group-header" rowspan="2" style="width:70px">Jalur</th>
            <th class="group-header" colspan="2">Data Pendaftar</th>
            <th class="group-header" rowspan="2" style="width:100px">Sekolah Asal</th>
            <th class="group-header" rowspan="2" style="width:55px">Jurusan</th>
            <th class="group-header" colspan="2" style="${rankingTampilan === 'jarak' ? 'background:#0c4a6e' : ''}">Jarak</th>
            <th class="group-header" colspan="2" style="${rankingTampilan === 'nilai' ? 'background:#064e3b' : ''}">Nilai Raport</th>
            <th class="group-header" colspan="3" style="background:#4c1d95">Detail Portal</th>
            <th class="group-header" colspan="3" style="${rankingTampilan === 'komposit' || rankingTampilan === 'prestasi' ? 'background:#78350f' : ''}">Skor</th>
            <th class="group-header" colspan="5">Verifikasi</th>
            <th class="group-header" rowspan="2" style="width:45px">Status</th>
            <th class="group-header" rowspan="2" style="width:30px">Kuota</th>
          </tr>
          <tr>
            <!-- Data Pendaftar -->
            <th style="min-width:100px">Nama / NISN</th>
            <th style="width:65px">No. Reg</th>
            <!-- Jarak -->
            <th class="${rankingTampilan === 'jarak' ? 'active' : ''}" style="width:60px">Jarak</th>
            <th class="${rankingTampilan === 'jarak' ? 'active' : ''}" style="width:45px">Skor</th>
            <!-- Nilai Raport -->
            <th class="${rankingTampilan === 'nilai' ? 'active' : ''}" style="width:50px">Rata²</th>
            <th class="${rankingTampilan === 'nilai' ? 'active' : ''}" style="width:45px">Skor</th>
            <!-- Detail Portal -->
            <th style="width:45px;background:#f5f3ff;color:#6d28d9">Skor Lomba</th>
            <th style="width:50px;background:#f5f3ff;color:#6d28d9">Nilai TKA</th>
            <th style="width:55px;background:#f5f3ff;color:#6d28d9">Skor Prestasi</th>
            <!-- Skor -->
            <th style="width:45px">Total</th>
            <th class="${rankingTampilan === 'komposit' ? 'active' : ''}" style="width:45px">Komposit</th>
            <th class="${rankingTampilan === 'prestasi' ? 'active' : ''}" style="width:80px">Skor Prestasi</th>
            <!-- Verifikasi -->
            <th style="width:90px">Kekurangan</th>
            <th style="width:55px">Tgl Verif</th>
            <th style="width:40px">Jam</th>
            <th style="width:55px">Terbit KK</th>
            <th style="width:45px">Lama KK</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>

    <div class="legend">
      <span>&#x1F7E1; Rangking 1</span> <span>&#x26AA; Rangking 2</span> <span>&#x1F7E4; Rangking 3</span> <span>&#x1F7E2; Masuk Kuota</span>
      <span style="margin-left:15px">Total: ${reRanked.length} pendaftar</span>
      <span style="margin-left:15px">Diterima: ${totalVerified} | Ditolak: ${totalRejected} | Menunggu: ${totalPending}</span>
    </div>

    <div class="footer-note">
      Dokumen ini dihasilkan secara otomatis oleh ${appName}${schoolName ? ' — ' + schoolName : ''} &middot; Halaman ini bersifat rahasia dan hanya untuk keperluan internal panitia SPMB
    </div>
  </body></html>`
}

/**
 * Handle ranking export to Excel.
 * Enhanced to match the detail level of Lembar Verifikasi.
 */
export function handleRankingExportExcel(params: {
  rankingPreviewJalur: string
  rankingTampilan: string
  rankingSekolah: string
  rankingJurusan: string
  rankingStatus: string
  rankingData: Array<Record<string, unknown>>
  rankingKuota: number
  rankingKuotaPerJalur: Array<{ nama: string; persentase: number; kuota: number }>
  appName: string
  schoolName: string
}): void {
  const {
    rankingPreviewJalur: selectedJalur,
    rankingTampilan,
    rankingSekolah,
    rankingJurusan,
    rankingStatus,
    rankingData,
    rankingKuota,
    rankingKuotaPerJalur,
    appName,
    schoolName,
  } = params

  const sortLabel = rankingTampilan === 'jarak' ? 'Jarak Terdekat' : rankingTampilan === 'nilai' ? 'Nilai Tertinggi' : rankingTampilan === 'komposit' ? 'Skor Komposit' : 'Skor Prestasi'
  const prestasiNote = isPrestasiJalur(selectedJalur) ? ' (diurutkan berdasarkan Skor Prestasi sesuai jalur)' : ''
  const jalurLabel = selectedJalur !== 'all' ? selectedJalur : 'Semua Jalur'

  // Filter data by selected jalur
  const filteredData = selectedJalur === 'all'
    ? rankingData
    : rankingData.filter((r: Record<string, unknown>) => (r.subJalur as string) === selectedJalur)

  // Re-sort by appropriate prestasi score based on jalur for export
  // This ensures the Excel export always ranks by the correct prestasi score
  // regardless of the current tampilan mode
  const sortedForExport = isPrestasiJalur(selectedJalur)
    ? reSortByPrestasiJalur(filteredData)
    : filteredData

  // Re-rank
  const jalurRankCounters: Record<string, number> = {}
  const reRanked = sortedForExport.map((r: Record<string, unknown>, idx: number) => {
    const jalur = r.subJalur as string
    if (!jalurRankCounters[jalur]) jalurRankCounters[jalur] = 0
    jalurRankCounters[jalur]++
    return { ...r, _newRank: idx + 1, _newJalurRank: jalurRankCounters[jalur] }
  })

  const excelData = reRanked.map((r: Record<string, unknown> & { _newRank: number; _newJalurRank: number }) => {
    const rankNum = r._newRank
    const jalurRank = r._newJalurRank

    const currentKuota = rankingKuotaPerJalur.find(k => {
      const jalurName = (r.subJalur as string || '').toLowerCase()
      return k.nama.toLowerCase().includes(jalurName) || jalurName.includes(k.nama.toLowerCase())
        || (k.nama.toLowerCase().includes('prestasi') && jalurName.includes('prestasi'))
        || (k.nama.toLowerCase().includes('domisili') && jalurName.includes('domisili'))
        || (k.nama.toLowerCase().includes('mutasi') && jalurName.includes('mutasi'))
        || (k.nama.toLowerCase().includes('afirmasi') && (jalurName.includes('keluarga') || jalurName.includes('ktm')))
    })?.kuota || 0

    const sameJalurAbove = reRanked
      .filter((other: Record<string, unknown> & { _newRank: number; _newJalurRank: number }) =>
        (other.subJalur as string) === (r.subJalur as string) &&
        other._newJalurRank < jalurRank
      ).length

    const withinKuota = currentKuota > 0 && sameJalurAbove < currentKuota

    return {
      'Rangking': rankNum,
      'Rangking Jalur': jalurRank > 0 ? jalurRank : '-',
      'Jalur': r.subJalur as string,
      'No. Registrasi': v(r, 'noRegistrasi'),
      'Nama': v(r, 'nama'),
      'NISN': v(r, 'nisn'),
      'NIK': v(r, 'nik'),
      'Tanggal Lahir': v(r, 'tanggalLahir'),
      'Sekolah Asal': v(r, 'namaSekolahAsal'),
      'Jurusan': v(r, 'jurusan'),
      'Jarak': v(r, 'lokasiJarak'),
      'Skor Jarak': v(r, 'skorJarak'),
      'Nilai Rata-Rata': v(r, 'nilaiRataRata'),
      'Skor Nilai Raport': v(r, 'skorNilaiRaport'),
      'Skor Lomba': v(r, 'skorLomba'),
      'Nilai Rata-Rata TKA': v(r, 'nilaiRataRataTKA'),
      'Skor Prestasi': v(r, 'skorPrestasiAkademik'),
      'Skor Prestasi Akademik': (r.skorPrestasiAkademik as string) || '-',
      'Skor Prestasi Non Akademik': (r.skorPrestasiNonAkademik as string) || '-',
      'Skor Komposit': v(r, 'skor'),
      'Kekurangan Verifikasi': v(r, 'kekuranganVerifikasi'),
      'Tanggal Verif': v(r, 'tanggalVerif'),
      'Jam Verif': v(r, 'jamVerif'),
      'Terbit KK': v(r, 'terbitKK'),
      'Lama KK': v(r, 'lamaKK'),
      'Status Verifikasi': r.verificationStatus === 'VERIFIED' ? 'Diterima' : r.verificationStatus === 'REJECTED' ? 'Ditolak' : 'Menunggu',
      'Masuk Kuota': withinKuota ? 'Ya' : 'Tidak',
    }
  })

  const ws = XLSX.utils.json_to_sheet(excelData)

  // Set column widths
  ws['!cols'] = [
    { wch: 10 }, { wch: 14 }, { wch: 20 }, { wch: 18 }, { wch: 25 },
    { wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 22 },
    { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 20 },
    { wch: 14 }, { wch: 14 }, { wch: 28 }, { wch: 14 }, { wch: 10 }, { wch: 14 },
    { wch: 12 }, { wch: 14 }, { wch: 10 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Perangkingan')

  // Build per-jalur summary for Excel
  const jalurGroups: Record<string, { total: number; verified: number; rejected: number; pending: number; kuota: number }> = {}
  for (const r of reRanked) {
    const jalur = r.subJalur as string
    if (!jalurGroups[jalur]) {
      const kuota = rankingKuotaPerJalur.find(k => {
        const jalurName = jalur.toLowerCase()
        return k.nama.toLowerCase().includes(jalurName) || jalurName.includes(k.nama.toLowerCase())
          || (k.nama.toLowerCase().includes('prestasi') && jalurName.includes('prestasi'))
          || (k.nama.toLowerCase().includes('domisili') && jalurName.includes('domisili'))
          || (k.nama.toLowerCase().includes('mutasi') && jalurName.includes('mutasi'))
          || (k.nama.toLowerCase().includes('afirmasi') && (jalurName.includes('keluarga') || jalurName.includes('ktm')))
      })?.kuota || 0
      jalurGroups[jalur] = { total: 0, verified: 0, rejected: 0, pending: 0, kuota }
    }
    jalurGroups[jalur].total++
    if (r.verificationStatus === 'VERIFIED') jalurGroups[jalur].verified++
    else if (r.verificationStatus === 'REJECTED') jalurGroups[jalur].rejected++
    else jalurGroups[jalur].pending++
  }

  const totalVerified = reRanked.filter(r => r.verificationStatus === 'VERIFIED').length
  const totalRejected = reRanked.filter(r => r.verificationStatus === 'REJECTED').length
  const totalPending = reRanked.length - totalVerified - totalRejected

  // Add a summary sheet
  const summaryData = [
    { 'Keterangan': `LAPORAN PERANGKINGAN ${appName}${schoolName ? ' — ' + schoolName : ''}`, 'Nilai': '' },
    { 'Keterangan': 'Diurutkan Berdasarkan', 'Nilai': `${sortLabel}${prestasiNote}` },
    { 'Keterangan': 'Jalur', 'Nilai': jalurLabel },
    { 'Keterangan': 'Sekolah Asal', 'Nilai': rankingSekolah !== 'all' ? rankingSekolah : 'Semua Sekolah' },
    { 'Keterangan': 'Jurusan', 'Nilai': rankingJurusan !== 'all' ? rankingJurusan : 'Semua Jurusan' },
    { 'Keterangan': 'Status Verifikasi', 'Nilai': rankingStatus !== 'all' ? (rankingStatus === 'VERIFIED' ? 'Diterima' : rankingStatus === 'REJECTED' ? 'Ditolak' : 'Menunggu') : 'Semua Status' },
    { 'Keterangan': '', 'Nilai': '' },
    { 'Keterangan': 'Total Pendaftar', 'Nilai': reRanked.length.toString() },
    { 'Keterangan': 'Diterima', 'Nilai': totalVerified.toString() },
    { 'Keterangan': 'Ditolak', 'Nilai': totalRejected.toString() },
    { 'Keterangan': 'Menunggu', 'Nilai': totalPending.toString() },
    { 'Keterangan': 'Total Kuota', 'Nilai': rankingKuota.toString() },
    { 'Keterangan': '', 'Nilai': '' },
    { 'Keterangan': 'Ringkasan Per Jalur', 'Nilai': '' },
    ...Object.entries(jalurGroups).map(([jalur, s]) => ({ 'Keterangan': `  ${jalur}`, 'Nilai': `Total: ${s.total} | Diterima: ${s.verified} | Ditolak: ${s.rejected} | Menunggu: ${s.pending} | Kuota: ${s.kuota}` })),
    { 'Keterangan': '', 'Nilai': '' },
    { 'Keterangan': 'Kuota Per Jalur', 'Nilai': '' },
    ...rankingKuotaPerJalur.map(kj => ({ 'Keterangan': `  ${kj.nama}`, 'Nilai': `${kj.kuota} (${kj.persentase}%)` })),
    { 'Keterangan': '', 'Nilai': '' },
    { 'Keterangan': 'Dicetak pada', 'Nilai': new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
  ]
  const ws2 = XLSX.utils.json_to_sheet(summaryData)
  ws2['!cols'] = [{ wch: 30 }, { wch: 60 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'Ringkasan')

  const jalurSuffix = selectedJalur !== 'all' ? `_${selectedJalur.replace(/\s+/g, '_')}` : '_Semua_Jalur'
  const fileName = `Perangkingan_SPMB2026${jalurSuffix}_${sortLabel.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbout], { type: 'application/octet-stream' })
  saveAs(blob, fileName)
}
