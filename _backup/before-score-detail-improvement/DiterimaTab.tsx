'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
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
  ListChecks,
  UserCheck,
  Filter,
  ArrowUpDown,
  ArrowUpAZ,
  ArrowDownAZ,
  FileDown,
  Printer,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react'
import type { Registration, DashboardStats } from '@/lib/types'
import { SUB_JALUR_COLORS } from '@/lib/constants'
import { ErrorBoundary } from '@/components/ErrorBoundary'

interface DiterimaTabProps {
  stats: DashboardStats | null
  subJalurOptions: Array<{ label: string; value: string }>
  toast: any
  verifiedPercent: number
  onViewDetail: (reg: Registration) => void
  onEdit: (reg: Registration) => void
  onDelete: (reg: Registration) => void
}

export default function DiterimaTab({
  stats,
  subJalurOptions,
  toast,
  verifiedPercent,
  onViewDetail,
  onEdit,
  onDelete,
}: DiterimaTabProps) {
  const [diterimaFilterJalur, setDiterimaFilterJalur] = useState('all')
  const [diterimaFilterSekolah, setDiterimaFilterSekolah] = useState('all')
  const [namaSortDiterima, setNamaSortDiterima] = useState<'none' | 'asc' | 'desc'>('none')

  // Get filtered list for current filters
  const getFilteredList = () => {
    const list = stats?.verifiedList || []
    return list.filter(r =>
      (diterimaFilterJalur === 'all' || r.subJalur === diterimaFilterJalur) &&
      (diterimaFilterSekolah === 'all' || r.namaSekolahPilihan === diterimaFilterSekolah)
    )
  }

  const handleExportExcel = () => {
    const list = getFilteredList()
    const excelData = list.map((reg, idx) => ({
      'No': idx + 1,
      'No. Registrasi': reg.noRegistrasi,
      'Nama': reg.nama,
      'NISN': reg.nisn,
      'Sub Jalur': reg.subJalur,
      'Sekolah Pilihan': reg.namaSekolahPilihan,
      'Jurusan': reg.jurusan,
      'Sekolah Asal': reg.namaSekolahAsal,
      'Status': 'Diterima',
      'Tanggal Verif': reg.tanggalVerif || '-',
      'NIK': reg.nik || '-',
      'Tanggal Lahir': reg.tanggalLahir || '-',
      'Alamat': reg.alamat || '-',
      'No. Telp': reg.noTelpSiswa || '-',
      'Skor Jarak': reg.skorJarak || '-',
      'Skor Nilai Raport': reg.skorNilaiRaport || '-',
      'Skor Komposit': reg.skor || '-',
    }))
    const ws = XLSX.utils.json_to_sheet(excelData)
    const colWidths = Object.keys(excelData[0] || {}).map(key => ({
      wch: Math.max(key.length + 2, ...excelData.map(r => String((r as Record<string, unknown>)[key] || '').length + 2)).slice(0, 50)
    }))
    ws['!cols'] = colWidths
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Peserta Diterima')
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `SPMB_2026_Diterima_${new Date().toISOString().slice(0, 10)}.xlsx`)
    toast({ title: 'Export Berhasil', description: `${list.length} data diekspor ke Excel` })
  }

  const handlePrintReport = () => {
    const list = getFilteredList()
    const title = 'LAPORAN PESERTA DITERIMA'
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const rows = list.map((reg, idx) => `
      <tr>
        <td style="padding:6px 8px;border:1px solid #ddd;text-align:center">${idx + 1}</td>
        <td style="padding:6px 8px;border:1px solid #ddd">${reg.noRegistrasi}</td>
        <td style="padding:6px 8px;border:1px solid #ddd">${reg.nama}</td>
        <td style="padding:6px 8px;border:1px solid #ddd">${reg.nisn}</td>
        <td style="padding:6px 8px;border:1px solid #ddd">${reg.subJalur}</td>
        <td style="padding:6px 8px;border:1px solid #ddd">${reg.namaSekolahPilihan}</td>
        <td style="padding:6px 8px;border:1px solid #ddd">${reg.jurusan}</td>
        <td style="padding:6px 8px;border:1px solid #ddd">${reg.tanggalVerif || '-'}</td>
      </tr>
    `).join('')
    printWindow.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
      <style>body{font-family:Arial,sans-serif;margin:20px}table{width:100%;border-collapse:collapse}th{background:#f5f5f5;padding:8px;border:1px solid #ddd;text-align:left}h1{text-align:center;font-size:18px}h2{text-align:center;font-size:14px;color:#666}</style></head>
      <body><h1>${title}</h1><h2>SPMB 2026</h2><p style="text-align:center;color:#888">Dicetak pada: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      <table><thead><tr><th>No</th><th>No. Registrasi</th><th>Nama</th><th>NISN</th><th>Sub Jalur</th><th>Sekolah Pilihan</th><th>Jurusan</th><th>Tanggal Verif</th></tr></thead><tbody>${rows}</tbody></table></body></html>`)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <ErrorBoundary>
      {/* Elegant Header */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 p-4 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold tracking-wide">LAPORAN PESERTA DITERIMA</h2>
              <p className="text-emerald-100 mt-0.5 sm:mt-1 text-xs sm:text-sm">SPMB 2026 — Sistem Verifikasi Penerimaan Peserta Didik Baru</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30" onClick={handleExportExcel}>
                <FileDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> <span className="text-xs sm:text-sm">Excel</span>
              </Button>
              <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30" onClick={handlePrintReport}>
                <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> <span className="text-xs sm:text-sm">Cetak</span>
              </Button>
            </div>
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
              {stats?.verifiedBySubJalur.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <Badge variant="outline" className={`${SUB_JALUR_COLORS[item.name] || 'bg-gray-100 text-gray-800'} min-w-[130px] justify-center text-xs`}>
                    {item.name}
                  </Badge>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 relative overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: stats?.verified ? `${(item.count / stats.verified) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 min-w-[40px] text-right">{item.count}</span>
                </div>
              ))}
              {(!stats?.verifiedBySubJalur || stats.verifiedBySubJalur.length === 0) && (
                <p className="text-xs text-gray-400 text-center py-2">Belum ada data</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter className="w-4 h-4" /> Filter:
            </div>
            <Select value={diterimaFilterJalur} onValueChange={setDiterimaFilterJalur}>
              <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Sub Jalur" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jalur</SelectItem>
                {subJalurOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Select value={diterimaFilterSekolah} onValueChange={setDiterimaFilterSekolah}>
              <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Sekolah Asal" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Sekolah</SelectItem>
                {stats?.verifiedBySekolah.map((item) => (
                  <SelectItem key={item.name} value={item.name}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="sm:ml-auto text-sm text-gray-500">
              Menampilkan {getFilteredList().length} dari {stats?.verified || 0} peserta
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ListChecks className="w-5 h-5 text-emerald-600" />
            Daftar Peserta Diterima
          </CardTitle>
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
                  const filtered = getFilteredList()
                  const sorted = [...filtered].sort((a, b) => {
                    if (namaSortDiterima === 'asc') return (a.nama || '').localeCompare(b.nama || '')
                    if (namaSortDiterima === 'desc') return (b.nama || '').localeCompare(a.nama || '')
                    return 0
                  })
                  return sorted.length > 0 ? sorted.map((reg, idx) => (
                    <TableRow key={reg.id} className="hover:bg-emerald-50/30">
                      <TableCell className="text-center text-sm text-gray-500">{idx + 1}</TableCell>
                      <TableCell className="font-mono text-sm">{reg.noRegistrasi}</TableCell>
                      <TableCell className="font-medium">{reg.nama}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-gray-500">{reg.nisn}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={SUB_JALUR_COLORS[reg.subJalur] || 'bg-gray-100 text-gray-800'}>
                          {reg.subJalur}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">{reg.namaSekolahAsal}</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-gray-500">
                        {reg.tanggalVerif || (reg.updatedAt ? new Date(reg.updatedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => onViewDetail(reg)} title="Lihat Detail">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-white hover:bg-blue-600" title="Edit Data" onClick={() => onEdit(reg)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-white hover:bg-red-600" title="Hapus Data" onClick={() => onDelete(reg)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <UserCheck className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                        <p className="text-gray-500 font-medium">Belum ada pendaftar yang diterima</p>
                        <p className="text-sm text-gray-400">Verifikasi pendaftar untuk menerimanya</p>
                      </TableCell>
                    </TableRow>
                  )
                })()}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </ErrorBoundary>
  )
}
