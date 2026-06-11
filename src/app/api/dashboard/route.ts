import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser, unauthenticatedResponse } from '@/lib/auth';
import { withRetry } from '@/lib/retry';

export async function GET(request: NextRequest) {
  try {
    // Auth required
    const user = await getAuthUser(request)
    if (!user) {
      return unauthenticatedResponse()
    }

    // Get tahap filter from query params
    const searchParams = request.nextUrl.searchParams;
    const tahapParam = searchParams.get('tahap');
    const tahapFilter = tahapParam ? parseInt(tahapParam) : undefined;

    // Build base where condition for tahap
    const tahapWhere = tahapFilter ? { tahap: tahapFilter } : {};

    // Use withRetry + Promise.all for parallel queries with automatic retry on timeout
    const [
      total, verified, rejected, pending,
      bySubJalur, bySekolahAsal, byJurusan, byStatus,
      verifiedBySubJalur, verifiedBySekolah, verifiedByJurusan, verifiedList,
      rejectedBySubJalur, rejectedBySekolah, rejectedByJurusan, rejectedList,
      lulus, tidakLulus, belumLulus,
      lulusBySubJalur, tidakLulusBySubJalur, lulusList, tidakLulusList,
      daftarUlang, tidakDaftarUlang, belumDaftarUlang,
      daftarUlangBySubJalur, tidakDaftarUlangBySubJalur, daftarUlangList, tidakDaftarUlangList,
    ] = await withRetry(() => Promise.all([
      // Basic counts
      db.registration.count({ where: tahapWhere }),
      db.registration.count({ where: { ...tahapWhere, verificationStatus: 'VERIFIED' } }),
      db.registration.count({ where: { ...tahapWhere, verificationStatus: 'REJECTED' } }),
      db.registration.count({ where: { ...tahapWhere, verificationStatus: 'PENDING' } }),

      // By sub jalur (all)
      db.registration.groupBy({ by: ['subJalur'], _count: { id: true }, where: tahapWhere, orderBy: { _count: { id: 'desc' } } }),
      // By sekolah asal (all)
      db.registration.groupBy({ by: ['namaSekolahAsal'], _count: { id: true }, where: tahapWhere, orderBy: { _count: { id: 'desc' } } }),
      // By jurusan (all)
      db.registration.groupBy({ by: ['jurusan'], _count: { id: true }, where: tahapWhere, orderBy: { _count: { id: 'desc' } } }),
      // By status
      db.registration.groupBy({ by: ['status'], _count: { id: true }, where: tahapWhere, orderBy: { _count: { id: 'desc' } } }),

      // Verified breakdowns
      db.registration.groupBy({ by: ['subJalur'], _count: { id: true }, where: { ...tahapWhere, verificationStatus: 'VERIFIED' }, orderBy: { _count: { id: 'desc' } } }),
      db.registration.groupBy({ by: ['namaSekolahAsal'], _count: { id: true }, where: { ...tahapWhere, verificationStatus: 'VERIFIED' }, orderBy: { _count: { id: 'desc' } } }),
      db.registration.groupBy({ by: ['jurusan'], _count: { id: true }, where: { ...tahapWhere, verificationStatus: 'VERIFIED' }, orderBy: { _count: { id: 'desc' } } }),
      db.registration.findMany({ where: { ...tahapWhere, verificationStatus: 'VERIFIED' }, orderBy: { updatedAt: 'desc' } }),

      // Rejected breakdowns
      db.registration.groupBy({ by: ['subJalur'], _count: { id: true }, where: { ...tahapWhere, verificationStatus: 'REJECTED' }, orderBy: { _count: { id: 'desc' } } }),
      db.registration.groupBy({ by: ['namaSekolahAsal'], _count: { id: true }, where: { ...tahapWhere, verificationStatus: 'REJECTED' }, orderBy: { _count: { id: 'desc' } } }),
      db.registration.groupBy({ by: ['jurusan'], _count: { id: true }, where: { ...tahapWhere, verificationStatus: 'REJECTED' }, orderBy: { _count: { id: 'desc' } } }),
      db.registration.findMany({ where: { ...tahapWhere, verificationStatus: 'REJECTED' }, orderBy: { updatedAt: 'desc' } }),

      // Kelulusan stats
      db.registration.count({ where: { ...tahapWhere, statusLulus: 'LULUS' } }),
      db.registration.count({ where: { ...tahapWhere, statusLulus: 'TIDAK_LULUS' } }),
      db.registration.count({ where: { ...tahapWhere, statusLulus: 'BELUM' } }),
      db.registration.groupBy({ by: ['subJalur'], _count: { id: true }, where: { ...tahapWhere, statusLulus: 'LULUS' }, orderBy: { _count: { id: 'desc' } } }),
      db.registration.groupBy({ by: ['subJalur'], _count: { id: true }, where: { ...tahapWhere, statusLulus: 'TIDAK_LULUS' }, orderBy: { _count: { id: 'desc' } } }),
      db.registration.findMany({ where: { ...tahapWhere, statusLulus: 'LULUS' }, orderBy: { updatedAt: 'desc' } }),
      db.registration.findMany({ where: { ...tahapWhere, statusLulus: 'TIDAK_LULUS' }, orderBy: { updatedAt: 'desc' } }),

      // Daftar Ulang stats
      db.registration.count({ where: { ...tahapWhere, statusDaftarUlang: 'DAFTAR_ULANG' } }),
      db.registration.count({ where: { ...tahapWhere, statusDaftarUlang: 'TIDAK_DAFTAR_ULANG' } }),
      db.registration.count({ where: { ...tahapWhere, statusDaftarUlang: 'BELUM' } }),
      db.registration.groupBy({ by: ['subJalur'], _count: { id: true }, where: { ...tahapWhere, statusDaftarUlang: 'DAFTAR_ULANG' }, orderBy: { _count: { id: 'desc' } } }),
      db.registration.groupBy({ by: ['subJalur'], _count: { id: true }, where: { ...tahapWhere, statusDaftarUlang: 'TIDAK_DAFTAR_ULANG' }, orderBy: { _count: { id: 'desc' } } }),
      db.registration.findMany({ where: { ...tahapWhere, statusDaftarUlang: 'DAFTAR_ULANG' }, orderBy: { updatedAt: 'desc' } }),
      db.registration.findMany({ where: { ...tahapWhere, statusDaftarUlang: 'TIDAK_DAFTAR_ULANG' }, orderBy: { updatedAt: 'desc' } }),
    ]))

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
