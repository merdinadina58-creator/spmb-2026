'use client'

import { useState, useEffect, useCallback } from 'react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Trash2,
} from 'lucide-react'

import type { Registration, DashboardStats, PaginationInfo, LembarVerifikasiData, LembarVerifikasiConfig } from '@/lib/types'
import { STATUS_COLORS, STATUS_LULUS_COLORS, STATUS_DAFTAR_ULANG_COLORS, DEFAULT_KEKURANGAN_OPTIONS, SUB_JALUR_COLORS } from '@/lib/constants'
import { hitungLamaKK, isKKKurangSetahun, dedupById, buildLembarVerifikasi, flattenLembarConfigs, getJalurIcon, getJalurColors, getJalurSubFilter, StatBar, JALUR_HIERARCHY } from '@/lib/utils-shared'
import { parsePortalText } from '@/lib/parse-portal'

import { getRankingPrintHTML, handleRankingExportExcel } from '@/lib/ranking-print'
import LembarVerifikasiSheet from '@/components/LembarVerifikasiSheet'
import ImportDialog from '@/components/ImportDialog'
import ChangePasswordDialog from '@/components/ChangePasswordDialog'
import RankingPreviewDialog from '@/components/RankingPreviewDialog'
import PortalPasteDialog from '@/components/PortalPasteDialog'
import SumutBerkahDialog from '@/components/SumutBerkahDialog'
import { SingleVerifyDialog, BulkVerifyDialog, DeleteDialog } from '@/components/VerifyDialogs'
import DetailDialog from '@/components/DetailDialog'
import EditDialog from '@/components/EditDialog'
import DuplicateCheckDialog from '@/components/DuplicateCheckDialog'

// Extracted tab components
import AuthScreens from '@/components/AuthScreens'
import DashboardTab from '@/components/DashboardTab'
import DataPendaftarTab from '@/components/DataPendaftarTab'
import RankingTab from '@/components/RankingTab'
import DiterimaTab from '@/components/DiterimaTab'
import DitolakTab from '@/components/DitolakTab'
import KelulusanTab from '@/components/KelulusanTab'
import DaftarUlangTab from '@/components/DaftarUlangTab'
import PengaturanTab from '@/components/PengaturanTab'
import AppLayout from '@/components/AppLayout'


