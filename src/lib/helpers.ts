import { JALUR_ICON_MAP, JALUR_COLOR_MAP, FALLBACK_COLORS, JALUR_SUB_FILTER_MAP } from './constants'
import { ClipboardCheck } from 'lucide-react'
import type { LembarVerifikasiConfig } from './types'

// Hitung Lama KK dari tanggal Terbit KK
export function hitungLamaKK(terbitKK: string): string {
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
export function isKKKurangSetahun(terbitKK: string): boolean {
  if (!terbitKK) return false
  const terbit = new Date(terbitKK)
  if (isNaN(terbit.getTime())) return false
  const now = new Date()
  const diffMs = now.getTime() - terbit.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays < 365
}

export function getJalurIcon(nama: string) {
  const lower = nama.toLowerCase()
  for (const [keyword, icon] of Object.entries(JALUR_ICON_MAP)) {
    if (lower.includes(keyword)) return icon
  }
  return ClipboardCheck // default icon
}

export function getJalurColors(nama: string, index: number) {
  const lower = nama.toLowerCase()
  for (const [keyword, colors] of Object.entries(JALUR_COLOR_MAP)) {
    if (lower.includes(keyword)) return colors
  }
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length]
}

export function getJalurSubFilter(nama: string) {
  return JALUR_SUB_FILTER_MAP[nama] || nama
}

// Build Lembar Verifikasi config from jalurConfigs
export function buildLembarVerifikasi(jalurConfigs: Array<{ id: string; nama: string; urutan: number; aktif: boolean }>) {
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
