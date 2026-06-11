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
