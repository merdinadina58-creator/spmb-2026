'use client'

import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  FileSpreadsheet,
  Loader2,
  Trash2,
  Eye,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Upload,
  ArrowUpDown,
  ArrowUpAZ,
  ArrowDownAZ,
  School,
  ClipboardPaste,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import type { Registration, PaginationInfo } from '@/lib/types'
import { STATUS_COLORS, SUB_JALUR_COLORS } from '@/lib/constants'

interface DataPendaftarTabProps {
  search: string
  setSearch: (v: string) => void
  subJalurFilter: string
  setSubJalurFilter: (v: string) => void
  verificationFilter: string
  setVerificationFilter: (v: string) => void
  jurusanFilter: string
  setJurusanFilter: (v: string) => void
  registrations: Registration[]
  pagination: PaginationInfo
  setPagination: (v: PaginationInfo | ((prev: PaginationInfo) => PaginationInfo)) => void
  selectedIds: Set<string>
  setSelectedIds: (v: Set<string>) => void
  loading: boolean
  namaSortData: 'none' | 'asc' | 'desc'
  setNamaSortData: (v: 'none' | 'asc' | 'desc') => void
  groupBySekolah: boolean
  setGroupBySekolah: (v: boolean) => void
  subJalurOptions: Array<{ label: string; value: string }>
  dataLimit: number
  setDataLimit: (v: number) => void
  setImportDialogOpen: (v: boolean) => void
  setSumutBerkahOpen: (v: boolean) => void
  checkDuplicates: () => void
  setVerifyAction: (v: 'VERIFIED' | 'REJECTED') => void
  setBulkVerifyDialogOpen: (v: boolean) => void
  setVerifyTargetId: (v: string | null) => void
  setVerifyNote: (v: string) => void
  setVerifyDialogOpen: (v: boolean) => void
  setDetailTarget: (v: Registration | null) => void
  setDetailDialogOpen: (v: boolean) => void
  openEditDialog: (reg: Registration) => void
  openDeleteDialog: (reg: Registration) => void
}

