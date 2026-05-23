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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Upload, FileSpreadsheet, AlertTriangle, Loader2 } from 'lucide-react'

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  importStatus: string
  setImportStatus: (status: string) => void
  useCsvStatus: boolean
  setUseCsvStatus: (use: boolean) => void
  csvFile: File | null
  setCsvFile: (file: File | null) => void
  importing: boolean
  onImport: () => void
  csvRowCount?: number
}

export default function ImportDialog({
  open,
  onOpenChange,
  importStatus,
  setImportStatus,
  useCsvStatus,
  setUseCsvStatus,
  csvFile,
  setCsvFile,
  importing,
  onImport,
  csvRowCount,
}: ImportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <div className="space-y-2">
            <label className="text-sm font-medium">Status Import</label>
            <Select value={importStatus} onValueChange={setImportStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DITERIMA">Diterima (DITERIMA)</SelectItem>
                <SelectItem value="DITOLAK">Ditolak (DITOLAK)</SelectItem>
                <SelectItem value="ON PROGRESS">On Progress</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Status yang akan diterapkan ke semua data yang diimport</p>
          </div>

          <div className="flex items-start space-x-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <Checkbox
              id="use-csv-status"
              checked={useCsvStatus}
              onCheckedChange={(checked) => setUseCsvStatus(checked === true)}
              className="mt-0.5"
            />
            <div className="grid gap-1 leading-none">
              <label htmlFor="use-csv-status" className="text-sm font-medium text-blue-800 cursor-pointer">
                Gunakan status dari CSV
              </label>
              <p className="text-xs text-blue-600">
                Centang jika ingin menggunakan kolom Status dari file CSV. Jika tidak dicentang, semua data akan menggunakan status &quot;{importStatus}&quot; yang dipilih di atas.
              </p>
            </div>
          </div>

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
                {csvRowCount !== undefined && csvRowCount > 0 && (
                  <p className="text-sm font-medium text-emerald-600 mt-1">{csvRowCount} baris data terdeteksi</p>
                )}
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={onImport} disabled={!csvFile || importing} className="bg-emerald-600 hover:bg-emerald-700">
            {importing ? (<><Loader2 className="w-4 h-4 animate-spin" /> Mengimport...</>) : (<><Upload className="w-4 h-4" /> Import</>)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
