'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lock, XCircle, Eye, EyeOff, Loader2 } from 'lucide-react'

interface ChangePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  changePasswordCurrent: string
  setChangePasswordCurrent: (val: string) => void
  changePasswordNew: string
  setChangePasswordNew: (val: string) => void
  changePasswordConfirm: string
  setChangePasswordConfirm: (val: string) => void
  changePasswordError: string
  changePasswordLoading: boolean
  showCurrentPassword: boolean
  setShowCurrentPassword: (val: boolean) => void
  showNewPassword: boolean
  setShowNewPassword: (val: boolean) => void
  onSubmit: (e: React.FormEvent) => void
}

export default function ChangePasswordDialog({
  open,
  onOpenChange,
  changePasswordCurrent,
  setChangePasswordCurrent,
  changePasswordNew,
  setChangePasswordNew,
  changePasswordConfirm,
  setChangePasswordConfirm,
  changePasswordError,
  changePasswordLoading,
  showCurrentPassword,
  setShowCurrentPassword,
  showNewPassword,
  setShowNewPassword,
  onSubmit,
}: ChangePasswordDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600" />
            Ganti Password
          </DialogTitle>
          <DialogDescription>Ubah password akun Anda</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4" autoComplete="off">
          {changePasswordError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-red-700 text-sm">{changePasswordError}</p>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">Password Lama</label>
            <div className="relative">
              <Input
                type={showCurrentPassword ? 'text' : 'password'}
                name="current-password"
                value={changePasswordCurrent}
                onChange={(e) => setChangePasswordCurrent(e.target.value)}
                placeholder="Masukkan password lama"
                autoComplete="off"
                required
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password Baru</label>
            <div className="relative">
              <Input
                type={showNewPassword ? 'text' : 'password'}
                name="new-password"
                value={changePasswordNew}
                onChange={(e) => setChangePasswordNew(e.target.value)}
                placeholder="Minimal 6 karakter"
                autoComplete="new-password"
                required
                minLength={6}
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowNewPassword(!showNewPassword)}>
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Konfirmasi Password Baru</label>
            <Input
              type="password"
              name="confirm-new-password"
              value={changePasswordConfirm}
              onChange={(e) => setChangePasswordConfirm(e.target.value)}
              placeholder="Ulangi password baru"
              autoComplete="new-password"
              required
              minLength={6}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" disabled={changePasswordLoading} className="bg-emerald-600 hover:bg-emerald-700">
              {changePasswordLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Menyimpan...</> : 'Simpan Password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
