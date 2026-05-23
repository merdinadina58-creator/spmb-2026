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
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react'
import { STATUS_COLORS } from '@/lib/constants'

interface DuplicateGroup {
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
}

interface DuplicateData {
  summary: {
    totalChecked: number
    nisnDuplicateGroups: number
    nisnDuplicateCount: number
    nameDuplicateGroups: number
    nameDuplicateCount: number
  } | null
  duplicates: DuplicateGroup[]
}

interface DuplicateCheckDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  duplicateLoading: boolean
  duplicateData: DuplicateData
  onRecheck: () => void
}

export default function DuplicateCheckDialog({
  open,
  onOpenChange,
  duplicateLoading,
  duplicateData,
  onRecheck,
}: DuplicateCheckDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Pemeriksaan Data Duplikat
          </DialogTitle>
          <DialogDescription>
            Mendeteksi data ganda berdasarkan NISN dan nama yang sama
          </DialogDescription>
        </DialogHeader>

        {duplicateLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <p className="text-sm text-gray-400 ml-3">Memeriksa data duplikat...</p>
          </div>
        ) : duplicateData.summary ? (
          <div className="space-y-4 overflow-y-auto max-h-[60vh]">
            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center border">
                <p className="text-2xl font-bold text-gray-700">{duplicateData.summary.totalChecked}</p>
                <p className="text-xs text-gray-500">Data Diperiksa</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-200">
                <p className="text-2xl font-bold text-amber-600">{duplicateData.summary.nisnDuplicateGroups}</p>
                <p className="text-xs text-amber-600">Duplikat NISN</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center border border-red-200">
                <p className="text-2xl font-bold text-red-600">{duplicateData.summary.nameDuplicateGroups}</p>
                <p className="text-xs text-red-600">Nama Mirip</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-200">
                <p className="text-2xl font-bold text-emerald-600">
                  {duplicateData.summary.nisnDuplicateGroups + duplicateData.summary.nameDuplicateGroups === 0 ? 0 : duplicateData.summary.nisnDuplicateCount + duplicateData.summary.nameDuplicateCount}
                </p>
                <p className="text-xs text-emerald-600">Total Terindikasi</p>
              </div>
            </div>

            {duplicateData.duplicates.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-emerald-700">Tidak Ada Data Duplikat</p>
                <p className="text-sm text-gray-500 mt-1">Semua data pendaftar unik, tidak ditemukan duplikat</p>
              </div>
            ) : (
              <div className="space-y-3">
                {duplicateData.duplicates.map((group, groupIdx) => (
                  <div key={groupIdx} className={`border rounded-xl overflow-hidden ${group.type === 'nisn' ? 'border-amber-300' : 'border-red-300'}`}>
                    <div className={`px-4 py-2.5 flex items-center justify-between ${group.type === 'nisn' ? 'bg-amber-50' : 'bg-red-50'}`}>
                      <div className="flex items-center gap-2">
                        {group.type === 'nisn' ? (
                          <Badge className="bg-amber-500 text-white text-[10px]">NISN Ganda</Badge>
                        ) : (
                          <Badge className="bg-red-500 text-white text-[10px]">Nama Mirip</Badge>
                        )}
                        <span className="text-sm font-semibold text-gray-800">{group.label}</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{group.count} data</Badge>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/50">
                          <TableHead className="w-8 text-xs">No</TableHead>
                          <TableHead className="text-xs">No. Reg</TableHead>
                          <TableHead className="text-xs">Nama</TableHead>
                          <TableHead className="text-xs">NISN</TableHead>
                          <TableHead className="text-xs">Sekolah Pilihan</TableHead>
                          <TableHead className="text-xs">Sekolah Asal</TableHead>
                          <TableHead className="text-xs">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.registrations.map((reg, regIdx) => (
                          <TableRow key={`dup-${reg.id}-${regIdx}`} className={
                            reg.verificationStatus === 'VERIFIED' ? 'bg-emerald-50/30' :
                            reg.verificationStatus === 'REJECTED' ? 'bg-red-50/30' : ''
                          }>
                            <TableCell className="text-xs text-gray-400">{regIdx + 1}</TableCell>
                            <TableCell className="font-mono text-xs">{reg.noRegistrasi}</TableCell>
                            <TableCell className="text-xs font-medium">{reg.nama}</TableCell>
                            <TableCell className="font-mono text-xs">{reg.nisn}</TableCell>
                            <TableCell className="text-xs">{reg.namaSekolahPilihan}</TableCell>
                            <TableCell className="text-xs">{reg.namaSekolahAsal}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[reg.verificationStatus]}`}>
                                {reg.verificationStatus === 'PENDING' ? 'Menunggu' :
                                 reg.verificationStatus === 'VERIFIED' ? 'Diterima' : 'Ditolak'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Tutup</Button>
          {!duplicateLoading && (
            <Button onClick={onRecheck} className="bg-amber-600 hover:bg-amber-700">
              <RefreshCw className="w-4 h-4" /> Periksa Ulang
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
