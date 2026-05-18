import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
    const { id } = await params;
    const body = await request.json();

    // Allowed fields for update
    const allowedFields = [
      'kekuranganVerifikasi',
      'tanggalVerif',
      'jamVerif',
      'terbitKK',
      'lamaKK',
      'skorNilaiRaport',
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
    ] as const;

    const updateData: Record<string, string | null> = {};

    // Support both { field, value } and { kekuranganVerifikasi: "...", ... } formats
    if (body.field && typeof body.field === 'string') {
      // Single field update: { field: "kekuranganVerifikasi", value: "..." }
      if (allowedFields.includes(body.field as typeof allowedFields[number])) {
        updateData[body.field] = body.value ?? null;
      } else {
        return NextResponse.json({ error: `Field "${body.field}" is not allowed for update` }, { status: 400 });
      }
    } else {
      // Multiple field update: { kekuranganVerifikasi: "...", tanggalVerif: "..." }
      for (const field of allowedFields) {
        if (field in body) {
          updateData[field] = body[field] ?? null;
        }
      }
    }

    // Auto-calculate lamaKK when terbitKK is provided
    if ('terbitKK' in updateData && updateData.terbitKK) {
      const calculatedLama = hitungLamaKK(updateData.terbitKK);
      if (calculatedLama) {
        updateData['lamaKK'] = calculatedLama;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
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
