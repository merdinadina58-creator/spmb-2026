import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface CSVPayload {
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
  // Portal fields
  nik?: string;
  tanggalLahir?: string;
  alamat?: string;
  alamatLengkap?: string;
  noTelpSiswa?: string;
  noTelpOrangtua?: string;
  latitude?: string;
  longitude?: string;
  lokasiJarak?: string;
  nilaiRataRata?: string;
  skorJarak?: string;
  skor?: string;
  nilaiRapor?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rows } = body as { rows: CSVPayload[] };

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    let imported = 0;
    let updated = 0;
    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const row of rows) {
      try {
        const noRegistrasi = row.noRegistrasi;
        const nisn = row.nisn;
        const npsnSekolahPilihan = row.npsnSekolahPilihan || '0';

        if (!noRegistrasi && !nisn) {
          skipped++;
          continue;
        }

        // Build optional portal data - only include non-empty values
        const portalData: Record<string, string> = {};
        const optFields = ['nik', 'tanggalLahir', 'alamat', 'alamatLengkap', 'noTelpSiswa', 'noTelpOrangtua', 'latitude', 'longitude', 'lokasiJarak', 'nilaiRataRata', 'skorJarak', 'skor', 'nilaiRapor'] as const;
        for (const f of optFields) {
          const val = (row as Record<string, unknown>)[f];
          if (val && typeof val === 'string' && (val as string).trim()) {
            portalData[f] = (val as string).trim();
          }
        }

        // STEP 1: Try to find existing record by NISN + npsnSekolahPilihan (primary dedup)
        let existing = null;
        if (nisn && nisn.trim()) {
          existing = await db.registration.findFirst({
            where: {
              nisn: nisn.trim(),
              npsnSekolahPilihan,
            },
          });
        }

        // STEP 2: Fallback - try by noRegistrasi + npsnSekolahPilihan
        if (!existing && noRegistrasi && noRegistrasi.trim()) {
          existing = await db.registration.findFirst({
            where: {
              noRegistrasi: noRegistrasi.trim(),
              npsnSekolahPilihan,
            },
          });
        }

        if (existing) {
          // UPDATE existing record - merge new data, don't overwrite with empty
          await db.registration.update({
            where: { id: existing.id },
            data: {
              noRegistrasi: noRegistrasi || existing.noRegistrasi,
              nama: row.nama || existing.nama,
              nisn: nisn || existing.nisn,
              subJalur: row.subJalur || existing.subJalur,
              namaSekolahPilihan: row.namaSekolahPilihan || existing.namaSekolahPilihan,
              jurusan: row.jurusan || existing.jurusan,
              npsnSekolahAsal: row.npsnSekolahAsal || existing.npsnSekolahAsal,
              namaSekolahAsal: row.namaSekolahAsal || existing.namaSekolahAsal,
              status: row.status || existing.status,
              waktuDaftar: row.waktuDaftar || existing.waktuDaftar,
              // Only update portal fields if new values are provided
              ...portalData,
            },
          });
          updated++;
          imported++;
        } else {
          // CREATE new record
          await db.registration.create({
            data: {
              noRegistrasi: noRegistrasi || '',
              nama: row.nama || '',
              nisn: nisn || '',
              subJalur: row.subJalur || '',
              npsnSekolahPilihan,
              namaSekolahPilihan: row.namaSekolahPilihan || '',
              jurusan: row.jurusan || '',
              npsnSekolahAsal: row.npsnSekolahAsal || '',
              namaSekolahAsal: row.namaSekolahAsal || '',
              status: row.status || 'ON PROGRESS',
              waktuDaftar: row.waktuDaftar || '',
              verificationStatus: 'PENDING',
              ...portalData,
            },
          });
          created++;
          imported++;
        }
      } catch (err) {
        errors.push(`Row ${row.noRegistrasi || row.nisn}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      created,
      updated,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error importing CSV:', error);
    return NextResponse.json({ error: 'Failed to import CSV' }, { status: 500 });
  }
}
