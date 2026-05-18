'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useToast } from '@/hooks/use-toast'
import {
  Upload,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  GraduationCap,
  School,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  ArrowRightLeft,
  ListChecks,
  ThumbsUp,
  ThumbsDown,
  FileText,
  RotateCcw,
  Check,
  MapPin,
  Heart,
  Award,
  BookOpen,
  ClipboardCheck,
  ArrowLeftRight,
  Trophy,
  UserCog,
  ClipboardPaste,
  MapPinned,
  Phone,
  CalendarDays,
  IdCard,
  Pencil,
  CalendarClock,
  Printer,
  AlertCircle,
  X,
  Settings,
  Plus,
  Save,
  Globe,
  RefreshCw,
  Lock,
  Mail,
} from 'lucide-react'

interface Registration {
  id: string
  noRegistrasi: string
  nama: string
  nisn: string
  subJalur: string
  npsnSekolahPilihan: string
  namaSekolahPilihan: string
  jurusan: string
  npsnSekolahAsal: string
  namaSekolahAsal: string
  status: string
  waktuDaftar: string
  verificationStatus: string
  verificationNote: string | null
  createdAt: string
  updatedAt: string
  // Portal SPMB fields
  nik?: string | null
  tanggalLahir?: string | null
  alamat?: string | null
  alamatLengkap?: string | null
  noTelpSiswa?: string | null
  noTelpOrangtua?: string | null
  latitude?: string | null
  longitude?: string | null
  lokasiJarak?: string | null
  nilaiRataRata?: string | null
  skorJarak?: string | null
  skor?: string | null
  nilaiRapor?: string | null
  // Verification-specific fields
  skorNilaiRaport?: string | null
  kekuranganVerifikasi?: string | null
  tanggalVerif?: string | null
  jamVerif?: string | null
  terbitKK?: string | null
  lamaKK?: string | null
  dokumen?: string | null
}

