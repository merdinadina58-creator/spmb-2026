export interface Registration {
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
  skorLomba?: string | null
  nilaiRataRataTKA?: string | null
  skorPrestasiAkademik?: string | null
  kekuranganVerifikasi?: string | null
  tanggalVerif?: string | null
  jamVerif?: string | null
  terbitKK?: string | null
  lamaKK?: string | null
  dokumen?: string | null
  // Kelulusan & Daftar Ulang
  statusLulus?: string | null
  statusDaftarUlang?: string | null
  // Sumut Berkah fields
  totalNilai?: string | null
  jarakKeSekolah?: string | null
  // Tahap Pendaftaran
  tahap?: number | null
}

export interface DashboardStats {
  total: number
  verified: number
  rejected: number
  pending: number
  bySubJalur: { name: string; count: number }[]
  bySekolahAsal: { name: string; count: number }[]
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
  // Kelulusan
  lulus: number
  tidakLulus: number
  belumLulus: number
  lulusBySubJalur: { name: string; count: number }[]
  tidakLulusBySubJalur: { name: string; count: number }[]
  lulusList: Registration[]
  tidakLulusList: Registration[]
  // Daftar Ulang
  daftarUlang: number
  tidakDaftarUlang: number
  belumDaftarUlang: number
  daftarUlangBySubJalur: { name: string; count: number }[]
  tidakDaftarUlangBySubJalur: { name: string; count: number }[]
  daftarUlangList: Registration[]
  tidakDaftarUlangList: Registration[]
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface LembarVerifikasiData {
  registrations: Registration[]
  pagination: PaginationInfo
  stats: {
    total: number
    verified: number
    rejected: number
    pending: number
  }
}

// Type for Lembar Verifikasi config
export interface LembarVerifikasiConfig {
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
  // Whether this jalur needs skor/nilai for ranking (false = jarak only)
  needsSkor: boolean
  // Hierarchy support: parent jalur has children, child has parentKey
  children?: LembarVerifikasiConfig[]
  parentKey?: string
  subCategories?: string[]
  // Vibrant card gradient (for dashboard quick links)
  cardGradient?: string
  cardText?: string
  cardIconBg?: string
  badgeBg?: string
  badgeText?: string
}
