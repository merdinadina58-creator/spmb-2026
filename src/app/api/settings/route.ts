import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, unauthenticatedResponse } from '@/lib/auth'
import { withRetry } from '@/lib/retry'
import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'
import path from 'path'

// Only load .env file in development/local environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true })
}

// Helper: run raw SQL for migration
async function runMigration() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) return

  const sql = neon(connectionString, { fetchConnectionCache: true })

  // Check if tahap column exists in Registration table
  const columnCheck = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'Registration' AND column_name = 'tahap'
  `

  if (columnCheck.length === 0) {
    console.log('[Migration] Adding tahap column to Registration table...')
    await sql`ALTER TABLE "Registration" ADD COLUMN IF NOT EXISTS "tahap" INTEGER DEFAULT 1`
    console.log('[Migration] tahap column added successfully')
  }

  // Fix typo in jalurConfig: "Presatasi Nonakademik" → "Prestasi Nonakademik"
  try {
    const typoCheck = await sql`
      SELECT id, nama FROM "JalurConfig" WHERE nama = 'Presatasi Nonakademik'
    `
    if (typoCheck.length > 0) {
      console.log('[Migration] Fixing typo: "Presatasi Nonakademik" → "Prestasi Nonakademik" in JalurConfig...')
      await sql`
        UPDATE "JalurConfig" SET nama = 'Prestasi Nonakademik' WHERE nama = 'Presatasi Nonakademik'
      `
      console.log('[Migration] JalurConfig typo fixed successfully')
    }
  } catch (e) {
    console.error('[Migration] Error fixing JalurConfig typo:', e)
  }

  // Fix typo in Registration: "Presatasi Nonakademik" → "Prestasi Nonakademik"
  try {
    const regTypoCheck = await sql`
      SELECT id FROM "Registration" WHERE "subJalur" = 'Presatasi Nonakademik' OR "subJalur" = 'Presatasi Non-Akademik'
    `
    if (regTypoCheck.length > 0) {
      console.log(`[Migration] Fixing typo in ${regTypoCheck.length} Registration records: "Presatasi Nonakademik" → "Prestasi Nonakademik"`)
      await sql`
        UPDATE "Registration" SET "subJalur" = 'Prestasi Nonakademik' WHERE "subJalur" = 'Presatasi Nonakademik' OR "subJalur" = 'Presatasi Non-Akademik'
      `
      console.log('[Migration] Registration typo fixed successfully')
    }
  } catch (e) {
    console.error('[Migration] Error fixing Registration typo:', e)
  }

  // Fix jalurAktifPerTahap setting: replace "Presatasi" with "Prestasi" in JSON
  try {
    const settingCheck = await sql`
      SELECT value FROM "Setting" WHERE key = 'jalurAktifPerTahap'
    `
    if (settingCheck.length > 0 && settingCheck[0].value.includes('Presatasi')) {
      console.log('[Migration] Fixing typo in jalurAktifPerTahap setting...')
      const fixed = settingCheck[0].value.replace(/Presatasi/g, 'Prestasi')
      await sql`
        UPDATE "Setting" SET value = ${fixed} WHERE key = 'jalurAktifPerTahap'
      `
      console.log('[Migration] jalurAktifPerTahap typo fixed successfully')
    }
  } catch (e) {
    console.error('[Migration] Error fixing jalurAktifPerTahap typo:', e)
  }
}

export async function GET(request: NextRequest) {
  try {
    // Auth required - but allow unauthenticated for login page display
    const user = await getAuthUser(request)

    // Run migration on first load (ensure tahap column exists)
    try {
      await runMigration()
    } catch (migrationError) {
      console.error('[Migration] Error running tahap migration:', migrationError)
      // Don't fail the request if migration fails
    }

    // Exclude session entries from settings response for security
    const [settings, jalurConfigs] = await withRetry(() => Promise.all([
      db.setting.findMany({
        where: { key: { not: { startsWith: 'session:' } } },
      }),
      db.jalurConfig.findMany({
        orderBy: { urutan: 'asc' },
      }),
    ]));

    // Convert settings to key-value map
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    // Ensure default tahap and jalurAktifPerTahap settings exist
    let tahap = parseInt(settingsMap.tahap || '1')
    if (isNaN(tahap) || tahap < 1) tahap = 1

    let jalurAktifPerTahap = settingsMap.jalurAktifPerTahap
    if (!jalurAktifPerTahap) {
      // Default: all jalur active in tahap 1, only Prestasi in tahap 2
      const allJalurIds = jalurConfigs.map(j => j.id)
      const prestasiJalurIds = jalurConfigs
        .filter(j => j.nama.toLowerCase().includes('prestasi'))
        .map(j => j.id)

      const defaultMapping: Record<string, string[]> = {
        '1': allJalurIds,
        '2': prestasiJalurIds.length > 0 ? prestasiJalurIds : allJalurIds,
      }

      jalurAktifPerTahap = JSON.stringify(defaultMapping)

      // Save default settings
      try {
        await db.setting.upsert({
          where: { key: 'tahap' },
          update: { value: tahap.toString() },
          create: { key: 'tahap', value: tahap.toString() },
        })
        await db.setting.upsert({
          where: { key: 'jalurAktifPerTahap' },
          update: { value: jalurAktifPerTahap },
          create: { key: 'jalurAktifPerTahap', value: jalurAktifPerTahap },
        })
      } catch {
        // Silently fail - settings will still be returned in the response
      }
    }

    // If no jalur configs exist yet, seed defaults
    if (jalurConfigs.length === 0) {
      const defaults = [
        { nama: 'Domisili', persentase: 30, urutan: 1 },
        { nama: 'Keluarga Tidak Mampu', persentase: 15, urutan: 2 },
        { nama: 'Penyandang Disabilitas', persentase: 5, urutan: 3 },
        { nama: 'Terdampak Bencana Alam', persentase: 5, urutan: 4 },
        { nama: 'Mutasi Orangtua/Wali', persentase: 10, urutan: 5 },
        { nama: 'Anak Guru', persentase: 5, urutan: 6 },
        { nama: 'Prestasi Akademik', persentase: 20, urutan: 7 },
        { nama: 'Prestasi Nonakademik', persentase: 10, urutan: 8 },
      ];

      for (const d of defaults) {
        await db.jalurConfig.create({ data: d });
      }

      const seeded = await db.jalurConfig.findMany({ orderBy: { urutan: 'asc' } });

      return NextResponse.json({
        settings: settingsMap,
        jalurConfigs: seeded,
        kuota: parseInt(settingsMap.kuota || '0'),
        appName: settingsMap.appName || 'SPMB 2026',
        schoolName: settingsMap.schoolName || '',
        appIcon: settingsMap.appIcon || '',
        appSubtitle: settingsMap.appSubtitle || 'Sistem Verifikasi Penerimaan Murid Baru',
        tahap,
        jalurAktifPerTahap,
      });
    }

    return NextResponse.json({
      settings: settingsMap,
      jalurConfigs,
      kuota: parseInt(settingsMap.kuota || '0'),
      appName: settingsMap.appName || 'SPMB 2026',
      schoolName: settingsMap.schoolName || '',
      appIcon: settingsMap.appIcon || '',
      appSubtitle: settingsMap.appSubtitle || 'Sistem Verifikasi Penerimaan Murid Baru',
      tahap,
      jalurAktifPerTahap,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT - update settings (kuota, appName, schoolName, appIcon, tahap, jalurAktifPerTahap) — admin only
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return unauthenticatedResponse()
    }
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya admin.' }, { status: 403 })
    }

    const body = await request.json();
    const { kuota, appName, schoolName, appIcon, appSubtitle, tahap, jalurAktifPerTahap } = body as {
      kuota?: number;
      appName?: string;
      schoolName?: string;
      appIcon?: string;
      appSubtitle?: string;
      tahap?: number;
      jalurAktifPerTahap?: string;
    };

    if (kuota !== undefined) {
      await db.setting.upsert({
        where: { key: 'kuota' },
        update: { value: kuota.toString() },
        create: { key: 'kuota', value: kuota.toString() },
      });
    }

    if (appName !== undefined) {
      await db.setting.upsert({
        where: { key: 'appName' },
        update: { value: appName },
        create: { key: 'appName', value: appName },
      });
    }

    if (schoolName !== undefined) {
      await db.setting.upsert({
        where: { key: 'schoolName' },
        update: { value: schoolName },
        create: { key: 'schoolName', value: schoolName },
      });
    }

    if (appIcon !== undefined) {
      await db.setting.upsert({
        where: { key: 'appIcon' },
        update: { value: appIcon },
        create: { key: 'appIcon', value: appIcon },
      });
    }

    if (appSubtitle !== undefined) {
      await db.setting.upsert({
        where: { key: 'appSubtitle' },
        update: { value: appSubtitle },
        create: { key: 'appSubtitle', value: appSubtitle },
      });
    }

    if (tahap !== undefined) {
      const tahapNum = parseInt(tahap.toString()) || 1
      await db.setting.upsert({
        where: { key: 'tahap' },
        update: { value: tahapNum.toString() },
        create: { key: 'tahap', value: tahapNum.toString() },
      })
    }

    if (jalurAktifPerTahap !== undefined) {
      await db.setting.upsert({
        where: { key: 'jalurAktifPerTahap' },
        update: { value: jalurAktifPerTahap },
        create: { key: 'jalurAktifPerTahap', value: jalurAktifPerTahap },
      })
    }

    // If tahap is being changed, update jalur aktif flags based on jalurAktifPerTahap
    if (tahap !== undefined && jalurAktifPerTahap) {
      try {
        const mapping = JSON.parse(jalurAktifPerTahap) as Record<string, string[]>
        const tahapStr = tahap.toString()
        const activeJalurIds = mapping[tahapStr] || []
        const allJalurConfigs = await db.jalurConfig.findMany({})

        for (const jc of allJalurConfigs) {
          const shouldBeActive = activeJalurIds.includes(jc.id)
          if (jc.aktif !== shouldBeActive) {
            await db.jalurConfig.update({
              where: { id: jc.id },
              data: { aktif: shouldBeActive },
            })
          }
        }
      } catch (e) {
        console.error('Error updating jalur aktif flags on tahap change:', e)
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
