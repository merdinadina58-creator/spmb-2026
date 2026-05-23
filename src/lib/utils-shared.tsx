import {
  MapPin,
  Heart,
  BookOpen,
  UserCog,
  ArrowLeftRight,
  Award,
  Trophy,
  AlertTriangle,
  ClipboardCheck,
} from 'lucide-react'
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

// Deduplicate array by id to prevent duplicate React key errors
export function dedupById<T extends { id: string }>(arr: T[]): T[] {
  const seen = new Set<string>()
  return arr.filter(item => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
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
  // More specific "non-akademik" variants MUST come before generic "prestasi" 
  // to avoid "prestasi non-akademik" matching "prestasi" first
  'prestasi non akademik': Trophy,
  'prestasi non-akademik': Trophy,
  'non akademik': Trophy,
  'non-akademik': Trophy,
  'nonakademik': Trophy,
  'prestasi': Award,
  'bencana': AlertTriangle,
}

const JALUR_COLOR_MAP: Record<string, { color: string; bgColor: string; borderColor: string; headerBg: string; iconBg: string; iconColor: string; btnColor: string; cardGradient: string; cardText: string; cardIconBg: string; badgeBg: string; badgeText: string }> = {
  'domisili': {
    color: 'sky', bgColor: 'bg-sky-50', borderColor: 'border-sky-500', headerBg: 'bg-sky-50/80', iconBg: 'bg-sky-100', iconColor: 'text-sky-600', btnColor: 'bg-sky-600 hover:bg-sky-700',
    cardGradient: 'bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-600', cardText: 'text-white', cardIconBg: 'bg-white/20', badgeBg: 'bg-white/25', badgeText: 'text-white',
  },
  'afirmasi': {
    color: 'orange', bgColor: 'bg-orange-50', borderColor: 'border-orange-500', headerBg: 'bg-orange-50/80', iconBg: 'bg-orange-100', iconColor: 'text-orange-600', btnColor: 'bg-orange-600 hover:bg-orange-700',
    cardGradient: 'bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500', cardText: 'text-white', cardIconBg: 'bg-white/20', badgeBg: 'bg-white/25', badgeText: 'text-white',
  },
  'ktm': {
    color: 'orange', bgColor: 'bg-orange-50', borderColor: 'border-orange-500', headerBg: 'bg-orange-50/80', iconBg: 'bg-orange-100', iconColor: 'text-orange-600', btnColor: 'bg-orange-600 hover:bg-orange-700',
    cardGradient: 'bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500', cardText: 'text-white', cardIconBg: 'bg-white/20', badgeBg: 'bg-white/25', badgeText: 'text-white',
  },
  'keluarga tidak mampu': {
    color: 'orange', bgColor: 'bg-orange-50', borderColor: 'border-orange-500', headerBg: 'bg-orange-50/80', iconBg: 'bg-orange-100', iconColor: 'text-orange-600', btnColor: 'bg-orange-600 hover:bg-orange-700',
    cardGradient: 'bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500', cardText: 'text-white', cardIconBg: 'bg-white/20', badgeBg: 'bg-white/25', badgeText: 'text-white',
  },
  'disabilitas': {
    color: 'purple', bgColor: 'bg-purple-50', borderColor: 'border-purple-500', headerBg: 'bg-purple-50/80', iconBg: 'bg-purple-100', iconColor: 'text-purple-600', btnColor: 'bg-purple-600 hover:bg-purple-700',
    cardGradient: 'bg-gradient-to-br from-purple-500 via-violet-500 to-fuchsia-500', cardText: 'text-white', cardIconBg: 'bg-white/20', badgeBg: 'bg-white/25', badgeText: 'text-white',
  },
  'penyandang disabilitas': {
    color: 'purple', bgColor: 'bg-purple-50', borderColor: 'border-purple-500', headerBg: 'bg-purple-50/80', iconBg: 'bg-purple-100', iconColor: 'text-purple-600', btnColor: 'bg-purple-600 hover:bg-purple-700',
    cardGradient: 'bg-gradient-to-br from-purple-500 via-violet-500 to-fuchsia-500', cardText: 'text-white', cardIconBg: 'bg-white/20', badgeBg: 'bg-white/25', badgeText: 'text-white',
  },
  'anak guru': {
    color: 'violet', bgColor: 'bg-violet-50', borderColor: 'border-violet-500', headerBg: 'bg-violet-50/80', iconBg: 'bg-violet-100', iconColor: 'text-violet-600', btnColor: 'bg-violet-600 hover:bg-violet-700',
    cardGradient: 'bg-gradient-to-br from-pink-500 via-rose-500 to-red-400', cardText: 'text-white', cardIconBg: 'bg-white/20', badgeBg: 'bg-white/25', badgeText: 'text-white',
  },
  'mutasi': {
    color: 'cyan', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-500', headerBg: 'bg-cyan-50/80', iconBg: 'bg-cyan-100', iconColor: 'text-cyan-600', btnColor: 'bg-cyan-600 hover:bg-cyan-700',
    cardGradient: 'bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500', cardText: 'text-white', cardIconBg: 'bg-white/20', badgeBg: 'bg-white/25', badgeText: 'text-white',
  },
  'perpindahan': {
    color: 'cyan', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-500', headerBg: 'bg-cyan-50/80', iconBg: 'bg-cyan-100', iconColor: 'text-cyan-600', btnColor: 'bg-cyan-600 hover:bg-cyan-700',
    cardGradient: 'bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500', cardText: 'text-white', cardIconBg: 'bg-white/20', badgeBg: 'bg-white/25', badgeText: 'text-white',
  },
  'prestasi nilai rapor': {
    color: 'emerald', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-500', headerBg: 'bg-emerald-50/80', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', btnColor: 'bg-emerald-600 hover:bg-emerald-700',
    cardGradient: 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500', cardText: 'text-white', cardIconBg: 'bg-white/20', badgeBg: 'bg-white/25', badgeText: 'text-white',
  },
  'prestasi akademik': {
    color: 'emerald', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-500', headerBg: 'bg-emerald-50/80', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', btnColor: 'bg-emerald-600 hover:bg-emerald-700',
    cardGradient: 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500', cardText: 'text-white', cardIconBg: 'bg-white/20', badgeBg: 'bg-white/25', badgeText: 'text-white',
  },
  // More specific "non-akademik" variants MUST come before generic "prestasi"
  // to avoid "prestasi non-akademik" matching "prestasi" first and getting wrong color
  'prestasi non akademik': {
    color: 'teal', bgColor: 'bg-teal-50', borderColor: 'border-teal-500', headerBg: 'bg-teal-50/80', iconBg: 'bg-teal-100', iconColor: 'text-teal-600', btnColor: 'bg-teal-600 hover:bg-teal-700',
    cardGradient: 'bg-gradient-to-br from-teal-500 via-cyan-500 to-sky-500', cardText: 'text-white', cardIconBg: 'bg-white/20', badgeBg: 'bg-white/25', badgeText: 'text-white',
  },
  'prestasi non-akademik': {
    color: 'teal', bgColor: 'bg-teal-50', borderColor: 'border-teal-500', headerBg: 'bg-teal-50/80', iconBg: 'bg-teal-100', iconColor: 'text-teal-600', btnColor: 'bg-teal-600 hover:bg-teal-700',
    cardGradient: 'bg-gradient-to-br from-teal-500 via-cyan-500 to-sky-500', cardText: 'text-white', cardIconBg: 'bg-white/20', badgeBg: 'bg-white/25', badgeText: 'text-white',
  },
  'nonakademik': {
    color: 'teal', bgColor: 'bg-teal-50', borderColor: 'border-teal-500', headerBg: 'bg-teal-50/80', iconBg: 'bg-teal-100', iconColor: 'text-teal-600', btnColor: 'bg-teal-600 hover:bg-teal-700',
    cardGradient: 'bg-gradient-to-br from-teal-500 via-cyan-500 to-sky-500', cardText: 'text-white', cardIconBg: 'bg-white/20', badgeBg: 'bg-white/25', badgeText: 'text-white',
  },
  'non-akademik': {
    color: 'teal', bgColor: 'bg-teal-50', borderColor: 'border-teal-500', headerBg: 'bg-teal-50/80', iconBg: 'bg-teal-100', iconColor: 'text-teal-600', btnColor: 'bg-teal-600 hover:bg-teal-700',
    cardGradient: 'bg-gradient-to-br from-teal-500 via-cyan-500 to-sky-500', cardText: 'text-white', cardIconBg: 'bg-white/20', badgeBg: 'bg-white/25', badgeText: 'text-white',
  },
  'prestasi': {
    color: 'emerald', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-500', headerBg: 'bg-emerald-50/80', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', btnColor: 'bg-emerald-600 hover:bg-emerald-700',
    cardGradient: 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500', cardText: 'text-white', cardIconBg: 'bg-white/20', badgeBg: 'bg-white/25', badgeText: 'text-white',
  },
  'bencana': {
    color: 'red', bgColor: 'bg-red-50', borderColor: 'border-red-500', headerBg: 'bg-red-50/80', iconBg: 'bg-red-100', iconColor: 'text-red-600', btnColor: 'bg-red-600 hover:bg-red-700',
    cardGradient: 'bg-gradient-to-br from-red-500 via-rose-500 to-pink-500', cardText: 'text-white', cardIconBg: 'bg-white/20', badgeBg: 'bg-white/25', badgeText: 'text-white',
  },
}

// Fallback colors for custom jalur (cycling through these)
const FALLBACK_COLORS = [
  { color: 'rose', bgColor: 'bg-rose-50', borderColor: 'border-rose-500', headerBg: 'bg-rose-50/80', iconBg: 'bg-rose-100', iconColor: 'text-rose-600', btnColor: 'bg-rose-600 hover:bg-rose-700', cardGradient: 'bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500', cardText: 'text-white', cardIconBg: 'bg-white/20', badgeBg: 'bg-white/25', badgeText: 'text-white' },
  { color: 'indigo', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-500', headerBg: 'bg-indigo-50/80', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600', btnColor: 'bg-indigo-600 hover:bg-indigo-700', cardGradient: 'bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500', cardText: 'text-white', cardIconBg: 'bg-white/20', badgeBg: 'bg-white/25', badgeText: 'text-white' },
  { color: 'amber', bgColor: 'bg-amber-50', borderColor: 'border-amber-500', headerBg: 'bg-amber-50/80', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', btnColor: 'bg-amber-600 hover:bg-amber-700', cardGradient: 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-500', cardText: 'text-white', cardIconBg: 'bg-white/20', badgeBg: 'bg-white/25', badgeText: 'text-white' },
  { color: 'lime', bgColor: 'bg-lime-50', borderColor: 'border-lime-500', headerBg: 'bg-lime-50/80', iconBg: 'bg-lime-100', iconColor: 'text-lime-600', btnColor: 'bg-lime-600 hover:bg-lime-700', cardGradient: 'bg-gradient-to-br from-lime-500 via-green-500 to-emerald-500', cardText: 'text-white', cardIconBg: 'bg-white/20', badgeBg: 'bg-white/25', badgeText: 'text-white' },
  { color: 'fuchsia', bgColor: 'bg-fuchsia-50', borderColor: 'border-fuchsia-500', headerBg: 'bg-fuchsia-50/80', iconBg: 'bg-fuchsia-100', iconColor: 'text-fuchsia-600', btnColor: 'bg-fuchsia-600 hover:bg-fuchsia-700', cardGradient: 'bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-500', cardText: 'text-white', cardIconBg: 'bg-white/20', badgeBg: 'bg-white/25', badgeText: 'text-white' },
]

// subJalurFilter mapping — maps jalur nama to the subJalur value used in Registration data
const JALUR_SUB_FILTER_MAP: Record<string, string> = {
  'Keluarga Tidak Mampu': 'Keluarga Tidak Mampu',
  'Penyandang Disabilitas': 'Disabilitas',
  'Mutasi Orangtua/Wali': 'Mutasi',
  'Anak Guru': 'Anak Guru',
  'Prestasi Akademik': 'Prestasi',
  'Prestasi Nonakademik': 'Prestasi Nonakademik',
  'Prestasi Non Akademik': 'Prestasi Nonakademik',
  'Prestasi Non-Akademik': 'Prestasi Nonakademik',
  // Legacy typo aliases (data may exist in DB with these spellings)
  'Presatasi Nonakademik': 'Prestasi Nonakademik',
  'Presatasi Non Akademik': 'Prestasi Nonakademik',
  'Presatasi Non-Akademik': 'Prestasi Nonakademik',
  'Terdampak Bencana Alam': 'Terdampak Bencana Alam',
  'Domisili': 'Domisili',
}

// Jalur Hierarchy — defines parent-child relationships for Lembar Verifikasi tabs
// Child jalur names must match the jalurConfig nama in the database
// needsSkor: whether this jalur needs skor/nilai for ranking (false = jarak only)
export const JALUR_HIERARCHY: Array<{
  parentNama: string
  children: Array<{ nama: string; label: string; needsSkor: boolean }>
  needsSkor?: boolean  // parent default (children can override)
}> = [
  {
    parentNama: 'Jalur Afirmasi',
    needsSkor: false,  // Afirmasi overall = jarak only
    children: [
      { nama: 'Keluarga Tidak Mampu', label: 'Keluarga Tidak Mampu', needsSkor: false },
      { nama: 'Penyandang Disabilitas', label: 'Penyandang Disabilitas', needsSkor: false },
      { nama: 'Terdampak Bencana Alam', label: 'Terdampak Bencana Alam', needsSkor: false },
    ],
  },
  {
    parentNama: 'Jalur Mutasi',
    needsSkor: false,  // Mutasi overall = jarak only
    children: [
      { nama: 'Mutasi Orangtua/Wali', label: 'Mutasi Orangtua/Wali', needsSkor: false },
      { nama: 'Anak Guru', label: 'Anak Guru', needsSkor: false },
    ],
  },
  {
    parentNama: 'Domisili',
    needsSkor: true,   // Domisili needs skor/nilai
    children: [],
  },
  {
    parentNama: 'Prestasi',
    needsSkor: true,   // Prestasi overall needs skor
    children: [
      { nama: 'Prestasi Akademik', label: 'Prestasi Akademik', needsSkor: true },
      { nama: 'Prestasi Nonakademik', label: 'Prestasi Non-Akademik', needsSkor: false },
    ],
  },
]

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

// Robust normalize: lowercase + remove all spaces, hyphens, and non-alphanumeric for fuzzy matching
// Handles: "Prestasi Non-Akademik" → "prestasinonakademik", "Prestasi Non Akademik" → "prestasinonakademik"
const normalizeJalur = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

// Known typo aliases: maps incorrect spellings to the correct name used in JALUR_HIERARCHY children
// This ensures matching works even before database migration runs
const JALUR_TYPO_ALIASES: Record<string, string> = {
  'Presatasi Nonakademik': 'Prestasi Nonakademik',
  'Presatasi Non Akademik': 'Prestasi Nonakademik',
  'Presatasi Non-Akademik': 'Prestasi Nonakademik',
  'Presatasi Akademik': 'Prestasi Akademik',
}

// Resolve a jalur nama to its canonical name (fixing known typos)
const resolveJalurName = (nama: string): string => {
  return JALUR_TYPO_ALIASES[nama] || nama
}

// Build Lembar Verifikasi config from jalurConfigs with hierarchical structure
export function buildLembarVerifikasi(jalurConfigs: Array<{ id: string; nama: string; urutan: number; aktif: boolean }>): LembarVerifikasiConfig[] {
  const active = jalurConfigs.filter(j => j.aktif)

  // Build a normalized set of all child jalur names that are grouped under parents
  // Using normalized keys for fuzzy matching
  const childJalurNamesNormalized = new Map<string, string>() // normalized → original child.nama
  for (const group of JALUR_HIERARCHY) {
    for (const child of group.children) {
      childJalurNamesNormalized.set(normalizeJalur(child.nama), child.nama)
    }
  }

  const result: LembarVerifikasiConfig[] = []
  let colorIdx = 0
  // Track which jalurConfigs have been matched to avoid adding them as standalone
  const matchedJalurIds = new Set<string>()

  for (const group of JALUR_HIERARCHY) {
    const parentKey = group.parentNama.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const parentIcon = getJalurIcon(group.parentNama)
    const parentColors = getJalurColors(group.parentNama, colorIdx)
    const parentNeedsSkor = group.needsSkor ?? true
    colorIdx++

    if (group.children.length === 0) {
      // Standalone jalur (e.g. Domisili) — find the matching jalurConfig
      const matchConfig = active.find(j => {
        const resolved = resolveJalurName(j.nama)
        return resolved.toLowerCase() === group.parentNama.toLowerCase() || normalizeJalur(resolved) === normalizeJalur(group.parentNama)
      })
      if (matchConfig) {
        matchedJalurIds.add(matchConfig.id)
        const subJalurFilter = getJalurSubFilter(matchConfig.nama)
        result.push({
          key: parentKey,
          label: group.parentNama,
          icon: parentIcon,
          subJalurFilter,
          ...parentColors,
          description: `Verifikasi pendaftar jalur ${group.parentNama}`,
          needsSkor: parentNeedsSkor,
        })
      }
    } else {
      // Parent with children — find matching child configs
      // Normalize for matching: remove all non-alphanumeric chars to handle variations like
      // "Prestasi Non-Akademik" vs "Prestasi Non Akademik" vs "Prestasi Nonakademik"
      const childrenConfigs = group.children
        .map(child => {
          const cfg = active.find(j => {
            const resolved = resolveJalurName(j.nama)
            return resolved === child.nama || normalizeJalur(resolved) === normalizeJalur(child.nama)
          })
          if (cfg) matchedJalurIds.add(cfg.id)
          return cfg ? { ...child, config: cfg, nama: cfg.nama } : null
        })
        .filter(Boolean) as Array<{ nama: string; label: string; needsSkor: boolean; config: { id: string; nama: string; urutan: number; aktif: boolean } }>

      if (childrenConfigs.length === 0) continue

      // Build children configs
      const childConfigs: LembarVerifikasiConfig[] = childrenConfigs.map((child, ci) => {
        const childKey = `${parentKey}-${child.nama.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
        const childSubFilter = getJalurSubFilter(child.nama)
        const childIcon = getJalurIcon(child.nama)
        const childColors = getJalurColors(child.nama, ci)
        return {
          key: childKey,
          label: child.label,
          icon: childIcon,
          subJalurFilter: childSubFilter,
          ...childColors,
          description: `Verifikasi pendaftar ${child.label}`,
          parentKey,
          needsSkor: child.needsSkor,
        }
      })

      // Parent subJalurFilter = comma-separated children filters
      const parentSubFilter = childConfigs.map(c => c.subJalurFilter).join(',')

      result.push({
        key: parentKey,
        label: group.parentNama,
        icon: parentIcon,
        subJalurFilter: parentSubFilter,
        ...parentColors,
        description: `Verifikasi pendaftar jalur ${group.parentNama}`,
        children: childConfigs,
        subCategories: childConfigs.map(c => c.label),
        needsSkor: parentNeedsSkor,
      })
    }
  }

  // Also add any jalur configs that are NOT part of the hierarchy (custom additions)
  // Use normalized matching to avoid adding already-matched jalur as standalone
  for (const jalur of active) {
    if (matchedJalurIds.has(jalur.id)) continue

    const jalurNorm = normalizeJalur(resolveJalurName(jalur.nama))
    const isMatchedChild = childJalurNamesNormalized.has(jalurNorm)
    const isParent = JALUR_HIERARCHY.some(g => normalizeJalur(g.parentNama) === jalurNorm)
    const isStandalone = JALUR_HIERARCHY.some(g => g.children.length === 0 && normalizeJalur(g.parentNama) === jalurNorm)
    if (!isMatchedChild && !isParent && !isStandalone) {
      const key = jalur.nama.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const colors = getJalurColors(jalur.nama, colorIdx)
      const icon = getJalurIcon(jalur.nama)
      const subJalurFilter = getJalurSubFilter(jalur.nama)
      result.push({
        key,
        label: jalur.nama,
        icon,
        subJalurFilter,
        ...colors,
        description: `Verifikasi pendaftar jalur ${jalur.nama}`,
        needsSkor: true, // default for custom jalur
      })
      colorIdx++
    }
  }

  return result
}

// Flatten the hierarchical lembarVerifikasi to get all leaf configs (for stats/dropdowns)
export function flattenLembarConfigs(configs: LembarVerifikasiConfig[]): LembarVerifikasiConfig[] {
  const result: LembarVerifikasiConfig[] = []
  for (const cfg of configs) {
    if (cfg.children && cfg.children.length > 0) {
      result.push(...cfg.children)
    } else {
      result.push(cfg)
    }
  }
  return result
}

// StatBar helper component (also used in dashboard)
export function StatBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500 tabular-nums font-medium">{count} <span className="text-gray-400">({total > 0 ? Math.round((count / total) * 100) : 0}%)</span></span>
      </div>
      <div className="w-full bg-gray-100/80 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all duration-700 ease-out shadow-sm ${color}`}
          style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
        />
      </div>
    </div>
  )
}
