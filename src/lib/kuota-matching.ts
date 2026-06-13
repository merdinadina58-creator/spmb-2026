/**
 * Shared kuota matching logic for SPMB 2026.
 *
 * CRITICAL FIX: The old fuzzy matching used `.includes('prestasi')` which matched
 * BOTH "Prestasi Akademik" (kuota=54) AND "Prestasi Nonakademik" (kuota=9) against
 * any jalur containing "prestasi". Since `.find()` returns the first match,
 * "Prestasi Nonakademik" subJalur records got matched to "Prestasi Akademik" kuota (54)
 * instead of "Prestasi Nonakademik" kuota (9).
 *
 * This module provides a single `matchKuotaForJalur` function used across all ranking
 * components to ensure consistent and correct kuota matching.
 */

/**
 * Check if a jalur/subJalur name refers to the Non-Akademik variant.
 * Examples that return true: "Prestasi Nonakademik", "Prestasi Non Akademik", "Prestasi Non-Akademik"
 */
export function isNonAkademikJalur(subJalur: string): boolean {
  const lower = subJalur.toLowerCase().replace(/[^a-z0-9]/g, '')
  return lower.includes('nonakademik')
}

/**
 * Check if a jalur/subJalur name refers to the Akademik variant.
 * This includes the plain "Prestasi" subJalur (which IS Akademik in the DB context).
 * Examples that return true: "Prestasi", "Prestasi Akademik"
 * Examples that return false: "Prestasi Nonakademik", "Prestasi Non Akademik"
 */
export function isAkademikJalur(subJalur: string): boolean {
  const lower = subJalur.toLowerCase().replace(/[^a-z0-9]/g, '')
  return (lower.includes('akademik') || lower === 'prestasi') && !lower.includes('nonakademik')
}

// Robust normalize: lowercase + remove all non-alphanumeric for fuzzy matching
// Handles: "Prestasi Non-Akademik" → "prestasinonakademik", "Prestasi Non Akademik" → "prestasinonakademik"
const normalizeJalur = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

/**
 * Kuota config entry shape (matches what components pass in).
 */
export interface KuotaEntry {
  nama: string
  persentase: number
  kuota: number
}

/**
 * Match a subJalur (from Registration) to the correct kuota entry (from JalurConfig).
 *
 * Matching strategy (in order):
 * 1. Exact normalized match — e.g., "prestasinonakademik" ↔ "prestasinonakademik"
 * 2. Specific Prestasi matching — uses isAkademikJalur/isNonAkademikJalur to
 *    distinguish "Prestasi" (→ Akademik) from "Prestasi Nonakademik" (→ Nonakademik)
 * 3. Fallback fuzzy matching for other jalur types (domisili, mutasi, afirmasi)
 */
export function matchKuotaForJalur(
  subJalur: string,
  rankingKuotaPerJalur: Array<KuotaEntry>
): number {
  const jalurName = subJalur.toLowerCase()
  const jalurNorm = normalizeJalur(subJalur)

  // 1. Try exact normalized match first
  // e.g., "Prestasi Nonakademik" → "prestasinonakademik" matches config "Prestasi Nonakademik"
  const exactMatch = rankingKuotaPerJalur.find(k => normalizeJalur(k.nama) === jalurNorm)
  if (exactMatch) return exactMatch.kuota

  // 2. Specific Prestasi matching: distinguish Akademik vs Nonakademik
  // This is the core fix — the old `includes('prestasi')` matched both variants to the first found
  if (isNonAkademikJalur(subJalur)) {
    const nonAkdMatch = rankingKuotaPerJalur.find(k =>
      isNonAkademikJalur(k.nama) && normalizeJalur(k.nama).includes('prestasi')
    )
    if (nonAkdMatch) return nonAkdMatch.kuota
  }

  if (isAkademikJalur(subJalur)) {
    const akdMatch = rankingKuotaPerJalur.find(k =>
      isAkademikJalur(k.nama) && normalizeJalur(k.nama).includes('prestasi')
    )
    if (akdMatch) return akdMatch.kuota
  }

  // 3. Fallback: fuzzy matching for other jalur types (domisili, mutasi, afirmasi)
  const fallbackMatch = rankingKuotaPerJalur.find(k => {
    const kNorm = k.nama.toLowerCase()
    return kNorm.includes(jalurName) || jalurName.includes(kNorm)
      || (kNorm.includes('domisili') && jalurName.includes('domisili'))
      || (kNorm.includes('mutasi') && jalurName.includes('mutasi'))
      || (kNorm.includes('afirmasi') && (jalurName.includes('keluarga') || jalurName.includes('ktm')))
  })
  return fallbackMatch?.kuota || 0
}
