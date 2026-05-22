import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PATCH: Update single registration's statusLulus
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, statusLulus } = body as {
      id: string;
      statusLulus: string;
    };

    if (!id || !statusLulus) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['LULUS', 'TIDAK_LULUS', 'BELUM'].includes(statusLulus)) {
      return NextResponse.json({ error: 'Invalid status. Must be LULUS, TIDAK_LULUS, or BELUM' }, { status: 400 });
    }

    const registration = await db.registration.update({
      where: { id },
      data: { statusLulus },
    });

    return NextResponse.json({ success: true, data: registration });
  } catch (error) {
    console.error('Error updating statusLulus:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}

// POST: Bulk update statusLulus
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, statusLulus } = body as {
      ids: string[];
      statusLulus: string;
    };

    if (!ids || !Array.isArray(ids) || ids.length === 0 || !statusLulus) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['LULUS', 'TIDAK_LULUS', 'BELUM'].includes(statusLulus)) {
      return NextResponse.json({ error: 'Invalid status. Must be LULUS, TIDAK_LULUS, or BELUM' }, { status: 400 });
    }

    const result = await db.registration.updateMany({
      where: { id: { in: ids } },
      data: { statusLulus },
    });

    return NextResponse.json({ success: true, updated: result.count });
  } catch (error) {
    console.error('Error bulk updating statusLulus:', error);
    return NextResponse.json({ error: 'Failed to bulk update status' }, { status: 500 });
  }
}
