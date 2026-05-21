import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface PortalPastePayload {
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
  skor?: string;
  nilaiRapor?: string;
  kekuranganVerifikasi?: string;
  tanggalVerif?: string;
  jamVerif?: string;
  terbitKK?: string;
  lamaKK?: string;
  dokumen?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = body as PortalPastePayload;

    if (!data.noRegistrasi && !data.nisn) {
      return NextResponse.json({ error: 'No. Registrasi atau NISN wajib diisi' }, { status: 400 });
    }

    if (!data.nama) {
      return NextResponse.json({ error: 'Nama wajib diisi' }, { status: 400 });
    }

    const npsnSekolahPilihan = data.npsnSekolahPilihan || '0';

    // Build optional portal fields - only include non-empty values
    const portalFields: Record<string, string> = {};
    const optionalFields = [
      'nik', 'tanggalLahir', 'alamat', 'alamatLengkap',
      'noTelpSiswa', 'noTelpOrangtua', 'latitude', 'longitude',
      'lokasiJarak', 'nilaiRataRata', 'skorJarak', 'skorNilaiRaport',
      'skor', 'nilaiRapor',
      'kekuranganVerifikasi', 'tanggalVerif', 'jamVerif',
      'terbitKK', 'lamaKK', 'dokumen',
    ] as const;
    for (const field of optionalFields) {
      const value = (data as Record<string, unknown>)[field];
      if (value && typeof value === 'string' && value.trim()) {
        portalFields[field] = value.trim();
      }
    }

    // STEP 1: Try to find existing record by NISN + npsnSekolahPilihan (primary dedup)
    let existing = null;
    if (data.nisn && data.nisn.trim()) {
      existing = await db.registration.findFirst({
        where: {
          nisn: data.nisn.trim(),
          npsnSekolahPilihan,
        },
      });
    }

    // STEP 2: Try by NISN alone (without npsnSekolahPilihan) - handles portal paste where NPSN might differ
    if (!existing && data.nisn && data.nisn.trim()) {
      existing = await db.registration.findFirst({
        where: {
          nisn: data.nisn.trim(),
        },
      });
    }

    // STEP 3: Fallback - try by noRegistrasi + npsnSekolahPilihan
    if (!existing && data.noRegistrasi && data.noRegistrasi.trim()) {
      existing = await db.registration.findFirst({
        where: {
          noRegistrasi: data.noRegistrasi.trim(),
          npsnSekolahPilihan,
        },
      });
    }

    // STEP 4: Fallback - try by noRegistrasi alone
    if (!existing && data.noRegistrasi && data.noRegistrasi.trim()) {
      existing = await db.registration.findFirst({
        where: {
          noRegistrasi: data.noRegistrasi.trim(),
        },
      });
    }

    // STEP 5: Fallback - try by nama + subJalur (for cases where NISN/noRegistrasi differ)
    if (!existing && data.nama && data.nama.trim() && data.subJalur && data.subJalur.trim()) {
      existing = await db.registration.findFirst({
        where: {
          nama: data.nama.trim(),
          subJalur: data.subJalur.trim(),
        },
      });
    }

    if (existing) {
      // UPDATE existing record - fill empty fields with new data, don't overwrite existing non-empty values
      const updateData: Record<string, string | null> = {};

      // Only update a field if: new value is non-empty AND (existing value is empty OR existing value equals default)
      const mergeField = (key: string, newValue: string | undefined, existingValue: string | null | undefined) => {
        const trimmed = newValue?.trim();
        if (trimmed && (!existingValue || existingValue.trim() === '' || existingValue === '0')) {
          updateData[key] = trimmed;
        }
      };

      // Core fields - always update if new value is better
      mergeField('noRegistrasi', data.noRegistrasi, existing.noRegistrasi);
      mergeField('nisn', data.nisn, existing.nisn);
      mergeField('nama', data.nama, existing.nama);
      mergeField('subJalur', data.subJalur, existing.subJalur);
      mergeField('namaSekolahPilihan', data.namaSekolahPilihan, existing.namaSekolahPilihan);
      mergeField('jurusan', data.jurusan, existing.jurusan);
      mergeField('npsnSekolahAsal', data.npsnSekolahAsal, existing.npsnSekolahAsal);
      mergeField('namaSekolahAsal', data.namaSekolahAsal, existing.namaSekolahAsal);
      mergeField('status', data.status, existing.status);
      mergeField('waktuDaftar', data.waktuDaftar, existing.waktuDaftar);
      mergeField('npsnSekolahPilihan', data.npsnSekolahPilihan, existing.npsnSekolahPilihan);

      // Portal fields - only fill empty fields (don't overwrite existing verification data)
      for (const [key, value] of Object.entries(portalFields)) {
        if (value && value.trim()) {
          const existingValue = (existing as Record<string, unknown>)[key] as string | null | undefined;
          // Only update if existing value is empty/null
          if (!existingValue || existingValue.trim() === '') {
            updateData[key] = value;
          }
        }
      }

      // Only perform update if there are actually fields to update
      if (Object.keys(updateData).length > 0) {
        const updated = await db.registration.update({
          where: { id: existing.id },
          data: updateData,
        });

        return NextResponse.json({
          success: true,
          action: 'updated',
          data: updated,
          message: `Data ${data.nama} (NISN: ${data.nisn || existing.nisn}) berhasil diperbarui — ${Object.keys(updateData).length} field diisi`,
        });
      } else {
        return NextResponse.json({
          success: true,
          action: 'unchanged',
          data: existing,
          message: `Data ${data.nama} (NISN: ${data.nisn || existing.nisn}) sudah lengkap, tidak ada perubahan`,
        });
      }
    } else {
      // CREATE new record
      const created = await db.registration.create({
        data: {
          noRegistrasi: data.noRegistrasi || '',
          nama: data.nama || '',
          nisn: data.nisn || '',
          subJalur: data.subJalur || '',
          npsnSekolahPilihan,
          namaSekolahPilihan: data.namaSekolahPilihan || '',
          jurusan: data.jurusan || '',
          npsnSekolahAsal: data.npsnSekolahAsal || '',
          namaSekolahAsal: data.namaSekolahAsal || '',
          status: data.status || 'ON PROGRESS',
          waktuDaftar: data.waktuDaftar || '',
          verificationStatus: data.status === 'DITERIMA' ? 'VERIFIED' : data.status === 'DITOLAK' ? 'REJECTED' : 'PENDING',
          ...portalFields,
        },
      });

      return NextResponse.json({
        success: true,
        action: 'created',
        data: created,
        message: `Data baru ${data.nama} (NISN: ${data.nisn}) berhasil ditambahkan`,
      });
    }
  } catch (error) {
    console.error('Error saving portal paste data:', error);
    const message = error instanceof Error ? error.message : 'Failed to save data';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
