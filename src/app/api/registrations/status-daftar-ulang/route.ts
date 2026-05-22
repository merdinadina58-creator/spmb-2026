import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PATCH: Update single registration's statusDaftarUlang
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, statusDaftarUlang } = body as {
      id: string;
      statusDaftarUlang: string;
    };

    if (!id || !statusDaftarUlang) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['DAFTAR_ULANG', 'TIDAK_DAFTAR_ULANG', 'BELUM'].includes(statusDaftarUlang)) {
      return NextResponse.json({ error: 'Invalid status. Must be DAFTAR_ULANG, TIDAK_DAFTAR_ULANG, or BELUM' }, { status: 400 });
    }

    const registration = await db.registration.update({
      where: { id },
      data: { statusDaftarUlang },
    });

    return NextResponse.json({ success: true, data: registration });
  } catch (error) {
    console.error('Error updating statusDaftarUlang:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}

// POST: Bulk update statusDaftarUlang
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, statusDaftarUlang } = body as {
      ids: string[];
      statusDaftarUlang: string;
    };

    if (!ids || !Array.isArray(ids) || ids.length === 0 || !statusDaftarUlang) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['DAFTAR_ULANG', 'TIDAK_DAFTAR_ULANG', 'BELUM'].includes(statusDaftarUlang)) {
      return NextResponse.json({ error: 'Invalid status. Must be DAFTAR_ULANG, TIDAK_DAFTAR_ULANG, or BELUM' }, { status: 400 });
    }

    const result = await db.registration.updateMany({
      where: { id: { in: ids } },
      data: { statusDaftarUlang },
    });

    return NextResponse.json({ success: true, updated: result.count });
  } catch (error) {
    console.error('Error bulk updating statusDaftarUlang:', error);
    return NextResponse.json({ error: 'Failed to bulk update status' }, { status: 500 });
  }
}
