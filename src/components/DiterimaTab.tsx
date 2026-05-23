'use client'

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
  ListChecks,
  UserCheck,
  Eye,
  Pencil,
  Trash2,
  ArrowUpDown,
  ArrowUpAZ,
  ArrowDownAZ,
} from 'lucide-react'
import type { Registration, DashboardStats } from '@/lib/types'
import { SUB_JALUR_COLORS } from '@/lib/constants'

interface DiterimaTabProps {
  stats: DashboardStats | null
  appName: string
  schoolName: string
  appSubtitle: string
  verifiedPercent: number
  diterimaFilterJalur: string
  setDiterimaFilterJalur: (v: string) => void
  diterimaFilterSekolah: string
  setDiterimaFilterSekolah: (v: string) => void
  subJalurOptions: Array<{ label: string; value: string }>
  namaSortDiterima: 'none' | 'asc' | 'desc'
  setNamaSortDiterima: (v: 'none' | 'asc' | 'desc') => void
  handlePrintReport: (type: 'diterima' | 'ditolak') => void
  setDetailTarget: (v: Registration | null) => void
  setDetailDialogOpen: (v: boolean) => void
  openEditDialog: (reg: Registration) => void
  openDeleteDialog: (reg: Registration) => void
}

export default function DiterimaTab(props: DiterimaTabProps) {
  const {
    stats, appName, schoolName, appSubtitle, verifiedPercent,
    diterimaFilterJalur, setDiterimaFilterJalur,
    diterimaFilterSekolah, setDiterimaFilterSekolah,
    subJalurOptions,
    namaSortDiterima, setNamaSortDiterima,
    handlePrintReport,
    setDetailTarget, setDetailDialogOpen,
    openEditDialog, openDeleteDialog,
  } = props

  return (
    <>
      {/* Elegant Header */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 p-4 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold tracking-wide">LAPORAN PESERTA DITERIMA</h2>
              <p className="text-emerald-100 mt-0.5 sm:mt-1 text-xs sm:text-sm">{appName}{schoolName ? ` — ${schoolName}` : ''} — {appSubtitle.split('\n')[0]}</p>
            </div>
            <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30" onClick={() => handlePrintReport('diterima')}>
              <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> <span className="text-xs sm:text-sm">Cetak</span>
            </Button>
          </div>
        </div>
        <CardContent className="p-3 sm:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            <div className="bg-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-emerald-100">
              <p className="text-xl sm:text-3xl font-bold text-emerald-700">{stats?.verified || 0}</p>
              <p className="text-[10px] sm:text-xs text-emerald-600 font-medium mt-0.5 sm:mt-1">Total Diterima</p>
            </div>
            <div className="bg-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-emerald-100">
              <p className="text-xl sm:text-3xl font-bold text-emerald-700">{stats?.total || 0}</p>
              <p className="text-[10px] sm:text-xs text-emerald-600 font-medium mt-0.5 sm:mt-1">Total Pendaftar</p>
            </div>
            <div className="bg-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-emerald-100">
              <p className="text-xl sm:text-3xl font-bold text-emerald-700">{verifiedPercent}%</p>
              <p className="text-[10px] sm:text-xs text-emerald-600 font-medium mt-0.5 sm:mt-1">Persentase Diterima</p>
            </div>
            <div className="bg-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-emerald-100">
              <p className="text-xl sm:text-3xl font-bold text-emerald-700">{stats?.verifiedBySubJalur?.length || 0}</p>
              <p className="text-[10px] sm:text-xs text-emerald-600 font-medium mt-0.5 sm:mt-1">Jalur Aktif</p>
            </div>
          </div>

          {/* Per Jalur Breakdown with Progress Bars */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Distribusi Per Sub Jalur</h3>
            <div className="space-y-2.5">
              {(stats?.verifiedBySubJalur || []).map((item, idx) => (
                <div key={`vbsub-${item.name}-${idx}`} className="flex items-center gap-3">
                  <Badge variant="outline" className={`${SUB_JALUR_COLORS[item.name] || 'bg-gray-100 text-gray-800'} min-w-[130px] justify-center text-xs`}>
                    {item.name}
                  </Badge>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 relative overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: stats?.verified ? `${(item.count / stats.verified) * 100}%` : '0%' }} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 min-w-[40px] text-right">{item.count}</span>
                </div>
              ))}
              {(stats?.verifiedBySubJalur || []).length === 0 && <p className="text-xs text-gray-400 text-center py-2">Belum ada data</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex items-center gap-2 text-sm text-gray-500"><Filter className="w-4 h-4" /> Filter:</div>
            <Select value={diterimaFilterJalur} onValueChange={setDiterimaFilterJalur}>
              <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Sub Jalur" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jalur</SelectItem>
                {subJalurOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={diterimaFilterSekolah} onValueChange={setDiterimaFilterSekolah}>
              <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Sekolah Asal" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Sekolah</SelectItem>
                {(stats?.verifiedBySekolah || []).map((item, idx) => <SelectItem key={`vsch-${item.name}-${idx}`} value={item.name}>{item.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="sm:ml-auto text-sm text-gray-500">
              Menampilkan {(() => {
                const list = stats?.verifiedList || []
                const filtered = list.filter(r => (diterimaFilterJalur === 'all' || r.subJalur === diterimaFilterJalur) && (diterimaFilterSekolah === 'all' || r.namaSekolahAsal === diterimaFilterSekolah))
                return filtered.length
              })()} dari {stats?.verified || 0} peserta
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg"><ListChecks className="w-5 h-5 text-emerald-600" /> Daftar Peserta Diterima</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-white">
                <TableRow className="bg-emerald-50/80">
                  <TableHead className="w-12 text-center">No</TableHead>
                  <TableHead>No. Registrasi</TableHead>
                  <TableHead>Nama
                    <span className="ml-1 cursor-pointer inline-flex align-middle" onClick={() => setNamaSortDiterima(namaSortDiterima === 'none' ? 'asc' : namaSortDiterima === 'asc' ? 'desc' : 'none')}>
                      {namaSortDiterima === 'none' ? <ArrowUpDown className="w-3 h-3 text-gray-400" /> : namaSortDiterima === 'asc' ? <ArrowUpAZ className="w-3 h-3 text-emerald-600" /> : <ArrowDownAZ className="w-3 h-3 text-emerald-600" />}
                    </span>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">NISN</TableHead>
                  <TableHead>Sub Jalur</TableHead>
                  <TableHead className="hidden lg:table-cell">Sekolah Asal</TableHead>
                  <TableHead className="hidden sm:table-cell">Tanggal Verif</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  const list = stats?.verifiedList || []
                  const filtered = list.filter(r => (diterimaFilterJalur === 'all' || r.subJalur === diterimaFilterJalur) && (diterimaFilterSekolah === 'all' || r.namaSekolahAsal === diterimaFilterSekolah))
                  const sorted = [...filtered].sort((a, b) => {
                    if (namaSortDiterima === 'asc') return (a.nama || '').localeCompare(b.nama || '')
                    if (namaSortDiterima === 'desc') return (b.nama || '').localeCompare(a.nama || '')
                    return 0
                  })
                  return sorted.length > 0 ? sorted.map((reg, idx) => (
                    <TableRow key={`diterima-${reg.id}-${idx}`} className="hover:bg-emerald-50/30">
                      <TableCell className="text-center text-sm text-gray-500">{idx + 1}</TableCell>
                      <TableCell className="font-mono text-sm">{reg.noRegistrasi}</TableCell>
                      <TableCell className="font-medium">{reg.nama}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-gray-500">{reg.nisn}</TableCell>
                      <TableCell><Badge variant="outline" className={SUB_JALUR_COLORS[reg.subJalur] || 'bg-gray-100 text-gray-800'}>{reg.subJalur}</Badge></TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">{reg.namaSekolahAsal}</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-gray-500">{reg.tanggalVerif || (reg.updatedAt ? new Date(reg.updatedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => { setDetailTarget(reg); setDetailDialogOpen(true) }} title="Lihat Detail"><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-white hover:bg-blue-600" title="Edit Data" onClick={() => openEditDialog(reg)}><Pencil className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-white hover:bg-red-600" title="Hapus Data" onClick={() => openDeleteDialog(reg)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={10} className="text-center py-12"><UserCheck className="w-10 h-10 mx-auto text-gray-300 mb-2" /><p className="text-gray-500 font-medium">Belum ada pendaftar yang diterima</p><p className="text-sm text-gray-400">Verifikasi pendaftar untuk menerimanya</p></TableCell></TableRow>
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
