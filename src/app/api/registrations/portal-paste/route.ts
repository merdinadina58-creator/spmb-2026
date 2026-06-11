import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

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
  verificationStatus?: string;
  verificationNote?: string;
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
  skor?: string;
  nilaiRapor?: string;
  kekuranganVerifikasi?: string;
  tanggalVerif?: string;
  jamVerif?: string;
  terbitKK?: string;
  lamaKK?: string;
  dokumen?: string;
  tahap?: number;
}

export async function POST(request: NextRequest) {
  try {
    // Auth required
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const body = await request.json();
    const data = body as PortalPastePayload;
    const tahap = data.tahap || 1;

    if (!data.noRegistrasi && !data.nisn) {
      return NextResponse.json({ error: 'No. Registrasi atau NISN wajib diisi' }, { status: 400 });
    }

    if (!data.nama) {
      return NextResponse.json({ error: 'Nama wajib diisi' }, { status: 400 });
    }

    const npsnSekolahPilihan = data.npsnSekolahPilihan || '0';

    // Determine verification status from the payload
    // The frontend sends verificationStatus directly from the dialog
    const isRejected = data.verificationStatus === 'REJECTED' || data.status === 'DITOLAK';

    // Build optional portal fields - only include non-empty values
    const portalFields: Record<string, string> = {};
    const optionalFields = [
      'nik', 'tanggalLahir', 'alamat', 'alamatLengkap',
      'noTelpSiswa', 'noTelpOrangtua', 'latitude', 'longitude',
      'lokasiJarak', 'nilaiRataRata', 'skorJarak', 'skorNilaiRaport',
      'skorLomba', 'nilaiRataRataTKA', 'skorPrestasiAkademik',
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

    // Also add verificationNote if provided
    if (data.verificationNote && data.verificationNote.trim()) {
      portalFields['verificationNote'] = data.verificationNote.trim();
    }

    // STEP 1: For DITOLAK records, ALWAYS create a new record (no dedup)
    // This ensures students rejected multiple times appear as separate entries
    if (isRejected) {
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
          status: 'DITOLAK',
          waktuDaftar: data.waktuDaftar || '',
          verificationStatus: 'REJECTED',
          tahap,
          ...portalFields,
        },
      });

      return NextResponse.json({
        success: true,
        action: 'created',
        data: created,
        message: `Data ditolak baru untuk ${data.nama} (NISN: ${data.nisn}) berhasil ditambahkan`,
      });
    }

    // STEP 2: For non-DITOLAK records, find existing record by NISN + subJalur (primary dedup)
    // This ensures students who register in multiple jalur are kept as separate records
    let existing = null;
    if (data.nisn && data.nisn.trim()) {
      existing = await db.registration.findFirst({
        where: {
          nisn: data.nisn.trim(),
          subJalur: data.subJalur?.trim() || undefined,
        },
      });
    }

    // STEP 3: Try by NISN + npsnSekolahPilihan
    if (!existing && data.nisn && data.nisn.trim()) {
      existing = await db.registration.findFirst({
        where: {
          nisn: data.nisn.trim(),
          npsnSekolahPilihan,
        },
      });
    }

    // STEP 4: Fallback - try by noRegistrasi + subJalur
    if (!existing && data.noRegistrasi && data.noRegistrasi.trim()) {
      existing = await db.registration.findFirst({
        where: {
          noRegistrasi: data.noRegistrasi.trim(),
          subJalur: data.subJalur?.trim() || undefined,
        },
      });
    }

    // STEP 5: Fallback - try by noRegistrasi + npsnSekolahPilihan
    if (!existing && data.noRegistrasi && data.noRegistrasi.trim()) {
      existing = await db.registration.findFirst({
        where: {
          noRegistrasi: data.noRegistrasi.trim(),
          npsnSekolahPilihan,
        },
      });
    }

    // STEP 6: Fallback - try by nama + subJalur (for cases where NISN/noRegistrasi differ)
    if (!existing && data.nama && data.nama.trim() && data.subJalur && data.subJalur.trim()) {
      existing = await db.registration.findFirst({
        where: {
          nama: data.nama.trim(),
          subJalur: data.subJalur.trim(),
        },
      });
    }

    // STEP 7: Last resort - try by NISN alone (broader match)
    // Only use this if no subJalur-specific match was found
    if (!existing && data.nisn && data.nisn.trim()) {
      existing = await db.registration.findFirst({
        where: {
          nisn: data.nisn.trim(),
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

      // Always set verificationStatus if provided (from the dialog)
      if (data.verificationStatus) {
        updateData['verificationStatus'] = data.verificationStatus;
      }

      // Always set verificationNote if provided
      if (data.verificationNote && data.verificationNote.trim()) {
        updateData['verificationNote'] = data.verificationNote.trim();
      }

      // Portal fields - only fill empty fields (don't overwrite existing verification data)
      for (const [key, value] of Object.entries(portalFields)) {
        if (value && value.trim()) {
          // Skip verificationNote here — already handled above
          if (key === 'verificationNote') continue;
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
      // Determine verificationStatus: use from payload, or derive from status
      const verifStatus = data.verificationStatus ||
        (data.status === 'DITERIMA' ? 'VERIFIED' : data.status === 'DITOLAK' ? 'REJECTED' : 'PENDING');

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
          verificationStatus: verifStatus,
          tahap,
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
