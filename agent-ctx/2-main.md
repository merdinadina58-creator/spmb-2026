# Task 2 - Dashboard API Enhancement

## Task
Enhance the dashboard API endpoint at `/api/dashboard/route.ts` to add three new data sections: recentActivity, dailyTrend, kuotaInfo.

## Work Done

### 1. Added `db.$queryRaw` to db.ts
- The project uses a custom neon PostgreSQL wrapper (not actual Prisma Client)
- Exported the `sql` template tag as `db.$queryRaw` to support raw SQL queries
- File: `src/lib/db.ts` line 373

### 2. Added 4 new queries inside existing Promise.all
- **recentActivity**: `db.registration.findMany` — last 10 VERIFIED/REJECTED registrations, select {id, nama, subJalur, verificationStatus, updatedAt}
- **dailyTrend**: `db.$queryRaw` — PostgreSQL raw query with DATE() grouping, SUM CASE for verified/rejected, last 14 days, conditional tahap filter
- **kuotaSetting**: `db.setting.findUnique({ where: { key: 'kuota' } })` — gets kuota value
- **jalurConfigs**: `db.jalurConfig.findMany({ orderBy: { urutan: 'asc' } })` — gets jalur configuration

### 3. Added new response fields
- `recentActivity`: raw array from query
- `dailyTrend`: raw array from query (date, verified, rejected)
- `kuotaInfo`: computed object with `kuota` (parsed int) and `jalurConfigs` (mapped with computed per-jalur kuota)

## Files Modified
- `src/lib/db.ts` — Added `db.$queryRaw` property
- `src/app/api/dashboard/route.ts` — Added 4 new queries + 3 new response fields

## Key Adaptation
The task instructions referenced `Prisma.sql`/`Prisma.empty` for conditional SQL fragments. Since this project uses neon (not Prisma Client), adapted the raw query to use neon's template tag syntax with nested `sql` fragments for conditional WHERE clauses.
