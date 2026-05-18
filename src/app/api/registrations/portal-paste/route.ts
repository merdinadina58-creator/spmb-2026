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

    // STEP 2: Fallback - try by noRegistrasi + npsnSekolahPilihan
    if (!existing && data.noRegistrasi && data.noRegistrasi.trim()) {
      existing = await db.registration.findFirst({
        where: {
          noRegistrasi: data.noRegistrasi.trim(),
          npsnSekolahPilihan,
        },
      });
    }

    if (existing) {
      // UPDATE existing record - merge new data, don't overwrite verification fields with empty
      const updateData: Record<string, string | null> = {
        noRegistrasi: data.noRegistrasi || existing.noRegistrasi,
        nama: data.nama || existing.nama,
        nisn: data.nisn || existing.nisn,
        subJalur: data.subJalur || existing.subJalur,
        namaSekolahPilihan: data.namaSekolahPilihan || existing.namaSekolahPilihan,
        jurusan: data.jurusan || existing.jurusan,
        npsnSekolahAsal: data.npsnSekolahAsal || existing.npsnSekolahAsal,
        namaSekolahAsal: data.namaSekolahAsal || existing.namaSekolahAsal,
        status: data.status || existing.status,
        waktuDaftar: data.waktuDaftar || existing.waktuDaftar,
      };

      // Only update portal fields if new values are provided (don't erase existing data)
      for (const [key, value] of Object.entries(portalFields)) {
        if (value && value.trim()) {
          updateData[key] = value;
        }
      }

      const updated = await db.registration.update({
        where: { id: existing.id },
        data: updateData,
      });

      return NextResponse.json({
        success: true,
        action: 'updated',
        data: updated,
        message: `Data NISN ${data.nisn} berhasil diperbarui`,
      });
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
          verificationStatus: 'PENDING',
          ...portalFields,
        },
      });

      return NextResponse.json({
        success: true,
        action: 'created',
        data: created,
        message: `Data baru NISN ${data.nisn} berhasil ditambahkan`,
      });
    }
  } catch (error) {
    console.error('Error saving portal paste data:', error);
    const message = error instanceof Error ? error.message : 'Failed to save data';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
