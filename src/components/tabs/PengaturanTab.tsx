'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Settings,
  Users,
  Loader2,
  Save,
  ClipboardCheck,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Trash2,
  Globe,
  Mail,
  Lock,
  RefreshCw,
} from 'lucide-react'

interface PengaturanTabProps {
  authUser: { id: string; username: string; namaLengkap: string; role: string } | null
  toast: any
  onDataChanged: () => void
  onJalurConfigsChanged: (configs: Array<{ id: string; nama: string; persentase: number; urutan: number; aktif: boolean }>) => void
}

export default function PengaturanTab({ authUser, toast, onDataChanged, onJalurConfigsChanged }: PengaturanTabProps) {
  // Pengaturan state
  const [kuota, setKuota] = useState(0)
  const [jalurConfigs, setJalurConfigs] = useState<Array<{ id: string; nama: string; persentase: number; urutan: number; aktif: boolean }>>([])
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [newJalurNama, setNewJalurNama] = useState('')
  const [newJalurPersentase, setNewJalurPersentase] = useState(0)
  const [addJalurOpen, setAddJalurOpen] = useState(false)

  // Portal Sync state
  const [portalSyncOpen, setPortalSyncOpen] = useState(false)
  const [portalSyncEmail, setPortalSyncEmail] = useState('')
  const [portalSyncPassword, setPortalSyncPassword] = useState('')
  const [portalSyncStatus, setPortalSyncStatus] = useState('accepted')
  const [portalSyncPages, setPortalSyncPages] = useState(10)
  const [portalSyncing, setPortalSyncing] = useState(false)
  const [portalSyncResult, setPortalSyncResult] = useState<{ success: boolean; message: string; created?: number; updated?: number; unchanged?: number; total?: number } | null>(null)

  // Local confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmConfig, setConfirmConfig] = useState<{ title: string; description: string; onConfirm: () => void; variant?: 'destructive' | 'default' }>({ title: '', description: '', onConfirm: () => {} })

  // ==================== FETCH SETTINGS ====================
  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true)
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      setKuota(data.kuota || 0)
      setJalurConfigs(data.jalurConfigs || [])
      onJalurConfigsChanged(data.jalurConfigs || [])
    } catch {
      toast({ title: 'Error', description: 'Gagal memuat pengaturan', variant: 'destructive' })
    } finally {
      setSettingsLoading(false)
    }
  }, [toast, onJalurConfigsChanged])

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // ==================== SETTINGS FUNCTIONS ====================

  const saveKuota = async () => {
    setSettingsSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kuota }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Tersimpan', description: `Kuota siswa: ${kuota}` })
      }
    } catch {
      toast({ title: 'Gagal', description: 'Gagal menyimpan kuota', variant: 'destructive' })
    } finally {
      setSettingsSaving(false)
    }
  }

  // Update jalur persentase
  const updateJalurPersentase = async (id: string, persentase: number) => {
    try {
      const res = await fetch('/api/settings/jalur', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, persentase }),
      })
      const data = await res.json()
      if (data.success) {
        const updated = jalurConfigs.map(j => j.id === id ? { ...j, persentase } : j)
        setJalurConfigs(updated)
        onJalurConfigsChanged(updated)
      }
    } catch {
      toast({ title: 'Gagal', description: 'Gagal memperbarui persentase', variant: 'destructive' })
    }
  }

  // Add new jalur
  const addJalur = async () => {
    if (!newJalurNama.trim()) {
      toast({ title: 'Gagal', description: 'Nama jalur wajib diisi', variant: 'destructive' })
      return
    }
    try {
      const res = await fetch('/api/settings/jalur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: newJalurNama.trim(), persentase: newJalurPersentase }),
      })
      const data = await res.json()
      if (data.success) {
        const updated = [...jalurConfigs, data.data]
        setJalurConfigs(updated)
        onJalurConfigsChanged(updated)
        setNewJalurNama('')
        setNewJalurPersentase(0)
        setAddJalurOpen(false)
        toast({ title: 'Berhasil', description: `Jalur "${data.data.nama}" berhasil ditambahkan` })
      } else {
        toast({ title: 'Gagal', description: data.error || 'Gagal menambah jalur', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Gagal', description: 'Gagal menambah jalur', variant: 'destructive' })
    }
  }

  // Delete jalur
  const doDeleteJalur = async (id: string, nama: string) => {
    try {
      const res = await fetch(`/api/settings/jalur?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        const updated = jalurConfigs.filter(j => j.id !== id)
        setJalurConfigs(updated)
        onJalurConfigsChanged(updated)
        toast({ title: 'Berhasil', description: data.message })
      } else {
        toast({ title: 'Gagal', description: data.error || 'Gagal menghapus jalur', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Gagal', description: 'Gagal menghapus jalur', variant: 'destructive' })
    }
  }

  // Toggle jalur aktif
  const toggleJalurAktif = async (id: string, aktif: boolean) => {
    try {
      const res = await fetch('/api/settings/jalur', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, aktif }),
      })
      const data = await res.json()
      if (data.success) {
        const updated = jalurConfigs.map(j => j.id === id ? { ...j, aktif } : j)
        setJalurConfigs(updated)
        onJalurConfigsChanged(updated)
      }
    } catch {
      toast({ title: 'Gagal', description: 'Gagal mengubah status jalur', variant: 'destructive' })
    }
  }

  // Portal Sync function
  const handlePortalSync = async () => {
    if (!portalSyncEmail.trim() || !portalSyncPassword.trim()) {
      toast({ title: 'Gagal', description: 'Email dan password portal wajib diisi', variant: 'destructive' })
      return
    }
    setPortalSyncing(true)
    setPortalSyncResult(null)
    try {
      const res = await fetch('/api/portal-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: portalSyncEmail.trim(),
          password: portalSyncPassword,
          pages: portalSyncPages,
          status: portalSyncStatus,
        }),
      })
      const data = await res.json()
      if (data.error) {
        setPortalSyncResult({ success: false, message: data.error })
        toast({ title: 'Gagal', description: data.error, variant: 'destructive' })
      } else {
        setPortalSyncResult({
          success: true,
          message: data.message,
          created: data.created,
          updated: data.updated,
          unchanged: data.unchanged,
          total: data.total,
        })
        toast({
          title: '✅ Sinkronisasi Berhasil',
          description: data.message,
        })
        onDataChanged()
      }
    } catch {
      const errMsg = 'Terjadi kesalahan saat sinkronisasi'
      setPortalSyncResult({ success: false, message: errMsg })
      toast({ title: 'Gagal', description: errMsg, variant: 'destructive' })
    } finally {
      setPortalSyncing(false)
    }
  }

  return (
    <>
      {/* Header */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-cyan-600 p-4 sm:p-6 text-white">
          <div className="flex items-center gap-2 sm:gap-3">
            <Settings className="w-6 h-6 sm:w-8 sm:h-8" />
            <div>
              <h2 className="text-lg sm:text-2xl font-bold tracking-wide">PENGATURAN KUOTA</h2>
              <p className="text-sky-100 mt-0.5 sm:mt-1 text-xs sm:text-sm">SPMB 2026 — Atur kuota siswa dan persentase jalur pendaftaran</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Kuota Siswa */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-sky-600" />
            Kuota Siswa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm text-gray-500 font-medium">Jumlah Total Kuota Siswa Baru</label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="number"
                  min={0}
                  value={kuota}
                  onChange={(e) => setKuota(parseInt(e.target.value) || 0)}
                  className="max-w-[200px] text-lg font-bold"
                  placeholder="Masukkan kuota..."
                />
                <Button
                  onClick={saveKuota}
                  disabled={settingsSaving}
                  className="bg-sky-600 hover:bg-sky-700"
                >
                  {settingsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Simpan
                </Button>
              </div>
            </div>
            <div className="bg-sky-50 rounded-xl p-5 text-center border border-sky-100 min-w-[160px]">
              <p className="text-4xl font-bold text-sky-700">{kuota}</p>
              <p className="text-xs text-sky-600 font-medium mt-1">Total Kuota</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribusi Jalur */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardCheck className="w-5 h-5 text-amber-600" />
              Distribusi Jalur Pendaftaran
            </CardTitle>
            <Button
              onClick={() => setAddJalurOpen(true)}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4" />
              Tambah Jalur
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {settingsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <p className="text-sm text-gray-400 ml-2">Memuat pengaturan...</p>
            </div>
          ) : jalurConfigs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Belum ada jalur yang dikonfigurasi</p>
              <Button className="mt-3 bg-emerald-600 hover:bg-emerald-700" onClick={() => setAddJalurOpen(true)}>
                <Plus className="w-4 h-4" /> Tambah Jalur Pertama
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Total percentage bar */}
              {(() => {
                const totalPersen = jalurConfigs.filter(j => j.aktif).reduce((sum, j) => sum + j.persentase, 0)
                const totalSiswa = jalurConfigs.filter(j => j.aktif).reduce((sum, j) => sum + Math.round(kuota * j.persentase / 100), 0)
                return (
                  <div className={`rounded-xl p-4 border-2 ${totalPersen === 100 ? 'bg-emerald-50 border-emerald-300' : totalPersen > 100 ? 'bg-red-50 border-red-300' : 'bg-amber-50 border-amber-300'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {totalPersen === 100 ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> :
                         totalPersen > 100 ? <AlertTriangle className="w-5 h-5 text-red-600" /> :
                         <AlertCircle className="w-5 h-5 text-amber-600" />}
                        <span className="font-semibold text-sm">
                          Total Persentase: {totalPersen.toFixed(1)}%
                        </span>
                      </div>
                      <span className="text-sm font-medium">
                        Total Siswa: <strong>{totalSiswa}</strong> dari {kuota} kuota
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${totalPersen === 100 ? 'bg-emerald-500' : totalPersen > 100 ? 'bg-red-500' : 'bg-amber-500'}`}
                        style={{ width: `${Math.min(totalPersen, 100)}%` }}
                      />
                    </div>
                    {totalPersen !== 100 && (
                      <p className={`text-xs mt-2 ${totalPersen > 100 ? 'text-red-600' : 'text-amber-600'}`}>
                        {totalPersen > 100
                          ? `⚠ Persentase melebihi 100%! Kurangi ${(totalPersen - 100).toFixed(1)}%`
                          : `ℹ Persentase belum 100%. Tambahkan ${(100 - totalPersen).toFixed(1)}% lagi`
                        }
                      </p>
                    )}
                  </div>
                )
              })()}

              {/* Jalur list */}
              <div className="border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-sky-50/80">
                      <TableHead className="w-10 text-center">No</TableHead>
                      <TableHead>Jalur</TableHead>
                      <TableHead className="w-32 text-center">Persentase</TableHead>
                      <TableHead className="w-40 text-center">Jumlah Siswa</TableHead>
                      <TableHead className="w-24 text-center">Status</TableHead>
                      <TableHead className="w-28 text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jalurConfigs.map((jalur, idx) => {
                      const jumlahSiswa = Math.round(kuota * jalur.persentase / 100)
                      const barWidth = Math.min(jalur.persentase, 100)
                      return (
                        <TableRow key={jalur.id} className={!jalur.aktif ? 'opacity-50' : ''}>
                          <TableCell className="text-center text-sm text-gray-500">{idx + 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor:
                                    jalur.nama === 'Domisili' ? '#3b82f6' :
                                    jalur.nama.includes('Afirmasi') || jalur.nama.includes('KTM') ? '#f59e0b' :
                                    jalur.nama.includes('Disabilitas') ? '#8b5cf6' :
                                    jalur.nama === 'Anak Guru' ? '#ec4899' :
                                    jalur.nama === 'Mutasi' ? '#06b6d4' :
                                    jalur.nama.includes('Prestasi') ? '#10b981' :
                                    jalur.nama.includes('Non Akademik') ? '#f97316' :
                                    '#6b7280'
                                }}
                              />
                              <span className="font-medium text-sm">{jalur.nama}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                step={0.5}
                                value={jalur.persentase}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0
                                  setJalurConfigs(prev => prev.map(j => j.id === jalur.id ? { ...j, persentase: val } : j))
                                }}
                                onBlur={() => updateJalurPersentase(jalur.id, jalur.persentase)}
                                className="w-20 text-center text-sm font-bold"
                              />
                              <span className="text-xs text-gray-400">%</span>
                            </div>
                            {/* Mini progress bar */}
                            <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-sky-400 rounded-full transition-all"
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className="text-lg font-bold text-sky-700">{jumlahSiswa}</span>
                              <span className="text-xs text-gray-400">siswa</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <button
                              onClick={() => toggleJalurAktif(jalur.id, !jalur.aktif)}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                                jalur.aktif
                                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}
                            >
                              {jalur.aktif ? <><CheckCircle2 className="w-3 h-3" /> Aktif</> : <><XCircle className="w-3 h-3" /> Nonaktif</>}
                            </button>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => { setConfirmConfig({ title: 'Hapus Jalur', description: `Hapus jalur "${jalur.nama}"?`, variant: 'destructive', onConfirm: () => doDeleteJalur(jalur.id, jalur.nama) }); setConfirmOpen(true) }}
                              title="Hapus jalur"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {jalurConfigs.filter(j => j.aktif).map(jalur => {
                  const jumlahSiswa = Math.round(kuota * jalur.persentase / 100)
                  const colors: Record<string, string> = {
                    'Domisili': 'from-blue-500 to-blue-600',
                    'Afirmasi (KTM)': 'from-amber-500 to-amber-600',
                    'Disabilitas': 'from-purple-500 to-purple-600',
                    'Anak Guru': 'from-pink-500 to-pink-600',
                    'Mutasi': 'from-cyan-500 to-cyan-600',
                    'Prestasi Nilai Rapor': 'from-emerald-500 to-emerald-600',
                    'Prestasi Non Akademik': 'from-orange-500 to-orange-600',
                  }
                  const gradient = colors[jalur.nama] || 'from-gray-500 to-gray-600'
                  return (
                    <div key={jalur.id} className={`rounded-xl p-4 text-white bg-gradient-to-br ${gradient} shadow-sm`}>
                      <p className="text-xs font-medium opacity-80">{jalur.nama}</p>
                      <p className="text-3xl font-bold mt-1">{jumlahSiswa}</p>
                      <p className="text-xs opacity-70 mt-0.5">{jalur.persentase}% dari {kuota}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sinkronisasi Portal SPMB */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="w-5 h-5 text-indigo-600" />
            Sinkronisasi Portal SPMB
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                <div className="text-sm text-indigo-700">
                  <p className="font-medium">Ambil data otomatis dari portal SPMB Sumatera Utara</p>
                  <p className="mt-1 text-indigo-600">Masukkan kredensial login portal untuk mengambil data pendaftar secara otomatis. Data akan disinkronkan dengan database lokal menggunakan deduplikasi NISN.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email Portal
                </label>
                <Input
                  type="email"
                  value={portalSyncEmail}
                  onChange={(e) => setPortalSyncEmail(e.target.value)}
                  placeholder="email@disdik.sumutprov.go.id"
                  className="mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Password Portal
                </label>
                <Input
                  type="password"
                  value={portalSyncPassword}
                  onChange={(e) => setPortalSyncPassword(e.target.value)}
                  placeholder="Masukkan password..."
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Status Pendaftar</label>
                <select
                  value={portalSyncStatus}
                  onChange={(e) => setPortalSyncStatus(e.target.value)}
                  className="mt-1.5 w-full h-10 px-3 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="accepted">Accepted (Diterima)</option>
                  <option value="">Semua Status</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Jumlah Halaman</label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={portalSyncPages}
                  onChange={(e) => setPortalSyncPages(parseInt(e.target.value) || 10)}
                  className="mt-1.5"
                />
                <p className="text-xs text-gray-400 mt-1">Setiap halaman berisi 10 data</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handlePortalSync}
                disabled={portalSyncing}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {portalSyncing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Menyinkronkan...</>
                ) : (
                  <><RefreshCw className="w-4 h-4" /> Mulai Sinkronisasi</>
                )}
              </Button>
              <a
                href="https://adminspmb.disdik.sumutprov.go.id/admin/registration"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:text-indigo-800 underline"
              >
                Buka Portal SPMB ↗
              </a>
            </div>

            {/* Sync Result */}
            {portalSyncResult && (
              <div className={`rounded-xl p-4 border-2 ${portalSyncResult.success ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'}`}>
                <div className="flex items-start gap-3">
                  {portalSyncResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p className={`font-semibold text-sm ${portalSyncResult.success ? 'text-emerald-700' : 'text-red-700'}`}>
                      {portalSyncResult.success ? 'Sinkronisasi Berhasil' : 'Sinkronisasi Gagal'}
                    </p>
                    <p className={`text-sm mt-1 ${portalSyncResult.success ? 'text-emerald-600' : 'text-red-600'}`}>
                      {portalSyncResult.message}
                    </p>
                    {portalSyncResult.success && portalSyncResult.total !== undefined && (
                      <div className="flex items-center gap-4 mt-3">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-emerald-700">{portalSyncResult.created}</p>
                          <p className="text-xs text-emerald-600">Data Baru</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-amber-600">{portalSyncResult.updated}</p>
                          <p className="text-xs text-amber-600">Diperbarui</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-500">{portalSyncResult.unchanged}</p>
                          <p className="text-xs text-gray-500">Tidak Berubah</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-sky-700">{portalSyncResult.total}</p>
                          <p className="text-xs text-sky-700">Total Diambil</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Jalur Dialog */}
      <Dialog open={addJalurOpen} onOpenChange={setAddJalurOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              Tambah Jalur Baru
            </DialogTitle>
            <DialogDescription>Tambahkan jalur pendaftaran baru untuk SPMB 2026</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Nama Jalur</label>
              <Input
                value={newJalurNama}
                onChange={(e) => setNewJalurNama(e.target.value)}
                placeholder="Contoh: Zonasi, Perpindahan Orang Tua"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Persentase Kuota (%)</label>
              <Input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={newJalurPersentase}
                onChange={(e) => setNewJalurPersentase(parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            {newJalurPersentase > 0 && kuota > 0 && (
              <div className="bg-sky-50 rounded-lg p-3 border border-sky-200">
                <p className="text-sm text-sky-700">
                  Estimasi jumlah siswa: <strong>{Math.round(kuota * newJalurPersentase / 100)}</strong> siswa
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAddJalurOpen(false)}>Batal</Button>
            <Button onClick={addJalur} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4" /> Tambah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog (for delete jalur) */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {confirmConfig.variant === 'destructive' ? <AlertTriangle className="w-5 h-5 text-red-600" /> : <AlertCircle className="w-5 h-5 text-amber-600" />}
              {confirmConfig.title}
            </AlertDialogTitle>
            <AlertDialogDescription>{confirmConfig.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className={confirmConfig.variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : ''}
              onClick={() => {
                setConfirmOpen(false)
                confirmConfig.onConfirm()
              }}
            >
              {confirmConfig.variant === 'destructive' ? 'Hapus' : 'Konfirmasi'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
