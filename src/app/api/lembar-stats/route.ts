import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser, unauthenticatedResponse } from '@/lib/auth';
import { withRetry } from '@/lib/retry';

// Lightweight stats endpoint for Lembar Verifikasi
// Only returns groupBy counts (no full record lists) — much faster than /api/dashboard
export async function GET(request: NextRequest) {
  try {
    // Auth required
    const user = await getAuthUser(request)
    if (!user) {
      return unauthenticatedResponse()
    }

    // Only the 3 groupBy queries that Lembar Verifikasi needs
    const [bySubJalur, verifiedBySubJalur, rejectedBySubJalur] = await withRetry(() => Promise.all([
      db.registration.groupBy({ by: ['subJalur'], _count: { id: true }, orderBy: { _count: { id: 'desc' } } }),
      db.registration.groupBy({ by: ['subJalur'], _count: { id: true }, where: { verificationStatus: 'VERIFIED' }, orderBy: { _count: { id: 'desc' } } }),
      db.registration.groupBy({ by: ['subJalur'], _count: { id: true }, where: { verificationStatus: 'REJECTED' }, orderBy: { _count: { id: 'desc' } } }),
    ]))

    return NextResponse.json({
      bySubJalur: bySubJalur.map(item => ({
        name: item.subJalur,
        count: item._count.id,
      })),
      verifiedBySubJalur: verifiedBySubJalur.map(item => ({
        name: item.subJalur,
        count: item._count.id,
      })),
      rejectedBySubJalur: rejectedBySubJalur.map(item => ({
        name: item.subJalur,
        count: item._count.id,
      })),
    });
  } catch (error) {
    console.error('Error fetching lembar stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
