'use client'

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
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  GraduationCap,
  CalendarDays,
  IdCard,
  ClipboardCheck,
  CalendarClock,
  MapPinned,
  Globe,
} from 'lucide-react'
import type { Registration } from '@/lib/types'
import { STATUS_COLORS, SUB_JALUR_COLORS } from '@/lib/constants'
import { isKKKurangSetahun, hitungLamaKK } from '@/lib/helpers'
import AlasanPenolakanDisplay from '@/components/AlasanPenolakanDisplay'

interface DetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  target: Registration | null
  onVerify: (id: string, action: 'VERIFIED' | 'REJECTED') => void
  onEdit: (reg: Registration) => void
  onDelete: (reg: Registration) => void
  subJalurOptions: Array<{ label: string; value: string }>
  toast: any
}

export default function DetailDialog({
  open,
  onOpenChange,
  target,
  onVerify,
  onEdit,
  onDelete,
  subJalurOptions,
  toast,
}: DetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Detail Pendaftar
          </DialogTitle>
          <DialogDescription>Informasi lengkap pendaftar SPMB 2026</DialogDescription>
        </DialogHeader>

        {target && (
          <div className="space-y-4 overflow-y-auto flex-1 min-h-0 pr-1" style={{ scrollbarGutter: 'stable' }}>
            {/* Status badge at top */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`${STATUS_COLORS[target.verificationStatus]} text-sm px-3 py-1`}>
                {target.verificationStatus === 'PENDING' && <Clock className="w-4 h-4" />}
                {target.verificationStatus === 'VERIFIED' && <CheckCircle2 className="w-4 h-4" />}
                {target.verificationStatus === 'REJECTED' && <XCircle className="w-4 h-4" />}
                {target.verificationStatus === 'PENDING' ? 'Menunggu Verifikasi' :
                 target.verificationStatus === 'VERIFIED' ? 'Diterima (Terverifikasi)' : 'Ditolak'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 font-medium">No. Registrasi</label>
                <p className="text-sm font-mono font-medium">{target.noRegistrasi}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">NISN</label>
                <p className="text-sm font-mono">{target.nisn}</p>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 font-medium">Nama Lengkap</label>
                <p className="text-sm font-semibold">{target.nama}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Sub Jalur</label>
                <div className="mt-1">
                  <Badge variant="outline" className={SUB_JALUR_COLORS[target.subJalur] || 'bg-gray-100 text-gray-800'}>
                    {target.subJalur}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Jurusan</label>
                <div className="mt-1">
                  <Badge variant="secondary">{target.jurusan}</Badge>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Sekolah Pilihan</h4>
              <div className="bg-sky-50 rounded-lg p-3">
                <p className="text-sm font-medium text-sky-800">{target.namaSekolahPilihan}</p>
                <p className="text-xs text-sky-600">NPSN: {target.npsnSekolahPilihan}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Sekolah Asal</h4>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium">{target.namaSekolahAsal}</p>
                <p className="text-xs text-gray-500">NPSN: {target.npsnSekolahAsal}</p>
              </div>
            </div>

            {/* Portal SPMB Data */}
            {(target.nik || target.tanggalLahir || target.alamat || target.noTelpSiswa || target.noTelpOrangtua || target.lokasiJarak || target.nilaiRataRata || target.skor || target.nilaiRapor || target.skorJarak || target.skorNilaiRaport || (target as Record<string, unknown>).skorLomba || (target as Record<string, unknown>).nilaiRataRataTKA || (target as Record<string, unknown>).skorPrestasiAkademik || (target as Record<string, unknown>).totalNilai || (target as Record<string, unknown>).jarakKeSekolah) && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
                  <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                  Data Portal SPMB
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  {target.nik && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <label className="text-xs text-gray-500 font-medium">NIK</label>
                      <p className="text-sm font-mono">{target.nik}</p>
                    </div>
                  )}
                  {target.tanggalLahir && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <label className="text-xs text-gray-500 font-medium">Tanggal Lahir</label>
                      <p className="text-sm">{target.tanggalLahir}</p>
                    </div>
                  )}
                  {target.noTelpSiswa && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <label className="text-xs text-gray-500 font-medium">Telp Siswa</label>
                      <p className="text-sm font-mono">{target.noTelpSiswa}</p>
                    </div>
                  )}
                  {target.noTelpOrangtua && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <label className="text-xs text-gray-500 font-medium">Telp Orangtua</label>
                      <p className="text-sm font-mono">{target.noTelpOrangtua}</p>
                    </div>
                  )}
                  {target.lokasiJarak && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <label className="text-xs text-gray-500 font-medium">Jarak</label>
                      <p className="text-sm">{target.lokasiJarak}</p>
                    </div>
                  )}
                  {target.nilaiRataRata && (
                    <div className="bg-emerald-50 rounded-lg p-2">
                      <label className="text-xs text-emerald-600 font-medium">Nilai Rata-rata</label>
                      <p className="text-sm font-bold text-emerald-700">{target.nilaiRataRata}</p>
                    </div>
                  )}
                  {target.skor && (
                    <div className="bg-amber-50 rounded-lg p-2">
                      <label className="text-xs text-amber-600 font-medium">Skor</label>
                      <p className="text-sm font-bold text-amber-700">{target.skor}</p>
                    </div>
                  )}
                  {target.skorJarak && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <label className="text-xs text-gray-500 font-medium">Skor Jarak</label>
                      <p className="text-sm">{target.skorJarak}</p>
                    </div>
                  )}
                  {target.skorNilaiRaport && (
                    <div className="bg-sky-50 rounded-lg p-2">
                      <label className="text-xs text-sky-600 font-medium">Skor Nilai Raport</label>
                      <p className="text-sm font-bold text-sky-700">{target.skorNilaiRaport}</p>
                    </div>
                  )}
                  {(target as Record<string, unknown>).skorLomba && (
                    <div className="bg-purple-50 rounded-lg p-2">
                      <label className="text-xs text-purple-600 font-medium">Skor Lomba</label>
                      <p className="text-sm font-bold text-purple-700">{String((target as Record<string, unknown>).skorLomba || '-')}</p>
                    </div>
                  )}
                  {(target as Record<string, unknown>).nilaiRataRataTKA && (
                    <div className="bg-purple-50 rounded-lg p-2">
                      <label className="text-xs text-purple-600 font-medium">Nilai Rata Rata TKA</label>
                      <p className="text-sm font-bold text-purple-700">{String((target as Record<string, unknown>).nilaiRataRataTKA || '-')}</p>
                    </div>
                  )}
                  {(target as Record<string, unknown>).skorPrestasiAkademik && (
                    <div className="bg-purple-50 rounded-lg p-2">
                      <label className="text-xs text-purple-600 font-medium">Skor Prestasi Akademik</label>
                      <p className="text-sm font-bold text-purple-700">{String((target as Record<string, unknown>).skorPrestasiAkademik || '-')}</p>
                    </div>
                  )}
                  {(target as Record<string, unknown>).totalNilai && (
                    <div className="bg-emerald-50 rounded-lg p-2 border border-emerald-200">
                      <label className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Total Nilai (Sumut Berkah)
                      </label>
                      <p className="text-sm font-bold text-emerald-700">{(target as Record<string, unknown>).totalNilai as string}</p>
                    </div>
                  )}
                  {(target as Record<string, unknown>).jarakKeSekolah && (
                    <div className="bg-sky-50 rounded-lg p-2 border border-sky-200">
                      <label className="text-xs text-sky-600 font-medium flex items-center gap-1">
                        <MapPinned className="w-3 h-3" /> Jarak Ke Sekolah (Sumut Berkah)
                      </label>
                      <p className="text-sm font-bold text-sky-700">{(target as Record<string, unknown>).jarakKeSekolah as string}</p>
                    </div>
                  )}
                </div>

                {target.alamat && (
                  <div className="mt-3 bg-gray-50 rounded-lg p-2">
                    <label className="text-xs text-gray-500 font-medium">Alamat</label>
                    <p className="text-sm">{target.alamat}</p>
                    {target.alamatLengkap && <p className="text-xs text-gray-400">{target.alamatLengkap}</p>}
                  </div>
                )}

                {target.nilaiRapor && (() => {
                  try {
                    const grades = JSON.parse(target.nilaiRapor)
                    return (
                      <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <h5 className="text-xs font-medium text-amber-800 mb-2 flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5" /> Nilai Rapor
                        </h5>
                        <div className="grid grid-cols-2 gap-1.5">
                          {Object.entries(grades).map(([subject, value]) => (
                            <div key={subject} className="flex justify-between text-xs bg-white rounded px-2 py-1">
                              <span className="text-gray-600">{subject}</span>
                              <span className="font-bold text-amber-700">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  } catch { return null }
                })()}

                {(target.latitude || target.longitude) && (
                  <div className="mt-3 bg-gray-50 rounded-lg p-2">
                    <label className="text-xs text-gray-500 font-medium">Koordinat</label>
                    <p className="text-xs font-mono">{target.latitude}, {target.longitude}</p>
                  </div>
                )}
              </div>
            )}

            {/* Data Verifikasi */}
            {(target.skorNilaiRaport || target.kekuranganVerifikasi || target.tanggalVerif || target.jamVerif || target.terbitKK || target.lamaKK || target.dokumen) && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
                  <ClipboardCheck className="w-4 h-4 text-sky-600" />
                  Data Verifikasi
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {target.skorNilaiRaport && (
                    <div className="bg-sky-50 rounded-lg p-2">
                      <label className="text-xs text-sky-600 font-medium">Skor Nilai Raport</label>
                      <p className="text-sm font-bold text-sky-700">{target.skorNilaiRaport}</p>
                    </div>
                  )}
                  {target.kekuranganVerifikasi && (
                    <div className="bg-red-50 rounded-lg p-2">
                      <label className="text-xs text-red-600 font-medium mb-1 block">Kekurangan Verifikasi</label>
                      <AlasanPenolakanDisplay value={target.kekuranganVerifikasi} />
                    </div>
                  )}
                  {target.tanggalVerif && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <label className="text-xs text-gray-500 font-medium flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Tanggal Verifikasi</label>
                      <p className="text-sm">{target.tanggalVerif}</p>
                    </div>
                  )}
                  {target.jamVerif && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <label className="text-xs text-gray-500 font-medium">Jam Verifikasi</label>
                      <p className="text-sm">{target.jamVerif}</p>
                    </div>
                  )}
                  {target.terbitKK && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <label className="text-xs text-gray-500 font-medium flex items-center gap-1"><IdCard className="w-3 h-3" /> Terbit KK</label>
                      <p className="text-sm">{target.terbitKK}</p>
                    </div>
                  )}
                  {(target.terbitKK || target.lamaKK) && (
                    <div className={`rounded-lg p-2 ${
                      target.terbitKK && isKKKurangSetahun(target.terbitKK)
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-emerald-50 border border-emerald-200'
                    }`}>
                      <label className={`text-xs font-medium flex items-center gap-1 ${
                        target.terbitKK && isKKKurangSetahun(target.terbitKK)
                          ? 'text-red-600'
                          : 'text-emerald-600'
                      }`}>
                        <CalendarClock className="w-3 h-3" /> Lama KK
                      </label>
                      <p className={`text-sm font-bold ${
                        target.terbitKK && isKKKurangSetahun(target.terbitKK)
                          ? 'text-red-700'
                          : 'text-emerald-700'
                      }`}>
                        {target.lamaKK || (target.terbitKK ? hitungLamaKK(target.terbitKK) : '-')}
                      </p>
                      {target.terbitKK && isKKKurangSetahun(target.terbitKK) && (
                        <p className="text-xs text-red-500 mt-0.5">⚠ KK kurang dari 1 tahun</p>
                      )}
                    </div>
                  )}
                  {target.dokumen && (
                    <div className="bg-gray-50 rounded-lg p-2 col-span-2">
                      <label className="text-xs text-gray-500 font-medium">Dokumen</label>
                      <p className="text-sm">{target.dokumen}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Status Pendaftaran</label>
                  <div className="mt-1"><Badge variant="outline">{target.status}</Badge></div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Waktu Daftar</label>
                  <p className="text-sm">{target.waktuDaftar}</p>
                </div>
                {target.verificationNote && (
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 font-medium">
                      {target.verificationStatus === 'REJECTED' ? 'Alasan Penolakan' : 'Catatan Verifikasi'}
                    </label>
                    <p className="text-sm mt-1 bg-yellow-50 p-2 rounded border border-yellow-200">
                      {target.verificationNote}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t">
              {target.verificationStatus !== 'VERIFIED' && (
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => onVerify(target.id, 'VERIFIED')}
                >
                  <ThumbsUp className="w-4 h-4" />
                  Terima
                </Button>
              )}
              {target.verificationStatus !== 'REJECTED' && (
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => onVerify(target.id, 'REJECTED')}
                >
                  <ThumbsDown className="w-4 h-4" />
                  Tolak
                </Button>
              )}
              {target.verificationStatus === 'VERIFIED' && (
                <Button
                  variant="outline"
                  className="flex-1 border-yellow-400 text-yellow-700 hover:bg-yellow-50"
                  onClick={() => onVerify(target.id, 'REJECTED')}
                >
                  <RotateCcw className="w-4 h-4" />
                  Batalkan & Tolak
                </Button>
              )}
              {target.verificationStatus === 'REJECTED' && (
                <Button
                  variant="outline"
                  className="flex-1 border-emerald-400 text-emerald-700 hover:bg-emerald-50"
                  onClick={() => onVerify(target.id, 'VERIFIED')}
                >
                  <RotateCcw className="w-4 h-4" />
                  Terima Ulang
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
