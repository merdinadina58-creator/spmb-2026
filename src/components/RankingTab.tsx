'use client'

import { matchKuotaForJalur, isNonAkademikJalur } from '@/lib/kuota-matching'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Trophy,
  Filter,
  Award,
  MapPinned,
  Loader2,
  Printer,
  FileSpreadsheet,
  RefreshCw,
  ArrowUpDown,
  ArrowUpAZ,
  ArrowDownAZ,
} from 'lucide-react'

interface RankingTabProps {
  rankingJalur: string
  setRankingJalur: (v: string) => void
  rankingSekolah: string
  setRankingSekolah: (v: string) => void
  rankingJurusan: string
  setRankingJurusan: (v: string) => void
  rankingTampilan: string
  setRankingTampilan: (v: string) => void
  rankingStatus: string
  setRankingStatus: (v: string) => void
  rankingData: Array<Record<string, unknown>>
  rankingFilters: { jalurOptions: string[]; sekolahOptions: string[]; jurusanOptions: string[] }
  rankingKuota: number
  rankingKuotaPerJalur: Array<{ nama: string; persentase: number; kuota: number }>
  rankingLoading: boolean
  namaSortRanking: 'none' | 'asc' | 'desc'
  setNamaSortRanking: (v: 'none' | 'asc' | 'desc') => void
  fetchRanking: () => void
  handleRankingPreview: (type: 'pdf' | 'excel') => void
}

