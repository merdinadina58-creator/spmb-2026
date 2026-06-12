---
Task ID: 1
Agent: Main Agent
Task: Fix pathway-specific ranking (Prestasi Akademik sorted by skorPrestasiAkademik, Prestasi Non-Akademik sorted by skorPrestasiNonAkademik)

Work Log:
- Analyzed existing ranking code in `/api/ranking/route.ts` - found that the sorting logic was ALREADY correct (getPrestasiScore() returns the right score based on jalur)
- Discovered the ROOT CAUSE: All Non-Akademik records had their prestasi scores stored in `skorPrestasiAkademik` instead of `skorPrestasiNonAkademik`, causing getPrestasiScore() to return -1 for all Non-Akademik records
- Found that `skorPrestasiNonAkademik` column didn't exist in the database - ran `prisma db push` to sync schema
- Fixed `parse-portal.ts`: Added jalur-aware score remapping logic at the end of parsePortalText() - when detected jalur is Non-Akademik, moves the value from skorPrestasiAkademik to skorPrestasiNonAkademik
- Fixed `portal-paste/route.ts`: Added safety net that remaps skorPrestasiAkademik → skorPrestasiNonAkademik for Non-Akademik records at the API level
- Created `/api/fix-prestasi-scores` endpoint to migrate existing data: moved 12 Non-Akademik records' scores from skorPrestasiAkademik to skorPrestasiNonAkademik
- Verified ranking via API: Both Akademik (sorted by skorPrestasiAkademik, 94 records) and Non-Akademik (sorted by skorPrestasiNonAkademik, 12 records) rankings work correctly
- Verified ranking in browser: Confirmed Prestasi Nonakademik ranking shows #1 SAMSON (38.75) → #12 Efatha (2.1875) with correct jalur-specific sorting

Stage Summary:
- Ranking logic was already implemented correctly - the issue was DATA, not logic
- Portal SPMB uses "Skor Prestasi Akademik" label for ALL pathways, causing misrouting of scores
- Fixed at 3 levels: parse-portal.ts (frontend parsing), portal-paste API (backend safety net), and DB migration (existing data)
- All 12 Non-Akademik records now have correct skorPrestasiNonAkademik values
- Both pathways now rank correctly: Akademik by skorPrestasiAkademik, Non-Akademik by skorPrestasiNonAkademik
