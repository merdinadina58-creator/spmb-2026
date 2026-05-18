import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
