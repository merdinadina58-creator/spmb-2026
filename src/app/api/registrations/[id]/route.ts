import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// Hitung Lama KK dari tanggal Terbit KK
function hitungLamaKK(terbitKK: string): string {
  if (!terbitKK) return ''
  const terbit = new Date(terbitKK)
  if (isNaN(terbit.getTime())) return ''
  const now = new Date()
  let years = now.getFullYear() - terbit.getFullYear()
  let months = now.getMonth() - terbit.getMonth()
  let days = now.getDate() - terbit.getDate()
  if (days < 0) {
    months--
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    days += prevMonth.getDate()
  }
  if (months < 0) {
    years--
    months += 12
  }
  const parts: string[] = []
  if (years > 0) parts.push(`${years} Tahun`)
  if (months > 0) parts.push(`${months} Bulan`)
  if (days > 0 && years === 0) parts.push(`${days} Hari`)
  if (parts.length === 0) parts.push('0 Hari')
  return parts.join(' ')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const { id } = await params;
    const body = await request.json();

    // Validate field and value types
    if (body.field && typeof body.field !== 'string') {
      return NextResponse.json({ error: 'Field must be a string' }, { status: 400 });
    }
    if (body.value !== undefined && body.value !== null && typeof body.value !== 'string') {
      return NextResponse.json({ error: 'Value must be a string or null' }, { status: 400 });
    }

    // Allowed fields for update
    const allowedFields = [
      'kekuranganVerifikasi',
      'tanggalVerif',
      'jamVerif',
      'terbitKK',
      'lamaKK',
      'skorNilaiRaport',
      'skorLomba',
      'nilaiRataRataTKA',
      'skorPrestasiAkademik',
      'skorJarak',
      'noRegistrasi',
      'nama',
      'nisn',
      'subJalur',
      'npsnSekolahPilihan',
      'namaSekolahPilihan',
      'jurusan',
      'npsnSekolahAsal',
      'namaSekolahAsal',
      'nik',
      'tanggalLahir',
      'alamat',
      'alamatLengkap',
      'noTelpSiswa',
      'noTelpOrangtua',
      'latitude',
      'longitude',
      'lokasiJarak',
      'nilaiRataRata',
      'skor',
      'nilaiRapor',
      'dokumen',
      'statusLulus',
      'statusDaftarUlang',
    ] as const;

    const updateData: Record<string, string | null> = {};

    // Support both { field, value } and { kekuranganVerifikasi: "...", ... } formats
    if (body.field && typeof body.field === 'string') {
      // Single field update: { field: "kekuranganVerifikasi", value: "..." }
      if (allowedFields.includes(body.field as typeof allowedFields[number])) {
        // Validate enum fields
        if (body.field === 'statusLulus' && body.value && !['LULUS', 'TIDAK_LULUS', 'BELUM'].includes(body.value)) {
          return NextResponse.json({ error: 'Invalid statusLulus value' }, { status: 400 });
        }
        if (body.field === 'statusDaftarUlang' && body.value && !['DAFTAR_ULANG', 'TIDAK_DAFTAR_ULANG', 'BELUM'].includes(body.value)) {
          return NextResponse.json({ error: 'Invalid statusDaftarUlang value' }, { status: 400 });
        }
        updateData[body.field] = body.value ?? null;
      } else {
        return NextResponse.json({ error: `Field "${body.field}" is not allowed for update` }, { status: 400 });
      }
    } else {
      // Multiple field update: { kekuranganVerifikasi: "...", tanggalVerif: "..." }
      for (const field of allowedFields) {
        if (field in body) {
          const val = body[field];
          // Validate enum fields
          if (field === 'statusLulus' && val && !['LULUS', 'TIDAK_LULUS', 'BELUM'].includes(val)) {
            return NextResponse.json({ error: 'Invalid statusLulus value' }, { status: 400 });
          }
          if (field === 'statusDaftarUlang' && val && !['DAFTAR_ULANG', 'TIDAK_DAFTAR_ULANG', 'BELUM'].includes(val)) {
            return NextResponse.json({ error: 'Invalid statusDaftarUlang value' }, { status: 400 });
          }
          updateData[field] = val ?? null;
        }
      }
    }

    // Auto-calculate lamaKK when terbitKK is provided
    if ('terbitKK' in updateData) {
      if (updateData.terbitKK) {
        const calculatedLama = hitungLamaKK(updateData.terbitKK);
        if (calculatedLama) {
          updateData['lamaKK'] = calculatedLama;
        }
      } else {
        // When terbitKK is cleared, also clear lamaKK
        updateData['lamaKK'] = null;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Check existence first
    const existing = await db.registration.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Pendaftar tidak ditemukan' }, { status: 404 })
    }

    const registration = await db.registration.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: registration });
  } catch (error) {
    console.error('Error updating registration:', error);
    return NextResponse.json({ error: 'Failed to update registration' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const { id } = await params;

    const existing = await db.registration.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    await db.registration.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Registration deleted successfully' });
  } catch (error) {
    console.error('Error deleting registration:', error);
    return NextResponse.json({ error: 'Failed to delete registration' }, { status: 500 });
  }
}
