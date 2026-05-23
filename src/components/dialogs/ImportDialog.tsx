'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
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
import { Upload, FileSpreadsheet, AlertTriangle, Loader2, ClipboardCheck } from 'lucide-react'
import { mapStatusToVerificationStatus } from '@/lib/constants'

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDataChanged: () => void
  authUser: { id: string; username: string; namaLengkap: string; role: string } | null
  toast: any
  importStatus: string
  setImportStatus: (status: string) => void
}

export default function ImportDialog({
  open,
  onOpenChange,
  onDataChanged,
  authUser,
  toast,
  importStatus,
  setImportStatus,
}: ImportDialogProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvPreview, setCsvPreview] = useState<{ diterima: number; ditolak: number; menunggu: number; total: number; hasStatusColumn: boolean } | null>(null)
  const [importing, setImporting] = useState(false)

  // CSV parsing function
  const parseCSVClientSide = (text: string) => {
    // Remove BOM (Byte Order Mark) if present
    const cleanText = text.replace(/^\uFEFF/, '')
    const lines = cleanText.trim().split(/\r?\n/)
    if (lines.length < 2) return []

    // Auto-detect delimiter: comma, semicolon, or tab
    const firstLine = lines[0]
    const commaCount = (firstLine.match(/,/g) || []).length
    const semicolonCount = (firstLine.match(/;/g) || []).length
    const tabCount = (firstLine.match(/\t/g) || []).length
    let delimiter = ','
    if (semicolonCount > commaCount && semicolonCount > tabCount) delimiter = ';'
    else if (tabCount > commaCount && tabCount > semicolonCount) delimiter = '\t'

    // Parse a single CSV line respecting quoted fields
    const parseLine = (line: string): string[] => {
      const values: string[] = []
      let current = ''
      let inQuotes = false
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
            // Escaped quote ""
            current += '"'
            i++ // skip next quote
          } else {
            inQuotes = !inQuotes
          }
        } else if (char === delimiter && !inQuotes) {
          values.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      values.push(current.trim())
      return values
    }

    const headers = parseLine(firstLine).map(h => h.replace(/^"|"$/g, '').trim())
    const rows: Record<string, string>[] = []
    const errors: string[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue // skip empty lines

      const values = parseLine(line).map(v => v.replace(/^"|"$/g, ''))

      if (values.length === headers.length) {
        const row: Record<string, string> = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        rows.push(row)
      } else {
        // Try to salvage: if close in count, pad with empty strings
        if (values.length > 0 && Math.abs(values.length - headers.length) <= 3) {
          const padded = [...values]
          while (padded.length < headers.length) padded.push('')
          const row: Record<string, string> = {}
          headers.forEach((header, index) => {
            row[header] = padded[index] || ''
          })
          rows.push(row)
          errors.push(`Baris ${i + 1}: ${values.length} kolom (diharapkan ${headers.length}), data tetap diimport`)
        } else {
          errors.push(`Baris ${i + 1} dilewati: ${values.length} kolom (diharapkan ${headers.length})`)
        }
      }
    }

    if (errors.length > 0) {
      console.warn('CSV import warnings:', errors)
    }

    return rows
  }

  // CSV preview: detect statuses when a file is selected
  useEffect(() => {
    if (!csvFile) {
      setCsvPreview(null)
      return
    }
    const generatePreview = async () => {
      try {
        const text = await csvFile.text()
        const csvRows = parseCSVClientSide(text)
        if (csvRows.length === 0) {
          setCsvPreview(null)
          return
        }
        const getVal = (row: Record<string, string>, ...keys: string[]): string => {
          for (const key of keys) {
            if (row[key] !== undefined) return row[key]
            const lowerKey = key.toLowerCase()
            for (const [k, v] of Object.entries(row)) {
              if (k.toLowerCase().replace(/[\s._-]+/g, '') === lowerKey.replace(/[\s._-]+/g, '')) return v
            }
          }
          return ''
        }

        let diterima = 0, ditolak = 0, menunggu = 0, hasStatusColumn = false
        for (const row of csvRows) {
          const rawStatus = getVal(row, 'Status', 'status', 'Status Verifikasi', 'Keterangan', 'Keterangan Status')
          if (rawStatus && rawStatus.trim()) {
            hasStatusColumn = true
            const mapped = mapStatusToVerificationStatus(rawStatus)
            if (mapped.verificationStatus === 'VERIFIED') diterima++
            else if (mapped.verificationStatus === 'REJECTED') ditolak++
            else menunggu++
          } else {
            menunggu++
          }
        }
        setCsvPreview({ diterima, ditolak, menunggu, total: csvRows.length, hasStatusColumn })
      } catch {
        setCsvPreview(null)
      }
    }
    generatePreview()
  }, [csvFile])

  const handleImport = async () => {
    if (!csvFile) return

    setImporting(true)
    try {
      const text = await csvFile.text()
      const csvRows = parseCSVClientSide(text)

      if (csvRows.length === 0) {
        throw new Error('File CSV kosong atau format tidak valid. Pastikan file CSV memiliki header dan minimal 1 baris data.')
      }

      // Flexible column name mapping (handle various header names from SPMB portal)
      const getVal = (row: Record<string, string>, ...keys: string[]): string => {
        for (const key of keys) {
          // Exact match first
          if (row[key] !== undefined) return row[key]
          // Case-insensitive match
          const lowerKey = key.toLowerCase()
          for (const [k, v] of Object.entries(row)) {
            if (k.toLowerCase().replace(/[\s._-]+/g, '') === lowerKey.replace(/[\s._-]+/g, '')) {
              return v
            }
          }
        }
        return ''
      }

      const mappedRows = csvRows.map(row => {
        // Auto-detect status from CSV's Status column
        const rawStatus = getVal(row, 'Status', 'status', 'Status Verifikasi', 'Keterangan', 'Keterangan Status')
        const detected = rawStatus
          ? mapStatusToVerificationStatus(rawStatus)
          : (importStatus === 'AUTO_DETECT'
              ? { verificationStatus: 'PENDING' as string, status: 'ON PROGRESS' as string }
              : { verificationStatus: importStatus === 'VERIFIED' ? 'VERIFIED' : importStatus === 'REJECTED' ? 'REJECTED' : 'PENDING', status: importStatus === 'VERIFIED' ? 'DITERIMA' : importStatus === 'REJECTED' ? 'DITOLAK' : 'ON PROGRESS' })

        return {
          noRegistrasi: getVal(row, 'No.Registrasi', 'No Registrasi', 'NoReg', 'No_Registrasi', 'nomor_registrasi'),
          nama: getVal(row, 'Nama', 'Nama Peserta', 'nama_peserta'),
          nisn: getVal(row, 'NISN', 'nisn'),
          subJalur: getVal(row, 'Sub Jalur', 'Sub_Jalur', 'Jalur', 'sub_jalur'),
          npsnSekolahPilihan: getVal(row, 'NPSN Sekolah Pilihan', 'NPSN_Sekolah_Pilihan', 'NPSN Pilihan'),
          namaSekolahPilihan: getVal(row, 'Nama Sekolah Pilihan', 'Nama_Sekolah_Pilihan', 'Sekolah Pilihan'),
          jurusan: getVal(row, 'Jurusan', 'jurusan', 'Kompetensi'),
          npsnSekolahAsal: getVal(row, 'NPSN Sekolah Asal', 'NPSN_Sekolah_Asal', 'NPSN Asal'),
          namaSekolahAsal: getVal(row, 'Nama Sekolah Asal', 'Nama_Sekolah_Asal', 'Sekolah Asal', 'Asal Sekolah'),
          status: detected.status,
          verificationStatus: detected.verificationStatus,
          waktuDaftar: getVal(row, 'Waktu Daftar', 'Waktu_Daftar', 'Tanggal Daftar', 'tanggal_daftar'),
          // Optional portal fields
          nik: getVal(row, 'NIK', 'nik'),
          tanggalLahir: getVal(row, 'Tanggal Lahir', 'Tgl Lahir', 'tanggal_lahir'),
          alamat: getVal(row, 'Alamat', 'alamat'),
          noTelpSiswa: getVal(row, 'No Telp Siswa', 'NoTelp', 'no_telp'),
          noTelpOrangtua: getVal(row, 'No Telp Orangtua', 'NoTelpOrtu', 'no_telp_ortu'),
          latitude: getVal(row, 'Latitude', 'Lat', 'latitude'),
          longitude: getVal(row, 'Longitude', 'Lng', 'longitude'),
          lokasiJarak: getVal(row, 'Lokasi Jarak', 'Jarak', 'lokasi_jarak'),
          nilaiRataRata: getVal(row, 'Nilai Rata-Rata', 'Nilai Rata', 'Rata-Rata', 'nilai_rata_rata'),
          skorJarak: getVal(row, 'Skor Jarak', 'skor_jarak'),
          skorNilaiRaport: getVal(row, 'Skor Nilai Raport', 'Skor Raport', 'skor_nilai_raport'),
          skor: getVal(row, 'Skor', 'Skor Komposit', 'skor'),
          nilaiRapor: getVal(row, 'Nilai Rapor', 'nilai_rapor'),
        }
      })

      // Validate: check if any rows have data
      const validRows = mappedRows.filter(r => r.noRegistrasi || r.nisn || r.nama)
      if (validRows.length === 0) {
        throw new Error('Tidak ada data valid ditemukan. Pastikan header CSV sesuai format: No.Registrasi, Nama, NISN, Sub Jalur, dll.')
      }

      const importRes = await fetch('/api/registrations/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': authUser?.id || '' },
        body: JSON.stringify({ rows: validRows }),
      })

      if (!importRes.ok) {
        const errorText = await importRes.text()
        let errorMsg = 'Server error'
        try { errorMsg = JSON.parse(errorText).error || errorMsg } catch {}
        throw new Error(errorMsg)
      }

      const importData = await importRes.json()

      if (importData.success) {
        const createdCount = importData.created || 0
        const updatedCount = importData.updated || 0
        const skippedCount = importData.skipped || 0
        const totalProcessed = importData.imported || validRows.length
        const diterimaCount = importData.diterimaCount || 0
        const ditolakCount = importData.ditolakCount || 0
        const menungguCount = importData.menungguCount || 0
        toast({
          title: 'Import Berhasil',
          description: `${totalProcessed} data diproses: ${createdCount} baru, ${updatedCount} diperbarui, ${skippedCount} dilewati — ✅ ${diterimaCount} diterima, ❌ ${ditolakCount} ditolak, ⏳ ${menungguCount} menunggu`,
        })
        onOpenChange(false)
        setCsvFile(null)
        setCsvPreview(null)
        onDataChanged()
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

  // Reset state when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen)
    if (!newOpen) {
      setCsvFile(null)
      setCsvPreview(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-600" />
            Import Data CSV
          </DialogTitle>
          <DialogDescription>
            Import data pendaftar dari file CSV. Sistem akan otomatis mendeteksi status (Diterima/Ditolak/Menunggu) dari kolom Status di CSV.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Mode Deteksi Status</label>
            <Select value={importStatus} onValueChange={setImportStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AUTO_DETECT">🔄 Auto-Detect (dari kolom Status CSV)</SelectItem>
                <SelectItem value="ON PROGRESS">📝 Semua: Data Pendaftar Baru</SelectItem>
                <SelectItem value="VERIFIED">✅ Semua: Diterima</SelectItem>
                <SelectItem value="REJECTED">❌ Semua: Ditolak</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {importStatus === 'AUTO_DETECT'
                ? 'Status akan dideteksi otomatis dari kolom Status di CSV (Diterima/Ditolak/Menunggu). Jika kolom Status kosong, data akan menjadi Menunggu.'
                : 'Semua data yang diimport akan diberi status yang dipilih, mengabaikan kolom Status di CSV.'}
            </p>
          </div>

          <div
            className="border-2 border-dashed rounded-lg p-8 text-center hover:border-emerald-400 transition-colors cursor-pointer"
            onClick={() => document.getElementById('csv-upload')?.click()}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
            onDrop={(e) => {
              e.preventDefault(); e.stopPropagation()
              const file = e.dataTransfer.files[0]
              if (file && (file.name.endsWith('.csv') || file.name.endsWith('.txt'))) setCsvFile(file)
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
                <p className="text-sm text-gray-400 mt-1">Format: No.Registrasi, Nama, NISN, Sub Jalur, Status, dll.</p>
              </div>
            )}
            <input
              id="csv-upload"
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={(e) => { const file = e.target.files?.[0]; if (file) setCsvFile(file) }}
            />
          </div>

          {/* CSV Preview - Status Detection Summary */}
          {csvPreview && (
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-gray-700">
                  {csvPreview.hasStatusColumn ? 'Deteksi Status Otomatis' : 'Tidak Ada Kolom Status'}
                </span>
              </div>
              {csvPreview.hasStatusColumn ? (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-center">
                      <p className="text-xl font-bold text-emerald-700">{csvPreview.diterima}</p>
                      <p className="text-[10px] text-emerald-600 font-medium">Diterima</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-center">
                      <p className="text-xl font-bold text-red-700">{csvPreview.ditolak}</p>
                      <p className="text-[10px] text-red-600 font-medium">Ditolak</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-center">
                      <p className="text-xl font-bold text-amber-700">{csvPreview.menunggu}</p>
                      <p className="text-[10px] text-amber-600 font-medium">Menunggu</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Total: {csvPreview.total} data — Masing-masing akan masuk ke pos: Diterima, Ditolak, atau Data Pendaftar
                  </p>
                </>
              ) : (
                <p className="text-xs text-amber-600">
                  CSV tidak memiliki kolom Status. Semua data akan diimport sebagai &quot;Menunggu&quot; (data pendaftar baru).
                  {importStatus !== 'AUTO_DETECT' && ' Atau pilih mode status manual di atas.'}
                </p>
              )}
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-sm text-amber-700">
                <p className="font-medium">Format CSV yang diharapkan:</p>
                <p className="mt-1">No.Registrasi, Nama, NISN, Sub Jalur, NPSN Sekolah Pilihan, Nama Sekolah Pilihan, Jurusan, NPSN Sekolah Asal, Nama Sekolah Asal, <strong>Status</strong>, Waktu Daftar</p>
                <p className="mt-1 text-xs">Kolom <strong>Status</strong> mendukung: Diterima, Ditolak, Menunggu, On Progress, dll.</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { onOpenChange(false); setCsvFile(null); setCsvPreview(null) }}>Batal</Button>
          <Button onClick={handleImport} disabled={!csvFile || importing} className="bg-emerald-600 hover:bg-emerald-700">
            {importing ? (<><Loader2 className="w-4 h-4 animate-spin" /> Mengimport...</>) : (<><Upload className="w-4 h-4" /> Import</>)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
