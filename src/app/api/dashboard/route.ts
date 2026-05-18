import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Total registrations
    const total = await db.registration.count();

    // By verification status
    const verified = await db.registration.count({
      where: { verificationStatus: 'VERIFIED' },
    });

    const rejected = await db.registration.count({
      where: { verificationStatus: 'REJECTED' },
    });

    const pending = await db.registration.count({
      where: { verificationStatus: 'PENDING' },
    });

    // By sub jalur
    const bySubJalur = await db.registration.groupBy({
      by: ['subJalur'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    // By sekolah pilihan
    const bySekolahPilihan = await db.registration.groupBy({
      by: ['namaSekolahPilihan'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    // By jurusan
    const byJurusan = await db.registration.groupBy({
      by: ['jurusan'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    // By status
    const byStatus = await db.registration.groupBy({
      by: ['status'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    return NextResponse.json({
      total,
      verified,
      rejected,
      pending,
      bySubJalur: bySubJalur.map(item => ({
        name: item.subJalur,
        count: item._count.id,
      })),
      bySekolahPilihan: bySekolahPilihan.map(item => ({
        name: item.namaSekolahPilihan,
        count: item._count.id,
      })),
      byJurusan: byJurusan.map(item => ({
        name: item.jurusan,
        count: item._count.id,
      })),
      byStatus: byStatus.map(item => ({
        name: item.status,
        count: item._count.id,
      })),
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
