'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  GraduationCap,
  School,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Pencil,
  CalendarClock,
  MapPin,
  AlertTriangle,
  AlertCircle,
  ClipboardCheck,
  X,
  Copy,
  ArrowUpDown,
  ArrowUpAZ,
  ArrowDownAZ,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { KekuranganVerifSelect, VerifyKekuranganPicker } from '@/components/KekuranganVerifSelect'
import { hitungLamaKK, isKKKurangSetahun, dedupById } from '@/lib/utils-shared'
import { STATUS_COLORS, SUB_JALUR_COLORS } from '@/lib/constants'
import type { Registration, LembarVerifikasiConfig, LembarVerifikasiData } from '@/lib/types'

// Lembar Verifikasi Sheet Component
export default function LembarVerifikasiSheet({
  config,
  subJalurOptions,
  onVerify,
  onBulkVerify,
  onViewDetail,
  toast,
  highlightRegId,
}: {
  config: LembarVerifikasiConfig
  subJalurOptions: Array<{ label: string; value: string }>
  onVerify: (id: string, action: 'VERIFIED' | 'REJECTED') => void
  onBulkVerify: (ids: string[], action: 'VERIFIED' | 'REJECTED') => void
  onViewDetail: (reg: Registration) => void
  toast: ReturnType<typeof useToast>['toast']
  highlightRegId?: string | null
}) {
  const [data, setData] = useState<LembarVerifikasiData | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [verificationFilter, setVerificationFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [lembarLimit, setLembarLimit] = useState(20)
  const [verifying, setVerifying] = useState(false)
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)
  const [bulkVerifyDialogOpen, setBulkVerifyDialogOpen] = useState(false)
  const [verifyAction, setVerifyAction] = useState<'VERIFIED' | 'REJECTED'>('VERIFIED')
  const [verifyNote, setVerifyNote] = useState('')
  const [verifyTargetId, setVerifyTargetId] = useState<string | null>(null)

  // Sort by nama
  const [namaSortLembar, setNamaSortLembar] = useState<'none' | 'asc' | 'desc'>('none')

  // Inline editing state: key = "regId-fieldName"
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Registration | null>(null)
  const [editForm, setEditForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Registration | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Auto-scroll to highlighted row when highlightRegId changes
  useEffect(() => {
    if (highlightRegId) {
      // Small delay to ensure the row is rendered
      const timer = setTimeout(() => {
        const row = document.getElementById(`lembar-row-${highlightRegId}`)
        if (row) {
          row.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [highlightRegId])

  const handleFieldUpdate = async (regId: string, field: string, value: string) => {
    try {
      const res = await fetch(`/api/registrations/${regId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value }),
      })
      const result = await res.json()
      if (result.success) {
        // Update local data
        if (data) {
          setData({
            ...data,
            registrations: data.registrations.map(r =>
              r.id === regId ? { ...r, [field]: value || null } : r
            ),
          })
        }
        toast({ title: 'Tersimpan', description: `Data ${field} berhasil diperbarui` })
      } else {
        toast({ title: 'Gagal', description: result.error || 'Gagal menyimpan', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Gagal', description: 'Terjadi kesalahan', variant: 'destructive' })
    }
  }

  // Update multiple fields at once (e.g. terbitKK + lamaKK)
  const handleMultiFieldUpdate = async (regId: string, fields: Record<string, string>) => {
    try {
      const res = await fetch(`/api/registrations/${regId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      const result = await res.json()
      if (result.success) {
        // Update local data with all fields
        if (data) {
          setData({
            ...data,
            registrations: data.registrations.map(r =>
              r.id === regId ? { ...r, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, v || null])) } : r
            ),
          })
        }
        toast({ title: 'Tersimpan', description: 'Data berhasil diperbarui' })
      } else {
        toast({ title: 'Gagal', description: result.error || 'Gagal menyimpan', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Gagal', description: 'Terjadi kesalahan', variant: 'destructive' })
    }
  }

  const startEditing = (regId: string, field: string, currentValue: string) => {
    setEditingCell(`${regId}-${field}`)
    setEditingValue(currentValue || '')
  }

  const commitEdit = (regId: string, field: string) => {
    handleFieldUpdate(regId, field, editingValue)
    setEditingCell(null)
    setEditingValue('')
  }

  const commitEditDirect = (regId: string, field: string, value: string) => {
    handleFieldUpdate(regId, field, value)
  }

  // Commit terbitKK and auto-calculate lamaKK at once
  const commitTerbitKK = (regId: string, newDate: string) => {
    const calculatedLama = newDate ? hitungLamaKK(newDate) : ''
    // Immediately update local state for instant UI feedback
    if (data) {
      setData({
        ...data,
        registrations: data.registrations.map(r =>
          r.id === regId ? { ...r, terbitKK: newDate || null, lamaKK: calculatedLama || null } : r
        ),
      })
    }
    // Save both fields to backend in one request
    handleMultiFieldUpdate(regId, { terbitKK: newDate, lamaKK: calculatedLama })
    setEditingCell(null)
    setEditingValue('')
  }

  const cancelEdit = () => {
    setEditingCell(null)
    setEditingValue('')
  }

  // Edit dialog functions
  const openEditDialog = (reg: Registration) => {
    setEditTarget(reg)
    setEditForm({
      noRegistrasi: reg.noRegistrasi || '',
      nama: reg.nama || '',
      nisn: reg.nisn || '',
      subJalur: reg.subJalur || '',
      nik: reg.nik || '',
      tanggalLahir: reg.tanggalLahir || '',
      alamat: reg.alamat || '',
      alamatLengkap: reg.alamatLengkap || '',
      noTelpSiswa: reg.noTelpSiswa || '',
      noTelpOrangtua: reg.noTelpOrangtua || '',
      npsnSekolahPilihan: reg.npsnSekolahPilihan || '',
      namaSekolahPilihan: reg.namaSekolahPilihan || '',
      jurusan: reg.jurusan || '',
      npsnSekolahAsal: reg.npsnSekolahAsal || '',
      namaSekolahAsal: reg.namaSekolahAsal || '',
      skorJarak: reg.skorJarak || '',
      skorNilaiRaport: reg.skorNilaiRaport || '',
      kekuranganVerifikasi: reg.kekuranganVerifikasi || '',
      tanggalVerif: reg.tanggalVerif || '',
      jamVerif: reg.jamVerif || '',
      terbitKK: reg.terbitKK || '',
      latitude: reg.latitude || '',
      longitude: reg.longitude || '',
      lokasiJarak: reg.lokasiJarak || '',
      nilaiRataRata: reg.nilaiRataRata || '',
      totalNilai: reg.totalNilai || '',
      statusLulus: reg.statusLulus || 'BELUM',
      statusDaftarUlang: reg.statusDaftarUlang || 'BELUM',
    })
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editTarget) return
    setSaving(true)
    try {
      // Auto-calculate lamaKK when terbitKK is provided
      const updateData = { ...editForm }
      if (updateData.terbitKK) {
        const calculatedLama = hitungLamaKK(updateData.terbitKK)
        if (calculatedLama) updateData['lamaKK'] = calculatedLama
      }

      const res = await fetch(`/api/registrations/${editTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })
      const result = await res.json()
      if (result.success) {
        toast({ title: 'Berhasil', description: `Data ${editTarget.nama} berhasil diperbarui` })
        setEditDialogOpen(false)
        setEditTarget(null)
        fetchData()
      } else {
        toast({ title: 'Gagal', description: result.error || 'Gagal menyimpan', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Gagal', description: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  // Delete dialog functions
  const openDeleteDialog = (reg: Registration) => {
    setDeleteTarget(reg)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/registrations/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      const result = await res.json()
      if (result.success) {
        toast({ title: 'Berhasil', description: `Data ${deleteTarget.nama} berhasil dihapus` })
        setDeleteDialogOpen(false)
        setDeleteTarget(null)
        fetchData()
      } else {
        toast({ title: 'Gagal', description: result.error || 'Gagal menghapus', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Gagal', description: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setDeleting(false)
    }
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', lembarLimit.toString())
      params.set('subJalur', config.subJalurFilter)
      if (search) params.set('search', search)
      if (verificationFilter !== 'all') params.set('verificationStatus', verificationFilter)

      const res = await fetch(`/api/registrations?${params}`)
      const result = await res.json()

      const regs: Registration[] = dedupById(result.data || [])
      const pag = result.pagination || { page: 1, limit: lembarLimit, total: 0, totalPages: 0 }

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
  }, [page, search, verificationFilter, config.subJalurFilter, lembarLimit, toast])

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
  const totalCols = config.needsSkor ? 16 : 14

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg`}>
        <div className={`absolute inset-0 ${config.cardGradient || 'bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900'}`} />
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-6 -mb-6" />
        <div className="relative p-3 sm:p-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`p-2 sm:p-3 bg-white/15 rounded-lg sm:rounded-xl backdrop-blur-sm border border-white/10`}>
              <Icon className={`w-6 h-6 sm:w-8 sm:h-8 text-white`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-xl font-bold text-white">Lembar Verifikasi: {config.label}</h3>
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/10 font-medium">
                  {config.needsSkor ? '⚡ Jarak + Skor' : '📍 Jarak Saja'}
                </span>
                {config.subCategories && (
                  <div className="flex gap-1">
                    {config.subCategories.map((sub, subIdx) => (
                      <span key={`subcat-${sub}-${subIdx}`} className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/15 text-white/90 border border-white/10">
                        {sub}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm text-white/70 mt-0.5">{config.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <div className={`relative overflow-hidden rounded-xl ${config.cardGradient || 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900'} p-2.5 sm:p-4 shadow-lg`}>
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full -mr-4 -mt-4" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-sm text-white/70 font-medium">Total Pendaftar</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{s.total}</p>
            </div>
            <div className="p-1.5 sm:p-2.5 bg-white/15 rounded-lg sm:rounded-xl backdrop-blur-sm border border-white/10">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-600 p-2.5 sm:p-4 shadow-lg">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full -mr-4 -mt-4" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-sm text-amber-100 font-medium">Menunggu</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{s.pending}</p>
            </div>
            <div className="p-1.5 sm:p-2.5 bg-white/15 rounded-lg sm:rounded-xl backdrop-blur-sm border border-white/10">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 p-2.5 sm:p-4 shadow-lg">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full -mr-4 -mt-4" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-sm text-emerald-100 font-medium">Diterima</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{s.verified}</p>
            </div>
            <div className="p-1.5 sm:p-2.5 bg-white/15 rounded-lg sm:rounded-xl backdrop-blur-sm border border-white/10">
              <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500 via-rose-500 to-pink-600 p-2.5 sm:p-4 shadow-lg">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full -mr-4 -mt-4" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-sm text-red-100 font-medium">Ditolak</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{s.rejected}</p>
            </div>
            <div className="p-1.5 sm:p-2.5 bg-white/15 rounded-lg sm:rounded-xl backdrop-blur-sm border border-white/10">
              <UserX className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progres Verifikasi {config.label}</span>
            <span className="text-sm text-gray-500">{progressPct}% selesai</span>
          </div>
          <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700 ease-out" style={{ width: `${verifiedPct}%` }} />
            <div className="absolute inset-y-0 bg-gradient-to-r from-red-400 to-rose-500 rounded-full transition-all duration-700 ease-out" style={{ left: `${verifiedPct}%`, width: `${rejectedPct}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm" />
              <span className="text-gray-600">Diterima: {s.verified} ({verifiedPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-red-400 to-rose-500 shadow-sm" />
              <span className="text-gray-600">Ditolak: {s.rejected} ({rejectedPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 shadow-sm" />
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
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Tampilkan:</span>
              <Select value={lembarLimit.toString()} onValueChange={(val) => {
                const newLimit = val === 'all' ? 9999 : parseInt(val)
                setLembarLimit(newLimit)
                setPage(1)
              }}>
                <SelectTrigger className="w-24 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="all">Semua</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-white">
                <TableRow className={config.headerBg}>
                  <TableHead className="w-10 text-center">No</TableHead>
                  <TableHead className="w-10 text-center">
                    <Checkbox
                      checked={data ? data.registrations.length > 0 && selectedIds.size === data.registrations.length : false}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Skor Jarak</TableHead>
                  {config.needsSkor && <TableHead>Total Nilai</TableHead>}
                  {config.needsSkor && <TableHead>Skor Nilai Raport</TableHead>}
                  <TableHead className="min-w-[180px]">
                    <span className="inline-flex items-center gap-1 cursor-pointer group" onClick={() => {
                      if (selectedIds.size > 0) {
                        setVerifyAction('REJECTED')
                        setBulkVerifyDialogOpen(true)
                      }
                    }}>
                      Kekurangan Verifikasi
                      <Pencil className="w-3 h-3 text-gray-300 group-hover:text-sky-500" />
                    </span>
                  </TableHead>
                  <TableHead>Tanggal Verif</TableHead>
                  <TableHead>Jam Verif</TableHead>
                  <TableHead>Terbit KK</TableHead>
                  <TableHead>Lama KK</TableHead>
                  <TableHead>No. Registrasi</TableHead>
                  <TableHead>Nama Peserta
                    <span className="ml-1 cursor-pointer inline-flex align-middle" onClick={() => setNamaSortLembar(namaSortLembar === 'none' ? 'asc' : namaSortLembar === 'asc' ? 'desc' : 'none')}>
                      {namaSortLembar === 'none' ? <ArrowUpDown className="w-3 h-3 text-gray-400" /> : namaSortLembar === 'asc' ? <ArrowUpAZ className="w-3 h-3 text-emerald-600" /> : <ArrowDownAZ className="w-3 h-3 text-emerald-600" />}
                    </span>
                  </TableHead>
                  <TableHead>Asal Sekolah</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={totalCols} className="text-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                      <p className="text-sm text-gray-400 mt-2">Memuat data...</p>
                    </TableCell>
                  </TableRow>
                ) : !data || data.registrations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={totalCols} className="text-center py-12">
                      <Icon className={`w-10 h-10 mx-auto text-gray-300 mb-2`} />
                      <p className="text-gray-500 font-medium">Belum ada data pendaftar {config.label}</p>
                      <p className="text-sm text-gray-400">Import CSV untuk memulai verifikasi</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  [...data.registrations].sort((a, b) => {
                    if (namaSortLembar === 'asc') return (a.nama || '').localeCompare(b.nama || '')
                    if (namaSortLembar === 'desc') return (b.nama || '').localeCompare(a.nama || '')
                    return 0
                  }).map((reg, idx) => (
                    <TableRow key={`lembar-${reg.id}-${idx}`} className={
                      highlightRegId === reg.id
                        ? 'bg-amber-100 ring-2 ring-amber-400 animate-pulse'
                        : reg.verificationStatus === 'VERIFIED' ? 'bg-emerald-50/40' :
                        reg.verificationStatus === 'REJECTED' ? 'bg-red-50/40' : ''
                    } id={`lembar-row-${reg.id}`}>
                      {/* No */}
                      <TableCell className="text-center text-sm text-gray-500">
                        {(data.pagination.page - 1) * data.pagination.limit + idx + 1}
                      </TableCell>
                      {/* Checkbox */}
                      <TableCell className="text-center">
                        <Checkbox checked={selectedIds.has(reg.id)} onCheckedChange={() => toggleSelect(reg.id)} />
                      </TableCell>
                      {/* Skor Jarak */}
                      <TableCell className="text-sm text-center">
                        {reg.skorJarak || '-'}
                      </TableCell>
                      {/* Total Nilai (only if jalur needs skor) */}
                      {config.needsSkor && (
                      <TableCell className="text-sm text-center">
                        {reg.totalNilai || '-'}
                      </TableCell>
                      )}
                      {/* Skor Nilai Raport (only if jalur needs skor) */}
                      {config.needsSkor && (
                      <TableCell className="text-sm text-center">
                        {editingCell === `${reg.id}-skorNilaiRaport` ? (
                          <input
                            type="text"
                            className="w-20 px-1.5 py-0.5 text-sm border border-sky-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => commitEdit(reg.id, 'skorNilaiRaport')}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitEdit(reg.id, 'skorNilaiRaport')
                              if (e.key === 'Escape') cancelEdit()
                            }}
                            autoFocus
                          />
                        ) : (
                          <span
                            className="cursor-pointer hover:bg-sky-50 px-1 py-0.5 rounded inline-flex items-center gap-1 group"
                            onClick={() => startEditing(reg.id, 'skorNilaiRaport', reg.skorNilaiRaport || reg.nilaiRataRata || '')}
                          >
                            {reg.skorNilaiRaport || reg.nilaiRataRata || '-'}
                            <Pencil className="w-3 h-3 text-gray-300 group-hover:text-sky-500" />
                          </span>
                        )}
                      </TableCell>
                      )}
                      {/* Kekurangan Verifikasi - Multi-Select Dropdown */}
                      <TableCell className="text-sm align-top" style={{ maxWidth: '280px' }}>
                        <div className="space-y-1">
                          <KekuranganVerifSelect
                            value={reg.kekuranganVerifikasi || ''}
                            onChange={(val) => commitEditDirect(reg.id, 'kekuranganVerifikasi', val)}
                          />
                          {reg.kekuranganVerifikasi && (
                            <div className="group/reason relative">
                              <div className="text-[10px] text-red-600 leading-tight whitespace-normal break-words pr-5">
                                {reg.kekuranganVerifikasi.split(' | ').map((reason, i) => (
                                  <span key={i} className="block">{reason}</span>
                                ))}
                              </div>
                              <button
                                className="absolute top-0 right-0 opacity-0 group-hover/reason:opacity-100 transition-opacity p-0.5 rounded hover:bg-sky-100 text-gray-400 hover:text-sky-600"
                                title="Copy alasan untuk paste ke Portal SPMB"
                                onClick={() => {
                                  navigator.clipboard.writeText(reg.kekuranganVerifikasi || '')
                                  toast({ title: 'Tersalin!', description: 'Alasan kekurangan sudah di-copy' })
                                }}
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      {/* Tanggal Verif */}
                      <TableCell className="text-sm">
                        {editingCell === `${reg.id}-tanggalVerif` ? (
                          <input
                            type="date"
                            className="w-32 px-1.5 py-0.5 text-sm border border-sky-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => commitEdit(reg.id, 'tanggalVerif')}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitEdit(reg.id, 'tanggalVerif')
                              if (e.key === 'Escape') cancelEdit()
                            }}
                            autoFocus
                          />
                        ) : (
                          <span
                            className="cursor-pointer hover:bg-sky-50 px-1 py-0.5 rounded inline-flex items-center gap-1 group"
                            onClick={() => startEditing(reg.id, 'tanggalVerif', reg.tanggalVerif || '')}
                          >
                            {reg.tanggalVerif || '-'}
                            <Pencil className="w-3 h-3 text-gray-300 group-hover:text-sky-500" />
                          </span>
                        )}
                      </TableCell>
                      {/* Jam Verif */}
                      <TableCell className="text-sm">
                        {editingCell === `${reg.id}-jamVerif` ? (
                          <input
                            type="time"
                            className="w-24 px-1.5 py-0.5 text-sm border border-sky-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => commitEdit(reg.id, 'jamVerif')}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitEdit(reg.id, 'jamVerif')
                              if (e.key === 'Escape') cancelEdit()
                            }}
                            autoFocus
                          />
                        ) : (
                          <span
                            className="cursor-pointer hover:bg-sky-50 px-1 py-0.5 rounded inline-flex items-center gap-1 group"
                            onClick={() => startEditing(reg.id, 'jamVerif', reg.jamVerif || '')}
                          >
                            {reg.jamVerif || '-'}
                            <Pencil className="w-3 h-3 text-gray-300 group-hover:text-sky-500" />
                          </span>
                        )}
                      </TableCell>
                      {/* Terbit KK */}
                      <TableCell className="text-sm">
                        {editingCell === `${reg.id}-terbitKK` ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="date"
                              className="w-28 px-1.5 py-0.5 text-sm border border-sky-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                              value={editingValue}
                              onChange={(e) => {
                                setEditingValue(e.target.value)
                              }}
                              onBlur={() => {
                                // Small delay to allow clear button click to register
                                setTimeout(() => {
                                  if (editingCell === `${reg.id}-terbitKK`) {
                                    commitTerbitKK(reg.id, editingValue)
                                  }
                                }, 150)
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  commitTerbitKK(reg.id, editingValue)
                                }
                                if (e.key === 'Escape') cancelEdit()
                              }}
                              autoFocus
                            />
                            <button
                              type="button"
                              className="p-0.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                              title="Kosongkan tanggal"
                              onMouseDown={(e) => {
                                e.preventDefault() // Prevent blur from firing on the date input
                                commitTerbitKK(reg.id, '')
                              }}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span
                            className="cursor-pointer hover:bg-sky-50 px-1 py-0.5 rounded inline-flex items-center gap-1 group"
                            onClick={() => startEditing(reg.id, 'terbitKK', reg.terbitKK || '')}
                          >
                            {reg.terbitKK || '-'}
                            <Pencil className="w-3 h-3 text-gray-300 group-hover:text-sky-500" />
                          </span>
                        )}
                      </TableCell>
                      {/* Lama KK - Auto-calculated from Terbit KK */}
                      <TableCell className="text-sm">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${
                            !reg.terbitKK ? 'text-gray-400' :
                            isKKKurangSetahun(reg.terbitKK)
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                          title={reg.terbitKK ? `Terbit: ${reg.terbitKK}` : undefined}
                        >
                          {reg.terbitKK ? (
                            <>
                              <CalendarClock className="w-3 h-3" />
                              {reg.lamaKK || hitungLamaKK(reg.terbitKK) || '-'}
                            </>
                          ) : '-'}
                        </span>
                      </TableCell>
                      {/* No. Registrasi */}
                      <TableCell className="font-mono text-sm">{reg.noRegistrasi}</TableCell>
                      {/* Nama Peserta */}
                      <TableCell className="font-medium text-sm">{reg.nama}</TableCell>
                      {/* Asal Sekolah */}
                      <TableCell className="text-sm text-gray-600">{reg.namaSekolahAsal}</TableCell>
                      {/* Status */}
                      <TableCell>
                        <Badge variant="outline" className={STATUS_COLORS[reg.verificationStatus]}>
                          {reg.verificationStatus === 'PENDING' && <Clock className="w-3 h-3" />}
                          {reg.verificationStatus === 'VERIFIED' && <CheckCircle2 className="w-3 h-3" />}
                          {reg.verificationStatus === 'REJECTED' && <XCircle className="w-3 h-3" />}
                          {reg.verificationStatus === 'PENDING' ? 'Menunggu' :
                           reg.verificationStatus === 'VERIFIED' ? 'Diterima' : 'Ditolak'}
                        </Badge>
                      </TableCell>
                      {/* Aksi */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => onViewDetail(reg)} title="Lihat Detail">
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
        <DialogContent className="max-w-lg">
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
            {verifyAction === 'REJECTED' && (
              <VerifyKekuranganPicker value={verifyNote} onChange={setVerifyNote} />
            )}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                {verifyAction === 'VERIFIED' ? 'Catatan Verifikasi' : 'Catatan Tambahan'}
              </label>
              <Textarea
                placeholder={verifyAction === 'VERIFIED' ? 'Catatan tambahan (opsional)...' : 'Catatan tambahan (opsional)...'}
                value={verifyNote}
                onChange={(e) => setVerifyNote(e.target.value)}
                rows={2}
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
        <DialogContent className="max-w-lg">
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
            {verifyAction === 'REJECTED' && (
              <VerifyKekuranganPicker value={verifyNote} onChange={setVerifyNote} />
            )}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                {verifyAction === 'VERIFIED' ? 'Catatan Verifikasi' : 'Catatan Tambahan'}
              </label>
              <Textarea
                placeholder={verifyAction === 'VERIFIED' ? 'Catatan untuk semua pendaftar (opsional)...' : 'Catatan tambahan (opsional)...'}
                value={verifyNote}
                onChange={(e) => setVerifyNote(e.target.value)}
                rows={2}
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-blue-600" /> Edit Data Pendaftar
            </DialogTitle>
            <DialogDescription>
              Edit data pendaftar <span className="font-semibold">{editTarget?.nama}</span> ({editTarget?.noRegistrasi})
            </DialogDescription>
          </DialogHeader>
          {editTarget && (
            <div className="space-y-6">
              {/* Data Pendaftar */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gray-500" /> Data Pendaftar
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 font-medium">No. Registrasi</label>
                    <Input value={editForm.noRegistrasi || ''} onChange={e => setEditForm({...editForm, noRegistrasi: e.target.value})} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Nama</label>
                    <Input value={editForm.nama || ''} onChange={e => setEditForm({...editForm, nama: e.target.value})} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">NISN</label>
                    <Input value={editForm.nisn || ''} onChange={e => setEditForm({...editForm, nisn: e.target.value})} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Sub Jalur</label>
                    <Select value={editForm.subJalur || ''} onValueChange={v => setEditForm({...editForm, subJalur: v})}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Pilih Sub Jalur" /></SelectTrigger>
                      <SelectContent>
                        {subJalurOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">NIK</label>
                    <Input value={editForm.nik || ''} onChange={e => setEditForm({...editForm, nik: e.target.value})} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Tanggal Lahir</label>
                    <Input type="date" value={editForm.tanggalLahir || ''} onChange={e => setEditForm({...editForm, tanggalLahir: e.target.value})} className="mt-1" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-500 font-medium">Alamat</label>
                    <Input value={editForm.alamat || ''} onChange={e => setEditForm({...editForm, alamat: e.target.value})} className="mt-1" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-500 font-medium">Alamat Lengkap</label>
                    <Textarea value={editForm.alamatLengkap || ''} onChange={e => setEditForm({...editForm, alamatLengkap: e.target.value})} className="mt-1" rows={2} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">No. Telp Siswa</label>
                    <Input value={editForm.noTelpSiswa || ''} onChange={e => setEditForm({...editForm, noTelpSiswa: e.target.value})} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">No. Telp Orangtua</label>
                    <Input value={editForm.noTelpOrangtua || ''} onChange={e => setEditForm({...editForm, noTelpOrangtua: e.target.value})} className="mt-1" />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Data Sekolah */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                  <School className="w-4 h-4 text-gray-500" /> Data Sekolah
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 font-medium">NPSN Sekolah Pilihan</label>
                    <Input value={editForm.npsnSekolahPilihan || ''} onChange={e => setEditForm({...editForm, npsnSekolahPilihan: e.target.value})} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Nama Sekolah Pilihan</label>
                    <Input value={editForm.namaSekolahPilihan || ''} onChange={e => setEditForm({...editForm, namaSekolahPilihan: e.target.value})} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Jurusan</label>
                    <Input value={editForm.jurusan || ''} onChange={e => setEditForm({...editForm, jurusan: e.target.value})} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">NPSN Sekolah Asal</label>
                    <Input value={editForm.npsnSekolahAsal || ''} onChange={e => setEditForm({...editForm, npsnSekolahAsal: e.target.value})} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Nama Sekolah Asal</label>
                    <Input value={editForm.namaSekolahAsal || ''} onChange={e => setEditForm({...editForm, namaSekolahAsal: e.target.value})} className="mt-1" />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Data Verifikasi */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                  <ClipboardCheck className="w-4 h-4 text-gray-500" /> Data Verifikasi
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Skor Jarak</label>
                    <Input value={editForm.skorJarak || ''} onChange={e => setEditForm({...editForm, skorJarak: e.target.value})} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Skor Nilai Raport</label>
                    <Input value={editForm.skorNilaiRaport || ''} onChange={e => setEditForm({...editForm, skorNilaiRaport: e.target.value})} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Total Nilai (Sumut Berkah)</label>
                    <Input value={editForm.totalNilai || ''} onChange={e => setEditForm({...editForm, totalNilai: e.target.value})} className="mt-1" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-500 font-medium">Kekurangan Verifikasi</label>
                    <div className="mt-1">
                      <KekuranganVerifSelect
                        value={editForm.kekuranganVerifikasi || ''}
                        onChange={(val) => setEditForm({...editForm, kekuranganVerifikasi: val})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Tanggal Verifikasi</label>
                    <Input type="date" value={editForm.tanggalVerif || ''} onChange={e => setEditForm({...editForm, tanggalVerif: e.target.value})} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Jam Verifikasi</label>
                    <Input type="time" value={editForm.jamVerif || ''} onChange={e => setEditForm({...editForm, jamVerif: e.target.value})} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Terbit KK</label>
                    <div className="flex items-center gap-1 mt-1">
                      <Input type="date" value={editForm.terbitKK || ''} onChange={e => setEditForm({...editForm, terbitKK: e.target.value})} className="flex-1" />
                      {editForm.terbitKK && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-9 px-2"
                          onClick={() => setEditForm({...editForm, terbitKK: ''})}
                          title="Kosongkan"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Lama KK</label>
                    <Input value={editForm.terbitKK ? hitungLamaKK(editForm.terbitKK) : ''} readOnly className="mt-1 bg-gray-50" />
                    <p className="text-xs text-gray-400 mt-1">Dihitung otomatis dari Terbit KK</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Data Lokasi & Nilai */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-500" /> Lokasi & Nilai
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Latitude</label>
                    <Input value={editForm.latitude || ''} onChange={e => setEditForm({...editForm, latitude: e.target.value})} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Longitude</label>
                    <Input value={editForm.longitude || ''} onChange={e => setEditForm({...editForm, longitude: e.target.value})} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Lokasi Jarak</label>
                    <Input value={editForm.lokasiJarak || ''} onChange={e => setEditForm({...editForm, lokasiJarak: e.target.value})} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Nilai Rata-Rata</label>
                    <Input value={editForm.nilaiRataRata || ''} onChange={e => setEditForm({...editForm, nilaiRataRata: e.target.value})} className="mt-1" />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Status Kelulusan & Daftar Ulang */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-gray-500" /> Kelulusan & Daftar Ulang
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Status Kelulusan</label>
                    <Select value={editForm.statusLulus || 'BELUM'} onValueChange={v => setEditForm({...editForm, statusLulus: v})}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BELUM">Belum Ditentukan</SelectItem>
                        <SelectItem value="LULUS">Lulus</SelectItem>
                        <SelectItem value="TIDAK_LULUS">Tidak Lulus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Status Daftar Ulang</label>
                    <Select value={editForm.statusDaftarUlang || 'BELUM'} onValueChange={v => setEditForm({...editForm, statusDaftarUlang: v})}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BELUM">Belum Ditentukan</SelectItem>
                        <SelectItem value="DAFTAR_ULANG">Daftar Ulang</SelectItem>
                        <SelectItem value="TIDAK_DAFTAR_ULANG">Tidak Daftar Ulang</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSaveEdit} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : <><Pencil className="w-4 h-4" /> Simpan</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" /> Hapus Data Pendaftar
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus data pendaftar <span className="font-semibold">{deleteTarget?.nama}</span>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">Data yang sudah dihapus tidak dapat dikembalikan. Pastikan Anda yakin sebelum melanjutkan.</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Menghapus...</> : <><Trash2 className="w-4 h-4" /> Hapus</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
