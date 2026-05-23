'use client'

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
  Settings,
  UserCog,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Save,
  Users,
  ClipboardCheck,
  Globe,
  RefreshCw,
  Lock,
  Mail,
  AlertTriangle,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Upload,
  ShieldCheck,
  ArrowLeftRight,
  Layers,
  Power,
  PowerOff,
} from 'lucide-react'

interface PengaturanTabProps {
  appName: string
  schoolName: string
  authUser: { id: string; username: string; namaLengkap: string; role: string } | null
  // Users
  users: Array<{ id: string; username: string; namaLengkap: string; role: string; aktif: boolean; lastLogin: string | null; createdAt: string }>
  usersLoading: boolean
  addUserOpen: boolean
  setAddUserOpen: (v: boolean) => void
  addUserForm: { username: string; password: string; namaLengkap: string; role: string }
  setAddUserForm: (v: { username: string; password: string; namaLengkap: string; role: string }) => void
  userSaving: boolean
  handleAddUser: () => void
  editUserOpen: boolean
  setEditUserOpen: (v: boolean) => void
  editUserData: { id: string; username: string; namaLengkap: string; role: string; aktif: boolean } | null
  setEditUserData: (v: { id: string; username: string; namaLengkap: string; role: string; aktif: boolean } | null) => void
  editUserForm: { username: string; password: string; namaLengkap: string; role: string; aktif: boolean }
  setEditUserForm: (v: { username: string; password: string; namaLengkap: string; role: string; aktif: boolean }) => void
  handleEditUser: () => void
  deleteUserOpen: boolean
  setDeleteUserOpen: (v: boolean) => void
  deleteUserTarget: { id: string; namaLengkap: string } | null
  setDeleteUserTarget: (v: { id: string; namaLengkap: string } | null) => void
  deleteUserLoading: boolean
  handleDeleteUser: () => void
  // Profile
  editProfileOpen: boolean
  setEditProfileOpen: (v: boolean) => void
  editProfileForm: { username: string; password: string; namaLengkap: string }
  setEditProfileForm: (v: { username: string; password: string; namaLengkap: string }) => void
  editProfileSaving: boolean
  handleUpdateProfile: () => void
  // App Name
  setAppName: (v: string) => void
  setSchoolName: (v: string) => void
  appIcon: string
  setAppIcon: (v: string) => void
  appSubtitle: string
  setAppSubtitle: (v: string) => void
  saveAppName: () => void
  settingsSaving: boolean
  // Kuota
  kuota: number
  setKuota: (v: number) => void
  saveKuota: () => void
  // Jalur
  jalurConfigs: Array<{ id: string; nama: string; persentase: number; urutan: number; aktif: boolean }>
  setJalurConfigs: (v: Array<{ id: string; nama: string; persentase: number; urutan: number; aktif: boolean }> | ((prev: Array<{ id: string; nama: string; persentase: number; urutan: number; aktif: boolean }>) => Array<{ id: string; nama: string; persentase: number; urutan: number; aktif: boolean }>)) => void
  updateJalurPersentase: (id: string, persentase: number) => void
  addJalurOpen: boolean
  setAddJalurOpen: (v: boolean) => void
  newJalurNama: string
  setNewJalurNama: (v: string) => void
  newJalurPersentase: number
  setNewJalurPersentase: (v: number) => void
  addJalur: () => void
  deleteJalur: (id: string, nama: string) => void
  toggleJalurAktif: (id: string, aktif: boolean) => void
  settingsLoading: boolean
  // Portal Sync
  portalSyncEmail: string
  setPortalSyncEmail: (v: string) => void
  portalSyncPassword: string
  setPortalSyncPassword: (v: string) => void
  portalSyncStatus: string
  setPortalSyncStatus: (v: string) => void
  portalSyncPages: number
  setPortalSyncPages: (v: number) => void
  portalSyncing: boolean
  handlePortalSync: () => void
  portalSyncResult: { success: boolean; message: string; created?: number; updated?: number; unchanged?: number; total?: number } | null
  // Reset Password
  resetPasswordOpen: boolean
  setResetPasswordOpen: (v: boolean) => void
  resetPasswordTarget: { id: string; username: string; namaLengkap: string } | null
  resetPasswordNew: string
  setResetPasswordNew: (v: string) => void
  resetPasswordLoading: boolean
  handleResetPassword: () => void
  showResetPassword: boolean
  setShowResetPassword: (v: boolean) => void
  // Tahap Pendaftaran
  tahap: number
  setTahap: (v: number) => void
  jalurAktifPerTahap: string
  setJalurAktifPerTahap: (v: string) => void
  fetchStats: () => void
  fetchRegistrations: () => void
  fetchRanking: () => void
}

