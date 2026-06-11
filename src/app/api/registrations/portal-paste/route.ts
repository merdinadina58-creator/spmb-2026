import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser, unauthenticatedResponse } from '@/lib/auth';
import { Prisma } from '@prisma/client';

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
      return unauthenticatedResponse()
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

    // Build the full record data for both create and update
    const buildRecordData = () => {
      const verifStatus = data.verificationStatus ||
        (data.status === 'DITERIMA' ? 'VERIFIED' : data.status === 'DITOLAK' ? 'REJECTED' : 'PENDING');

      return {
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
      };
    };

    // For REJECTED records, always create a new record (no dedup)
    if (isRejected) {
      try {
        const created = await db.registration.create({
          data: buildRecordData(),
        });

        return NextResponse.json({
          success: true,
          action: 'created',
          data: created,
          message: `Data ditolak baru untuk ${data.nama} (NISN: ${data.nisn}) berhasil ditambahkan`,
        });
      } catch (createError: unknown) {
        // Handle unique constraint violation — find existing and update instead
        if (createError instanceof Prisma.PrismaClientKnownRequestError && createError.code === 'P2002') {
          const existing = await findExistingRecord(data, npsnSekolahPilihan, tahap);
          if (existing) {
            const updated = await db.registration.update({
              where: { id: existing.id },
              data: {
                verificationStatus: 'REJECTED',
                status: 'DITOLAK',
                ...portalFields,
              },
            });
            return NextResponse.json({
              success: true,
              action: 'updated',
              data: updated,
              message: `Data ditolak ${data.nama} (NISN: ${data.nisn}) berhasil diperbarui`,
            });
          }
        }
        throw createError;
      }
    }

    // For non-REJECTED records: find existing record with tahap-aware dedup
    const existing = await findExistingRecord(data, npsnSekolahPilihan, tahap);

    if (existing) {
      // UPDATE existing record — fill empty fields with new data, don't overwrite existing non-empty values
      const updateData: Record<string, string | number | null> = {};

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
      mergeField('waktuDaftar', data.waktuDaftar, existing.waktuDaftar);
      mergeField('npsnSekolahPilihan', data.npsnSekolahPilihan, existing.npsnSekolahPilihan);

      // Always update status and verificationStatus when provided (user explicitly chose)
      if (data.status && data.status.trim()) {
        updateData['status'] = data.status.trim();
      }
      if (data.verificationStatus) {
        updateData['verificationStatus'] = data.verificationStatus;
      }

      // Always set verificationNote if provided
      if (data.verificationNote && data.verificationNote.trim()) {
        updateData['verificationNote'] = data.verificationNote.trim();
      }

      // Always update tahap if provided
      if (tahap && existing.tahap !== tahap) {
        updateData['tahap'] = tahap;
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

      // Always perform update (even if only verificationStatus changed — user explicitly chose this)
      const updated = await db.registration.update({
        where: { id: existing.id },
        data: updateData,
      });

      const fieldCount = Object.keys(updateData).length;
      return NextResponse.json({
        success: true,
        action: fieldCount > 0 ? 'updated' : 'unchanged',
        data: updated,
        message: fieldCount > 0
          ? `Data ${data.nama} (NISN: ${data.nisn || existing.nisn}) berhasil diperbarui — ${fieldCount} field diupdate`
          : `Data ${data.nama} (NISN: ${data.nisn || existing.nisn}) sudah lengkap, tidak ada perubahan`,
      });
    } else {
      // CREATE new record
      try {
        const created = await db.registration.create({
          data: buildRecordData(),
        });

        return NextResponse.json({
          success: true,
          action: 'created',
          data: created,
          message: `Data baru ${data.nama} (NISN: ${data.nisn}) berhasil ditambahkan`,
        });
      } catch (createError: unknown) {
        // Handle unique constraint violation — find existing record and update instead
        if (createError instanceof Prisma.PrismaClientKnownRequestError && createError.code === 'P2002') {
          // The unique constraint on [nisn, npsnSekolahPilihan] or [noRegistrasi, npsnSekolahPilihan]
          // was violated. Find the conflicting record and update it.
          const conflicting = await findExistingRecordCrossTahap(data, npsnSekolahPilihan);
          if (conflicting) {
            const updateData: Record<string, string | number | null> = {};

            // Always update status and verificationStatus
            if (data.status && data.status.trim()) {
              updateData['status'] = data.status.trim();
            }
            if (data.verificationStatus) {
              updateData['verificationStatus'] = data.verificationStatus;
            }

            // Update tahap to the new tahap
            updateData['tahap'] = tahap;

            // Merge portal fields into empty fields
            for (const [key, value] of Object.entries(portalFields)) {
              if (value && value.trim()) {
                if (key === 'verificationNote') {
                  updateData['verificationNote'] = value;
                  continue;
                }
                const existingValue = (conflicting as Record<string, unknown>)[key] as string | null | undefined;
                if (!existingValue || existingValue.trim() === '') {
                  updateData[key] = value;
                }
              }
            }

            const updated = await db.registration.update({
              where: { id: conflicting.id },
              data: updateData,
            });

            return NextResponse.json({
              success: true,
              action: 'updated',
              data: updated,
              message: `Data ${data.nama} (NISN: ${data.nisn}) berhasil diperbarui — sudah ada di tahap sebelumnya`,
            });
          }
        }
        throw createError;
      }
    }
  } catch (error) {
    console.error('Error saving portal paste data:', error);
    const message = error instanceof Error ? error.message : 'Failed to save data';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Find existing record with tahap-aware dedup.
 * Priority matches that include tahap to avoid cross-tahap conflicts.
 */
async function findExistingRecord(
  data: PortalPastePayload,
  npsnSekolahPilihan: string,
  tahap: number
) {
  // Priority 1: NISN + subJalur + tahap (most specific)
  if (data.nisn && data.nisn.trim()) {
    const existing = await db.registration.findFirst({
      where: {
        nisn: data.nisn.trim(),
        subJalur: data.subJalur?.trim() || undefined,
        tahap,
      },
    });
    if (existing) return existing;
  }

  // Priority 2: NISN + npsnSekolahPilihan + tahap
  if (data.nisn && data.nisn.trim()) {
    const existing = await db.registration.findFirst({
      where: {
        nisn: data.nisn.trim(),
        npsnSekolahPilihan,
        tahap,
      },
    });
    if (existing) return existing;
  }

  // Priority 3: noRegistrasi + subJalur + tahap
  if (data.noRegistrasi && data.noRegistrasi.trim()) {
    const existing = await db.registration.findFirst({
      where: {
        noRegistrasi: data.noRegistrasi.trim(),
        subJalur: data.subJalur?.trim() || undefined,
        tahap,
      },
    });
    if (existing) return existing;
  }

  // Priority 4: noRegistrasi + npsnSekolahPilihan + tahap
  if (data.noRegistrasi && data.noRegistrasi.trim()) {
    const existing = await db.registration.findFirst({
      where: {
        noRegistrasi: data.noRegistrasi.trim(),
        npsnSekolahPilihan,
        tahap,
      },
    });
    if (existing) return existing;
  }

  // Priority 5: nama + subJalur + tahap
  if (data.nama && data.nama.trim() && data.subJalur && data.subJalur.trim()) {
    const existing = await db.registration.findFirst({
      where: {
        nama: data.nama.trim(),
        subJalur: data.subJalur.trim(),
        tahap,
      },
    });
    if (existing) return existing;
  }

  // Priority 6: NISN alone + tahap
  if (data.nisn && data.nisn.trim()) {
    const existing = await db.registration.findFirst({
      where: {
        nisn: data.nisn.trim(),
        tahap,
      },
    });
    if (existing) return existing;
  }

  return null;
}

/**
 * Find existing record across all tahaps (fallback for unique constraint violation handling).
 * Used when a create fails due to [nisn, npsnSekolahPilihan] or [noRegistrasi, npsnSekolahPilihan]
 * unique constraints.
 */
async function findExistingRecordCrossTahap(
  data: PortalPastePayload,
  npsnSekolahPilihan: string
) {
  // Try by NISN + npsnSekolahPilihan (matches the unique constraint)
  if (data.nisn && data.nisn.trim()) {
    const existing = await db.registration.findFirst({
      where: {
        nisn: data.nisn.trim(),
        npsnSekolahPilihan,
      },
    });
    if (existing) return existing;
  }

  // Try by noRegistrasi + npsnSekolahPilihan (matches the other unique constraint)
  if (data.noRegistrasi && data.noRegistrasi.trim()) {
    const existing = await db.registration.findFirst({
      where: {
        noRegistrasi: data.noRegistrasi.trim(),
        npsnSekolahPilihan,
      },
    });
    if (existing) return existing;
  }

  // Last resort: NISN alone
  if (data.nisn && data.nisn.trim()) {
    const existing = await db.registration.findFirst({
      where: {
        nisn: data.nisn.trim(),
      },
    });
    if (existing) return existing;
  }

  return null;
}
