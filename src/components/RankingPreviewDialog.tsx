'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Printer, FileSpreadsheet, FileDown, Filter } from 'lucide-react'
import { STATUS_COLORS, SUB_JALUR_COLORS } from '@/lib/constants'

function v(r: Record<string, unknown>, key: string): string {
  const val = r[key]
  if (val === null || val === undefined) return '-'
  return String(val) || '-'
}

interface RankingPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rankingPreviewType: 'pdf' | 'excel'
  rankingPreviewJalur: string
  setRankingPreviewJalur: (jalur: string) => void
  rankingData: Array<Record<string, unknown>>
  rankingFilters: { jalurOptions: string[]; sekolahOptions: string[]; jurusanOptions: string[] }
  rankingTampilan: string
  rankingSekolah: string
  rankingJurusan: string
  rankingStatus: string
  rankingKuota: number
  rankingKuotaPerJalur: Array<{ nama: string; persentase: number; kuota: number }>
  appName: string
  schoolName: string
  appSubtitle: string
  onPrintPDF: () => void
  onExportExcel: () => void
}

export default function RankingPreviewDialog({
  open,
  onOpenChange,
  rankingPreviewType,
  rankingPreviewJalur,
  setRankingPreviewJalur,
  rankingData,
  rankingFilters,
  rankingTampilan,
  rankingSekolah,
  rankingJurusan,
  rankingStatus,
  rankingKuota,
  rankingKuotaPerJalur,
  appName,
  schoolName,
  appSubtitle,
  onPrintPDF,
  onExportExcel,
}: RankingPreviewDialogProps) {
  const getFilteredCount = () => {
    return rankingPreviewJalur === 'all'
      ? rankingData.length
      : rankingData.filter((r: Record<string, unknown>) => (r.subJalur as string) === rankingPreviewJalur).length
  }

  const filteredPreviewData = (rankingPreviewJalur === 'all'
    ? rankingData
    : rankingData.filter((r: Record<string, unknown>) => (r.subJalur as string) === rankingPreviewJalur)
  ).slice(0, 15)

  // Stats
  const allFiltered = rankingPreviewJalur === 'all'
    ? rankingData
    : rankingData.filter((r: Record<string, unknown>) => (r.subJalur as string) === rankingPreviewJalur)
  const totalVerified = allFiltered.filter(r => r.verificationStatus === 'VERIFIED').length
  const totalRejected = allFiltered.filter(r => r.verificationStatus === 'REJECTED').length
  const totalPending = allFiltered.length - totalVerified - totalRejected

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-7xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {rankingPreviewType === 'pdf' ? (
              <><Printer className="w-5 h-5 text-red-600" /> Preview Cetak PDF — Detail Verifikasi</>
            ) : (
              <><FileSpreadsheet className="w-5 h-5 text-emerald-600" /> Preview Cetak Excel — Detail Verifikasi</>
            )}
          </DialogTitle>
          <DialogDescription>
            {rankingPreviewType === 'pdf'
              ? 'Pratinjau hasil cetak perangkingan lengkap (sesuai Lembar Verifikasi). Klik "Cetak PDF" untuk membuka dialog cetak.'
              : 'Pratinjau data lengkap yang akan diekspor ke Excel. Klik "Unduh Excel" untuk mengunduh file.'}
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
            {rankingFilters.jalurOptions.filter((j: string) => j && j.trim() !== '').map((j: string, jIdx: number) => {
              const count = rankingData.filter((r: Record<string, unknown>) => (r.subJalur as string) === j).length
              return (
                <button
                  key={`rp-jalur-${j}-${jIdx}`}
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
              <h2 className="text-lg font-bold tracking-wider">LAPORAN PERANGKINGAN PESERTA SPMB</h2>
              <p className="text-sm text-gray-500">{appName}{schoolName ? ` — ${schoolName}` : ''} — {appSubtitle.split('\n')[0]}</p>
              <p className="text-xs text-gray-400 mt-1">
                Diurutkan berdasarkan: <strong>{rankingTampilan === 'jarak' ? 'Jarak Terdekat' : rankingTampilan === 'nilai' ? 'Nilai Tertinggi' : 'Skor Komposit'}</strong>
                {' · '}Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Stats Row Preview */}
            <div className="flex justify-center gap-3 mb-3">
              <div className="text-center px-4 py-1.5 rounded-lg border border-sky-200 bg-sky-50">
                <div className="text-lg font-bold text-sky-700">{allFiltered.length}</div>
                <div className="text-[9px] text-sky-500">Total Pendaftar</div>
              </div>
              <div className="text-center px-4 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50">
                <div className="text-lg font-bold text-emerald-700">{totalVerified}</div>
                <div className="text-[9px] text-emerald-500">Diterima</div>
              </div>
              <div className="text-center px-4 py-1.5 rounded-lg border border-red-200 bg-red-50">
                <div className="text-lg font-bold text-red-700">{totalRejected}</div>
                <div className="text-[9px] text-red-500">Ditolak</div>
              </div>
              <div className="text-center px-4 py-1.5 rounded-lg border border-amber-200 bg-amber-50">
                <div className="text-lg font-bold text-amber-700">{totalPending}</div>
                <div className="text-[9px] text-amber-500">Menunggu</div>
              </div>
              {rankingKuota > 0 && (
                <div className="text-center px-4 py-1.5 rounded-lg border border-blue-200 bg-blue-50">
                  <div className="text-lg font-bold text-blue-700">{rankingKuota}</div>
                  <div className="text-[9px] text-blue-500">Total Kuota</div>
                </div>
              )}
            </div>

            {/* Filters Preview */}
            <div className="flex flex-wrap gap-2 justify-center mb-3">
              <span className="text-xs bg-gray-100 px-2 py-1 rounded border">Jalur: {rankingPreviewJalur !== 'all' ? rankingPreviewJalur : 'Semua'}</span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded border">Sekolah: {rankingSekolah !== 'all' ? rankingSekolah : 'Semua'}</span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded border">Jurusan: {rankingJurusan !== 'all' ? rankingJurusan : 'Semua'}</span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded border">Status: {rankingStatus !== 'all' ? (rankingStatus === 'VERIFIED' ? 'Diterima' : rankingStatus === 'REJECTED' ? 'Ditolak' : 'Menunggu') : 'Semua'}</span>
            </div>

            {/* Kuota Preview */}
            {rankingKuota > 0 && (
              <div className="text-center mb-3 text-xs">
                <span className="bg-sky-100 text-sky-700 px-3 py-1 rounded mr-2">Total Kuota: <strong>{rankingKuota}</strong></span>
                {rankingKuotaPerJalur.map((kj, kjIdx) => (
                  <span key={`rp-kquota-${kj.nama}-${kjIdx}`} className="bg-sky-50 text-sky-600 px-2 py-1 rounded mr-1">{kj.nama}: {kj.kuota} ({kj.persentase}%)</span>
                ))}
              </div>
            )}

            {/* Detailed Table Preview */}
            <div className="overflow-x-auto border rounded">
              <Table className="text-[10px]">
                <TableHeader>
                  {/* Group header row */}
                  <TableRow className="bg-slate-800 text-white">
                    <TableHead rowSpan={2} className="w-8 text-center font-semibold text-white bg-slate-800">No</TableHead>
                    <TableHead rowSpan={2} className="w-16 text-center font-semibold text-white bg-slate-800">Jalur</TableHead>
                    <TableHead colSpan={2} className="text-center font-semibold text-white bg-slate-700">Data Pendaftar</TableHead>
                    <TableHead rowSpan={2} className="font-semibold text-white bg-slate-800">Sekolah Asal</TableHead>
                    <TableHead rowSpan={2} className="w-12 text-center font-semibold text-white bg-slate-800">Jurusan</TableHead>
                    <TableHead colSpan={2} className={`text-center font-semibold ${rankingTampilan === 'jarak' ? 'bg-sky-900 text-sky-100' : 'bg-slate-700 text-white'}`}>Jarak</TableHead>
                    <TableHead colSpan={2} className={`text-center font-semibold ${rankingTampilan === 'nilai' ? 'bg-emerald-900 text-emerald-100' : 'bg-slate-700 text-white'}`}>Nilai</TableHead>
                    <TableHead colSpan={2} className={`text-center font-semibold ${rankingTampilan === 'komposit' ? 'bg-amber-900 text-amber-100' : 'bg-slate-700 text-white'}`}>Skor</TableHead>
                    <TableHead colSpan={5} className="text-center font-semibold text-white bg-slate-700">Verifikasi</TableHead>
                    <TableHead rowSpan={2} className="w-12 text-center font-semibold text-white bg-slate-800">Status</TableHead>
                    <TableHead rowSpan={2} className="w-10 text-center font-semibold text-white bg-slate-800">Kuota</TableHead>
                  </TableRow>
                  <TableRow className="bg-slate-100">
                    <TableHead className="font-semibold">Nama/NISN</TableHead>
                    <TableHead className="font-semibold w-16">No. Reg</TableHead>
                    <TableHead className={`font-semibold ${rankingTampilan === 'jarak' ? 'bg-sky-50' : ''}`}>Jarak</TableHead>
                    <TableHead className={`font-semibold ${rankingTampilan === 'jarak' ? 'bg-sky-50' : ''}`}>Skor</TableHead>
                    <TableHead className={`font-semibold ${rankingTampilan === 'nilai' ? 'bg-emerald-50' : ''}`}>Rata²</TableHead>
                    <TableHead className={`font-semibold ${rankingTampilan === 'nilai' ? 'bg-emerald-50' : ''}`}>Skor</TableHead>
                    <TableHead className="font-semibold">Total</TableHead>
                    <TableHead className={`font-semibold ${rankingTampilan === 'komposit' ? 'bg-amber-50' : ''}`}>Komposit</TableHead>
                    <TableHead className="font-semibold">Kekurangan</TableHead>
                    <TableHead className="font-semibold w-16">Tgl Verif</TableHead>
                    <TableHead className="font-semibold w-12">Jam</TableHead>
                    <TableHead className="font-semibold w-16">Terbit KK</TableHead>
                    <TableHead className="font-semibold w-12">Lama KK</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPreviewData.map((r: Record<string, unknown>, idx: number) => {
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

                    const sameJalurAbove = allFiltered
                      .filter((other: Record<string, unknown>) =>
                        (other.subJalur as string) === (r.subJalur as string) &&
                        ((other._ranking as number) || 0) < rankNum
                      ).length

                    const withinKuota = currentKuota > 0 && sameJalurAbove < currentKuota
                    const isVerified = r.verificationStatus === 'VERIFIED'

                    // Kekurangan verifikasi display
                    const kekurangan = v(r, 'kekuranganVerifikasi')
                    const kekuranganDisplay = kekurangan !== '-'
                      ? kekurangan.split(' | ').map((k, i) => <span key={i} className="block text-[8px] text-red-600 leading-tight">{k}</span>)
                      : <span className="text-gray-300">-</span>

                    return (
                      <TableRow key={`print-rank-${r.id}-${idx}`} className={`${withinKuota && !isVerified ? 'bg-emerald-50/50' : ''} ${isVerified ? 'bg-emerald-50' : ''} ${r.verificationStatus === 'REJECTED' ? 'bg-red-50/30' : ''}`}>
                        <TableCell className="text-center p-1">
                          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[8px] font-bold ${
                            rankNum === 1 ? 'bg-amber-400 text-white' :
                            rankNum === 2 ? 'bg-gray-300 text-gray-700' :
                            rankNum === 3 ? 'bg-amber-700 text-white' :
                            withinKuota ? 'bg-emerald-100 text-emerald-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>{rankNum}</span>
                        </TableCell>
                        <TableCell className="text-center p-0.5">
                          <Badge variant="outline" className={`text-[8px] px-1 py-0 ${SUB_JALUR_COLORS[r.subJalur as string] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                            {r.subJalur as string}
                          </Badge>
                          {jalurRank > 0 && <span className="block text-[7px] text-sky-600">#{jalurRank}</span>}
                        </TableCell>
                        <TableCell className="p-0.5">
                          <p className="text-[10px] font-medium leading-tight">{v(r, 'nama')}</p>
                          <p className="text-[8px] text-gray-400">NISN: {v(r, 'nisn')}</p>
                        </TableCell>
                        <TableCell className="p-0.5 text-[8px] text-center text-gray-500">{v(r, 'noRegistrasi')}</TableCell>
                        <TableCell className="p-0.5 text-[9px]">{v(r, 'namaSekolahAsal')}</TableCell>
                        <TableCell className="p-0.5 text-[8px] text-center text-gray-500">{v(r, 'jurusan')}</TableCell>
                        <TableCell className={`text-right p-0.5 ${rankingTampilan === 'jarak' ? 'bg-sky-50/50 font-bold' : ''}`}>
                          <span className={`text-[9px] ${jarakNum > 0 ? 'text-sky-700' : 'text-gray-300'}`}>{v(r, 'lokasiJarak')}</span>
                        </TableCell>
                        <TableCell className={`text-center p-0.5 ${rankingTampilan === 'jarak' ? 'bg-sky-50/50' : ''}`}>
                          <span className={`text-[9px] ${jarakNum > 0 ? 'text-sky-700' : 'text-gray-300'}`}>{v(r, 'skorJarak')}</span>
                        </TableCell>
                        <TableCell className={`text-right p-0.5 ${rankingTampilan === 'nilai' ? 'bg-emerald-50/50 font-bold' : ''}`}>
                          <span className={`text-[9px] ${nilaiNum > 0 ? 'text-emerald-700' : 'text-gray-300'}`}>{v(r, 'nilaiRataRata')}</span>
                        </TableCell>
                        <TableCell className={`text-center p-0.5 ${rankingTampilan === 'nilai' ? 'bg-emerald-50/50' : ''}`}>
                          <span className={`text-[9px] ${nilaiNum > 0 ? 'text-emerald-700' : 'text-gray-300'}`}>{v(r, 'skorNilaiRaport')}</span>
                        </TableCell>
                        <TableCell className="text-center p-0.5">
                          <span className={`text-[9px] ${skorNum > 0 ? 'text-amber-700' : 'text-gray-300'}`}>{v(r, 'totalNilai')}</span>
                        </TableCell>
                        <TableCell className={`text-center p-0.5 ${rankingTampilan === 'komposit' ? 'bg-amber-50/50 font-bold' : ''}`}>
                          <span className={`text-[9px] ${skorNum > 0 ? 'text-amber-700' : 'text-gray-300'}`}>{v(r, 'skor')}</span>
                        </TableCell>
                        <TableCell className="p-0.5" style={{ maxWidth: '100px' }}>
                          {kekuranganDisplay}
                        </TableCell>
                        <TableCell className="p-0.5 text-[8px] text-center text-gray-500">{v(r, 'tanggalVerif')}</TableCell>
                        <TableCell className="p-0.5 text-[8px] text-center text-gray-500">{v(r, 'jamVerif')}</TableCell>
                        <TableCell className="p-0.5 text-[8px] text-center text-gray-500">{v(r, 'terbitKK')}</TableCell>
                        <TableCell className="p-0.5 text-[8px] text-center text-gray-500">{v(r, 'lamaKK')}</TableCell>
                        <TableCell className="text-center p-0.5">
                          <Badge className={`text-[8px] px-1 py-0 ${STATUS_COLORS[r.verificationStatus as string] || 'bg-gray-100 text-gray-700'}`}>
                            {r.verificationStatus === 'VERIFIED' ? 'Diterima' : r.verificationStatus === 'REJECTED' ? 'Ditolak' : 'Menunggu'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center p-0.5">
                          {withinKuota ? <span className="text-emerald-600 font-bold text-xs">&#10003;</span> : <span className="text-gray-300">-</span>}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              {(() => {
                const filteredCount = getFilteredCount()
                return filteredCount > 15 ? (
                  <div className="text-center py-2 text-xs text-gray-400 border-t">
                    {'... dan '}{filteredCount - 15}{' data lainnya (total: '}{filteredCount}{' pendaftar)'}
                  </div>
                ) : null
              })()}
            </div>

            {/* Legend */}
            <div className="text-center mt-3 text-xs text-gray-400">
              🟡 Rangking 1 · ⚪ Rangking 2 · 🟤 Rangking 3 · 🟢 Masuk Kuota · Total: {getFilteredCount()} pendaftar
              <span className="ml-3">Diterima: {totalVerified} | Ditolak: {totalRejected} | Menunggu: {totalPending}</span>
            </div>

            {/* Excel Data Preview */}
            {rankingPreviewType === 'excel' && (
              <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <h4 className="text-xs font-semibold text-emerald-800 mb-2">📋 Data yang akan diekspor ke Excel:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                  <div className="bg-white rounded p-2 border">
                    <span className="text-gray-500">Kolom Data</span>
                    <p className="font-bold text-gray-800">24 kolom</p>
                  </div>
                  <div className="bg-white rounded p-2 border">
                    <span className="text-gray-500">Baris Data</span>
                    <p className="font-bold text-gray-800">{getFilteredCount()} baris</p>
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
                  Sheet 1: Perangkingan (data lengkap termasuk kekurangan verifikasi, tanggal verif, KK) · Sheet 2: Ringkasan (filter, kuota & statistik per jalur)
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            onClick={() => {
              if (rankingPreviewType === 'pdf') {
                onPrintPDF()
              } else {
                onExportExcel()
              }
              onOpenChange(false)
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
  )
}