export default function PengaturanTab(props: PengaturanTabProps) {
  const {
    appName, schoolName, authUser,
    users, usersLoading,
    addUserOpen, setAddUserOpen,
    addUserForm, setAddUserForm,
    userSaving, handleAddUser,
    editUserOpen, setEditUserOpen,
    editUserData, setEditUserData, editUserForm, setEditUserForm,
    handleEditUser,
    deleteUserOpen, setDeleteUserOpen,
    deleteUserTarget, setDeleteUserTarget, deleteUserLoading, handleDeleteUser,
    editProfileOpen, setEditProfileOpen,
    editProfileForm, setEditProfileForm,
    editProfileSaving, handleUpdateProfile,
    setAppName, setSchoolName, appIcon, setAppIcon, appSubtitle, setAppSubtitle, saveAppName, settingsSaving,
    kuota, setKuota, saveKuota,
    jalurConfigs, setJalurConfigs,
    updateJalurPersentase,
    addJalurOpen, setAddJalurOpen,
    newJalurNama, setNewJalurNama,
    newJalurPersentase, setNewJalurPersentase,
    addJalur, deleteJalur, toggleJalurAktif,
    settingsLoading,
    portalSyncEmail, setPortalSyncEmail,
    portalSyncPassword, setPortalSyncPassword,
    portalSyncStatus, setPortalSyncStatus,
    portalSyncPages, setPortalSyncPages,
    portalSyncing, handlePortalSync,
    portalSyncResult,
    resetPasswordOpen, setResetPasswordOpen,
    resetPasswordTarget, resetPasswordNew, setResetPasswordNew,
    resetPasswordLoading, handleResetPassword,
    showResetPassword, setShowResetPassword,
    tahap, setTahap,
    jalurAktifPerTahap, setJalurAktifPerTahap,
    fetchStats, fetchRegistrations, fetchRanking,
  } = props

  // Handle tahap switch
  const handleSwitchTahap = async (targetTahap: number) => {
    if (targetTahap === tahap) return

    try {
      // 1. Save current jalur activation as snapshot for current tahap
      const currentMapping: Record<string, string[]> = jalurAktifPerTahap ? JSON.parse(jalurAktifPerTahap) : {}
      currentMapping[tahap.toString()] = jalurConfigs.filter(j => j.aktif).map(j => j.id)

      // 2. Determine target tahap's jalur activation
      let targetActiveIds = currentMapping[targetTahap.toString()]
      if (!targetActiveIds || targetActiveIds.length === 0) {
        // Default: all jalur active — admin can toggle manually
        targetActiveIds = jalurConfigs.map(j => j.id)
        currentMapping[targetTahap.toString()] = targetActiveIds
      }

      const newJalurAktifPerTahap = JSON.stringify(currentMapping)

      // 3. Save to backend
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tahap: targetTahap,
          jalurAktifPerTahap: newJalurAktifPerTahap,
        }),
      })
      const data = await res.json()

      if (data.success) {
        // 4. Update UI state
        setTahap(targetTahap)
        setJalurAktifPerTahap(newJalurAktifPerTahap)

        // 5. Update jalurConfigs aktif flags in UI
        const activeIdsSet = new Set(targetActiveIds)
        setJalurConfigs(prev => prev.map(j => ({ ...j, aktif: activeIdsSet.has(j.id) })))

        // 6. Refetch all data
        fetchStats()
        fetchRegistrations()
        fetchRanking()
      }
    } catch {
      // Silently fail
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
              <h2 className="text-lg sm:text-2xl font-bold tracking-wide">PENGATURAN SISTEM</h2>
              <p className="text-sky-100 mt-0.5 sm:mt-1 text-xs sm:text-sm">{appName}{schoolName ? ` — ${schoolName}` : ''} — Atur user, kuota siswa, dan persentase jalur pendaftaran</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Manajemen User */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg"><UserCog className="w-5 h-5 text-violet-600" /> Manajemen User</CardTitle>
            <Button onClick={() => { setAddUserForm({ username: '', password: '', namaLengkap: '', role: 'verifikator' }); setAddUserOpen(true) }} size="sm" className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4" /> Tambah User</Button>
          </div>
        </CardHeader>
        <CardContent>
          {authUser && (
            <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                    <span className="text-lg font-bold text-white">{authUser.namaLengkap?.charAt(0) || 'A'}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{authUser.namaLengkap}</p>
                    <p className="text-xs text-gray-500">@{authUser.username} · <span className="text-violet-600 font-medium">{authUser.role === 'admin' ? 'Administrator' : 'Verifikator'}</span></p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setEditProfileForm({ username: authUser.username, password: '', namaLengkap: authUser.namaLengkap }); setEditProfileOpen(true) }} className="border-violet-200 text-violet-700 hover:bg-violet-50"><Pencil className="w-3.5 h-3.5 mr-1" /> Edit Profil</Button>
              </div>
            </div>
          )}
          {usersLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /><p className="text-sm text-gray-400 ml-2">Memuat data user...</p></div>
          ) : (
            <div className="border rounded-xl overflow-hidden">
              <Table>
                <TableHeader><TableRow className="bg-violet-50/80"><TableHead className="w-10 text-center">No</TableHead><TableHead>Username</TableHead><TableHead>Nama Lengkap</TableHead><TableHead className="w-28 text-center">Role</TableHead><TableHead className="w-24 text-center">Status</TableHead><TableHead className="w-36 text-center">Login Terakhir</TableHead><TableHead className="w-28 text-right">Aksi</TableHead></TableRow></TableHeader>
                <TableBody>
                  {users.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-400">Belum ada user terdaftar</TableCell></TableRow> : users.map((user, idx) => (
                    <TableRow key={user.id} className={!user.aktif ? 'opacity-50' : ''}>
                      <TableCell className="text-center text-sm text-gray-500">{idx + 1}</TableCell>
                      <TableCell className="font-mono text-sm">@{user.username}</TableCell>
                      <TableCell className="font-medium text-sm">{user.namaLengkap}</TableCell>
                      <TableCell className="text-center"><Badge className={`text-[10px] px-2 py-0.5 ${user.role === 'admin' ? 'bg-violet-100 text-violet-700 border border-violet-200' : 'bg-sky-100 text-sky-700 border border-sky-200'}`}>{user.role === 'admin' ? 'Admin' : 'Verifikator'}</Badge></TableCell>
                      <TableCell className="text-center"><span className={`inline-flex items-center gap-1 text-xs font-medium ${user.aktif ? 'text-emerald-600' : 'text-gray-400'}`}>{user.aktif ? <><CheckCircle2 className="w-3 h-3" /> Aktif</> : <><XCircle className="w-3 h-3" /> Nonaktif</>}</span></TableCell>
                      <TableCell className="text-center text-xs text-gray-400">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-800 hover:bg-amber-50 h-8 w-8 p-0" onClick={() => { setResetPasswordTarget({ id: user.id, username: user.username, namaLengkap: user.namaLengkap }); setResetPasswordNew(''); setResetPasswordOpen(true) }} title="Reset Password"><KeyRound className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-800 hover:bg-violet-50 h-8 w-8 p-0" onClick={() => { setEditUserData({ id: user.id, username: user.username, namaLengkap: user.namaLengkap, role: user.role, aktif: user.aktif }); setEditUserForm({ username: user.username, password: '', namaLengkap: user.namaLengkap, role: user.role, aktif: user.aktif }); setEditUserOpen(true) }} title="Edit user"><Pencil className="w-3.5 h-3.5" /></Button>
                          {user.id !== authUser?.id && <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0" onClick={() => { setDeleteUserTarget({ id: user.id, namaLengkap: user.namaLengkap }); setDeleteUserOpen(true) }} title="Hapus user"><Trash2 className="w-3.5 h-3.5" /></Button>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Identitas Aplikasi */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg"><Pencil className="w-5 h-5 text-emerald-600" /> Identitas Aplikasi</CardTitle><CardDescription>Atur nama aplikasi, nama sekolah, deskripsi, dan ikon yang ditampilkan di browser dan header</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Icon Preview & Upload */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg overflow-hidden border-2 border-emerald-200">
                  {appIcon ? (
                    <img src={appIcon} alt="Ikon Aplikasi" className="w-full h-full object-cover" />
                  ) : (
                    <ShieldCheck className="w-10 h-10 text-white" />
                  )}
                </div>
                <div className="flex gap-1">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        if (file.size > 2 * 1024 * 1024) {
                          alert('Ukuran file maksimal 2MB')
                          return
                        }
                        const reader = new FileReader()
                        reader.onload = (ev) => {
                          const result = ev.target?.result as string
                          setAppIcon(result)
                        }
                        reader.readAsDataURL(file)
                      }}
                    />
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors">
                      <Upload className="w-3 h-3" /> Upload
                    </span>
                  </label>
                  {appIcon && (
                    <button
                      onClick={() => setAppIcon('')}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 text-center max-w-[120px]">PNG/JPG/SVG, maks 2MB</p>
              </div>

              {/* Name Fields */}
              <div className="flex-1 space-y-3 w-full">
                <div>
                  <label className="text-sm text-gray-500 font-medium">Nama Aplikasi</label>
                  <p className="text-[10px] text-gray-400">Ditampilkan di judul browser dan header (contoh: SPMB 2026)</p>
                  <Input value={appName} onChange={(e) => setAppName(e.target.value)} className="text-lg font-bold mt-1" placeholder="Contoh: SPMB 2026" />
                </div>
                <div>
                  <label className="text-sm text-gray-500 font-medium">Nama Sekolah</label>
                  <p className="text-[10px] text-gray-400">Ditampilkan di bawah nama aplikasi (contoh: SMA Negeri 1 Telukdalam)</p>
                  <Input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="text-base font-semibold mt-1" placeholder="Contoh: SMA Negeri 1 Telukdalam" />
                </div>
                <div>
                  <label className="text-sm text-gray-500 font-medium">Deskripsi / Subtitle</label>
                  <p className="text-[10px] text-gray-400">Ditampilkan di bawah nama sekolah. Tekan Enter untuk baris baru.</p>
                  <textarea
                    value={appSubtitle}
                    onChange={(e) => setAppSubtitle(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm font-medium border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                    rows={2}
                    placeholder="Contoh: Sistem Verifikasi Penerimaan Murid Baru"
                  />
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div className="rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-4">
              <p className="text-[10px] text-emerald-500 font-medium mb-2 text-center">PREVIEW</p>
              <div className="flex items-center gap-3 justify-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md overflow-hidden">
                  {appIcon ? (
                    <img src={appIcon} alt="Ikon" className="w-full h-full object-cover" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-lg font-bold text-emerald-700 leading-tight">{appName || 'SPMB 2026'}</p>
                  {schoolName && <p className="text-sm font-semibold text-emerald-600">{schoolName}</p>}
                  {appSubtitle && appSubtitle.split('\n').map((line, i) => (
                    <p key={i} className="text-xs text-emerald-500/80">{line}</p>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={saveAppName} disabled={settingsSaving} className="bg-emerald-600 hover:bg-emerald-700">{settingsSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}Simpan Identitas</Button>
              <p className="text-xs text-gray-400">Perubahan akan langsung terlihat di header, tab browser, dan favicon</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tahap & Jalur Pendaftaran */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Layers className="w-5 h-5 text-amber-600" />
                Tahap & Jalur Pendaftaran
              </CardTitle>
              <CardDescription>Klik toggle untuk mengaktifkan/menonaktifkan jalur di setiap tahap. Data antar tahap terpisah.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => handleSwitchTahap(tahap === 1 ? 2 : 1)} size="sm" variant="outline" className="text-amber-700 border-amber-200 hover:bg-amber-50 h-8">
                <ArrowLeftRight className="w-3.5 h-3.5 mr-1" />
                Ganti ke Tahap {tahap === 1 ? 2 : 1}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current Tahap Indicator */}
            <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-xl p-4 border-2 border-amber-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
                    <span className="text-xl font-bold text-white">{tahap}</span>
                  </div>
                  <div>
                    <p className="text-sm text-amber-600 font-medium">Tahap Aktif Saat Ini</p>
                    <p className="text-lg font-bold text-amber-800">Tahap {tahap}</p>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-300 px-3 py-1">
                  {jalurConfigs.filter(j => j.aktif).length} dari {jalurConfigs.length} jalur aktif
                </Badge>
              </div>
            </div>

            {/* JALUR × TAHAP Matrix */}
            {(() => {
              // Parse existing tahap configurations
              const tahapMapping: Record<string, string[]> = jalurAktifPerTahap ? JSON.parse(jalurAktifPerTahap) : {}
              // Always ensure current tahap's config exists
              if (!tahapMapping[tahap.toString()]) {
                tahapMapping[tahap.toString()] = jalurConfigs.filter(j => j.aktif).map(j => j.id)
              }
              // Find all tahap numbers
              const allTahapNumbers = Object.keys(tahapMapping).map(Number).sort((a, b) => a - b)
              if (!allTahapNumbers.includes(1)) allTahapNumbers.push(1)
              if (!allTahapNumbers.includes(2)) allTahapNumbers.push(2)
              allTahapNumbers.sort((a, b) => a - b)

              // Helper: toggle a jalur in a specific tahap
              const toggleJalurDiTahap = (jalurId: string, targetTahap: number) => {
                const newMapping = { ...tahapMapping }
                const currentIds = newMapping[targetTahap.toString()] || []
                let newIds: string[]
                if (currentIds.includes(jalurId)) {
                  newIds = currentIds.filter(id => id !== jalurId)
                } else {
                  newIds = [...currentIds, jalurId]
                }
                newMapping[targetTahap.toString()] = newIds
                const newJalurAktifPerTahap = JSON.stringify(newMapping)

                // If toggling current tahap, also update jalurConfigs.aktif in UI
                if (targetTahap === tahap) {
                  const isActive = newIds.includes(jalurId)
                  toggleJalurAktif(jalurId, isActive)
                }

                // Save mapping
                setJalurAktifPerTahap(newJalurAktifPerTahap)
                fetch('/api/settings', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ jalurAktifPerTahap: newJalurAktifPerTahap }),
                })
              }

              // Jalur color dot helper
              const getDotColor = (nama: string) => {
                const lower = nama.toLowerCase()
                // Check non-akademik first before generic "akademik" or "prestasi"
                if (lower.includes('non akademik') || lower.includes('nonakademik') || lower.includes('non-akademik')) return 'bg-orange-500'
                if (lower.includes('domisili') || lower.includes('zonasi')) return 'bg-blue-500'
                if (lower.includes('ktm') || lower.includes('afirmasi') || lower.includes('tidak mampu')) return 'bg-amber-500'
                if (lower.includes('disabilitas')) return 'bg-purple-500'
                if (lower.includes('anak guru')) return 'bg-pink-500'
                if (lower.includes('mutasi') || lower.includes('perpindahan')) return 'bg-cyan-500'
                if (lower.includes('akademik') || lower.includes('prestasi') || lower.includes('rapor')) return 'bg-emerald-500'
                if (lower.includes('bencana')) return 'bg-red-500'
                return 'bg-gray-500'
              }

              return (
                <div className="space-y-3">
                  {/* Matrix Grid */}
                  <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                    {/* Header Row */}
                    <div className="grid bg-gray-50 border-b-2 border-gray-200" style={{ gridTemplateColumns: `1fr repeat(${allTahapNumbers.length}, minmax(100px, 1fr))` }}>
                      <div className="px-4 py-2.5 font-semibold text-sm text-gray-700 flex items-center gap-2">
                        <ClipboardCheck className="w-4 h-4 text-gray-500" />
                        Jalur Pendaftaran
                      </div>
                      {allTahapNumbers.map(t => (
                        <div key={t} className={`px-3 py-2.5 text-center border-l border-gray-200 ${t === tahap ? 'bg-amber-50' : ''}`}>
                          <div className="flex flex-col items-center gap-0.5">
                            <span className={`text-xs font-bold ${t === tahap ? 'text-amber-700' : 'text-gray-600'}`}>
                              Tahap {t}
                            </span>
                            {t === tahap && (
                              <Badge className="bg-amber-200 text-amber-800 text-[8px] px-1 py-0 leading-3">AKTIF</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Jalur Rows */}
                    {jalurConfigs.map((jalur, idx) => {
                      const dotColor = getDotColor(jalur.nama)
                      return (
                        <div
                          key={jalur.id}
                          className={`grid border-b border-gray-100 last:border-b-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                          style={{ gridTemplateColumns: `1fr repeat(${allTahapNumbers.length}, minmax(100px, 1fr))` }}
                        >
                          {/* Jalur Name Cell */}
                          <div className="px-4 py-2.5 flex items-center gap-2.5">
                            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor}`} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{jalur.nama}</p>
                              <p className="text-[10px] text-gray-400">{jalur.persentase}%</p>
                            </div>
                          </div>

                          {/* Tahap Toggle Cells */}
                          {allTahapNumbers.map(t => {
                            const isActiveInTahap = (tahapMapping[t.toString()] || []).includes(jalur.id)
                            const isCurrentTahap = t === tahap

                            return (
                              <div
                                key={t}
                                className={`px-3 py-2.5 flex items-center justify-center border-l border-gray-100 ${isCurrentTahap ? 'bg-amber-50/30' : ''}`}
                              >
                                <button
                                  onClick={() => toggleJalurDiTahap(jalur.id, t)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 transition-all text-xs font-semibold ${
                                    isActiveInTahap
                                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shadow-sm'
                                      : 'border-gray-200 bg-gray-50 text-gray-400 hover:bg-gray-100'
                                  }`}
                                >
                                  {isActiveInTahap ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      Aktif
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-3.5 h-3.5" />
                                      Off
                                    </>
                                  )}
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>

                  {/* Summary per Tahap */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {allTahapNumbers.map(t => {
                      const activeInTahap = jalurConfigs.filter(j => (tahapMapping[t.toString()] || []).includes(j.id))
                      const isCurrentTahap = t === tahap
                      return (
                        <button
                          key={t}
                          onClick={() => { if (!isCurrentTahap) handleSwitchTahap(t) }}
                          className={`rounded-xl p-3 border-2 text-left transition-all ${
                            isCurrentTahap
                              ? 'border-amber-400 bg-amber-50 shadow-sm cursor-default'
                              : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/30 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                              isCurrentTahap ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {t}
                            </div>
                            <span className={`text-xs font-semibold ${isCurrentTahap ? 'text-amber-700' : 'text-gray-600'}`}>
                              Tahap {t}
                            </span>
                            {isCurrentTahap && <Badge className="bg-amber-200 text-amber-800 text-[8px] px-1 py-0 leading-3">AKTIF</Badge>}
                          </div>
                          <p className="text-[10px] text-gray-400 leading-relaxed">
                            {activeInTahap.length > 0
                              ? activeInTahap.map(j => j.nama).join(', ')
                              : 'Belum ada jalur aktif'}
                          </p>
                          <p className="text-[10px] text-gray-300 mt-0.5">
                            {activeInTahap.length} jalur aktif
                          </p>
                        </button>
                      )
                    })}

                    {/* Add Tahap */}
                    {(() => {
                      const maxTahap = allTahapNumbers.length > 0 ? Math.max(...allTahapNumbers) : 0
                      return (
                        <button
                          onClick={() => {
                            const nextTahap = maxTahap + 1
                            const newMapping = { ...tahapMapping }
                            newMapping[nextTahap.toString()] = []
                            const newJalurAktifPerTahap = JSON.stringify(newMapping)
                            setJalurAktifPerTahap(newJalurAktifPerTahap)
                            fetch('/api/settings', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ jalurAktifPerTahap: newJalurAktifPerTahap }),
                            })
                          }}
                          className="rounded-xl p-3 border-2 border-dashed border-gray-200 hover:border-amber-300 hover:bg-amber-50/20 transition-all flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-amber-600"
                        >
                          <Plus className="w-4 h-4" />
                          <span className="text-[10px] font-medium">Tambah Tahap</span>
                        </button>
                      )
                    })()}
                  </div>

                  {/* Delete tahap */}
                  {(() => {
                    const deletableTahaps = allTahapNumbers.filter(t => t !== tahap && t > 1)
                    if (deletableTahaps.length > 0) {
                      return (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-gray-400">Hapus tahap:</span>
                          {deletableTahaps.map(t => (
                            <button
                              key={t}
                              onClick={() => {
                                const newMapping = { ...tahapMapping }
                                delete newMapping[t.toString()]
                                const newJalurAktifPerTahap = JSON.stringify(newMapping)
                                setJalurAktifPerTahap(newJalurAktifPerTahap)
                                fetch('/api/settings', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ jalurAktifPerTahap: newJalurAktifPerTahap }),
                                })
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" /> Tahap {t}
                            </button>
                          ))}
                        </div>
                      )
                    }
                    return null
                  })()}
                </div>
              )
            })()}

            {/* Info Box */}
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-sky-600 mt-0.5 shrink-0" />
                <div className="text-sm text-sky-700">
                  <p className="font-medium">Cara mengatur:</p>
                  <ul className="mt-1 space-y-1 text-sky-600 list-disc list-inside">
                    <li><strong>Klik "Aktif/Off"</strong> di kolom tahap untuk mengatur jalur aktif di tahap tersebut</li>
                    <li>Contoh: Domisili → Aktif di Tahap 1, Off di Tahap 2</li>
                    <li>Contoh: Prestasi Nonakademik → Off di Tahap 1, Aktif di Tahap 2</li>
                    <li>Klik <strong>kartu tahap</strong> di bawah tabel untuk berpindah tahap aktif</li>
                    <li>Data pendaftar antar tahap <strong>terpisah sepenuhnya</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kuota Siswa */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg"><Users className="w-5 h-5 text-sky-600" /> Kuota Siswa</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1"><label className="text-sm text-gray-500 font-medium">Jumlah Total Kuota Siswa Baru</label>
              <div className="flex items-center gap-2 mt-2"><Input type="number" min={0} value={kuota} onChange={(e) => setKuota(parseInt(e.target.value) || 0)} className="max-w-[200px] text-lg font-bold" placeholder="Masukkan kuota..." /><Button onClick={saveKuota} disabled={settingsSaving} className="bg-sky-600 hover:bg-sky-700">{settingsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Simpan</Button></div>
            </div>
            <div className="bg-sky-50 rounded-xl p-5 text-center border border-sky-100 min-w-[160px]"><p className="text-4xl font-bold text-sky-700">{kuota}</p><p className="text-xs text-sky-600 font-medium mt-1">Total Kuota</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Distribusi Jalur */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg"><ClipboardCheck className="w-5 h-5 text-amber-600" /> Distribusi Jalur Pendaftaran</CardTitle>
            <Button onClick={() => setAddJalurOpen(true)} size="sm" className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4" /> Tambah Jalur</Button>
          </div>
        </CardHeader>
        <CardContent>
          {settingsLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /><p className="text-sm text-gray-400 ml-2">Memuat pengaturan...</p></div>
          ) : jalurConfigs.length === 0 ? (
            <div className="text-center py-12"><p className="text-gray-500">Belum ada jalur yang dikonfigurasi</p><Button className="mt-3 bg-emerald-600 hover:bg-emerald-700" onClick={() => setAddJalurOpen(true)}><Plus className="w-4 h-4" /> Tambah Jalur Pertama</Button></div>
          ) : (
            <div className="space-y-3">
              {(() => {
                const totalPersen = jalurConfigs.filter(j => j.aktif).reduce((sum, j) => sum + j.persentase, 0)
                const totalSiswa = jalurConfigs.filter(j => j.aktif).reduce((sum, j) => sum + Math.round(kuota * j.persentase / 100), 0)
                return (
                  <div className={`rounded-xl p-4 border-2 ${totalPersen === 100 ? 'bg-emerald-50 border-emerald-300' : totalPersen > 100 ? 'bg-red-50 border-red-300' : 'bg-amber-50 border-amber-300'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">{totalPersen === 100 ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : totalPersen > 100 ? <AlertTriangle className="w-5 h-5 text-red-600" /> : <AlertCircle className="w-5 h-5 text-amber-600" />}<span className="font-semibold text-sm">Total Persentase: {totalPersen.toFixed(1)}%</span></div>
                      <span className="text-sm font-medium">Total Siswa: <strong>{totalSiswa}</strong> dari {kuota} kuota</span>
                    </div>
                    <div className="mt-2 h-3 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-500 ${totalPersen === 100 ? 'bg-emerald-500' : totalPersen > 100 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(totalPersen, 100)}%` }} /></div>
                    {totalPersen !== 100 && <p className={`text-xs mt-2 ${totalPersen > 100 ? 'text-red-600' : 'text-amber-600'}`}>{totalPersen > 100 ? `⚠ Persentase melebihi 100%! Kurangi ${(totalPersen - 100).toFixed(1)}%` : `ℹ Persentase belum 100%. Tambahkan ${(100 - totalPersen).toFixed(1)}% lagi`}</p>}
                  </div>
                )
              })()}
              <div className="border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader><TableRow className="bg-sky-50/80"><TableHead className="w-10 text-center">No</TableHead><TableHead>Jalur</TableHead><TableHead className="w-32 text-center">Persentase</TableHead><TableHead className="w-40 text-center">Jumlah Siswa</TableHead><TableHead className="w-24 text-center">Status</TableHead><TableHead className="w-28 text-right">Aksi</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {jalurConfigs.map((jalur, idx) => {
                      const jumlahSiswa = Math.round(kuota * jalur.persentase / 100)
                      const barWidth = Math.min(jalur.persentase, 100)
                      return (
                        <TableRow key={jalur.id} className={!jalur.aktif ? 'opacity-50' : ''}>
                          <TableCell className="text-center text-sm text-gray-500">{idx + 1}</TableCell>
                          <TableCell><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: jalur.nama.toLowerCase().includes('non akademik') || jalur.nama.toLowerCase().includes('nonakademik') ? '#f97316' : jalur.nama === 'Domisili' ? '#3b82f6' : jalur.nama.includes('Afirmasi') || jalur.nama.includes('KTM') ? '#f59e0b' : jalur.nama.includes('Disabilitas') ? '#8b5cf6' : jalur.nama === 'Anak Guru' ? '#ec4899' : jalur.nama === 'Mutasi' ? '#06b6d4' : jalur.nama.includes('Prestasi') || jalur.nama.includes('Akademik') ? '#10b981' : jalur.nama.includes('Bencana') ? '#ef4444' : '#6b7280' }} /><span className="font-medium text-sm">{jalur.nama}</span></div></TableCell>
                          <TableCell className="text-center"><div className="flex items-center justify-center gap-1"><Input type="number" min={0} max={100} step={0.5} value={jalur.persentase} onChange={(e) => { const val = parseFloat(e.target.value) || 0; setJalurConfigs(prev => prev.map(j => j.id === jalur.id ? { ...j, persentase: val } : j)) }} onBlur={() => updateJalurPersentase(jalur.id, jalur.persentase)} className="w-20 text-center text-sm font-bold" /><span className="text-xs text-gray-400">%</span></div><div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-sky-400 rounded-full transition-all" style={{ width: `${barWidth}%` }} /></div></TableCell>
                          <TableCell className="text-center"><div className="inline-flex flex-col items-center"><span className="text-lg font-bold text-sky-700">{jumlahSiswa}</span><span className="text-xs text-gray-400">siswa</span></div></TableCell>
                          <TableCell className="text-center"><button onClick={() => toggleJalurAktif(jalur.id, !jalur.aktif)} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${jalur.aktif ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{jalur.aktif ? <><CheckCircle2 className="w-3 h-3" /> Aktif</> : <><XCircle className="w-3 h-3" /> Nonaktif</>}</button></TableCell>
                          <TableCell className="text-right"><Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => deleteJalur(jalur.id, jalur.nama)} title="Hapus jalur"><Trash2 className="w-4 h-4" /></Button></TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {jalurConfigs.filter(j => j.aktif).map(jalur => {
                  const jumlahSiswa = Math.round(kuota * jalur.persentase / 100)
                  const colors: Record<string, string> = { 'Domisili': 'from-blue-500 to-blue-600', 'Afirmasi (KTM)': 'from-amber-500 to-amber-600', 'Keluarga Tidak Mampu': 'from-amber-500 to-amber-600', 'Disabilitas': 'from-purple-500 to-purple-600', 'Penyandang Disabilitas': 'from-purple-500 to-purple-600', 'Anak Guru': 'from-pink-500 to-pink-600', 'Mutasi': 'from-cyan-500 to-cyan-600', 'Mutasi Orangtua/Wali': 'from-cyan-500 to-cyan-600', 'Prestasi Nilai Rapor': 'from-emerald-500 to-emerald-600', 'Prestasi Akademik': 'from-emerald-500 to-emerald-600', 'Prestasi Non Akademik': 'from-orange-500 to-orange-600', 'Prestasi Nonakademik': 'from-orange-500 to-orange-600', 'Prestasi Non-Akademik': 'from-orange-500 to-orange-600', 'Terdampak Bencana Alam': 'from-red-500 to-red-600' }
                  const gradient = colors[jalur.nama] || 'from-gray-500 to-gray-600'
                  return (<div key={jalur.id} className={`rounded-xl p-4 text-white bg-gradient-to-br ${gradient} shadow-sm`}><p className="text-xs font-medium opacity-80">{jalur.nama}</p><p className="text-3xl font-bold mt-1">{jumlahSiswa}</p><p className="text-xs opacity-70 mt-0.5">{jalur.persentase}% dari {kuota}</p></div>)
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sinkronisasi Portal SPMB */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg"><Globe className="w-5 h-5 text-indigo-600" /> Sinkronisasi Portal SPMB</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4"><div className="flex items-start gap-3"><Globe className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" /><div className="text-sm text-indigo-700"><p className="font-medium">Ambil data otomatis dari portal SPMB Sumatera Utara</p><p className="mt-1 text-indigo-600">Masukkan kredensial login portal untuk mengambil data pendaftar secara otomatis. Data akan disinkronkan dengan database lokal menggunakan deduplikasi NISN.</p></div></div></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-gray-700 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email Portal</label><Input type="email" value={portalSyncEmail} onChange={(e) => setPortalSyncEmail(e.target.value)} placeholder="email@disdik.sumutprov.go.id" className="mt-1.5" autoComplete="off" /></div>
              <div><label className="text-sm font-medium text-gray-700 flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Password Portal</label><Input type="password" value={portalSyncPassword} onChange={(e) => setPortalSyncPassword(e.target.value)} placeholder="Masukkan password..." className="mt-1.5" autoComplete="new-password" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-gray-700">Status Pendaftar</label><select value={portalSyncStatus} onChange={(e) => setPortalSyncStatus(e.target.value)} className="mt-1.5 w-full h-10 px-3 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"><option value="accepted">Accepted (Diterima)</option><option value="">Semua Status</option><option value="pending">Pending</option><option value="rejected">Rejected</option></select></div>
              <div><label className="text-sm font-medium text-gray-700">Jumlah Halaman</label><Input type="number" min={1} max={100} value={portalSyncPages} onChange={(e) => setPortalSyncPages(parseInt(e.target.value) || 10)} className="mt-1.5" /><p className="text-xs text-gray-400 mt-1">Setiap halaman berisi 10 data</p></div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handlePortalSync} disabled={portalSyncing} className="bg-indigo-600 hover:bg-indigo-700">{portalSyncing ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyinkronkan...</> : <><RefreshCw className="w-4 h-4" /> Mulai Sinkronisasi</>}</Button>
              <a href="https://adminspmb.disdik.sumutprov.go.id/admin/registration" target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:text-indigo-800 underline">Buka Portal SPMB ↗</a>
            </div>
            {portalSyncResult && (
              <div className={`rounded-xl p-4 border-2 ${portalSyncResult.success ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'}`}>
                <div className="flex items-start gap-3">
                  {portalSyncResult.success ? <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />}
                  <div>
                    <p className={`font-semibold text-sm ${portalSyncResult.success ? 'text-emerald-700' : 'text-red-700'}`}>{portalSyncResult.success ? 'Sinkronisasi Berhasil' : 'Sinkronisasi Gagal'}</p>
                    <p className={`text-sm mt-1 ${portalSyncResult.success ? 'text-emerald-600' : 'text-red-600'}`}>{portalSyncResult.message}</p>
                    {portalSyncResult.success && portalSyncResult.total !== undefined && (
                      <div className="flex items-center gap-4 mt-3">
                        <div className="text-center"><p className="text-2xl font-bold text-emerald-700">{portalSyncResult.created}</p><p className="text-xs text-emerald-600">Data Baru</p></div>
                        <div className="text-center"><p className="text-2xl font-bold text-amber-600">{portalSyncResult.updated}</p><p className="text-xs text-amber-600">Diperbarui</p></div>
                        <div className="text-center"><p className="text-2xl font-bold text-gray-500">{portalSyncResult.unchanged}</p><p className="text-xs text-gray-500">Tidak Berubah</p></div>
                        <div className="text-center"><p className="text-2xl font-bold text-sky-700">{portalSyncResult.total}</p><p className="text-xs text-sky-700">Total Diambil</p></div>
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
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5 text-emerald-600" /> Tambah Jalur Baru</DialogTitle><DialogDescription>Tambahkan jalur pendaftaran baru untuk {appName}{schoolName ? ` — ${schoolName}` : ''}</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium text-gray-700">Nama Jalur</label><Input value={newJalurNama} onChange={(e) => setNewJalurNama(e.target.value)} placeholder="Contoh: Zonasi, Perpindahan Orang Tua" className="mt-1" /></div>
            <div><label className="text-sm font-medium text-gray-700">Persentase Kuota (%)</label><Input type="number" min={0} max={100} step={0.5} value={newJalurPersentase} onChange={(e) => setNewJalurPersentase(parseFloat(e.target.value) || 0)} className="mt-1" /></div>
            {newJalurPersentase > 0 && kuota > 0 && <div className="bg-sky-50 rounded-lg p-3 border border-sky-200"><p className="text-sm text-sky-700">Estimasi jumlah siswa: <strong>{Math.round(kuota * newJalurPersentase / 100)}</strong> siswa</p></div>}
          </div>
          <DialogFooter className="gap-2"><Button variant="outline" onClick={() => setAddJalurOpen(false)}>Batal</Button><Button onClick={addJalur} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4" /> Tambah</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5 text-emerald-600" /> Tambah User Baru</DialogTitle><DialogDescription>Tambahkan user baru untuk mengakses sistem {appName}{schoolName ? ` — ${schoolName}` : ''}</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium text-gray-700">Username</label><Input value={addUserForm.username} onChange={(e) => setAddUserForm(prev => ({ ...prev, username: e.target.value }))} placeholder="Minimal 3 karakter" className="mt-1" autoComplete="off" /></div>
            <div><label className="text-sm font-medium text-gray-700">Password</label><Input type="text" value={addUserForm.password} onChange={(e) => setAddUserForm(prev => ({ ...prev, password: e.target.value }))} placeholder="Minimal 6 karakter" className="mt-1" autoComplete="off" /></div>
            <div><label className="text-sm font-medium text-gray-700">Nama Lengkap</label><Input value={addUserForm.namaLengkap} onChange={(e) => setAddUserForm(prev => ({ ...prev, namaLengkap: e.target.value }))} placeholder="Nama lengkap user" className="mt-1" /></div>
            <div><label className="text-sm font-medium text-gray-700">Role</label><select value={addUserForm.role} onChange={(e) => setAddUserForm(prev => ({ ...prev, role: e.target.value }))} className="mt-1 w-full h-10 px-3 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"><option value="verifikator">Verifikator</option><option value="admin">Admin</option></select></div>
          </div>
          <DialogFooter className="gap-2"><Button variant="outline" onClick={() => setAddUserOpen(false)}>Batal</Button><Button onClick={handleAddUser} disabled={userSaving} className="bg-emerald-600 hover:bg-emerald-700">{userSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}Tambah</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Pencil className="w-5 h-5 text-violet-600" /> Edit User</DialogTitle><DialogDescription>Ubah data user @{editUserData?.username}</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium text-gray-700">Username</label><Input value={editUserForm.username} onChange={(e) => setEditUserForm(prev => ({ ...prev, username: e.target.value }))} className="mt-1" autoComplete="off" /></div>
            <div><label className="text-sm font-medium text-gray-700">Password</label><Input type="text" value={editUserForm.password} onChange={(e) => setEditUserForm(prev => ({ ...prev, password: e.target.value }))} placeholder="Kosongkan jika tidak ingin mengubah password" className="mt-1" autoComplete="off" /><p className="text-xs text-gray-400 mt-1">Kosongkan jika tidak ingin mengubah password</p></div>
            <div><label className="text-sm font-medium text-gray-700">Nama Lengkap</label><Input value={editUserForm.namaLengkap} onChange={(e) => setEditUserForm(prev => ({ ...prev, namaLengkap: e.target.value }))} className="mt-1" /></div>
            <div><label className="text-sm font-medium text-gray-700">Role</label><select value={editUserForm.role} onChange={(e) => setEditUserForm(prev => ({ ...prev, role: e.target.value }))} className="mt-1 w-full h-10 px-3 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"><option value="verifikator">Verifikator</option><option value="admin">Admin</option></select></div>
            <div className="flex items-center gap-3"><label className="text-sm font-medium text-gray-700">Status</label><button type="button" onClick={() => setEditUserForm(prev => ({ ...prev, aktif: !prev.aktif }))} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${editUserForm.aktif ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{editUserForm.aktif ? <><CheckCircle2 className="w-3 h-3" /> Aktif</> : <><XCircle className="w-3 h-3" /> Nonaktif</>}</button></div>
          </div>
          <DialogFooter className="gap-2"><Button variant="outline" onClick={() => setEditUserOpen(false)}>Batal</Button><Button onClick={handleEditUser} disabled={userSaving} className="bg-violet-600 hover:bg-violet-700">{userSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Simpan</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><UserCog className="w-5 h-5 text-violet-600" /> Edit Profil Saya</DialogTitle><DialogDescription>Ubah data profil dan password akun Anda</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium text-gray-700">Username</label><Input value={editProfileForm.username} onChange={(e) => setEditProfileForm(prev => ({ ...prev, username: e.target.value }))} className="mt-1" autoComplete="off" /></div>
            <div><label className="text-sm font-medium text-gray-700">Nama Lengkap</label><Input value={editProfileForm.namaLengkap} onChange={(e) => setEditProfileForm(prev => ({ ...prev, namaLengkap: e.target.value }))} className="mt-1" /></div>
            <div><label className="text-sm font-medium text-gray-700">Password Baru</label><Input type="text" value={editProfileForm.password} onChange={(e) => setEditProfileForm(prev => ({ ...prev, password: e.target.value }))} placeholder="Kosongkan jika tidak ingin mengubah password" className="mt-1" autoComplete="off" /><p className="text-xs text-gray-400 mt-1">Kosongkan jika tidak ingin mengubah password</p></div>
          </div>
          <DialogFooter className="gap-2"><Button variant="outline" onClick={() => setEditProfileOpen(false)}>Batal</Button><Button onClick={handleUpdateProfile} disabled={editProfileSaving} className="bg-violet-600 hover:bg-violet-700">{editProfileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Simpan</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5 text-amber-600" /> Reset Password</DialogTitle>
            <DialogDescription>Reset password untuk user <strong>@{resetPasswordTarget?.username}</strong> ({resetPasswordTarget?.namaLengkap})</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-sm text-amber-700">
                  <p className="font-medium">Password lama akan digantikan</p>
                  <p className="mt-1 text-amber-600">User harus login kembali dengan password baru setelah ini.</p>
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Password Baru</label>
              <div className="relative mt-1">
                <Input
                  type={showResetPassword ? 'text' : 'password'}
                  value={resetPasswordNew}
                  onChange={(e) => setResetPasswordNew(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="pr-10"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {resetPasswordNew && resetPasswordNew.length < 6 && (
                <p className="text-xs text-red-500 mt-1">Password minimal 6 karakter</p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setResetPasswordOpen(false)}>Batal</Button>
            <Button
              onClick={handleResetPassword}
              disabled={resetPasswordLoading || !resetPasswordNew || resetPasswordNew.length < 6}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {resetPasswordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteUserOpen} onOpenChange={setDeleteUserOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-red-700"><Trash2 className="w-5 h-5" /> Hapus User</DialogTitle><DialogDescription>Apakah Anda yakin ingin menghapus user <strong>{deleteUserTarget?.namaLengkap}</strong>?</DialogDescription></DialogHeader>
          <p className="text-sm text-gray-500">Tindakan ini tidak dapat dibatalkan. User yang dihapus tidak akan bisa login ke sistem.</p>
          <DialogFooter className="gap-2"><Button variant="outline" onClick={() => setDeleteUserOpen(false)}>Batal</Button><Button onClick={handleDeleteUser} disabled={deleteUserLoading} variant="destructive">{deleteUserLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}Hapus</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
