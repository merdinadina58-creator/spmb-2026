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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  UserCog,
  Loader2,
  Trash2,
  UserCheck,
  UserX,
  ClipboardCheck,
  Plus,
  Lock,
  RefreshCw,
} from 'lucide-react'

interface UserManagementTabProps {
  authUser: { id: string; username: string; namaLengkap: string; role: string } | null
  toast: any
  onConfirmAction: (config: { title: string; description: string; onConfirm: () => void; variant?: 'destructive' | 'default' }) => void
}

export default function UserManagementTab({ authUser, toast, onConfirmAction }: UserManagementTabProps) {
  // User management state
  const [userList, setUserList] = useState<Array<{ id: string; username: string; namaLengkap: string; role: string; aktif: boolean; lastLogin: string | null; createdAt: string }>>([])
  const [userListLoading, setUserListLoading] = useState(false)
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [newUserUsername, setNewUserUsername] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [newUserNama, setNewUserNama] = useState('')
  const [newUserRole, setNewUserRole] = useState('verifikator')
  const [addUserLoading, setAddUserLoading] = useState(false)

  // Audit log state
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; action: string; entityType: string; entityId: string | null; details: string | null; createdAt: string; user: { id: string; username: string; namaLengkap: string; role: string } }>>([])
  const [auditLoading, setAuditLoading] = useState(false)
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false)
  const [resetPasswordUser, setResetPasswordUser] = useState<{ id: string; username: string; namaLengkap: string } | null>(null)
  const [resetPasswordNew, setResetPasswordNew] = useState('')
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false)

  // ==================== USER MANAGEMENT FUNCTIONS ====================

  const fetchUsers = useCallback(async () => {
    setUserListLoading(true)
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      if (data.success) {
        setUserList(data.users || [])
      }
    } catch {
      toast({ title: 'Error', description: 'Gagal memuat data pengguna', variant: 'destructive' })
    } finally {
      setUserListLoading(false)
    }
  }, [toast])

  const fetchAuditLogs = useCallback(async () => {
    setAuditLoading(true)
    try {
      const res = await fetch('/api/audit-log?limit=50')
      const data = await res.json()
      if (data.success) {
        setAuditLogs(data.logs || [])
      }
    } catch {
      // Silent fail for audit logs
    } finally {
      setAuditLoading(false)
    }
  }, [])

  const handleAddUser = async () => {
    if (!newUserUsername || !newUserPassword || !newUserNama) {
      toast({ title: 'Error', description: 'Semua field harus diisi', variant: 'destructive' })
      return
    }
    setAddUserLoading(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUserUsername, password: newUserPassword, namaLengkap: newUserNama, role: newUserRole }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Berhasil', description: `Pengguna ${newUserUsername} berhasil ditambahkan` })
        setAddUserOpen(false)
        setNewUserUsername('')
        setNewUserPassword('')
        setNewUserNama('')
        setNewUserRole('verifikator')
        fetchUsers()
      } else {
        toast({ title: 'Gagal', description: data.error || 'Gagal menambahkan pengguna', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setAddUserLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!resetPasswordUser || !resetPasswordNew) return
    if (resetPasswordNew.length < 6) {
      toast({ title: 'Error', description: 'Password minimal 6 karakter', variant: 'destructive' })
      return
    }
    setResetPasswordLoading(true)
    try {
      const res = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: resetPasswordUser.id, newPassword: resetPasswordNew }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Berhasil', description: `Password ${resetPasswordUser.username} berhasil direset` })
        setResetPasswordOpen(false)
        setResetPasswordUser(null)
        setResetPasswordNew('')
      } else {
        toast({ title: 'Gagal', description: data.error || 'Gagal mereset password', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setResetPasswordLoading(false)
    }
  }

  const handleToggleUser = async (userId: string, currentAktif: boolean) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aktif: !currentAktif }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Berhasil', description: `Pengguna berhasil ${!currentAktif ? 'diaktifkan' : 'dinonaktifkan'}` })
        fetchUsers()
      } else {
        toast({ title: 'Gagal', description: data.error || 'Gagal mengubah status', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Terjadi kesalahan', variant: 'destructive' })
    }
  }

  const doDeleteUser = async (userId: string, username: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Berhasil', description: `Pengguna ${username} berhasil dihapus` })
        fetchUsers()
      } else {
        toast({ title: 'Gagal', description: data.error || 'Gagal menghapus pengguna', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Terjadi kesalahan', variant: 'destructive' })
    }
  }

  const handleDeleteUser = (userId: string, username: string) => {
    onConfirmAction({ title: 'Hapus Pengguna', description: `Hapus pengguna "${username}"? Tindakan ini tidak dapat dibatalkan.`, variant: 'destructive', onConfirm: () => doDeleteUser(userId, username) })
  }

  // Fetch users and audit logs on mount
  useEffect(() => {
    fetchUsers()
    fetchAuditLogs()
  }, [fetchUsers, fetchAuditLogs])

  return (
    <>
      {/* Header */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-violet-700 via-purple-600 to-fuchsia-600 p-4 sm:p-6 text-white">
          <div className="flex items-center gap-2 sm:gap-3">
            <UserCog className="w-6 h-6 sm:w-8 sm:h-8" />
            <div>
              <h2 className="text-lg sm:text-2xl font-bold tracking-wide">MANAJEMEN PENGGUNA</h2>
              <p className="text-violet-100 mt-0.5 sm:mt-1 text-xs sm:text-sm">SPMB 2026 — Kelola akun pengguna sistem verifikasi</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Add User Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{userList.length} pengguna terdaftar</p>
        <Button onClick={() => setAddUserOpen(true)} className="bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4" /> Tambah Pengguna
        </Button>
      </div>

      {/* Users Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          {userListLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <p className="text-sm text-gray-400 ml-2">Memuat data pengguna...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-violet-50/80">
                  <TableHead className="w-10 text-center">No</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Nama Lengkap</TableHead>
                  <TableHead className="text-center">Role</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Login Terakhir</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                      Belum ada pengguna
                    </TableCell>
                  </TableRow>
                ) : (
                  userList.map((user, idx) => (
                    <TableRow key={user.id} className={!user.aktif ? 'opacity-50' : ''}>
                      <TableCell className="text-center text-sm text-gray-500">{idx + 1}</TableCell>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.namaLengkap}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={user.role === 'admin'
                          ? 'bg-violet-100 text-violet-800 border-violet-200'
                          : 'bg-sky-100 text-sky-800 border-sky-200'
                        }>
                          {user.role === 'admin' ? 'Admin' : 'Verifikator'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={user.aktif
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-red-100 text-red-800 border-red-200'
                        }>
                          {user.aktif ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString('id-ID') : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => {
                              setResetPasswordUser({ id: user.id, username: user.username, namaLengkap: user.namaLengkap })
                              setResetPasswordNew('')
                              setResetPasswordOpen(true)
                            }}
                          >
                            <Lock className="w-3 h-3 mr-1" /> Reset Password
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className={`h-7 text-xs ${user.aktif ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'}`}
                            onClick={() => handleToggleUser(user.id, user.aktif)}
                          >
                            {user.aktif ? <UserX className="w-3 h-3 mr-1" /> : <UserCheck className="w-3 h-3 mr-1" />}
                            {user.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                          </Button>
                          {user.id !== authUser?.id && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteUser(user.id, user.username)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ==================== AUDIT LOG ==================== */}
      <Card className="mt-6">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardCheck className="w-5 h-5 text-violet-600" />
              Riwayat Aktivitas
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={fetchAuditLogs} disabled={auditLoading}>
              <RefreshCw className={`w-4 h-4 ${auditLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-80 overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-white">
                <TableRow className="bg-violet-50/80">
                  <TableHead className="w-36">Waktu</TableHead>
                  <TableHead className="w-28">Pengguna</TableHead>
                  <TableHead className="w-28">Aksi</TableHead>
                  <TableHead>Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" /></TableCell></TableRow>
                ) : auditLogs.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-400 text-sm">Belum ada aktivitas tercatat</TableCell></TableRow>
                ) : auditLogs.map((log) => {
                  const actionLabels: Record<string, { label: string; color: string }> = {
                    VERIFY: { label: '✅ Terima', color: 'bg-emerald-100 text-emerald-700' },
                    REJECT: { label: '❌ Tolak', color: 'bg-red-100 text-red-700' },
                    REVERT: { label: '🔄 Kembalikan', color: 'bg-amber-100 text-amber-700' },
                    BULK_VERIFY: { label: '✅ Terima Bulk', color: 'bg-emerald-100 text-emerald-700' },
                    BULK_REJECT: { label: '❌ Tolak Bulk', color: 'bg-red-100 text-red-700' },
                    IMPORT: { label: '📥 Import', color: 'bg-blue-100 text-blue-700' },
                    EDIT: { label: '✏️ Edit', color: 'bg-sky-100 text-sky-700' },
                    DELETE: { label: '🗑️ Hapus', color: 'bg-red-100 text-red-700' },
                    SETTINGS_CHANGE: { label: '⚙️ Pengaturan', color: 'bg-gray-100 text-gray-700' },
                    USER_MANAGE: { label: '👤 Pengguna', color: 'bg-violet-100 text-violet-700' },
                  }
                  const actionInfo = actionLabels[log.action] || { label: log.action, color: 'bg-gray-100 text-gray-700' }
                  let detailText = ''
                  try {
                    const d = log.details ? JSON.parse(log.details) : {}
                    if (d.nama) detailText = d.nama
                    if (d.count) detailText = `${d.count} data`
                    if (d.imported) detailText = `${d.imported} import (${d.created} baru, ${d.updated} update)`
                    if (d.from && d.to) detailText = `${d.nama || ''}: ${d.from} → ${d.to}`
                  } catch { detailText = log.details || '' }
                  return (
                    <TableRow key={log.id} className="hover:bg-violet-50/30 text-xs">
                      <TableCell className="text-gray-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell className="font-medium">{log.user?.namaLengkap || log.user?.username || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${actionInfo.color}`}>{actionInfo.label}</Badge>
                      </TableCell>
                      <TableCell className="text-gray-600 max-w-[200px] truncate">{detailText}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-violet-600" />
              Tambah Pengguna Baru
            </DialogTitle>
            <DialogDescription>Buat akun baru untuk mengakses sistem verifikasi SPMB 2026</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Lengkap</label>
              <Input
                value={newUserNama}
                onChange={(e) => setNewUserNama(e.target.value)}
                placeholder="Nama lengkap pengguna"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input
                value={newUserUsername}
                onChange={(e) => setNewUserUsername(e.target.value)}
                placeholder="Minimal 3 karakter"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={newUserRole} onValueChange={setNewUserRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="verifikator">Verifikator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAddUserOpen(false)}>Batal</Button>
            <Button onClick={handleAddUser} disabled={addUserLoading} className="bg-violet-600 hover:bg-violet-700">
              {addUserLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
              Tambah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-600" />
              Reset Password
            </DialogTitle>
            <DialogDescription>
              Reset password untuk pengguna <strong>{resetPasswordUser?.username}</strong> ({resetPasswordUser?.namaLengkap})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Password Baru</label>
              <Input
                type="password"
                value={resetPasswordNew}
                onChange={(e) => setResetPasswordNew(e.target.value)}
                placeholder="Minimal 6 karakter"
              />
            </div>
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-3">
              ⚠ Password baru akan langsung aktif. Semua sesi login pengguna ini akan dihapus dan mereka perlu login ulang.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setResetPasswordOpen(false); setResetPasswordUser(null); setResetPasswordNew('') }}>Batal</Button>
            <Button onClick={handleResetPassword} disabled={resetPasswordLoading} className="bg-amber-600 hover:bg-amber-700">
              {resetPasswordLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Lock className="w-4 h-4 mr-1" />}
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
