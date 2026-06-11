import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser, unauthenticatedResponse } from '@/lib/auth';

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return unauthenticatedResponse()
    }

    const body = await request.json();
    const { id, verificationStatus, verificationNote } = body as {
      id: string;
      verificationStatus: string;
      verificationNote?: string;
    };

    if (!id || !verificationStatus) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['VERIFIED', 'REJECTED', 'PENDING'].includes(verificationStatus)) {
      return NextResponse.json({ error: 'Invalid verification status' }, { status: 400 });
    }

    // Check existence first
    const existing = await db.registration.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Pendaftar tidak ditemukan' }, { status: 404 })
    }

    const registration = await db.registration.update({
      where: { id },
      data: {
        verificationStatus,
        verificationNote: verificationNote || null,
      },
    });

    return NextResponse.json({ success: true, data: registration });
  } catch (error) {
    console.error('Error verifying registration:', error);
    return NextResponse.json({ error: 'Failed to verify registration' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return unauthenticatedResponse()
    }

    const body = await request.json();
    const { ids, verificationStatus, verificationNote } = body as {
      ids: string[];
      verificationStatus: string;
      verificationNote?: string;
    };

    if (!ids || !Array.isArray(ids) || ids.length === 0 || !verificationStatus) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['VERIFIED', 'REJECTED', 'PENDING'].includes(verificationStatus)) {
      return NextResponse.json({ error: 'Invalid verification status' }, { status: 400 });
    }

    const result = await db.registration.updateMany({
      where: { id: { in: ids } },
      data: {
        verificationStatus,
        verificationNote: verificationNote || null,
      },
    });

    return NextResponse.json({ success: true, updated: result.count });
  } catch (error) {
    console.error('Error bulk verifying registrations:', error);
    return NextResponse.json({ error: 'Failed to bulk verify registrations' }, { status: 500 });
  }
}
