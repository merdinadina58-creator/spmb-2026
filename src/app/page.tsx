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
import { Separator } from '@/components/ui/separator'
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
  UserCheck,
  UserX,
  ArrowRightLeft,
  ListChecks,
  ThumbsUp,
  ThumbsDown,
  FileText,
  RotateCcw,
  Check,
  MapPin,
  Heart,
  Award,
  BookOpen,
  ClipboardCheck,
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
  verifiedBySubJalur: { name: string; count: number }[]
  verifiedBySekolah: { name: string; count: number }[]
  verifiedByJurusan: { name: string; count: number }[]
  verifiedList: Registration[]
  rejectedBySubJalur: { name: string; count: number }[]
  rejectedBySekolah: { name: string; count: number }[]
  rejectedByJurusan: { name: string; count: number }[]
  rejectedList: Registration[]
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface LembarVerifikasiData {
  registrations: Registration[]
  pagination: PaginationInfo
  stats: {
    total: number
    verified: number
    rejected: number
    pending: number
  }
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  VERIFIED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  REJECTED: 'bg-red-100 text-red-800 border-red-300',
}

const SUB_JALUR_COLORS: Record<string, string> = {
  'Domisili': 'bg-sky-100 text-sky-800 border-sky-200',
  'Keluarga Tidak Mampu': 'bg-orange-100 text-orange-800 border-orange-200',
  'Anak Guru': 'bg-violet-100 text-violet-800 border-violet-200',
  'Prestasi': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Zonasi': 'bg-pink-100 text-pink-800 border-pink-200',
}

// Lembar Verifikasi configuration
const LEMBAR_VERIFIKASI = [
  {
    key: 'domisili',
    label: 'Domisili',
    icon: MapPin,
    subJalurFilter: 'Domisili',
    color: 'sky',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-500',
    headerBg: 'bg-sky-50/80',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
    btnColor: 'bg-sky-600 hover:bg-sky-700',
    description: 'Verifikasi pendaftar jalur Domisili',
  },
  {
    key: 'afirmasi',
    label: 'Afirmasi',
    icon: Heart,
    subJalurFilter: 'Keluarga Tidak Mampu,Anak Guru',
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-500',
    headerBg: 'bg-orange-50/80',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    btnColor: 'bg-orange-600 hover:bg-orange-700',
    description: 'Verifikasi pendaftar jalur Afirmasi (Keluarga Tidak Mampu & Anak Guru)',
    subCategories: ['Keluarga Tidak Mampu', 'Anak Guru'],
  },
  {
    key: 'prestasi',
    label: 'Prestasi Nilai Rapor',
    icon: Award,
    subJalurFilter: 'Prestasi',
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-500',
    headerBg: 'bg-emerald-50/80',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    btnColor: 'bg-emerald-600 hover:bg-emerald-700',
    description: 'Verifikasi pendaftar jalur Prestasi Nilai Rapor',
  },
  {
    key: 'zonasi',
    label: 'Zonasi',
    icon: BookOpen,
    subJalurFilter: 'Zonasi',
    color: 'pink',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-500',
    headerBg: 'bg-pink-50/80',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
    btnColor: 'bg-pink-600 hover:bg-pink-700',
    description: 'Verifikasi pendaftar jalur Zonasi',
  },
]

function StatBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-gray-500">{count} ({total > 0 ? Math.round((count / total) * 100) : 0}%)</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${color}`}
          style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
        />
      </div>
    </div>
  )
}

