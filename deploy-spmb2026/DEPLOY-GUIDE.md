# 🚀 Panduan Deploy SPMB 2026 ke Railway

## SEBELUM DEPLOY - Pengecekan

✅ Database: PostgreSQL (Neon) - data PERMANEN  
✅ Tidak ada localStorage - semua data di database  
✅ Prisma schema: provider = "postgresql"  
✅ Procfile: sudah ada  
✅ Kode sudah di-push ke GitHub: `merdinadina58-creator/spmb-2026`

---

## Hal yang Sudah Siap

| Item | Status |
|------|--------|
| Neon PostgreSQL Database | ✅ Sudah dibuat |
| Connection String | ✅ Sudah ada |
| GitHub Repo | ✅ Kode terbaru sudah push |
| Prisma PostgreSQL | ✅ Schema sudah diubah |
| Tidak ada localStorage | ✅ Semua di database |

---

## Connection String Neon

```
postgresql://neondb_owner:npg_lJQ5pe2ayVGH@ep-bitter-salad-ao7imaxp-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

> ⚠️ JANGAN gunakan `channel_binding=require` - itu bikin crash!

---

## Langkah Deploy (IKUTI URUTANNYA)

### Langkah 1: Buat Project Baru di Railway

1. Buka https://railway.com
2. Login dengan GitHub
3. Klik **"+ New"**
4. Pilih **"Deploy from GitHub repo"**
5. Pilih **spmb-2026**
6. Tunggu sampai muncul service di sidebar

---

### Langkah 2: Set Variable DATABASE_URL (PALING PENTING!)

**CARA 1 - Service Variables (RECOMMENDED):**

1. Klik service **spmb-2026** di sidebar kiri
2. Klik tab **Variables** di bagian atas
3. Klik **"New Variable"**
4. **Key**: `DATABASE_URL` (harus persis ini, huruf besar)
5. **Value**: `postgresql://neondb_owner:npg_lJQ5pe2ayVGH@ep-bitter-salad-ao7imaxp-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
6. Klik **Add** / **Save**

**CARA 2 - Raw Editor:**

1. Klik service **spmb-2026** di sidebar kiri
2. Klik tab **Variables**
3. Klik **"Raw Editor"**
4. Ketik:
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_lJQ5pe2ayVGH@ep-bitter-salad-ao7imaxp-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
5. Klik **Save** / **Apply**

> ❌ JANGAN pakai Shared Variables - itu perlu di-link lagi ke service dan sering bermasalah!

---

### Langkah 3: Set Start Command

1. Klik tab **Settings** di bagian atas
2. Cari bagian **Start Command**
3. Isi: `bun run start`
4. Save

---

### Langkah 4: Generate Domain

1. Masih di **Settings**
2. Cari bagian **Domains** atau **Networking**
3. Klik **"Generate Domain"**
4. Tunggu sampai URL muncul (format: `spmb-2026-production.up.railway.app`)

---

### Langkah 5: Redeploy

1. Klik tab **Deployments**
2. Klik deployment terbaru
3. Klik tombol **Redeploy**
4. Tunggu sampai status berubah **🟢 ACTIVE**

---

### Langkah 6: Buka Aplikasi

1. Klik URL yang di-generate di step 4
2. Akan muncul halaman **Setup Admin**
3. Buat akun admin pertama
4. Login

---

## ✅ Verifikasi Berhasil

Setelah aplikasi berjalan, cek:

1. ✅ Halaman dashboard muncul
2. ✅ Bisa import data CSV
3. ✅ Bisa membuat user baru
4. ✅ Clear history Chrome → login ulang → data masih ada
5. ✅ Redeploy Railway → data masih ada

---

## ❌ Jika Crash

1. Klik deployment yang crash
2. Lihat **Deploy Logs**
3. Cari error message

### Error Umum & Solusi:

| Error | Penyebab | Solusi |
|-------|----------|--------|
| `Environment variable not found: DATABASE_URL` | Variable belum di-set | Ulangi Langkah 2 |
| `P1012 Prisma schema validation` | DATABASE_URL kosong | Ulangi Langkah 2 |
| `connection refused` | Connection string salah | Cek connection string |
| `channel_binding` | Parameter tidak didukung | Hapus `&channel_binding=require` |
| Start command not found | Start Command kosong | Ulangi Langkah 3 |

---

## 📋 Cheat Sheet

### Informasi Penting

- **GitHub Repo**: `merdinadina58-creator/spmb-2026`
- **Neon Dashboard**: https://console.neon.tech
- **Railway Dashboard**: https://railway.com
- **Database**: PostgreSQL di Neon (Singapore region)
- **Data Storage**: PERMANEN - tidak hilang saat redeploy

### JANGAN LUPA!

- ❌ Jangan pakai `channel_binding=require` di connection string
- ❌ Jangan pakai Shared Variables - pakai Service Variables
- ❌ Jangan lupa set Start Command: `bun run start`
- ❌ Jangan lupa Generate Domain
- ✅ Selalu Redeploy setelah ubah variable/settings

---

## 🔄 Jika Perlu Update Kode

Jika ada perubahan kode dari Z.ai:

1. Kode akan di-push ke GitHub
2. Railway akan **otomatis detect** dan redeploy
3. Data TIDAK akan hilang karena di Neon PostgreSQL

---

*Dibuat oleh Z.ai - Panduan deploy SPMB 2026*
