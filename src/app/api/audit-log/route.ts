import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/audit-log — Fetch recent audit logs with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const action = searchParams.get('action') || '';
    const entityType = searchParams.get('entityType') || '';

    const where: Record<string, unknown> = {};
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;

    const logs = await db.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: { id: true, username: true, namaLengkap: true, role: true },
        },
      },
    });

    const total = await db.auditLog.count({ where });

    return NextResponse.json({ success: true, logs, total });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}

// POST /api/audit-log — Create an audit log entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, entityType, entityId, details } = body as {
      userId: string;
      action: string;
      entityType: string;
      entityId?: string;
      details?: string;
    };

    if (!userId || !action || !entityType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const log = await db.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId: entityId || null,
        details: details || null,
      },
      include: {
        user: {
          select: { id: true, username: true, namaLengkap: true, role: true },
        },
      },
    });

    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error('Error creating audit log:', error);
    return NextResponse.json({ error: 'Failed to create audit log' }, { status: 500 });
  }
}
