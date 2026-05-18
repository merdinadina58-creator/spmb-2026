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
  skor?: string;
  nilaiRapor?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = body as PortalPastePayload;

    if (!data.noRegistrasi) {
      return NextResponse.json({ error: 'No. Registrasi wajib diisi' }, { status: 400 });
    }

    if (!data.nama) {
      return NextResponse.json({ error: 'Nama wajib diisi' }, { status: 400 });
    }

    // Use noRegistrasi as unique identifier, with npsnSekolahPilihan
    const npsnSekolahPilihan = data.npsnSekolahPilihan || '0';

    const existing = await db.registration.findFirst({
      where: {
        noRegistrasi: data.noRegistrasi,
        npsnSekolahPilihan,
      },
    });

    const portalFields: Record<string, string> = {};
    const optionalFields = ['nik', 'tanggalLahir', 'alamat', 'alamatLengkap', 'noTelpSiswa', 'noTelpOrangtua', 'latitude', 'longitude', 'lokasiJarak', 'nilaiRataRata', 'skorJarak', 'skor', 'nilaiRapor'] as const;
    for (const field of optionalFields) {
      const value = (data as Record<string, unknown>)[field];
      if (value && typeof value === 'string' && value.trim()) {
        portalFields[field] = value.trim();
      }
    }

    if (existing) {
      // Update existing record with portal data
      const updated = await db.registration.update({
        where: { id: existing.id },
        data: {
          nama: data.nama || existing.nama,
          nisn: data.nisn || existing.nisn,
          subJalur: data.subJalur || existing.subJalur,
          namaSekolahPilihan: data.namaSekolahPilihan || existing.namaSekolahPilihan,
          jurusan: data.jurusan || existing.jurusan,
          npsnSekolahAsal: data.npsnSekolahAsal || existing.npsnSekolahAsal,
          namaSekolahAsal: data.namaSekolahAsal || existing.namaSekolahAsal,
          status: data.status || existing.status,
          waktuDaftar: data.waktuDaftar || existing.waktuDaftar,
          ...portalFields,
        },
      });
      return NextResponse.json({ success: true, action: 'updated', data: updated });
    } else {
      // Create new record
      const created = await db.registration.create({
        data: {
          noRegistrasi: data.noRegistrasi,
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
      return NextResponse.json({ success: true, action: 'created', data: created });
    }
  } catch (error) {
    console.error('Error saving portal paste data:', error);
    const message = error instanceof Error ? error.message : 'Failed to save data';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
