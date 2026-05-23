'use client'

import { useState, useEffect, useCallback } from 'react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Trophy,
  Award,
  Filter,
  MapPinned,
  RefreshCw,
  Loader2,
  Printer,
  FileSpreadsheet,
  ArrowUpDown,
  ArrowUpAZ,
  ArrowDownAZ,
  FileDown,
} from 'lucide-react'
import { STATUS_COLORS, SUB_JALUR_COLORS } from '@/lib/constants'
import { ErrorBoundary } from '@/components/ErrorBoundary'

interface RankingTabProps {
  authUser: { id: string; username: string; namaLengkap: string; role: string } | null
  toast: any
  subJalurOptions: Array<{ label: string; value: string }>
  rankingTampilan?: string
}

export default function RankingTab({ authUser, toast, subJalurOptions, rankingTampilan: initialTampilan }: RankingTabProps) {
  // Ranking state
  const [rankingJalur, setRankingJalur] = useState('all')
  const [rankingSekolah, setRankingSekolah] = useState('all')
  const [rankingJurusan, setRankingJurusan] = useState('all')
  const [rankingTampilan, setRankingTampilan] = useState(initialTampilan || 'jarak') // jarak | nilai | komposit
  const [rankingStatus, setRankingStatus] = useState('all')
  const [rankingData, setRankingData] = useState<Array<Record<string, unknown>>>([])
  const [rankingFilters, setRankingFilters] = useState<{ jalurOptions: string[]; sekolahOptions: string[]; jurusanOptions: string[] }>({ jalurOptions: [], sekolahOptions: [], jurusanOptions: [] })
  const [rankingKuota, setRankingKuota] = useState(0)
  const [rankingKuotaPerJalur, setRankingKuotaPerJalur] = useState<Array<{ nama: string; persentase: number; kuota: number }>>([])
  const [rankingLoading, setRankingLoading] = useState(false)
  const [namaSortRanking, setNamaSortRanking] = useState<'none' | 'asc' | 'desc'>('none')

  // Ranking print/preview state
  const [rankingPreviewOpen, setRankingPreviewOpen] = useState(false)
  const [rankingPreviewType, setRankingPreviewType] = useState<'pdf' | 'excel'>('pdf')
  const [rankingPreviewJalur, setRankingPreviewJalur] = useState<string>('all') // 'all' or specific jalur name

  // ==================== RANKING FUNCTIONS ====================

  const fetchRanking = useCallback(async () => {
    setRankingLoading(true)
    try {
      const params = new URLSearchParams()
      if (rankingJalur !== 'all') params.set('jalur', rankingJalur)
      if (rankingSekolah !== 'all') params.set('sekolah', rankingSekolah)
      if (rankingJurusan !== 'all') params.set('jurusan', rankingJurusan)
      params.set('tampilan', rankingTampilan)
      if (rankingStatus !== 'all') params.set('status', rankingStatus)

      const res = await fetch(`/api/ranking?${params}`)
      const data = await res.json()
      if (data.success) {
        setRankingData(data.data || [])
        setRankingFilters(data.filters || { jalurOptions: [], sekolahOptions: [], jurusanOptions: [] })
        setRankingKuota(data.kuota || 0)
        setRankingKuotaPerJalur(data.kuotaPerJalur || [])
      }
    } catch {
      toast({ title: 'Error', description: 'Gagal memuat data perangkingan', variant: 'destructive' })
    } finally {
      setRankingLoading(false)
    }
  }, [rankingJalur, rankingSekolah, rankingJurusan, rankingTampilan, rankingStatus, toast])

  useEffect(() => {
    fetchRanking()
  }, [fetchRanking])

  const getRankingPrintHTML = (selectedJalur: string = 'all') => {
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
        <td style="padding:6px 8px;border:1px solid #ddd;font-size:11px">${r.namaSekolahPilihan as string}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;font-size:11px">${r.jurusan as string}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;text-align:right;font-size:11px;font-weight:${rankingTampilan === 'jarak' ? 'bold' : 'normal'};color:${jarakNum > 0 ? '#0369a1' : '#ccc'}">${r.jarakKeSekolah as string || r.lokasiJarak as string || '-'}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;text-align:right;font-size:11px;font-weight:${rankingTampilan === 'nilai' ? 'bold' : 'normal'};color:${nilaiNum > 0 ? '#047857' : '#ccc'}">${r.totalNilai as string || r.nilaiRataRata as string || r.skorNilaiRaport as string || '-'}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;text-align:right;font-size:11px;font-weight:${rankingTampilan === 'komposit' ? 'bold' : 'normal'};color:${skorNum > 0 ? '#b45309' : '#ccc'}">${r.totalNilai as string || r.skor as string || '-'}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;text-align:center;font-size:10px">${r.verificationStatus === 'VERIFIED' ? '<span style="background:#d1fae5;color:#047857;padding:2px 8px;border-radius:10px">Diterima</span>' : r.verificationStatus === 'REJECTED' ? '<span style="background:#fee2e2;color:#b91c1c;padding:2px 8px;border-radius:10px">Ditolak</span>' : '<span style="background:#fef3c7;color:#b45309;padding:2px 8px;border-radius:10px">Menunggu</span>'}</td>
      </tr>`
    }).join('')

    return `<!DOCTYPE html><html><head><title>Perangkingan SPMB 2026 - ${sortLabel}</title>
      <style>
        @page { size: A4 landscape; margin: 15mm; }
        body { font-family: Arial, sans-serif; margin: 0; padding: 15px; font-size: 12px; }
        .header { text-align: center; margin-bottom: 15px; border-bottom: 3px double #333; padding-bottom: 10px; }
        .header h1 { font-size: 18px; margin: 0 0 4px 0; letter-spacing: 2px; }
        .header h2 { font-size: 14px; margin: 0 0 4px 0; color: #555; }
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
        <h2>SPMB 2026 — Sistem Penerimaan Madrasah</h2>
        <p>Diurutkan berdasarkan: <strong>${sortLabel}</strong> · Dicetak pada: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
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
            <th>Sekolah Pilihan</th>
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

  // Ranking: open preview dialog
  const handleRankingPreview = (type: 'pdf' | 'excel') => {
    setRankingPreviewType(type)
    setRankingPreviewJalur('all') // reset to all jalur
    setRankingPreviewOpen(true)
  }

  // Ranking: print to PDF via print dialog
  const handleRankingPrintPDF = () => {
    const html = getRankingPrintHTML(rankingPreviewJalur)
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(html)
    printWindow.document.close()
    setTimeout(() => { printWindow.print() }, 500)
  }

  // Ranking: export to Excel
  const handleRankingExportExcel = () => {
    const sortLabel = rankingTampilan === 'jarak' ? 'Jarak Terdekat' : rankingTampilan === 'nilai' ? 'Nilai Tertinggi' : 'Skor Komposit'
    const selectedJalur = rankingPreviewJalur
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
        'Sekolah Pilihan': r.namaSekolahPilihan as string,
        'Jurusan': r.jurusan as string,
        'Sekolah Asal': r.namaSekolahAsal as string,
        'Jarak': r.jarakKeSekolah as string || r.lokasiJarak as string || '-',
        'Skor Jarak': r.skorJarak as string || '-',
        'Total Nilai': r.totalNilai as string || '-',
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
      { 'Keterangan': 'LAPORAN PERANGKINGAN SPMB 2026', 'Nilai': '' },
      { 'Keterangan': 'Diurutkan Berdasarkan', 'Nilai': sortLabel },
      { 'Keterangan': 'Jalur', 'Nilai': jalurLabel },
      { 'Keterangan': 'Sekolah Pilihan', 'Nilai': rankingSekolah !== 'all' ? rankingSekolah : 'Semua Sekolah' },
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

    toast({ title: 'Berhasil', description: `File Excel berhasil diunduh: ${fileName}` })
  }

  return (
    <>
      {/* ==================== RANKING TAB ==================== */}
      {/* Header */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 p-4 sm:p-6 text-white">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-white/20 rounded-xl">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Perangkingan</h2>
              <p className="text-amber-100 text-xs sm:text-sm mt-1">Rangking pendaftar berdasarkan jarak, nilai, dan skor komposit</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Kuota Info */}
      {rankingKuota > 0 && (
        <Card className="bg-gradient-to-r from-sky-50 to-cyan-50 border-sky-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-sky-600" />
              <h3 className="font-semibold text-sky-900">Kuota Per Jalur</h3>
              <span className="text-sm text-sky-600 ml-auto">Total Kuota: <strong>{rankingKuota}</strong></span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {rankingKuotaPerJalur.map((kj) => (
                <div key={kj.nama} className="bg-white rounded-lg p-2.5 border border-sky-100 shadow-sm">
                  <p className="text-[10px] sm:text-xs text-gray-500 truncate">{kj.nama}</p>
                  <p className="text-lg sm:text-xl font-bold text-sky-700">{kj.kuota}</p>
                  <p className="text-[10px] text-gray-400">{kj.persentase}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-sm text-gray-700">Filter & Urutan</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {/* Tampilan / Sort */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Urutkan Berdasarkan</label>
              <Select value={rankingTampilan} onValueChange={setRankingTampilan}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jarak">📏 Jarak (Terdekat → Terjauh)</SelectItem>
                  <SelectItem value="nilai">📝 Nilai (Tertinggi → Terendah)</SelectItem>
                  <SelectItem value="komposit">🏆 Skor Komposit (Tertinggi → Terendah)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Jalur Filter */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Jalur</label>
              <Select value={rankingJalur} onValueChange={setRankingJalur}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jalur</SelectItem>
                  {rankingFilters.jalurOptions.filter((j: string) => j && j.trim() !== '').map((j: string) => (
                    <SelectItem key={j} value={j}>{j}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Sekolah Filter */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Sekolah Asal</label>
              <Select value={rankingSekolah} onValueChange={setRankingSekolah}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Sekolah</SelectItem>
                  {rankingFilters.sekolahOptions.map((s: string) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Status Filter */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Status Verifikasi</label>
              <Select value={rankingStatus} onValueChange={setRankingStatus}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="PENDING">Menunggu</SelectItem>
                  <SelectItem value="VERIFIED">Diterima</SelectItem>
                  <SelectItem value="REJECTED">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick View Cards: Domisili & Prestasi Ranking Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Domisili: Jarak Terdekat */}
        <Card className="border-sky-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-sky-100 rounded-lg">
                <MapPinned className="w-4 h-4 text-sky-600" />
              </div>
              <h4 className="font-semibold text-sm text-sky-900">Domisili — Jarak Terdekat</h4>
            </div>
            {(() => {
              const domisiliData = rankingData
                .filter((r: Record<string, unknown>) => (r.subJalur as string) === 'Domisili' && r._jarakNum as number > 0)
                .sort((a: Record<string, unknown>, b: Record<string, unknown>) => (a._jarakNum as number) - (b._jarakNum as number))
                .slice(0, 5)
              if (domisiliData.length === 0) return <p className="text-xs text-gray-400 text-center py-3">Belum ada data jarak untuk Domisili</p>
              const domKuota = rankingKuotaPerJalur.find(k => k.nama === 'Domisili')?.kuota || 0
              return (
                <div className="space-y-1.5">
                  {domisiliData.map((r: Record<string, unknown>, idx: number) => (
                    <div key={r.id as string} className={`flex items-center gap-2 p-2 rounded-lg ${idx < domKuota && domKuota > 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50 border border-gray-100'}`}>
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${idx < domKuota && domKuota > 0 ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-white'}`}>
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{r.nama as string}</p>
                        <p className="text-[10px] text-gray-500">{r.namaSekolahAsal as string}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-sky-700">{r.jarakKeSekolah as string || r.lokasiJarak as string || '-'}</p>
                        <p className="text-[10px] text-gray-400">jarak</p>
                      </div>
                    </div>
                  ))}
                  {domKuota > 0 && <p className="text-[10px] text-emerald-600 text-center mt-1">🟢 Hijau = masuk kuota ({domKuota})</p>}
                </div>
              )
            })()}
          </CardContent>
        </Card>

        {/* Prestasi: Nilai Tertinggi */}
        <Card className="border-emerald-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-emerald-100 rounded-lg">
                <Award className="w-4 h-4 text-emerald-600" />
              </div>
              <h4 className="font-semibold text-sm text-emerald-900">Prestasi — Nilai Tertinggi</h4>
            </div>
            {(() => {
              const prestasiData = rankingData
                .filter((r: Record<string, unknown>) => {
                  const sj = (r.subJalur as string || '').toLowerCase()
                  return (sj.includes('prestasi') || sj.includes('akademik') || sj.includes('non')) && (r._nilaiNum as number) > 0
                })
                .sort((a: Record<string, unknown>, b: Record<string, unknown>) => (b._nilaiNum as number) - (a._nilaiNum as number))
                .slice(0, 5)
              if (prestasiData.length === 0) return <p className="text-xs text-gray-400 text-center py-3">Belum ada data nilai untuk Prestasi</p>
              const presKuota = rankingKuotaPerJalur.find(k => k.nama.toLowerCase().includes('prestasi'))?.kuota || 0
              return (
                <div className="space-y-1.5">
                  {prestasiData.map((r: Record<string, unknown>, idx: number) => (
                    <div key={r.id as string} className={`flex items-center gap-2 p-2 rounded-lg ${idx < presKuota && presKuota > 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50 border border-gray-100'}`}>
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${idx < presKuota && presKuota > 0 ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-white'}`}>
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{r.nama as string}</p>
                        <p className="text-[10px] text-gray-500">{r.namaSekolahAsal as string}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-emerald-700">{r.totalNilai as string || r.nilaiRataRata as string || r.skorNilaiRaport as string || '-'}</p>
                        <p className="text-[10px] text-gray-400">nilai</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Full Ranking Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Tabel Perangkingan
                {rankingTampilan === 'jarak' && <Badge className="bg-sky-100 text-sky-700 border-sky-200">Jarak Terdekat</Badge>}
                {rankingTampilan === 'nilai' && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Nilai Tertinggi</Badge>}
                {rankingTampilan === 'komposit' && <Badge className="bg-amber-100 text-amber-700 border-amber-200">Skor Komposit</Badge>}
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                {rankingData.length} pendaftar
                {rankingKuota > 0 && ` · Kuota: ${rankingKuota}`}
                {rankingJalur !== 'all' && ` · Jalur: ${rankingJalur}`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1 border-red-200 text-red-700 hover:bg-red-50"
                onClick={() => handleRankingPreview('pdf')}
                disabled={rankingData.length === 0}
              >
                <Printer className="w-3 h-3" />
                <span className="hidden sm:inline">Cetak PDF</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                onClick={() => handleRankingPreview('excel')}
                disabled={rankingData.length === 0}
              >
                <FileSpreadsheet className="w-3 h-3" />
                <span className="hidden sm:inline">Cetak Excel</span>
              </Button>
              <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => fetchRanking()}>
                <RefreshCw className="w-3 h-3" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {rankingLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              <span className="ml-2 text-sm text-gray-500">Memuat data perangkingan...</span>
            </div>
          ) : rankingData.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">Belum ada data perangkingan</p>
              <p className="text-gray-400 text-xs mt-1">Import data pendaftar terlebih dahulu</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80">
                    <TableHead className="w-10 text-center font-semibold text-xs">No</TableHead>
                    <TableHead className="w-10 text-center font-semibold text-xs">Jalur</TableHead>
                    <TableHead className="font-semibold text-xs">Nama Pendaftar
                      <span className="ml-1 cursor-pointer inline-flex align-middle" onClick={() => setNamaSortRanking(namaSortRanking === 'none' ? 'asc' : namaSortRanking === 'asc' ? 'desc' : 'none')}>
                        {namaSortRanking === 'none' ? <ArrowUpDown className="w-3 h-3 text-gray-400" /> : namaSortRanking === 'asc' ? <ArrowUpAZ className="w-3 h-3 text-amber-600" /> : <ArrowDownAZ className="w-3 h-3 text-amber-600" />}
                      </span>
                    </TableHead>
                    <TableHead className="font-semibold text-xs">Sekolah Asal</TableHead>
                    <TableHead className="text-right font-semibold text-xs cursor-pointer select-none group" onClick={() => setRankingTampilan('jarak')}>
                      <span className="inline-flex items-center gap-1">
                        Jarak
                        {rankingTampilan === 'jarak' ? (
                          <span className="text-sky-600" title="Diurutkan berdasarkan jarak">📍</span>
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-gray-300 group-hover:text-sky-500 transition-colors" />
                        )}
                      </span>
                    </TableHead>
                    <TableHead className="text-right font-semibold text-xs cursor-pointer select-none group" onClick={() => setRankingTampilan('nilai')}>
                      <span className="inline-flex items-center gap-1">
                        Nilai
                        {rankingTampilan === 'nilai' ? (
                          <span className="text-emerald-600" title="Diurutkan berdasarkan nilai">📍</span>
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                        )}
                      </span>
                    </TableHead>
                    <TableHead className="text-right font-semibold text-xs cursor-pointer select-none group" onClick={() => setRankingTampilan('komposit')}>
                      <span className="inline-flex items-center gap-1">
                        Skor
                        {rankingTampilan === 'komposit' ? (
                          <span className="text-amber-600" title="Diurutkan berdasarkan skor komposit">📍</span>
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-gray-300 group-hover:text-amber-500 transition-colors" />
                        )}
                      </span>
                    </TableHead>
                    <TableHead className="text-center font-semibold text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...rankingData].sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
                    if (namaSortRanking === 'asc') return String(a.nama || '').localeCompare(String(b.nama || ''))
                    if (namaSortRanking === 'desc') return String(b.nama || '').localeCompare(String(a.nama || ''))
                    return 0
                  }).map((r: Record<string, unknown>, idx: number) => {
                    const rankNum = (r._ranking as number) || (idx + 1)
                    const jalurRank = (r._jalurRank as number) || -1
                    const jarakNum = r._jarakNum as number
                    const nilaiNum = r._nilaiNum as number
                    const skorNum = r._skorNum as number
                    const isVerified = r.verificationStatus === 'VERIFIED'

                    // Determine kuota cutoff for current jalur
                    const currentKuota = rankingKuotaPerJalur.find(k => {
                      const jalurName = (r.subJalur as string || '').toLowerCase()
                      return k.nama.toLowerCase().includes(jalurName) || jalurName.includes(k.nama.toLowerCase())
                        || (k.nama.toLowerCase().includes('prestasi') && jalurName.includes('prestasi'))
                        || (k.nama.toLowerCase().includes('domisili') && jalurName.includes('domisili'))
                        || (k.nama.toLowerCase().includes('mutasi') && jalurName.includes('mutasi'))
                        || (k.nama.toLowerCase().includes('afirmasi') && (jalurName.includes('keluarga') || jalurName.includes('ktm')))
                    })?.kuota || 0

                    // Count how many of the same jalur are above this rank
                    const sameJalurAbove = rankingData
                      .filter((other: Record<string, unknown>) =>
                        (other.subJalur as string) === (r.subJalur as string) &&
                        ((other._ranking as number) || 0) < rankNum
                        ).length

                    const withinKuota = currentKuota > 0 && sameJalurAbove < currentKuota

                    return (
                      <TableRow key={r.id as string} className={`${withinKuota && !isVerified ? 'bg-emerald-50/50' : ''} ${isVerified ? 'bg-emerald-50' : ''} hover:bg-gray-50/80 transition-colors`}>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                            rankNum === 1 ? 'bg-amber-400 text-white' :
                            rankNum === 2 ? 'bg-gray-300 text-gray-700' :
                            rankNum === 3 ? 'bg-amber-700 text-white' :
                            withinKuota ? 'bg-emerald-100 text-emerald-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {rankNum}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-0.5">
                            <Badge variant="outline" className={`text-[10px] ${SUB_JALUR_COLORS[r.subJalur as string] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                              {r.subJalur as string}
                            </Badge>
                            {jalurRank > 0 && (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold bg-sky-100 text-sky-700">
                                #{jalurRank}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-xs font-medium text-gray-900">{r.nama as string}</p>
                            <p className="text-[10px] text-gray-400">NISN: {r.nisn as string}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-gray-700">{r.namaSekolahAsal as string}</TableCell>
                        <TableCell className="text-right" style={rankingTampilan === 'jarak' ? { backgroundColor: 'rgba(186, 230, 253, 0.3)' } : undefined}>
                          <span className={`text-xs font-semibold ${jarakNum > 0 ? 'text-sky-700' : 'text-gray-300'}`}>
                            {r.jarakKeSekolah as string || r.lokasiJarak as string || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right" style={rankingTampilan === 'nilai' ? { backgroundColor: 'rgba(209, 250, 229, 0.3)' } : undefined}>
                          <span className={`text-xs font-semibold ${nilaiNum > 0 ? 'text-emerald-700' : 'text-gray-300'}`}>
                            {r.totalNilai as string || r.nilaiRataRata as string || r.skorNilaiRaport as string || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right" style={rankingTampilan === 'komposit' ? { backgroundColor: 'rgba(254, 243, 199, 0.4)' } : undefined}>
                          <span className={`text-xs font-semibold ${skorNum > 0 ? 'text-amber-700' : 'text-gray-300'}`}>
                            {r.totalNilai as string || r.skor as string || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`text-[10px] ${STATUS_COLORS[r.verificationStatus as string] || 'bg-gray-100 text-gray-700'}`}>
                            {r.verificationStatus === 'VERIFIED' ? 'Diterima' : r.verificationStatus === 'REJECTED' ? 'Ditolak' : 'Menunggu'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ==================== RANKING PREVIEW DIALOG ==================== */}
      <Dialog open={rankingPreviewOpen} onOpenChange={setRankingPreviewOpen}>
        <DialogContent className="sm:max-w-6xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {rankingPreviewType === 'pdf' ? (
                <><Printer className="w-5 h-5 text-red-600" /> Preview Cetak PDF</>
              ) : (
                <><FileSpreadsheet className="w-5 h-5 text-emerald-600" /> Preview Cetak Excel</>
              )}
            </DialogTitle>
            <DialogDescription>
              {rankingPreviewType === 'pdf'
                ? 'Pratinjau hasil cetak perangkingan. Klik "Cetak PDF" untuk membuka dialog cetak.'
                : 'Pratinjau data yang akan diekspor ke Excel. Klik "Unduh Excel" untuk mengunduh file.'}
            </DialogDescription>
          </DialogHeader>

          {/* Jalur Selector */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800">Pilih Jalur untuk Dicetak</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                  rankingPreviewJalur === 'all'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                    : 'bg-white text-amber-700 border-amber-300 hover:border-amber-500 hover:bg-amber-50'
                }`}
                onClick={() => setRankingPreviewJalur('all')}
              >
                🏆 Semua Jalur ({rankingData.length})
              </button>
              {rankingFilters.jalurOptions.filter((j: string) => j && j.trim() !== '').map((j: string) => {
                const count = rankingData.filter((r: Record<string, unknown>) => (r.subJalur as string) === j).length
                return (
                  <button
                    key={j}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                      rankingPreviewJalur === j
                        ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-amber-400 hover:bg-amber-50'
                    }`}
                    onClick={() => setRankingPreviewJalur(j)}
                  >
                    {j} ({count})
                  </button>
                )
              })}
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 min-h-0 overflow-auto border rounded-lg bg-white">
            <div className="p-4">
              {/* Header Preview */}
              <div className="text-center mb-4 pb-3 border-b-4 border-double border-gray-300">
                <h2 className="text-lg font-bold tracking-wider">LAPORAN PERANGKINGAN</h2>
                <p className="text-sm text-gray-500">SPMB 2026 — Sistem Penerimaan Madrasah</p>
                <p className="text-xs text-gray-400 mt-1">
                  Diurutkan berdasarkan: <strong>{rankingTampilan === 'jarak' ? 'Jarak Terdekat' : rankingTampilan === 'nilai' ? 'Nilai Tertinggi' : 'Skor Komposit'}</strong>
                  {' · '}Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {/* Filters Preview */}
              <div className="flex flex-wrap gap-2 justify-center mb-3">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded border">Jalur: {rankingPreviewJalur !== 'all' ? rankingPreviewJalur : 'Semua'}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded border">Sekolah Asal: {rankingSekolah !== 'all' ? rankingSekolah : 'Semua'}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded border">Status: {rankingStatus !== 'all' ? (rankingStatus === 'VERIFIED' ? 'Diterima' : rankingStatus === 'REJECTED' ? 'Ditolak' : 'Menunggu') : 'Semua'}</span>
              </div>

              {/* Kuota Preview */}
              {rankingKuota > 0 && (
                <div className="text-center mb-3 text-xs">
                  <span className="bg-sky-100 text-sky-700 px-3 py-1 rounded mr-2">Total Kuota: <strong>{rankingKuota}</strong></span>
                  {rankingKuotaPerJalur.map(kj => (
                    <span key={kj.nama} className="bg-sky-50 text-sky-600 px-2 py-1 rounded mr-1">{kj.nama}: {kj.kuota} ({kj.persentase}%)</span>
                  ))}
                </div>
              )}

              {/* Table Preview */}
              <div className="overflow-x-auto border rounded">
                <Table className="text-xs">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-10 text-center font-semibold">No</TableHead>
                      <TableHead className="w-20 text-center font-semibold">Jalur</TableHead>
                      <TableHead className="font-semibold">Nama Pendaftar</TableHead>
                      <TableHead className="font-semibold">Sekolah Asal</TableHead>
                      <TableHead className={`text-right font-semibold ${rankingTampilan === 'jarak' ? 'bg-amber-50' : ''}`}>Jarak</TableHead>
                      <TableHead className={`text-right font-semibold ${rankingTampilan === 'nilai' ? 'bg-amber-50' : ''}`}>Nilai</TableHead>
                      <TableHead className={`text-right font-semibold ${rankingTampilan === 'komposit' ? 'bg-amber-50' : ''}`}>Skor</TableHead>
                      <TableHead className="text-center font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(rankingPreviewJalur === 'all'
                      ? rankingData
                      : rankingData.filter((r: Record<string, unknown>) => (r.subJalur as string) === rankingPreviewJalur)
                    ).slice(0, 20).map((r: Record<string, unknown>, idx: number) => {
                      const rankNum = idx + 1
                      const jalurRank = (r._jalurRank as number) || -1
                      const jarakNum = r._jarakNum as number
                      const nilaiNum = r._nilaiNum as number
                      const skorNum = r._skorNum as number

                      const currentKuota = rankingKuotaPerJalur.find(k => {
                        const jalurName = (r.subJalur as string || '').toLowerCase()
                        return k.nama.toLowerCase().includes(jalurName) || jalurName.includes(k.nama.toLowerCase())
                          || (k.nama.toLowerCase().includes('prestasi') && jalurName.includes('prestasi'))
                          || (k.nama.toLowerCase().includes('domisili') && jalurName.includes('domisili'))
                          || (k.nama.toLowerCase().includes('mutasi') && jalurName.includes('mutasi'))
                          || (k.nama.toLowerCase().includes('afirmasi') && (jalurName.includes('keluarga') || jalurName.includes('ktm')))
                      })?.kuota || 0

                      const sameJalurAbove = rankingData
                        .filter((other: Record<string, unknown>) =>
                          (other.subJalur as string) === (r.subJalur as string) &&
                          ((other._ranking as number) || 0) < rankNum
                        ).length

                      const withinKuota = currentKuota > 0 && sameJalurAbove < currentKuota
                      const isVerified = r.verificationStatus === 'VERIFIED'

                      return (
                        <TableRow key={r.id as string} className={`${withinKuota && !isVerified ? 'bg-emerald-50/50' : ''} ${isVerified ? 'bg-emerald-50' : ''}`}>
                          <TableCell className="text-center p-1">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${
                              rankNum === 1 ? 'bg-amber-400 text-white' :
                              rankNum === 2 ? 'bg-gray-300 text-gray-700' :
                              rankNum === 3 ? 'bg-amber-700 text-white' :
                              withinKuota ? 'bg-emerald-100 text-emerald-700' :
                              'bg-gray-100 text-gray-500'
                            }`}>{rankNum}</span>
                          </TableCell>
                          <TableCell className="text-center p-1">
                            <Badge variant="outline" className={`text-[9px] ${SUB_JALUR_COLORS[r.subJalur as string] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                              {r.subJalur as string}
                            </Badge>
                            {jalurRank > 0 && <span className="block text-[8px] text-sky-600">#{jalurRank}</span>}
                          </TableCell>
                          <TableCell className="p-1">
                            <p className="text-xs font-medium">{r.nama as string}</p>
                            <p className="text-[9px] text-gray-400">NISN: {r.nisn as string}</p>
                          </TableCell>
                          <TableCell className="text-xs p-1">{r.namaSekolahAsal as string}</TableCell>
                          <TableCell className={`text-right p-1 ${rankingTampilan === 'jarak' ? 'bg-sky-50/50 font-bold' : ''}`}>
                            <span className={`text-xs ${jarakNum > 0 ? 'text-sky-700' : 'text-gray-300'}`}>{r.lokasiJarak as string || '-'}</span>
                          </TableCell>
                          <TableCell className={`text-right p-1 ${rankingTampilan === 'nilai' ? 'bg-emerald-50/50 font-bold' : ''}`}>
                            <span className={`text-xs ${nilaiNum > 0 ? 'text-emerald-700' : 'text-gray-300'}`}>{r.nilaiRataRata as string || r.skorNilaiRaport as string || '-'}</span>
                          </TableCell>
                          <TableCell className={`text-right p-1 ${rankingTampilan === 'komposit' ? 'bg-amber-50/50 font-bold' : ''}`}>
                            <span className={`text-xs ${skorNum > 0 ? 'text-amber-700' : 'text-gray-300'}`}>{r.skor as string || '-'}</span>
                          </TableCell>
                          <TableCell className="text-center p-1">
                            <Badge className={`text-[9px] ${STATUS_COLORS[r.verificationStatus as string] || 'bg-gray-100 text-gray-700'}`}>
                              {r.verificationStatus === 'VERIFIED' ? 'Diterima' : r.verificationStatus === 'REJECTED' ? 'Ditolak' : 'Menunggu'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                {(() => {
                  const filteredCount = rankingPreviewJalur === 'all'
                    ? rankingData.length
                    : rankingData.filter((r: Record<string, unknown>) => (r.subJalur as string) === rankingPreviewJalur).length
                  return filteredCount > 20 ? (
                    <div className="text-center py-2 text-xs text-gray-400 border-t">
                      {'... dan '}{filteredCount - 20}{' data lainnya (total: '}{filteredCount}{' pendaftar)'}
                    </div>
                  ) : null
                })()}
              </div>

              {/* Legend */}
              <div className="text-center mt-3 text-xs text-gray-400">
                🟡 Rangking 1 · ⚪ Rangking 2 · 🟤 Rangking 3 · 🟢 Masuk Kuota · Total: {(() => {
                  const fc = rankingPreviewJalur === 'all'
                    ? rankingData.length
                    : rankingData.filter((r: Record<string, unknown>) => (r.subJalur as string) === rankingPreviewJalur).length
                  return fc
                })()} pendaftar
              </div>

              {/* Excel Data Preview */}
              {rankingPreviewType === 'excel' && (
                <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <h4 className="text-xs font-semibold text-emerald-800 mb-2">📋 Data yang akan diekspor ke Excel:</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                    <div className="bg-white rounded p-2 border">
                      <span className="text-gray-500">Kolom Data</span>
                      <p className="font-bold text-gray-800">17 kolom</p>
                    </div>
                    <div className="bg-white rounded p-2 border">
                      <span className="text-gray-500">Baris Data</span>
                      <p className="font-bold text-gray-800">{(() => {
                        const fc = rankingPreviewJalur === 'all'
                          ? rankingData.length
                          : rankingData.filter((r: Record<string, unknown>) => (r.subJalur as string) === rankingPreviewJalur).length
                        return fc
                      })()} baris</p>
                    </div>
                    <div className="bg-white rounded p-2 border">
                      <span className="text-gray-500">Sheet</span>
                      <p className="font-bold text-gray-800">2 sheet</p>
                    </div>
                    <div className="bg-white rounded p-2 border">
                      <span className="text-gray-500">Format</span>
                      <p className="font-bold text-gray-800">.xlsx</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-emerald-600 mt-2">
                    Sheet 1: Perangkingan (data lengkap) · Sheet 2: Ringkasan (filter & kuota)
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex-row gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setRankingPreviewOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={() => {
                if (rankingPreviewType === 'pdf') {
                  handleRankingPrintPDF()
                } else {
                  handleRankingExportExcel()
                }
                setRankingPreviewOpen(false)
              }}
              className={rankingPreviewType === 'pdf' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}
            >
              {rankingPreviewType === 'pdf' ? (
                <><Printer className="w-4 h-4 mr-2" /> Cetak PDF</>
              ) : (
                <><FileDown className="w-4 h-4 mr-2" /> Unduh Excel</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