// Lembar Verifikasi Sheet Component
function LembarVerifikasiSheet({
  config,
  onVerify,
  onBulkVerify,
  onViewDetail,
  toast,
}: {
  config: typeof LEMBAR_VERIFIKASI[number]
  onVerify: (id: string, action: 'VERIFIED' | 'REJECTED') => void
  onBulkVerify: (ids: string[], action: 'VERIFIED' | 'REJECTED') => void
  onViewDetail: (reg: Registration) => void
  toast: ReturnType<typeof useToast>['toast']
}) {
  const [data, setData] = useState<LembarVerifikasiData | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [verificationFilter, setVerificationFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const limit = 20
  const [verifying, setVerifying] = useState(false)
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)
  const [bulkVerifyDialogOpen, setBulkVerifyDialogOpen] = useState(false)
  const [verifyAction, setVerifyAction] = useState<'VERIFIED' | 'REJECTED'>('VERIFIED')
  const [verifyNote, setVerifyNote] = useState('')
  const [verifyTargetId, setVerifyTargetId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', limit.toString())
      params.set('subJalur', config.subJalurFilter)
      if (search) params.set('search', search)
      if (verificationFilter !== 'all') params.set('verificationStatus', verificationFilter)

      const res = await fetch(`/api/registrations?${params}`)
      const result = await res.json()

      const regs: Registration[] = result.data || []
      const pag = result.pagination || { page: 1, limit, total: 0, totalPages: 0 }

      // Calculate stats from current data set
      const statsRes = await fetch('/api/dashboard')
      const statsData = await statsRes.json()

      // Filter stats for this sub jalur
      const jalurNames = config.subJalurFilter.split(',').map(s => s.trim())
      const relevantSubJalurStats = statsData.bySubJalur.filter(
        (item: { name: string; count: number }) => jalurNames.includes(item.name)
      )
      const totalForJalur = relevantSubJalurStats.reduce((acc: number, item: { count: number }) => acc + item.count, 0)

      const relevantVerifiedStats = statsData.verifiedBySubJalur.filter(
        (item: { name: string; count: number }) => jalurNames.includes(item.name)
      )
      const verifiedForJalur = relevantVerifiedStats.reduce((acc: number, item: { count: number }) => acc + item.count, 0)

      const relevantRejectedStats = statsData.rejectedBySubJalur.filter(
        (item: { name: string; count: number }) => jalurNames.includes(item.name)
      )
      const rejectedForJalur = relevantRejectedStats.reduce((acc: number, item: { count: number }) => acc + item.count, 0)

      const pendingForJalur = totalForJalur - verifiedForJalur - rejectedForJalur

      setData({
        registrations: regs,
        pagination: pag,
        stats: {
          total: totalForJalur,
          verified: verifiedForJalur,
          rejected: rejectedForJalur,
          pending: pendingForJalur,
        },
      })
    } catch {
      toast({ title: 'Error', description: 'Gagal memuat data', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [page, search, verificationFilter, config.subJalurFilter, toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

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
      const result = await res.json()
      if (result.success) {
        toast({
          title: verifyAction === 'VERIFIED' ? 'Pendaftar Diterima' : 'Pendaftar Ditolak',
          description: verifyAction === 'VERIFIED' ? 'Data telah diverifikasi dan diterima' : 'Data pendaftar telah ditolak',
        })
        setVerifyDialogOpen(false)
        setVerifyNote('')
        setVerifyTargetId(null)
        fetchData()
      } else {
        toast({ title: 'Gagal', description: result.error || 'Terjadi kesalahan', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Gagal', description: 'Terjadi kesalahan', variant: 'destructive' })
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
      const result = await res.json()
      if (result.success) {
        toast({
          title: verifyAction === 'VERIFIED' ? 'Pendaftar Diterima' : 'Pendaftar Ditolak',
          description: `${result.updated} pendaftar ${verifyAction === 'VERIFIED' ? 'diterima' : 'ditolak'}`,
        })
        setBulkVerifyDialogOpen(false)
        setVerifyNote('')
        setSelectedIds(new Set())
        fetchData()
      } else {
        toast({ title: 'Gagal', description: result.error || 'Terjadi kesalahan', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Gagal', description: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setVerifying(false)
    }
  }

  const toggleSelectAll = () => {
    if (!data) return
    if (selectedIds.size === data.registrations.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(data.registrations.map(r => r.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const Icon = config.icon
  const s = data?.stats || { total: 0, verified: 0, rejected: 0, pending: 0 }
  const verifiedPct = s.total > 0 ? Math.round((s.verified / s.total) * 100) : 0
  const rejectedPct = s.total > 0 ? Math.round((s.rejected / s.total) * 100) : 0
  const pendingPct = s.total > 0 ? Math.round((s.pending / s.total) * 100) : 0
  const progressPct = s.total > 0 ? Math.round(((s.verified + s.rejected) / s.total) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className={`${config.borderColor} border-l-4`}>
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className={`p-3 ${config.iconBg} rounded-xl`}>
              <Icon className={`w-8 h-8 ${config.iconColor}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-gray-900">Lembar Verifikasi: {config.label}</h3>
                {config.subCategories && (
                  <div className="flex gap-1">
                    {config.subCategories.map(sub => (
                      <Badge key={sub} variant="outline" className={SUB_JALUR_COLORS[sub] || 'bg-gray-100 text-gray-800 border-gray-200'}>
                        {sub}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{config.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={`border-l-4 ${config.borderColor}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Pendaftar</p>
                <p className="text-2xl font-bold">{s.total}</p>
              </div>
              <div className={`p-2 ${config.bgColor} rounded-lg`}>
                <Users className={`w-5 h-5 ${config.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Menunggu</p>
                <p className="text-2xl font-bold text-yellow-600">{s.pending}</p>
              </div>
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Diterima</p>
                <p className="text-2xl font-bold text-emerald-600">{s.verified}</p>
              </div>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ditolak</p>
                <p className="text-2xl font-bold text-red-600">{s.rejected}</p>
              </div>
              <div className="p-2 bg-red-50 rounded-lg">
                <UserX className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progres Verifikasi {config.label}</span>
            <span className="text-sm text-gray-500">{progressPct}% selesai</span>
          </div>
          <Progress value={progressPct} className="h-3" />
          <div className="flex justify-between mt-2 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-gray-600">Diterima: {s.verified} ({verifiedPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-gray-600">Ditolak: {s.rejected} ({rejectedPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <span className="text-gray-600">Menunggu: {s.pending} ({pendingPct}%)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters & Search */}
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
                  setPage(1)
                }}
              />
            </div>
            <Select
              value={verificationFilter}
              onValueChange={(v) => {
                setVerificationFilter(v)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status Verifikasi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="PENDING">Menunggu</SelectItem>
                <SelectItem value="VERIFIED">Diterima</SelectItem>
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

      {/* Verification Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className={config.headerBg}>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={data ? data.registrations.length > 0 && selectedIds.size === data.registrations.length : false}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>No. Reg</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead className="hidden md:table-cell">NISN</TableHead>
                  {config.subCategories && <TableHead>Kategori</TableHead>}
                  <TableHead className="hidden lg:table-cell">Sekolah Pilihan</TableHead>
                  <TableHead className="hidden lg:table-cell">Jurusan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={config.subCategories ? 9 : 8} className="text-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                      <p className="text-sm text-gray-400 mt-2">Memuat data...</p>
                    </TableCell>
                  </TableRow>
                ) : !data || data.registrations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={config.subCategories ? 9 : 8} className="text-center py-12">
                      <Icon className={`w-10 h-10 mx-auto text-gray-300 mb-2`} />
                      <p className="text-gray-500 font-medium">Belum ada data pendaftar {config.label}</p>
                      <p className="text-sm text-gray-400">Import CSV untuk memulai verifikasi</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.registrations.map((reg) => (
                    <TableRow key={reg.id} className={
                      reg.verificationStatus === 'VERIFIED' ? 'bg-emerald-50/40' :
                      reg.verificationStatus === 'REJECTED' ? 'bg-red-50/40' : ''
                    }>
                      <TableCell>
                        <Checkbox checked={selectedIds.has(reg.id)} onCheckedChange={() => toggleSelect(reg.id)} />
                      </TableCell>
                      <TableCell className="font-mono text-sm">{reg.noRegistrasi}</TableCell>
                      <TableCell className="font-medium">{reg.nama}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-gray-500">{reg.nisn}</TableCell>
                      {config.subCategories && (
                        <TableCell>
                          <Badge variant="outline" className={SUB_JALUR_COLORS[reg.subJalur] || 'bg-gray-100 text-gray-800 border-gray-200'}>
                            {reg.subJalur}
                          </Badge>
                        </TableCell>
                      )}
                      <TableCell className="hidden lg:table-cell text-sm">{reg.namaSekolahPilihan}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="secondary">{reg.jurusan}</Badge>
                      </TableCell>
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
                          <Button variant="ghost" size="sm" onClick={() => onViewDetail(reg)}>
                            <Eye className="w-4 h-4" />
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
                          {reg.verificationStatus === 'VERIFIED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-yellow-600 hover:text-white hover:bg-yellow-500"
                              title="Kembalikan ke Menunggu"
                              onClick={() => {
                                setVerifyTargetId(reg.id)
                                setVerifyAction('REJECTED')
                                setVerifyNote('')
                                setVerifyDialogOpen(true)
                              }}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          )}
                          {reg.verificationStatus === 'REJECTED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-emerald-600 hover:text-white hover:bg-emerald-600"
                              title="Terima Ulang"
                              onClick={() => {
                                setVerifyTargetId(reg.id)
                                setVerifyAction('VERIFIED')
                                setVerifyNote('')
                                setVerifyDialogOpen(true)
                              }}
                            >
                              <RotateCcw className="w-4 h-4" />
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
          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-gray-500">
                Menampilkan {(data.pagination.page - 1) * data.pagination.limit + 1}-
                {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} dari {data.pagination.total} pendaftar
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600">Hal {page} / {data.pagination.totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= data.pagination.totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Single Verify Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {verifyAction === 'VERIFIED' ? (
                <><ThumbsUp className="w-5 h-5 text-emerald-600" /> Terima Pendaftar</>
              ) : (
                <><ThumbsDown className="w-5 h-5 text-red-600" /> Tolak Pendaftar</>
              )}
            </DialogTitle>
            <DialogDescription>
              {verifyAction === 'VERIFIED'
                ? `Apakah Anda yakin ingin MENERIMA pendaftar ini di jalur ${config.label}?`
                : `Apakah Anda yakin ingin MENOLAK pendaftar ini di jalur ${config.label}?`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {verifyAction === 'REJECTED' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Perhatian!</p>
                    <p className="text-sm text-red-700">Pendaftar yang ditolak tetap dapat diterima kembali nanti.</p>
                  </div>
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                {verifyAction === 'VERIFIED' ? 'Catatan Verifikasi' : 'Alasan Penolakan'}
              </label>
              <Textarea
                placeholder={verifyAction === 'VERIFIED' ? 'Catatan tambahan (opsional)...' : 'Tuliskan alasan penolakan...'}
                value={verifyNote}
                onChange={(e) => setVerifyNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyDialogOpen(false)}>Batal</Button>
            <Button
              onClick={handleVerify}
              disabled={verifying}
              className={verifyAction === 'VERIFIED' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              variant={verifyAction === 'REJECTED' ? 'destructive' : 'default'}
            >
              {verifying ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
              ) : verifyAction === 'VERIFIED' ? (
                <><ThumbsUp className="w-4 h-4" /> Terima</>
              ) : (
                <><ThumbsDown className="w-4 h-4" /> Tolak</>
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
                <><ThumbsUp className="w-5 h-5 text-emerald-600" /> Terima {selectedIds.size} Pendaftar</>
              ) : (
                <><ThumbsDown className="w-5 h-5 text-red-600" /> Tolak {selectedIds.size} Pendaftar</>
              )}
            </DialogTitle>
            <DialogDescription>
              {verifyAction === 'VERIFIED'
                ? `Terima ${selectedIds.size} pendaftar jalur ${config.label} yang dipilih?`
                : `Tolak ${selectedIds.size} pendaftar jalur ${config.label} yang dipilih?`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {verifyAction === 'REJECTED' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Perhatian!</p>
                    <p className="text-sm text-red-700">Pendaftar yang ditolak tetap dapat diterima kembali nanti.</p>
                  </div>
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                {verifyAction === 'VERIFIED' ? 'Catatan Verifikasi' : 'Alasan Penolakan'}
              </label>
              <Textarea
                placeholder={verifyAction === 'VERIFIED' ? 'Catatan untuk semua pendaftar (opsional)...' : 'Alasan penolakan untuk semua...'}
                value={verifyNote}
                onChange={(e) => setVerifyNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkVerifyDialogOpen(false)}>Batal</Button>
            <Button
              onClick={handleBulkVerify}
              disabled={verifying}
              className={verifyAction === 'VERIFIED' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              variant={verifyAction === 'REJECTED' ? 'destructive' : 'default'}
            >
              {verifying ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
              ) : verifyAction === 'VERIFIED' ? (
                <><ThumbsUp className="w-4 h-4" /> Terima Semua</>
              ) : (
                <><ThumbsDown className="w-4 h-4" /> Tolak Semua</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
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

  // Active tab
  const [activeTab, setActiveTab] = useState('dashboard')

  // Lembar verifikasi sub-tab
  const [lembarTab, setLembarTab] = useState('domisili')

  const fetchRegistrations = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', pagination.page.toString())
      params.set('limit', pagination.limit.toString())
      if (search) params.set('search', search)
      if (subJalurFilter !== 'all') params.set('subJalur', subJalurFilter)
      if (verificationFilter !== 'all') params.set('verificationStatus', verificationFilter)
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
  }, [pagination.page, pagination.limit, search, subJalurFilter, verificationFilter, jurusanFilter, toast])

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
          title: verifyAction === 'VERIFIED' ? 'Pendaftar Diterima' : 'Pendaftar Ditolak',
          description: verifyAction === 'VERIFIED'
            ? 'Data pendaftar telah diverifikasi dan diterima'
            : 'Data pendaftar telah ditolak',
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
          title: verifyAction === 'VERIFIED' ? 'Pendaftar Diterima' : 'Pendaftar Ditolak',
          description: `${data.updated} pendaftar ${verifyAction === 'VERIFIED' ? 'diterima' : 'ditolak'}`,
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

  const verifiedPercent = stats && stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0
  const rejectedPercent = stats && stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0
  const pendingPercent = stats && stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0

  // Get pending count per lembar verifikasi for badges
  const getPendingForLembar = (subJalurFilter: string) => {
    if (!stats) return 0
    const jalurNames = subJalurFilter.split(',').map(s => s.trim())
    const relevantPending = stats.bySubJalur
      .filter(item => jalurNames.includes(item.name))
      .reduce((acc, item) => {
        const verified = stats.verifiedBySubJalur.find(v => v.name === item.name)?.count || 0
        const rejected = stats.rejectedBySubJalur.find(r => r.name === item.name)?.count || 0
        return acc + item.count - verified - rejected
      }, 0)
    return relevantPending
  }

  const handleViewDetail = (reg: Registration) => {
    setDetailTarget(reg)
    setDetailDialogOpen(true)
  }

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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="dashboard" className="gap-1.5">
              <Eye className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="lembar-verifikasi" className="gap-1.5 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800">
              <ClipboardCheck className="w-4 h-4" />
              Lembar Verifikasi
              {stats && stats.pending > 0 && (
                <Badge className="ml-1 bg-amber-500 text-white text-xs px-1.5 py-0 min-w-[20px] h-5 flex items-center justify-center">
                  {stats.pending}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-1.5">
              <FileSpreadsheet className="w-4 h-4" />
              Data Pendaftar
            </TabsTrigger>
            <TabsTrigger value="diterima" className="gap-1.5 data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800">
              <ThumbsUp className="w-4 h-4" />
              Diterima
              {stats && stats.verified > 0 && (
                <Badge className="ml-1 bg-emerald-600 text-white text-xs px-1.5 py-0 min-w-[20px] h-5 flex items-center justify-center">
                  {stats.verified}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="ditolak" className="gap-1.5 data-[state=active]:bg-red-100 data-[state=active]:text-red-800">
              <ThumbsDown className="w-4 h-4" />
              Ditolak
              {stats && stats.rejected > 0 && (
                <Badge className="ml-1 bg-red-600 text-white text-xs px-1.5 py-0 min-w-[20px] h-5 flex items-center justify-center">
                  {stats.rejected}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ==================== DASHBOARD TAB ==================== */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-gray-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Pendaftar</p>
                      <p className="text-2xl font-bold">{stats?.total || 0}</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <Users className="w-5 h-5 text-gray-600" />
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

              <Card className="border-l-4 border-l-emerald-500 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('diterima')}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Diterima</p>
                      <p className="text-2xl font-bold text-emerald-600">{stats?.verified || 0}</p>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <UserCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('ditolak')}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Ditolak</p>
                      <p className="text-2xl font-bold text-red-600">{stats?.rejected || 0}</p>
                    </div>
                    <div className="p-2 bg-red-50 rounded-lg">
                      <UserX className="w-5 h-5 text-red-600" />
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
                  {verificationPercent}% pendaftar telah diproses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={verificationPercent} className="h-4" />
                <div className="flex justify-between mt-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-gray-600">Diterima: {stats?.verified || 0} ({verifiedPercent}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-gray-600">Ditolak: {stats?.rejected || 0} ({rejectedPercent}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-gray-600">Menunggu: {stats?.pending || 0} ({pendingPercent}%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Charts Grid */}
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
                      <StatBar key={item.name} label={item.name} count={item.count} total={stats.total} color="bg-emerald-500" />
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
                      <StatBar key={item.name} label={item.name} count={item.count} total={stats.total} color="bg-sky-500" />
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
                      <StatBar key={item.name} label={item.name} count={item.count} total={stats.total} color="bg-violet-500" />
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
                    Ringkasan Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <StatBar label="Diterima (Terverifikasi)" count={stats?.verified || 0} total={stats?.total || 0} color="bg-emerald-500" />
                    <StatBar label="Ditolak" count={stats?.rejected || 0} total={stats?.total || 0} color="bg-red-500" />
                    <StatBar label="Menunggu Verifikasi" count={stats?.pending || 0} total={stats?.total || 0} color="bg-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lembar Verifikasi Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4" />
                  Lembar Verifikasi per Jalur
                </CardTitle>
                <CardDescription>Klik untuk membuka lembar verifikasi masing-masing jalur</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {LEMBAR_VERIFIKASI.map((lv) => {
                    const LvIcon = lv.icon
                    const pendingCount = getPendingForLembar(lv.subJalurFilter)
                    return (
                      <Card
                        key={lv.key}
                        className={`border-2 cursor-pointer hover:shadow-lg transition-all ${lv.borderColor} ${lv.bgColor}`}
                        onClick={() => { setActiveTab('lembar-verifikasi'); setLembarTab(lv.key) }}
                      >
                        <CardContent className="p-4 text-center">
                          <LvIcon className={`w-8 h-8 mx-auto mb-2 ${lv.iconColor}`} />
                          <p className="font-semibold text-gray-900">{lv.label}</p>
                          <p className="text-xs text-gray-500 mt-1">{pendingCount} menunggu verifikasi</p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== LEMBAR VERIFIKASI TAB ==================== */}
          <TabsContent value="lembar-verifikasi" className="space-y-6">
            <Tabs value={lembarTab} onValueChange={setLembarTab}>
              <TabsList className="grid grid-cols-4 w-full">
                {LEMBAR_VERIFIKASI.map((lv) => {
                  const LvIcon = lv.icon
                  const pendingCount = getPendingForLembar(lv.subJalurFilter)
                  return (
                    <TabsTrigger
                      key={lv.key}
                      value={lv.key}
                      className="gap-1.5 text-xs sm:text-sm"
                    >
                      <LvIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">{lv.label}</span>
                      <span className="sm:hidden">{lv.key.charAt(0).toUpperCase() + lv.key.slice(1, 4)}</span>
                      {pendingCount > 0 && (
                        <Badge className="ml-1 bg-amber-500 text-white text-xs px-1.5 py-0 min-w-[18px] h-4 flex items-center justify-center">
                          {pendingCount}
                        </Badge>
                      )}
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              {LEMBAR_VERIFIKASI.map((lv) => (
                <TabsContent key={lv.key} value={lv.key} className="mt-6">
                  <LembarVerifikasiSheet
                    config={lv}
                    onVerify={() => {}}
                    onBulkVerify={() => {}}
                    onViewDetail={handleViewDetail}
                    toast={toast}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>

          {/* ==================== DATA PENDAFTAR TAB ==================== */}
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
                      <SelectItem value="VERIFIED">Diterima</SelectItem>
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
                        <TableHead>Status</TableHead>
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
                            <p className="text-sm text-gray-400">Import CSV untuk memulai verifikasi</p>
                            <Button className="mt-3 bg-emerald-600 hover:bg-emerald-700" onClick={() => setImportDialogOpen(true)}>
                              <Upload className="w-4 h-4" />
                              Import CSV
                            </Button>
                          </TableCell>
                        </TableRow>
                      ) : (
                        registrations.map((reg) => (
                          <TableRow key={reg.id} className={
                            reg.verificationStatus === 'VERIFIED' ? 'bg-emerald-50/40' :
                            reg.verificationStatus === 'REJECTED' ? 'bg-red-50/40' : ''
                          }>
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
                            <TableCell className="hidden lg:table-cell text-sm">{reg.namaSekolahPilihan}</TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Badge variant="secondary">{reg.jurusan}</Badge>
                            </TableCell>
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
                                <Button variant="ghost" size="sm" onClick={() => { setDetailTarget(reg); setDetailDialogOpen(true) }}>
                                  <Eye className="w-4 h-4" />
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
          </TabsContent>

          {/* ==================== DITERIMA TAB ==================== */}
          <TabsContent value="diterima" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-white">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 rounded-xl">
                      <UserCheck className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-emerald-600 font-medium">Total Diterima</p>
                      <p className="text-3xl font-bold text-emerald-700">{stats?.verified || 0}</p>
                      <p className="text-xs text-emerald-500">dari {stats?.total || 0} pendaftar ({verifiedPercent}%)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-emerald-400">
                <CardContent className="p-5">
                  <CardTitle className="text-sm mb-3">Per Sub Jalur</CardTitle>
                  <div className="space-y-2">
                    {stats?.verifiedBySubJalur.map((item) => (
                      <div key={item.name} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.name}</span>
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">{item.count}</Badge>
                      </div>
                    ))}
                    {(!stats?.verifiedBySubJalur || stats.verifiedBySubJalur.length === 0) && (
                      <p className="text-xs text-gray-400">Belum ada data</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-emerald-400">
                <CardContent className="p-5">
                  <CardTitle className="text-sm mb-3">Per Sekolah & Jurusan</CardTitle>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">Sekolah Pilihan</p>
                      {stats?.verifiedBySekolah.map((item) => (
                        <div key={item.name} className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 truncate mr-2">{item.name}</span>
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 shrink-0">{item.count}</Badge>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div>
                      <p className="text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">Jurusan</p>
                      {stats?.verifiedByJurusan.map((item) => (
                        <div key={item.name} className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">{item.name}</span>
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">{item.count}</Badge>
                        </div>
                      ))}
                    </div>
                    {(!stats?.verifiedBySekolah || stats.verifiedBySekolah.length === 0) && (
                      <p className="text-xs text-gray-400">Belum ada data</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Verified List Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-emerald-600" />
                  Daftar Pendaftar Diterima
                </CardTitle>
                <CardDescription>Pendaftar yang telah diverifikasi dan diterima di SPMB 2026</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-emerald-50/80">
                        <TableHead>No. Reg</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead className="hidden md:table-cell">NISN</TableHead>
                        <TableHead>Sub Jalur</TableHead>
                        <TableHead className="hidden lg:table-cell">Sekolah Pilihan</TableHead>
                        <TableHead className="hidden lg:table-cell">Jurusan</TableHead>
                        <TableHead className="hidden sm:table-cell">Waktu Verifikasi</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats?.verifiedList && stats.verifiedList.length > 0 ? (
                        stats.verifiedList.map((reg) => (
                          <TableRow key={reg.id} className="hover:bg-emerald-50/30">
                            <TableCell className="font-mono text-sm">{reg.noRegistrasi}</TableCell>
                            <TableCell className="font-medium">{reg.nama}</TableCell>
                            <TableCell className="hidden md:table-cell text-sm text-gray-500">{reg.nisn}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={SUB_JALUR_COLORS[reg.subJalur] || 'bg-gray-100 text-gray-800'}>
                                {reg.subJalur}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-sm">{reg.namaSekolahPilihan}</TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Badge variant="secondary">{reg.jurusan}</Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-xs text-gray-500">
                              {reg.updatedAt ? new Date(reg.updatedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="sm" onClick={() => { setDetailTarget(reg); setDetailDialogOpen(true) }}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-yellow-600 hover:text-white hover:bg-yellow-500"
                                  title="Kembalikan ke Menunggu"
                                  onClick={() => {
                                    setVerifyTargetId(reg.id)
                                    setVerifyAction('REJECTED')
                                    setVerifyNote('')
                                    setVerifyDialogOpen(true)
                                  }}
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12">
                            <UserCheck className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                            <p className="text-gray-500 font-medium">Belum ada pendaftar yang diterima</p>
                            <p className="text-sm text-gray-400">Verifikasi pendaftar untuk menerimanya</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== DITOLAK TAB ==================== */}
          <TabsContent value="ditolak" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-red-500 bg-gradient-to-br from-red-50 to-white">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-100 rounded-xl">
                      <UserX className="w-8 h-8 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-red-600 font-medium">Total Ditolak</p>
                      <p className="text-3xl font-bold text-red-700">{stats?.rejected || 0}</p>
                      <p className="text-xs text-red-500">dari {stats?.total || 0} pendaftar ({rejectedPercent}%)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-red-400">
                <CardContent className="p-5">
                  <CardTitle className="text-sm mb-3">Per Sub Jalur</CardTitle>
                  <div className="space-y-2">
                    {stats?.rejectedBySubJalur.map((item) => (
                      <div key={item.name} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.name}</span>
                        <Badge className="bg-red-100 text-red-700 border-red-200">{item.count}</Badge>
                      </div>
                    ))}
                    {(!stats?.rejectedBySubJalur || stats.rejectedBySubJalur.length === 0) && (
                      <p className="text-xs text-gray-400">Belum ada data</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-red-400">
                <CardContent className="p-5">
                  <CardTitle className="text-sm mb-3">Per Sekolah & Jurusan</CardTitle>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">Sekolah Pilihan</p>
                      {stats?.rejectedBySekolah.map((item) => (
                        <div key={item.name} className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 truncate mr-2">{item.name}</span>
                          <Badge className="bg-red-100 text-red-700 border-red-200 shrink-0">{item.count}</Badge>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div>
                      <p className="text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">Jurusan</p>
                      {stats?.rejectedByJurusan.map((item) => (
                        <div key={item.name} className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">{item.name}</span>
                          <Badge className="bg-red-100 text-red-700 border-red-200">{item.count}</Badge>
                        </div>
                      ))}
                    </div>
                    {(!stats?.rejectedBySekolah || stats.rejectedBySekolah.length === 0) && (
                      <p className="text-xs text-gray-400">Belum ada data</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rejected List Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-600" />
                  Daftar Pendaftar Ditolak
                </CardTitle>
                <CardDescription>Pendaftar yang ditolak dalam verifikasi SPMB 2026</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-red-50/80">
                        <TableHead>No. Reg</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead className="hidden md:table-cell">NISN</TableHead>
                        <TableHead>Sub Jalur</TableHead>
                        <TableHead className="hidden lg:table-cell">Sekolah Pilihan</TableHead>
                        <TableHead className="hidden lg:table-cell">Jurusan</TableHead>
                        <TableHead className="hidden sm:table-cell">Alasan Penolakan</TableHead>
                        <TableHead className="hidden sm:table-cell">Waktu Ditolak</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats?.rejectedList && stats.rejectedList.length > 0 ? (
                        stats.rejectedList.map((reg) => (
                          <TableRow key={reg.id} className="hover:bg-red-50/30">
                            <TableCell className="font-mono text-sm">{reg.noRegistrasi}</TableCell>
                            <TableCell className="font-medium">{reg.nama}</TableCell>
                            <TableCell className="hidden md:table-cell text-sm text-gray-500">{reg.nisn}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={SUB_JALUR_COLORS[reg.subJalur] || 'bg-gray-100 text-gray-800'}>
                                {reg.subJalur}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-sm">{reg.namaSekolahPilihan}</TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Badge variant="secondary">{reg.jurusan}</Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-sm text-gray-500 max-w-[200px] truncate">
                              {reg.verificationNote || <span className="text-gray-400 italic">Tidak ada alasan</span>}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-xs text-gray-500">
                              {reg.updatedAt ? new Date(reg.updatedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="sm" onClick={() => { setDetailTarget(reg); setDetailDialogOpen(true) }}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-emerald-600 hover:text-white hover:bg-emerald-600"
                                  title="Terima Ulang Pendaftar"
                                  onClick={() => {
                                    setVerifyTargetId(reg.id)
                                    setVerifyAction('VERIFIED')
                                    setVerifyNote('')
                                    setVerifyDialogOpen(true)
                                  }}
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-12">
                            <UserX className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                            <p className="text-gray-500 font-medium">Belum ada pendaftar yang ditolak</p>
                            <p className="text-sm text-gray-400">Semua pendaftar dalam proses verifikasi</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-sm text-gray-500">&copy; 2026 SPMB Verifikasi System</p>
            <p className="text-xs text-gray-400">Sistem Verifikasi Penerimaan Peserta Didik Baru</p>
          </div>
        </div>
      </footer>

      {/* ==================== IMPORT DIALOG ==================== */}
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
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
              onDrop={(e) => {
                e.preventDefault(); e.stopPropagation()
                const file = e.dataTransfer.files[0]
                if (file && file.name.endsWith('.csv')) setCsvFile(file)
              }}
            >
              <FileSpreadsheet className="w-10 h-10 mx-auto text-gray-400 mb-3" />
              {csvFile ? (
                <div>
                  <p className="font-medium text-emerald-700">{csvFile.name}</p>
                  <p className="text-sm text-gray-500">{(csvFile.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-gray-700">Klik atau seret file CSV ke sini</p>
                  <p className="text-sm text-gray-400 mt-1">Format: No.Registrasi, Nama, NISN, Sub Jalur, dll.</p>
                </div>
              )}
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => { const file = e.target.files?.[0]; if (file) setCsvFile(file) }}
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-sm text-amber-700">
                  <p className="font-medium">Format CSV yang diharapkan:</p>
                  <p className="mt-1">No.Registrasi, Nama, NISN, Sub Jalur, NPSN Sekolah Pilihan, Nama Sekolah Pilihan, Jurusan, NPSN Sekolah Asal, Nama Sekolah Asal, Status, Waktu Daftar</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>Batal</Button>
            <Button onClick={handleImport} disabled={!csvFile || importing} className="bg-emerald-600 hover:bg-emerald-700">
              {importing ? (<><Loader2 className="w-4 h-4 animate-spin" /> Mengimport...</>) : (<><Upload className="w-4 h-4" /> Import</>)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== SINGLE VERIFY DIALOG ==================== */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {verifyAction === 'VERIFIED' ? (
                <><ThumbsUp className="w-5 h-5 text-emerald-600" /> Terima Pendaftar</>
              ) : (
                <><ThumbsDown className="w-5 h-5 text-red-600" /> Tolak Pendaftar</>
              )}
            </DialogTitle>
            <DialogDescription>
              {verifyAction === 'VERIFIED'
                ? 'Apakah Anda yakin ingin MENERIMA pendaftar ini? Data akan diverifikasi dan diterima di SPMB 2026.'
                : 'Apakah Anda yakin ingin MENOLAK pendaftar ini? Berikan alasan penolakan jika diperlukan.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {verifyAction === 'REJECTED' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Perhatian!</p>
                    <p className="text-sm text-red-700">Pendaftar yang ditolak tetap dapat diterima kembali nanti melalui menu Ditolak.</p>
                  </div>
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                {verifyAction === 'VERIFIED' ? 'Catatan Verifikasi' : 'Alasan Penolakan'} {verifyAction === 'REJECTED' && <span className="text-red-500">*</span>}
              </label>
              <Textarea
                placeholder={verifyAction === 'VERIFIED' ? 'Catatan tambahan (opsional)...' : 'Tuliskan alasan penolakan...'}
                value={verifyNote}
                onChange={(e) => setVerifyNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyDialogOpen(false)}>Batal</Button>
            <Button
              onClick={handleVerify}
              disabled={verifying}
              className={verifyAction === 'VERIFIED' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              variant={verifyAction === 'REJECTED' ? 'destructive' : 'default'}
            >
              {verifying ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
              ) : verifyAction === 'VERIFIED' ? (
                <><ThumbsUp className="w-4 h-4" /> Terima</>
              ) : (
                <><ThumbsDown className="w-4 h-4" /> Tolak</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== BULK VERIFY DIALOG ==================== */}
      <Dialog open={bulkVerifyDialogOpen} onOpenChange={setBulkVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {verifyAction === 'VERIFIED' ? (
                <><ThumbsUp className="w-5 h-5 text-emerald-600" /> Terima {selectedIds.size} Pendaftar</>
              ) : (
                <><ThumbsDown className="w-5 h-5 text-red-600" /> Tolak {selectedIds.size} Pendaftar</>
              )}
            </DialogTitle>
            <DialogDescription>
              {verifyAction === 'VERIFIED'
                ? `Apakah Anda yakin ingin MENERIMA ${selectedIds.size} pendaftar yang dipilih?`
                : `Apakah Anda yakin ingin MENOLAK ${selectedIds.size} pendaftar yang dipilih?`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {verifyAction === 'REJECTED' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Perhatian!</p>
                    <p className="text-sm text-red-700">Pendaftar yang ditolak tetap dapat diterima kembali nanti melalui menu Ditolak.</p>
                  </div>
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                {verifyAction === 'VERIFIED' ? 'Catatan Verifikasi' : 'Alasan Penolakan'} {verifyAction === 'REJECTED' && <span className="text-red-500">*</span>}
              </label>
              <Textarea
                placeholder={verifyAction === 'VERIFIED' ? 'Catatan untuk semua pendaftar (opsional)...' : 'Tuliskan alasan penolakan untuk semua pendaftar...'}
                value={verifyNote}
                onChange={(e) => setVerifyNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkVerifyDialogOpen(false)}>Batal</Button>
            <Button
              onClick={handleBulkVerify}
              disabled={verifying}
              className={verifyAction === 'VERIFIED' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              variant={verifyAction === 'REJECTED' ? 'destructive' : 'default'}
            >
              {verifying ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
              ) : verifyAction === 'VERIFIED' ? (
                <><ThumbsUp className="w-4 h-4" /> Terima Semua</>
              ) : (
                <><ThumbsDown className="w-4 h-4" /> Tolak Semua</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== DETAIL DIALOG ==================== */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Detail Pendaftar
            </DialogTitle>
            <DialogDescription>Informasi lengkap pendaftar SPMB 2026</DialogDescription>
          </DialogHeader>

          {detailTarget && (
            <div className="space-y-4">
              {/* Status badge at top */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`${STATUS_COLORS[detailTarget.verificationStatus]} text-sm px-3 py-1`}>
                  {detailTarget.verificationStatus === 'PENDING' && <Clock className="w-4 h-4" />}
                  {detailTarget.verificationStatus === 'VERIFIED' && <CheckCircle2 className="w-4 h-4" />}
                  {detailTarget.verificationStatus === 'REJECTED' && <XCircle className="w-4 h-4" />}
                  {detailTarget.verificationStatus === 'PENDING' ? 'Menunggu Verifikasi' :
                   detailTarget.verificationStatus === 'VERIFIED' ? 'Diterima (Terverifikasi)' : 'Ditolak'}
                </Badge>
              </div>

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
                    <Badge variant="outline" className={SUB_JALUR_COLORS[detailTarget.subJalur] || 'bg-gray-100 text-gray-800'}>
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
                    <div className="mt-1"><Badge variant="outline">{detailTarget.status}</Badge></div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Waktu Daftar</label>
                    <p className="text-sm">{detailTarget.waktuDaftar}</p>
                  </div>
                  {detailTarget.verificationNote && (
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 font-medium">
                        {detailTarget.verificationStatus === 'REJECTED' ? 'Alasan Penolakan' : 'Catatan Verifikasi'}
                      </label>
                      <p className="text-sm mt-1 bg-yellow-50 p-2 rounded border border-yellow-200">
                        {detailTarget.verificationNote}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t">
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
                    <ThumbsUp className="w-4 h-4" />
                    Terima
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
                    <ThumbsDown className="w-4 h-4" />
                    Tolak
                  </Button>
                )}
                {detailTarget.verificationStatus === 'VERIFIED' && (
                  <Button
                    variant="outline"
                    className="flex-1 border-yellow-400 text-yellow-700 hover:bg-yellow-50"
                    onClick={() => {
                      setVerifyTargetId(detailTarget.id)
                      setVerifyAction('REJECTED')
                      setVerifyNote('')
                      setDetailDialogOpen(false)
                      setVerifyDialogOpen(true)
                    }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Batalkan & Tolak
                  </Button>
                )}
                {detailTarget.verificationStatus === 'REJECTED' && (
                  <Button
                    variant="outline"
                    className="flex-1 border-emerald-400 text-emerald-700 hover:bg-emerald-50"
                    onClick={() => {
                      setVerifyTargetId(detailTarget.id)
                      setVerifyAction('VERIFIED')
                      setVerifyNote('')
                      setDetailDialogOpen(false)
                      setVerifyDialogOpen(true)
                    }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Terima Ulang
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