export default function RankingTab(props: RankingTabProps) {
  const {
    rankingJalur, setRankingJalur,
    rankingSekolah, setRankingSekolah,
    rankingJurusan, setRankingJurusan,
    rankingTampilan, setRankingTampilan,
    rankingStatus, setRankingStatus,
    rankingData, rankingFilters,
    rankingKuota, rankingKuotaPerJalur,
    rankingLoading,
    namaSortRanking, setNamaSortRanking,
    fetchRanking,
    handleRankingPreview,
  } = props

  return (
    <>
      {/* Header */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 p-4 sm:p-6 text-white">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-white/20 rounded-xl">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Perangkingan</h2>
              <p className="text-amber-100 text-xs sm:text-sm mt-1">Rangking pendaftar berdasarkan jarak, nilai, skor komposit, dan skor prestasi</p>
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
              {rankingKuotaPerJalur.map((kj, kjIdx) => (
                <div key={`kquota-${kj.nama}-${kjIdx}`} className="bg-white rounded-lg p-2.5 border border-sky-100 shadow-sm">
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
          {/* Row 1: Urutkan Berdasarkan — full width */}
          <div className="mb-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">Urutkan Berdasarkan</label>
              <Select value={rankingTampilan} onValueChange={setRankingTampilan}>
                <SelectTrigger className="h-9 text-xs w-full sm:w-72"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="jarak">📏 Jarak (Terdekat → Terjauh)</SelectItem>
                  <SelectItem value="nilai">📝 Nilai (Tertinggi → Terendah)</SelectItem>
                  <SelectItem value="komposit">🏆 Skor Komposit (Tertinggi → Terendah)</SelectItem>
                  <SelectItem value="prestasi">🎖️ Skor Prestasi (Tertinggi → Terendah)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Row 2: Filter dropdowns — responsive grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">Jalur</label>
              <Select value={rankingJalur} onValueChange={setRankingJalur}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jalur</SelectItem>
                  {rankingFilters.jalurOptions.filter((j: string) => j && j.trim() !== '').map((j: string, jIdx: number) => (
                    <SelectItem key={`jalur-${j}-${jIdx}`} value={j}>{j}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">Sekolah Asal</label>
              <Select value={rankingSekolah} onValueChange={setRankingSekolah}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Sekolah</SelectItem>
                  {rankingFilters.sekolahOptions.map((s: string, sIdx: number) => (
                    <SelectItem key={`sch-${s}-${sIdx}`} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">Jurusan</label>
              <Select value={rankingJurusan} onValueChange={setRankingJurusan}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jurusan</SelectItem>
                  {rankingFilters.jurusanOptions.filter((j: string) => j && j.trim() !== '').map((j: string, jIdx: number) => (
                    <SelectItem key={`jur-${j}-${jIdx}`} value={j}>{j}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">Status Verifikasi</label>
              <Select value={rankingStatus} onValueChange={setRankingStatus}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
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
                    <div key={`rank-dom-${r.id}-${idx}`} className={`flex items-center gap-2 p-2 rounded-lg ${idx < domKuota && domKuota > 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50 border border-gray-100'}`}>
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${idx < domKuota && domKuota > 0 ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-white'}`}>
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{r.nama as string}</p>
                        <p className="text-[10px] text-gray-500">{r.namaSekolahAsal as string} — {r.jurusan as string}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-sky-700">{r.lokasiJarak as string || '-'}</p>
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
              <h4 className="font-semibold text-sm text-emerald-900">Prestasi — Skor Tertinggi</h4>
            </div>
            {(() => {
              // isNonAkademikJalur is imported from @/lib/kuota-matching
              // Helper: get prestasi score for display from a record
              const getPrestasiDisplayValue = (r: Record<string, unknown>) => {
                const sj = (r.subJalur as string) || ''
                if (isNonAkademikJalur(sj)) {
                  return (r.skorPrestasiNonAkademik as string) || (r.skorPrestasiAkademik as string) || '-'
                }
                return (r.skorPrestasiAkademik as string) || (r.skorPrestasiNonAkademik as string) || '-'
              }
              // Helper: get numeric prestasi score from a record
              const getPrestasiNumValue = (r: Record<string, unknown>) => {
                const sj = (r.subJalur as string) || ''
                const akdNum = (r._skorPrestasiAkademikNum as number) || -1
                const nonAkdNum = (r._skorPrestasiNonAkademikNum as number) || -1
                if (isNonAkademikJalur(sj)) {
                  return nonAkdNum > 0 ? nonAkdNum : akdNum
                }
                return akdNum > 0 ? akdNum : nonAkdNum
              }
              const prestasiData = rankingData
                .filter((r: Record<string, unknown>) => {
                  const sj = (r.subJalur as string || '').toLowerCase()
                  return sj.includes('prestasi') && getPrestasiNumValue(r) > 0
                })
                .sort((a: Record<string, unknown>, b: Record<string, unknown>) => getPrestasiNumValue(b) - getPrestasiNumValue(a))
                .slice(0, 5)
              if (prestasiData.length === 0) return <p className="text-xs text-gray-400 text-center py-3">Belum ada data skor prestasi</p>
              // Compute per-record kuota for the prestasi top-5 preview
              // (was: generic includes('prestasi') always matched Akademik kuota=54)
              const getPrestasiKuota = (r: Record<string, unknown>) => matchKuotaForJalur((r.subJalur as string) || '', rankingKuotaPerJalur)
              return (
                <div className="space-y-1.5">
                  {prestasiData.map((r: Record<string, unknown>, idx: number) => {
                    const sj = (r.subJalur as string) || ''
                    const isNonAkd = isNonAkademikJalur(sj)
                    const prestasiDisplay = getPrestasiDisplayValue(r)
                    return (
                      <div key={`rank-pres-${r.id}-${idx}`} className={`flex items-center gap-2 p-2 rounded-lg ${idx < getPrestasiKuota(r) && getPrestasiKuota(r) > 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50 border border-gray-100'}`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${idx < getPrestasiKuota(r) && getPrestasiKuota(r) > 0 ? 'bg-emerald-500 text-white' : isNonAkd ? 'bg-teal-400 text-white' : 'bg-gray-300 text-white'}`}>
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">{r.nama as string}</p>
                          <p className="text-[10px] text-gray-500">{isNonAkd ? 'Non-Akademik' : 'Akademik'} · {r.namaSekolahAsal as string}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-teal-700">{prestasiDisplay}</p>
                          <p className="text-[10px] text-gray-400">skor</p>
                        </div>
                      </div>
                    )
                  })}
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
                {rankingTampilan === 'prestasi' && <Badge className="bg-teal-100 text-teal-700 border-teal-200">Skor Prestasi</Badge>}
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                {rankingData.length} pendaftar
                {rankingKuota > 0 && ` · Kuota: ${rankingKuota}`}
                {rankingJalur !== 'all' && ` · Jalur: ${rankingJalur}`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-xs gap-1 border-red-200 text-red-700 hover:bg-red-50" onClick={() => handleRankingPreview('pdf')} disabled={rankingData.length === 0}>
                <Printer className="w-3 h-3" />
                <span className="hidden sm:inline">Cetak PDF</span>
              </Button>
              <Button variant="outline" size="sm" className="text-xs gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={() => handleRankingPreview('excel')} disabled={rankingData.length === 0}>
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
                    <TableHead className="font-semibold text-xs">Jurusan</TableHead>
                    <TableHead className="text-right font-semibold text-xs cursor-pointer select-none group" onClick={() => setRankingTampilan('jarak')}>
                      <span className="inline-flex items-center gap-1">
                        Jarak
                        {rankingTampilan === 'jarak' ? <span className="text-sky-600" title="Diurutkan berdasarkan jarak">📍</span> : <ArrowUpDown className="w-3 h-3 text-gray-300 group-hover:text-sky-500 transition-colors" />}
                      </span>
                    </TableHead>
                    <TableHead className="text-right font-semibold text-xs cursor-pointer select-none group" onClick={() => setRankingTampilan('nilai')}>
                      <span className="inline-flex items-center gap-1">
                        Nilai
                        {rankingTampilan === 'nilai' ? <span className="text-emerald-600" title="Diurutkan berdasarkan nilai">📍</span> : <ArrowUpDown className="w-3 h-3 text-gray-300 group-hover:text-emerald-500 transition-colors" />}
                      </span>
                    </TableHead>
                    <TableHead className="text-right font-semibold text-xs cursor-pointer select-none group" onClick={() => setRankingTampilan('komposit')}>
                      <span className="inline-flex items-center gap-1">
                        Skor
                        {rankingTampilan === 'komposit' ? <span className="text-amber-600" title="Diurutkan berdasarkan skor komposit">📍</span> : <ArrowUpDown className="w-3 h-3 text-gray-300 group-hover:text-amber-500 transition-colors" />}
                      </span>
                    </TableHead>
                    <TableHead className="text-right font-semibold text-xs cursor-pointer select-none group" onClick={() => setRankingTampilan('prestasi')}>
                      <span className="inline-flex items-center gap-1">
                        Prestasi
                        {rankingTampilan === 'prestasi' ? <span className="text-teal-600" title="Diurutkan berdasarkan skor prestasi">📍</span> : <ArrowUpDown className="w-3 h-3 text-gray-300 group-hover:text-teal-500 transition-colors" />}
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
                    const isVerified = r.verificationStatus === 'VERIFIED'

                    // Prestasi score helpers
                    const sj = ((r.subJalur as string) || '').toLowerCase().replace(/[^a-z0-9]/g, '')
                    const isNonAkd = sj.includes('nonakademik')
                    const akdNum = (r._skorPrestasiAkademikNum as number) || -1
                    const nonAkdNum = (r._skorPrestasiNonAkademikNum as number) || -1
                    const skorPrestasiNum = isNonAkd ? (nonAkdNum > 0 ? nonAkdNum : akdNum) : (akdNum > 0 ? akdNum : nonAkdNum)
                    const prestasiDisplay = isNonAkd
                      ? ((r.skorPrestasiNonAkademik as string) || (r.skorPrestasiAkademik as string) || '-')
                      : ((r.skorPrestasiAkademik as string) || (r.skorPrestasiNonAkademik as string) || '-')

                    const currentKuota = matchKuotaForJalur((r.subJalur as string) || '', rankingKuotaPerJalur)

                    const sameJalurAbove = rankingData
                      .filter((other: Record<string, unknown>) =>
                        (other.subJalur as string) === (r.subJalur as string) &&
                        ((other._ranking as number) || 0) < rankNum
                      ).length

                    const withinKuota = currentKuota > 0 && sameJalurAbove < currentKuota

                    return (
                      <TableRow key={`rank-row-${r.id}-${idx}`} className={`${withinKuota && !isVerified ? 'bg-emerald-50/50' : ''} ${isVerified ? 'bg-emerald-50' : ''} hover:bg-gray-50/80 transition-colors`}>
                        <TableCell className="text-center text-xs font-bold">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${rankNum === 1 ? 'bg-amber-400 text-white' : rankNum === 2 ? 'bg-gray-300 text-white' : rankNum === 3 ? 'bg-amber-700 text-white' : withinKuota ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                            {rankNum}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-[10px] text-gray-500">
                            <Badge variant="outline" className="text-[10px] px-1.5">{r.subJalur as string}</Badge>
                            {jalurRank > 0 && <span className="block text-[9px] text-sky-600 mt-0.5">#{jalurRank}</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-xs font-medium text-gray-900">{r.nama as string}</p>
                            <p className="text-[10px] text-gray-400">NISN: {r.nisn as string}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-gray-600">{r.namaSekolahAsal as string}</TableCell>
                        <TableCell className="text-xs">{r.jurusan as string}</TableCell>
                        <TableCell className="text-right text-xs font-mono" style={{ color: (r._jarakNum as number) > 0 ? '#0369a1' : '#ccc', fontWeight: rankingTampilan === 'jarak' ? 'bold' : 'normal' }}>{r.lokasiJarak as string || '-'}</TableCell>
                        <TableCell className="text-right text-xs font-mono" style={{ color: (r._nilaiNum as number) > 0 ? '#047857' : '#ccc', fontWeight: rankingTampilan === 'nilai' ? 'bold' : 'normal' }}>{r.nilaiRataRata as string || r.skorNilaiRaport as string || '-'}</TableCell>
                        <TableCell className="text-right text-xs font-mono" style={{ color: (r._skorNum as number) > 0 ? '#b45309' : '#ccc', fontWeight: rankingTampilan === 'komposit' ? 'bold' : 'normal' }}>{r.skor as string || '-'}</TableCell>
                        <TableCell className="text-right text-xs font-mono" style={{ color: skorPrestasiNum > 0 ? '#0d9488' : '#ccc', fontWeight: rankingTampilan === 'prestasi' ? 'bold' : 'normal' }}>{prestasiDisplay}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={r.verificationStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : r.verificationStatus === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
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
    </>
  )
}