export default function DataPendaftarTab(props: DataPendaftarTabProps) {
  const {
    search, setSearch,
    subJalurFilter, setSubJalurFilter,
    verificationFilter, setVerificationFilter,
    registrations, pagination, setPagination,
    selectedIds, setSelectedIds,
    loading, namaSortData, setNamaSortData,
    groupBySekolah, setGroupBySekolah,
    subJalurOptions, dataLimit, setDataLimit,
    setImportDialogOpen, setSumutBerkahOpen, checkDuplicates,
    setVerifyAction, setBulkVerifyDialogOpen,
    setVerifyTargetId, setVerifyNote, setVerifyDialogOpen,
    setDetailTarget, setDetailDialogOpen,
    openEditDialog, openDeleteDialog,
  } = props

  const toggleSelectAll = () => {
    if (selectedIds.size === registrations.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(registrations.map(r => r.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedIds(next)
  }

  return (
    <>
      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari nama, NISN..."
                className="pl-9 h-9 sm:h-10 text-sm"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
              />
            </div>
            <div className="grid grid-cols-2 sm:flex gap-2">
              <Select
                value={subJalurFilter}
                onValueChange={(v) => {
                  setSubJalurFilter(v)
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px] h-9 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="Sub Jalur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jalur</SelectItem>
                  {subJalurOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={verificationFilter}
                onValueChange={(v) => {
                  setVerificationFilter(v)
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px] h-9 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="PENDING">Menunggu</SelectItem>
                  <SelectItem value="VERIFIED">Diterima</SelectItem>
                  <SelectItem value="REJECTED">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Tampilkan:</span>
              <Select value={dataLimit.toString()} onValueChange={(val) => {
                const newLimit = val === 'all' ? 9999 : parseInt(val)
                setDataLimit(newLimit)
                setPagination(prev => ({ ...prev, page: 1, limit: newLimit }))
              }}>
                <SelectTrigger className="w-24 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="all">Semua</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={checkDuplicates}
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Cek Duplikat</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSumutBerkahOpen(true)}
              className="border-teal-300 text-teal-700 hover:bg-teal-50"
            >
              <ClipboardPaste className="w-4 h-4" />
              <span className="hidden sm:inline">Paste Sumut Berkah</span>
            </Button>
            {selectedIds.size > 0 && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    setVerifyAction('VERIFIED')
                    setBulkVerifyDialogOpen(true)
                  }}
                >
                  <ThumbsUp className="w-4 h-4" />
                  Terima ({selectedIds.size})
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setVerifyAction('REJECTED')
                    setBulkVerifyDialogOpen(true)
                  }}
                >
                  <ThumbsDown className="w-4 h-4" />
                  Tolak ({selectedIds.size})
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedIds(new Set())}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-white">
                <TableRow className="bg-gray-50/80">
                  <TableHead className="w-10 text-center">No</TableHead>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={registrations.length > 0 && selectedIds.size === registrations.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>No. Reg</TableHead>
                  <TableHead>Nama
                    <span className="ml-1 cursor-pointer inline-flex align-middle" onClick={() => setNamaSortData(namaSortData === 'none' ? 'asc' : namaSortData === 'asc' ? 'desc' : 'none')}>
                      {namaSortData === 'none' ? <ArrowUpDown className="w-3 h-3 text-gray-400" /> : namaSortData === 'asc' ? <ArrowUpAZ className="w-3 h-3 text-emerald-600" /> : <ArrowDownAZ className="w-3 h-3 text-emerald-600" />}
                    </span>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">NISN</TableHead>
                  <TableHead>Sub Jalur</TableHead>
                  <TableHead className="hidden lg:table-cell">Sekolah Asal
                    <span className="ml-1 cursor-pointer inline-flex align-middle" onClick={() => setGroupBySekolah(!groupBySekolah)} title={groupBySekolah ? 'Kembali ke tampilan normal' : 'Kelompokkan per sekolah'}>
                      {groupBySekolah ? <ChevronDown className="w-3 h-3 text-emerald-600" /> : <ChevronUp className="w-3 h-3 text-gray-400" />}
                    </span>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                      <p className="text-sm text-gray-400 mt-2">Memuat data...</p>
                    </TableCell>
                  </TableRow>
                ) : registrations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12">
                      <FileSpreadsheet className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500 font-medium">Belum ada data pendaftar</p>
                      <p className="text-sm text-gray-400">Import CSV untuk memulai verifikasi</p>
                      <Button className="mt-3 bg-emerald-600 hover:bg-emerald-700" onClick={() => setImportDialogOpen(true)}>
                        <Upload className="w-4 h-4" />
                        Import CSV
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  (() => {
                    const sorted = [...registrations].sort((a, b) => {
                      if (namaSortData === 'asc') return (a.nama || '').localeCompare(b.nama || '')
                      if (namaSortData === 'desc') return (b.nama || '').localeCompare(a.nama || '')
                      return 0
                    })

                    if (!groupBySekolah) {
                      return sorted.map((reg, idx) => (
                        <TableRow key={`data-${reg.id}-${idx}`} className={
                          reg.verificationStatus === 'VERIFIED' ? 'bg-emerald-50/40' :
                          reg.verificationStatus === 'REJECTED' ? 'bg-red-50/40' : ''
                        }>
                          <TableCell className="text-center text-sm text-gray-500">
                            {(pagination.page - 1) * pagination.limit + idx + 1}
                          </TableCell>
                          <TableCell>
                            <Checkbox checked={selectedIds.has(reg.id)} onCheckedChange={() => toggleSelect(reg.id)} />
                          </TableCell>
                          <TableCell className="font-mono text-sm">{reg.noRegistrasi}</TableCell>
                          <TableCell className="font-medium">{reg.nama}</TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-gray-500">{reg.nisn}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={SUB_JALUR_COLORS[reg.subJalur] || 'bg-gray-100 text-gray-800 border-gray-200'}>
                              {reg.subJalur}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm">{reg.namaSekolahAsal}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={STATUS_COLORS[reg.verificationStatus]}>
                              {reg.verificationStatus === 'PENDING' && <Clock className="w-3 h-3" />}
                              {reg.verificationStatus === 'VERIFIED' && <CheckCircle2 className="w-3 h-3" />}
                              {reg.verificationStatus === 'REJECTED' && <XCircle className="w-3 h-3" />}
                              {reg.verificationStatus === 'PENDING' ? 'Menunggu' :
                               reg.verificationStatus === 'VERIFIED' ? 'Diterima' : 'Ditolak'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => { setDetailTarget(reg); setDetailDialogOpen(true) }} title="Lihat Detail">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-white hover:bg-blue-600" title="Edit Data" onClick={() => openEditDialog(reg)}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-white hover:bg-red-600" title="Hapus Data" onClick={() => openDeleteDialog(reg)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              {reg.verificationStatus !== 'VERIFIED' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-emerald-600 hover:text-white hover:bg-emerald-600"
                                  title="Terima Pendaftar"
                                  onClick={() => {
                                    setVerifyTargetId(reg.id)
                                    setVerifyAction('VERIFIED')
                                    setVerifyNote('')
                                    setVerifyDialogOpen(true)
                                  }}
                                >
                                  <ThumbsUp className="w-4 h-4" />
                                </Button>
                              )}
                              {reg.verificationStatus !== 'REJECTED' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-white hover:bg-red-600"
                                  title="Tolak Pendaftar"
                                  onClick={() => {
                                    setVerifyTargetId(reg.id)
                                    setVerifyAction('REJECTED')
                                    setVerifyNote('')
                                    setVerifyDialogOpen(true)
                                  }}
                                >
                                  <ThumbsDown className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    }

                    // Grouped by Sekolah Asal
                    const groups: Record<string, typeof sorted> = {}
                    sorted.forEach(reg => {
                      const key = reg.namaSekolahAsal || 'Tidak diketahui'
                      if (!groups[key]) groups[key] = []
                      groups[key].push(reg)
                    })
                    const sortedKeys = Object.keys(groups).sort()
                    let globalIdx = 0
                    return sortedKeys.flatMap(schoolName => {
                      const regs = groups[schoolName]
                      const headerRow = (
                        <TableRow key={`group-${schoolName}`} className="bg-emerald-50/80 hover:bg-emerald-50/80">
                          <TableCell colSpan={9} className="py-2.5">
                            <div className="flex items-center gap-2">
                              <School className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="font-semibold text-sm text-emerald-800">{schoolName}</span>
                              <Badge className="bg-emerald-600 text-white text-[10px] px-1.5 py-0 h-4.5 min-w-[20px] flex items-center justify-center rounded-full">{regs.length}</Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                      const dataRows = regs.map(reg => {
                        globalIdx++
                        return (
                          <TableRow key={`grouped-${reg.id}-${globalIdx}`} className={
                            reg.verificationStatus === 'VERIFIED' ? 'bg-emerald-50/40' :
                            reg.verificationStatus === 'REJECTED' ? 'bg-red-50/40' : ''
                          }>
                            <TableCell className="text-center text-sm text-gray-500">
                              {(pagination.page - 1) * pagination.limit + globalIdx}
                            </TableCell>
                            <TableCell>
                              <Checkbox checked={selectedIds.has(reg.id)} onCheckedChange={() => toggleSelect(reg.id)} />
                            </TableCell>
                            <TableCell className="font-mono text-sm">{reg.noRegistrasi}</TableCell>
                            <TableCell className="font-medium">{reg.nama}</TableCell>
                            <TableCell className="hidden md:table-cell text-sm text-gray-500">{reg.nisn}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={SUB_JALUR_COLORS[reg.subJalur] || 'bg-gray-100 text-gray-800 border-gray-200'}>
                                {reg.subJalur}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-sm">{reg.namaSekolahAsal}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={STATUS_COLORS[reg.verificationStatus]}>
                                {reg.verificationStatus === 'PENDING' && <Clock className="w-3 h-3" />}
                                {reg.verificationStatus === 'VERIFIED' && <CheckCircle2 className="w-3 h-3" />}
                                {reg.verificationStatus === 'REJECTED' && <XCircle className="w-3 h-3" />}
                                {reg.verificationStatus === 'PENDING' ? 'Menunggu' :
                                 reg.verificationStatus === 'VERIFIED' ? 'Diterima' : 'Ditolak'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="sm" onClick={() => { setDetailTarget(reg); setDetailDialogOpen(true) }} title="Lihat Detail">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-white hover:bg-blue-600" title="Edit Data" onClick={() => openEditDialog(reg)}>
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-white hover:bg-red-600" title="Hapus Data" onClick={() => openDeleteDialog(reg)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                                {reg.verificationStatus !== 'VERIFIED' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-emerald-600 hover:text-white hover:bg-emerald-600"
                                    title="Terima Pendaftar"
                                    onClick={() => {
                                      setVerifyTargetId(reg.id)
                                      setVerifyAction('VERIFIED')
                                      setVerifyNote('')
                                      setVerifyDialogOpen(true)
                                    }}
                                  >
                                    <ThumbsUp className="w-4 h-4" />
                                  </Button>
                                )}
                                {reg.verificationStatus !== 'REJECTED' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-white hover:bg-red-600"
                                    title="Tolak Pendaftar"
                                    onClick={() => {
                                      setVerifyTargetId(reg.id)
                                      setVerifyAction('REJECTED')
                                      setVerifyNote('')
                                      setVerifyDialogOpen(true)
                                    }}
                                  >
                                    <ThumbsDown className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                      return [headerRow, ...dataRows]
                    })
                  })()
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-gray-500">
                Menampilkan {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} pendaftar
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600">Hal {pagination.page} / {pagination.totalPages}</span>
                <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
