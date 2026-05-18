# Task: Add Verification Data Columns to Lembar Verifikasi Table

## Summary
Added important verification data columns to the Lembar Verifikasi table, matching the layout from the user's screenshot. All changes were successfully implemented.

## Changes Made

### 1. Registration Interface (`src/app/page.tsx`)
- Added new optional fields to the Registration interface:
  - `skorNilaiRaport?: string | null`
  - `kekuranganVerifikasi?: string | null`
  - `tanggalVerif?: string | null`
  - `jamVerif?: string | null`
  - `terbitKK?: string | null`
  - `lamaKK?: string | null`
  - `dokumen?: string | null`

### 2. PATCH API Endpoint (`src/app/api/registrations/[id]/route.ts`)
- Created new PATCH endpoint for updating verification fields
- Supports both single field update (`{ field, value }`) and multiple field update
- Allowed fields: `kekuranganVerifikasi`, `tanggalVerif`, `jamVerif`, `terbitKK`, `lamaKK`, `skorNilaiRaport`

### 3. Lembar Verifikasi Table
- Replaced old table columns with new column layout:
  - No (row number from pagination)
  - Checkbox (for bulk actions)
  - Skor Jarak
  - Skor Nilai Raport (editable inline)
  - Kekurangan Verifikasi (editable inline)
  - Tanggal Verif (editable inline, date input)
  - Jam Verif (editable inline, time input)
  - Terbit KK (editable inline, date input)
  - Lama KK (editable inline, text input)
  - No. Registrasi
  - Nama Peserta
  - Asal Sekolah
  - Status
  - Aksi (action buttons)
- Added inline editing with:
  - Click to edit pattern (shows input on click)
  - Save on blur or Enter key
  - Cancel on Escape key
  - Pencil icon indicator on hover
  - Light blue background on hover for editable cells
  - PATCH request to `/api/registrations/{id}` on save

### 4. Portal Paste Parser
- Added parsing for `skorNilaiRaport` (from "Skor Nilai Raport" label, fallback to nilaiRataRata)
- Added parsing for `dokumen` (from "Dokumen" section)

### 5. Detail Dialog
- Added "Data Verifikasi" section with fields:
  - Skor Nilai Raport
  - Kekurangan Verifikasi
  - Tanggal Verifikasi
  - Jam Verifikasi
  - Terbit KK
  - Lama KK
  - Dokumen
- Added `skorNilaiRaport` display in the Portal SPMB data section

### 6. Portal Paste Dialog Preview
- Added Skor Jarak display
- Added Skor Nilai Raport display
- Added "Data Verifikasi" section with Dokumen display

## Files Modified
- `src/app/page.tsx` - Main page component with all UI changes
- `src/app/api/registrations/[id]/route.ts` - New PATCH endpoint
- `prisma/schema.prisma` - Already had the new columns (pre-existing)
- `src/app/api/registrations/portal-paste/route.ts` - Already had the new fields (pre-existing)

## Testing
- PATCH endpoint verified working with test data
- Dev server compiles successfully
- Lint passes with no errors
