import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser, unauthenticatedResponse } from '@/lib/auth';

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
  skorNilaiRaport?: string;
  skorLomba?: string;
  nilaiRataRataTKA?: string;
  skorPrestasiAkademik?: string;
  skorPrestasiNonAkademik?: string;
  skor?: string;
  nilaiRapor?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Auth required — admin only for import
    const user = await getAuthUser(request)
    if (!user) {
      return unauthenticatedResponse()
    }
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya admin yang dapat import.' }, { status: 403 })
    }

    const body = await request.json();
    const { rows, overrideStatus, tahap } = body as { rows: CSVPayload[]; overrideStatus?: boolean; tahap?: number };
    const recordTahap = tahap || 1;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    let imported = 0;
    let updated = 0;
    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Helper: map status string to verificationStatus
    const statusToVerification = (status: string): string => {
      const s = status.trim();
      if (s === 'DITERIMA') return 'VERIFIED';
      if (s === 'DITOLAK') return 'REJECTED';
      return 'PENDING';
    };

    for (const row of rows) {
      try {
        const noRegistrasi = row.noRegistrasi;
        const nisn = row.nisn;
        const npsnSekolahPilihan = row.npsnSekolahPilihan || '0';
        const rowStatus = (row.status || '').trim();
        const isRejected = rowStatus === 'DITOLAK' || statusToVerification(rowStatus) === 'REJECTED';

        if (!noRegistrasi && !nisn) {
          skipped++;
          continue;
        }

        // Guard: skip rows with empty required unique fields
        if (!noRegistrasi?.trim() && !nisn?.trim()) {
          errors.push(`Row skipped: both noRegistrasi and NISN are empty`);
          skipped++;
          continue;
        }

        // Build optional portal data - only include non-empty values
        const portalData: Record<string, string> = {};
        const optFields = ['nik', 'tanggalLahir', 'alamat', 'alamatLengkap', 'noTelpSiswa', 'noTelpOrangtua', 'latitude', 'longitude', 'lokasiJarak', 'nilaiRataRata', 'skorJarak', 'skorNilaiRaport', 'skorLomba', 'nilaiRataRataTKA', 'skorPrestasiAkademik', 'skorPrestasiNonAkademik', 'skor', 'nilaiRapor'] as const;
        for (const f of optFields) {
          const val = (row as Record<string, unknown>)[f];
          if (val && typeof val === 'string' && (val as string).trim()) {
            portalData[f] = (val as string).trim();
          }
        }

        // For DITOLAK records: ALWAYS create a new record (no dedup)
        // This ensures students rejected multiple times appear as separate entries
        if (isRejected) {
          const statusValue = rowStatus || 'DITOLAK';
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
              status: statusValue,
              waktuDaftar: row.waktuDaftar || '',
              verificationStatus: 'REJECTED',
              tahap: recordTahap,
              ...portalData,
            },
          });
          created++;
          imported++;
          continue;
        }

        // For non-DITOLAK records: use the existing dedup logic
        let existing = null;
        if (nisn && nisn.trim()) {
          existing = await db.registration.findFirst({
            where: {
              nisn: nisn.trim(),
              subJalur: row.subJalur?.trim() || undefined,
            },
          });
        }

        // STEP 2: Try by NISN + npsnSekolahPilihan
        if (!existing && nisn && nisn.trim()) {
          existing = await db.registration.findFirst({
            where: {
              nisn: nisn.trim(),
              npsnSekolahPilihan,
            },
          });
        }

        // STEP 3: Try by noRegistrasi + subJalur
        if (!existing && noRegistrasi && noRegistrasi.trim()) {
          existing = await db.registration.findFirst({
            where: {
              noRegistrasi: noRegistrasi.trim(),
              subJalur: row.subJalur?.trim() || undefined,
            },
          });
        }

        // STEP 4: Fallback - try by noRegistrasi + npsnSekolahPilihan
        if (!existing && noRegistrasi && noRegistrasi.trim()) {
          existing = await db.registration.findFirst({
            where: {
              noRegistrasi: noRegistrasi.trim(),
              npsnSekolahPilihan,
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

        // STEP 6: Last resort - try by NISN alone (broader match)
        if (!existing && nisn && nisn.trim()) {
          existing = await db.registration.findFirst({
            where: {
              nisn: nisn.trim(),
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

          // Core fields (except status - handled separately below)
          mergeField('noRegistrasi', noRegistrasi, existing.noRegistrasi);
          mergeField('nisn', nisn, existing.nisn);
          mergeField('nama', row.nama, existing.nama);
          mergeField('subJalur', row.subJalur, existing.subJalur);
          mergeField('namaSekolahPilihan', row.namaSekolahPilihan, existing.namaSekolahPilihan);
          mergeField('jurusan', row.jurusan, existing.jurusan);
          mergeField('npsnSekolahAsal', row.npsnSekolahAsal, existing.npsnSekolahAsal);
          mergeField('namaSekolahAsal', row.namaSekolahAsal, existing.namaSekolahAsal);
          mergeField('waktuDaftar', row.waktuDaftar, existing.waktuDaftar);
          mergeField('npsnSekolahPilihan', row.npsnSekolahPilihan, existing.npsnSekolahPilihan);

          // Handle status field with override logic
          if (row.status && row.status.trim()) {
            const newStatus = row.status.trim();
            const newVerificationStatus = statusToVerification(newStatus);

            if (overrideStatus) {
              // When overrideStatus is true, ALWAYS update status and verificationStatus
              updateData['status'] = newStatus;
              if (newVerificationStatus === 'VERIFIED' && existing.verificationStatus !== 'VERIFIED') {
                updateData['verificationStatus'] = 'VERIFIED';
              } else if (newVerificationStatus === 'REJECTED' && existing.verificationStatus === 'PENDING') {
                updateData['verificationStatus'] = 'REJECTED';
              }
            } else {
              // When overrideStatus is false (using CSV status), only update if existing is empty
              mergeField('status', row.status, existing.status);
              if (newVerificationStatus === 'VERIFIED' && existing.verificationStatus !== 'VERIFIED') {
                updateData['verificationStatus'] = 'VERIFIED';
              } else if (newVerificationStatus === 'REJECTED' && existing.verificationStatus === 'PENDING') {
                updateData['verificationStatus'] = 'REJECTED';
              }
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
          const statusValue = row.status || 'ON PROGRESS';
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
              status: statusValue,
              waktuDaftar: row.waktuDaftar || '',
              verificationStatus: statusToVerification(statusValue),
              tahap: recordTahap,
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
