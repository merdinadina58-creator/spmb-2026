---
Task ID: 1
Agent: Main
Task: Production hardening — audit and fix all critical security, crash, and data integrity issues

Work Log:
- Audited all 21 API route files for security vulnerabilities, crash risks, and data integrity issues
- Created shared auth library (/src/lib/auth.ts) with getAuthUser, getAdminUser, verifyPassword, hashPassword
- Added authentication to ALL previously unprotected endpoints (14 endpoints)
- Fixed command injection vulnerability in portal-sync (execSync → execFileSync)
- Fixed Settings GET exposing session tokens (now filters out session: keys)
- Added password split guard to prevent TypeError on corrupt passwords
- Added safe JSON.parse with try-catch for all session parsing
- Added NaN guards for parseInt in pagination (registrations/route.ts)
- Added existence checks before update/delete operations (404 instead of 500)
- Added enum validation for statusLulus and statusDaftarUlang fields
- Added value type validation for PATCH endpoint
- Optimized dashboard API with Promise.all (20+ sequential → parallel queries)
- Optimized ranking API (removed double fetch, using distinct queries)
- Added ErrorBoundary component for crash recovery
- Added session cleanup utility (auto-cleans expired sessions on login)
- Enhanced frontend fetchStats and fetchRegistrations with proper error handling

Stage Summary:
- All 13 critical/high issues from audit are FIXED
- All API endpoints now require authentication
- Command injection vulnerability patched
- Session tokens no longer exposed via API
- Error boundary prevents full-page crashes
- Dashboard and ranking performance significantly improved
- Lint passes clean, dev server running successfully
