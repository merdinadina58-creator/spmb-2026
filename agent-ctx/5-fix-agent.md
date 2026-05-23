# Task 5 - Fix Duplicate React Key Error & Implement Paste Sumut Berkah Feature

## Agent: fix-agent

## Work Completed

### Task 1: Fix Duplicate React Key Error

1. **Added `dedupById` utility function** (line ~376 in page.tsx, after `isKKKurangSetahun`):
   ```typescript
   function dedupById<T extends { id: string }>(arr: T[]): T[] {
     const seen = new Set<string>()
     return arr.filter(item => {
       if (seen.has(item.id)) return false
       seen.add(item.id)
       return true
     })
   }
   ```

2. **Applied dedup in `fetchRegistrations`**: Changed `setRegistrations(data.data || [])` to `setRegistrations(dedupById(data.data || []))`

3. **Fixed all `key={reg.id}` patterns** with fallback keys:
   - Line ~1516: `key={reg.id || \`lembar-${idx}\`}`
   - Line ~4999: `key={reg.id || \`data-${idx}\`}`
   - Line ~5101: `key={reg.id || \`grouped-${globalIdx}\`}`
   - Line ~5759: `key={reg.id || \`diterima-${idx}\`}`
   - Line ~5933: `key={reg.id || \`ditolak-${idx}\`}`
   - Line ~6203: `key={reg.id || \`lulus-${idx}\`}`
   - Line ~6547: `key={reg.id || \`du-${idx}\`}`
   - Line ~9060: `key={reg.id || \`dup-${regIdx}\`}`

4. **Fixed `key={r.id as string}` patterns** in ranking views:
   - `key={r.id as string || \`rank-dom-${idx}\`}`
   - `key={r.id as string || \`rank-pres-${idx}\`}`
   - `key={r.id as string || \`rank-row-${idx}\`}`
   - `key={r.id as string || \`print-rank-${idx}\`}`

### Task 2: Implement Paste Sumut Berkah Feature

1. **Added `totalNilai` and `jarakKeSekolah` fields** to Registration interface (lines 155-157)

2. **Added state variables** (lines 2412-2417):
   - `sumutBerkahOpen`, `sumutBerkahText`, `sumutBerkahParsing`, `sumutBerkahResult`, `sumutBerkahPreview`

3. **Added parser function** `parseSumutBerkahText` (lines 3447-3516):
   - Supports HTML table parsing via DOMParser
   - Supports tab-separated plain text
   - Supports space-separated plain text (regex fallback)
   - Returns `{ nama, totalNilai, jarakKeSekolah }` array

4. **Added handler functions**:
   - `handleSumutBerkahParse` - parses text and shows preview
   - `handleSumutBerkahSave` - sends data to API and shows results

5. **Added "Paste Sumut Berkah" button** in Data Pendaftar tab (line 5029-5037)

6. **Created Sumut Berkah Dialog UI** (lines 8395-8543):
   - Step 1: Instructions + textarea for pasting
   - Step 2: Parsed data preview table
   - Step 3: Results display (matched/updated/notFound)

7. **Created backend API** `/api/registrations/sumut-berkah/route.ts`:
   - Auto-migrates `totalNilai` and `jarakKeSekolah` columns via ALTER TABLE IF NOT EXISTS
   - Efficient matching: fetches all registrations once, builds Map for O(1) case-insensitive lookup
   - Updates matched records
   - Returns `{ success, matched, updated, notFound }`

## Files Modified
- `/home/z/my-project/src/app/page.tsx` - All frontend changes
- `/home/z/my-project/src/app/api/registrations/sumut-berkah/route.ts` - New API endpoint

## Verification
- Lint passes clean
- Dev server running normally