interface DashboardStats {
  total: number
  verified: number
  rejected: number
  pending: number
  bySubJalur: { name: string; count: number }[]
  bySekolahPilihan: { name: string; count: number }[]
  byJurusan: { name: string; count: number }[]
  byStatus: { name: string; count: number }[]
  verifiedBySubJalur: { name: string; count: number }[]
  verifiedBySekolah: { name: string; count: number }[]
  verifiedByJurusan: { name: string; count: number }[]
  verifiedList: Registration[]
  rejectedBySubJalur: { name: string; count: number }[]
  rejectedBySekolah: { name: string; count: number }[]
  rejectedByJurusan: { name: string; count: number }[]
  rejectedList: Registration[]
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface LembarVerifikasiData {
  registrations: Registration[]
  pagination: PaginationInfo
  stats: {
    total: number
    verified: number
    rejected: number
    pending: number
  }
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  VERIFIED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  REJECTED: 'bg-red-100 text-red-800 border-red-300',
}

// 99 Kategori Kekurangan Verifikasi
const KEKURANGAN_VERIFIKASI_OPTIONS = [
  '1. Tidak Ada Kendala',
  '2. Titik Koordinat tidak sesuai dengan Alamat di Kartu Keluarga',
  '3. Tidak Foto Rapor Semester 2',
  '4. Tidak Foto Rapor Semester 3',
  '5. Tidak Foto Rapor Semester 4',
  '6. Tidak Foto Rapor Semester 5',
  '7. Foto KK Buram tidak dapat dibaca',
  '8. Perubahan tempat dan tanggal tanda tangan pada surat pernyataan orang tua',
  '9. Foto Surat Keterangan Keabsahan Nilai Buram/ tidak dapat dibaca',
  '10. Tidak Ada Foto Surat Keterangan Kepala Sekolah (Keabsahan Nilai)',
  '11. Nilai Raport yang dientri tidak sesuai dengan foto nilai Per Semester',
  '12. Salah Input Nilai Raport Semester 1',
  '13. Salah Input Nilai Raport Semester 2',
  '14. Salah Input Nilai Raport Semester 3',
  '15. Salah Input Nilai Raport Semester 4',
  '16. Salah Input Nilai Raport Semester 5',
  '17. Tidak Ada Foto Rapor Sem 1, Sem 2, Sem 3, Sem 4',
  '18. Tidak Ada Foto Rapor Sem 1, Sem 2, Sem 3',
  '19. Tidak Ada Foto Rapor Sem 1, Sem 2',
  '20. Tidak Ada Foto Rapor Sem 1',
  '21. Tidak Ada Foto Rapor Sem 2',
  '22. Tidak Ada Foto Rapor Sem 3',
  '23. Tidak Ada Foto Rapor Sem 4',
  '24. Tidak Ada Foto Rapor Sem 5',
  '25. Tidak Ada Foto Rapor Samasekali',
  '26. Foto KK dan Surat Keterangan Buram',
  '27. Foto KK dan Rapor Buram',
  '28. Foto Surat Keterangan Kepala Sekolah dan Foto Rapor Buram',
  '29. Surat Pernyataan Orangtua/ Wali Tidak Dibubuhi Materai 10.000',
  '30. Titik Koordinat dan alamat di KK tidak sinkron',
  '31. Umur KK Baru 13 Hari',
  '32. Usia KK Masih Belum Setahun Silahkan Upload KK yang Diatas Satu tahun',
  '33. Umur KK Belum 1 Tahun',
  '34. Buram Foto Rapor Semester 2, 3, 4 dan 5',
  '35. Buram Foto Rapor Semester 3, 4 dan 5',
  '36. Buram Foto Rapor Semester 4 dan 5',
  '37. Surat pernyataan orang tua salah',
  '38. Foto raport yang di upload adalah foto raport asli dan bukan daftar kumpul',
  '39. Salah Upload bukti dokumen PIP',
  '40. Ditolak dinas',
  '41. KK tidak aktif segera aktifkan ke dukcapil serta surat keterangan tidak mampu',
  '42. KK tidak aktif segera aktifkan ke dukcapil supaya bisa mendaftar kembali',
  '43. Titik koordinat berbeda dan kartu keluarga tidak dapat di scan',
  '44. Kartu PKH sudah tidak aktif',
  '45. Titik koordinat salah dan KK tidak aktif',
  '46. Foto KK tidak dapat di scan',
  '47. Dokumen PKH yang diunggah salah dan surat pernyataan tidak sesuai form',
  '48. KK kurang dari 1 tahun dan nilai raport yang di input tidak sesuai dengan foto',
  '49. Nilai raport yang di input tidak sesuai dengan yang di upload',
  '50. KK tidak aktif, tidak ada kartu PKH, format pernyataan orang tua salah',
  '51. KK tidak aktif dan ket. Tempat dan tanggal surat pernyataan orang tua tidak sesuai',
  '52. KK tidak dapat dibaca dan hasil scan kartu KIP eror',
  '53. Dokumen KIP salah dan surat pernyataan orang tua kurang jelas',
  '54. KK tidak aktif dan titik koordinat salah',
  '55. KK kurang 1 tahun, dokumen KIP buram dan surat pernyataan orang tua tidak sesuai',
  '56. KK tidak aktif, foto raport tidak jelas dan tidak rapi',
  '57. Foto raport salah di upload',
  '58. KK blm 1 tahun, foto KIP buram dan tidak rapi',
  '59. Foto KK tidak dapat di baca',
  '60. Foto raport yang di upload pada semester 5 salah',
  '61. Alamat titik koordinat tidak sesuai dengan alamat di KK dan surat pernyataan',
  '62. Foto kartu KIP terpotong',
  '63. KK dan KIP tidak ditemukan serta tanda tangan tidak mengenai materai',
  '64. Nilai yang di input sem. 2 tidak sesuai dengan foto yang di upload',
  '65. Umur KK kurang dari 1 tahun dan foto raport tidak sesuai',
  '66. Nilai yang di input tidak sesuai dengan surat keabsahan nilai dari kasek',
  '67. KK tidak aktif',
  '68. Foto KK tdk dapat di scan',
  '69. Nilai raport sem. 1 yang di upload berbeda dengan surat keabsahan nilai raport',
  '70. Foto KK Buram tidak dapat dibaca',
  '71. Titik koordinat tidak sesuai, umur KK kurang dari 1 tahun, dokumen PKH salah',
  '72. KK tidak dapat di scan, titik koordinat tidak sesuai KK, kartu KIP tidak dapat di scan',
  '73. KK tidak dapat di baca dan kartu KIP eror saat di scan',
  '74. KK tidak dapat di baca dan titik koordinat tidak sesuai (titik di hutan)',
  '75. Foto raport semester 5 tidak lengkap dan KK tidak dapat discan',
  '76. KK buram dan salah upload foto raport',
  '77. KK tidak jelas, surat pernyataan salah',
  '78. KK dan kartu KIP tidak ditemukan',
  '79. Surat pernyataan keabsahan nilai raport salah',
  '80. Foto KK',
  '81. Kartu KIP tidak di upload',
  '82. Nilai sem. 4 dan 5 yang di input tidak sesuai dengan foto raport, umur KK kurang 1 tahun',
  '83. Titik koordinat tidak sesuai dengan KK, foto raport yang di upload tidak sesuai',
  '84. Foto raport tidak lengkap',
  '85. KK kurang 1 tahun dan surat keabsahan raport tidak sesuai',
  '86. KK tidak aktif',
  '87. Surat pernyataan dan kartu PKH tidak sesuai',
  '88. Umur KK kurang 1 tahun dan foto raport yang di upload salah',
  '89. KK kurang 1 tahun dan surat pernyataan tidak sesuai',
  '90. KK tidak aktif dan foto raport tidak lengkap',
  '91. Umur KK kurang 1 tahun dan nilai raport tidak sesuai dengan yang di input',
  '92. Foto raport semester 5 tidak lengkap',
  '93. Dokumen surat tugas tidak lengkap dan KK tidak aktif',
  '94. Foto raport terpotong',
  '95. Umur KK kurang 1 tahun',
  '96. Surat keabsahan yang di upload tidak sesuai',
  '97. KK tidak dapat di baca dan hasil scan kartu KIP eror',
  '98. KK tidak dapat di baca dan kartu KIP eror saat di scan',
  '99. KK tidak dapat di baca dan titik koordinat tidak sesuai (titik di hutan)',
]

const SUB_JALUR_COLORS: Record<string, string> = {
  'Domisili': 'bg-sky-100 text-sky-800 border-sky-200',
  'Keluarga Tidak Mampu': 'bg-orange-100 text-orange-800 border-orange-200',
  'Afirmasi': 'bg-orange-100 text-orange-800 border-orange-200',
  'Disabilitas': 'bg-purple-100 text-purple-800 border-purple-200',
  'Anak Guru': 'bg-violet-100 text-violet-800 border-violet-200',
  'Prestasi': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Prestasi Non Akademik': 'bg-teal-100 text-teal-800 border-teal-200',
  'Mutasi': 'bg-cyan-100 text-cyan-800 border-cyan-200',
}

// Hitung Lama KK dari tanggal Terbit KK
function hitungLamaKK(terbitKK: string): string {
  if (!terbitKK) return ''
  const terbit = new Date(terbitKK)
  if (isNaN(terbit.getTime())) return ''
  const now = new Date()
  let years = now.getFullYear() - terbit.getFullYear()
  let months = now.getMonth() - terbit.getMonth()
  let days = now.getDate() - terbit.getDate()
  if (days < 0) {
    months--
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    days += prevMonth.getDate()
  }
  if (months < 0) {
    years--
    months += 12
  }
  const parts: string[] = []
  if (years > 0) parts.push(`${years} Tahun`)
  if (months > 0) parts.push(`${months} Bulan`)
  if (days > 0 && years === 0) parts.push(`${days} Hari`)
  if (parts.length === 0) parts.push('0 Hari')
  return parts.join(' ')
}

// Cek apakah KK kurang dari 1 tahun
function isKKKurangSetahun(terbitKK: string): boolean {
  if (!terbitKK) return false
  const terbit = new Date(terbitKK)
  if (isNaN(terbit.getTime())) return false
  const now = new Date()
  const diffMs = now.getTime() - terbit.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays < 365
}

// Lembar Verifikasi — built dynamically from jalurConfigs
// Icon and color mapping by jalur nama keywords
const JALUR_ICON_MAP: Record<string, any> = {
  'domisili': MapPin,
  'afirmasi': Heart,
  'ktm': Heart,
  'keluarga tidak mampu': Heart,
  'disabilitas': BookOpen,
  'penyandang disabilitas': BookOpen,
  'anak guru': UserCog,
  'mutasi': ArrowLeftRight,
  'perpindahan': ArrowLeftRight,
  'prestasi nilai rapor': Award,
  'prestasi akademik': Award,
  'prestasi': Award,
  'non akademik': Trophy,
  'nonakademik': Trophy,
  'bencana': AlertTriangle,
}

const JALUR_COLOR_MAP: Record<string, { color: string; bgColor: string; borderColor: string; headerBg: string; iconBg: string; iconColor: string; btnColor: string }> = {
  'domisili': { color: 'sky', bgColor: 'bg-sky-50', borderColor: 'border-sky-500', headerBg: 'bg-sky-50/80', iconBg: 'bg-sky-100', iconColor: 'text-sky-600', btnColor: 'bg-sky-600 hover:bg-sky-700' },
  'afirmasi': { color: 'orange', bgColor: 'bg-orange-50', borderColor: 'border-orange-500', headerBg: 'bg-orange-50/80', iconBg: 'bg-orange-100', iconColor: 'text-orange-600', btnColor: 'bg-orange-600 hover:bg-orange-700' },
  'ktm': { color: 'orange', bgColor: 'bg-orange-50', borderColor: 'border-orange-500', headerBg: 'bg-orange-50/80', iconBg: 'bg-orange-100', iconColor: 'text-orange-600', btnColor: 'bg-orange-600 hover:bg-orange-700' },
  'keluarga tidak mampu': { color: 'orange', bgColor: 'bg-orange-50', borderColor: 'border-orange-500', headerBg: 'bg-orange-50/80', iconBg: 'bg-orange-100', iconColor: 'text-orange-600', btnColor: 'bg-orange-600 hover:bg-orange-700' },
  'disabilitas': { color: 'purple', bgColor: 'bg-purple-50', borderColor: 'border-purple-500', headerBg: 'bg-purple-50/80', iconBg: 'bg-purple-100', iconColor: 'text-purple-600', btnColor: 'bg-purple-600 hover:bg-purple-700' },
  'penyandang disabilitas': { color: 'purple', bgColor: 'bg-purple-50', borderColor: 'border-purple-500', headerBg: 'bg-purple-50/80', iconBg: 'bg-purple-100', iconColor: 'text-purple-600', btnColor: 'bg-purple-600 hover:bg-purple-700' },
  'anak guru': { color: 'violet', bgColor: 'bg-violet-50', borderColor: 'border-violet-500', headerBg: 'bg-violet-50/80', iconBg: 'bg-violet-100', iconColor: 'text-violet-600', btnColor: 'bg-violet-600 hover:bg-violet-700' },
  'mutasi': { color: 'cyan', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-500', headerBg: 'bg-cyan-50/80', iconBg: 'bg-cyan-100', iconColor: 'text-cyan-600', btnColor: 'bg-cyan-600 hover:bg-cyan-700' },
  'perpindahan': { color: 'cyan', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-500', headerBg: 'bg-cyan-50/80', iconBg: 'bg-cyan-100', iconColor: 'text-cyan-600', btnColor: 'bg-cyan-600 hover:bg-cyan-700' },
  'prestasi nilai rapor': { color: 'emerald', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-500', headerBg: 'bg-emerald-50/80', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', btnColor: 'bg-emerald-600 hover:bg-emerald-700' },
  'prestasi akademik': { color: 'emerald', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-500', headerBg: 'bg-emerald-50/80', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', btnColor: 'bg-emerald-600 hover:bg-emerald-700' },
  'prestasi non akademik': { color: 'teal', bgColor: 'bg-teal-50', borderColor: 'border-teal-500', headerBg: 'bg-teal-50/80', iconBg: 'bg-teal-100', iconColor: 'text-teal-600', btnColor: 'bg-teal-600 hover:bg-teal-700' },
  'nonakademik': { color: 'teal', bgColor: 'bg-teal-50', borderColor: 'border-teal-500', headerBg: 'bg-teal-50/80', iconBg: 'bg-teal-100', iconColor: 'text-teal-600', btnColor: 'bg-teal-600 hover:bg-teal-700' },
  'bencana': { color: 'red', bgColor: 'bg-red-50', borderColor: 'border-red-500', headerBg: 'bg-red-50/80', iconBg: 'bg-red-100', iconColor: 'text-red-600', btnColor: 'bg-red-600 hover:bg-red-700' },
}

// Fallback colors for custom jalur (cycling through these)
const FALLBACK_COLORS = [
  { color: 'rose', bgColor: 'bg-rose-50', borderColor: 'border-rose-500', headerBg: 'bg-rose-50/80', iconBg: 'bg-rose-100', iconColor: 'text-rose-600', btnColor: 'bg-rose-600 hover:bg-rose-700' },
  { color: 'indigo', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-500', headerBg: 'bg-indigo-50/80', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600', btnColor: 'bg-indigo-600 hover:bg-indigo-700' },
  { color: 'amber', bgColor: 'bg-amber-50', borderColor: 'border-amber-500', headerBg: 'bg-amber-50/80', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', btnColor: 'bg-amber-600 hover:bg-amber-700' },
  { color: 'lime', bgColor: 'bg-lime-50', borderColor: 'border-lime-500', headerBg: 'bg-lime-50/80', iconBg: 'bg-lime-100', iconColor: 'text-lime-600', btnColor: 'bg-lime-600 hover:bg-lime-700' },
  { color: 'fuchsia', bgColor: 'bg-fuchsia-50', borderColor: 'border-fuchsia-500', headerBg: 'bg-fuchsia-50/80', iconBg: 'bg-fuchsia-100', iconColor: 'text-fuchsia-600', btnColor: 'bg-fuchsia-600 hover:bg-fuchsia-700' },
]

// subJalurFilter mapping — maps jalur nama to the subJalur value used in Registration data
// If a jalur name doesn't match the subJalur value in the data, add it here
const JALUR_SUB_FILTER_MAP: Record<string, string> = {
  'Afirmasi (KTM)': 'Keluarga Tidak Mampu',
  'Keluarga Tidak Mampu': 'Keluarga Tidak Mampu',
  'Penyandang Disabilitas': 'Disabilitas',
  'Mutasi Orang tua/ Wali': 'Mutasi',
  'Prestasi Akademik': 'Prestasi',
  'Prestasi Nonakademik': 'Prestasi Non Akademik',
  'Terdampak Bencana Alam': 'Terdampak Bencana Alam',
}

function getJalurIcon(nama: string) {
  const lower = nama.toLowerCase()
  for (const [keyword, icon] of Object.entries(JALUR_ICON_MAP)) {
    if (lower.includes(keyword)) return icon
  }
  return ClipboardCheck // default icon
}

function getJalurColors(nama: string, index: number) {
  const lower = nama.toLowerCase()
  for (const [keyword, colors] of Object.entries(JALUR_COLOR_MAP)) {
    if (lower.includes(keyword)) return colors
  }
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length]
}

function getJalurSubFilter(nama: string) {
  return JALUR_SUB_FILTER_MAP[nama] || nama
}

// Build Lembar Verifikasi config from jalurConfigs
function buildLembarVerifikasi(jalurConfigs: Array<{ id: string; nama: string; urutan: number; aktif: boolean }>) {
  const active = jalurConfigs.filter(j => j.aktif)
  return active.map((jalur, idx) => {
    const key = jalur.nama.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const colors = getJalurColors(jalur.nama, idx)
    const icon = getJalurIcon(jalur.nama)
    const subJalurFilter = getJalurSubFilter(jalur.nama)
    return {
      key,
      label: jalur.nama,
      icon,
      subJalurFilter,
      ...colors,
      description: `Verifikasi pendaftar jalur ${jalur.nama}`,
    }
  })
}

// Type for Lembar Verifikasi config
interface LembarVerifikasiConfig {
  key: string
  label: string
  icon: any
  subJalurFilter: string
  color: string
  bgColor: string
  borderColor: string
  headerBg: string
  iconBg: string
  iconColor: string
  btnColor: string
  description: string
}

function StatBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500 tabular-nums">{count} ({total > 0 ? Math.round((count / total) * 100) : 0}%)</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
        />
      </div>
    </div>
  )
}

// Searchable Kekurangan Verifikasi Dropdown
function KekuranganVerifSelect({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = search
    ? KEKURANGAN_VERIFIKASI_OPTIONS.filter(opt => opt.toLowerCase().includes(search.toLowerCase()))
    : KEKURANGAN_VERIFIKASI_OPTIONS

  // Display short version in the cell (just the number or first 20 chars)
  const displayValue = value || '-'
  const shortDisplay = value
    ? value.length > 18
      ? value.substring(0, 16) + '…'
      : value
    : '-'

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearch('') }}>
      <PopoverTrigger asChild>
        <span
          className="cursor-pointer hover:bg-sky-50 px-1 py-0.5 rounded inline-flex items-center gap-1 group min-h-[24px] text-xs"
          title={displayValue}
        >
          <span className={value ? 'text-gray-800' : 'text-gray-400'}>
            {shortDisplay}
          </span>
          <Pencil className="w-3 h-3 text-gray-300 group-hover:text-sky-500 shrink-0" />
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start" side="bottom">
        <div className="flex items-center border-b px-3 py-2">
          <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
          <input
            placeholder="Cari kategori kekurangan..."
            className="flex-1 text-sm outline-none bg-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
        <div className="max-h-64 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Tidak ditemukan</p>
          ) : (
            filtered.map((opt) => (
              <div
                key={opt}
                className={`px-3 py-1.5 text-xs cursor-pointer hover:bg-sky-50 transition-colors ${
                  value === opt ? 'bg-sky-100 font-medium' : ''
                }`}
                onClick={() => {
                  onChange(opt === value ? '' : opt)
                  setOpen(false)
                  setSearch('')
                }}
              >
                {opt}
              </div>
            ))
          )}
        </div>
        {value && (
          <div className="border-t px-3 py-2">
            <button
              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
              onClick={() => {
                onChange('')
                setOpen(false)
                setSearch('')
              }}
            >
              <XCircle className="w-3 h-3" /> Hapus pilihan
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

// Lembar Verifikasi Sheet Component
function LembarVerifikasiSheet({
  config,
  subJalurOptions,
  onVerify,
  onBulkVerify,
  onViewDetail,
  toast,
}: {
  config: LembarVerifikasiConfig
  subJalurOptions: Array<{ label: string; value: string }>
  onVerify: (id: string, action: 'VERIFIED' | 'REJECTED') => void
  onBulkVerify: (ids: string[], action: 'VERIFIED' | 'REJECTED') => void
  onViewDetail: (reg: Registration) => void
  toast: ReturnType<typeof useToast>['toast']
}) {
  const [data, setData] = useState<LembarVerifikasiData | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [verificationFilter, setVerificationFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const limit = 20
  const [verifying, setVerifying] = useState(false)
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)
  const [bulkVerifyDialogOpen, setBulkVerifyDialogOpen] = useState(false)
  const [verifyAction, setVerifyAction] = useState<'VERIFIED' | 'REJECTED'>('VERIFIED')
  const [verifyNote, setVerifyNote] = useState('')
  const [verifyTargetId, setVerifyTargetId] = useState<string | null>(null)

  // Inline editing state: key = "regId-fieldName"
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Registration | null>(null)
  const [editForm, setEditForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Registration | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleFieldUpdate = async (regId: string, field: string, value: string) => {
    try {
      const res = await fetch(`/api/registrations/${regId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value }),
      })
      const result = await res.json()
      if (result.success) {
        // Update local data
        if (data) {
          setData({
            ...data,
            registrations: data.registrations.map(r =>
              r.id === regId ? { ...r, [field]: value || null } : r
            ),
          })
        }
        toast({ title: 'Tersimpan', description: `Data ${field} berhasil diperbarui` })
      } else {
        toast({ title: 'Gagal', description: result.error || 'Gagal menyimpan', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Gagal', description: 'Terjadi kesalahan', variant: 'destructive' })
    }
  }

  // Update multiple fields at once (e.g. terbitKK + lamaKK)
  const handleMultiFieldUpdate = async (regId: string, fields: Record<string, string>) => {
    try {
      const res = await fetch(`/api/registrations/${regId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      const result = await res.json()
      if (result.success) {
        // Update local data with all fields
        if (data) {
          setData({
            ...data,
            registrations: data.registrations.map(r =>
              r.id === regId ? { ...r, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, v || null])) } : r
            ),
          })
        }
        toast({ title: 'Tersimpan', description: 'Data berhasil diperbarui' })
      } else {
        toast({ title: 'Gagal', description: result.error || 'Gagal menyimpan', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Gagal', description: 'Terjadi kesalahan', variant: 'destructive' })
    }
  }

  const startEditing = (regId: string, field: string, currentValue: string) => {
    setEditingCell(`${regId}-${field}`)
    setEditingValue(currentValue || '')
  }

  const commitEdit = (regId: string, field: string) => {
    handleFieldUpdate(regId, field, editingValue)
    setEditingCell(null)
    setEditingValue('')
  }

  const commitEditDirect = (regId: string, field: string, value: string) => {
    handleFieldUpdate(regId, field, value)
  }

  // Commit terbitKK and auto-calculate lamaKK at once
  const commitTerbitKK = (regId: string, newDate: string) => {
    const calculatedLama = newDate ? hitungLamaKK(newDate) : ''
    // Immediately update local state for instant UI feedback
    if (data) {
      setData({
        ...data,
        registrations: data.registrations.map(r =>
          r.id === regId ? { ...r, terbitKK: newDate || null, lamaKK: calculatedLama || null } : r
        ),
      })
    }
    // Save both fields to backend in one request
    handleMultiFieldUpdate(regId, { terbitKK: newDate, lamaKK: calculatedLama })
    setEditingCell(null)
    setEditingValue('')
  }

  const cancelEdit = () => {
    setEditingCell(null)
    setEditingValue('')
  }

  // Edit dialog functions
  const openEditDialog = (reg: Registration) => {
    setEditTarget(reg)
    setEditForm({
      noRegistrasi: reg.noRegistrasi || '',
      nama: reg.nama || '',
      nisn: reg.nisn || '',
      subJalur: reg.subJalur || '',
      nik: reg.nik || '',
      tanggalLahir: reg.tanggalLahir || '',
      alamat: reg.alamat || '',
      alamatLengkap: reg.alamatLengkap || '',
      noTelpSiswa: reg.noTelpSiswa || '',
      noTelpOrangtua: reg.noTelpOrangtua || '',
      npsnSekolahPilihan: reg.npsnSekolahPilihan || '',
      namaSekolahPilihan: reg.namaSekolahPilihan || '',
      jurusan: reg.jurusan || '',
      npsnSekolahAsal: reg.npsnSekolahAsal || '',
      namaSekolahAsal: reg.namaSekolahAsal || '',
      skorJarak: reg.skorJarak || '',
      skorNilaiRaport: reg.skorNilaiRaport || '',
      kekuranganVerifikasi: reg.kekuranganVerifikasi || '',
      tanggalVerif: reg.tanggalVerif || '',
      jamVerif: reg.jamVerif || '',
      terbitKK: reg.terbitKK || '',
      latitude: reg.latitude || '',
      longitude: reg.longitude || '',
      lokasiJarak: reg.lokasiJarak || '',
      nilaiRataRata: reg.nilaiRataRata || '',
    })
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editTarget) return
    setSaving(true)
    try {
      // Auto-calculate lamaKK when terbitKK is provided
      const updateData = { ...editForm }
      if (updateData.terbitKK) {
        const calculatedLama = hitungLamaKK(updateData.terbitKK)
        if (calculatedLama) updateData['lamaKK'] = calculatedLama
      }

      const res = await fetch(`/api/registrations/${editTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })
      const result = await res.json()
      if (result.success) {
        toast({ title: 'Berhasil', description: `Data ${editTarget.nama} berhasil diperbarui` })
        setEditDialogOpen(false)
        setEditTarget(null)
        fetchData()
      } else {
        toast({ title: 'Gagal', description: result.error || 'Gagal menyimpan', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Gagal', description: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  // Delete dialog functions
  const openDeleteDialog = (reg: Registration) => {
    setDeleteTarget(reg)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/registrations/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      const result = await res.json()
      if (result.success) {
        toast({ title: 'Berhasil', description: `Data ${deleteTarget.nama} berhasil dihapus` })
        setDeleteDialogOpen(false)
        setDeleteTarget(null)
        fetchData()
      } else {
        toast({ title: 'Gagal', description: result.error || 'Gagal menghapus', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Gagal', description: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setDeleting(false)
    }
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', limit.toString())
      params.set('subJalur', config.subJalurFilter)
      if (search) params.set('search', search)
      if (verificationFilter !== 'all') params.set('verificationStatus', verificationFilter)

      const res = await fetch(`/api/registrations?${params}`)
      const result = await res.json()

      const regs: Registration[] = result.data || []
      const pag = result.pagination || { page: 1, limit, total: 0, totalPages: 0 }

      // Calculate stats from current data set
      const statsRes = await fetch('/api/dashboard')
      const statsData = await statsRes.json()

      // Filter stats for this sub jalur
      const jalurNames = config.subJalurFilter.split(',').map(s => s.trim())
      const relevantSubJalurStats = statsData.bySubJalur.filter(
        (item: { name: string; count: number }) => jalurNames.includes(item.name)
      )
      const totalForJalur = relevantSubJalurStats.reduce((acc: number, item: { count: number }) => acc + item.count, 0)

      const relevantVerifiedStats = statsData.verifiedBySubJalur.filter(
        (item: { name: string; count: number }) => jalurNames.includes(item.name)
      )
      const verifiedForJalur = relevantVerifiedStats.reduce((acc: number, item: { count: number }) => acc + item.count, 0)

      const relevantRejectedStats = statsData.rejectedBySubJalur.filter(
        (item: { name: string; count: number }) => jalurNames.includes(item.name)
      )
      const rejectedForJalur = relevantRejectedStats.reduce((acc: number, item: { count: number }) => acc + item.count, 0)

      const pendingForJalur = totalForJalur - verifiedForJalur - rejectedForJalur

      setData({
        registrations: regs,
        pagination: pag,
        stats: {
          total: totalForJalur,
          verified: verifiedForJalur,
          rejected: rejectedForJalur,
          pending: pendingForJalur,
        },
      })
    } catch {
      toast({ title: 'Error', description: 'Gagal memuat data', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [page, search, verificationFilter, config.subJalurFilter, toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleVerify = async () => {
    if (!verifyTargetId) return
    setVerifying(true)
    try {
      const res = await fetch('/api/registrations/verify', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: verifyTargetId,
          verificationStatus: verifyAction,
          verificationNote: verifyNote || undefined,
        }),
      })
      const result = await res.json()
      if (result.success) {
        toast({
          title: verifyAction === 'VERIFIED' ? 'Pendaftar Diterima' : 'Pendaftar Ditolak',
          description: verifyAction === 'VERIFIED' ? 'Data telah diverifikasi dan diterima' : 'Data pendaftar telah ditolak',
        })
        setVerifyDialogOpen(false)
        setVerifyNote('')
        setVerifyTargetId(null)
        fetchData()
      } else {
        toast({ title: 'Gagal', description: result.error || 'Terjadi kesalahan', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Gagal', description: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setVerifying(false)
    }
  }

  const handleBulkVerify = async () => {
    if (selectedIds.size === 0) return
    setVerifying(true)
    try {
      const res = await fetch('/api/registrations/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          verificationStatus: verifyAction,
          verificationNote: verifyNote || undefined,
        }),
      })
      const result = await res.json()
      if (result.success) {
        toast({
          title: verifyAction === 'VERIFIED' ? 'Pendaftar Diterima' : 'Pendaftar Ditolak',
          description: `${result.updated} pendaftar ${verifyAction === 'VERIFIED' ? 'diterima' : 'ditolak'}`,
        })
        setBulkVerifyDialogOpen(false)
        setVerifyNote('')
        setSelectedIds(new Set())
        fetchData()
      } else {
        toast({ title: 'Gagal', description: result.error || 'Terjadi kesalahan', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Gagal', description: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setVerifying(false)
    }
  }

  const toggleSelectAll = () => {
    if (!data) return
    if (selectedIds.size === data.registrations.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(data.registrations.map(r => r.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const Icon = config.icon
  const s = data?.stats || { total: 0, verified: 0, rejected: 0, pending: 0 }
  const verifiedPct = s.total > 0 ? Math.round((s.verified / s.total) * 100) : 0
  const rejectedPct = s.total > 0 ? Math.round((s.rejected / s.total) * 100) : 0
  const pendingPct = s.total > 0 ? Math.round((s.pending / s.total) * 100) : 0
  const progressPct = s.total > 0 ? Math.round(((s.verified + s.rejected) / s.total) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className={`${config.borderColor} border-l-4 shadow-sm hover:shadow-md transition-shadow`}>
        <CardContent className="p-3 sm:p-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`p-2 sm:p-3 ${config.iconBg} rounded-lg sm:rounded-xl shadow-sm`}>
              <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${config.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-xl font-bold text-gray-900">Lembar Verifikasi: {config.label}</h3>
                {config.subCategories && (
                  <div className="flex gap-1">
                    {config.subCategories.map(sub => (
                      <Badge key={sub} variant="outline" className={SUB_JALUR_COLORS[sub] || 'bg-gray-100 text-gray-800 border-gray-200'}>
                        {sub}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{config.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <Card className={`${config.bgColor} shadow-sm hover:shadow-md transition-shadow`}>
          <CardContent className="p-2.5 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-sm text-gray-500">Total Pendaftar</p>
                <p className="text-lg sm:text-2xl font-bold">{s.total}</p>
              </div>
              <div className={`p-1.5 sm:p-2.5 ${config.iconBg} rounded-lg sm:rounded-xl shadow-sm`}>
                <Users className={`w-4 h-4 sm:w-5 sm:h-5 ${config.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50/50 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-2.5 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-sm text-gray-500">Menunggu</p>
                <p className="text-lg sm:text-2xl font-bold text-yellow-600">{s.pending}</p>
              </div>
              <div className="p-1.5 sm:p-2.5 bg-amber-100 rounded-lg sm:rounded-xl shadow-sm">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50/50 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-2.5 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-sm text-gray-500">Diterima</p>
                <p className="text-lg sm:text-2xl font-bold text-emerald-600">{s.verified}</p>
              </div>
              <div className="p-1.5 sm:p-2.5 bg-emerald-100 rounded-lg sm:rounded-xl shadow-sm">
                <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-rose-50/50 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-2.5 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-sm text-gray-500">Ditolak</p>
                <p className="text-lg sm:text-2xl font-bold text-red-600">{s.rejected}</p>
              </div>
              <div className="p-1.5 sm:p-2.5 bg-red-100 rounded-lg sm:rounded-xl shadow-sm">
                <UserX className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progres Verifikasi {config.label}</span>
            <span className="text-sm text-gray-500">{progressPct}% selesai</span>
          </div>
          <Progress value={progressPct} className="h-3" />
          <div className="flex justify-between mt-2 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-gray-600">Diterima: {s.verified} ({verifiedPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-gray-600">Ditolak: {s.rejected} ({rejectedPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <span className="text-gray-600">Menunggu: {s.pending} ({pendingPct}%)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari nama, no. registrasi, atau NISN..."
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <Select
              value={verificationFilter}
              onValueChange={(v) => {
                setVerificationFilter(v)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status Verifikasi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="PENDING">Menunggu</SelectItem>
                <SelectItem value="VERIFIED">Diterima</SelectItem>
                <SelectItem value="REJECTED">Ditolak</SelectItem>
              </SelectContent>
            </Select>
            {selectedIds.size > 0 && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    setVerifyAction('VERIFIED')
                    setBulkVerifyDialogOpen(true)
                  }}
                >
                  <ThumbsUp className="w-4 h-4" />
                  Terima ({selectedIds.size})
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setVerifyAction('REJECTED')
                    setBulkVerifyDialogOpen(true)
                  }}
                >
                  <ThumbsDown className="w-4 h-4" />
                  Tolak ({selectedIds.size})
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedIds(new Set())}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Verification Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-white">
                <TableRow className={config.headerBg}>
                  <TableHead className="w-10 text-center">No</TableHead>
                  <TableHead className="w-10 text-center">
                    <Checkbox
                      checked={data ? data.registrations.length > 0 && selectedIds.size === data.registrations.length : false}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Skor Jarak</TableHead>
                  <TableHead>Skor Nilai Raport</TableHead>
                  <TableHead>Kekurangan Verifikasi</TableHead>
                  <TableHead>Tanggal Verif</TableHead>
                  <TableHead>Jam Verif</TableHead>
                  <TableHead>Terbit KK</TableHead>
                  <TableHead>Lama KK</TableHead>
                  <TableHead>No. Registrasi</TableHead>
                  <TableHead>Nama Peserta</TableHead>
                  <TableHead>Asal Sekolah</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={14} className="text-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                      <p className="text-sm text-gray-400 mt-2">Memuat data...</p>
                    </TableCell>
                  </TableRow>
                ) : !data || data.registrations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={14} className="text-center py-12">
                      <Icon className={`w-10 h-10 mx-auto text-gray-300 mb-2`} />
                      <p className="text-gray-500 font-medium">Belum ada data pendaftar {config.label}</p>
                      <p className="text-sm text-gray-400">Import CSV untuk memulai verifikasi</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.registrations.map((reg, idx) => (
                    <TableRow key={reg.id} className={
                      reg.verificationStatus === 'VERIFIED' ? 'bg-emerald-50/40' :
                      reg.verificationStatus === 'REJECTED' ? 'bg-red-50/40' : ''
                    }>
                      {/* No */}
                      <TableCell className="text-center text-sm text-gray-500">
                        {(data.pagination.page - 1) * data.pagination.limit + idx + 1}
                      </TableCell>
                      {/* Checkbox */}
                      <TableCell className="text-center">
                        <Checkbox checked={selectedIds.has(reg.id)} onCheckedChange={() => toggleSelect(reg.id)} />
                      </TableCell>
                      {/* Skor Jarak */}
                      <TableCell className="text-sm text-center">
                        {reg.skorJarak || '-'}
                      </TableCell>
                      {/* Skor Nilai Raport */}
                      <TableCell className="text-sm text-center">
                        {editingCell === `${reg.id}-skorNilaiRaport` ? (
                          <input
                            type="text"
                            className="w-20 px-1.5 py-0.5 text-sm border border-sky-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => commitEdit(reg.id, 'skorNilaiRaport')}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitEdit(reg.id, 'skorNilaiRaport')
                              if (e.key === 'Escape') cancelEdit()
                            }}
                            autoFocus
                          />
                        ) : (
                          <span
                            className="cursor-pointer hover:bg-sky-50 px-1 py-0.5 rounded inline-flex items-center gap-1 group"
                            onClick={() => startEditing(reg.id, 'skorNilaiRaport', reg.skorNilaiRaport || reg.nilaiRataRata || '')}
                          >
                            {reg.skorNilaiRaport || reg.nilaiRataRata || '-'}
                            <Pencil className="w-3 h-3 text-gray-300 group-hover:text-sky-500" />
                          </span>
                        )}
                      </TableCell>
                      {/* Kekurangan Verifikasi - Searchable Dropdown */}
                      <TableCell className="text-sm">
                        <KekuranganVerifSelect
                          value={reg.kekuranganVerifikasi || ''}
                          onChange={(val) => commitEditDirect(reg.id, 'kekuranganVerifikasi', val)}
                        />
                      </TableCell>
                      {/* Tanggal Verif */}
                      <TableCell className="text-sm">
                        {editingCell === `${reg.id}-tanggalVerif` ? (
                          <input
                            type="date"
                            className="w-32 px-1.5 py-0.5 text-sm border border-sky-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => commitEdit(reg.id, 'tanggalVerif')}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitEdit(reg.id, 'tanggalVerif')
                              if (e.key === 'Escape') cancelEdit()
                            }}
                            autoFocus
                          />
                        ) : (
                          <span
                            className="cursor-pointer hover:bg-sky-50 px-1 py-0.5 rounded inline-flex items-center gap-1 group"
                            onClick={() => startEditing(reg.id, 'tanggalVerif', reg.tanggalVerif || '')}
                          >
                            {reg.tanggalVerif || '-'}
                            <Pencil className="w-3 h-3 text-gray-300 group-hover:text-sky-500" />
                          </span>
                        )}
                      </TableCell>
                      {/* Jam Verif */}
                      <TableCell className="text-sm">
                        {editingCell === `${reg.id}-jamVerif` ? (
                          <input
                            type="time"
                            className="w-24 px-1.5 py-0.5 text-sm border border-sky-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => commitEdit(reg.id, 'jamVerif')}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitEdit(reg.id, 'jamVerif')
                              if (e.key === 'Escape') cancelEdit()
                            }}
                            autoFocus
                          />
                        ) : (
                          <span
                            className="cursor-pointer hover:bg-sky-50 px-1 py-0.5 rounded inline-flex items-center gap-1 group"
                            onClick={() => startEditing(reg.id, 'jamVerif', reg.jamVerif || '')}
                          >
                            {reg.jamVerif || '-'}
                            <Pencil className="w-3 h-3 text-gray-300 group-hover:text-sky-500" />
                          </span>
                        )}
                      </TableCell>
                      {/* Terbit KK */}
                      <TableCell className="text-sm">
                        {editingCell === `${reg.id}-terbitKK` ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="date"
                              className="w-28 px-1.5 py-0.5 text-sm border border-sky-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                              value={editingValue}
                              onChange={(e) => {
                                setEditingValue(e.target.value)
                              }}
                              onBlur={() => {
                                // Small delay to allow clear button click to register
                                setTimeout(() => {
                                  if (editingCell === `${reg.id}-terbitKK`) {
                                    commitTerbitKK(reg.id, editingValue)
                                  }
                                }, 150)
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  commitTerbitKK(reg.id, editingValue)
                                }
                                if (e.key === 'Escape') cancelEdit()
                              }}
                              autoFocus
                            />
                            <button
                              type="button"
                              className="p-0.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                              title="Kosongkan tanggal"
                              onMouseDown={(e) => {
                                e.preventDefault() // Prevent blur from firing on the date input
                                commitTerbitKK(reg.id, '')
                              }}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span
                            className="cursor-pointer hover:bg-sky-50 px-1 py-0.5 rounded inline-flex items-center gap-1 group"
                            onClick={() => startEditing(reg.id, 'terbitKK', reg.terbitKK || '')}
                          >
                            {reg.terbitKK || '-'}
                            <Pencil className="w-3 h-3 text-gray-300 group-hover:text-sky-500" />
                          </span>
                        )}
                      </TableCell>
                      {/* Lama KK - Auto-calculated from Terbit KK */}
                      <TableCell className="text-sm">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${
                            !reg.terbitKK ? 'text-gray-400' :
                            isKKKurangSetahun(reg.terbitKK)
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                          title={reg.terbitKK ? `Terbit: ${reg.terbitKK}` : undefined}
                        >
                          {reg.terbitKK ? (
                            <>
                              <CalendarClock className="w-3 h-3" />
                              {reg.lamaKK || hitungLamaKK(reg.terbitKK) || '-'}
                            </>
                          ) : '-'}
                        </span>
                      </TableCell>
                      {/* No. Registrasi */}
                      <TableCell className="font-mono text-sm">{reg.noRegistrasi}</TableCell>
                      {/* Nama Peserta */}
                      <TableCell className="font-medium text-sm">{reg.nama}</TableCell>
                      {/* Asal Sekolah */}
                      <TableCell className="text-sm text-gray-600">{reg.namaSekolahAsal}</TableCell>
                      {/* Status */}
                      <TableCell>
                        <Badge variant="outline" className={STATUS_COLORS[reg.verificationStatus]}>
                          {reg.verificationStatus === 'PENDING' && <Clock className="w-3 h-3" />}
                          {reg.verificationStatus === 'VERIFIED' && <CheckCircle2 className="w-3 h-3" />}
                          {reg.verificationStatus === 'REJECTED' && <XCircle className="w-3 h-3" />}
                          {reg.verificationStatus === 'PENDING' ? 'Menunggu' :
                           reg.verificationStatus === 'VERIFIED' ? 'Diterima' : 'Ditolak'}
                        </Badge>
                      </TableCell>
                      {/* Aksi */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => onViewDetail(reg)} title="Lihat Detail">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-white hover:bg-blue-600" title="Edit Data" onClick={() => openEditDialog(reg)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-white hover:bg-red-600" title="Hapus Data" onClick={() => openDeleteDialog(reg)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          {reg.verificationStatus !== 'VERIFIED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-emerald-600 hover:text-white hover:bg-emerald-600"
                              title="Terima Pendaftar"
                              onClick={() => {
                                setVerifyTargetId(reg.id)
                                setVerifyAction('VERIFIED')
                                setVerifyNote('')
                                setVerifyDialogOpen(true)
                              }}
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </Button>
                          )}
                          {reg.verificationStatus !== 'REJECTED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-white hover:bg-red-600"
                              title="Tolak Pendaftar"
                              onClick={() => {
                                setVerifyTargetId(reg.id)
                                setVerifyAction('REJECTED')
                                setVerifyNote('')
                                setVerifyDialogOpen(true)
                              }}
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </Button>
                          )}
                          {reg.verificationStatus === 'VERIFIED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-yellow-600 hover:text-white hover:bg-yellow-500"
                              title="Kembalikan ke Menunggu"
                              onClick={() => {
                                setVerifyTargetId(reg.id)
                                setVerifyAction('REJECTED')
                                setVerifyNote('')
                                setVerifyDialogOpen(true)
                              }}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          )}
                          {reg.verificationStatus === 'REJECTED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-emerald-600 hover:text-white hover:bg-emerald-600"
                              title="Terima Ulang"
                              onClick={() => {
                                setVerifyTargetId(reg.id)
                                setVerifyAction('VERIFIED')
                                setVerifyNote('')
                                setVerifyDialogOpen(true)
                              }}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-gray-500">
                Menampilkan {(data.pagination.page - 1) * data.pagination.limit + 1}-
                {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} dari {data.pagination.total} pendaftar
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600">Hal {page} / {data.pagination.totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= data.pagination.totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Single Verify Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
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
                ? `Apakah Anda yakin ingin MENERIMA pendaftar ini di jalur ${config.label}?`
                : `Apakah Anda yakin ingin MENOLAK pendaftar ini di jalur ${config.label}?`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {verifyAction === 'REJECTED' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Perhatian!</p>
                    <p className="text-sm text-red-700">Pendaftar yang ditolak tetap dapat diterima kembali nanti.</p>
                  </div>
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                {verifyAction === 'VERIFIED' ? 'Catatan Verifikasi' : 'Alasan Penolakan'}
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
            <Button variant="outline" onClick={() => setVerifyDialogOpen(false)}>Batal</Button>
            <Button
              onClick={handleVerify}
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

      {/* Bulk Verify Dialog */}
      <Dialog open={bulkVerifyDialogOpen} onOpenChange={setBulkVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {verifyAction === 'VERIFIED' ? (
                <><ThumbsUp className="w-5 h-5 text-emerald-600" /> Terima {selectedIds.size} Pendaftar</>
              ) : (
                <><ThumbsDown className="w-5 h-5 text-red-600" /> Tolak {selectedIds.size} Pendaftar</>
              )}
            </DialogTitle>
            <DialogDescription>
              {verifyAction === 'VERIFIED'
                ? `Terima ${selectedIds.size} pendaftar jalur ${config.label} yang dipilih?`
                : `Tolak ${selectedIds.size} pendaftar jalur ${config.label} yang dipilih?`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {verifyAction === 'REJECTED' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Perhatian!</p>
                    <p className="text-sm text-red-700">Pendaftar yang ditolak tetap dapat diterima kembali nanti.</p>
                  </div>
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                {verifyAction === 'VERIFIED' ? 'Catatan Verifikasi' : 'Alasan Penolakan'}
              </label>
              <Textarea
                placeholder={verifyAction === 'VERIFIED' ? 'Catatan untuk semua pendaftar (opsional)...' : 'Alasan penolakan untuk semua...'}
                value={verifyNote}
                onChange={(e) => setVerifyNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkVerifyDialogOpen(false)}>Batal</Button>
            <Button
              onClick={handleBulkVerify}
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-blue-600" /> Edit Data Pendaftar
            </DialogTitle>
            <DialogDescription>
              Edit data pendaftar <span className="font-semibold">{editTarget?.nama}</span> ({editTarget?.noRegistrasi})
            </DialogDescription>
          </DialogHeader>
          {editTarget && (
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
                      <Select value={editForm.kekuranganVerifikasi || ''} onValueChange={v => setEditForm({...editForm, kekuranganVerifikasi: v === '__none__' ? '' : v})}>
                        <SelectTrigger><SelectValue placeholder="Pilih kekurangan verifikasi" /></SelectTrigger>
                        <SelectContent className="max-h-64">
                          <SelectItem value="__none__">- Tidak Ada -</SelectItem>
                          {KEKURANGAN_VERIFIKASI_OPTIONS.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSaveEdit} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : <><Pencil className="w-4 h-4" /> Simpan</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" /> Hapus Data Pendaftar
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus data pendaftar <span className="font-semibold">{deleteTarget?.nama}</span>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">Data yang sudah dihapus tidak dapat dikembalikan. Pastikan Anda yakin sebelum melanjutkan.</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Menghapus...</> : <><Trash2 className="w-4 h-4" /> Hapus</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function Home() {
  const { toast } = useToast()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0,
  })

  // Filters
  const [search, setSearch] = useState('')
  const [subJalurFilter, setSubJalurFilter] = useState('all')
  const [verificationFilter, setVerificationFilter] = useState('all')
  const [jurusanFilter, setJurusanFilter] = useState('all')

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Dialogs
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [bulkVerifyDialogOpen, setBulkVerifyDialogOpen] = useState(false)

  // Verify dialog state
  const [verifyAction, setVerifyAction] = useState<'VERIFIED' | 'REJECTED'>('VERIFIED')
  const [verifyNote, setVerifyNote] = useState('')
  const [verifyTargetId, setVerifyTargetId] = useState<string | null>(null)

  // Detail dialog state
  const [detailTarget, setDetailTarget] = useState<Registration | null>(null)

  // Loading states
  const [importing, setImporting] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [loading, setLoading] = useState(false)

  // CSV file
  const [csvFile, setCsvFile] = useState<File | null>(null)

  // Active tab
  const [activeTab, setActiveTab] = useState('dashboard')

  // Lembar verifikasi sub-tab
  const [lembarTab, setLembarTab] = useState('')

  // Edit dialog state (Home component)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Registration | null>(null)
  const [editForm, setEditForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  // Delete dialog state (Home component)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Registration | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Report filter state
  const [diterimaFilterJalur, setDiterimaFilterJalur] = useState('all')
  const [diterimaFilterSekolah, setDiterimaFilterSekolah] = useState('all')
  const [ditolakFilterJalur, setDitolakFilterJalur] = useState('all')

  // Portal paste state
  const [portalPasteOpen, setPortalPasteOpen] = useState(false)
  const [portalRawText, setPortalRawText] = useState('')
  const [portalParsedData, setPortalParsedData] = useState<Record<string, string> | null>(null)
  const [portalParsing, setPortalParsing] = useState(false)
  const [portalSelectedJalur, setPortalSelectedJalur] = useState('') // jalur config nama selected in paste portal

  // Pengaturan state
  const [kuota, setKuota] = useState(0)
  const [jalurConfigs, setJalurConfigs] = useState<Array<{ id: string; nama: string; persentase: number; urutan: number; aktif: boolean }>>([])
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [newJalurNama, setNewJalurNama] = useState('')
  const [newJalurPersentase, setNewJalurPersentase] = useState(0)
  const [addJalurOpen, setAddJalurOpen] = useState(false)

  // Build lembar verifikasi from jalurConfigs (must be after jalurConfigs declaration)
  const lembarVerifikasi = buildLembarVerifikasi(jalurConfigs)

  // Available subJalur options for dropdowns (derived from jalurConfigs)
  const subJalurOptions = jalurConfigs
    .filter(j => j.aktif)
    .map(j => {
      // Map jalur nama to the subJalur value used in data
      const filter = getJalurSubFilter(j.nama)
      return { label: j.nama, value: filter }
    })

  // Auto-set lembarTab to first tab when configs load
  useEffect(() => {
    if (jalurConfigs.length > 0 && !lembarTab) {
      const firstKey = lembarVerifikasi[0]?.key
      if (firstKey) setLembarTab(firstKey)
    }
  }, [jalurConfigs, lembarTab, lembarVerifikasi])

  // Portal Sync state
  const [portalSyncOpen, setPortalSyncOpen] = useState(false)
  const [portalSyncEmail, setPortalSyncEmail] = useState('')
  const [portalSyncPassword, setPortalSyncPassword] = useState('')
  const [portalSyncStatus, setPortalSyncStatus] = useState('accepted')
  const [portalSyncPages, setPortalSyncPages] = useState(10)
  const [portalSyncing, setPortalSyncing] = useState(false)
  const [portalSyncResult, setPortalSyncResult] = useState<{ success: boolean; message: string; created?: number; updated?: number; unchanged?: number; total?: number } | null>(null)

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
    setImporting(true)
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
        setPortalPasteOpen(false)
        setPortalRawText('')
        setPortalParsedData(null)
        setPortalSelectedJalur('')
        fetchRegistrations()
        fetchStats()
      } else {
        toast({ title: 'Gagal', description: data.error || 'Terjadi kesalahan', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Gagal', description: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setImporting(false)
    }
  }

  const fetchRegistrations = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', pagination.page.toString())
      params.set('limit', pagination.limit.toString())
      if (search) params.set('search', search)
      if (subJalurFilter !== 'all') params.set('subJalur', subJalurFilter)
      if (verificationFilter !== 'all') params.set('verificationStatus', verificationFilter)
      if (jurusanFilter !== 'all') params.set('jurusan', jurusanFilter)

      const res = await fetch(`/api/registrations?${params}`)
      const data = await res.json()
      setRegistrations(data.data || [])
      setPagination(prev => ({ ...prev, ...data.pagination }))
    } catch {
      toast({ title: 'Error', description: 'Gagal memuat data pendaftar', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, search, subJalurFilter, verificationFilter, jurusanFilter, toast])

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard')
      const data = await res.json()
      setStats(data)
    } catch {
      toast({ title: 'Error', description: 'Gagal memuat statistik', variant: 'destructive' })
    }
  }, [toast])

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true)
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      setKuota(data.kuota || 0)
      setJalurConfigs(data.jalurConfigs || [])
    } catch {
      toast({ title: 'Error', description: 'Gagal memuat pengaturan', variant: 'destructive' })
    } finally {
      setSettingsLoading(false)
    }
  }, [toast])

  // Save kuota
  const saveKuota = async () => {
    setSettingsSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kuota }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Tersimpan', description: `Kuota siswa: ${kuota}` })
      }
    } catch {
      toast({ title: 'Gagal', description: 'Gagal menyimpan kuota', variant: 'destructive' })
    } finally {
      setSettingsSaving(false)
    }
  }

  // Update jalur persentase
  const updateJalurPersentase = async (id: string, persentase: number) => {
    try {
      const res = await fetch('/api/settings/jalur', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, persentase }),
      })
      const data = await res.json()
      if (data.success) {
        setJalurConfigs(prev => prev.map(j => j.id === id ? { ...j, persentase } : j))
      }
    } catch {
      toast({ title: 'Gagal', description: 'Gagal memperbarui persentase', variant: 'destructive' })
    }
  }

  // Add new jalur
  const addJalur = async () => {
    if (!newJalurNama.trim()) {
      toast({ title: 'Gagal', description: 'Nama jalur wajib diisi', variant: 'destructive' })
      return
    }
    try {
      const res = await fetch('/api/settings/jalur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: newJalurNama.trim(), persentase: newJalurPersentase }),
      })
      const data = await res.json()
      if (data.success) {
        setJalurConfigs(prev => [...prev, data.data])
        setNewJalurNama('')
        setNewJalurPersentase(0)
        setAddJalurOpen(false)
        toast({ title: 'Berhasil', description: `Jalur "${data.data.nama}" berhasil ditambahkan` })
      } else {
        toast({ title: 'Gagal', description: data.error || 'Gagal menambah jalur', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Gagal', description: 'Gagal menambah jalur', variant: 'destructive' })
    }
  }

  // Delete jalur
  const deleteJalur = async (id: string, nama: string) => {
    if (!confirm(`Hapus jalur "${nama}"?`)) return
    try {
      const res = await fetch(`/api/settings/jalur?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setJalurConfigs(prev => prev.filter(j => j.id !== id))
        toast({ title: 'Berhasil', description: data.message })
      } else {
        toast({ title: 'Gagal', description: data.error || 'Gagal menghapus jalur', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Gagal', description: 'Gagal menghapus jalur', variant: 'destructive' })
    }
  }

  // Toggle jalur aktif
  const toggleJalurAktif = async (id: string, aktif: boolean) => {
    try {
      const res = await fetch('/api/settings/jalur', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, aktif }),
      })
      const data = await res.json()
      if (data.success) {
        setJalurConfigs(prev => prev.map(j => j.id === id ? { ...j, aktif } : j))
      }
    } catch {
      toast({ title: 'Gagal', description: 'Gagal mengubah status jalur', variant: 'destructive' })
    }
  }

  // Portal Sync function
  const handlePortalSync = async () => {
    if (!portalSyncEmail.trim() || !portalSyncPassword.trim()) {
      toast({ title: 'Gagal', description: 'Email dan password portal wajib diisi', variant: 'destructive' })
      return
    }
    setPortalSyncing(true)
    setPortalSyncResult(null)
    try {
      const res = await fetch('/api/portal-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: portalSyncEmail.trim(),
          password: portalSyncPassword,
          pages: portalSyncPages,
          status: portalSyncStatus,
        }),
      })
      const data = await res.json()
      if (data.error) {
        setPortalSyncResult({ success: false, message: data.error })
        toast({ title: 'Gagal', description: data.error, variant: 'destructive' })
      } else {
        setPortalSyncResult({
          success: true,
          message: data.message,
          created: data.created,
          updated: data.updated,
          unchanged: data.unchanged,
          total: data.total,
        })
        toast({
          title: '✅ Sinkronisasi Berhasil',
          description: data.message,
        })
        fetchRegistrations()
        fetchStats()
      }
    } catch {
      const errMsg = 'Terjadi kesalahan saat sinkronisasi'
      setPortalSyncResult({ success: false, message: errMsg })
      toast({ title: 'Gagal', description: errMsg, variant: 'destructive' })
    } finally {
      setPortalSyncing(false)
    }
  }

  useEffect(() => {
    fetchRegistrations()
  }, [fetchRegistrations])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const parseCSVClientSide = (text: string) => {
    const lines = text.trim().split('\n')
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim())
    const rows: Record<string, string>[] = []

    for (let i = 1; i < lines.length; i++) {
      const values: string[] = []
      let current = ''
      let inQuotes = false

      for (const char of lines[i]) {
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      values.push(current.trim())

      if (values.length === headers.length) {
        const row: Record<string, string> = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        rows.push(row)
      }
    }

    return rows
  }

  const handleImport = async () => {
    if (!csvFile) return

    setImporting(true)
    try {
      const text = await csvFile.text()
      const csvRows = parseCSVClientSide(text)

      if (csvRows.length === 0) {
        throw new Error('File CSV kosong atau format tidak valid')
      }

      const mappedRows = csvRows.map(row => ({
        noRegistrasi: row['No.Registrasi'] || '',
        nama: row['Nama'] || '',
        nisn: row['NISN'] || '',
        subJalur: row['Sub Jalur'] || '',
        npsnSekolahPilihan: row['NPSN Sekolah Pilihan'] || '',
        namaSekolahPilihan: row['Nama Sekolah Pilihan'] || '',
        jurusan: row['Jurusan'] || '',
        npsnSekolahAsal: row['NPSN Sekolah Asal'] || '',
        namaSekolahAsal: row['Nama Sekolah Asal'] || '',
        status: row['Status'] || 'ON PROGRESS',
        waktuDaftar: row['Waktu Daftar'] || '',
      }))

      const importRes = await fetch('/api/registrations/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: mappedRows }),
      })

      const importData = await importRes.json()

      if (importData.success) {
        const createdCount = importData.created || 0
        const updatedCount = importData.updated || 0
        const skippedCount = importData.skipped || 0
        toast({
          title: 'Import Berhasil',
          description: `${createdCount} data baru, ${updatedCount} data diperbarui, ${skippedCount} dilewati`,
        })
        setImportDialogOpen(false)
        setCsvFile(null)
        fetchRegistrations()
        fetchStats()
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

  const handleVerify = async () => {
    if (!verifyTargetId) return

    setVerifying(true)
    try {
      const res = await fetch('/api/registrations/verify', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: verifyTargetId,
          verificationStatus: verifyAction,
          verificationNote: verifyNote || undefined,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: verifyAction === 'VERIFIED' ? 'Pendaftar Diterima' : 'Pendaftar Ditolak',
          description: verifyAction === 'VERIFIED'
            ? 'Data pendaftar telah diverifikasi dan diterima'
            : 'Data pendaftar telah ditolak',
        })
        setVerifyDialogOpen(false)
        setVerifyNote('')
        setVerifyTargetId(null)
        fetchRegistrations()
        fetchStats()
      } else {
        toast({
          title: 'Verifikasi Gagal',
          description: data.error || 'Terjadi kesalahan',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Verifikasi Gagal',
        description: 'Terjadi kesalahan',
        variant: 'destructive',
      })
    } finally {
      setVerifying(false)
    }
  }

  const handleBulkVerify = async () => {
    if (selectedIds.size === 0) return

    setVerifying(true)
    try {
      const res = await fetch('/api/registrations/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          verificationStatus: verifyAction,
          verificationNote: verifyNote || undefined,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: verifyAction === 'VERIFIED' ? 'Pendaftar Diterima' : 'Pendaftar Ditolak',
          description: `${data.updated} pendaftar ${verifyAction === 'VERIFIED' ? 'diterima' : 'ditolak'}`,
        })
        setBulkVerifyDialogOpen(false)
        setVerifyNote('')
        setSelectedIds(new Set())
        fetchRegistrations()
        fetchStats()
      } else {
        toast({
          title: 'Verifikasi Gagal',
          description: data.error || 'Terjadi kesalahan',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Verifikasi Gagal',
        description: 'Terjadi kesalahan',
        variant: 'destructive',
      })
    } finally {
      setVerifying(false)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === registrations.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(registrations.map(r => r.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedIds(next)
  }

  const verificationPercent = stats
    ? stats.total > 0
      ? Math.round(((stats.verified + stats.rejected) / stats.total) * 100)
      : 0
    : 0

  const verifiedPercent = stats && stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0
  const rejectedPercent = stats && stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0
  const pendingPercent = stats && stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0

  // Get pending count per lembar verifikasi for badges
  const getPendingForLembar = (subJalurFilter: string) => {
    if (!stats) return 0
    const jalurNames = subJalurFilter.split(',').map(s => s.trim())
    const relevantPending = stats.bySubJalur
      .filter(item => jalurNames.includes(item.name))
      .reduce((acc, item) => {
        const verified = stats.verifiedBySubJalur.find(v => v.name === item.name)?.count || 0
        const rejected = stats.rejectedBySubJalur.find(r => r.name === item.name)?.count || 0
        return acc + item.count - verified - rejected
      }, 0)
    return relevantPending
  }

  const handleViewDetail = (reg: Registration) => {
    setDetailTarget(reg)
    setDetailDialogOpen(true)
  }

  // Edit dialog functions (Home component)
  const openEditDialog = (reg: Registration) => {
    setEditTarget(reg)
    setEditForm({
      noRegistrasi: reg.noRegistrasi || '',
      nama: reg.nama || '',
      nisn: reg.nisn || '',
      subJalur: reg.subJalur || '',
      nik: reg.nik || '',
      tanggalLahir: reg.tanggalLahir || '',
      alamat: reg.alamat || '',
      alamatLengkap: reg.alamatLengkap || '',
      noTelpSiswa: reg.noTelpSiswa || '',
      noTelpOrangtua: reg.noTelpOrangtua || '',
      npsnSekolahPilihan: reg.npsnSekolahPilihan || '',
      namaSekolahPilihan: reg.namaSekolahPilihan || '',
      jurusan: reg.jurusan || '',
      npsnSekolahAsal: reg.npsnSekolahAsal || '',
      namaSekolahAsal: reg.namaSekolahAsal || '',
      skorJarak: reg.skorJarak || '',
      skorNilaiRaport: reg.skorNilaiRaport || '',
      kekuranganVerifikasi: reg.kekuranganVerifikasi || '',
      tanggalVerif: reg.tanggalVerif || '',
      jamVerif: reg.jamVerif || '',
      terbitKK: reg.terbitKK || '',
      latitude: reg.latitude || '',
      longitude: reg.longitude || '',
      lokasiJarak: reg.lokasiJarak || '',
      nilaiRataRata: reg.nilaiRataRata || '',
    })
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editTarget) return
    setSaving(true)
    try {
      const updateData = { ...editForm }
      if (updateData.terbitKK) {
        const calculatedLama = hitungLamaKK(updateData.terbitKK)
        if (calculatedLama) updateData['lamaKK'] = calculatedLama
      }
      const res = await fetch(`/api/registrations/${editTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })
      const result = await res.json()
      if (result.success) {
        toast({ title: 'Berhasil', description: `Data ${editTarget.nama} berhasil diperbarui` })
        setEditDialogOpen(false)
        setEditTarget(null)
        fetchRegistrations()
        fetchStats()
      } else {
        toast({ title: 'Gagal', description: result.error || 'Gagal menyimpan', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Gagal', description: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  // Delete dialog functions (Home component)
  const openDeleteDialog = (reg: Registration) => {
    setDeleteTarget(reg)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/registrations/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      const result = await res.json()
      if (result.success) {
        toast({ title: 'Berhasil', description: `Data ${deleteTarget.nama} berhasil dihapus` })
        setDeleteDialogOpen(false)
        setDeleteTarget(null)
        fetchRegistrations()
        fetchStats()
      } else {
        toast({ title: 'Gagal', description: result.error || 'Gagal menghapus', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Gagal', description: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setDeleting(false)
    }
  }

  // Print report function
  const handlePrintReport = (type: 'diterima' | 'ditolak') => {
    const list = type === 'diterima' ? stats?.verifiedList || [] : stats?.rejectedList || []
    const title = type === 'diterima' ? 'LAPORAN PESERTA DITERIMA' : 'LAPORAN PESERTA DITOLAK'
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const rows = list.map((reg, idx) => `
      <tr>
        <td style="padding:6px 8px;border:1px solid #ddd;text-align:center">${idx + 1}</td>
        <td style="padding:6px 8px;border:1px solid #ddd">${reg.noRegistrasi}</td>
        <td style="padding:6px 8px;border:1px solid #ddd">${reg.nama}</td>
        <td style="padding:6px 8px;border:1px solid #ddd">${reg.nisn}</td>
        <td style="padding:6px 8px;border:1px solid #ddd">${reg.subJalur}</td>
        <td style="padding:6px 8px;border:1px solid #ddd">${reg.namaSekolahPilihan}</td>
        <td style="padding:6px 8px;border:1px solid #ddd">${reg.jurusan}</td>
        <td style="padding:6px 8px;border:1px solid #ddd">${reg.tanggalVerif || '-'}</td>
        ${type === 'ditolak' ? `<td style="padding:6px 8px;border:1px solid #ddd">${reg.verificationNote || '-'}</td>` : ''}
      </tr>
    `).join('')
    printWindow.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
      <style>body{font-family:Arial,sans-serif;margin:20px}table{width:100%;border-collapse:collapse}th{background:#f5f5f5;padding:8px;border:1px solid #ddd;text-align:left}h1{text-align:center;font-size:18px}h2{text-align:center;font-size:14px;color:#666}</style></head>
      <body><h1>${title}</h1><h2>SPMB 2026</h2><p style="text-align:center;color:#888">Dicetak pada: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      <table><thead><tr><th>No</th><th>No. Registrasi</th><th>Nama</th><th>NISN</th><th>Sub Jalur</th><th>Sekolah Pilihan</th><th>Jurusan</th><th>Tanggal Verif</th>${type === 'ditolak' ? '<th>Alasan Penolakan</th>' : ''}</tr></thead><tbody>${rows}</tbody></table></body></html>`)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50/30">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900 border-b border-emerald-400/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-18">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-600 text-white ring-2 ring-emerald-400/30 shadow-lg shadow-emerald-500/20">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-white tracking-tight">SPMB 2026</h1>
                <p className="text-[10px] sm:text-xs text-emerald-200 hidden xs:block">Sistem Verifikasi Pendaftaran</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                onClick={() => setPortalPasteOpen(true)}
                variant="outline"
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 h-8 sm:h-9 px-2 sm:px-3"
              >
                <ClipboardPaste className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Paste Portal</span>
              </Button>
              <Button
                onClick={() => setImportDialogOpen(true)}
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 h-8 sm:h-9 px-2 sm:px-3"
              >
                <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Import CSV</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Mobile: scrollable horizontal tabs, Desktop: wrap */}
          <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
            <TabsList className="flex-nowrap sm:flex-wrap bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl p-1 shadow-sm w-max sm:w-auto">
              <TabsTrigger value="dashboard" className="gap-1 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm transition-all duration-200 data-[state=active]:shadow-sm whitespace-nowrap">
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="lembar-verifikasi" className="gap-1 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm transition-all duration-200 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800 data-[state=active]:shadow-sm whitespace-nowrap">
                <ClipboardCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Lembar Verifikasi</span>
                <span className="sm:hidden">Verifikasi</span>
                {stats && stats.pending > 0 && (
                  <Badge className="ml-0.5 sm:ml-1 bg-amber-500 text-white text-[10px] sm:text-xs px-1 sm:px-1.5 py-0 min-w-[16px] sm:min-w-[20px] h-4 sm:h-5 flex items-center justify-center">
                    {stats.pending}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="data" className="gap-1 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm transition-all duration-200 data-[state=active]:shadow-sm whitespace-nowrap">
                <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Data Pendaftar</span>
                <span className="sm:hidden">Pendaftar</span>
              </TabsTrigger>
              <TabsTrigger value="diterima" className="gap-1 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm transition-all duration-200 data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800 data-[state=active]:shadow-sm whitespace-nowrap">
                <ThumbsUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Diterima
                {stats && stats.verified > 0 && (
                  <Badge className="ml-0.5 sm:ml-1 bg-emerald-600 text-white text-[10px] sm:text-xs px-1 sm:px-1.5 py-0 min-w-[16px] sm:min-w-[20px] h-4 sm:h-5 flex items-center justify-center">
                    {stats.verified}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="ditolak" className="gap-1 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm transition-all duration-200 data-[state=active]:bg-red-100 data-[state=active]:text-red-800 data-[state=active]:shadow-sm whitespace-nowrap">
                <ThumbsDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Ditolak
                {stats && stats.rejected > 0 && (
                  <Badge className="ml-0.5 sm:ml-1 bg-red-600 text-white text-[10px] sm:text-xs px-1 sm:px-1.5 py-0 min-w-[16px] sm:min-w-[20px] h-4 sm:h-5 flex items-center justify-center">
                    {stats.rejected}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="pengaturan" className="gap-1 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm transition-all duration-200 data-[state=active]:bg-sky-100 data-[state=active]:text-sky-800 data-[state=active]:shadow-sm whitespace-nowrap">
                <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Pengaturan</span>
                <span className="sm:hidden">Setting</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ==================== DASHBOARD TAB ==================== */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Hero Welcome Section */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg shadow-emerald-200/50">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold tracking-tight">Selamat Datang di SPMB 2026</h2>
                  <p className="text-emerald-100 mt-0.5 text-xs sm:text-sm">Sistem Verifikasi Penerimaan Peserta Didik Baru</p>
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <div className="bg-white/15 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-center">
                    <p className="text-xl sm:text-2xl font-bold">{stats?.total || 0}</p>
                    <p className="text-[10px] sm:text-xs text-emerald-100">Pendaftar</p>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-center">
                    <p className="text-xl sm:text-2xl font-bold">{verificationPercent}%</p>
                    <p className="text-[10px] sm:text-xs text-emerald-100">Terverifikasi</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <Card className="bg-gradient-to-br from-slate-50 to-slate-100/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Total Pendaftar</p>
                      <p className="text-xl sm:text-2xl font-bold">{stats?.total || 0}</p>
                    </div>
                    <div className="p-2 sm:p-2.5 bg-gray-100 rounded-lg sm:rounded-xl shadow-sm">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-yellow-50/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Menunggu</p>
                      <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats?.pending || 0}</p>
                    </div>
                    <div className="p-2 sm:p-2.5 bg-amber-100 rounded-lg sm:rounded-xl shadow-sm">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('diterima')}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Diterima</p>
                      <p className="text-xl sm:text-2xl font-bold text-emerald-600">{stats?.verified || 0}</p>
                    </div>
                    <div className="p-2 sm:p-2.5 bg-emerald-100 rounded-lg sm:rounded-xl shadow-sm">
                      <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-rose-50/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('ditolak')}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Ditolak</p>
                      <p className="text-xl sm:text-2xl font-bold text-red-600">{stats?.rejected || 0}</p>
                    </div>
                    <div className="p-2 sm:p-2.5 bg-red-100 rounded-lg sm:rounded-xl shadow-sm">
                      <UserX className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Progres Verifikasi</CardTitle>
                <CardDescription>
                  {verificationPercent}% pendaftar telah diproses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={verificationPercent} className="h-4" />
                <div className="flex justify-between mt-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-gray-600">Diterima: {stats?.verified || 0} ({verifiedPercent}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-gray-600">Ditolak: {stats?.rejected || 0} ({rejectedPercent}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-gray-600">Menunggu: {stats?.pending || 0} ({pendingPercent}%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Charts Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* By Sub Jalur */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Berdasarkan Sub Jalur
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.bySubJalur.map((item) => (
                      <StatBar key={item.name} label={item.name} count={item.count} total={stats.total} color="bg-emerald-500" />
                    ))}
                    {(!stats?.bySubJalur || stats.bySubJalur.length === 0) && (
                      <p className="text-sm text-gray-400 text-center py-4">Belum ada data</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* By Sekolah Pilihan */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <School className="w-4 h-4" />
                    Berdasarkan Sekolah Pilihan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {stats?.bySekolahPilihan.map((item) => (
                      <StatBar key={item.name} label={item.name} count={item.count} total={stats.total} color="bg-sky-500" />
                    ))}
                    {(!stats?.bySekolahPilihan || stats.bySekolahPilihan.length === 0) && (
                      <p className="text-sm text-gray-400 text-center py-4">Belum ada data</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* By Jurusan */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Berdasarkan Jurusan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.byJurusan.map((item) => (
                      <StatBar key={item.name} label={item.name} count={item.count} total={stats.total} color="bg-violet-500" />
                    ))}
                    {(!stats?.byJurusan || stats.byJurusan.length === 0) && (
                      <p className="text-sm text-gray-400 text-center py-4">Belum ada data</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Verification Status */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Ringkasan Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <StatBar label="Diterima (Terverifikasi)" count={stats?.verified || 0} total={stats?.total || 0} color="bg-emerald-500" />
                    <StatBar label="Ditolak" count={stats?.rejected || 0} total={stats?.total || 0} color="bg-red-500" />
                    <StatBar label="Menunggu Verifikasi" count={stats?.pending || 0} total={stats?.total || 0} color="bg-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lembar Verifikasi Quick Links */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4" />
                  Lembar Verifikasi per Jalur
                </CardTitle>
                <CardDescription>Klik untuk membuka lembar verifikasi masing-masing jalur</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {lembarVerifikasi.map((lv) => {
                    const LvIcon = lv.icon
                    const pendingCount = getPendingForLembar(lv.subJalurFilter)
                    return (
                      <Card
                        key={lv.key}
                        className={`border-2 cursor-pointer hover:scale-[1.02] hover:shadow-xl transition-all duration-300 ${lv.borderColor} ${lv.bgColor}`}
                        onClick={() => { setActiveTab('lembar-verifikasi'); setLembarTab(lv.key) }}
                      >
                        <CardContent className="p-3 sm:p-4 text-center">
                          <LvIcon className={`w-7 h-7 sm:w-8 sm:h-8 mx-auto mb-1.5 ${lv.iconColor}`} />
                          <p className="font-semibold text-gray-900 text-sm sm:text-base">{lv.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{pendingCount} menunggu verifikasi</p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== LEMBAR VERIFIKASI TAB ==================== */}
          <TabsContent value="lembar-verifikasi" className="space-y-6">
            <Tabs value={lembarTab} onValueChange={setLembarTab}>
              <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
                <TabsList className="flex-nowrap sm:flex-wrap h-auto gap-1 bg-white/60 backdrop-blur-sm border rounded-xl p-1 shadow-sm w-max sm:w-auto">
                  {lembarVerifikasi.map((lv) => {
                    const LvIcon = lv.icon
                    const pendingCount = getPendingForLembar(lv.subJalurFilter)
                    return (
                      <TabsTrigger
                        key={lv.key}
                        value={lv.key}
                        className="gap-1 text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap"
                      >
                        <LvIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden md:inline">{lv.label}</span>
                        <span className="md:hidden">{lv.label.length > 10 ? lv.label.substring(0, 8) + '..' : lv.label}</span>
                        {pendingCount > 0 && (
                          <Badge className="ml-0.5 bg-amber-500 text-white text-[10px] sm:text-xs px-1 py-0 min-w-[14px] sm:min-w-[16px] h-3.5 sm:h-4 flex items-center justify-center">
                            {pendingCount}
                          </Badge>
                        )}
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
              </div>

              {lembarVerifikasi.map((lv) => (
                <TabsContent key={lv.key} value={lv.key} className="mt-6">
                  <LembarVerifikasiSheet
                    config={lv}
                    subJalurOptions={subJalurOptions}
                    onVerify={() => {}}
                    onBulkVerify={() => {}}
                    onViewDetail={handleViewDetail}
                    toast={toast}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>

          {/* ==================== DATA PENDAFTAR TAB ==================== */}
          <TabsContent value="data" className="space-y-4">
            {/* Filters */}
            <Card className="shadow-sm">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Cari nama, NISN..."
                      className="pl-9 h-9 sm:h-10 text-sm"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value)
                        setPagination(prev => ({ ...prev, page: 1 }))
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:flex gap-2">
                    <Select
                      value={subJalurFilter}
                      onValueChange={(v) => {
                        setSubJalurFilter(v)
                        setPagination(prev => ({ ...prev, page: 1 }))
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-[180px] h-9 sm:h-10 text-xs sm:text-sm">
                        <SelectValue placeholder="Sub Jalur" />
                      </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Jalur</SelectItem>
                      {subJalurOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={verificationFilter}
                    onValueChange={(v) => {
                      setVerificationFilter(v)
                      setPagination(prev => ({ ...prev, page: 1 }))
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-[180px] h-9 sm:h-10 text-xs sm:text-sm">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="PENDING">Menunggu</SelectItem>
                      <SelectItem value="VERIFIED">Diterima</SelectItem>
                      <SelectItem value="REJECTED">Ditolak</SelectItem>
                    </SelectContent>
                  </Select>
                  </div>
                  {selectedIds.size > 0 && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => {
                          setVerifyAction('VERIFIED')
                          setBulkVerifyDialogOpen(true)
                        }}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        Terima ({selectedIds.size})
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setVerifyAction('REJECTED')
                          setBulkVerifyDialogOpen(true)
                        }}
                      >
                        <ThumbsDown className="w-4 h-4" />
                        Tolak ({selectedIds.size})
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedIds(new Set())}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-white">
                      <TableRow className="bg-gray-50/80">
                        <TableHead className="w-10 text-center">No</TableHead>
                        <TableHead className="w-10">
                          <Checkbox
                            checked={registrations.length > 0 && selectedIds.size === registrations.length}
                            onCheckedChange={toggleSelectAll}
                          />
                        </TableHead>
                        <TableHead>No. Reg</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead className="hidden md:table-cell">NISN</TableHead>
                        <TableHead>Sub Jalur</TableHead>
                        <TableHead className="hidden lg:table-cell">Sekolah Pilihan</TableHead>
                        <TableHead className="hidden lg:table-cell">Jurusan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                            <p className="text-sm text-gray-400 mt-2">Memuat data...</p>
                          </TableCell>
                        </TableRow>
                      ) : registrations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-12">
                            <FileSpreadsheet className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                            <p className="text-gray-500 font-medium">Belum ada data pendaftar</p>
                            <p className="text-sm text-gray-400">Import CSV untuk memulai verifikasi</p>
                            <Button className="mt-3 bg-emerald-600 hover:bg-emerald-700" onClick={() => setImportDialogOpen(true)}>
                              <Upload className="w-4 h-4" />
                              Import CSV
                            </Button>
                          </TableCell>
                        </TableRow>
                      ) : (
                        registrations.map((reg, idx) => (
                          <TableRow key={reg.id} className={
                            reg.verificationStatus === 'VERIFIED' ? 'bg-emerald-50/40' :
                            reg.verificationStatus === 'REJECTED' ? 'bg-red-50/40' : ''
                          }>
                            <TableCell className="text-center text-sm text-gray-500">
                              {(pagination.page - 1) * pagination.limit + idx + 1}
                            </TableCell>
                            <TableCell>
                              <Checkbox checked={selectedIds.has(reg.id)} onCheckedChange={() => toggleSelect(reg.id)} />
                            </TableCell>
                            <TableCell className="font-mono text-sm">{reg.noRegistrasi}</TableCell>
                            <TableCell className="font-medium">{reg.nama}</TableCell>
                            <TableCell className="hidden md:table-cell text-sm text-gray-500">{reg.nisn}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={SUB_JALUR_COLORS[reg.subJalur] || 'bg-gray-100 text-gray-800 border-gray-200'}>
                                {reg.subJalur}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-sm">{reg.namaSekolahPilihan}</TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Badge variant="secondary">{reg.jurusan}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={STATUS_COLORS[reg.verificationStatus]}>
                                {reg.verificationStatus === 'PENDING' && <Clock className="w-3 h-3" />}
                                {reg.verificationStatus === 'VERIFIED' && <CheckCircle2 className="w-3 h-3" />}
                                {reg.verificationStatus === 'REJECTED' && <XCircle className="w-3 h-3" />}
                                {reg.verificationStatus === 'PENDING' ? 'Menunggu' :
                                 reg.verificationStatus === 'VERIFIED' ? 'Diterima' : 'Ditolak'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="sm" onClick={() => { setDetailTarget(reg); setDetailDialogOpen(true) }} title="Lihat Detail">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-white hover:bg-blue-600" title="Edit Data" onClick={() => openEditDialog(reg)}>
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-white hover:bg-red-600" title="Hapus Data" onClick={() => openDeleteDialog(reg)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                                {reg.verificationStatus !== 'VERIFIED' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-emerald-600 hover:text-white hover:bg-emerald-600"
                                    title="Terima Pendaftar"
                                    onClick={() => {
                                      setVerifyTargetId(reg.id)
                                      setVerifyAction('VERIFIED')
                                      setVerifyNote('')
                                      setVerifyDialogOpen(true)
                                    }}
                                  >
                                    <ThumbsUp className="w-4 h-4" />
                                  </Button>
                                )}
                                {reg.verificationStatus !== 'REJECTED' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-white hover:bg-red-600"
                                    title="Tolak Pendaftar"
                                    onClick={() => {
                                      setVerifyTargetId(reg.id)
                                      setVerifyAction('REJECTED')
                                      setVerifyNote('')
                                      setVerifyDialogOpen(true)
                                    }}
                                  >
                                    <ThumbsDown className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <p className="text-sm text-gray-500">
                      Menampilkan {(pagination.page - 1) * pagination.limit + 1}-
                      {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} pendaftar
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-gray-600">Hal {pagination.page} / {pagination.totalPages}</span>
                      <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== DITERIMA TAB ==================== */}
          <TabsContent value="diterima" className="space-y-6">
            {/* Elegant Header */}
            <Card className="overflow-hidden border-0 shadow-lg">
              <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 p-4 sm:p-6 text-white">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold tracking-wide">LAPORAN PESERTA DITERIMA</h2>
                    <p className="text-emerald-100 mt-0.5 sm:mt-1 text-xs sm:text-sm">SPMB 2026 — Sistem Verifikasi Penerimaan Peserta Didik Baru</p>
                  </div>
                  <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30" onClick={() => handlePrintReport('diterima')}>
                    <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> <span className="text-xs sm:text-sm">Cetak</span>
                  </Button>
                </div>
              </div>
              <CardContent className="p-3 sm:p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                  <div className="bg-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-emerald-100">
                    <p className="text-xl sm:text-3xl font-bold text-emerald-700">{stats?.verified || 0}</p>
                    <p className="text-[10px] sm:text-xs text-emerald-600 font-medium mt-0.5 sm:mt-1">Total Diterima</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-emerald-100">
                    <p className="text-xl sm:text-3xl font-bold text-emerald-700">{stats?.total || 0}</p>
                    <p className="text-[10px] sm:text-xs text-emerald-600 font-medium mt-0.5 sm:mt-1">Total Pendaftar</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-emerald-100">
                    <p className="text-xl sm:text-3xl font-bold text-emerald-700">{verifiedPercent}%</p>
                    <p className="text-[10px] sm:text-xs text-emerald-600 font-medium mt-0.5 sm:mt-1">Persentase Diterima</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-emerald-100">
                    <p className="text-xl sm:text-3xl font-bold text-emerald-700">{stats?.verifiedBySubJalur?.length || 0}</p>
                    <p className="text-[10px] sm:text-xs text-emerald-600 font-medium mt-0.5 sm:mt-1">Jalur Aktif</p>
                  </div>
                </div>

                {/* Per Jalur Breakdown with Progress Bars */}
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Distribusi Per Sub Jalur</h3>
                  <div className="space-y-2.5">
                    {stats?.verifiedBySubJalur.map((item) => (
                      <div key={item.name} className="flex items-center gap-3">
                        <Badge variant="outline" className={`${SUB_JALUR_COLORS[item.name] || 'bg-gray-100 text-gray-800'} min-w-[130px] justify-center text-xs`}>
                          {item.name}
                        </Badge>
                        <div className="flex-1 bg-gray-100 rounded-full h-5 relative overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: stats?.verified ? `${(item.count / stats.verified) * 100}%` : '0%' }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 min-w-[40px] text-right">{item.count}</span>
                      </div>
                    ))}
                    {(!stats?.verifiedBySubJalur || stats.verifiedBySubJalur.length === 0) && (
                      <p className="text-xs text-gray-400 text-center py-2">Belum ada data</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filter Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Filter className="w-4 h-4" /> Filter:
                  </div>
                  <Select value={diterimaFilterJalur} onValueChange={setDiterimaFilterJalur}>
                    <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Sub Jalur" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Jalur</SelectItem>
                      {subJalurOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Select value={diterimaFilterSekolah} onValueChange={setDiterimaFilterSekolah}>
                    <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Sekolah Pilihan" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Sekolah</SelectItem>
                      {stats?.verifiedBySekolah.map((item) => (
                        <SelectItem key={item.name} value={item.name}>{item.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="sm:ml-auto text-sm text-gray-500">
                    Menampilkan {(() => {
                      const list = stats?.verifiedList || []
                      const filtered = list.filter(r =>
                        (diterimaFilterJalur === 'all' || r.subJalur === diterimaFilterJalur) &&
                        (diterimaFilterSekolah === 'all' || r.namaSekolahPilihan === diterimaFilterSekolah)
                      )
                      return filtered.length
                    })()} dari {stats?.verified || 0} peserta
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Table */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ListChecks className="w-5 h-5 text-emerald-600" />
                  Daftar Peserta Diterima
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-white">
                      <TableRow className="bg-emerald-50/80">
                        <TableHead className="w-12 text-center">No</TableHead>
                        <TableHead>No. Registrasi</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead className="hidden md:table-cell">NISN</TableHead>
                        <TableHead>Sub Jalur</TableHead>
                        <TableHead className="hidden lg:table-cell">Sekolah Pilihan</TableHead>
                        <TableHead className="hidden lg:table-cell">Jurusan</TableHead>
                        <TableHead className="hidden sm:table-cell">Tanggal Verif</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const list = stats?.verifiedList || []
                        const filtered = list.filter(r =>
                          (diterimaFilterJalur === 'all' || r.subJalur === diterimaFilterJalur) &&
                          (diterimaFilterSekolah === 'all' || r.namaSekolahPilihan === diterimaFilterSekolah)
                        )
                        return filtered.length > 0 ? filtered.map((reg, idx) => (
                          <TableRow key={reg.id} className="hover:bg-emerald-50/30">
                            <TableCell className="text-center text-sm text-gray-500">{idx + 1}</TableCell>
                            <TableCell className="font-mono text-sm">{reg.noRegistrasi}</TableCell>
                            <TableCell className="font-medium">{reg.nama}</TableCell>
                            <TableCell className="hidden md:table-cell text-sm text-gray-500">{reg.nisn}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={SUB_JALUR_COLORS[reg.subJalur] || 'bg-gray-100 text-gray-800'}>
                                {reg.subJalur}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-sm">{reg.namaSekolahPilihan}</TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Badge variant="secondary">{reg.jurusan}</Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-xs text-gray-500">
                              {reg.tanggalVerif || (reg.updatedAt ? new Date(reg.updatedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-')}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="sm" onClick={() => { setDetailTarget(reg); setDetailDialogOpen(true) }} title="Lihat Detail">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-white hover:bg-blue-600" title="Edit Data" onClick={() => openEditDialog(reg)}>
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-white hover:bg-red-600" title="Hapus Data" onClick={() => openDeleteDialog(reg)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )) : (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-12">
                              <UserCheck className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                              <p className="text-gray-500 font-medium">Belum ada pendaftar yang diterima</p>
                              <p className="text-sm text-gray-400">Verifikasi pendaftar untuk menerimanya</p>
                            </TableCell>
                          </TableRow>
                        )
                      })()}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== DITOLAK TAB ==================== */}
          <TabsContent value="ditolak" className="space-y-6">
            {/* Elegant Header - Red Theme */}
            <Card className="overflow-hidden border-0 shadow-lg">
              <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-600 p-4 sm:p-6 text-white">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold tracking-wide">LAPORAN PESERTA DITOLAK</h2>
                    <p className="text-red-100 mt-0.5 sm:mt-1 text-xs sm:text-sm">SPMB 2026 — Sistem Verifikasi Penerimaan Peserta Didik Baru</p>
                  </div>
                  <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30" onClick={() => handlePrintReport('ditolak')}>
                    <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> <span className="text-xs sm:text-sm">Cetak</span>
                  </Button>
                </div>
              </div>
              <CardContent className="p-3 sm:p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                  <div className="bg-red-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-red-100">
                    <p className="text-xl sm:text-3xl font-bold text-red-700">{stats?.rejected || 0}</p>
                    <p className="text-[10px] sm:text-xs text-red-600 font-medium mt-0.5 sm:mt-1">Total Ditolak</p>
                  </div>
                  <div className="bg-red-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-red-100">
                    <p className="text-xl sm:text-3xl font-bold text-red-700">{stats?.total || 0}</p>
                    <p className="text-[10px] sm:text-xs text-red-600 font-medium mt-0.5 sm:mt-1">Total Pendaftar</p>
                  </div>
                  <div className="bg-red-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-red-100">
                    <p className="text-xl sm:text-3xl font-bold text-red-700">{rejectedPercent}%</p>
                    <p className="text-[10px] sm:text-xs text-red-600 font-medium mt-0.5 sm:mt-1">Persentase Ditolak</p>
                  </div>
                  <div className="bg-red-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-red-100">
                    <p className="text-xl sm:text-3xl font-bold text-red-700">{stats?.rejectedBySubJalur?.length || 0}</p>
                    <p className="text-[10px] sm:text-xs text-red-600 font-medium mt-0.5 sm:mt-1">Jalur Aktif</p>
                  </div>
                </div>

                {/* Per Jalur Breakdown with Progress Bars */}
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Distribusi Per Sub Jalur</h3>
                  <div className="space-y-2.5">
                    {stats?.rejectedBySubJalur.map((item) => (
                      <div key={item.name} className="flex items-center gap-3">
                        <Badge variant="outline" className={`${SUB_JALUR_COLORS[item.name] || 'bg-gray-100 text-gray-800'} min-w-[130px] justify-center text-xs`}>
                          {item.name}
                        </Badge>
                        <div className="flex-1 bg-gray-100 rounded-full h-5 relative overflow-hidden">
                          <div
                            className="h-full bg-red-500 rounded-full transition-all duration-500"
                            style={{ width: stats?.rejected ? `${(item.count / stats.rejected) * 100}%` : '0%' }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 min-w-[40px] text-right">{item.count}</span>
                      </div>
                    ))}
                    {(!stats?.rejectedBySubJalur || stats.rejectedBySubJalur.length === 0) && (
                      <p className="text-xs text-gray-400 text-center py-2">Belum ada data</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filter Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Filter className="w-4 h-4" /> Filter:
                  </div>
                  <Select value={ditolakFilterJalur} onValueChange={setDitolakFilterJalur}>
                    <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Sub Jalur" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Jalur</SelectItem>
                      {subJalurOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <div className="sm:ml-auto text-sm text-gray-500">
                    Menampilkan {(() => {
                      const list = stats?.rejectedList || []
                      const filtered = list.filter(r => ditolakFilterJalur === 'all' || r.subJalur === ditolakFilterJalur)
                      return filtered.length
                    })()} dari {stats?.rejected || 0} peserta
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Table */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5 text-red-600" />
                  Daftar Peserta Ditolak
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-white">
                      <TableRow className="bg-red-50/80">
                        <TableHead className="w-12 text-center">No</TableHead>
                        <TableHead>No. Registrasi</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead className="hidden md:table-cell">NISN</TableHead>
                        <TableHead>Sub Jalur</TableHead>
                        <TableHead className="hidden lg:table-cell">Sekolah Pilihan</TableHead>
                        <TableHead className="hidden lg:table-cell">Jurusan</TableHead>
                        <TableHead className="hidden sm:table-cell">Alasan Penolakan</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const list = stats?.rejectedList || []
                        const filtered = list.filter(r => ditolakFilterJalur === 'all' || r.subJalur === ditolakFilterJalur)
                        return filtered.length > 0 ? filtered.map((reg, idx) => (
                          <TableRow key={reg.id} className="hover:bg-red-50/30">
                            <TableCell className="text-center text-sm text-gray-500">{idx + 1}</TableCell>
                            <TableCell className="font-mono text-sm">{reg.noRegistrasi}</TableCell>
                            <TableCell className="font-medium">{reg.nama}</TableCell>
                            <TableCell className="hidden md:table-cell text-sm text-gray-500">{reg.nisn}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={SUB_JALUR_COLORS[reg.subJalur] || 'bg-gray-100 text-gray-800'}>
                                {reg.subJalur}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-sm">{reg.namaSekolahPilihan}</TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Badge variant="secondary">{reg.jurusan}</Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-sm text-gray-500 max-w-[200px] truncate">
                              {reg.verificationNote || <span className="text-gray-400 italic">Tidak ada alasan</span>}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="sm" onClick={() => { setDetailTarget(reg); setDetailDialogOpen(true) }} title="Lihat Detail">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-white hover:bg-blue-600" title="Edit Data" onClick={() => openEditDialog(reg)}>
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-white hover:bg-red-600" title="Hapus Data" onClick={() => openDeleteDialog(reg)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )) : (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-12">
                              <UserX className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                              <p className="text-gray-500 font-medium">Belum ada pendaftar yang ditolak</p>
                              <p className="text-sm text-gray-400">Semua pendaftar dalam proses verifikasi</p>
                            </TableCell>
                          </TableRow>
                        )
                      })()}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== PENGATURAN TAB ==================== */}
          <TabsContent value="pengaturan" className="space-y-6">
            {/* Header */}
            <Card className="overflow-hidden border-0 shadow-lg">
              <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-cyan-600 p-4 sm:p-6 text-white">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Settings className="w-6 h-6 sm:w-8 sm:h-8" />
                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold tracking-wide">PENGATURAN KUOTA</h2>
                    <p className="text-sky-100 mt-0.5 sm:mt-1 text-xs sm:text-sm">SPMB 2026 — Atur kuota siswa dan persentase jalur pendaftaran</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Kuota Siswa */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-sky-600" />
                  Kuota Siswa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-sm text-gray-500 font-medium">Jumlah Total Kuota Siswa Baru</label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="number"
                        min={0}
                        value={kuota}
                        onChange={(e) => setKuota(parseInt(e.target.value) || 0)}
                        className="max-w-[200px] text-lg font-bold"
                        placeholder="Masukkan kuota..."
                      />
                      <Button
                        onClick={saveKuota}
                        disabled={settingsSaving}
                        className="bg-sky-600 hover:bg-sky-700"
                      >
                        {settingsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Simpan
                      </Button>
                    </div>
                  </div>
                  <div className="bg-sky-50 rounded-xl p-5 text-center border border-sky-100 min-w-[160px]">
                    <p className="text-4xl font-bold text-sky-700">{kuota}</p>
                    <p className="text-xs text-sky-600 font-medium mt-1">Total Kuota</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Distribusi Jalur */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ClipboardCheck className="w-5 h-5 text-amber-600" />
                    Distribusi Jalur Pendaftaran
                  </CardTitle>
                  <Button
                    onClick={() => setAddJalurOpen(true)}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Jalur
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {settingsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    <p className="text-sm text-gray-400 ml-2">Memuat pengaturan...</p>
                  </div>
                ) : jalurConfigs.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Belum ada jalur yang dikonfigurasi</p>
                    <Button className="mt-3 bg-emerald-600 hover:bg-emerald-700" onClick={() => setAddJalurOpen(true)}>
                      <Plus className="w-4 h-4" /> Tambah Jalur Pertama
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Total percentage bar */}
                    {(() => {
                      const totalPersen = jalurConfigs.filter(j => j.aktif).reduce((sum, j) => sum + j.persentase, 0)
                      const totalSiswa = jalurConfigs.filter(j => j.aktif).reduce((sum, j) => sum + Math.round(kuota * j.persentase / 100), 0)
                      return (
                        <div className={`rounded-xl p-4 border-2 ${totalPersen === 100 ? 'bg-emerald-50 border-emerald-300' : totalPersen > 100 ? 'bg-red-50 border-red-300' : 'bg-amber-50 border-amber-300'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {totalPersen === 100 ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> :
                               totalPersen > 100 ? <AlertTriangle className="w-5 h-5 text-red-600" /> :
                               <AlertCircle className="w-5 h-5 text-amber-600" />}
                              <span className="font-semibold text-sm">
                                Total Persentase: {totalPersen.toFixed(1)}%
                              </span>
                            </div>
                            <span className="text-sm font-medium">
                              Total Siswa: <strong>{totalSiswa}</strong> dari {kuota} kuota
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div className="mt-2 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${totalPersen === 100 ? 'bg-emerald-500' : totalPersen > 100 ? 'bg-red-500' : 'bg-amber-500'}`}
                              style={{ width: `${Math.min(totalPersen, 100)}%` }}
                            />
                          </div>
                          {totalPersen !== 100 && (
                            <p className={`text-xs mt-2 ${totalPersen > 100 ? 'text-red-600' : 'text-amber-600'}`}>
                              {totalPersen > 100
                                ? `⚠ Persentase melebihi 100%! Kurangi ${(totalPersen - 100).toFixed(1)}%`
                                : `ℹ Persentase belum 100%. Tambahkan ${(100 - totalPersen).toFixed(1)}% lagi`
                              }
                            </p>
                          )}
                        </div>
                      )
                    })()}

                    {/* Jalur list */}
                    <div className="border rounded-xl overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-sky-50/80">
                            <TableHead className="w-10 text-center">No</TableHead>
                            <TableHead>Jalur</TableHead>
                            <TableHead className="w-32 text-center">Persentase</TableHead>
                            <TableHead className="w-40 text-center">Jumlah Siswa</TableHead>
                            <TableHead className="w-24 text-center">Status</TableHead>
                            <TableHead className="w-28 text-right">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {jalurConfigs.map((jalur, idx) => {
                            const jumlahSiswa = Math.round(kuota * jalur.persentase / 100)
                            const barWidth = Math.min(jalur.persentase, 100)
                            return (
                              <TableRow key={jalur.id} className={!jalur.aktif ? 'opacity-50' : ''}>
                                <TableCell className="text-center text-sm text-gray-500">{idx + 1}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{
                                        backgroundColor:
                                          jalur.nama === 'Domisili' ? '#3b82f6' :
                                          jalur.nama.includes('Afirmasi') || jalur.nama.includes('KTM') ? '#f59e0b' :
                                          jalur.nama.includes('Disabilitas') ? '#8b5cf6' :
                                          jalur.nama === 'Anak Guru' ? '#ec4899' :
                                          jalur.nama === 'Mutasi' ? '#06b6d4' :
                                          jalur.nama.includes('Prestasi') ? '#10b981' :
                                          jalur.nama.includes('Non Akademik') ? '#f97316' :
                                          '#6b7280'
                                      }}
                                    />
                                    <span className="font-medium text-sm">{jalur.nama}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <Input
                                      type="number"
                                      min={0}
                                      max={100}
                                      step={0.5}
                                      value={jalur.persentase}
                                      onChange={(e) => {
                                        const val = parseFloat(e.target.value) || 0
                                        setJalurConfigs(prev => prev.map(j => j.id === jalur.id ? { ...j, persentase: val } : j))
                                      }}
                                      onBlur={() => updateJalurPersentase(jalur.id, jalur.persentase)}
                                      className="w-20 text-center text-sm font-bold"
                                    />
                                    <span className="text-xs text-gray-400">%</span>
                                  </div>
                                  {/* Mini progress bar */}
                                  <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-sky-400 rounded-full transition-all"
                                      style={{ width: `${barWidth}%` }}
                                    />
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="inline-flex flex-col items-center">
                                    <span className="text-lg font-bold text-sky-700">{jumlahSiswa}</span>
                                    <span className="text-xs text-gray-400">siswa</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <button
                                    onClick={() => toggleJalurAktif(jalur.id, !jalur.aktif)}
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                                      jalur.aktif
                                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                                  >
                                    {jalur.aktif ? <><CheckCircle2 className="w-3 h-3" /> Aktif</> : <><XCircle className="w-3 h-3" /> Nonaktif</>}
                                  </button>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => deleteJalur(jalur.id, jalur.nama)}
                                    title="Hapus jalur"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                      {jalurConfigs.filter(j => j.aktif).map(jalur => {
                        const jumlahSiswa = Math.round(kuota * jalur.persentase / 100)
                        const colors: Record<string, string> = {
                          'Domisili': 'from-blue-500 to-blue-600',
                          'Afirmasi (KTM)': 'from-amber-500 to-amber-600',
                          'Disabilitas': 'from-purple-500 to-purple-600',
                          'Anak Guru': 'from-pink-500 to-pink-600',
                          'Mutasi': 'from-cyan-500 to-cyan-600',
                          'Prestasi Nilai Rapor': 'from-emerald-500 to-emerald-600',
                          'Prestasi Non Akademik': 'from-orange-500 to-orange-600',
                        }
                        const gradient = colors[jalur.nama] || 'from-gray-500 to-gray-600'
                        return (
                          <div key={jalur.id} className={`rounded-xl p-4 text-white bg-gradient-to-br ${gradient} shadow-sm`}>
                            <p className="text-xs font-medium opacity-80">{jalur.nama}</p>
                            <p className="text-3xl font-bold mt-1">{jumlahSiswa}</p>
                            <p className="text-xs opacity-70 mt-0.5">{jalur.persentase}% dari {kuota}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sinkronisasi Portal SPMB */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="w-5 h-5 text-indigo-600" />
                  Sinkronisasi Portal SPMB
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                      <div className="text-sm text-indigo-700">
                        <p className="font-medium">Ambil data otomatis dari portal SPMB Sumatera Utara</p>
                        <p className="mt-1 text-indigo-600">Masukkan kredensial login portal untuk mengambil data pendaftar secara otomatis. Data akan disinkronkan dengan database lokal menggunakan deduplikasi NISN.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" /> Email Portal
                      </label>
                      <Input
                        type="email"
                        value={portalSyncEmail}
                        onChange={(e) => setPortalSyncEmail(e.target.value)}
                        placeholder="email@disdik.sumutprov.go.id"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" /> Password Portal
                      </label>
                      <Input
                        type="password"
                        value={portalSyncPassword}
                        onChange={(e) => setPortalSyncPassword(e.target.value)}
                        placeholder="Masukkan password..."
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status Pendaftar</label>
                      <select
                        value={portalSyncStatus}
                        onChange={(e) => setPortalSyncStatus(e.target.value)}
                        className="mt-1.5 w-full h-10 px-3 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="accepted">Accepted (Diterima)</option>
                        <option value="">Semua Status</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Jumlah Halaman</label>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={portalSyncPages}
                        onChange={(e) => setPortalSyncPages(parseInt(e.target.value) || 10)}
                        className="mt-1.5"
                      />
                      <p className="text-xs text-gray-400 mt-1">Setiap halaman berisi 10 data</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handlePortalSync}
                      disabled={portalSyncing}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      {portalSyncing ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Menyinkronkan...</>
                      ) : (
                        <><RefreshCw className="w-4 h-4" /> Mulai Sinkronisasi</>
                      )}
                    </Button>
                    <a
                      href="https://adminspmb.disdik.sumutprov.go.id/admin/registration"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:text-indigo-800 underline"
                    >
                      Buka Portal SPMB ↗
                    </a>
                  </div>

                  {/* Sync Result */}
                  {portalSyncResult && (
                    <div className={`rounded-xl p-4 border-2 ${portalSyncResult.success ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'}`}>
                      <div className="flex items-start gap-3">
                        {portalSyncResult.success ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                        )}
                        <div>
                          <p className={`font-semibold text-sm ${portalSyncResult.success ? 'text-emerald-700' : 'text-red-700'}`}>
                            {portalSyncResult.success ? 'Sinkronisasi Berhasil' : 'Sinkronisasi Gagal'}
                          </p>
                          <p className={`text-sm mt-1 ${portalSyncResult.success ? 'text-emerald-600' : 'text-red-600'}`}>
                            {portalSyncResult.message}
                          </p>
                          {portalSyncResult.success && portalSyncResult.total !== undefined && (
                            <div className="flex items-center gap-4 mt-3">
                              <div className="text-center">
                                <p className="text-2xl font-bold text-emerald-700">{portalSyncResult.created}</p>
                                <p className="text-xs text-emerald-600">Data Baru</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-amber-600">{portalSyncResult.updated}</p>
                                <p className="text-xs text-amber-600">Diperbarui</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-gray-500">{portalSyncResult.unchanged}</p>
                                <p className="text-xs text-gray-500">Tidak Berubah</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-sky-700">{portalSyncResult.total}</p>
                                <p className="text-xs text-sky-700">Total Diambil</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Add Jalur Dialog */}
            <Dialog open={addJalurOpen} onOpenChange={setAddJalurOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-emerald-600" />
                    Tambah Jalur Baru
                  </DialogTitle>
                  <DialogDescription>Tambahkan jalur pendaftaran baru untuk SPMB 2026</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nama Jalur</label>
                    <Input
                      value={newJalurNama}
                      onChange={(e) => setNewJalurNama(e.target.value)}
                      placeholder="Contoh: Zonasi, Perpindahan Orang Tua"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Persentase Kuota (%)</label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={newJalurPersentase}
                      onChange={(e) => setNewJalurPersentase(parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  {newJalurPersentase > 0 && kuota > 0 && (
                    <div className="bg-sky-50 rounded-lg p-3 border border-sky-200">
                      <p className="text-sm text-sky-700">
                        Estimasi jumlah siswa: <strong>{Math.round(kuota * newJalurPersentase / 100)}</strong> siswa
                      </p>
                    </div>
                  )}
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setAddJalurOpen(false)}>Batal</Button>
                  <Button onClick={addJalur} className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="w-4 h-4" /> Tambah
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900 mt-auto">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              <p className="text-xs sm:text-sm text-emerald-100 font-medium">&copy; 2026 SPMB Verifikasi System</p>
            </div>
            <p className="text-[10px] sm:text-xs text-emerald-200/60">Sistem Verifikasi Penerimaan Peserta Didik Baru</p>
          </div>
        </div>
      </footer>

      {/* ==================== IMPORT DIALOG ==================== */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
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
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>Batal</Button>
            <Button onClick={handleImport} disabled={!csvFile || importing} className="bg-emerald-600 hover:bg-emerald-700">
              {importing ? (<><Loader2 className="w-4 h-4 animate-spin" /> Mengimport...</>) : (<><Upload className="w-4 h-4" /> Import</>)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== PORTAL PASTE DIALOG ==================== */}
      <Dialog open={portalPasteOpen} onOpenChange={(open) => {
        setPortalPasteOpen(open)
        if (!open) { setPortalRawText(''); setPortalParsedData(null); setPortalSelectedJalur('') }
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
                <Button onClick={handlePortalSave} disabled={importing || !portalSelectedJalur} className="bg-emerald-600 hover:bg-emerald-700">
                  {importing ? (<><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>) : (<><Check className="w-4 h-4" /> Simpan Data</>)}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== SINGLE VERIFY DIALOG ==================== */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
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
                ? 'Apakah Anda yakin ingin MENERIMA pendaftar ini? Data akan diverifikasi dan diterima di SPMB 2026.'
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
            <Button variant="outline" onClick={() => setVerifyDialogOpen(false)}>Batal</Button>
            <Button
              onClick={handleVerify}
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

      {/* ==================== BULK VERIFY DIALOG ==================== */}
      <Dialog open={bulkVerifyDialogOpen} onOpenChange={setBulkVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {verifyAction === 'VERIFIED' ? (
                <><ThumbsUp className="w-5 h-5 text-emerald-600" /> Terima {selectedIds.size} Pendaftar</>
              ) : (
                <><ThumbsDown className="w-5 h-5 text-red-600" /> Tolak {selectedIds.size} Pendaftar</>
              )}
            </DialogTitle>
            <DialogDescription>
              {verifyAction === 'VERIFIED'
                ? `Apakah Anda yakin ingin MENERIMA ${selectedIds.size} pendaftar yang dipilih?`
                : `Apakah Anda yakin ingin MENOLAK ${selectedIds.size} pendaftar yang dipilih?`}
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
            <Button variant="outline" onClick={() => setBulkVerifyDialogOpen(false)}>Batal</Button>
            <Button
              onClick={handleBulkVerify}
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

      {/* ==================== DETAIL DIALOG ==================== */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Detail Pendaftar
            </DialogTitle>
            <DialogDescription>Informasi lengkap pendaftar SPMB 2026</DialogDescription>
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
                <h4 className="text-sm font-medium text-gray-700 mb-2">Sekolah Pilihan</h4>
                <div className="bg-sky-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-sky-800">{detailTarget.namaSekolahPilihan}</p>
                  <p className="text-xs text-sky-600">NPSN: {detailTarget.npsnSekolahPilihan}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Sekolah Asal</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium">{detailTarget.namaSekolahAsal}</p>
                  <p className="text-xs text-gray-500">NPSN: {detailTarget.npsnSekolahAsal}</p>
                </div>
              </div>

              {/* Portal SPMB Data */}
              {(detailTarget.nik || detailTarget.tanggalLahir || detailTarget.alamat || detailTarget.noTelpSiswa || detailTarget.noTelpOrangtua || detailTarget.lokasiJarak || detailTarget.nilaiRataRata || detailTarget.skor || detailTarget.nilaiRapor || detailTarget.skorJarak || detailTarget.skorNilaiRaport) && (
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
                        <label className="text-xs text-red-600 font-medium">Kekurangan Verifikasi</label>
                        <p className="text-sm text-red-700">{detailTarget.kekuranganVerifikasi}</p>
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
                    onClick={() => {
                      setVerifyTargetId(detailTarget.id)
                      setVerifyAction('VERIFIED')
                      setVerifyNote('')
                      setDetailDialogOpen(false)
                      setVerifyDialogOpen(true)
                    }}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Terima
                  </Button>
                )}
                {detailTarget.verificationStatus !== 'REJECTED' && (
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      setVerifyTargetId(detailTarget.id)
                      setVerifyAction('REJECTED')
                      setVerifyNote('')
                      setDetailDialogOpen(false)
                      setVerifyDialogOpen(true)
                    }}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    Tolak
                  </Button>
                )}
                {detailTarget.verificationStatus === 'VERIFIED' && (
                  <Button
                    variant="outline"
                    className="flex-1 border-yellow-400 text-yellow-700 hover:bg-yellow-50"
                    onClick={() => {
                      setVerifyTargetId(detailTarget.id)
                      setVerifyAction('REJECTED')
                      setVerifyNote('')
                      setDetailDialogOpen(false)
                      setVerifyDialogOpen(true)
                    }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Batalkan & Tolak
                  </Button>
                )}
                {detailTarget.verificationStatus === 'REJECTED' && (
                  <Button
                    variant="outline"
                    className="flex-1 border-emerald-400 text-emerald-700 hover:bg-emerald-50"
                    onClick={() => {
                      setVerifyTargetId(detailTarget.id)
                      setVerifyAction('VERIFIED')
                      setVerifyNote('')
                      setDetailDialogOpen(false)
                      setVerifyDialogOpen(true)
                    }}
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

      {/* ==================== EDIT DIALOG (Home Component) ==================== */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-blue-600" /> Edit Data Pendaftar
            </DialogTitle>
            <DialogDescription>
              Edit data pendaftar <span className="font-semibold">{editTarget?.nama}</span> ({editTarget?.noRegistrasi})
            </DialogDescription>
          </DialogHeader>
          {editTarget && (
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
                      <Select value={editForm.kekuranganVerifikasi || ''} onValueChange={v => setEditForm({...editForm, kekuranganVerifikasi: v === '__none__' ? '' : v})}>
                        <SelectTrigger><SelectValue placeholder="Pilih kekurangan verifikasi" /></SelectTrigger>
                        <SelectContent className="max-h-64">
                          <SelectItem value="__none__">- Tidak Ada -</SelectItem>
                          {KEKURANGAN_VERIFIKASI_OPTIONS.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSaveEdit} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : <><Pencil className="w-4 h-4" /> Simpan</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== DELETE DIALOG (Home Component) ==================== */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" /> Hapus Data Pendaftar
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus data pendaftar <span className="font-semibold">{deleteTarget?.nama}</span>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">Data yang sudah dihapus tidak dapat dikembalikan. Pastikan Anda yakin sebelum melanjutkan.</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Menghapus...</> : <><Trash2 className="w-4 h-4" /> Hapus</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