export default function Home() {
  const { toast } = useToast()

  // ==================== AUTH STATE ====================
  const [authLoading, setAuthLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authUser, setAuthUser] = useState<{ id: string; username: string; namaLengkap: string; role: string } | null>(null)
  const [needsSetup, setNeedsSetup] = useState(false)

  // Login form state
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  // Setup form state
  const [setupUsername, setSetupUsername] = useState('')
  const [setupPassword, setSetupPassword] = useState('')
  const [setupNamaLengkap, setSetupNamaLengkap] = useState('')
  const [setupLoading, setSetupLoading] = useState(false)
  const [setupError, setSetupError] = useState('')

  // Login/Setup password visibility
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showSetupPassword, setShowSetupPassword] = useState(false)

  // Change Password dialog state
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [changePasswordCurrent, setChangePasswordCurrent] = useState('')
  const [changePasswordNew, setChangePasswordNew] = useState('')
  const [changePasswordConfirm, setChangePasswordConfirm] = useState('')
  const [changePasswordLoading, setChangePasswordLoading] = useState(false)
  const [changePasswordError, setChangePasswordError] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  // Check auth on mount
  useEffect(() => {
    let cancelled = false

    const checkAuth = async () => {
      try {
        const setupRes = await fetch('/api/auth/setup')
        if (setupRes.ok) {
          const setupData = await setupRes.json()
          if (setupData.needsSetup && !cancelled) {
            setNeedsSetup(true)
            setAuthLoading(false)
            return
          }
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000)

        const meRes = await fetch('/api/auth/me', { signal: controller.signal })
        clearTimeout(timeoutId)

        if (meRes.ok) {
          const meData = await meRes.json()
          if (meData.authenticated && !cancelled) {
            setIsAuthenticated(true)
            setAuthUser(meData.user)
          }
        }
      } catch {
        // If API fails, show login form
      } finally {
        if (!cancelled) setAuthLoading(false)
      }
    }

    checkAuth()

    const safetyTimeout = setTimeout(() => {
      if (!cancelled) setAuthLoading(false)
    }, 10000)

    return () => {
      cancelled = true
      clearTimeout(safetyTimeout)
    }
  }, [])

  // ==================== MAIN APP STATE (must be before conditional returns) ====================
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  })
  const [dataLimit, setDataLimit] = useState(50)

  // Filters
  const [search, setSearch] = useState('')
  const [subJalurFilter, setSubJalurFilter] = useState('all')
  const [verificationFilter, setVerificationFilter] = useState('all')
  const [jurusanFilter, setJurusanFilter] = useState('all')

  // Sort by nama state for each tab
  const [namaSortData, setNamaSortData] = useState<'none' | 'asc' | 'desc'>('none')
  const [namaSortRanking, setNamaSortRanking] = useState<'none' | 'asc' | 'desc'>('none')
  const [namaSortDiterima, setNamaSortDiterima] = useState<'none' | 'asc' | 'desc'>('none')
  const [namaSortDitolak, setNamaSortDitolak] = useState<'none' | 'asc' | 'desc'>('none')
  const [groupBySekolah, setGroupBySekolah] = useState(false)

  // Duplicate detection state
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [duplicateLoading, setDuplicateLoading] = useState(false)
  const [duplicateData, setDuplicateData] = useState<{
    summary: {
      totalChecked: number
      nisnDuplicateGroups: number
      nisnDuplicateCount: number
      nameDuplicateGroups: number
      nameDuplicateCount: number
    } | null
    duplicates: Array<{
      type: 'nisn' | 'nama'
      key: string
      label: string
      count: number
      registrations: Array<{
        id: string
        noRegistrasi: string
        nama: string
        nisn: string
        subJalur: string
        namaSekolahPilihan: string
        namaSekolahAsal: string
        verificationStatus: string
        statusLulus: string | null
        statusDaftarUlang: string | null
      }>
    }>
  }>({ summary: null, duplicates: [] })

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Dialogs
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importStatus, setImportStatus] = useState('DITERIMA')
  const [useCsvStatus, setUseCsvStatus] = useState(false)
  const [csvRowCount, setCsvRowCount] = useState<number>(0)
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
  const handleSetCsvFile = async (file: File | null) => {
    setCsvFile(file)
    if (file) {
      try {
        const text = await file.text()
        const rows = parseCSVClientSide(text)
        setCsvRowCount(rows.length)
      } catch {
        setCsvRowCount(0)
      }
    } else {
      setCsvRowCount(0)
    }
  }

  // Active tab
  const [activeTab, setActiveTab] = useState('dashboard')
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)

  // Lembar verifikasi sub-tab
  const [lembarTab, setLembarTab] = useState('')
  const [lembarSubTab, setLembarSubTab] = useState('')

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Registration | null>(null)
  const [editForm, setEditForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Registration | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Report filter state
  const [diterimaFilterJalur, setDiterimaFilterJalur] = useState('all')
  const [diterimaFilterSekolah, setDiterimaFilterSekolah] = useState('all')
  const [ditolakFilterJalur, setDitolakFilterJalur] = useState('all')

  // Portal paste state
  const [portalPasteOpen, setPortalPasteOpen] = useState(false)
  const [portalRawText, setPortalRawText] = useState('')
  const [portalParsedData, setPortalParsedData] = useState<Record<string, string> | null>(null)
  const [portalParsing, setPortalParsing] = useState(false)
  const [portalSelectedJalur, setPortalSelectedJalur] = useState('')
  // Portal quick verification fields
  const [portalVerifStatus, setPortalVerifStatus] = useState<'VERIFIED' | 'REJECTED'>('VERIFIED')
  const [portalKekurangan, setPortalKekurangan] = useState('')
  const [portalVerifNote, setPortalVerifNote] = useState('')
  const [portalTanggalVerif, setPortalTanggalVerif] = useState('')
  const [portalJamVerif, setPortalJamVerif] = useState('')
  const [portalTerbitKK, setPortalTerbitKK] = useState('')
  // Highlight recently saved student in Lembar Verifikasi
  const [highlightRegId, setHighlightRegId] = useState<string | null>(null)

  // Sumut Berkah paste state
  const [sumutBerkahOpen, setSumutBerkahOpen] = useState(false)
  const [sumutBerkahText, setSumutBerkahText] = useState('')
  const [sumutBerkahParsing, setSumutBerkahParsing] = useState(false)
  const [sumutBerkahResult, setSumutBerkahResult] = useState<{ matched: number; updated: number; notFound: string[] } | null>(null)
  const [sumutBerkahPreview, setSumutBerkahPreview] = useState<Array<{ nama: string; totalNilai: string; jarakKeSekolah: string }> | null>(null)

  // Pengaturan state
  const [kuota, setKuota] = useState(0)
  const [appName, setAppName] = useState('SPMB 2026')
  const [schoolName, setSchoolName] = useState('')
  const [appIcon, setAppIcon] = useState('')
  const [appSubtitle, setAppSubtitle] = useState('Sistem Verifikasi Penerimaan Murid Baru')
  const [jalurConfigs, setJalurConfigs] = useState<Array<{ id: string; nama: string; persentase: number; urutan: number; aktif: boolean }>>([])
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [newJalurNama, setNewJalurNama] = useState('')
  const [newJalurPersentase, setNewJalurPersentase] = useState(0)
  const [addJalurOpen, setAddJalurOpen] = useState(false)

  // Tahap Pendaftaran state
  const [tahap, setTahap] = useState(1)
  const [jalurAktifPerTahap, setJalurAktifPerTahap] = useState<string>('')

  // Ranking state
  const [rankingJalur, setRankingJalur] = useState('all')
  const [rankingSekolah, setRankingSekolah] = useState('all')
  const [rankingJurusan, setRankingJurusan] = useState('all')
  const [rankingTampilan, setRankingTampilan] = useState('jarak')
  const [rankingStatus, setRankingStatus] = useState('all')
  const [rankingData, setRankingData] = useState<Array<Record<string, unknown>>>([])
  const [rankingFilters, setRankingFilters] = useState<{ jalurOptions: string[]; sekolahOptions: string[]; jurusanOptions: string[] }>({ jalurOptions: [], sekolahOptions: [], jurusanOptions: [] })
  const [rankingKuota, setRankingKuota] = useState(0)
  const [rankingKuotaPerJalur, setRankingKuotaPerJalur] = useState<Array<{ nama: string; persentase: number; kuota: number }>>([])
  const [rankingLoading, setRankingLoading] = useState(false)

  // Ranking print/preview state
  const [rankingPreviewOpen, setRankingPreviewOpen] = useState(false)
  const [rankingPreviewType, setRankingPreviewType] = useState<'pdf' | 'excel'>('pdf')
  const [rankingPreviewJalur, setRankingPreviewJalur] = useState<string>('all')

  // Build lembar verifikasi from jalurConfigs
  const lembarVerifikasi = buildLembarVerifikasi(jalurConfigs)

  // Available subJalur options for dropdowns (flattened from hierarchy)
  const subJalurOptions = flattenLembarConfigs(lembarVerifikasi)
    .map(cfg => ({ label: cfg.label, value: cfg.subJalurFilter }))

  // Auto-set lembarTab to first tab when configs load
  useEffect(() => {
    if (jalurConfigs.length > 0 && !lembarTab) {
      const firstKey = lembarVerifikasi[0]?.key
      if (firstKey) setLembarTab(firstKey)
    }
  }, [jalurConfigs, lembarTab, lembarVerifikasi])

  // When lembarTab changes, reset lembarSubTab
  useEffect(() => {
    setLembarSubTab('')
  }, [lembarTab])

  // Portal Sync state
  const [portalSyncOpen, setPortalSyncOpen] = useState(false)
  const [portalSyncEmail, setPortalSyncEmail] = useState('')
  const [portalSyncPassword, setPortalSyncPassword] = useState('')
  const [portalSyncStatus, setPortalSyncStatus] = useState('accepted')
  const [portalSyncPages, setPortalSyncPages] = useState(10)
  const [portalSyncing, setPortalSyncing] = useState(false)
  const [portalSyncResult, setPortalSyncResult] = useState<{ success: boolean; message: string; created?: number; updated?: number; unchanged?: number; total?: number } | null>(null)

  // User management state
  const [users, setUsers] = useState<Array<{ id: string; username: string; namaLengkap: string; role: string; aktif: boolean; lastLogin: string | null; createdAt: string }>>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [editUserOpen, setEditUserOpen] = useState(false)
  const [editUserData, setEditUserData] = useState<{ id: string; username: string; namaLengkap: string; role: string; aktif: boolean } | null>(null)
  const [addUserForm, setAddUserForm] = useState({ username: '', password: '', namaLengkap: '', role: 'verifikator' })
  const [editUserForm, setEditUserForm] = useState({ username: '', password: '', namaLengkap: '', role: 'verifikator', aktif: true })
  const [userSaving, setUserSaving] = useState(false)
  const [deleteUserOpen, setDeleteUserOpen] = useState(false)
  const [deleteUserTarget, setDeleteUserTarget] = useState<{ id: string; namaLengkap: string } | null>(null)
  const [deleteUserLoading, setDeleteUserLoading] = useState(false)

  // Reset Password state
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false)
  const [resetPasswordTarget, setResetPasswordTarget] = useState<{ id: string; username: string; namaLengkap: string } | null>(null)
  const [resetPasswordNew, setResetPasswordNew] = useState('')
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)

  // Admin profile edit
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [editProfileForm, setEditProfileForm] = useState({ username: '', password: '', namaLengkap: '' })
  const [editProfileSaving, setEditProfileSaving] = useState(false)

  // ==================== AUTH HANDLERS ====================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      })
      const data = await res.json()
      if (data.success) {
        sessionStorage.setItem('spmb_session_active', 'true')
        setIsAuthenticated(true)
        setAuthUser(data.user)
        setLoginUsername('')
        setLoginPassword('')
        toast({ title: 'Login Berhasil', description: `Selamat datang, ${data.user.namaLengkap}!` })
      } else {
        setLoginError(data.error || 'Login gagal')
      }
    } catch {
      setLoginError('Terjadi kesalahan koneksi')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSetupLoading(true)
    setSetupError('')
    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: setupUsername, password: setupPassword, namaLengkap: setupNamaLengkap }),
      })
      const data = await res.json()
      if (data.success) {
        setNeedsSetup(false)
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: setupUsername, password: setupPassword }),
        })
        const loginData = await loginRes.json()
        if (loginData.success) {
          sessionStorage.setItem('spmb_session_active', 'true')
          setIsAuthenticated(true)
          setAuthUser(loginData.user)
          toast({ title: 'Setup Berhasil', description: `Akun admin berhasil dibuat. Selamat datang, ${loginData.user.namaLengkap}!` })
        }
        setSetupUsername('')
        setSetupPassword('')
        setSetupNamaLengkap('')
      } else {
        setSetupError(data.error || 'Setup gagal')
      }
    } catch {
      setSetupError('Terjadi kesalahan koneksi')
    } finally {
      setSetupLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setIsAuthenticated(false)
      setAuthUser(null)
      toast({ title: 'Logout Berhasil', description: 'Anda telah keluar dari sistem' })
    } catch {
      toast({ title: 'Gagal Logout', description: 'Terjadi kesalahan', variant: 'destructive' })
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setChangePasswordError('')
    if (changePasswordNew !== changePasswordConfirm) {
      setChangePasswordError('Password baru tidak cocok')
      return
    }
    if (changePasswordNew.length < 6) {
      setChangePasswordError('Password baru minimal 6 karakter')
      return
    }
    setChangePasswordLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: changePasswordCurrent, newPassword: changePasswordNew }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Berhasil', description: 'Password berhasil diubah' })
        setChangePasswordOpen(false)
        setChangePasswordCurrent('')
        setChangePasswordNew('')
        setChangePasswordConfirm('')
      } else {
        setChangePasswordError(data.error || 'Gagal mengubah password')
      }
    } catch {
      setChangePasswordError('Terjadi kesalahan koneksi')
    } finally {
      setChangePasswordLoading(false)
    }
  }

  // Load users
  const loadUsers = async () => {
    setUsersLoading(true)
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      if (data.success) setUsers(data.users)
    } catch {
      toast({ title: 'Error', description: 'Gagal memuat data user', variant: 'destructive' })
    } finally {
      setUsersLoading(false)
    }
  }

  // Add user
  const handleAddUser = async () => {
    if (!addUserForm.username || !addUserForm.password || !addUserForm.namaLengkap) {
      toast({ title: 'Error', description: 'Semua field harus diisi', variant: 'destructive' })
      return
    }
    setUserSaving(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addUserForm),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Berhasil', description: `User ${addUserForm.namaLengkap} berhasil ditambahkan` })
        setAddUserOpen(false)
        setAddUserForm({ username: '', password: '', namaLengkap: '', role: 'verifikator' })
        loadUsers()
      } else {
        toast({ title: 'Gagal', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setUserSaving(false)
    }
  }

  // Edit user
  const handleEditUser = async () => {
    if (!editUserData) return
    if (!editUserForm.username || !editUserForm.namaLengkap) {
      toast({ title: 'Error', description: 'Username dan Nama Lengkap harus diisi', variant: 'destructive' })
      return
    }
    setUserSaving(true)
    try {
      const body: Record<string, unknown> = {
        id: editUserData.id,
        username: editUserForm.username,
        namaLengkap: editUserForm.namaLengkap,
        role: editUserForm.role,
        aktif: editUserForm.aktif,
      }
      if (editUserForm.password) body.password = editUserForm.password

      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Berhasil', description: 'User berhasil diperbarui' })
        setEditUserOpen(false)
        loadUsers()
      } else {
        toast({ title: 'Gagal', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setUserSaving(false)
    }
  }

  // Delete user
  const handleDeleteUser = async () => {
    if (!deleteUserTarget) return
    setDeleteUserLoading(true)
    try {
      const res = await fetch(`/api/users?id=${deleteUserTarget.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Berhasil', description: 'User berhasil dihapus' })
        setDeleteUserOpen(false)
        setDeleteUserTarget(null)
        loadUsers()
      } else {
        toast({ title: 'Gagal', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setDeleteUserLoading(false)
    }
  }

  // Reset password (admin)
  const handleResetPassword = async () => {
    if (!resetPasswordTarget || !resetPasswordNew || resetPasswordNew.length < 6) return
    setResetPasswordLoading(true)
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: resetPasswordTarget.id, password: resetPasswordNew }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Password Direset', description: `Password @{resetPasswordTarget.username} berhasil diubah` })
        setResetPasswordOpen(false)
        setResetPasswordNew('')
        setResetPasswordTarget(null)
      } else {
        toast({ title: 'Gagal', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setResetPasswordLoading(false)
    }
  }

  // Update own profile
  const handleUpdateProfile = async () => {
    if (!editProfileForm.username || !editProfileForm.namaLengkap) {
      toast({ title: 'Error', description: 'Username dan Nama Lengkap harus diisi', variant: 'destructive' })
      return
    }
    setEditProfileSaving(true)
    try {
      const body: Record<string, string> = {
        username: editProfileForm.username,
        namaLengkap: editProfileForm.namaLengkap,
      }
      if (editProfileForm.password) body.password = editProfileForm.password

      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        setAuthUser(data.user)
        setEditProfileOpen(false)
        toast({ title: 'Berhasil', description: 'Profil berhasil diperbarui' })
      } else {
        toast({ title: 'Gagal', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setEditProfileSaving(false)
    }
  }

  // Check for duplicates
  const checkDuplicates = async () => {
    setDuplicateLoading(true)
    setDuplicateDialogOpen(true)
    try {
      const res = await fetch('/api/registrations/duplicates')
      const data = await res.json()
      if (data.success) {
        setDuplicateData({ summary: data.summary, duplicates: data.duplicates })
      } else {
        toast({ title: 'Gagal', description: data.error || 'Gagal memeriksa duplikat', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Terjadi kesalahan saat memeriksa duplikat', variant: 'destructive' })
    } finally {
      setDuplicateLoading(false)
    }
  }

  // ==================== DATA FETCHING HOOKS (must be before conditional returns) ====================
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
      if (tahap) params.set('tahap', tahap.toString())

      const res = await fetch(`/api/registrations?${params}`)
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) return
        toast({ title: 'Error', description: 'Gagal memuat data pendaftar', variant: 'destructive' })
        return
      }
      const data = await res.json()
      setRegistrations(dedupById(data.data || []))
      if (data.pagination) setPagination(prev => ({ ...prev, ...data.pagination }))
    } catch {
      toast({ title: 'Error', description: 'Gagal memuat data pendaftar', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, search, subJalurFilter, verificationFilter, jurusanFilter, tahap, toast])

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/dashboard?tahap=${tahap}`)
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) return
        toast({ title: 'Error', description: 'Gagal memuat statistik', variant: 'destructive' })
        return
      }
      const data = await res.json()
      if (data.error) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
        return
      }
      // Deduplicate all list data to prevent React key errors
      if (data.verifiedList) data.verifiedList = dedupById(data.verifiedList)
      if (data.rejectedList) data.rejectedList = dedupById(data.rejectedList)
      if (data.lulusList) data.lulusList = dedupById(data.lulusList)
      if (data.tidakLulusList) data.tidakLulusList = dedupById(data.tidakLulusList)
      if (data.daftarUlangList) data.daftarUlangList = dedupById(data.daftarUlangList)
      if (data.tidakDaftarUlangList) data.tidakDaftarUlangList = dedupById(data.tidakDaftarUlangList)
      setStats(data)
    } catch {
      // Silently fail - stats will show empty, no need to alarm the user
    }
  }, [tahap, toast])

  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true)
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      setKuota(data.kuota || 0)
      setJalurConfigs(data.jalurConfigs || [])
      setAppName(data.appName || 'SPMB 2026')
      setSchoolName(data.schoolName || '')
      setAppIcon(data.appIcon || '')
      setAppSubtitle(data.appSubtitle || 'Sistem Verifikasi Penerimaan Murid Baru')
      // Load tahap from settings
      if (data.tahap) setTahap(data.tahap)
      if (data.jalurAktifPerTahap) setJalurAktifPerTahap(data.jalurAktifPerTahap)
    } catch {
      // Silently fail - settings will use defaults
    } finally {
      setSettingsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) fetchRegistrations()
  }, [fetchRegistrations, isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) fetchStats()
  }, [fetchStats, isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) fetchSettings()
  }, [fetchSettings, isAuthenticated])

  // Load users when Pengaturan tab is active
  useEffect(() => {
    if (activeTab === 'pengaturan' && authUser?.role === 'admin') {
      loadUsers()
    }
  }, [activeTab, authUser?.role])

  // Redirect verifikator away from restricted tabs
  useEffect(() => {
    if (authUser?.role === 'verifikator' && (activeTab === 'pengaturan' || activeTab === 'ranking')) {
      setActiveTab('dashboard')
    }
  }, [activeTab, authUser?.role])

  // Auto-logout on refresh
  useEffect(() => {
    if (isAuthenticated) {
      const sessionFlag = sessionStorage.getItem('spmb_session_active')
      if (!sessionFlag) {
        fetch('/api/auth/logout', { method: 'POST' })
        setIsAuthenticated(false)
        setAuthUser(null)
      }
    }
  }, [isAuthenticated])

  // Set session flag when logged in
  useEffect(() => {
    if (isAuthenticated) {
      sessionStorage.setItem('spmb_session_active', 'true')
    } else {
      sessionStorage.removeItem('spmb_session_active')
    }
  }, [isAuthenticated])

  // Fetch app name early
  useEffect(() => {
    const fetchAppName = async () => {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const data = await res.json()
          if (data.appName) setAppName(data.appName)
          if (data.schoolName) setSchoolName(data.schoolName)
          if (data.appIcon) setAppIcon(data.appIcon)
          if (data.appSubtitle) setAppSubtitle(data.appSubtitle)
        }
      } catch {
        // silently fail
      }
    }
    fetchAppName()
  }, [])

  // Dynamically update document title and favicon
  useEffect(() => {
    if (appName) {
      // Use first line of subtitle for the tab title (or the whole subtitle if no newline)
      const subtitleFirstLine = appSubtitle.split('\n')[0] || appSubtitle
      document.title = `${appName}${schoolName ? ' — ' + schoolName : ''} — ${subtitleFirstLine}`
    }
  }, [appName, schoolName, appSubtitle])

  useEffect(() => {
    if (appIcon) {
      // Update favicon dynamically — use the dynamic API endpoint for consistency
      // This ensures both the browser tab icon AND PWA install icon use the admin-uploaded icon
      let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']")
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      // Use the dynamic icon endpoint with cache-busting so the browser fetches the latest icon
      link.href = `/api/app-icon?size=192&t=${Date.now()}`

      // Update all apple-touch-icon links (for iOS home screen)
      const appleLinks = document.querySelectorAll<HTMLLinkElement>("link[rel='apple-touch-icon']")
      appleLinks.forEach((appleLink, idx) => {
        const size = idx === 0 ? '192' : '512'
        appleLink.href = `/api/app-icon?size=${size}&t=${Date.now()}`
      })

      // Also update the manifest link with cache-busting to trigger PWA icon refresh
      const manifestLink = document.querySelector<HTMLLinkElement>("link[rel='manifest']")
      if (manifestLink) {
        manifestLink.href = `/api/manifest?t=${Date.now()}`
      }
    }
  }, [appIcon])

  // Clear session flag on beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('spmb_session_active')
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // Fetch ranking data
  const fetchRanking = useCallback(async () => {
    setRankingLoading(true)
    try {
      const params = new URLSearchParams()
      if (rankingJalur !== 'all') params.set('jalur', rankingJalur)
      if (rankingSekolah !== 'all') params.set('sekolah', rankingSekolah)
      if (rankingJurusan !== 'all') params.set('jurusan', rankingJurusan)
      params.set('tampilan', rankingTampilan)
      if (rankingStatus !== 'all') params.set('status', rankingStatus)
      if (tahap) params.set('tahap', tahap.toString())

      const res = await fetch(`/api/ranking?${params}`)
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) return
        toast({ title: 'Error', description: 'Gagal memuat data perangkingan', variant: 'destructive' })
        return
      }
      const data = await res.json()
      if (data.success) {
        setRankingData(data.data || [])
        setRankingFilters(data.filters || { jalurOptions: [], sekolahOptions: [], jurusanOptions: [] })
        setRankingKuota(data.kuota || 0)
        setRankingKuotaPerJalur(data.kuotaPerJalur || [])
      }
    } catch {
      toast({ title: 'Error', description: 'Gagal memuat data perangkingan', variant: 'destructive' })
    } finally {
      setRankingLoading(false)
    }
  }, [rankingJalur, rankingSekolah, rankingJurusan, rankingTampilan, rankingStatus, tahap, toast])

  useEffect(() => {
    if (isAuthenticated) fetchRanking()
  }, [fetchRanking, isAuthenticated])

  // ==================== CONDITIONAL RENDERS ====================
  // Auth screens
  if (authLoading || needsSetup || !isAuthenticated) {
    return (
      <AuthScreens
        authLoading={authLoading}
        needsSetup={needsSetup}
        isAuthenticated={isAuthenticated}
        appName={appName}
        schoolName={schoolName}
        appIcon={appIcon}
        appSubtitle={appSubtitle}
        loginUsername={loginUsername}
        setLoginUsername={setLoginUsername}
        loginPassword={loginPassword}
        setLoginPassword={setLoginPassword}
        loginLoading={loginLoading}
        loginError={loginError}
        showLoginPassword={showLoginPassword}
        setShowLoginPassword={setShowLoginPassword}
        handleLogin={handleLogin}
        setupUsername={setupUsername}
        setSetupUsername={setSetupUsername}
        setupPassword={setupPassword}
        setSetupPassword={setSetupPassword}
        setupNamaLengkap={setupNamaLengkap}
        setSetupNamaLengkap={setSetupNamaLengkap}
        setupLoading={setupLoading}
        setupError={setupError}
        showSetupPassword={showSetupPassword}
        setShowSetupPassword={setShowSetupPassword}
        handleSetup={handleSetup}
      />
    )
  }

  // ==================== HANDLER FUNCTIONS ====================
  const handlePortalPaste = () => {
    if (!portalRawText.trim()) return
    setPortalParsing(true)
    try {
      const parsed = parsePortalText(portalRawText, jalurConfigs)
      setPortalParsedData(parsed)
      const detectedJalur = parsed['_detectedJalurNama'] || ''
      if (detectedJalur) {
        setPortalSelectedJalur(detectedJalur)
      } else {
        const firstActive = jalurConfigs.find(j => j.aktif)
        setPortalSelectedJalur(firstActive?.nama || '')
      }
      // Auto-set verification status based on portal-detected status
      const detectedStatus = parsed['status'] || ''
      if (detectedStatus === 'DITOLAK') {
        setPortalVerifStatus('REJECTED')
      } else {
        setPortalVerifStatus('VERIFIED')
      }
    } catch {
      toast({ title: 'Gagal', description: 'Tidak dapat memparse teks portal', variant: 'destructive' })
    } finally {
      setPortalParsing(false)
    }
  }

  const handlePortalSave = async () => {
    if (!portalParsedData) return

    // Validation: if REJECTED, must have kekurangan verifikasi selected (same rule as Kekurangan Verifikasi column)
    if (portalVerifStatus === 'REJECTED' && !portalKekurangan.trim()) {
      toast({ title: 'Gagal', description: 'Kekurangan verifikasi wajib dipilih! Pilih minimal 1 alasan penolakan.', variant: 'destructive' })
      return
    }

    setImporting(true)
    try {
      const saveData = { ...portalParsedData }
      if (portalSelectedJalur) {
        saveData['subJalur'] = getJalurSubFilter(portalSelectedJalur)
      }
      delete saveData['_detectedJalurNama']
      delete saveData['_jalurAutoDetected']

      // Set verification status from the dialog selector
      if (portalVerifStatus === 'REJECTED') {
        saveData['status'] = 'DITOLAK'
        saveData['verificationStatus'] = 'REJECTED'
      } else {
        saveData['verificationStatus'] = 'VERIFIED'
        // Keep original status from portal if DITERIMA, otherwise default
        if (saveData['status'] === 'DITOLAK') {
          saveData['status'] = 'DITERIMA'
        } else if (!saveData['status'] || saveData['status'] === 'ON PROGRESS') {
          saveData['status'] = 'DITERIMA'
        }
      }

      // Include verification fields
      if (portalKekurangan) saveData['kekuranganVerifikasi'] = portalKekurangan
      if (portalVerifNote) saveData['verificationNote'] = portalVerifNote
      if (portalTanggalVerif) saveData['tanggalVerif'] = portalTanggalVerif
      if (portalJamVerif) saveData['jamVerif'] = portalJamVerif
      if (portalTerbitKK) saveData['terbitKK'] = portalTerbitKK

      // Include tahap
      saveData['tahap'] = tahap

      const res = await fetch('/api/registrations/portal-paste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData),
      })
      const data = await res.json()
      if (data.success) {
        const nisnLabel = portalParsedData.nisn ? ` (NISN: ${portalParsedData.nisn})` : ''
        const savedRegId = data.data?.id || null
        if (data.action === 'created') {
          toast({ title: '✅ Data Baru Disimpan', description: data.message || `Data ${portalParsedData.nama || 'pendaftar'}${nisnLabel} berhasil ditambahkan sebagai data baru` })
        } else if (data.action === 'updated') {
          toast({ title: '🔄 Data Diperbarui', description: data.message || `Data ${portalParsedData.nama || 'pendaftar'}${nisnLabel} berhasil diperbarui — field kosong telah diisi` })
        } else {
          toast({ title: 'ℹ️ Data Sudah Lengkap', description: data.message || `Data ${portalParsedData.nama || 'pendaftar'}${nisnLabel} sudah lengkap, tidak ada perubahan` })
        }
        setPortalPasteOpen(false)
        setPortalRawText('')
        setPortalParsedData(null)
        setPortalSelectedJalur('')
        // Reset verification fields
        setPortalVerifStatus('VERIFIED')
        setPortalKekurangan('')
        setPortalVerifNote('')
        setPortalTanggalVerif('')
        setPortalJamVerif('')
        setPortalTerbitKK('')
        fetchRegistrations()
        fetchStats()

        // Navigate to correct Lembar Verifikasi tab and highlight the student
        if (savedRegId && portalSelectedJalur) {
          const subJalurValue = getJalurSubFilter(portalSelectedJalur)
          // Find the matching lembar tab key
          const matchingLembar = lembarVerifikasi.find(lv => {
            const jalurNames = lv.subJalurFilter.split(',').map(s => s.trim())
            return jalurNames.includes(subJalurValue)
          })
          if (matchingLembar) {
            setLembarTab(matchingLembar.key)
          }
          setActiveTab('lembar-verifikasi')
          setHighlightRegId(savedRegId)
          // Clear highlight after 5 seconds
          setTimeout(() => setHighlightRegId(null), 5000)
        }
      } else {
        toast({ title: 'Gagal', description: data.error || 'Terjadi kesalahan', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Gagal', description: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setImporting(false)
    }
  }

  const handleSumutBerkahSave = async () => {
    if (!sumutBerkahPreview || sumutBerkahPreview.length === 0) return
    setSumutBerkahParsing(true)
    try {
      const res = await fetch('/api/registrations/sumut-berkah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: sumutBerkahPreview }),
      })
      const data = await res.json()
      if (data.success) {
        setSumutBerkahResult({ matched: data.matched, updated: data.updated, notFound: data.notFound })
        toast({ title: '✅ Data Sumut Berkah Diperbarui', description: `${data.matched} nama cocok, ${data.updated} data diperbarui${data.notFound?.length > 0 ? `, ${data.notFound.length} tidak ditemukan` : ''}` })
        fetchRegistrations()
        fetchStats()
      } else {
        toast({ title: 'Gagal', description: data.error || 'Terjadi kesalahan', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Gagal', description: 'Terjadi kesalahan saat menyimpan data', variant: 'destructive' })
    } finally {
      setSumutBerkahParsing(false)
    }
  }

  const saveKuota = async () => {
    setSettingsSaving(true)
    try {
      const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kuota }) })
      const data = await res.json()
      if (data.success) toast({ title: 'Tersimpan', description: `Kuota siswa: ${kuota}` })
    } catch {
      toast({ title: 'Gagal', description: 'Gagal menyimpan kuota', variant: 'destructive' })
    } finally {
      setSettingsSaving(false)
    }
  }

  const saveAppName = async () => {
    setSettingsSaving(true)
    try {
      const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ appName, schoolName, appIcon, appSubtitle }) })
      const data = await res.json()
      if (data.success) toast({ title: 'Tersimpan', description: `Pengaturan aplikasi berhasil disimpan` })
    } catch {
      toast({ title: 'Gagal', description: 'Gagal menyimpan pengaturan aplikasi', variant: 'destructive' })
    } finally {
      setSettingsSaving(false)
    }
  }

  const updateJalurPersentase = async (id: string, persentase: number) => {
    try {
      const res = await fetch('/api/settings/jalur', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, persentase }) })
      const data = await res.json()
      if (data.success) setJalurConfigs(prev => prev.map(j => j.id === id ? { ...j, persentase } : j))
    } catch {
      toast({ title: 'Gagal', description: 'Gagal memperbarui persentase', variant: 'destructive' })
    }
  }

  const addJalur = async () => {
    if (!newJalurNama.trim()) { toast({ title: 'Gagal', description: 'Nama jalur wajib diisi', variant: 'destructive' }); return }
    try {
      const res = await fetch('/api/settings/jalur', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nama: newJalurNama.trim(), persentase: newJalurPersentase }) })
      const data = await res.json()
      if (data.success) {
        setJalurConfigs(prev => [...prev, data.data])
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

  const deleteJalur = async (id: string, nama: string) => {
    if (!confirm(`Hapus jalur "${nama}"?`)) return
    try {
      const res = await fetch(`/api/settings/jalur?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setJalurConfigs(prev => prev.filter(j => j.id !== id))
        toast({ title: 'Berhasil', description: data.message })
      } else {
        toast({ title: 'Gagal', description: data.error || 'Gagal menghapus jalur', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Gagal', description: 'Gagal menghapus jalur', variant: 'destructive' })
    }
  }

  const toggleJalurAktif = async (id: string, aktif: boolean) => {
    try {
      const res = await fetch('/api/settings/jalur', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, aktif }) })
      const data = await res.json()
      if (data.success) {
        setJalurConfigs(prev => prev.map(j => j.id === id ? { ...j, aktif } : j))
        // Also save per-tahap jalur activation so switching tahap remembers the toggle
        setJalurAktifPerTahap(prev => {
          const mapping: Record<string, string[]> = prev ? JSON.parse(prev) : {}
          // Get the NEW active list (including this toggle)
          const newActiveIds = jalurConfigs
            .map(j => j.id === id ? { ...j, aktif } : j)
            .filter(j => j.aktif)
            .map(j => j.id)
          mapping[tahap.toString()] = newActiveIds
          const newMapping = JSON.stringify(mapping)
          // Persist to backend
          fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jalurAktifPerTahap: newMapping }),
          })
          return newMapping
        })
      }
    } catch {
      toast({ title: 'Gagal', description: 'Gagal mengubah status jalur', variant: 'destructive' })
    }
  }

  const handlePortalSync = async () => {
    if (!portalSyncEmail.trim() || !portalSyncPassword.trim()) { toast({ title: 'Gagal', description: 'Email dan password portal wajib diisi', variant: 'destructive' }); return }
    setPortalSyncing(true)
    setPortalSyncResult(null)
    try {
      const res = await fetch('/api/portal-sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: portalSyncEmail.trim(), password: portalSyncPassword, pages: portalSyncPages, status: portalSyncStatus }) })
      const data = await res.json()
      if (data.error) {
        setPortalSyncResult({ success: false, message: data.error })
        toast({ title: 'Gagal', description: data.error, variant: 'destructive' })
      } else {
        setPortalSyncResult({ success: true, message: data.message, created: data.created, updated: data.updated, unchanged: data.unchanged, total: data.total })
        toast({ title: '✅ Sinkronisasi Berhasil', description: data.message })
        fetchRegistrations()
        fetchStats()
      }
    } catch {
      const errMsg = 'Terjadi kesalahan saat sinkronisasi'
      setPortalSyncResult({ success: false, message: errMsg })
      toast({ title: 'Gagal', description: errMsg, variant: 'destructive' })
    } finally {
      setPortalSyncing(false)
    }
  }

  const parseCSVClientSide = (text: string) => {
    const lines = text.trim().split('\n')
    if (lines.length < 2) return []
    const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim())
    const rows: Record<string, string>[] = []
    let skippedRows = 0
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue // skip empty lines
      const values: string[] = []
      let current = ''
      let inQuotes = false
      for (const char of lines[i]) {
        if (char === '"') { inQuotes = !inQuotes } else if (char === ',' && !inQuotes) { values.push(current.trim()); current = '' } else { current += char }
      }
      values.push(current.trim())
      // Accept rows with close column counts (allow slight mismatches by padding)
      if (values.length >= headers.length - 2 && values.length <= headers.length + 2) {
        const row: Record<string, string> = {}
        headers.forEach((header, index) => { row[header] = values[index] || '' })
        rows.push(row)
      } else {
        skippedRows++
      }
    }
    if (skippedRows > 0) {
      toast({ title: 'Perhatian', description: `${skippedRows} baris CSV dilewati karena format tidak valid`, variant: 'destructive' })
    }
    return rows
  }

  const handleImport = async () => {
    if (!csvFile) return
    setImporting(true)
    try {
      const text = await csvFile.text()
      const csvRows = parseCSVClientSide(text)
      if (csvRows.length === 0) throw new Error('File CSV kosong atau format tidak valid')
      const finalStatus = useCsvStatus ? undefined : importStatus
      const mappedRows = csvRows.map(row => ({
        noRegistrasi: row['No.Registrasi'] || '', nama: row['Nama'] || '', nisn: row['NISN'] || '', subJalur: row['Sub Jalur'] || '',
        npsnSekolahPilihan: row['NPSN Sekolah Pilihan'] || '', namaSekolahPilihan: row['Nama Sekolah Pilihan'] || '', jurusan: row['Jurusan'] || '',
        npsnSekolahAsal: row['NPSN Sekolah Asal'] || '', namaSekolahAsal: row['Nama Sekolah Asal'] || '', status: finalStatus || row['Status'] || importStatus, waktuDaftar: row['Waktu Daftar'] || '',
      }))
      const importRes = await fetch('/api/registrations/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rows: mappedRows, overrideStatus: !useCsvStatus, tahap }) })
      const importData = await importRes.json()
      if (importData.success) {
        const skippedInfo = importData.skipped > 0 ? `, ${importData.skipped} dilewati` : ''
        const errorInfo = importData.errors?.length > 0 ? `\n\nDetail: ${importData.errors.join('; ')}` : ''
        toast({ title: 'Import Berhasil', description: `${importData.created || 0} data baru, ${importData.updated || 0} data diperbarui${skippedInfo} (Total: ${importData.imported || 0} dari ${csvRows.length} baris CSV)${errorInfo}` })
        setImportDialogOpen(false)
        setCsvFile(null)
        setCsvRowCount(0)
        fetchRegistrations()
        fetchStats()
      } else {
        toast({ title: 'Import Gagal', description: importData.error || 'Terjadi kesalahan', variant: 'destructive' })
      }
    } catch (err) {
      toast({ title: 'Import Gagal', description: err instanceof Error ? err.message : 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setImporting(false)
    }
  }

  const handleVerify = async () => {
    if (!verifyTargetId) return
    setVerifying(true)
    try {
      const res = await fetch('/api/registrations/verify', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: verifyTargetId, verificationStatus: verifyAction, verificationNote: verifyNote || undefined }) })
      const data = await res.json()
      if (data.success) {
        toast({ title: verifyAction === 'VERIFIED' ? 'Pendaftar Diterima' : 'Pendaftar Ditolak', description: verifyAction === 'VERIFIED' ? 'Data pendaftar telah diverifikasi dan diterima' : 'Data pendaftar telah ditolak' })
        setVerifyDialogOpen(false); setVerifyNote(''); setVerifyTargetId(null)
        fetchRegistrations(); fetchStats()
      } else {
        toast({ title: 'Verifikasi Gagal', description: data.error || 'Terjadi kesalahan', variant: 'destructive' })
      }
    } catch { toast({ title: 'Verifikasi Gagal', description: 'Terjadi kesalahan', variant: 'destructive' }) } finally { setVerifying(false) }
  }

  const handleBulkVerify = async () => {
    if (selectedIds.size === 0) return
    setVerifying(true)
    try {
      const res = await fetch('/api/registrations/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: Array.from(selectedIds), verificationStatus: verifyAction, verificationNote: verifyNote || undefined }) })
      const data = await res.json()
      if (data.success) {
        toast({ title: verifyAction === 'VERIFIED' ? 'Pendaftar Diterima' : 'Pendaftar Ditolak', description: `${data.updated} pendaftar ${verifyAction === 'VERIFIED' ? 'diterima' : 'ditolak'}` })
        setBulkVerifyDialogOpen(false); setVerifyNote(''); setSelectedIds(new Set())
        fetchRegistrations(); fetchStats()
      } else { toast({ title: 'Verifikasi Gagal', description: data.error || 'Terjadi kesalahan', variant: 'destructive' }) }
    } catch { toast({ title: 'Verifikasi Gagal', description: 'Terjadi kesalahan', variant: 'destructive' }) } finally { setVerifying(false) }
  }

  const verificationPercent = stats ? stats.total > 0 ? Math.round(((stats.verified + stats.rejected) / stats.total) * 100) : 0 : 0
  const verifiedPercent = stats && stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0
  const rejectedPercent = stats && stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0
  const pendingPercent = stats && stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0

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

  const openEditDialog = (reg: Registration) => {
    setEditTarget(reg)
    setEditForm({
      noRegistrasi: reg.noRegistrasi || '', nama: reg.nama || '', nisn: reg.nisn || '', subJalur: reg.subJalur || '',
      nik: reg.nik || '', tanggalLahir: reg.tanggalLahir || '', alamat: reg.alamat || '', alamatLengkap: reg.alamatLengkap || '',
      noTelpSiswa: reg.noTelpSiswa || '', noTelpOrangtua: reg.noTelpOrangtua || '', npsnSekolahPilihan: reg.npsnSekolahPilihan || '',
      namaSekolahPilihan: reg.namaSekolahPilihan || '', jurusan: reg.jurusan || '', npsnSekolahAsal: reg.npsnSekolahAsal || '',
      namaSekolahAsal: reg.namaSekolahAsal || '', skorJarak: reg.skorJarak || '', skorNilaiRaport: reg.skorNilaiRaport || '',
      kekuranganVerifikasi: reg.kekuranganVerifikasi || '', tanggalVerif: reg.tanggalVerif || '', jamVerif: reg.jamVerif || '',
      terbitKK: reg.terbitKK || '', latitude: reg.latitude || '', longitude: reg.longitude || '', lokasiJarak: reg.lokasiJarak || '',
      nilaiRataRata: reg.nilaiRataRata || '', totalNilai: reg.totalNilai || '',
      statusLulus: reg.statusLulus || 'BELUM', statusDaftarUlang: reg.statusDaftarUlang || 'BELUM',
    })
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editTarget) return
    setSaving(true)
    try {
      const updateData = { ...editForm }
      if (updateData.terbitKK) {
        const calculatedLama = hitungLamaKK(updateData.terbitKK)
        if (calculatedLama) updateData['lamaKK'] = calculatedLama
      }
      const res = await fetch(`/api/registrations/${editTarget.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updateData) })
      const result = await res.json()
      if (result.success) {
        toast({ title: 'Berhasil', description: `Data ${editTarget.nama} berhasil diperbarui` })
        setEditDialogOpen(false); setEditTarget(null)
        fetchRegistrations(); fetchStats()
      } else { toast({ title: 'Gagal', description: result.error || 'Gagal menyimpan', variant: 'destructive' }) }
    } catch { toast({ title: 'Gagal', description: 'Terjadi kesalahan', variant: 'destructive' }) } finally { setSaving(false) }
  }

  const openDeleteDialog = (reg: Registration) => {
    setDeleteTarget(reg)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/registrations/${deleteTarget.id}`, { method: 'DELETE' })
      const result = await res.json()
      if (result.success) {
        toast({ title: 'Berhasil', description: `Data ${deleteTarget.nama} berhasil dihapus` })
        setDeleteDialogOpen(false); setDeleteTarget(null)
        fetchRegistrations(); fetchStats()
      } else { toast({ title: 'Gagal', description: result.error || 'Gagal menghapus', variant: 'destructive' }) }
    } catch { toast({ title: 'Gagal', description: 'Terjadi kesalahan', variant: 'destructive' }) } finally { setDeleting(false) }
  }

  const handlePrintReport = (type: 'diterima' | 'ditolak') => {
    const list = type === 'diterima' ? stats?.verifiedList || [] : stats?.rejectedList || []
    const title = type === 'diterima' ? 'LAPORAN PESERTA DITERIMA' : 'LAPORAN PESERTA DITOLAK'
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const rows = list.map((reg, idx) => `
      <tr>
        <td style="padding:6px 8px;border:1px solid #ddd;text-align:center">${idx + 1}</td>
        <td style="padding:6px 8px;border:1px solid #ddd">${reg.noRegistrasi}</td>
        <td style="padding:6px 8px;border:1px solid #ddd">${reg.nama}</td>
        <td style="padding:6px 8px;border:1px solid #ddd">${reg.nisn}</td>
        <td style="padding:6px 8px;border:1px solid #ddd">${reg.subJalur}</td>
        <td style="padding:6px 8px;border:1px solid #ddd">${reg.namaSekolahAsal}</td>
        <td style="padding:6px 8px;border:1px solid #ddd">${reg.jurusan}</td>
        <td style="padding:6px 8px;border:1px solid #ddd">${reg.tanggalVerif || '-'}</td>
        ${type === 'ditolak' ? `<td style="padding:6px 8px;border:1px solid #ddd">${reg.verificationNote || '-'}</td>` : ''}
      </tr>
    `).join('')
    printWindow.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
      <style>body{font-family:Arial,sans-serif;margin:20px}table{width:100%;border-collapse:collapse}th{background:#f5f5f5;padding:8px;border:1px solid #ddd;text-align:left}h1{text-align:center;font-size:18px}h2{text-align:center;font-size:14px;color:#666}</style></head>
      <body><h1>${title}</h1><h2>${appName}</h2>${schoolName ? `<h3 style="text-align:center;font-size:13px;color:#555">${schoolName}</h3>` : ''}<p style="text-align:center;color:#888">Dicetak pada: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      <table><thead><tr><th>No</th><th>No. Registrasi</th><th>Nama</th><th>NISN</th><th>Sub Jalur</th><th>Sekolah Asal</th><th>Jurusan</th><th>Tanggal Verif</th>${type === 'ditolak' ? '<th>Alasan Penolakan</th>' : ''}</tr></thead><tbody>${rows}</tbody></table></body></html>`)
    printWindow.document.close()
    printWindow.print()
  }

  const handleRankingPreview = (type: 'pdf' | 'excel') => {
    setRankingPreviewType(type)
    setRankingPreviewJalur('all')
    setRankingPreviewOpen(true)
  }

  const handleRankingPrintPDF = () => {
    const html = getRankingPrintHTML({
      selectedJalur: rankingPreviewJalur, rankingTampilan, rankingSekolah, rankingJurusan, rankingStatus,
      rankingData, rankingKuota, rankingKuotaPerJalur, appName, schoolName,
    })
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(html)
    printWindow.document.close()
    setTimeout(() => { printWindow.print() }, 500)
  }

  const _handleRankingExportExcel = () => {
    handleRankingExportExcel({
      rankingPreviewJalur, rankingTampilan, rankingSekolah, rankingJurusan, rankingStatus,
      rankingData, rankingKuota, rankingKuotaPerJalur, appName, schoolName,
    })
    toast({ title: 'Berhasil', description: 'File Excel berhasil diunduh' })
  }

  // ==================== MAIN RENDER ====================
  return (
    <AppLayout
      appName={appName}
      schoolName={schoolName}
      appIcon={appIcon}
      appSubtitle={appSubtitle}
      authUser={authUser}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      setLembarTab={setLembarTab}
      stats={stats}
      setPortalPasteOpen={setPortalPasteOpen}
      setImportDialogOpen={setImportDialogOpen}
      setChangePasswordOpen={setChangePasswordOpen}
      handleLogout={handleLogout}
      lembarVerifikasi={lembarVerifikasi}
      getPendingForLembar={getPendingForLembar}
      tahap={tahap}
      dialogs={
        <>
          {/* ==================== IMPORT DIALOG ==================== */}
          <ImportDialog
            open={importDialogOpen}
            onOpenChange={setImportDialogOpen}
            importStatus={importStatus}
            setImportStatus={setImportStatus}
            useCsvStatus={useCsvStatus}
            setUseCsvStatus={setUseCsvStatus}
            csvFile={csvFile}
            setCsvFile={handleSetCsvFile}
            importing={importing}
            onImport={handleImport}
            csvRowCount={csvRowCount}
          />

          {/* ==================== CHANGE PASSWORD DIALOG ==================== */}
          <ChangePasswordDialog
            open={changePasswordOpen}
            onOpenChange={setChangePasswordOpen}
            changePasswordCurrent={changePasswordCurrent}
            setChangePasswordCurrent={setChangePasswordCurrent}
            changePasswordNew={changePasswordNew}
            setChangePasswordNew={setChangePasswordNew}
            changePasswordConfirm={changePasswordConfirm}
            setChangePasswordConfirm={setChangePasswordConfirm}
            changePasswordError={changePasswordError}
            changePasswordLoading={changePasswordLoading}
            showCurrentPassword={showCurrentPassword}
            setShowCurrentPassword={setShowCurrentPassword}
            showNewPassword={showNewPassword}
            setShowNewPassword={setShowNewPassword}
            onSubmit={handleChangePassword}
          />

          {/* ==================== RANKING PREVIEW DIALOG ==================== */}
          <RankingPreviewDialog
            open={rankingPreviewOpen}
            onOpenChange={setRankingPreviewOpen}
            rankingPreviewType={rankingPreviewType}
            rankingPreviewJalur={rankingPreviewJalur}
            setRankingPreviewJalur={setRankingPreviewJalur}
            rankingData={rankingData}
            rankingFilters={rankingFilters}
            rankingTampilan={rankingTampilan}
            rankingSekolah={rankingSekolah}
            rankingJurusan={rankingJurusan}
            rankingStatus={rankingStatus}
            rankingKuota={rankingKuota}
            rankingKuotaPerJalur={rankingKuotaPerJalur}
            appName={appName}
            schoolName={schoolName}
            appSubtitle={appSubtitle}
            onPrintPDF={handleRankingPrintPDF}
            onExportExcel={_handleRankingExportExcel}
          />

          {/* ==================== PORTAL PASTE DIALOG ==================== */}
          <PortalPasteDialog
            open={portalPasteOpen}
            onOpenChange={setPortalPasteOpen}
            portalRawText={portalRawText}
            setPortalRawText={setPortalRawText}
            portalParsedData={portalParsedData}
            setPortalParsedData={setPortalParsedData}
            portalParsing={portalParsing}
            portalSelectedJalur={portalSelectedJalur}
            setPortalSelectedJalur={setPortalSelectedJalur}
            jalurConfigs={jalurConfigs}
            importing={importing}
            onPaste={handlePortalPaste}
            onSave={handlePortalSave}
            portalKekurangan={portalKekurangan}
            setPortalKekurangan={setPortalKekurangan}
            portalVerifStatus={portalVerifStatus}
            setPortalVerifStatus={setPortalVerifStatus}
            portalVerifNote={portalVerifNote}
            setPortalVerifNote={setPortalVerifNote}
            portalTanggalVerif={portalTanggalVerif}
            setPortalTanggalVerif={setPortalTanggalVerif}
            portalJamVerif={portalJamVerif}
            setPortalJamVerif={setPortalJamVerif}
            portalTerbitKK={portalTerbitKK}
            setPortalTerbitKK={setPortalTerbitKK}
          />

          {/* ==================== SUMUT BERKAH PASTE DIALOG ==================== */}
          <SumutBerkahDialog
            open={sumutBerkahOpen}
            onOpenChange={setSumutBerkahOpen}
            sumutBerkahText={sumutBerkahText}
            setSumutBerkahText={setSumutBerkahText}
            sumutBerkahParsing={sumutBerkahParsing}
            setSumutBerkahParsing={setSumutBerkahParsing}
            onSave={handleSumutBerkahSave}
            sumutBerkahPreview={sumutBerkahPreview}
            setSumutBerkahPreview={setSumutBerkahPreview}
            sumutBerkahResult={sumutBerkahResult}
            setSumutBerkahResult={setSumutBerkahResult}
            toast={toast}
          />

          {/* ==================== SINGLE VERIFY DIALOG ==================== */}
          <SingleVerifyDialog
            open={verifyDialogOpen}
            onOpenChange={setVerifyDialogOpen}
            verifyAction={verifyAction}
            verifyNote={verifyNote}
            setVerifyNote={setVerifyNote}
            verifying={verifying}
            onVerify={handleVerify}
          />

          {/* ==================== BULK VERIFY DIALOG ==================== */}
          <BulkVerifyDialog
            open={bulkVerifyDialogOpen}
            onOpenChange={setBulkVerifyDialogOpen}
            verifyAction={verifyAction}
            verifyNote={verifyNote}
            setVerifyNote={setVerifyNote}
            verifying={verifying}
            onVerify={handleBulkVerify}
          />

          {/* ==================== DETAIL DIALOG ==================== */}
          <DetailDialog
            open={detailDialogOpen}
            onOpenChange={setDetailDialogOpen}
            detailTarget={detailTarget}
          />

          {/* ==================== EDIT DIALOG ==================== */}
          <EditDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            editTarget={editTarget}
            editForm={editForm}
            setEditForm={setEditForm}
            saving={saving}
            onSave={handleSaveEdit}
          />

          {/* ==================== DELETE DIALOG ==================== */}
          <DeleteDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            deleteTarget={deleteTarget}
            deleting={deleting}
            onDelete={handleDelete}
          />

          {/* ==================== DUPLICATE CHECK DIALOG ==================== */}
          <DuplicateCheckDialog
            open={duplicateDialogOpen}
            onOpenChange={setDuplicateDialogOpen}
            duplicateLoading={duplicateLoading}
            duplicateData={duplicateData}
          />
        </>
      }
    >
      {/* ==================== DASHBOARD TAB ==================== */}
      <TabsContent value="dashboard" className="space-y-6">
        <DashboardTab
          stats={stats}
          appName={appName}
          schoolName={schoolName}
          appSubtitle={appSubtitle}
          lembarVerifikasi={lembarVerifikasi}
          setActiveTab={setActiveTab}
          setLembarTab={setLembarTab}
          verificationPercent={verificationPercent}
          verifiedPercent={verifiedPercent}
          rejectedPercent={rejectedPercent}
          pendingPercent={pendingPercent}
          getPendingForLembar={getPendingForLembar}
          authUser={authUser}
        />
      </TabsContent>

      {/* ==================== LEMBAR VERIFIKASI TAB ==================== */}
      <TabsContent value="lembar-verifikasi" className="space-y-6">
        <Tabs value={lembarTab} onValueChange={setLembarTab}>
          <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
            <TabsList className="flex-nowrap sm:flex-wrap h-auto gap-1 bg-white/60 backdrop-blur-sm border rounded-xl p-1 shadow-sm w-max sm:w-auto">
              {lembarVerifikasi.map((lv) => {
                const LvIcon = lv.icon
                const pendingCount = getPendingForLembar(lv.subJalurFilter)
                const hasChildren = lv.children && lv.children.length > 0
                return (
                  <TabsTrigger key={lv.key} value={lv.key} className="gap-1 text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap">
                    <LvIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden md:inline">{lv.label}</span>
                    <span className="md:hidden">{lv.label.length > 10 ? lv.label.substring(0, 8) + '..' : lv.label}</span>
                    {pendingCount > 0 && <Badge className="ml-0.5 bg-amber-500 text-white text-[10px] sm:text-xs px-1 py-0 min-w-[14px] sm:min-w-[16px] h-3.5 sm:h-4 flex items-center justify-center">{pendingCount}</Badge>}
                    {hasChildren && <span className="text-[10px] text-gray-400">▼</span>}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>
          {lembarVerifikasi.map((lv) => {
            const hasChildren = lv.children && lv.children.length > 0
            return (
              <TabsContent key={lv.key} value={lv.key} className="mt-4">
                {hasChildren ? (
                  <div className="space-y-4">
                    {/* Sub-tabs for parent jalur */}
                    <Tabs value={lembarSubTab || '__all__'} onValueChange={setLembarSubTab}>
                      <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
                        <TabsList className="flex-nowrap sm:flex-wrap h-auto gap-1 bg-gray-50/80 border rounded-lg p-1 w-max sm:w-auto">
                          <TabsTrigger value="__all__" className="gap-1 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-md whitespace-nowrap font-semibold">
                            <lv.icon className={`w-3.5 h-3.5 ${lv.iconColor}`} />
                            Semua {lv.label}
                          </TabsTrigger>
                          {lv.children!.map((child) => {
                            const ChildIcon = child.icon
                            return (
                              <TabsTrigger key={child.key} value={child.key} className="gap-1 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-md whitespace-nowrap">
                                <ChildIcon className={`w-3.5 h-3.5 ${child.iconColor}`} />
                                {child.label}
                              </TabsTrigger>
                            )
                          })}
                        </TabsList>
                      </div>

                      {/* All children combined */}
                      <TabsContent value="__all__" className="mt-4">
                        <LembarVerifikasiSheet
                          config={lv}
                          subJalurOptions={subJalurOptions}
                          onVerify={() => {}}
                          onBulkVerify={() => {}}
                          onViewDetail={handleViewDetail}
                          toast={toast}
                          highlightRegId={highlightRegId}
                        />
                      </TabsContent>

                      {/* Individual child */}
                      {lv.children!.map((child) => (
                        <TabsContent key={child.key} value={child.key} className="mt-4">
                          <LembarVerifikasiSheet
                            config={child}
                            subJalurOptions={subJalurOptions}
                            onVerify={() => {}}
                            onBulkVerify={() => {}}
                            onViewDetail={handleViewDetail}
                            toast={toast}
                            highlightRegId={highlightRegId}
                          />
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                ) : (
                  <LembarVerifikasiSheet
                    config={lv}
                    subJalurOptions={subJalurOptions}
                    onVerify={() => {}}
                    onBulkVerify={() => {}}
                    onViewDetail={handleViewDetail}
                    toast={toast}
                    highlightRegId={highlightRegId}
                  />
                )}
              </TabsContent>
            )
          })}
        </Tabs>
      </TabsContent>

      {/* ==================== DATA PENDAFTAR TAB ==================== */}
      <TabsContent value="data" className="space-y-4">
        <DataPendaftarTab
          search={search} setSearch={setSearch}
          subJalurFilter={subJalurFilter} setSubJalurFilter={setSubJalurFilter}
          verificationFilter={verificationFilter} setVerificationFilter={setVerificationFilter}
          jurusanFilter={jurusanFilter} setJurusanFilter={setJurusanFilter}
          registrations={registrations}
          pagination={pagination} setPagination={setPagination}
          selectedIds={selectedIds} setSelectedIds={setSelectedIds}
          loading={loading}
          namaSortData={namaSortData} setNamaSortData={setNamaSortData}
          groupBySekolah={groupBySekolah} setGroupBySekolah={setGroupBySekolah}
          subJalurOptions={subJalurOptions}
          dataLimit={dataLimit} setDataLimit={setDataLimit}
          setImportDialogOpen={setImportDialogOpen}
          setSumutBerkahOpen={setSumutBerkahOpen}
          checkDuplicates={checkDuplicates}
          setVerifyAction={setVerifyAction}
          setBulkVerifyDialogOpen={setBulkVerifyDialogOpen}
          setVerifyTargetId={setVerifyTargetId}
          setVerifyNote={setVerifyNote}
          setVerifyDialogOpen={setVerifyDialogOpen}
          setDetailTarget={setDetailTarget}
          setDetailDialogOpen={setDetailDialogOpen}
          openEditDialog={openEditDialog}
          openDeleteDialog={openDeleteDialog}
        />
      </TabsContent>

      {/* ==================== RANKING TAB ==================== */}
      <TabsContent value="ranking" className="space-y-6">
        <RankingTab
          rankingJalur={rankingJalur} setRankingJalur={setRankingJalur}
          rankingSekolah={rankingSekolah} setRankingSekolah={setRankingSekolah}
          rankingJurusan={rankingJurusan} setRankingJurusan={setRankingJurusan}
          rankingTampilan={rankingTampilan} setRankingTampilan={setRankingTampilan}
          rankingStatus={rankingStatus} setRankingStatus={setRankingStatus}
          rankingData={rankingData}
          rankingFilters={rankingFilters}
          rankingKuota={rankingKuota}
          rankingKuotaPerJalur={rankingKuotaPerJalur}
          rankingLoading={rankingLoading}
          namaSortRanking={namaSortRanking} setNamaSortRanking={setNamaSortRanking}
          fetchRanking={fetchRanking}
          handleRankingPreview={handleRankingPreview}
        />
      </TabsContent>

      {/* ==================== DITERIMA TAB ==================== */}
      <TabsContent value="diterima" className="space-y-6">
        <DiterimaTab
          stats={stats}
          appName={appName}
          schoolName={schoolName}
          appSubtitle={appSubtitle}
          verifiedPercent={verifiedPercent}
          diterimaFilterJalur={diterimaFilterJalur} setDiterimaFilterJalur={setDiterimaFilterJalur}
          diterimaFilterSekolah={diterimaFilterSekolah} setDiterimaFilterSekolah={setDiterimaFilterSekolah}
          subJalurOptions={subJalurOptions}
          namaSortDiterima={namaSortDiterima} setNamaSortDiterima={setNamaSortDiterima}
          handlePrintReport={handlePrintReport}
          setDetailTarget={setDetailTarget} setDetailDialogOpen={setDetailDialogOpen}
          openEditDialog={openEditDialog} openDeleteDialog={openDeleteDialog}
        />
      </TabsContent>

      {/* ==================== DITOLAK TAB ==================== */}
      <TabsContent value="ditolak" className="space-y-6">
        <DitolakTab
          stats={stats}
          appName={appName}
          schoolName={schoolName}
          appSubtitle={appSubtitle}
          rejectedPercent={rejectedPercent}
          ditolakFilterJalur={ditolakFilterJalur} setDitolakFilterJalur={setDitolakFilterJalur}
          subJalurOptions={subJalurOptions}
          namaSortDitolak={namaSortDitolak} setNamaSortDitolak={setNamaSortDitolak}
          handlePrintReport={handlePrintReport}
          setDetailTarget={setDetailTarget} setDetailDialogOpen={setDetailDialogOpen}
          openEditDialog={openEditDialog} openDeleteDialog={openDeleteDialog}
        />
      </TabsContent>

      {/* ==================== KELULUSAN TAB ==================== */}
      <TabsContent value="kelulusan" className="space-y-6">
        <KelulusanTab
          stats={stats}
          appName={appName}
          schoolName={schoolName}
          appSubtitle={appSubtitle}
          registrations={registrations}
          selectedIds={selectedIds} setSelectedIds={setSelectedIds}
          fetchStats={fetchStats}
          fetchRegistrations={fetchRegistrations}
          toast={toast}
        />
      </TabsContent>

      {/* ==================== DAFTAR ULANG TAB ==================== */}
      <TabsContent value="daftar-ulang" className="space-y-6">
        <DaftarUlangTab
          stats={stats}
          appName={appName}
          schoolName={schoolName}
          appSubtitle={appSubtitle}
          registrations={registrations}
          selectedIds={selectedIds} setSelectedIds={setSelectedIds}
          fetchStats={fetchStats}
          fetchRegistrations={fetchRegistrations}
          toast={toast}
        />
      </TabsContent>

      {/* ==================== PENGATURAN TAB ==================== */}
      <TabsContent value="pengaturan" className="space-y-6">
        <PengaturanTab
          appName={appName} schoolName={schoolName} authUser={authUser}
          users={users} usersLoading={usersLoading}
          addUserOpen={addUserOpen} setAddUserOpen={setAddUserOpen}
          addUserForm={addUserForm} setAddUserForm={setAddUserForm}
          userSaving={userSaving} handleAddUser={handleAddUser}
          editUserOpen={editUserOpen} setEditUserOpen={setEditUserOpen}
          editUserData={editUserData} setEditUserData={setEditUserData} editUserForm={editUserForm} setEditUserForm={setEditUserForm}
          handleEditUser={handleEditUser}
          deleteUserOpen={deleteUserOpen} setDeleteUserOpen={setDeleteUserOpen}
          deleteUserTarget={deleteUserTarget} setDeleteUserTarget={setDeleteUserTarget} deleteUserLoading={deleteUserLoading} handleDeleteUser={handleDeleteUser}
          editProfileOpen={editProfileOpen} setEditProfileOpen={setEditProfileOpen}
          editProfileForm={editProfileForm} setEditProfileForm={setEditProfileForm}
          editProfileSaving={editProfileSaving} handleUpdateProfile={handleUpdateProfile}
          setAppName={setAppName} setSchoolName={setSchoolName}
          appIcon={appIcon} setAppIcon={setAppIcon}
          appSubtitle={appSubtitle} setAppSubtitle={setAppSubtitle}
          saveAppName={saveAppName} settingsSaving={settingsSaving}
          kuota={kuota} setKuota={setKuota} saveKuota={saveKuota}
          jalurConfigs={jalurConfigs} setJalurConfigs={setJalurConfigs}
          updateJalurPersentase={updateJalurPersentase}
          addJalurOpen={addJalurOpen} setAddJalurOpen={setAddJalurOpen}
          newJalurNama={newJalurNama} setNewJalurNama={setNewJalurNama}
          newJalurPersentase={newJalurPersentase} setNewJalurPersentase={setNewJalurPersentase}
          addJalur={addJalur} deleteJalur={deleteJalur} toggleJalurAktif={toggleJalurAktif}
          settingsLoading={settingsLoading}
          portalSyncEmail={portalSyncEmail} setPortalSyncEmail={setPortalSyncEmail}
          portalSyncPassword={portalSyncPassword} setPortalSyncPassword={setPortalSyncPassword}
          portalSyncStatus={portalSyncStatus} setPortalSyncStatus={setPortalSyncStatus}
          portalSyncPages={portalSyncPages} setPortalSyncPages={setPortalSyncPages}
          portalSyncing={portalSyncing} handlePortalSync={handlePortalSync}
          portalSyncResult={portalSyncResult}
          resetPasswordOpen={resetPasswordOpen} setResetPasswordOpen={setResetPasswordOpen}
          resetPasswordTarget={resetPasswordTarget} resetPasswordNew={resetPasswordNew} setResetPasswordNew={setResetPasswordNew}
          resetPasswordLoading={resetPasswordLoading} handleResetPassword={handleResetPassword}
          showResetPassword={showResetPassword} setShowResetPassword={setShowResetPassword}
          tahap={tahap} setTahap={setTahap}
          jalurAktifPerTahap={jalurAktifPerTahap} setJalurAktifPerTahap={setJalurAktifPerTahap}
          fetchStats={fetchStats} fetchRegistrations={fetchRegistrations} fetchRanking={fetchRanking}
        />
      </TabsContent>
    </AppLayout>
  )
}
