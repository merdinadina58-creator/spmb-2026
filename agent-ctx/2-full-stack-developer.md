---
Task ID: 2
Agent: full-stack-developer
Task: Refactor page.tsx by extracting components

Work Log:
- Read entire 5,761-line page.tsx to understand structure
- Created utility files: parse-portal.ts, parse-sumut-berkah.ts, ranking-print.ts
- Created component files: AuthScreens, DashboardTab, DataPendaftarTab, RankingTab, DiterimaTab, DitolakTab, KelulusanTab, DaftarUlangTab, PengaturanTab, AppLayout
- Updated page.tsx to import and use all extracted components
- Added `dialogs` prop to AppLayout for global dialog rendering
- Fixed lint errors
- Verified dev server compiles (200 OK)

Stage Summary:
- page.tsx reduced from 5,761 to 1,590 lines (72% reduction)
- 13 new files created (3 utility + 10 component)
- All functionality preserved
- Dev server compiles successfully
