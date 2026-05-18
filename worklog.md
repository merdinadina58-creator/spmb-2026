---
Task ID: 1
Agent: Main
Task: Fix "Gagal Menambah Jalur" error

Work Log:
- Investigated the root cause: Prisma Client was not refreshed after adding JalurConfig and Setting models to schema
- The running Next.js server cached the old Prisma Client that didn't have jalurConfig and setting models
- Regenerated Prisma Client with `npx prisma generate`
- Cleared .next cache and restarted dev server
- Verified API works: POST /api/settings/jalur returns success with created jalur data

Stage Summary:
- Root cause: Stale Prisma Client cache after schema changes
- Fix: Regenerate Prisma Client + restart dev server
- All 7 default jalur configs are seeded correctly in the database

---
Task ID: 2
Agent: Main
Task: Create Portal Sync feature to auto-fetch data from SPMB Sumatera Utara portal

Work Log:
- Investigated the portal URL using web-reader skill - found it requires login (email + password)
- Used agent-browser to inspect the login page structure (email textbox @e2, password textbox @e4, login button @e3)
- Created `/scripts/portal-sync.ts` - a standalone browser automation script using agent-browser CLI
  - Logs in to the portal with provided credentials
  - Navigates to the registration table page
  - Extracts table data from each page using JavaScript eval
  - Handles pagination by navigating to next page URLs
  - Outputs JSON lines for progress tracking
- Created `/src/app/api/portal-sync/route.ts` - API endpoint that:
  - Accepts email, password, pages, and status parameters
  - Runs the portal-sync script
  - Parses the output and maps portal table headers to our schema
  - Saves data using NISN-based deduplication (same logic as portal-paste)
  - Returns created/updated/unchanged counts
- Added Portal Sync UI in the Pengaturan tab:
  - Email and password input fields
  - Status filter dropdown (Accepted, All, Pending, Rejected)
  - Page count configuration
  - Sync button with loading state
  - Result display showing created/updated/unchanged/total counts
  - Direct link to open portal in new tab
- Added new lucide-react icons: Globe, RefreshCw, Lock, Mail

Stage Summary:
- Complete portal sync feature from SPMB Sumatera Utara admin portal
- Uses agent-browser for headless browser automation
- Same deduplication logic as existing Paste Portal feature
- UI integrated into the Pengaturan tab

---
Task ID: 3
Agent: Main
Task: Make Paste Portal dynamically follow jalur from Pengaturan settings

Work Log:
- Analyzed current Paste Portal subJalur detection: hardcoded list of 8 jalur names
- Replaced hardcoded `subJalurOptions` in `parsePortalText` with dynamic detection from `jalurConfigs` state
- Added portal alias mapping: 'Afirmasi' → 'Afirmasi (KTM)', 'KTM' → 'Afirmasi (KTM)', 'Penyandang Disabilitas' → 'Disabilitas', etc.
- Only includes aliases that map to active jalur in Pengaturan
- Uses `getJalurSubFilter()` to correctly map jalur config names to subJalur values used in Registration data
- Added `portalSelectedJalur` state for the jalur selector dropdown
- Added Jalur Pendaftaran selector card in Paste Portal preview dialog:
  - Dropdown with all active jalur from Pengaturan (with icons and subJalur mapping shown)
  - Auto-selects detected jalur from pasted text
  - Shows which Lembar Verifikasi tab the data will appear in
  - Save button disabled if no jalur selected
- Updated `handlePortalSave` to use selected jalur (overrides auto-detected)
- Added cleanup of internal `_detectedJalurNama` temp field before saving to API
- Reset `portalSelectedJalur` when dialog closes or data is saved
- Lint passes, no errors

Stage Summary:
- Paste Portal now dynamically uses jalur from Pengaturan settings
- Users can confirm/change the jalur before saving via dropdown
- Data is correctly mapped to the corresponding Lembar Verifikasi tab
- Custom jalur added in Pengaturan are automatically available in Paste Portal
