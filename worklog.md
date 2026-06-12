---
Task ID: 1
Agent: Main Agent
Task: Implement pathway-specific ranking sort logic for ranking printing/export

Work Log:
- Explored the codebase to understand the ranking system architecture
- Found 3 key files: ranking API route, ranking-print.ts, RankingPreviewDialog.tsx
- Identified that the API already correctly routes prestasi scores based on jalur, but print/export functions didn't re-sort by prestasi score
- Added `isAkademikJalur()`, `isPrestasiJalur()`, and `reSortByPrestasiJalur()` helper functions to ranking-print.ts
- Added same helper functions to RankingPreviewDialog.tsx
- Modified `getRankingPrintHTML()` to re-sort data by appropriate prestasi score when selected jalur is a prestasi type
- Modified `handleRankingExportExcel()` to re-sort data by appropriate prestasi score when selected jalur is a prestasi type
- Modified `RankingPreviewDialog` to re-sort preview data by appropriate prestasi score
- Fixed `isAkademikJalur()` to also match "Prestasi" (not just "Prestasi Akademik") since the database stores it as "Prestasi"
- Added `prestasiNote` to print HTML and Excel summary showing "(diurutkan berdasarkan Skor Prestasi sesuai jalur)"
- Added visual indicator in preview dialog showing auto re-sorting note
- Verified API ranking data is correctly sorted for both Prestasi and Prestasi Nonakademik
- Lint check passes (only pre-existing seed.cjs errors)

Stage Summary:
- Ranking print/export now automatically re-sorts by the correct prestasi score when a prestasi jalur is selected
- Prestasi (Akademik) → sorted by _skorPrestasiAkademikNum (descending)
- Prestasi Nonakademik → sorted by _skorPrestasiNonAkademikNum (descending)
- This applies regardless of the current tampilan mode (jarak/nilai/komposit/prestasi)
- Print HTML, Excel export, and preview dialog all updated
