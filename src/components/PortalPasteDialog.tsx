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
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  ClipboardPaste,
  ClipboardCheck,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Check,
  Users,
  IdCard,
  CalendarDays,
  Phone,
  MapPinned,
  Award,
  GraduationCap,
  FileCheck,
  Clock,
  FileText,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react'
import { SUB_JALUR_COLORS } from '@/lib/constants'
import { getJalurIcon, getJalurSubFilter, hitungLamaKK } from '@/lib/utils-shared'
import { VerifyKekuranganPicker } from '@/components/KekuranganVerifSelect'

interface PortalPasteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  portalRawText: string
  setPortalRawText: (text: string) => void
  portalParsedData: Record<string, string> | null
  setPortalParsedData: (data: Record<string, string> | null) => void
  portalParsing: boolean
  portalSelectedJalur: string
  setPortalSelectedJalur: (jalur: string) => void
  jalurConfigs: Array<{ id: string; nama: string; persentase: number; urutan: number; aktif: boolean }>
  importing: boolean
  savingStatus: 'VERIFIED' | 'REJECTED' | 'PENDING' | null
  onPaste: () => void
  onSave: (status?: 'VERIFIED' | 'REJECTED' | 'PENDING') => void
  // Quick verification fields
  portalVerifStatus: 'VERIFIED' | 'REJECTED' | 'PENDING'
  setPortalVerifStatus: (v: 'VERIFIED' | 'REJECTED' | 'PENDING') => void
  portalKekurangan: string
  setPortalKekurangan: (v: string) => void
  portalVerifNote: string
  setPortalVerifNote: (v: string) => void
  portalTanggalVerif: string
  setPortalTanggalVerif: (v: string) => void
  portalJamVerif: string
  setPortalJamVerif: (v: string) => void
  portalTerbitKK: string
  setPortalTerbitKK: (v: string) => void
}

