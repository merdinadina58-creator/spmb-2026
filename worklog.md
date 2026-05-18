---
Task ID: 1
Agent: Main Agent
Task: Create login page with authentication for SPMB 2026 application

Work Log:
- Added `User` model to Prisma schema (username, password, namaLengkap, role, aktif, lastLogin)
- Ran `prisma db push` and `prisma generate` to apply schema changes
- Created `/api/auth/setup` route - GET checks if setup needed, POST creates first admin user
- Created `/api/auth/login` route - validates credentials, creates session token stored in Setting table, sets httpOnly cookie
- Created `/api/auth/me` route - checks session cookie, validates session from DB, returns user info
- Created `/api/auth/logout` route - deletes session from DB, clears cookie
- Modified `page.tsx` to add conditional rendering:
  - Auth loading screen with animated logo
  - First-time setup screen (creates admin account when no users exist)
  - Login screen with beautiful dark emerald gradient design
  - Main application (only shown when authenticated)
- Added user info display and logout button to header
- Used SHA-256 + salt for password hashing
- Session tokens stored in Setting table with 7-day expiry
- All React hooks properly placed before conditional returns to follow rules of hooks
- Lint passes cleanly

Stage Summary:
- Login system fully implemented with setup, login, session management, and logout
- Beautiful dark emerald gradient login/setup screens matching the app's visual style
- Password hashing with SHA-256 + random salt
- Cookie-based session with 7-day expiry
- User avatar and role display in header
- Logout button with confirmation
- First-time setup flow: detects no users → shows setup form → auto-logs in after setup
