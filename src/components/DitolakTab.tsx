'use client'

import { useMemo } from 'react'
import {
  Card,
  CardContent,
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
  Printer,
  Filter,
  FileText,
  UserX,
  Eye,
  Pencil,
  Trash2,
  ArrowUpDown,
  ArrowUpAZ,
  ArrowDownAZ,
  Repeat,
} from 'lucide-react'
import type { Registration, DashboardStats } from '@/lib/types'
import { SUB_JALUR_COLORS } from '@/lib/constants'

interface DitolakTabProps {
  stats: DashboardStats | null
  appName: string
  schoolName: string
  appSubtitle: string
  rejectedPercent: number
  ditolakFilterJalur: string
  setDitolakFilterJalur: (v: string) => void
  subJalurOptions: Array<{ label: string; value: string }>
  namaSortDitolak: 'none' | 'asc' | 'desc'
  setNamaSortDitolak: (v: 'none' | 'asc' | 'desc') => void
  handlePrintReport: (type: 'diterima' | 'ditolak') => void
  setDetailTarget: (v: Registration | null) => void
  setDetailDialogOpen: (v: boolean) => void
  openEditDialog: (reg: Registration) => void
  openDeleteDialog: (reg: Registration) => void
}

export default function DitolakTab(props: DitolakTabProps) {
  const {
    stats, appName, schoolName, appSubtitle, rejectedPercent,
    ditolakFilterJalur, setDitolakFilterJalur,
    subJalurOptions,
    namaSortDitolak, setNamaSortDitolak,
    handlePrintReport,
    setDetailTarget, setDetailDialogOpen,
    openEditDialog, openDeleteDialog,
  } = props

  // Calculate rejection counts per student (by NISN or nama)
  const rejectionCounts = useMemo(() => {
    const list = stats?.rejectedList || []
    const countMap = new Map<string, number>()
    for (const reg of list) {
      const key = reg.nisn?.trim() || reg.nama?.trim()?.toLowerCase() || reg.id
      countMap.set(key, (countMap.get(key) || 0) + 1)
    }
    return countMap
  }, [stats?.rejectedList])

  // Track which occurrence each record is (for "Ditolak ke-X" label)
  const rejectionOrder = useMemo(() => {
    const list = stats?.rejectedList || []
    const orderMap = new Map<string, number>()
    const seenMap = new Map<string, number>()
    for (const reg of list) {
      const key = reg.nisn?.trim() || reg.nama?.trim()?.toLowerCase() || reg.id
      const next = (seenMap.get(key) || 0) + 1
      seenMap.set(key, next)
      orderMap.set(reg.id, next)
    }
    return orderMap
  }, [stats?.rejectedList])

  // Count unique students rejected
  const uniqueRejectedCount = useMemo(() => {
    return rejectionCounts.size
  }, [rejectionCounts])

  return (
    <>
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-600 p-4 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold tracking-wide">LAPORAN PESERTA DITOLAK</h2>
              <p className="text-red-100 mt-0.5 sm:mt-1 text-xs sm:text-sm">{appName}{schoolName ? ` — ${schoolName}` : ''} — {appSubtitle.split('\n')[0]}</p>
            </div>
            <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30" onClick={() => handlePrintReport('ditolak')}>
              <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> <span className="text-xs sm:text-sm">Cetak</span>
            </Button>
          </div>
        </div>
        <CardContent className="p-3 sm:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            <div className="bg-red-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-red-100"><p className="text-xl sm:text-3xl font-bold text-red-700">{stats?.rejected || 0}</p><p className="text-[10px] sm:text-xs text-red-600 font-medium mt-0.5 sm:mt-1">Total Ditolak</p></div>
            <div className="bg-red-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-red-100"><p className="text-xl sm:text-3xl font-bold text-red-700">{uniqueRejectedCount}</p><p className="text-[10px] sm:text-xs text-red-600 font-medium mt-0.5 sm:mt-1">Siswa Unik</p></div>
            <div className="bg-red-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-red-100"><p className="text-xl sm:text-3xl font-bold text-red-700">{rejectedPercent}%</p><p className="text-[10px] sm:text-xs text-red-600 font-medium mt-0.5 sm:mt-1">Persentase Ditolak</p></div>
            <div className="bg-red-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-red-100"><p className="text-xl sm:text-3xl font-bold text-red-700">{stats?.rejectedBySubJalur?.length || 0}</p><p className="text-[10px] sm:text-xs text-red-600 font-medium mt-0.5 sm:mt-1">Jalur Aktif</p></div>
          </div>
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Distribusi Per Sub Jalur</h3>
            <div className="space-y-2.5">
              {(stats?.rejectedBySubJalur || []).map((item, idx) => (
                <div key={`rbsub-${item.name}-${idx}`} className="flex items-center gap-3">
                  <Badge variant="outline" className={`${SUB_JALUR_COLORS[item.name] || 'bg-gray-100 text-gray-800'} min-w-[130px] justify-center text-xs`}>{item.name}</Badge>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 relative overflow-hidden"><div className="h-full bg-red-500 rounded-full transition-all duration-500" style={{ width: stats?.rejected ? `${(item.count / stats.rejected) * 100}%` : '0%' }} /></div>
                  <span className="text-sm font-semibold text-gray-700 min-w-[40px] text-right">{item.count}</span>
                </div>
              ))}
              {(stats?.rejectedBySubJalur || []).length === 0 && <p className="text-xs text-gray-400 text-center py-2">Belum ada data</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex items-center gap-2 text-sm text-gray-500"><Filter className="w-4 h-4" /> Filter:</div>
            <Select value={ditolakFilterJalur} onValueChange={setDitolakFilterJalur}>
              <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Sub Jalur" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jalur</SelectItem>
                {subJalurOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="sm:ml-auto text-sm text-gray-500">
              Menampilkan {(() => { const list = stats?.rejectedList || []; const filtered = list.filter(r => ditolakFilterJalur === 'all' || r.subJalur === ditolakFilterJalur); return filtered.length })()} dari {stats?.rejected || 0} penolakan ({uniqueRejectedCount} siswa unik)
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-lg"><FileText className="w-5 h-5 text-red-600" /> Daftar Peserta Ditolak</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-white">
                <TableRow className="bg-red-50/80">
                  <TableHead className="w-12 text-center">No</TableHead>
                  <TableHead>No. Registrasi</TableHead>
                  <TableHead>Nama
                    <span className="ml-1 cursor-pointer inline-flex align-middle" onClick={() => setNamaSortDitolak(namaSortDitolak === 'none' ? 'asc' : namaSortDitolak === 'asc' ? 'desc' : 'none')}>
                      {namaSortDitolak === 'none' ? <ArrowUpDown className="w-3 h-3 text-gray-400" /> : namaSortDitolak === 'asc' ? <ArrowUpAZ className="w-3 h-3 text-red-600" /> : <ArrowDownAZ className="w-3 h-3 text-red-600" />}
                    </span>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">NISN</TableHead>
                  <TableHead>Sub Jalur</TableHead>
                  <TableHead className="hidden lg:table-cell">Sekolah Asal</TableHead>
                  <TableHead>Ditolak Ke-</TableHead>
                  <TableHead className="hidden sm:table-cell">Alasan Penolakan</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  const list = stats?.rejectedList || []
                  const filtered = list.filter(r => ditolakFilterJalur === 'all' || r.subJalur === ditolakFilterJalur)
                  const sorted = [...filtered].sort((a, b) => {
                    if (namaSortDitolak === 'asc') return (a.nama || '').localeCompare(b.nama || '')
                    if (namaSortDitolak === 'desc') return (b.nama || '').localeCompare(a.nama || '')
                    return 0
                  })
                  return sorted.length > 0 ? sorted.map((reg, idx) => {
                    const regKey = reg.nisn?.trim() || reg.nama?.trim()?.toLowerCase() || reg.id
                    const totalRejections = rejectionCounts.get(regKey) || 1
                    const currentOrder = rejectionOrder.get(reg.id) || 1
                    const isMultipleRejections = totalRejections > 1

                    return (
                      <TableRow key={`ditolak-${reg.id}-${idx}`} className="hover:bg-red-50/30">
                        <TableCell className="text-center text-sm text-gray-500">{idx + 1}</TableCell>
                        <TableCell className="font-mono text-sm">{reg.noRegistrasi}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-1.5">
                            {reg.nama}
                            {isMultipleRejections && (
                              <Badge className="bg-red-100 text-red-700 border border-red-200 text-[10px] px-1.5 py-0 h-5 shrink-0" title={`Ditolak ${totalRejections} kali`}>
                                <Repeat className="w-2.5 h-2.5 mr-0.5" />{totalRejections}x
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-gray-500">{reg.nisn}</TableCell>
                        <TableCell><Badge variant="outline" className={SUB_JALUR_COLORS[reg.subJalur] || 'bg-gray-100 text-gray-800'}>{reg.subJalur}</Badge></TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">{reg.namaSekolahAsal}</TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] px-1.5 py-0 h-5 shrink-0 font-bold ${isMultipleRejections ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                            {currentOrder} dari {totalRejections}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-gray-500 max-w-[200px] truncate">{reg.verificationNote || <span className="text-gray-400 italic">Tidak ada alasan</span>}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => { setDetailTarget(reg); setDetailDialogOpen(true) }} title="Lihat Detail"><Eye className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-white hover:bg-blue-600" title="Edit Data" onClick={() => openEditDialog(reg)}><Pencil className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-white hover:bg-red-600" title="Hapus Data" onClick={() => openDeleteDialog(reg)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  }) : (
                    <TableRow><TableCell colSpan={10} className="text-center py-12"><UserX className="w-10 h-10 mx-auto text-gray-300 mb-2" /><p className="text-gray-500 font-medium">Belum ada pendaftar yang ditolak</p><p className="text-sm text-gray-400">Semua pendaftar dalam proses verifikasi</p></TableCell></TableRow>
                  )
                })()}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