export default function PortalPasteDialog({
  open,
  onOpenChange,
  portalRawText,
  setPortalRawText,
  portalParsedData,
  setPortalParsedData,
  portalParsing,
  portalSelectedJalur,
  setPortalSelectedJalur,
  jalurConfigs,
  importing,
  savingStatus,
  onPaste,
  onSave,
  portalVerifStatus,
  setPortalVerifStatus,
  portalKekurangan,
  setPortalKekurangan,
  portalVerifNote,
  setPortalVerifNote,
  portalTanggalVerif,
  setPortalTanggalVerif,
  portalJamVerif,
  setPortalJamVerif,
  portalTerbitKK,
  setPortalTerbitKK,
}: PortalPasteDialogProps) {
  // Check if jalur was auto-detected by the parser
  const isJalurAutoDetected = portalParsedData?.['_jalurAutoDetected'] === 'true'
  const detectedJalurNama = portalParsedData?.['_detectedJalurNama'] || ''

  // Check if auto-detected status from portal is DITOLAK
  const portalDetectedStatus = portalParsedData?.['status'] || ''

  // Validation: if REJECTED, must have kekurangan selected (same rule as Kekurangan Verifikasi column)
  const isRejected = portalVerifStatus === 'REJECTED'
  const isPending = portalVerifStatus === 'PENDING'
  const hasAlasanPenolakan = portalKekurangan.trim().length > 0
  const canSave = portalSelectedJalur && (!isRejected || hasAlasanPenolakan)

  const resetAndClose = (isOpen: boolean) => {
    onOpenChange(isOpen)
    if (!isOpen) {
      setPortalRawText('')
      setPortalParsedData(null)
      setPortalSelectedJalur('')
      setPortalVerifStatus('VERIFIED')
      setPortalKekurangan('')
      setPortalVerifNote('')
      setPortalTanggalVerif('')
      setPortalJamVerif('')
      setPortalTerbitKK('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()}>
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
                    <p className="mt-1.5 text-xs text-emerald-600">💡 Jalur pendaftaran &amp; status akan otomatis terdeteksi dari data portal</p>
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
                          {portalParsedData.nisn && (
                            <Badge variant="outline" className="font-mono">NISN: {portalParsedData.nisn}</Badge>
                          )}
                          {portalDetectedStatus && portalDetectedStatus !== 'ON PROGRESS' && (
                            <Badge className={portalDetectedStatus === 'DITERIMA' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-red-100 text-red-700 border-red-300'}>
                              Portal: {portalDetectedStatus}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Jalur Pendaftaran - AUTO-DETECTED */}
                <Card className={`border-2 ${isJalurAutoDetected ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-white' : portalSelectedJalur ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-white' : 'border-red-300 bg-gradient-to-br from-red-50 to-white'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${isJalurAutoDetected ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                        {isJalurAutoDetected ? (
                          <Sparkles className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <ClipboardCheck className="w-5 h-5 text-amber-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <label className={`text-sm font-semibold ${isJalurAutoDetected ? 'text-emerald-800' : 'text-amber-800'}`}>
                            Jalur Pendaftaran
                          </label>
                          {isJalurAutoDetected && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-[10px] px-1.5 py-0 gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" />
                              Terdeteksi Otomatis
                            </Badge>
                          )}
                        </div>

                        {isJalurAutoDetected && (
                          <div className="bg-emerald-100/80 border border-emerald-200 rounded-lg p-2.5 mb-2">
                            <div className="flex items-center gap-2">
                              {(() => {
                                const Icon = getJalurIcon(detectedJalurNama)
                                return <Icon className="w-5 h-5 text-emerald-600" />
                              })()}
                              <span className="font-bold text-emerald-800">{detectedJalurNama}</span>
                              <Badge variant="outline" className={SUB_JALUR_COLORS[getJalurSubFilter(detectedJalurNama)] || 'bg-gray-100 text-gray-800'}>
                                {getJalurSubFilter(detectedJalurNama)}
                              </Badge>
                            </div>
                            <p className="text-xs text-emerald-600 mt-1">
                              ✅ Jalur terdeteksi otomatis dari data portal. Klik dropdown jika ingin mengubah.
                            </p>
                          </div>
                        )}

                        <Select value={portalSelectedJalur} onValueChange={setPortalSelectedJalur}>
                          <SelectTrigger className={`w-full ${isJalurAutoDetected ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white'}`}>
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
                        {portalSelectedJalur && !isJalurAutoDetected && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="text-xs text-gray-500">Data akan masuk ke Lembar Verifikasi:</span>
                            <Badge variant="outline" className={SUB_JALUR_COLORS[getJalurSubFilter(portalSelectedJalur)] || 'bg-gray-100 text-gray-800'}>
                              {getJalurSubFilter(portalSelectedJalur)}
                            </Badge>
                          </div>
                        )}
                        {!portalSelectedJalur && (
                          <div className="flex items-center gap-1 mt-1.5">
                            <AlertCircle className="w-3 h-3 text-red-500" />
                            <p className="text-xs text-red-500">Pilih jalur pendaftaran sebelum menyimpan</p>
                          </div>
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

                {/* Verification Data from Portal */}
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

                {/* ===== VERIFICATION SECTION ===== */}
                <Card className={`border-2 ${isRejected ? 'border-red-300 bg-gradient-to-br from-red-50 to-white' : 'border-sky-300 bg-gradient-to-br from-sky-50 to-white'}`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${isRejected ? 'bg-red-100' : 'bg-sky-100'}`}>
                        <ShieldCheck className={`w-5 h-5 ${isRejected ? 'text-red-600' : 'text-sky-600'}`} />
                      </div>
                      <div>
                        <h3 className={`text-sm font-semibold ${isRejected ? 'text-red-800' : 'text-sky-800'}`}>
                          Verifikasi Pendaftar
                        </h3>
                        <p className={`text-xs ${isRejected ? 'text-red-600' : 'text-sky-600'}`}>
                          Tentukan status verifikasi dan isi data — selesaikan 1 siswa dalam 1 langkah
                        </p>
                      </div>
                    </div>

                    {/* Verification Status Selector */}
                    <div>
                      <label className="text-xs font-medium text-gray-600 flex items-center gap-1 mb-1.5">
                        <ShieldCheck className="w-3 h-3" /> Status Verifikasi <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setPortalVerifStatus('PENDING')}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 transition-all text-sm font-medium ${
                            portalVerifStatus === 'PENDING'
                              ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm'
                              : 'border-gray-200 bg-white text-gray-500 hover:border-amber-300 hover:bg-amber-50/50'
                          }`}
                        >
                          <Clock className={`w-4 h-4 ${portalVerifStatus === 'PENDING' ? 'text-amber-600' : ''}`} />
                          MENUNGGU
                        </button>
                        <button
                          type="button"
                          onClick={() => setPortalVerifStatus('VERIFIED')}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 transition-all text-sm font-medium ${
                            portalVerifStatus === 'VERIFIED'
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                              : 'border-gray-200 bg-white text-gray-500 hover:border-emerald-300 hover:bg-emerald-50/50'
                          }`}
                        >
                          <ThumbsUp className={`w-4 h-4 ${portalVerifStatus === 'VERIFIED' ? 'text-emerald-600' : ''}`} />
                          DITERIMA
                        </button>
                        <button
                          type="button"
                          onClick={() => setPortalVerifStatus('REJECTED')}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 transition-all text-sm font-medium ${
                            portalVerifStatus === 'REJECTED'
                              ? 'border-red-500 bg-red-50 text-red-700 shadow-sm'
                              : 'border-gray-200 bg-white text-gray-500 hover:border-red-300 hover:bg-red-50/50'
                          }`}
                        >
                          <ThumbsDown className={`w-4 h-4 ${portalVerifStatus === 'REJECTED' ? 'text-red-600' : ''}`} />
                          DITOLAK
                        </button>
                      </div>
                      {/* Auto-detect hint */}
                      {portalDetectedStatus && portalDetectedStatus !== 'ON PROGRESS' && (
                        <p className="text-xs text-gray-400 mt-1">
                          💡 Status di portal: <span className={portalDetectedStatus === 'DITERIMA' ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>{portalDetectedStatus}</span>
                        </p>
                      )}
                    </div>

                    {/* If REJECTED: show kekurangan picker (required, same as Kekurangan Verifikasi column) */}
                    {isRejected && (
                      <>
                        {/* Warning banner */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-xs text-red-700">
                          <div className="flex gap-1.5">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium">Wajib pilih alasan penolakan!</p>
                              <p className="mt-0.5 text-red-600">Pilih minimal 1 kekurangan verifikasi sebelum menyimpan. Data tidak dapat disimpan tanpa alasan. Gunakan tombol Copy untuk menyalin alasan ke Portal SPMB Sumut.</p>
                            </div>
                          </div>
                        </div>

                        {/* Kekurangan Verifikasi (multi-select picker — sama persis dengan kolom Kekurangan Verifikasi) */}
                        <VerifyKekuranganPicker
                          value={portalKekurangan}
                          onChange={setPortalKekurangan}
                        />
                      </>
                    )}

                    {/* Catatan Tambahan (opsional) — untuk VERIFIED dan REJECTED */}
                    <div>
                      <label className="text-xs font-medium text-gray-600 flex items-center gap-1 mb-1">
                        <FileText className="w-3 h-3" /> {isRejected ? 'Catatan Tambahan' : 'Catatan Verifikasi'} <span className="text-gray-400">(opsional)</span>
                      </label>
                      <Textarea
                        placeholder={isRejected ? 'Catatan tambahan jika diperlukan...' : 'Catatan tambahan (opsional)...'}
                        value={portalVerifNote}
                        onChange={(e) => setPortalVerifNote(e.target.value)}
                        rows={2}
                        className="text-sm resize-none"
                      />
                    </div>

                    {/* Tanggal & Jam Verif */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600 flex items-center gap-1 mb-1">
                          <CalendarDays className="w-3 h-3" /> Tanggal Verif
                        </label>
                        <Input
                          type="date"
                          value={portalTanggalVerif}
                          onChange={(e) => setPortalTanggalVerif(e.target.value)}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 flex items-center gap-1 mb-1">
                          <Clock className="w-3 h-3" /> Jam Verif
                        </label>
                        <Input
                          type="time"
                          value={portalJamVerif}
                          onChange={(e) => setPortalJamVerif(e.target.value)}
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>

                    {/* Terbit KK */}
                    <div>
                      <label className="text-xs font-medium text-gray-600 flex items-center gap-1 mb-1">
                        <IdCard className="w-3 h-3" /> Terbit KK
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="date"
                          value={portalTerbitKK}
                          onChange={(e) => setPortalTerbitKK(e.target.value)}
                          className="h-9 text-sm flex-1"
                        />
                        {portalTerbitKK && (
                          <span className="text-xs text-sky-600 bg-sky-50 rounded px-2 py-1 whitespace-nowrap">
                            Lama KK: {hitungLamaKK(portalTerbitKK)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Validation message */}
                    {isRejected && !hasAlasanPenolakan && (
                      <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <p className="text-xs text-red-600 font-medium">
                          Pilih minimal 1 kekurangan verifikasi untuk menyimpan
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
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
            <Button type="button" onClick={onPaste} disabled={!portalRawText.trim() || portalParsing} className="bg-emerald-600 hover:bg-emerald-700">
              {portalParsing ? (<><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>) : (<><ClipboardCheck className="w-4 h-4" /> Parse Data</>)}
            </Button>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={() => { setPortalParsedData(null); setPortalRawText('') }}>
                Batal
              </Button>
              <Button
                type="button"
                onClick={() => onSave('PENDING')}
                disabled={importing || !portalSelectedJalur}
                className="bg-amber-500 hover:bg-amber-600"
              >
                {importing && savingStatus === 'PENDING' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                ) : (
                  <><Clock className="w-4 h-4" /> Simpan</>
                )}
              </Button>
              <Button
                type="button"
                onClick={() => onSave('VERIFIED')}
                disabled={importing || !portalSelectedJalur}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {importing && savingStatus === 'VERIFIED' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                ) : (
                  <><ThumbsUp className="w-4 h-4" /> Terima &amp; Simpan</>
                )}
              </Button>
              <Button
                type="button"
                onClick={() => onSave('REJECTED')}
                disabled={importing || !canSave}
                className="bg-red-600 hover:bg-red-700"
              >
                {importing && savingStatus === 'REJECTED' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                ) : (
                  <><ThumbsDown className="w-4 h-4" /> Tolak &amp; Simpan</>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
