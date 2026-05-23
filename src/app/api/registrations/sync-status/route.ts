import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mapStatusToVerificationStatus } from '@/lib/constants';

/**
 * POST /api/registrations/sync-status
 * Fix all records where status and verificationStatus are out of sync.
 * Maps the `status` field to the correct `verificationStatus` using the standard mapping.
 */
export async function POST() {
  try {
    // Get all registrations
    const allRegistrations = await db.registration.findMany({
      select: { id: true, status: true, verificationStatus: true },
    });

    let fixed = 0;
    let alreadyCorrect = 0;

    for (const reg of allRegistrations) {
      const { verificationStatus: correctVerifStatus, status: correctStatus } =
        mapStatusToVerificationStatus(reg.status);

      if (reg.verificationStatus !== correctVerifStatus || reg.status !== correctStatus) {
        await db.registration.update({
          where: { id: reg.id },
          data: {
            verificationStatus: correctVerifStatus,
            status: correctStatus,
          },
        });
        fixed++;
      } else {
        alreadyCorrect++;
      }
    }

    return NextResponse.json({
      success: true,
      total: allRegistrations.length,
      fixed,
      alreadyCorrect,
      message: `${fixed} data diperbaiki, ${alreadyCorrect} data sudah benar`,
    });
  } catch (error) {
    console.error('Error syncing statuses:', error);
    return NextResponse.json({ error: 'Failed to sync statuses' }, { status: 500 });
  }
}
