# Worklog - Task 2: Fix Kuota Matching Bug for Prestasi Nonakademik

## Task ID: 2
## Agent: Code Agent
## Date: 2026-06-13

## Summary
Fixed critical bug where "Prestasi Nonakademik" kuota incorrectly showed 54 (Prestasi Akademik's kuota) instead of 9. The root cause was fuzzy `.includes('prestasi')` matching that couldn't distinguish between Akademik and Nonakademik prestasi jalur types.

## Root Cause
The fuzzy kuota matching logic used `.includes('prestasi')` which matched BOTH "Prestasi Akademik" (kuota=54) AND "Prestasi Nonakademik" (kuota=9) against any jalur containing "prestasi". Since `.find()` returns the first match, "Prestasi Nonakademik" subJalur records always got matched to "Prestasi Akademik" kuota (54).

## Changes Made

### 1. NEW: `/home/z/my-project/src/lib/kuota-matching.ts`
Created shared module with:
- `isNonAkademikJalur()` - checks if a jalur name is Non-Akademik variant
- `isAkademikJalur()` - checks if a jalur name is Akademik variant (including plain "Prestasi")
- `matchKuotaForJalur()` - shared kuota matching function with 3-step strategy:
  1. **Exact normalized match** first (e.g., "prestasinonakademik" ↔ "prestasinonakademik")
  2. **Specific Prestasi matching** using isAkademikJalur/isNonAkademikJalur to distinguish
  3. **Fallback fuzzy matching** for other jalur types (domisili, mutasi, afirmasi)

### 2. FIXED: `/home/z/my-project/src/components/RankingTab.tsx` (ACTIVE)
- Added import for `matchKuotaForJalur` and `isNonAkademikJalur`
- Replaced local `isNonAkademikJalur` with imported version
- Replaced `presKuota` single-threshold (line ~276) with per-record `getPrestasiKuota()` using `matchKuotaForJalur`
- Replaced fuzzy matching at line ~414-421 with `matchKuotaForJalur`

### 3. FIXED: `/home/z/my-project/src/components/RankingPreviewDialog.tsx` (ACTIVE)
- Added import for `matchKuotaForJalur`, `isNonAkademikJalur`, `isAkademikJalur`
- Replaced local `isNonAkademikJalur`/`isAkademikJalur` with imported versions
- Replaced fuzzy matching at line ~300-307 with `matchKuotaForJalur`

### 4. FIXED: `/home/z/my-project/src/lib/ranking-print.ts` (ACTIVE - print/export)
- Added import for `matchKuotaForJalur`, `isNonAkademikJalur`, `isAkademikJalur`
- Replaced local `isNonAkademikJalur`/`isAkademikJalur` with imported versions
- Replaced `findKuota` function (line ~140-150) to delegate to `matchKuotaForJalur`
- Replaced inline fuzzy matching at line ~464-471 with `matchKuotaForJalur`
- Replaced inline fuzzy matching at line ~531-538 with `matchKuotaForJalur`

### 5. FIXED: `/home/z/my-project/src/components/tabs/RankingTab.tsx` (DEPRECATED)
- Added import for `matchKuotaForJalur`, `isNonAkademikJalur`, `isAkademikJalur`
- Replaced local `isNonAkademikJalur`/`isAkademikJalur` with imported versions
- Replaced fuzzy matching at 4 locations (lines ~193, ~330, ~753, ~951)

## Verification
- `npx eslint` on all 5 modified/new files: **PASSED** (0 errors)
- `bun run build`: **PASSED** (all routes compiled successfully)

## Impact
- "Prestasi Nonakademik" records now correctly show kuota=9 instead of 54
- "Prestasi" (Akademik) records continue to show kuota=54 correctly
- All other jalur types (Domisili, Mutasi, Afirmasi) continue to work with fallback matching
- PDF export, Excel export, ranking table, and preview dialog all use the same consistent logic
