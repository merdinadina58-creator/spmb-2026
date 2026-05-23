# SPMB 2026 - Sistem Verifikasi Pendaftaran

Sistem Verifikasi Penerimaan Peserta Didik Baru Tahun 2026

## Fitur

- Dashboard statistik pendaftaran
- Import data CSV dari portal SPMB
- Paste data langsung dari portal SPMB
- Lembar Verifikasi dengan inline editing
- Perangkingan otomatis berdasarkan skor
- Pengaturan kuota & jalur pendaftaran
- Manajemen user (Admin & Verifikator)
- Export PDF & Excel
- PWA (Progressive Web App) - bisa di-install di device
- Data tersimpan di database (aman saat clear history browser)

## Tech Stack

- Next.js 16 + TypeScript
- Prisma ORM + PostgreSQL (Neon)
- Tailwind CSS + shadcn/ui
- PWA (Service Worker + Manifest)

## Deploy ke Railway

1. Push repository ini ke GitHub
2. Buka [railway.com](https://railway.com) → login dengan GitHub
3. Klik "New Project" → "Deploy from GitHub repo" → pilih repository ini
4. Set Shared Variable:
   - `DATABASE_URL` = `postgresql://user:password@host.neon.tech/dbname?sslmode=require`
   (Dapatkan connection string dari Neon.tech dashboard)
5. Railway akan otomatis build dan deploy
6. Buka URL yang diberikan Railway
7. Login pertama kali akan otomatis membuat akun admin

## Setup Database (Neon.tech)

1. Buka [neon.tech](https://neon.tech) → daftar dengan GitHub
2. Buat project baru → copy connection string
3. Paste connection string ke `DATABASE_URL` di Railway

## Deploy ke VPS (Manual)

```bash
# Clone repository
git clone https://github.com/USERNAME/spmb-2026.git
cd spmb-2026

# Install dependencies
bun install

# Setup database
bun run db:push

# Build
bun run build

# Jalankan dengan PM2
pm2 start bun --name "spmb-2026" -- start
```

## Login Pertama

Saat pertama kali menjalankan aplikasi, sistem akan otomatis menampilkan halaman setup untuk membuat akun admin.

## Catatan Penting

- Semua data tersimpan di PostgreSQL database (Neon), **bukan** di browser
- Data **TIDAK akan hilang** saat redeploy atau clear history
- Anda hanya perlu login ulang jika session habis/clear history
- Aplikasi bisa di-install sebagai PWA di Android & PC
