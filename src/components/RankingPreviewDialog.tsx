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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              <h2 className="text-lg font-bold tracking-wider">LAPORAN PERANGKINGAN</h2>
              <p className="text-sm text-gray-500">{appName}{schoolName ? ` — ${schoolName}` : ''} — {appSubtitle.split('\n')[0]}</p>
              <p className="text-xs text-gray-400 mt-1">
                Diurutkan berdasarkan: <strong>{rankingTampilan === 'jarak' ? 'Jarak Terdekat' : rankingTampilan === 'nilai' ? 'Nilai Tertinggi' : 'Skor Komposit'}</strong>
                {' · '}Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
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

            {/* Table Preview */}
            <div className="overflow-x-auto border rounded">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-10 text-center font-semibold">No</TableHead>
                    <TableHead className="w-20 text-center font-semibold">Jalur</TableHead>
                    <TableHead className="font-semibold">Nama Pendaftar</TableHead>
                    <TableHead className="font-semibold">Sekolah Asal</TableHead>
                    <TableHead className="font-semibold">Jurusan</TableHead>
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
                      <TableRow key={`print-rank-${r.id}-${idx}`} className={`${withinKuota && !isVerified ? 'bg-emerald-50/50' : ''} ${isVerified ? 'bg-emerald-50' : ''}`}>
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
                        <TableCell className="text-xs p-1 text-gray-600">{r.jurusan as string}</TableCell>
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
                const filteredCount = getFilteredCount()
                return filteredCount > 20 ? (
                  <div className="text-center py-2 text-xs text-gray-400 border-t">
                    {'... dan '}{filteredCount - 20}{' data lainnya (total: '}{filteredCount}{' pendaftar)'}
                  </div>
                ) : null
              })()}
            </div>

            {/* Legend */}
            <div className="text-center mt-3 text-xs text-gray-400">
              🟡 Rangking 1 · ⚪ Rangking 2 · 🟤 Rangking 3 · 🟢 Masuk Kuota · Total: {getFilteredCount()} pendaftar
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
                  Sheet 1: Perangkingan (data lengkap) · Sheet 2: Ringkasan (filter & kuota)
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
