---
Task ID: 1
Agent: main
Task: Fix 403 Forbidden console errors on /api/ranking and /api/manifest

Work Log:
- Changed /api/ranking to return 200 with empty data instead of 403 when user is not admin
- Removed HEAD pre-check for /api/manifest in PWA registration code (was causing 403 in console)
- Added manifest link directly without pre-fetch, letting browser handle failures silently
- Verified both APIs return 200 in browser test

Stage Summary:
- /api/ranking now returns {success:true, data:[], ...} with 200 status instead of 403
- /api/manifest HEAD check removed, manifest link added directly after auth
- No more 403 console errors on Vercel preview deployments

---
Task ID: 2
Agent: main
Task: Fix Portal Paste save buttons - Simpan never works, Terima/Tolak sometimes work

Work Log:
- Root cause: Prisma unique constraints (@@unique([nisn, npsnSekolahPilihan]) and @@unique([noRegistrasi, npsnSekolahPilihan])) don't include tahap
- Previous dedup logic didn't filter by tahap → cross-tahap matches caused wrong records to be updated
- For PENDING saves: update appeared as no-op when existing record had same verificationStatus
- For REJECTED saves: always created new record but could fail on unique constraint violation
- Rewrote /api/registrations/portal-paste/route.ts with:
  1. tahap-aware dedup (all 6 priority queries now include tahap)
  2. Always update status and verificationStatus (even if same value) for explicit user choices
  3. Graceful unique constraint violation handling (catch Prisma P2002, find existing, update instead)
  4. Always update tahap when it differs from existing record
- Tested all three save paths via curl: PENDING, VERIFIED, REJECTED all work correctly
- Browser test confirmed all three buttons are enabled and functional

Stage Summary:
- Portal paste dedup now filters by tahap to avoid cross-tahap conflicts
- PENDING (Simpan) button now works by always updating verificationStatus and status
- REJECTED (Tolak & Simpan) now handles unique constraint violations gracefully
- Cross-tahap fallback function handles Prisma P2002 errors by finding and updating existing records

---
Task ID: 3
Agent: main
Task: Add sidebar minimize/maximize (collapse/expand) feature

Work Log:
- Added sidebarCollapsed state with localStorage persistence (key: spmb-sidebar-collapsed)
- Created SidebarNavItem component for cleaner code, supports both collapsed and expanded states
- When collapsed: sidebar width transitions from w-64 to w-16, only icons shown with tooltips on hover
- When expanded: full labels, badges, section headers displayed normally
- Added ChevronsLeft/ChevronsRight icons for minimize/expand toggle buttons
- Minimize button in expanded footer with text label "Minimize"
- Expand button in collapsed footer with title="Expand Sidebar"
- Smooth 300ms CSS transition on sidebar width change
- Wrapped entire layout in TooltipProvider for collapsed-mode tooltips
- Section dividers (Umum, Verifikasi, Hasil, Keputusan, Sistem) show as thin lines when collapsed
- User avatar in footer shows with tooltip when collapsed, full info when expanded
- Tested navigation in both states — all tabs work correctly
- Tested minimize/expand toggle — state persists in localStorage across reloads
- Lint check passes cleanly (errors only in pre-existing deploy-spmb2026 folder)

Stage Summary:
- Sidebar collapse/expand feature fully implemented and tested
- State persists in localStorage (spmb-sidebar-collapsed key)
- All existing features (navigation, badges, tooltips) work in both states
- Smooth transition animation (300ms ease-in-out)
- No regressions found in browser testing
---
Task ID: 1
Agent: Main
Task: Implement perangkingan berdasarkan Skor Prestasi Akademik dan Skor Prestasi Non Akademik sesuai jalur

Work Log:
- Analyzed existing code: API ranking, RankingTab, parse-portal, Prisma schema, utils-shared
- Discovered both Skor Prestasi Akademik and Non Akademik were stored in the same field (skorPrestasiAkademik)
- Added new `skorPrestasiNonAkademik` column to SQLite database
- Updated Prisma schema with new field
- Updated parse-portal.ts: separated parsing for Akademik and Non Akademik scores into their own fields
- Updated API ranking route: added `tampilan='prestasi'` sort mode that sorts by appropriate prestasi score based on jalur
- Added helper functions: `isNonAkademikJalur()`, `getPrestasiScore()`, `getPrestasiNumValue()`, `getPrestasiDisplayValue()`
- Updated all API routes to support skorPrestasiNonAkademik: portal-paste, import, portal-sync, [id]
- Updated RankingTab.tsx: added Prestasi option in sort dropdown, Prestasi column in table, updated mini-card
- Updated ranking-print.ts: added Skor Prestasi column in PDF and Excel, added two separate columns for Akademik/NonAkademik in Excel
- Updated RankingPreviewDialog.tsx: added Skor Pres. Non-Akd column
- Updated LembarVerifikasiSheet.tsx: added separate columns and edit fields for both scores
- Updated EditDialog.tsx: added separate input fields for both scores
- Updated DetailDialog.tsx: added display for Skor Prestasi Non Akademik
- Updated page.tsx: added skorPrestasiNonAkademik to editForm initialization
- Migrated existing data in SQLite (no data needed migration as no Non-Akademik scores existed)
- Tested with Agent Browser: confirmed Prestasi sort option, Prestasi column, and jalur separation working correctly

Stage Summary:
- Perangkingan now correctly sorts by Skor Prestasi Akademik for Prestasi Akademik jalur
- Perangkingan now correctly sorts by Skor Prestasi Non Akademik for Prestasi Non-Akademik jalur
- New `tampilan='prestasi'` mode added to API and frontend
- Both scores stored separately in database and displayed separately in all UI components
- Print/PDF/Excel exports include both Skor Prestasi Akademik and Non Akademik columns
