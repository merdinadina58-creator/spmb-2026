import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

/**
 * Generate print HTML content for ranking report.
 * Extracted from page.tsx.
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

  const sortLabel = rankingTampilan === 'jarak' ? 'Jarak Terdekat' : rankingTampilan === 'nilai' ? 'Nilai Tertinggi' : 'Skor Komposit'
  const jalurLabel = selectedJalur !== 'all' ? selectedJalur : 'Semua Jalur'
  const sekolahLabel = rankingSekolah !== 'all' ? rankingSekolah : 'Semua Sekolah'
  const jurusanLabel = rankingJurusan !== 'all' ? rankingJurusan : 'Semua Jurusan'
  const statusLabel = rankingStatus !== 'all' ? (rankingStatus === 'VERIFIED' ? 'Diterima' : rankingStatus === 'REJECTED' ? 'Ditolak' : 'Menunggu') : 'Semua Status'

  // Filter data by selected jalur
  const filteredData = selectedJalur === 'all'
    ? rankingData
    : rankingData.filter((r: Record<string, unknown>) => (r.subJalur as string) === selectedJalur)

  // Re-rank within selected jalur
  const jalurRankCounters: Record<string, number> = {}
  const reRanked = filteredData.map((r: Record<string, unknown>, idx: number) => {
    const jalur = r.subJalur as string
    if (!jalurRankCounters[jalur]) jalurRankCounters[jalur] = 0
    jalurRankCounters[jalur]++
    return { ...r, _newRank: idx + 1, _newJalurRank: jalurRankCounters[jalur] }
  })

  const rows = reRanked.map((r: Record<string, unknown> & { _newRank: number; _newJalurRank: number }, idx: number) => {
    const rankNum = r._newRank
    const jalurRank = r._newJalurRank
    const jarakNum = r._jarakNum as number
    const nilaiNum = r._nilaiNum as number
    const skorNum = r._skorNum as number

    // Determine kuota cutoff
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
    const isVerified = r.verificationStatus === 'VERIFIED'

    const rowBg = withinKuota && !isVerified ? '#f0fdf4' : isVerified ? '#f0fdf4' : ''
    const rankBg = rankNum === 1 ? '#fbbf24' : rankNum === 2 ? '#d1d5db' : rankNum === 3 ? '#b45309' : withinKuota ? '#d1fae5' : '#f3f4f6'
    const rankColor = rankNum <= 3 ? '#fff' : withinKuota ? '#047857' : '#6b7280'

    return `<tr style="background:${rowBg}">
      <td style="padding:6px 8px;border:1px solid #ddd;text-align:center"><span style="display:inline-block;width:26px;height:26px;line-height:26px;border-radius:50%;background:${rankBg};color:${rankColor};font-size:11px;font-weight:bold">${rankNum}</span></td>
      <td style="padding:6px 8px;border:1px solid #ddd;text-align:center;font-size:11px">${r.subJalur as string}${jalurRank > 0 ? `<br><span style="font-size:9px;color:#0369a1">#${jalurRank}</span>` : ''}</td>
      <td style="padding:6px 8px;border:1px solid #ddd;font-size:12px"><strong>${r.nama as string}</strong><br><span style="font-size:9px;color:#999">NISN: ${r.nisn as string}</span></td>
      <td style="padding:6px 8px;border:1px solid #ddd;font-size:11px">${r.namaSekolahAsal as string}</td>
      <td style="padding:6px 8px;border:1px solid #ddd;font-size:11px">${r.jurusan as string}</td>
      <td style="padding:6px 8px;border:1px solid #ddd;text-align:right;font-size:11px;font-weight:${rankingTampilan === 'jarak' ? 'bold' : 'normal'};color:${jarakNum > 0 ? '#0369a1' : '#ccc'}">${r.lokasiJarak as string || '-'}</td>
      <td style="padding:6px 8px;border:1px solid #ddd;text-align:right;font-size:11px;font-weight:${rankingTampilan === 'nilai' ? 'bold' : 'normal'};color:${nilaiNum > 0 ? '#047857' : '#ccc'}">${r.nilaiRataRata as string || r.skorNilaiRaport as string || '-'}</td>
      <td style="padding:6px 8px;border:1px solid #ddd;text-align:right;font-size:11px;font-weight:${rankingTampilan === 'komposit' ? 'bold' : 'normal'};color:${skorNum > 0 ? '#b45309' : '#ccc'}">${r.skor as string || '-'}</td>
      <td style="padding:6px 8px;border:1px solid #ddd;text-align:center;font-size:10px">${r.verificationStatus === 'VERIFIED' ? '<span style="background:#d1fae5;color:#047857;padding:2px 8px;border-radius:10px">Diterima</span>' : r.verificationStatus === 'REJECTED' ? '<span style="background:#fee2e2;color:#b91c1c;padding:2px 8px;border-radius:10px">Ditolak</span>' : '<span style="background:#fef3c7;color:#b45309;padding:2px 8px;border-radius:10px">Menunggu</span>'}</td>
    </tr>`
  }).join('')

  return `<!DOCTYPE html><html><head><title>Perangkingan ${appName} - ${sortLabel}</title>
    <style>
      @page { size: A4 landscape; margin: 15mm; }
      body { font-family: Arial, sans-serif; margin: 0; padding: 15px; font-size: 12px; }
      .header { text-align: center; margin-bottom: 15px; border-bottom: 3px double #333; padding-bottom: 10px; }
      .header h1 { font-size: 18px; margin: 0 0 4px 0; letter-spacing: 2px; }
      .header h2 { font-size: 14px; margin: 0 0 4px 0; color: #555; }
      .header h3 { font-size: 12px; margin: 0 0 4px 0; color: #777; }
      .header p { font-size: 10px; color: #888; margin: 2px 0; }
      .filters { display: flex; gap: 15px; justify-content: center; margin-bottom: 10px; font-size: 10px; color: #666; }
      .filters span { background: #f5f5f5; padding: 2px 8px; border-radius: 4px; border: 1px solid #ddd; }
      .kuota-info { text-align: center; margin-bottom: 10px; font-size: 11px; }
      .kuota-info span { background: #dbeafe; color: #1e40af; padding: 3px 10px; border-radius: 4px; margin: 0 4px; }
      table { width: 100%; border-collapse: collapse; font-size: 11px; }
      th { background: #f5f5f5; padding: 8px; border: 1px solid #ddd; text-align: center; font-size: 11px; font-weight: 600; }
      th.active { background: #fef3c7; }
      .legend { margin-top: 10px; font-size: 10px; color: #888; text-align: center; }
      .legend span { margin: 0 8px; }
      @media print { body { padding: 0; } }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>LAPORAN PERANGKINGAN</h1>
      <h2>${appName}</h2>
      ${schoolName ? `<h3>${schoolName}</h3>` : ''}
      <p>Sistem Penerimaan Murid Baru · Diurutkan berdasarkan: <strong>${sortLabel}</strong> · Dicetak pada: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
    </div>
    <div class="filters">
      <span>Jalur: ${jalurLabel}</span>
      <span>Sekolah: ${sekolahLabel}</span>
      <span>Jurusan: ${jurusanLabel}</span>
      <span>Status: ${statusLabel}</span>
    </div>
    ${rankingKuota > 0 ? `<div class="kuota-info">Total Kuota: <span>${rankingKuota}</span> ${rankingKuotaPerJalur.map(kj => `<span>${kj.nama}: ${kj.kuota} (${kj.persentase}%)</span>`).join('')}</div>` : ''}
    <table>
      <thead>
        <tr>
          <th style="width:40px">No</th>
          <th style="width:90px">Jalur</th>
          <th>Nama Pendaftar</th>
          <th>Sekolah Asal</th>
          <th>Jurusan</th>
          <th class="${rankingTampilan === 'jarak' ? 'active' : ''}" style="width:80px">Jarak</th>
          <th class="${rankingTampilan === 'nilai' ? 'active' : ''}" style="width:70px">Nilai</th>
          <th class="${rankingTampilan === 'komposit' ? 'active' : ''}" style="width:60px">Skor</th>
          <th style="width:75px">Status</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="legend">
      <span>🟡 Rangking 1</span> <span>⚪ Rangking 2</span> <span>🟤 Rangking 3</span> <span>🟢 Masuk Kuota</span>
      <span>Total: ${reRanked.length} pendaftar</span>
    </div>
  </body></html>`
}

/**
 * Handle ranking export to Excel.
 * Extracted from page.tsx.
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

  const sortLabel = rankingTampilan === 'jarak' ? 'Jarak Terdekat' : rankingTampilan === 'nilai' ? 'Nilai Tertinggi' : 'Skor Komposit'
  const jalurLabel = selectedJalur !== 'all' ? selectedJalur : 'Semua Jalur'

  // Filter data by selected jalur
  const filteredData = selectedJalur === 'all'
    ? rankingData
    : rankingData.filter((r: Record<string, unknown>) => (r.subJalur as string) === selectedJalur)

  // Re-rank
  const jalurRankCounters: Record<string, number> = {}
  const reRanked = filteredData.map((r: Record<string, unknown>, idx: number) => {
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
      'No. Registrasi': r.noRegistrasi as string,
      'Nama': r.nama as string,
      'NISN': r.nisn as string,
      'Sekolah Asal': r.namaSekolahAsal as string,
      'Jurusan': r.jurusan as string,
      'Jarak': r.lokasiJarak as string || '-',
      'Skor Jarak': r.skorJarak as string || '-',
      'Nilai Rata-Rata': r.nilaiRataRata as string || '-',
      'Skor Nilai Raport': r.skorNilaiRaport as string || '-',
      'Skor Komposit': r.skor as string || '-',
      'Status Verifikasi': r.verificationStatus === 'VERIFIED' ? 'Diterima' : r.verificationStatus === 'REJECTED' ? 'Ditolak' : 'Menunggu',
      'Masuk Kuota': withinKuota ? 'Ya' : 'Tidak',
    }
  })

  const ws = XLSX.utils.json_to_sheet(excelData)

  // Set column widths
  ws['!cols'] = [
    { wch: 10 }, { wch: 14 }, { wch: 20 }, { wch: 18 }, { wch: 25 },
    { wch: 16 }, { wch: 22 }, { wch: 14 }, { wch: 22 }, { wch: 14 },
    { wch: 12 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 16 },
    { wch: 16 }, { wch: 12 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Perangkingan')

  // Add a summary sheet
  const summaryData = [
    { 'Keterangan': `LAPORAN PERANGKINGAN ${appName}${schoolName ? ' — ' + schoolName : ''}`, 'Nilai': '' },
    { 'Keterangan': 'Diurutkan Berdasarkan', 'Nilai': sortLabel },
    { 'Keterangan': 'Jalur', 'Nilai': jalurLabel },
    { 'Keterangan': 'Sekolah Asal', 'Nilai': rankingSekolah !== 'all' ? rankingSekolah : 'Semua Sekolah' },
    { 'Keterangan': 'Jurusan', 'Nilai': rankingJurusan !== 'all' ? rankingJurusan : 'Semua Jurusan' },
    { 'Keterangan': 'Status Verifikasi', 'Nilai': rankingStatus !== 'all' ? (rankingStatus === 'VERIFIED' ? 'Diterima' : rankingStatus === 'REJECTED' ? 'Ditolak' : 'Menunggu') : 'Semua Status' },
    { 'Keterangan': 'Total Pendaftar', 'Nilai': reRanked.length.toString() },
    { 'Keterangan': 'Total Kuota', 'Nilai': rankingKuota.toString() },
    { 'Keterangan': '', 'Nilai': '' },
    { 'Keterangan': 'Kuota Per Jalur', 'Nilai': '' },
    ...rankingKuotaPerJalur.map(kj => ({ 'Keterangan': `  ${kj.nama}`, 'Nilai': `${kj.kuota} (${kj.persentase}%)` })),
    { 'Keterangan': '', 'Nilai': '' },
    { 'Keterangan': 'Dicetak pada', 'Nilai': new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
  ]
  const ws2 = XLSX.utils.json_to_sheet(summaryData)
  ws2['!cols'] = [{ wch: 30 }, { wch: 25 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'Ringkasan')

  const jalurSuffix = selectedJalur !== 'all' ? `_${selectedJalur.replace(/\s+/g, '_')}` : '_Semua_Jalur'
  const fileName = `Perangkingan_SPMB2026${jalurSuffix}_${sortLabel.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbout], { type: 'application/octet-stream' })
  saveAs(blob, fileName)
}
