'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import {
  CheckCircle2,
  Users,
  Loader2,
  ClipboardPaste,
  ClipboardCheck,
  IdCard,
  CalendarDays,
  Phone,
  MapPinned,
  Award,
  GraduationCap,
  RotateCcw,
  Check,
} from 'lucide-react'
import { SUB_JALUR_COLORS } from '@/lib/constants'
import { getJalurIcon, getJalurSubFilter } from '@/lib/helpers'

interface PortalPasteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDataChanged: () => void
  toast: any
  jalurConfigs: Array<{ id: string; nama: string; persentase: number; urutan: number; aktif: boolean }>
}

export default function PortalPasteDialog({
  open,
  onOpenChange,
  onDataChanged,
  toast,
  jalurConfigs,
}: PortalPasteDialogProps) {
  const [portalRawText, setPortalRawText] = useState('')
  const [portalParsedData, setPortalParsedData] = useState<Record<string, string> | null>(null)
  const [portalParsing, setPortalParsing] = useState(false)
  const [portalSelectedJalur, setPortalSelectedJalur] = useState('')
  const [portalSaving, setPortalSaving] = useState(false)

  // Portal SPMB text parser
  const parsePortalText = (text: string): Record<string, string> => {
    const result: Record<string, string> = {}
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

    // Helper: find value after a label line
    const findValueAfter = (label: string, startFrom = 0): { value: string; index: number } | null => {
      for (let i = startFrom; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(label.toLowerCase())) {
          // Check if value is on same line after ":"
          const colonIdx = lines[i].indexOf(':')
          if (colonIdx !== -1 && lines[i].length > colonIdx + 1) {
            return { value: lines[i].substring(colonIdx + 1).trim(), index: i }
          }
          // Value is on the next line
          if (i + 1 < lines.length) {
            return { value: lines[i + 1].trim(), index: i + 1 }
          }
        }
      }
      return null
    }

    // Helper: find value for a label that's on its own line
    const findNextLine = (label: string): string => {
      const found = findValueAfter(label)
      return found?.value || ''
    }

    // No. Registrasi - from "No. Registrasi:" pattern
    const noRegMatch = text.match(/No\.\s*Registrasi\s*:\s*(\S+)/i)
    if (noRegMatch) result['noRegistrasi'] = noRegMatch[1]

    // Sub Jalur - detect from the text using dynamic jalur from Pengaturan
    // Build detection list from jalurConfigs (active jalur names + their subJalur mappings)
    const activeJalurNames = jalurConfigs.filter(j => j.aktif).map(j => j.nama)
    // Also include common aliases that might appear in portal text
    const portalAliases: Record<string, string> = {
      'Afirmasi': 'Afirmasi (KTM)',
      'Keluarga Tidak Mampu': 'Afirmasi (KTM)',
      'KTM': 'Afirmasi (KTM)',
      'Penyandang Disabilitas': 'Disabilitas',
      'Mutasi Orang tua/ Wali': 'Mutasi',
      'Perpindahan Orang Tua': 'Mutasi',
      'Prestasi Akademik': 'Prestasi Nilai Rapor',
      'Prestasi Nonakademik': 'Prestasi Non Akademik',
      'Non Akademik': 'Prestasi Non Akademik',
      'Terdampak Bencana Alam': 'Terdampak Bencana Alam',
    }
    // Combine: active jalur names + their known aliases (only if alias maps to an active jalur)
    const allDetectableNames = new Set<string>()
    for (const name of activeJalurNames) {
      allDetectableNames.add(name)
    }
    for (const [alias, targetJalur] of Object.entries(portalAliases)) {
      if (activeJalurNames.includes(targetJalur)) {
        allDetectableNames.add(alias)
      }
    }
    // Try to detect jalur name from pasted text
    for (const jalur of allDetectableNames) {
      for (const line of lines) {
        if (line === jalur || line.toLowerCase() === jalur.toLowerCase()) {
          // Map alias to actual jalur config name, then to subJalur filter
          const jalurConfigName = portalAliases[jalur] || jalur
          result['subJalur'] = getJalurSubFilter(jalurConfigName)
          result['_detectedJalurNama'] = jalurConfigName // store the jalur config name for dropdown
          break
        }
      }
      if (result['subJalur']) break
    }

    // Nama - after "Nama Peserta"
    result['nama'] = findNextLine('Nama Peserta')
    // Fallback: first line might be the name
    if (!result['nama'] && lines.length > 0) {
      // Check if first line looks like a name (not starting with a number or known label)
      const firstLine = lines[0]
      if (firstLine && !firstLine.match(/^\d/) && !firstLine.toLowerCase().includes('no.') && !firstLine.toLowerCase().includes('registrasi')) {
        result['nama'] = firstLine
      }
    }

    // Tanggal Lahir
    result['tanggalLahir'] = findNextLine('Tanggal Lahir')

    // NIK
    result['nik'] = findNextLine('NIK')

    // NISN
    result['nisn'] = findNextLine('NISN')

    // Alamat
    result['alamat'] = findNextLine('Alamat')
    // But "Alamat Lengkap" should be separate - handle that
    const alamatLengkap = findNextLine('Alamat Lengkap')
    if (alamatLengkap) {
      result['alamatLengkap'] = alamatLengkap
    }

    // Phone numbers
    result['noTelpSiswa'] = findNextLine('No.Telp/Hp Siswa') || findNextLine('No. Telp/Hp Siswa') || findNextLine('NoTelp/Hp Siswa')
    result['noTelpOrangtua'] = findNextLine('No.Telp/Hp Orangtua') || findNextLine('No. Telp/Hp Orangtua') || findNextLine('NoTelp/Hp Orangtua/Wali')

    // Asal Sekolah
    result['namaSekolahAsal'] = findNextLine('Asal Sekolah')

    // Sekolah Pilihan
    result['namaSekolahPilihan'] = findNextLine('Sekolah Pilihan')

    // Waktu Pendaftaran
    result['waktuDaftar'] = findNextLine('Waktu Pendaftaran')

    // Lokasi dan Jarak
    result['lokasiJarak'] = findNextLine('Lokasi dan Jarak')

    // Latitude / Longitude
    result['latitude'] = findNextLine('Latitude')
    result['longitude'] = findNextLine('Longitude')

    // Nilai Rapor - parse subject grades
    const subjects = ['Pendidikan Agama', 'PPKn', 'Bahasa Indonesia', 'Matematika', 'Ilmu Pengetahuan Alam', 'Ilmu Pengetahuan Sosial', 'Bahasa Inggris']
    const grades: Record<string, string> = {}
    for (const subject of subjects) {
      // Find pattern: "Subject\n: value" or "Subject : value"
      for (let i = 0; i < lines.length; i++) {
        if (lines[i] === subject || lines[i].startsWith(subject)) {
          // Check if value is on same line after ":"
          if (lines[i].includes(':')) {
            const val = lines[i].split(':').pop()?.trim()
            if (val && val.match(/\d+/)) {
              grades[subject] = val
              break
            }
          }
          // Check next line for ": value"
          if (i + 1 < lines.length) {
            const nextLine = lines[i + 1]
            const match = nextLine.match(/:\s*(\d+[\.,]?\d*)/)
            if (match) {
              grades[subject] = match[1]
              break
            }
          }
        }
      }
    }
    if (Object.keys(grades).length > 0) {
      result['nilaiRapor'] = JSON.stringify(grades)
    }

    // Nilai Rata-rata
    const nilaiRataRata = findNextLine('Nilai Rata-rata')
    if (nilaiRataRata) {
      // Could be "74.571" or ": 74.571"
      const match = nilaiRataRata.match(/([\d]+[\.,]?[\d]*)/)
      result['nilaiRataRata'] = match ? match[1] : nilaiRataRata
    }

    // Skor Jarak (from Ringkasan section)
    const skorJarak = findNextLine('Skor Jarak')
    if (skorJarak) result['skorJarak'] = skorJarak

    // Skor (from Ringkasan section) - need to find the LAST "Skor" line
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i] === 'Skor' || lines[i] === 'Skor') {
        if (i + 1 < lines.length) {
          const match = lines[i + 1].match(/([\d]+[\.,]?[\d]*)/)
          if (match) {
            result['skor'] = match[1]
            break
          }
        }
      }
    }

    // Skor Nilai Raport - from "Skor Nilai Raport" or derive from nilaiRataRata
    const skorNilaiRaport = findNextLine('Skor Nilai Raport')
    if (skorNilaiRaport) {
      const match = skorNilaiRaport.match(/([\d]+[\.,]?[\d]*)/)
      result['skorNilaiRaport'] = match ? match[1] : skorNilaiRaport
    } else if (result['nilaiRataRata']) {
      // If no explicit Skor Nilai Raport, use nilaiRataRata as fallback
      result['skorNilaiRaport'] = result['nilaiRataRata']
    }

    // Dokumen - parse from "Dokumen" section
    const dokumenSection = findNextLine('Dokumen')
    if (dokumenSection) {
      result['dokumen'] = dokumenSection
    }

    // NPSN - we don't have this from portal, use empty
    result['npsnSekolahPilihan'] = ''
    result['npsnSekolahAsal'] = ''
    result['jurusan'] = ''
    result['status'] = 'ON PROGRESS'

    return result
  }

  const handlePortalPaste = () => {
    if (!portalRawText.trim()) return
    setPortalParsing(true)
    try {
      const parsed = parsePortalText(portalRawText)
      setPortalParsedData(parsed)
      // Initialize selected jalur from detected jalur or first active jalur
      const detectedJalur = parsed['_detectedJalurNama'] || ''
      if (detectedJalur) {
        setPortalSelectedJalur(detectedJalur)
      } else {
        // Default to first active jalur
        const firstActive = jalurConfigs.find(j => j.aktif)
        setPortalSelectedJalur(firstActive?.nama || '')
      }
    } catch {
      toast({ title: 'Gagal', description: 'Tidak dapat memparse teks portal', variant: 'destructive' })
    } finally {
      setPortalParsing(false)
    }
  }

  const handlePortalSave = async () => {
    if (!portalParsedData) return
    setPortalSaving(true)
    try {
      // Use the selected jalur from dropdown (overrides auto-detected subJalur)
      const saveData = { ...portalParsedData }
      if (portalSelectedJalur) {
        saveData['subJalur'] = getJalurSubFilter(portalSelectedJalur)
      }
      // Remove internal temp fields before sending
      delete saveData['_detectedJalurNama']

      const res = await fetch('/api/registrations/portal-paste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData),
      })
      const data = await res.json()
      if (data.success) {
        const nisnLabel = portalParsedData.nisn ? ` (NISN: ${portalParsedData.nisn})` : ''
        if (data.action === 'created') {
          toast({
            title: '✅ Data Baru Disimpan',
            description: data.message || `Data ${portalParsedData.nama || 'pendaftar'}${nisnLabel} berhasil ditambahkan sebagai data baru`,
          })
        } else if (data.action === 'updated') {
          toast({
            title: '🔄 Data Diperbarui',
            description: data.message || `Data ${portalParsedData.nama || 'pendaftar'}${nisnLabel} berhasil diperbarui — field kosong telah diisi`,
          })
        } else {
          toast({
            title: 'ℹ️ Data Sudah Lengkap',
            description: data.message || `Data ${portalParsedData.nama || 'pendaftar'}${nisnLabel} sudah lengkap, tidak ada perubahan`,
          })
        }
        onOpenChange(false)
        setPortalRawText('')
        setPortalParsedData(null)
        setPortalSelectedJalur('')
        onDataChanged()
      } else {
        toast({ title: 'Gagal', description: data.error || 'Terjadi kesalahan', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Gagal', description: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setPortalSaving(false)
    }
  }

  const resetState = () => {
    setPortalRawText('')
    setPortalParsedData(null)
    setPortalSelectedJalur('')
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open)
      if (!open) { resetState() }
    }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardPaste className="w-5 h-5 text-emerald-600" />
            Paste dari Portal SPMB
          </DialogTitle>
          <DialogDescription>
            Copy data dari halaman detail peserta di portal SPMB Sumut, lalu paste di sini. Sistem akan otomatis mengenali dan memparse data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!portalParsedData ? (
            <>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <div className="flex gap-2">
                  <ClipboardCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="text-sm text-emerald-700">
                    <p className="font-medium">Cara penggunaan:</p>
                    <ol className="mt-1 list-decimal list-inside space-y-0.5">
                      <li>Buka portal SPMB Sumut</li>
                      <li>Buka halaman detail peserta</li>
                      <li>Select all (Ctrl+A) lalu Copy (Ctrl+C)</li>
                      <li>Paste (Ctrl+V) di kotak di bawah ini</li>
                      <li>Klik &quot;Parse Data&quot; untuk memproses</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Data dari Portal SPMB
                </label>
                <Textarea
                  placeholder="Paste data dari portal SPMB di sini...&#10;&#10;Contoh format yang dikenali:&#10;SANDYON ARTHUR NAVORA WAU&#10;No. Registrasi: 6&#10;&#10;Domisili&#10;Data Peserta&#10;Nama Peserta&#10;SANDYON ARTHUR NAVORA WAU&#10;..."
                  value={portalRawText}
                  onChange={(e) => setPortalRawText(e.target.value)}
                  rows={12}
                  className="font-mono text-xs"
                />
              </div>
            </>
          ) : (
            <>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="text-sm text-emerald-700">
                    <p className="font-medium">Data berhasil diparse!</p>
                    <p>Periksa data di bawah sebelum menyimpan.</p>
                  </div>
                </div>
              </div>

              {/* Parsed Data Preview */}
              <div className="space-y-3">
                {/* Header with name and sub jalur */}
                <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <Users className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-bold text-gray-900">{portalParsedData.nama || '-'}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className="font-mono">No. Reg: {portalParsedData.noRegistrasi || '-'}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Jalur Pendaftaran Selector */}
                <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <ClipboardCheck className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-semibold text-amber-800 block mb-1">
                          Jalur Pendaftaran
                        </label>
                        <Select value={portalSelectedJalur} onValueChange={setPortalSelectedJalur}>
                          <SelectTrigger className="w-full bg-white">
                            <SelectValue placeholder="Pilih jalur pendaftaran..." />
                          </SelectTrigger>
                          <SelectContent>
                            {jalurConfigs.filter(j => j.aktif).map(jalur => (
                              <SelectItem key={jalur.id} value={jalur.nama}>
                                <div className="flex items-center gap-2">
                                  {(() => {
                                    const Icon = getJalurIcon(jalur.nama)
                                    return <Icon className="w-4 h-4" />
                                  })()}
                                  <span>{jalur.nama}</span>
                                  <span className="text-xs text-gray-400">→ {getJalurSubFilter(jalur.nama)}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {portalSelectedJalur && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="text-xs text-gray-500">Data akan masuk ke Lembar Verifikasi:</span>
                            <Badge variant="outline" className={SUB_JALUR_COLORS[getJalurSubFilter(portalSelectedJalur)] || 'bg-gray-100 text-gray-800'}>
                              {getJalurSubFilter(portalSelectedJalur)}
                            </Badge>
                          </div>
                        )}
                        {!portalSelectedJalur && (
                          <p className="text-xs text-red-500 mt-1">⚠️ Pilih jalur pendaftaran sebelum menyimpan</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Data Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {portalParsedData.nisn && (
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <label className="text-xs text-gray-500 font-medium flex items-center gap-1"><IdCard className="w-3 h-3" /> NISN</label>
                      <p className="text-sm font-mono font-medium mt-0.5">{portalParsedData.nisn}</p>
                    </div>
                  )}
                  {portalParsedData.nik && (
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <label className="text-xs text-gray-500 font-medium flex items-center gap-1"><IdCard className="w-3 h-3" /> NIK</label>
                      <p className="text-sm font-mono font-medium mt-0.5">{portalParsedData.nik}</p>
                    </div>
                  )}
                  {portalParsedData.tanggalLahir && (
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <label className="text-xs text-gray-500 font-medium flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Tanggal Lahir</label>
                      <p className="text-sm mt-0.5">{portalParsedData.tanggalLahir}</p>
                    </div>
                  )}
                  {portalParsedData.noTelpSiswa && (
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <label className="text-xs text-gray-500 font-medium flex items-center gap-1"><Phone className="w-3 h-3" /> Telp Siswa</label>
                      <p className="text-sm font-mono mt-0.5">{portalParsedData.noTelpSiswa}</p>
                    </div>
                  )}
                  {portalParsedData.noTelpOrangtua && (
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <label className="text-xs text-gray-500 font-medium flex items-center gap-1"><Phone className="w-3 h-3" /> Telp Orangtua</label>
                      <p className="text-sm font-mono mt-0.5">{portalParsedData.noTelpOrangtua}</p>
                    </div>
                  )}
                  {portalParsedData.lokasiJarak && (
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <label className="text-xs text-gray-500 font-medium flex items-center gap-1"><MapPinned className="w-3 h-3" /> Jarak</label>
                      <p className="text-sm mt-0.5">{portalParsedData.lokasiJarak}</p>
                    </div>
                  )}
                  {portalParsedData.nilaiRataRata && (
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <label className="text-xs text-gray-500 font-medium flex items-center gap-1"><Award className="w-3 h-3" /> Nilai Rata-rata</label>
                      <p className="text-sm font-bold text-emerald-600 mt-0.5">{portalParsedData.nilaiRataRata}</p>
                    </div>
                  )}
                  {portalParsedData.skor && (
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <label className="text-xs text-gray-500 font-medium flex items-center gap-1"><Award className="w-3 h-3" /> Skor</label>
                      <p className="text-sm font-bold text-amber-600 mt-0.5">{portalParsedData.skor}</p>
                    </div>
                  )}
                  {portalParsedData.skorJarak && (
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <label className="text-xs text-gray-500 font-medium flex items-center gap-1"><MapPinned className="w-3 h-3" /> Skor Jarak</label>
                      <p className="text-sm mt-0.5">{portalParsedData.skorJarak}</p>
                    </div>
                  )}
                  {portalParsedData.skorNilaiRaport && (
                    <div className="bg-sky-50 rounded-lg p-2.5">
                      <label className="text-xs text-sky-600 font-medium flex items-center gap-1"><Award className="w-3 h-3" /> Skor Nilai Raport</label>
                      <p className="text-sm font-bold text-sky-700 mt-0.5">{portalParsedData.skorNilaiRaport}</p>
                    </div>
                  )}
                </div>

                {/* Schools */}
                <div className="grid grid-cols-2 gap-3">
                  {portalParsedData.namaSekolahAsal && (
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <label className="text-xs text-gray-500 font-medium">Asal Sekolah</label>
                      <p className="text-sm font-medium mt-0.5">{portalParsedData.namaSekolahAsal}</p>
                    </div>
                  )}
                  {portalParsedData.namaSekolahPilihan && (
                    <div className="bg-sky-50 rounded-lg p-2.5">
                      <label className="text-xs text-sky-600 font-medium">Sekolah Pilihan</label>
                      <p className="text-sm font-medium text-sky-800 mt-0.5">{portalParsedData.namaSekolahPilihan}</p>
                    </div>
                  )}
                </div>

                {/* Address */}
                {(portalParsedData.alamat || portalParsedData.alamatLengkap) && (
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <label className="text-xs text-gray-500 font-medium">Alamat</label>
                    <p className="text-sm mt-0.5">{portalParsedData.alamat}</p>
                    {portalParsedData.alamatLengkap && portalParsedData.alamatLengkap !== portalParsedData.alamat && (
                      <p className="text-xs text-gray-500 mt-0.5">{portalParsedData.alamatLengkap}</p>
                    )}
                  </div>
                )}

                {/* Nilai Rapor */}
                {portalParsedData.nilaiRapor && (() => {
                  try {
                    const grades = JSON.parse(portalParsedData.nilaiRapor)
                    return (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-1">
                          <GraduationCap className="w-4 h-4" /> Nilai Rapor
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(grades).map(([subject, value]) => (
                            <div key={subject} className="flex justify-between text-sm bg-white rounded px-2 py-1">
                              <span className="text-gray-600 text-xs">{subject}</span>
                              <span className="font-bold text-amber-700">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  } catch { return null }
                })()}

                {/* Coordinates */}
                {(portalParsedData.latitude || portalParsedData.longitude) && (
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <label className="text-xs text-gray-500 font-medium">Koordinat</label>
                    <p className="text-xs font-mono mt-0.5">{portalParsedData.latitude}, {portalParsedData.longitude}</p>
                  </div>
                )}

                {/* Verification Data */}
                {portalParsedData.dokumen && (
                  <div className="bg-sky-50 border border-sky-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-sky-800 mb-2 flex items-center gap-1">
                      <ClipboardCheck className="w-4 h-4" /> Data Verifikasi
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {portalParsedData.dokumen && (
                        <div className="col-span-2 bg-white rounded px-2 py-1.5">
                          <label className="text-xs text-gray-500 font-medium">Dokumen</label>
                          <p className="text-sm">{portalParsedData.dokumen}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPortalParsedData(null)}>
                  <RotateCcw className="w-4 h-4" />
                  Parse Ulang
                </Button>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          {!portalParsedData ? (
            <Button onClick={handlePortalPaste} disabled={!portalRawText.trim() || portalParsing} className="bg-emerald-600 hover:bg-emerald-700">
              {portalParsing ? (<><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>) : (<><ClipboardCheck className="w-4 h-4" /> Parse Data</>)}
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => { setPortalParsedData(null); setPortalRawText('') }}>
                Batal
              </Button>
              <Button onClick={handlePortalSave} disabled={portalSaving || !portalSelectedJalur} className="bg-emerald-600 hover:bg-emerald-700">
                {portalSaving ? (<><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>) : (<><Check className="w-4 h-4" /> Simpan Data</>)}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
