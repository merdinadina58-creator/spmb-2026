import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all settings
export async function GET() {
  try {
    const settings = await db.setting.findMany();
    const jalurConfigs = await db.jalurConfig.findMany({
      orderBy: { urutan: 'asc' },
    });

    // Convert settings to key-value map
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    // If no jalur configs exist yet, seed defaults
    if (jalurConfigs.length === 0) {
      const defaults = [
        { nama: 'Domisili', persentase: 30, urutan: 1 },
        { nama: 'Afirmasi (KTM)', persentase: 15, urutan: 2 },
        { nama: 'Disabilitas', persentase: 5, urutan: 3 },
        { nama: 'Anak Guru', persentase: 5, urutan: 4 },
        { nama: 'Mutasi', persentase: 10, urutan: 5 },
        { nama: 'Prestasi Nilai Rapor', persentase: 25, urutan: 6 },
        { nama: 'Prestasi Non Akademik', persentase: 10, urutan: 7 },
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
      });
    }

    return NextResponse.json({
      settings: settingsMap,
      jalurConfigs,
      kuota: parseInt(settingsMap.kuota || '0'),
      appName: settingsMap.appName || 'SPMB 2026',
      schoolName: settingsMap.schoolName || '',
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT - update settings (kuota, appName)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { kuota, appName, schoolName } = body as { kuota?: number; appName?: string; schoolName?: string };

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
