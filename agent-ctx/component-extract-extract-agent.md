---
Task ID: component-extract
Agent: extract-agent
Task: Extract LembarVerifikasiSheet to reduce page.tsx size and fix OOM crash

Work Log:
- Read page.tsx (9428 lines) to understand the LembarVerifikasiSheet component (lines 872-2232) and all its dependencies
- Identified shared types, constants, utilities, and sub-components used by both LembarVerifikasiSheet and the Home component
- Created /src/lib/types.ts with shared interfaces: Registration, DashboardStats, PaginationInfo, LembarVerifikasiData, LembarVerifikasiConfig
- Created /src/lib/constants.ts with shared constants: STATUS_COLORS, STATUS_LULUS_COLORS, STATUS_DAFTAR_ULANG_COLORS, DEFAULT_KEKURANGAN_OPTIONS, SUB_JALUR_COLORS
- Created /src/lib/utils-shared.tsx with shared utilities: hitungLamaKK, isKKKurangSetahun, dedupById, buildLembarVerifikasi, getJalurIcon, getJalurColors, getJalurSubFilter, StatBar, and jalur config mappings
- Created /src/components/KekuranganVerifSelect.tsx with KekuranganVerifSelect and VerifyKekuranganPicker components
- Created /src/components/LembarVerifikasiSheet.tsx with the full LembarVerifikasiSheet component
- Updated /src/app/page.tsx to import from new shared files and removed ~2120 lines of inline code
- Added lucide-react import block back that was accidentally removed during the file reconstruction
- Ran `bun run lint` - passes with zero errors
- Verified dev server starts successfully with `npx next dev -p 3000` - page loads with HTTP 200

Stage Summary:
- Reduced page.tsx from 9428 lines to 7314 lines (reduction of ~2114 lines, ~22%)
- Extracted LembarVerifikasiSheet (1434 lines) into separate component file
- Extracted KekuranganVerifSelect + VerifyKekuranganPicker (369 lines) into separate component file
- Created shared types (115 lines), constants (128 lines), and utils (173 lines) files
- All code is properly typed with TypeScript and uses 'use client' directive where needed
- Lint passes cleanly, dev server runs without OOM
