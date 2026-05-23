'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
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
import { Pencil, Users, School, ClipboardCheck, MapPin, Loader2, X } from 'lucide-react'
import type { Registration } from '@/lib/types'
import { hitungLamaKK } from '@/lib/helpers'
import KekuranganVerifSelect from '@/components/KekuranganVerifSelect'

interface EditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  target: Registration | null
  onSave: (editForm: Record<string, string>, target: Registration) => Promise<void>
  subJalurOptions: Array<{ label: string; value: string }>
  toast: any
}

export default function EditDialog({
  open,
  onOpenChange,
  target,
  onSave,
  subJalurOptions,
  toast,
}: EditDialogProps) {
  const [editForm, setEditForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  // Initialize edit form from target when it changes
  useEffect(() => {
    if (target && open) {
      setEditForm({
        noRegistrasi: target.noRegistrasi || '',
        nama: target.nama || '',
        nisn: target.nisn || '',
        subJalur: target.subJalur || '',
        nik: target.nik || '',
        tanggalLahir: target.tanggalLahir || '',
        alamat: target.alamat || '',
        alamatLengkap: target.alamatLengkap || '',
        noTelpSiswa: target.noTelpSiswa || '',
        noTelpOrangtua: target.noTelpOrangtua || '',
        npsnSekolahPilihan: target.npsnSekolahPilihan || '',
        namaSekolahPilihan: target.namaSekolahPilihan || '',
        jurusan: target.jurusan || '',
        npsnSekolahAsal: target.npsnSekolahAsal || '',
        namaSekolahAsal: target.namaSekolahAsal || '',
        skorJarak: target.skorJarak || '',
        skorNilaiRaport: target.skorNilaiRaport || '',
        kekuranganVerifikasi: target.kekuranganVerifikasi || '',
        tanggalVerif: target.tanggalVerif || '',
        jamVerif: target.jamVerif || '',
        terbitKK: target.terbitKK || '',
        latitude: target.latitude || '',
        longitude: target.longitude || '',
        lokasiJarak: target.lokasiJarak || '',
        nilaiRataRata: target.nilaiRataRata || '',
        totalNilai: (target as Record<string, unknown>).totalNilai as string || '',
        jarakKeSekolah: (target as Record<string, unknown>).jarakKeSekolah as string || '',
      })
    }
  }, [target, open])

  const handleSave = async () => {
    if (!target) return
    setSaving(true)
    try {
      await onSave(editForm, target)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-blue-600" /> Edit Data Pendaftar
          </DialogTitle>
          <DialogDescription>
            Edit data pendaftar <span className="font-semibold">{target?.nama}</span> ({target?.noRegistrasi})
          </DialogDescription>
        </DialogHeader>
        {target && (
          <div className="space-y-6">
            {/* Data Pendaftar */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-gray-500" /> Data Pendaftar
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">No. Registrasi</label>
                  <Input value={editForm.noRegistrasi || ''} onChange={e => setEditForm({...editForm, noRegistrasi: e.target.value})} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Nama</label>
                  <Input value={editForm.nama || ''} onChange={e => setEditForm({...editForm, nama: e.target.value})} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">NISN</label>
                  <Input value={editForm.nisn || ''} onChange={e => setEditForm({...editForm, nisn: e.target.value})} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Sub Jalur</label>
                  <Select value={editForm.subJalur || ''} onValueChange={v => setEditForm({...editForm, subJalur: v})}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Pilih Sub Jalur" /></SelectTrigger>
                    <SelectContent>
                      {subJalurOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">NIK</label>
                  <Input value={editForm.nik || ''} onChange={e => setEditForm({...editForm, nik: e.target.value})} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Tanggal Lahir</label>
                  <Input type="date" value={editForm.tanggalLahir || ''} onChange={e => setEditForm({...editForm, tanggalLahir: e.target.value})} className="mt-1" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-gray-500 font-medium">Alamat</label>
                  <Input value={editForm.alamat || ''} onChange={e => setEditForm({...editForm, alamat: e.target.value})} className="mt-1" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-gray-500 font-medium">Alamat Lengkap</label>
                  <Textarea value={editForm.alamatLengkap || ''} onChange={e => setEditForm({...editForm, alamatLengkap: e.target.value})} className="mt-1" rows={2} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">No. Telp Siswa</label>
                  <Input value={editForm.noTelpSiswa || ''} onChange={e => setEditForm({...editForm, noTelpSiswa: e.target.value})} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">No. Telp Orangtua</label>
                  <Input value={editForm.noTelpOrangtua || ''} onChange={e => setEditForm({...editForm, noTelpOrangtua: e.target.value})} className="mt-1" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Data Sekolah */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                <School className="w-4 h-4 text-gray-500" /> Data Sekolah
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">NPSN Sekolah Pilihan</label>
                  <Input value={editForm.npsnSekolahPilihan || ''} onChange={e => setEditForm({...editForm, npsnSekolahPilihan: e.target.value})} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Nama Sekolah Pilihan</label>
                  <Input value={editForm.namaSekolahPilihan || ''} onChange={e => setEditForm({...editForm, namaSekolahPilihan: e.target.value})} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Jurusan</label>
                  <Input value={editForm.jurusan || ''} onChange={e => setEditForm({...editForm, jurusan: e.target.value})} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">NPSN Sekolah Asal</label>
                  <Input value={editForm.npsnSekolahAsal || ''} onChange={e => setEditForm({...editForm, npsnSekolahAsal: e.target.value})} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Nama Sekolah Asal</label>
                  <Input value={editForm.namaSekolahAsal || ''} onChange={e => setEditForm({...editForm, namaSekolahAsal: e.target.value})} className="mt-1" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Data Verifikasi */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                <ClipboardCheck className="w-4 h-4 text-gray-500" /> Data Verifikasi
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Skor Jarak</label>
                  <Input value={editForm.skorJarak || ''} onChange={e => setEditForm({...editForm, skorJarak: e.target.value})} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Skor Nilai Raport</label>
                  <Input value={editForm.skorNilaiRaport || ''} onChange={e => setEditForm({...editForm, skorNilaiRaport: e.target.value})} className="mt-1" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-gray-500 font-medium">Kekurangan Verifikasi</label>
                  <div className="mt-1">
                    <KekuranganVerifSelect
                      value={editForm.kekuranganVerifikasi || ''}
                      onChange={v => setEditForm({...editForm, kekuranganVerifikasi: v})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Tanggal Verifikasi</label>
                  <Input type="date" value={editForm.tanggalVerif || ''} onChange={e => setEditForm({...editForm, tanggalVerif: e.target.value})} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Jam Verifikasi</label>
                  <Input type="time" value={editForm.jamVerif || ''} onChange={e => setEditForm({...editForm, jamVerif: e.target.value})} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Terbit KK</label>
                  <div className="flex items-center gap-1 mt-1">
                    <Input type="date" value={editForm.terbitKK || ''} onChange={e => setEditForm({...editForm, terbitKK: e.target.value})} className="flex-1" />
                    {editForm.terbitKK && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-9 px-2"
                        onClick={() => setEditForm({...editForm, terbitKK: ''})}
                        title="Kosongkan"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Lama KK</label>
                  <Input value={editForm.terbitKK ? hitungLamaKK(editForm.terbitKK) : ''} readOnly className="mt-1 bg-gray-50" />
                  <p className="text-xs text-gray-400 mt-1">Dihitung otomatis dari Terbit KK</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Data Lokasi & Nilai */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-500" /> Lokasi & Nilai
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Latitude</label>
                  <Input value={editForm.latitude || ''} onChange={e => setEditForm({...editForm, latitude: e.target.value})} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Longitude</label>
                  <Input value={editForm.longitude || ''} onChange={e => setEditForm({...editForm, longitude: e.target.value})} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Lokasi Jarak</label>
                  <Input value={editForm.lokasiJarak || ''} onChange={e => setEditForm({...editForm, lokasiJarak: e.target.value})} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Nilai Rata-Rata</label>
                  <Input value={editForm.nilaiRataRata || ''} onChange={e => setEditForm({...editForm, nilaiRataRata: e.target.value})} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs text-emerald-600 font-medium">Total Nilai (Sumut Berkah)</label>
                  <Input value={editForm.totalNilai || ''} onChange={e => setEditForm({...editForm, totalNilai: e.target.value})} className="mt-1" placeholder="Dari Sumut Berkah" />
                </div>
                <div>
                  <label className="text-xs text-sky-600 font-medium">Jarak Ke Sekolah (Sumut Berkah)</label>
                  <Input value={editForm.jarakKeSekolah || ''} onChange={e => setEditForm({...editForm, jarakKeSekolah: e.target.value})} className="mt-1" placeholder="cth: 1.342 m" />
                </div>
              </div>
            </div>
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : <><Pencil className="w-4 h-4" /> Simpan</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
