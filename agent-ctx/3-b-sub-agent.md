# Task 3-b: Extract Pengaturan Tab

## Summary
Successfully extracted the Pengaturan (Settings) Tab from `src/app/page.tsx` into `src/components/tabs/PengaturanTab.tsx`.

## What was done
1. Created `/src/components/tabs/PengaturanTab.tsx` as a `'use client'` component with:
   - Props: `authUser`, `toast`, `onDataChanged`, `onJalurConfigsChanged`
   - Internal state: kuota, jalurConfigs, settingsLoading, settingsSaving, newJalurNama, newJalurPersentase, addJalurOpen, portalSyncOpen/Email/Password/Status/Pages/ing/Result
   - Local confirm dialog (AlertDialog) for delete jalur
   - All functions: fetchSettings, saveKuota, updateJalurPersentase, addJalur, doDeleteJalur, toggleJalurAktif, handlePortalSync
   - All JSX exactly as original (header, kuota input, distribusi jalur, portal sync, add jalur dialog)

2. Updated `src/app/page.tsx`:
   - Added dynamic import for PengaturanTab
   - Removed all pengaturan-specific state (kept jalurConfigs for cross-component use)
   - Removed portal sync state
   - Simplified fetchSettings to only set jalurConfigs
   - Removed saveKuota, updateJalurPersentase, addJalur, doDeleteJalur, toggleJalurAktif, handlePortalSync
   - Replaced inline tab JSX with `<PengaturanTab>` component

## Key Design Decisions
- `jalurConfigs` remains in parent because it's used by lembarVerifikasi, subJalurOptions, CSV import, and ranking tab
- PengaturanTab syncs jalurConfigs changes back to parent via `onJalurConfigsChanged` callback
- Uses local AlertDialog instead of parent's shared confirm dialog for better encapsulation

## Verification
- `bun run lint` passes with no errors
- Dev server running successfully
