import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Auth required
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    // Use Promise.all for parallel queries to improve performance
    const [
      total, verified, rejected, pending,
      bySubJalur, bySekolahAsal, byJurusan, byStatus,
      verifiedBySubJalur, verifiedBySekolah, verifiedByJurusan, verifiedList,
      rejectedBySubJalur, rejectedBySekolah, rejectedByJurusan, rejectedList,
      lulus, tidakLulus, belumLulus,
      lulusBySubJalur, tidakLulusBySubJalur, lulusList, tidakLulusList,
      daftarUlang, tidakDaftarUlang, belumDaftarUlang,
      daftarUlangBySubJalur, tidakDaftarUlangBySubJalur, daftarUlangList, tidakDaftarUlangList,
    ] = await Promise.all([
      // Basic counts
      db.registration.count(),
      db.registration.count({ where: { verificationStatus: 'VERIFIED' } }),
      db.registration.count({ where: { verificationStatus: 'REJECTED' } }),
      db.registration.count({ where: { verificationStatus: 'PENDING' } }),

      // By sub jalur (all)
      db.registration.groupBy({ by: ['subJalur'], _count: { id: true }, orderBy: { _count: { id: 'desc' } } }),
      // By sekolah asal (all)
      db.registration.groupBy({ by: ['namaSekolahAsal'], _count: { id: true }, orderBy: { _count: { id: 'desc' } } }),
      // By jurusan (all)
      db.registration.groupBy({ by: ['jurusan'], _count: { id: true }, orderBy: { _count: { id: 'desc' } } }),
      // By status
      db.registration.groupBy({ by: ['status'], _count: { id: true }, orderBy: { _count: { id: 'desc' } } }),

      // Verified breakdowns
      db.registration.groupBy({ by: ['subJalur'], _count: { id: true }, where: { verificationStatus: 'VERIFIED' }, orderBy: { _count: { id: 'desc' } } }),
      db.registration.groupBy({ by: ['namaSekolahAsal'], _count: { id: true }, where: { verificationStatus: 'VERIFIED' }, orderBy: { _count: { id: 'desc' } } }),
      db.registration.groupBy({ by: ['jurusan'], _count: { id: true }, where: { verificationStatus: 'VERIFIED' }, orderBy: { _count: { id: 'desc' } } }),
      db.registration.findMany({ where: { verificationStatus: 'VERIFIED' }, orderBy: { updatedAt: 'desc' } }),

      // Rejected breakdowns
      db.registration.groupBy({ by: ['subJalur'], _count: { id: true }, where: { verificationStatus: 'REJECTED' }, orderBy: { _count: { id: 'desc' } } }),
      db.registration.groupBy({ by: ['namaSekolahAsal'], _count: { id: true }, where: { verificationStatus: 'REJECTED' }, orderBy: { _count: { id: 'desc' } } }),
      db.registration.groupBy({ by: ['jurusan'], _count: { id: true }, where: { verificationStatus: 'REJECTED' }, orderBy: { _count: { id: 'desc' } } }),
      db.registration.findMany({ where: { verificationStatus: 'REJECTED' }, orderBy: { updatedAt: 'desc' } }),

      // Kelulusan stats
      db.registration.count({ where: { statusLulus: 'LULUS' } }),
      db.registration.count({ where: { statusLulus: 'TIDAK_LULUS' } }),
      db.registration.count({ where: { statusLulus: 'BELUM' } }),
      db.registration.groupBy({ by: ['subJalur'], _count: { id: true }, where: { statusLulus: 'LULUS' }, orderBy: { _count: { id: 'desc' } } }),
      db.registration.groupBy({ by: ['subJalur'], _count: { id: true }, where: { statusLulus: 'TIDAK_LULUS' }, orderBy: { _count: { id: 'desc' } } }),
      db.registration.findMany({ where: { statusLulus: 'LULUS' }, orderBy: { updatedAt: 'desc' } }),
      db.registration.findMany({ where: { statusLulus: 'TIDAK_LULUS' }, orderBy: { updatedAt: 'desc' } }),

      // Daftar Ulang stats
      db.registration.count({ where: { statusDaftarUlang: 'DAFTAR_ULANG' } }),
      db.registration.count({ where: { statusDaftarUlang: 'TIDAK_DAFTAR_ULANG' } }),
      db.registration.count({ where: { statusDaftarUlang: 'BELUM' } }),
      db.registration.groupBy({ by: ['subJalur'], _count: { id: true }, where: { statusDaftarUlang: 'DAFTAR_ULANG' }, orderBy: { _count: { id: 'desc' } } }),
      db.registration.groupBy({ by: ['subJalur'], _count: { id: true }, where: { statusDaftarUlang: 'TIDAK_DAFTAR_ULANG' }, orderBy: { _count: { id: 'desc' } } }),
      db.registration.findMany({ where: { statusDaftarUlang: 'DAFTAR_ULANG' }, orderBy: { updatedAt: 'desc' } }),
      db.registration.findMany({ where: { statusDaftarUlang: 'TIDAK_DAFTAR_ULANG' }, orderBy: { updatedAt: 'desc' } }),
    ]);

    return NextResponse.json({
      total,
      verified,
      rejected,
      pending,
      bySubJalur: bySubJalur.map(item => ({
        name: item.subJalur,
        count: item._count.id,
      })),
      bySekolahAsal: bySekolahAsal.map(item => ({
        name: item.namaSekolahAsal,
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
      verifiedBySubJalur: verifiedBySubJalur.map(item => ({
        name: item.subJalur,
        count: item._count.id,
      })),
      verifiedBySekolah: verifiedBySekolah.map(item => ({
        name: item.namaSekolahAsal,
        count: item._count.id,
      })),
      verifiedByJurusan: verifiedByJurusan.map(item => ({
        name: item.jurusan,
        count: item._count.id,
      })),
      verifiedList,
      rejectedBySubJalur: rejectedBySubJalur.map(item => ({
        name: item.subJalur,
        count: item._count.id,
      })),
      rejectedBySekolah: rejectedBySekolah.map(item => ({
        name: item.namaSekolahAsal,
        count: item._count.id,
      })),
      rejectedByJurusan: rejectedByJurusan.map(item => ({
        name: item.jurusan,
        count: item._count.id,
      })),
      rejectedList,
      lulus,
      tidakLulus,
      belumLulus,
      lulusBySubJalur: lulusBySubJalur.map(item => ({
        name: item.subJalur,
        count: item._count.id,
      })),
      tidakLulusBySubJalur: tidakLulusBySubJalur.map(item => ({
        name: item.subJalur,
        count: item._count.id,
      })),
      lulusList,
      tidakLulusList,
      daftarUlang,
      tidakDaftarUlang,
      belumDaftarUlang,
      daftarUlangBySubJalur: daftarUlangBySubJalur.map(item => ({
        name: item.subJalur,
        count: item._count.id,
      })),
      tidakDaftarUlangBySubJalur: tidakDaftarUlangBySubJalur.map(item => ({
        name: item.subJalur,
        count: item._count.id,
      })),
      daftarUlangList,
      tidakDaftarUlangList,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
