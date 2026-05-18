'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import {
  Upload,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  GraduationCap,
  School,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Trash2,
  Eye,
} from 'lucide-react'

interface Registration {
  id: string
  noRegistrasi: string
  nama: string
  nisn: string
  subJalur: string
  npsnSekolahPilihan: string
  namaSekolahPilihan: string
  jurusan: string
  npsnSekolahAsal: string
  namaSekolahAsal: string
  status: string
  waktuDaftar: string
  verificationStatus: string
  verificationNote: string | null
  createdAt: string
  updatedAt: string
}

interface DashboardStats {
  total: number
  verified: number
  rejected: number
  pending: number
  bySubJalur: { name: string; count: number }[]
  bySekolahPilihan: { name: string; count: number }[]
  byJurusan: { name: string; count: number }[]
  byStatus: { name: string; count: number }[]
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  VERIFIED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
}

const SUB_JALUR_COLORS: Record<string, string> = {
  'Domisili': 'bg-sky-100 text-sky-800 border-sky-200',
  'Keluarga Tidak Mampu': 'bg-orange-100 text-orange-800 border-orange-200',
  'Anak Guru': 'bg-violet-100 text-violet-800 border-violet-200',
  'Prestasi': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Zonasi': 'bg-pink-100 text-pink-800 border-pink-200',
}

