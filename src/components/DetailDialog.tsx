'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ClipboardCheck,
  GraduationCap,
  IdCard,
  CalendarDays,
  CalendarClock,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
} from 'lucide-react'
import type { Registration } from '@/lib/types'
import { STATUS_COLORS, SUB_JALUR_COLORS } from '@/lib/constants'
import { hitungLamaKK, isKKKurangSetahun } from '@/lib/utils-shared'

interface DetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  detailTarget: Registration | null
  appName: string
  schoolName: string
  onVerifyAction: (id: string, action: 'VERIFIED' | 'REJECTED') => void
}

export default function DetailDialog({
  open,
  onOpenChange,
  detailTarget,
  appName,
  schoolName,
  onVerifyAction,
}: DetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Detail Pendaftar
          </DialogTitle>
          <DialogDescription>Informasi lengkap pendaftar {appName}{schoolName ? ` — ${schoolName}` : ''}</DialogDescription>
        </DialogHeader>

        {detailTarget && (
          <div className="space-y-4 overflow-y-auto flex-1 min-h-0 pr-1" style={{ scrollbarGutter: 'stable' }}>
            {/* Status badge at top */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`${STATUS_COLORS[detailTarget.verificationStatus]} text-sm px-3 py-1`}>
                {detailTarget.verificationStatus === 'PENDING' && <Clock className="w-4 h-4" />}
                {detailTarget.verificationStatus === 'VERIFIED' && <CheckCircle2 className="w-4 h-4" />}
                {detailTarget.verificationStatus === 'REJECTED' && <XCircle className="w-4 h-4" />}
                {detailTarget.verificationStatus === 'PENDING' ? 'Menunggu Verifikasi' :
                 detailTarget.verificationStatus === 'VERIFIED' ? 'Diterima (Terverifikasi)' : 'Ditolak'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 font-medium">No. Registrasi</label>
                <p className="text-sm font-mono font-medium">{detailTarget.noRegistrasi}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">NISN</label>
                <p className="text-sm font-mono">{detailTarget.nisn}</p>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 font-medium">Nama Lengkap</label>
                <p className="text-sm font-semibold">{detailTarget.nama}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Sub Jalur</label>
                <div className="mt-1">
                  <Badge variant="outline" className={SUB_JALUR_COLORS[detailTarget.subJalur] || 'bg-gray-100 text-gray-800'}>
                    {detailTarget.subJalur}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Jurusan</label>
                <div className="mt-1">
                  <Badge variant="secondary">{detailTarget.jurusan}</Badge>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Sekolah Asal</h4>
              <div className="bg-sky-50 rounded-lg p-3">
                <p className="text-sm font-medium text-sky-800">{detailTarget.namaSekolahAsal}</p>
                <p className="text-xs text-sky-600">NPSN: {detailTarget.npsnSekolahAsal}</p>
              </div>
            </div>

            {/* Portal SPMB Data */}
            {(detailTarget.nik || detailTarget.tanggalLahir || detailTarget.alamat || detailTarget.noTelpSiswa || detailTarget.noTelpOrangtua || detailTarget.lokasiJarak || detailTarget.nilaiRataRata || detailTarget.skor || detailTarget.nilaiRapor || detailTarget.skorJarak || detailTarget.skorNilaiRaport || detailTarget.totalNilai) && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
                  <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                  Data Portal SPMB
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  {detailTarget.nik && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <label className="text-xs text-gray-500 font-medium">NIK</label>
                      <p className="text-sm font-mono">{detailTarget.nik}</p>
                    </div>
                  )}
                  {detailTarget.tanggalLahir && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <label className="text-xs text-gray-500 font-medium">Tanggal Lahir</label>
                      <p className="text-sm">{detailTarget.tanggalLahir}</p>
                    </div>
                  )}
                  {detailTarget.noTelpSiswa && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <label className="text-xs text-gray-500 font-medium">Telp Siswa</label>
                      <p className="text-sm font-mono">{detailTarget.noTelpSiswa}</p>
                    </div>
                  )}
                  {detailTarget.noTelpOrangtua && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <label className="text-xs text-gray-500 font-medium">Telp Orangtua</label>
                      <p className="text-sm font-mono">{detailTarget.noTelpOrangtua}</p>
                    </div>
                  )}
                  {detailTarget.lokasiJarak && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <label className="text-xs text-gray-500 font-medium">Jarak</label>
                      <p className="text-sm">{detailTarget.lokasiJarak}</p>
                    </div>
                  )}
                  {detailTarget.totalNilai && (
                    <div>
                      <label className="text-xs text-gray-500 font-medium">Total Nilai (Sumut Berkah)</label>
                      <p className="text-sm">{detailTarget.totalNilai}</p>
                    </div>
                  )}

                  {detailTarget.nilaiRataRata && (
                    <div className="bg-emerald-50 rounded-lg p-2">
                      <label className="text-xs text-emerald-600 font-medium">Nilai Rata-rata</label>
                      <p className="text-sm font-bold text-emerald-700">{detailTarget.nilaiRataRata}</p>
                    </div>
                  )}
                  {detailTarget.skor && (
                    <div className="bg-amber-50 rounded-lg p-2">
                      <label className="text-xs text-amber-600 font-medium">Skor</label>
                      <p className="text-sm font-bold text-amber-700">{detailTarget.skor}</p>
                    </div>
                  )}
                  {detailTarget.skorJarak && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <label className="text-xs text-gray-500 font-medium">Skor Jarak</label>
                      <p className="text-sm">{detailTarget.skorJarak}</p>
                    </div>
                  )}
                  {detailTarget.skorNilaiRaport && (
                    <div className="bg-sky-50 rounded-lg p-2">
                      <label className="text-xs text-sky-600 font-medium">Skor Nilai Raport</label>
                      <p className="text-sm font-bold text-sky-700">{detailTarget.skorNilaiRaport}</p>
                    </div>
                  )}
                </div>

                {detailTarget.alamat && (
                  <div className="mt-3 bg-gray-50 rounded-lg p-2">
                    <label className="text-xs text-gray-500 font-medium">Alamat</label>
                    <p className="text-sm">{detailTarget.alamat}</p>
                    {detailTarget.alamatLengkap && <p className="text-xs text-gray-400">{detailTarget.alamatLengkap}</p>}
                  </div>
                )}

                {detailTarget.nilaiRapor && (() => {
                  try {
                    const grades = JSON.parse(detailTarget.nilaiRapor)
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

                {(detailTarget.latitude || detailTarget.longitude) && (
                  <div className="mt-3 bg-gray-50 rounded-lg p-2">
                    <label className="text-xs text-gray-500 font-medium">Koordinat</label>
                    <p className="text-xs font-mono">{detailTarget.latitude}, {detailTarget.longitude}</p>
                  </div>
                )}
              </div>
            )}

            {/* Data Verifikasi */}
            {(detailTarget.skorNilaiRaport || detailTarget.kekuranganVerifikasi || detailTarget.tanggalVerif || detailTarget.jamVerif || detailTarget.terbitKK || detailTarget.lamaKK || detailTarget.dokumen) && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
                  <ClipboardCheck className="w-4 h-4 text-sky-600" />
                  Data Verifikasi
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {detailTarget.skorNilaiRaport && (
                    <div className="bg-sky-50 rounded-lg p-2">
                      <label className="text-xs text-sky-600 font-medium">Skor Nilai Raport</label>
                      <p className="text-sm font-bold text-sky-700">{detailTarget.skorNilaiRaport}</p>
                    </div>
                  )}
                  {detailTarget.kekuranganVerifikasi && (
                    <div className="bg-red-50 rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-red-600 font-medium">Kekurangan Verifikasi</label>
                        <button
                          className="text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-red-100 text-red-600 transition-colors"
                          onClick={() => navigator.clipboard.writeText(detailTarget.kekuranganVerifikasi || '').then(() => {})}
                          title="Copy alasan untuk paste ke Portal SPMB"
                        >
                          <Copy className="w-3 h-3" /> Copy
                        </button>
                      </div>
                      <div className="text-sm text-red-700">
                        {detailTarget.kekuranganVerifikasi.split(' | ').map((reason, i) => (
                          <p key={i} className="mt-0.5">{reason}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  {detailTarget.tanggalVerif && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <label className="text-xs text-gray-500 font-medium flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Tanggal Verifikasi</label>
                      <p className="text-sm">{detailTarget.tanggalVerif}</p>
                    </div>
                  )}
                  {detailTarget.jamVerif && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <label className="text-xs text-gray-500 font-medium">Jam Verifikasi</label>
                      <p className="text-sm">{detailTarget.jamVerif}</p>
                    </div>
                  )}
                  {detailTarget.terbitKK && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <label className="text-xs text-gray-500 font-medium flex items-center gap-1"><IdCard className="w-3 h-3" /> Terbit KK</label>
                      <p className="text-sm">{detailTarget.terbitKK}</p>
                    </div>
                  )}
                  {(detailTarget.terbitKK || detailTarget.lamaKK) && (
                    <div className={`rounded-lg p-2 ${
                      detailTarget.terbitKK && isKKKurangSetahun(detailTarget.terbitKK)
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-emerald-50 border border-emerald-200'
                    }`}>
                      <label className={`text-xs font-medium flex items-center gap-1 ${
                        detailTarget.terbitKK && isKKKurangSetahun(detailTarget.terbitKK)
                          ? 'text-red-600'
                          : 'text-emerald-600'
                      }`}>
                        <CalendarClock className="w-3 h-3" /> Lama KK
                      </label>
                      <p className={`text-sm font-bold ${
                        detailTarget.terbitKK && isKKKurangSetahun(detailTarget.terbitKK)
                          ? 'text-red-700'
                          : 'text-emerald-700'
                      }`}>
                        {detailTarget.lamaKK || (detailTarget.terbitKK ? hitungLamaKK(detailTarget.terbitKK) : '-')}
                      </p>
                      {detailTarget.terbitKK && isKKKurangSetahun(detailTarget.terbitKK) && (
                        <p className="text-xs text-red-500 mt-0.5">⚠ KK kurang dari 1 tahun</p>
                      )}
                    </div>
                  )}
                  {detailTarget.dokumen && (
                    <div className="bg-gray-50 rounded-lg p-2 col-span-2">
                      <label className="text-xs text-gray-500 font-medium">Dokumen</label>
                      <p className="text-sm">{detailTarget.dokumen}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Status Pendaftaran</label>
                  <div className="mt-1"><Badge variant="outline">{detailTarget.status}</Badge></div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Waktu Daftar</label>
                  <p className="text-sm">{detailTarget.waktuDaftar}</p>
                </div>
                {detailTarget.verificationNote && (
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 font-medium">
                      {detailTarget.verificationStatus === 'REJECTED' ? 'Alasan Penolakan' : 'Catatan Verifikasi'}
                    </label>
                    <p className="text-sm mt-1 bg-yellow-50 p-2 rounded border border-yellow-200">
                      {detailTarget.verificationNote}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t">
              {detailTarget.verificationStatus !== 'VERIFIED' && (
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => onVerifyAction(detailTarget.id, 'VERIFIED')}
                >
                  <ThumbsUp className="w-4 h-4" />
                  Terima
                </Button>
              )}
              {detailTarget.verificationStatus !== 'REJECTED' && (
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => onVerifyAction(detailTarget.id, 'REJECTED')}
                >
                  <ThumbsDown className="w-4 h-4" />
                  Tolak
                </Button>
              )}
              {detailTarget.verificationStatus === 'VERIFIED' && (
                <Button
                  variant="outline"
                  className="flex-1 border-yellow-400 text-yellow-700 hover:bg-yellow-50"
                  onClick={() => onVerifyAction(detailTarget.id, 'REJECTED')}
                >
                  <RotateCcw className="w-4 h-4" />
                  Batalkan & Tolak
                </Button>
              )}
              {detailTarget.verificationStatus === 'REJECTED' && (
                <Button
                  variant="outline"
                  className="flex-1 border-emerald-400 text-emerald-700 hover:bg-emerald-50"
                  onClick={() => onVerifyAction(detailTarget.id, 'VERIFIED')}
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
