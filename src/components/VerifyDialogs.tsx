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
import { Textarea } from '@/components/ui/textarea'
import { ThumbsUp, ThumbsDown, AlertTriangle, Loader2 } from 'lucide-react'

// ==================== SINGLE VERIFY DIALOG ====================

interface SingleVerifyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  verifyAction: 'VERIFIED' | 'REJECTED'
  verifyNote: string
  setVerifyNote: (note: string) => void
  verifying: boolean
  onVerify: () => void
  appName: string
  schoolName: string
}

export function SingleVerifyDialog({
  open,
  onOpenChange,
  verifyAction,
  verifyNote,
  setVerifyNote,
  verifying,
  onVerify,
  appName,
  schoolName,
}: SingleVerifyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              ? `Apakah Anda yakin ingin MENERIMA pendaftar ini? Data akan diverifikasi dan diterima di ${appName}${schoolName ? ' — ' + schoolName : ''}.`
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button
            onClick={onVerify}
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
  )
}

// ==================== BULK VERIFY DIALOG ====================

interface BulkVerifyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  verifyAction: 'VERIFIED' | 'REJECTED'
  verifyNote: string
  setVerifyNote: (note: string) => void
  verifying: boolean
  selectedCount: number
  onBulkVerify: () => void
}

export function BulkVerifyDialog({
  open,
  onOpenChange,
  verifyAction,
  verifyNote,
  setVerifyNote,
  verifying,
  selectedCount,
  onBulkVerify,
}: BulkVerifyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {verifyAction === 'VERIFIED' ? (
              <><ThumbsUp className="w-5 h-5 text-emerald-600" /> Terima {selectedCount} Pendaftar</>
            ) : (
              <><ThumbsDown className="w-5 h-5 text-red-600" /> Tolak {selectedCount} Pendaftar</>
            )}
          </DialogTitle>
          <DialogDescription>
            {verifyAction === 'VERIFIED'
              ? `Apakah Anda yakin ingin MENERIMA ${selectedCount} pendaftar yang dipilih?`
              : `Apakah Anda yakin ingin MENOLAK ${selectedCount} pendaftar yang dipilih?`}
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button
            onClick={onBulkVerify}
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
  )
}

// ==================== DELETE DIALOG ====================

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deleteTargetName: string | undefined
  deleting: boolean
  onDelete: () => void
}

export function DeleteDialog({
  open,
  onOpenChange,
  deleteTargetName,
  deleting,
  onDelete,
}: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2Icon className="w-5 h-5 text-red-600" /> Hapus Data Pendaftar
          </DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus data pendaftar <span className="font-semibold">{deleteTargetName}</span>? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex gap-2">
            <AlertCircleIcon className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">Data yang sudah dihapus tidak dapat dikembalikan. Pastikan Anda yakin sebelum melanjutkan.</p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button variant="destructive" onClick={onDelete} disabled={deleting}>
            {deleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Menghapus...</> : <><Trash2Icon className="w-4 h-4" /> Hapus</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Icons used in DeleteDialog (local aliases to avoid naming conflicts with lucide imports)
import { Trash2 as Trash2Icon, AlertCircle as AlertCircleIcon } from 'lucide-react'
