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
  noHp?: string;
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

        // STEP 2: Try by NISN alone (without npsnSekolahPilihan) - broader match
        if (!existing && nisn && nisn.trim()) {
          existing = await db.registration.findFirst({
            where: {
              nisn: nisn.trim(),
            },
          });
        }

        // STEP 3: Fallback - try by noRegistrasi + npsnSekolahPilihan
        if (!existing && noRegistrasi && noRegistrasi.trim()) {
          existing = await db.registration.findFirst({
            where: {
              noRegistrasi: noRegistrasi.trim(),
              npsnSekolahPilihan,
            },
          });
        }

        // STEP 4: Fallback - try by noRegistrasi alone
        if (!existing && noRegistrasi && noRegistrasi.trim()) {
          existing = await db.registration.findFirst({
            where: {
              noRegistrasi: noRegistrasi.trim(),
            },
          });
        }

        // STEP 5: Fallback - try by nama + subJalur
        if (!existing && row.nama && row.nama.trim() && row.subJalur && row.subJalur.trim()) {
          existing = await db.registration.findFirst({
            where: {
              nama: row.nama.trim(),
              subJalur: row.subJalur.trim(),
            },
          });
        }

        if (existing) {
          // UPDATE existing record - fill empty fields with new data
          const updateData: Record<string, string | null> = {};

          const mergeField = (key: string, newValue: string | undefined, existingValue: string | null | undefined) => {
            const trimmed = newValue?.trim();
            if (trimmed && (!existingValue || existingValue.trim() === '' || existingValue === '0')) {
              updateData[key] = trimmed;
            }
          };

          // Core fields
          mergeField('noRegistrasi', noRegistrasi, existing.noRegistrasi);
          mergeField('nisn', nisn, existing.nisn);
          mergeField('nama', row.nama, existing.nama);
          mergeField('subJalur', row.subJalur, existing.subJalur);
          mergeField('namaSekolahPilihan', row.namaSekolahPilihan, existing.namaSekolahPilihan);
          mergeField('jurusan', row.jurusan, existing.jurusan);
          mergeField('npsnSekolahAsal', row.npsnSekolahAsal, existing.npsnSekolahAsal);
          mergeField('namaSekolahAsal', row.namaSekolahAsal, existing.namaSekolahAsal);
          mergeField('noHp', row.noHp, existing.noHp);
          mergeField('status', row.status, existing.status);
          mergeField('waktuDaftar', row.waktuDaftar, existing.waktuDaftar);
          mergeField('npsnSekolahPilihan', row.npsnSekolahPilihan, existing.npsnSekolahPilihan);

          // If status changed, also update verificationStatus accordingly
          if (row.status && row.status.trim()) {
            const newStatus = row.status.trim();
            const newVerificationStatus = newStatus === 'DITERIMA' ? 'VERIFIED' : newStatus === 'DITOLAK' ? 'REJECTED' : 'PENDING';
            // Always sync verificationStatus with CSV status (allows updating from ON PROGRESS → DITERIMA/DITOLAK)
            if (newVerificationStatus !== existing.verificationStatus) {
              updateData['verificationStatus'] = newVerificationStatus;
            }
          }

          // Portal fields - only fill empty fields
          for (const [key, value] of Object.entries(portalData)) {
            if (value && value.trim()) {
              const existingValue = (existing as Record<string, unknown>)[key] as string | null | undefined;
              if (!existingValue || existingValue.trim() === '') {
                updateData[key] = value;
              }
            }
          }

          if (Object.keys(updateData).length > 0) {
            await db.registration.update({
              where: { id: existing.id },
              data: updateData,
            });
          }
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
              noHp: row.noHp || '',
              status: row.status || 'ON PROGRESS',
              waktuDaftar: row.waktuDaftar || '',
              // Map CSV status to verificationStatus: DITERIMA→VERIFIED, DITOLAK→REJECTED, else PENDING
              verificationStatus: row.status === 'DITERIMA' ? 'VERIFIED' : row.status === 'DITOLAK' ? 'REJECTED' : 'PENDING',
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