export default function Home() {
  const { toast } = useToast()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0,
  })

  // Filters
  const [search, setSearch] = useState('')
  const [subJalurFilter, setSubJalurFilter] = useState('all')
  const [verificationFilter, setVerificationFilter] = useState('all')
  const [sekolahFilter, setSekolahFilter] = useState('all')
  const [jurusanFilter, setJurusanFilter] = useState('all')

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Dialogs
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [bulkVerifyDialogOpen, setBulkVerifyDialogOpen] = useState(false)

  // Verify dialog state
  const [verifyAction, setVerifyAction] = useState<'VERIFIED' | 'REJECTED'>('VERIFIED')
  const [verifyNote, setVerifyNote] = useState('')
  const [verifyTargetId, setVerifyTargetId] = useState<string | null>(null)

  // Detail dialog state
  const [detailTarget, setDetailTarget] = useState<Registration | null>(null)

  // Loading states
  const [importing, setImporting] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [loading, setLoading] = useState(false)

  // CSV file
  const [csvFile, setCsvFile] = useState<File | null>(null)

  const fetchRegistrations = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', pagination.page.toString())
      params.set('limit', pagination.limit.toString())
      if (search) params.set('search', search)
      if (subJalurFilter !== 'all') params.set('subJalur', subJalurFilter)
      if (verificationFilter !== 'all') params.set('verificationStatus', verificationFilter)
      if (sekolahFilter !== 'all') params.set('sekolahPilihan', sekolahFilter)
      if (jurusanFilter !== 'all') params.set('jurusan', jurusanFilter)

      const res = await fetch(`/api/registrations?${params}`)
      const data = await res.json()
      setRegistrations(data.data || [])
      setPagination(prev => ({ ...prev, ...data.pagination }))
    } catch {
      toast({ title: 'Error', description: 'Gagal memuat data pendaftar', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, search, subJalurFilter, verificationFilter, sekolahFilter, jurusanFilter, toast])

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard')
      const data = await res.json()
      setStats(data)
    } catch {
      toast({ title: 'Error', description: 'Gagal memuat statistik', variant: 'destructive' })
    }
  }, [toast])

  useEffect(() => {
    fetchRegistrations()
  }, [fetchRegistrations])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const parseCSVClientSide = (text: string) => {
    const lines = text.trim().split('\n')
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim())
    const rows: Record<string, string>[] = []

    for (let i = 1; i < lines.length; i++) {
      const values: string[] = []
      let current = ''
      let inQuotes = false

      for (const char of lines[i]) {
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      values.push(current.trim())

      if (values.length === headers.length) {
        const row: Record<string, string> = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        rows.push(row)
      }
    }

    return rows
  }

  const handleImport = async () => {
    if (!csvFile) return

    setImporting(true)
    try {
      const text = await csvFile.text()
      const csvRows = parseCSVClientSide(text)

      if (csvRows.length === 0) {
        throw new Error('File CSV kosong atau format tidak valid')
      }

      const mappedRows = csvRows.map(row => ({
        noRegistrasi: row['No.Registrasi'] || '',
        nama: row['Nama'] || '',
        nisn: row['NISN'] || '',
        subJalur: row['Sub Jalur'] || '',
        npsnSekolahPilihan: row['NPSN Sekolah Pilihan'] || '',
        namaSekolahPilihan: row['Nama Sekolah Pilihan'] || '',
        jurusan: row['Jurusan'] || '',
        npsnSekolahAsal: row['NPSN Sekolah Asal'] || '',
        namaSekolahAsal: row['Nama Sekolah Asal'] || '',
        status: row['Status'] || 'ON PROGRESS',
        waktuDaftar: row['Waktu Daftar'] || '',
      }))

      const importRes = await fetch('/api/registrations/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: mappedRows }),
      })

      const importData = await importRes.json()

      if (importData.success) {
        toast({
          title: 'Import Berhasil',
          description: `${importData.imported} data diimpor, ${importData.skipped} dilewati`,
        })
        setImportDialogOpen(false)
        setCsvFile(null)
        fetchRegistrations()
        fetchStats()
      } else {
        toast({
          title: 'Import Gagal',
          description: importData.error || 'Terjadi kesalahan',
          variant: 'destructive',
        })
      }
    } catch (err) {
      toast({
        title: 'Import Gagal',
        description: err instanceof Error ? err.message : 'Terjadi kesalahan',
        variant: 'destructive',
      })
    } finally {
      setImporting(false)
    }
  }

  const handleVerify = async () => {
    if (!verifyTargetId) return

    setVerifying(true)
    try {
      const res = await fetch('/api/registrations/verify', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: verifyTargetId,
          verificationStatus: verifyAction,
          verificationNote: verifyNote || undefined,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Verifikasi Berhasil',
          description: `Pendaftar ${verifyAction === 'VERIFIED' ? 'diverifikasi' : 'ditolak'}`,
        })
        setVerifyDialogOpen(false)
        setVerifyNote('')
        setVerifyTargetId(null)
        fetchRegistrations()
        fetchStats()
      } else {
        toast({
          title: 'Verifikasi Gagal',
          description: data.error || 'Terjadi kesalahan',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Verifikasi Gagal',
        description: 'Terjadi kesalahan',
        variant: 'destructive',
      })
    } finally {
      setVerifying(false)
    }
  }

  const handleBulkVerify = async () => {
    if (selectedIds.size === 0) return

    setVerifying(true)
    try {
      const res = await fetch('/api/registrations/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          verificationStatus: verifyAction,
          verificationNote: verifyNote || undefined,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Verifikasi Massal Berhasil',
          description: `${data.updated} pendaftar ${verifyAction === 'VERIFIED' ? 'diverifikasi' : 'ditolak'}`,
        })
        setBulkVerifyDialogOpen(false)
        setVerifyNote('')
        setSelectedIds(new Set())
        fetchRegistrations()
        fetchStats()
      } else {
        toast({
          title: 'Verifikasi Gagal',
          description: data.error || 'Terjadi kesalahan',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Verifikasi Gagal',
        description: 'Terjadi kesalahan',
        variant: 'destructive',
      })
    } finally {
      setVerifying(false)
    }
  }

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

  const verificationPercent = stats
    ? stats.total > 0
      ? Math.round(((stats.verified + stats.rejected) / stats.total) * 100)
      : 0
    : 0

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-600 text-white">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">SPMB 2026</h1>
                <p className="text-xs text-gray-500">Sistem Verifikasi Pendaftaran</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setImportDialogOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Import CSV</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard" className="gap-1.5">
              <Eye className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-1.5">
              <FileSpreadsheet className="w-4 h-4" />
              Data Pendaftar
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-emerald-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Pendaftar</p>
                      <p className="text-2xl font-bold">{stats?.total || 0}</p>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <Users className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Menunggu</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</p>
                    </div>
                    <div className="p-2 bg-yellow-50 rounded-lg">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Terverifikasi</p>
                      <p className="text-2xl font-bold text-blue-600">{stats?.verified || 0}</p>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Ditolak</p>
                      <p className="text-2xl font-bold text-red-600">{stats?.rejected || 0}</p>
                    </div>
                    <div className="p-2 bg-red-50 rounded-lg">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Progres Verifikasi</CardTitle>
                <CardDescription>
                  {verificationPercent}% pendaftar telah diverifikasi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={verificationPercent} className="h-3" />
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>{stats?.verified || 0} diverifikasi</span>
                  <span>{stats?.rejected || 0} ditolak</span>
                  <span>{stats?.pending || 0} menunggu</span>
                </div>
              </CardContent>
            </Card>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* By Sub Jalur */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Berdasarkan Sub Jalur
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.bySubJalur.map((item) => (
                      <div key={item.name} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-gray-500">{item.count} pendaftar</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div
                            className="h-2.5 rounded-full bg-emerald-500 transition-all duration-500"
                            style={{
                              width: stats?.total
                                ? `${(item.count / stats.total) * 100}%`
                                : '0%',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    {(!stats?.bySubJalur || stats.bySubJalur.length === 0) && (
                      <p className="text-sm text-gray-400 text-center py-4">Belum ada data</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* By Sekolah Pilihan */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <School className="w-4 h-4" />
                    Berdasarkan Sekolah Pilihan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {stats?.bySekolahPilihan.map((item) => (
                      <div key={item.name} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium truncate mr-2">{item.name}</span>
                          <span className="text-gray-500 shrink-0">{item.count}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div
                            className="h-2.5 rounded-full bg-sky-500 transition-all duration-500"
                            style={{
                              width: stats?.total
                                ? `${(item.count / stats.total) * 100}%`
                                : '0%',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    {(!stats?.bySekolahPilihan || stats.bySekolahPilihan.length === 0) && (
                      <p className="text-sm text-gray-400 text-center py-4">Belum ada data</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* By Jurusan */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Berdasarkan Jurusan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.byJurusan.map((item) => (
                      <div key={item.name} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-gray-500">{item.count} pendaftar</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div
                            className="h-2.5 rounded-full bg-violet-500 transition-all duration-500"
                            style={{
                              width: stats?.total
                                ? `${(item.count / stats.total) * 100}%`
                                : '0%',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    {(!stats?.byJurusan || stats.byJurusan.length === 0) && (
                      <p className="text-sm text-gray-400 text-center py-4">Belum ada data</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Verification Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Status Verifikasi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-emerald-700">Terverifikasi</span>
                          <span className="text-sm text-gray-500">{stats?.verified || 0}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3">
                          <div
                            className="h-3 rounded-full bg-emerald-500 transition-all duration-500"
                            style={{
                              width: stats?.total
                                ? `${(stats.verified / stats.total) * 100}%`
                                : '0%',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-red-700">Ditolak</span>
                          <span className="text-sm text-gray-500">{stats?.rejected || 0}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3">
                          <div
                            className="h-3 rounded-full bg-red-500 transition-all duration-500"
                            style={{
                              width: stats?.total
                                ? `${(stats.rejected / stats.total) * 100}%`
                                : '0%',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-yellow-700">Menunggu</span>
                          <span className="text-sm text-gray-500">{stats?.pending || 0}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3">
                          <div
                            className="h-3 rounded-full bg-yellow-500 transition-all duration-500"
                            style={{
                              width: stats?.total
                                ? `${(stats.pending / stats.total) * 100}%`
                                : '0%',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Cari nama, no. registrasi, atau NISN..."
                      className="pl-9"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value)
                        setPagination(prev => ({ ...prev, page: 1 }))
                      }}
                    />
                  </div>
                  <Select
                    value={subJalurFilter}
                    onValueChange={(v) => {
                      setSubJalurFilter(v)
                      setPagination(prev => ({ ...prev, page: 1 }))
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Sub Jalur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Jalur</SelectItem>
                      <SelectItem value="Domisili">Domisili</SelectItem>
                      <SelectItem value="Keluarga Tidak Mampu">Keluarga Tidak Mampu</SelectItem>
                      <SelectItem value="Anak Guru">Anak Guru</SelectItem>
                      <SelectItem value="Prestasi">Prestasi</SelectItem>
                      <SelectItem value="Zonasi">Zonasi</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={verificationFilter}
                    onValueChange={(v) => {
                      setVerificationFilter(v)
                      setPagination(prev => ({ ...prev, page: 1 }))
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Status Verifikasi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="PENDING">Menunggu</SelectItem>
                      <SelectItem value="VERIFIED">Terverifikasi</SelectItem>
                      <SelectItem value="REJECTED">Ditolak</SelectItem>
                    </SelectContent>
                  </Select>
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
                        <CheckCircle2 className="w-4 h-4" />
                        Verifikasi ({selectedIds.size})
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setVerifyAction('REJECTED')
                          setBulkVerifyDialogOpen(true)
                        }}
                      >
                        <XCircle className="w-4 h-4" />
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
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/80">
                        <TableHead className="w-12">
                          <Checkbox
                            checked={registrations.length > 0 && selectedIds.size === registrations.length}
                            onCheckedChange={toggleSelectAll}
                          />
                        </TableHead>
                        <TableHead>No. Reg</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead className="hidden md:table-cell">NISN</TableHead>
                        <TableHead>Sub Jalur</TableHead>
                        <TableHead className="hidden lg:table-cell">Sekolah Pilihan</TableHead>
                        <TableHead className="hidden lg:table-cell">Jurusan</TableHead>
                        <TableHead>Status Verifikasi</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                            <p className="text-sm text-gray-400 mt-2">Memuat data...</p>
                          </TableCell>
                        </TableRow>
                      ) : registrations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-12">
                            <FileSpreadsheet className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                            <p className="text-gray-500 font-medium">Belum ada data pendaftar</p>
                            <p className="text-sm text-gray-400">
                              Import CSV untuk memulai verifikasi
                            </p>
                            <Button
                              className="mt-3 bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => setImportDialogOpen(true)}
                            >
                              <Upload className="w-4 h-4" />
                              Import CSV
                            </Button>
                          </TableCell>
                        </TableRow>
                      ) : (
                        registrations.map((reg) => (
                          <TableRow key={reg.id} className={selectedIds.has(reg.id) ? 'bg-emerald-50/50' : ''}>
                            <TableCell>
                              <Checkbox
                                checked={selectedIds.has(reg.id)}
                                onCheckedChange={() => toggleSelect(reg.id)}
                              />
                            </TableCell>
                            <TableCell className="font-mono text-sm">{reg.noRegistrasi}</TableCell>
                            <TableCell className="font-medium">{reg.nama}</TableCell>
                            <TableCell className="hidden md:table-cell text-sm text-gray-500">{reg.nisn}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={SUB_JALUR_COLORS[reg.subJalur] || 'bg-gray-100 text-gray-800 border-gray-200'}
                              >
                                {reg.subJalur}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-sm">{reg.namaSekolahPilihan}</TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Badge variant="secondary">{reg.jurusan}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={STATUS_COLORS[reg.verificationStatus]}
                              >
                                {reg.verificationStatus === 'PENDING' && <Clock className="w-3 h-3" />}
                                {reg.verificationStatus === 'VERIFIED' && <CheckCircle2 className="w-3 h-3" />}
                                {reg.verificationStatus === 'REJECTED' && <XCircle className="w-3 h-3" />}
                                {reg.verificationStatus === 'PENDING' ? 'Menunggu' :
                                 reg.verificationStatus === 'VERIFIED' ? 'Terverifikasi' : 'Ditolak'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setDetailTarget(reg)
                                    setDetailDialogOpen(true)
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {reg.verificationStatus !== 'VERIFIED' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                    onClick={() => {
                                      setVerifyTargetId(reg.id)
                                      setVerifyAction('VERIFIED')
                                      setVerifyNote('')
                                      setVerifyDialogOpen(true)
                                    }}
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </Button>
                                )}
                                {reg.verificationStatus !== 'REJECTED' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => {
                                      setVerifyTargetId(reg.id)
                                      setVerifyAction('REJECTED')
                                      setVerifyNote('')
                                      setVerifyDialogOpen(true)
                                    }}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <p className="text-sm text-gray-500">
                      Menampilkan {(pagination.page - 1) * pagination.limit + 1}-
                      {Math.min(pagination.page * pagination.limit, pagination.total)} dari{' '}
                      {pagination.total} pendaftar
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page <= 1}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-gray-600">
                        Hal {pagination.page} / {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-sm text-gray-500">
              © 2026 SPMB Verifikasi System
            </p>
            <p className="text-xs text-gray-400">
              Sistem Verifikasi Penerimaan Peserta Didik Baru
            </p>
          </div>
        </div>
      </footer>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-600" />
              Import Data CSV
            </DialogTitle>
            <DialogDescription>
              Import data pendaftar dari file CSV. Format harus sesuai template SPMB 2026.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center hover:border-emerald-400 transition-colors cursor-pointer"
              onClick={() => document.getElementById('csv-upload')?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                const file = e.dataTransfer.files[0]
                if (file && file.name.endsWith('.csv')) {
                  setCsvFile(file)
                }
              }}
            >
              <FileSpreadsheet className="w-10 h-10 mx-auto text-gray-400 mb-3" />
              {csvFile ? (
                <div>
                  <p className="font-medium text-emerald-700">{csvFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(csvFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-gray-700">
                    Klik atau seret file CSV ke sini
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Format: No.Registrasi, Nama, NISN, Sub Jalur, dll.
                  </p>
                </div>
              )}
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setCsvFile(file)
                }}
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-sm text-amber-700">
                  <p className="font-medium">Format CSV yang diharapkan:</p>
                  <p className="mt-1">
                    No.Registrasi, Nama, NISN, Sub Jalur, NPSN Sekolah Pilihan,
                    Nama Sekolah Pilihan, Jurusan, NPSN Sekolah Asal,
                    Nama Sekolah Asal, Status, Waktu Daftar
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleImport}
              disabled={!csvFile || importing}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengimport...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Import
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Single Verify Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {verifyAction === 'VERIFIED' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              {verifyAction === 'VERIFIED' ? 'Verifikasi Pendaftar' : 'Tolak Pendaftar'}
            </DialogTitle>
            <DialogDescription>
              {verifyAction === 'VERIFIED'
                ? 'Apakah Anda yakin ingin memverifikasi pendaftar ini?'
                : 'Apakah Anda yakin ingin menolak pendaftar ini?'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              placeholder="Catatan verifikasi (opsional)..."
              value={verifyNote}
              onChange={(e) => setVerifyNote(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleVerify}
              disabled={verifying}
              className={verifyAction === 'VERIFIED' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              variant={verifyAction === 'REJECTED' ? 'destructive' : 'default'}
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : verifyAction === 'VERIFIED' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Verifikasi
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Tolak
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Verify Dialog */}
      <Dialog open={bulkVerifyDialogOpen} onOpenChange={setBulkVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {verifyAction === 'VERIFIED' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              {verifyAction === 'VERIFIED'
                ? `Verifikasi ${selectedIds.size} Pendaftar`
                : `Tolak ${selectedIds.size} Pendaftar`}
            </DialogTitle>
            <DialogDescription>
              {verifyAction === 'VERIFIED'
                ? `Apakah Anda yakin ingin memverifikasi ${selectedIds.size} pendaftar yang dipilih?`
                : `Apakah Anda yakin ingin menolak ${selectedIds.size} pendaftar yang dipilih?`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              placeholder="Catatan verifikasi untuk semua pendaftar (opsional)..."
              value={verifyNote}
              onChange={(e) => setVerifyNote(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkVerifyDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleBulkVerify}
              disabled={verifying}
              className={verifyAction === 'VERIFIED' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              variant={verifyAction === 'REJECTED' ? 'destructive' : 'default'}
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : verifyAction === 'VERIFIED' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Verifikasi Semua
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Tolak Semua
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Detail Pendaftar
            </DialogTitle>
            <DialogDescription>
              Informasi lengkap pendaftar SPMB 2026
            </DialogDescription>
          </DialogHeader>

          {detailTarget && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 font-medium">No. Registrasi</label>
                  <p className="text-sm font-mono font-medium">{detailTarget.noRegistrasi}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">NISN</label>
                  <p className="text-sm font-mono">{detailTarget.nisn}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 font-medium">Nama Lengkap</label>
                  <p className="text-sm font-semibold">{detailTarget.nama}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Sub Jalur</label>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className={SUB_JALUR_COLORS[detailTarget.subJalur] || 'bg-gray-100 text-gray-800'}
                    >
                      {detailTarget.subJalur}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Jurusan</label>
                  <div className="mt-1">
                    <Badge variant="secondary">{detailTarget.jurusan}</Badge>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Sekolah Pilihan</h4>
                <div className="bg-sky-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-sky-800">{detailTarget.namaSekolahPilihan}</p>
                  <p className="text-xs text-sky-600">NPSN: {detailTarget.npsnSekolahPilihan}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Sekolah Asal</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium">{detailTarget.namaSekolahAsal}</p>
                  <p className="text-xs text-gray-500">NPSN: {detailTarget.npsnSekolahAsal}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Status Pendaftaran</label>
                    <div className="mt-1">
                      <Badge variant="outline">{detailTarget.status}</Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Status Verifikasi</label>
                    <div className="mt-1">
                      <Badge
                        variant="outline"
                        className={STATUS_COLORS[detailTarget.verificationStatus]}
                      >
                        {detailTarget.verificationStatus === 'PENDING' ? 'Menunggu' :
                         detailTarget.verificationStatus === 'VERIFIED' ? 'Terverifikasi' : 'Ditolak'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Waktu Daftar</label>
                    <p className="text-sm">{detailTarget.waktuDaftar}</p>
                  </div>
                  {detailTarget.verificationNote && (
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 font-medium">Catatan Verifikasi</label>
                      <p className="text-sm mt-1 bg-yellow-50 p-2 rounded border border-yellow-200">
                        {detailTarget.verificationNote}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {detailTarget.verificationStatus !== 'VERIFIED' && (
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      setVerifyTargetId(detailTarget.id)
                      setVerifyAction('VERIFIED')
                      setVerifyNote('')
                      setDetailDialogOpen(false)
                      setVerifyDialogOpen(true)
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Verifikasi
                  </Button>
                )}
                {detailTarget.verificationStatus !== 'REJECTED' && (
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      setVerifyTargetId(detailTarget.id)
                      setVerifyAction('REJECTED')
                      setVerifyNote('')
                      setDetailDialogOpen(false)
                      setVerifyDialogOpen(true)
                    }}
                  >
                    <XCircle className="w-4 h-4" />
                    Tolak
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
