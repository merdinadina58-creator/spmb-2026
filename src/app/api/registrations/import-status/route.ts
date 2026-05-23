import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface ImportStatusRow {
  noRegistrasi: string;
  nama: string;
  nisn: string;
  subJalur: string;
  npsnSekolahPilihan: string;
  namaSekolahPilihan: string;
  jurusan: string;
  npsnSekolahAsal: string;
  namaSekolahAsal: string;
  status: string;
  waktuDaftar: string;
}

/**
 * Maps a status value to verificationStatus.
 * - "DITERIMA"  → "VERIFIED"
 * - "DITOLAK"   → "REJECTED"
 * - anything else → "PENDING"
 */
function mapStatusToVerification(status: string): string {
  const upper = status?.trim().toUpperCase();
  if (upper === 'DITERIMA') return 'VERIFIED';
  if (upper === 'DITOLAK') return 'REJECTED';
  return 'PENDING';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rows, importType } = body as { rows: ImportStatusRow[]; importType?: string };

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    // importType can be "DITERIMA" or "DITOLAK" — if provided, ALL rows get this status
    // regardless of what the CSV Status column says
    const forcedStatus = importType?.trim().toUpperCase() || null;

    let matched = 0;
    let created = 0;
    let diterima = 0;
    let ditolak = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const noRegistrasi = row.noRegistrasi?.trim() || '';
        const nisn = row.nisn?.trim() || '';
        const npsnSekolahPilihan = row.npsnSekolahPilihan?.trim() || '0';

        // Determine final status: use forcedStatus if provided, otherwise use CSV status
        const finalStatus = forcedStatus || row.status?.trim().toUpperCase() || 'ON PROGRESS';
        const verificationStatus = mapStatusToVerification(finalStatus);

        // Must have at least one identifier
        if (!noRegistrasi && !nisn && !row.nama?.trim()) {
          skipped++;
          continue;
        }

        // STEP 1: Try by NISN + npsnSekolahPilihan
        let existing: Awaited<ReturnType<typeof db.registration.findFirst>> = null;
        if (nisn) {
          existing = await db.registration.findFirst({
            where: { nisn, npsnSekolahPilihan },
          });
        }

        // STEP 2: Try by NISN alone
        if (!existing && nisn) {
          existing = await db.registration.findFirst({
            where: { nisn },
          });
        }

        // STEP 3: Try by noRegistrasi + npsnSekolahPilihan
        if (!existing && noRegistrasi) {
          existing = await db.registration.findFirst({
            where: { noRegistrasi, npsnSekolahPilihan },
          });
        }

        // STEP 4: Try by noRegistrasi alone
        if (!existing && noRegistrasi) {
          existing = await db.registration.findFirst({
            where: { noRegistrasi },
          });
        }

        // STEP 5: Try by nama + subJalur
        if (!existing && row.nama?.trim() && row.subJalur?.trim()) {
          existing = await db.registration.findFirst({
            where: {
              nama: row.nama.trim(),
              subJalur: row.subJalur.trim(),
            },
          });
        }

        if (existing) {
          // UPDATE existing record with new status and verificationStatus
          await db.registration.update({
            where: { id: existing.id },
            data: {
              status: finalStatus,
              verificationStatus,
            },
          });
          matched++;
        } else {
          // CREATE new registration with appropriate verificationStatus
          await db.registration.create({
            data: {
              noRegistrasi,
              nama: row.nama?.trim() || '',
              nisn,
              subJalur: row.subJalur?.trim() || '',
              npsnSekolahPilihan,
              namaSekolahPilihan: row.namaSekolahPilihan?.trim() || '',
              jurusan: row.jurusan?.trim() || '',
              npsnSekolahAsal: row.npsnSekolahAsal?.trim() || '',
              namaSekolahAsal: row.namaSekolahAsal?.trim() || '',
              status: finalStatus,
              waktuDaftar: row.waktuDaftar?.trim() || '',
              verificationStatus,
            },
          });
          created++;
        }

        // Track diterima/ditolak counts
        if (finalStatus === 'DITERIMA') {
          diterima++;
        } else if (finalStatus === 'DITOLAK') {
          ditolak++;
        }
      } catch (err) {
        const identifier = row.noRegistrasi || row.nisn || row.nama || `row ${i + 1}`;
        errors.push(`${identifier}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      matched,
      created,
      diterima,
      ditolak,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error importing status:', error);
    return NextResponse.json({ error: 'Failed to import status data' }, { status: 500 });
  }
}
