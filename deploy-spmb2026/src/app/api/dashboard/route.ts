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

    // By sub jalur (all)
    const bySubJalur = await db.registration.groupBy({
      by: ['subJalur'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    // By sekolah pilihan (all)
    const bySekolahPilihan = await db.registration.groupBy({
      by: ['namaSekolahPilihan'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    // By jurusan (all)
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

    // === VERIFIED breakdowns ===
    const verifiedBySubJalur = await db.registration.groupBy({
      by: ['subJalur'],
      _count: { id: true },
      where: { verificationStatus: 'VERIFIED' },
      orderBy: { _count: { id: 'desc' } },
    });

    const verifiedBySekolah = await db.registration.groupBy({
      by: ['namaSekolahPilihan'],
      _count: { id: true },
      where: { verificationStatus: 'VERIFIED' },
      orderBy: { _count: { id: 'desc' } },
    });

    const verifiedByJurusan = await db.registration.groupBy({
      by: ['jurusan'],
      _count: { id: true },
      where: { verificationStatus: 'VERIFIED' },
      orderBy: { _count: { id: 'desc' } },
    });

    // Get all verified registrations for detailed list
    const verifiedList = await db.registration.findMany({
      where: { verificationStatus: 'VERIFIED' },
      orderBy: { updatedAt: 'desc' },
    });

    // === REJECTED breakdowns ===
    const rejectedBySubJalur = await db.registration.groupBy({
      by: ['subJalur'],
      _count: { id: true },
      where: { verificationStatus: 'REJECTED' },
      orderBy: { _count: { id: 'desc' } },
    });

    const rejectedBySekolah = await db.registration.groupBy({
      by: ['namaSekolahPilihan'],
      _count: { id: true },
      where: { verificationStatus: 'REJECTED' },
      orderBy: { _count: { id: 'desc' } },
    });

    const rejectedByJurusan = await db.registration.groupBy({
      by: ['jurusan'],
      _count: { id: true },
      where: { verificationStatus: 'REJECTED' },
      orderBy: { _count: { id: 'desc' } },
    });

    // Get all rejected registrations for detailed list
    const rejectedList = await db.registration.findMany({
      where: { verificationStatus: 'REJECTED' },
      orderBy: { updatedAt: 'desc' },
    });

    // === KELULUSAN stats ===
    const lulus = await db.registration.count({
      where: { statusKelulusan: 'LULUS' },
    });

    const tidakLulus = await db.registration.count({
      where: { statusKelulusan: 'TIDAK_LULUS' },
    });

    const lulusBySubJalur = await db.registration.groupBy({
      by: ['subJalur'],
      _count: { id: true },
      where: { statusKelulusan: 'LULUS' },
      orderBy: { _count: { id: 'desc' } },
    });

    const lulusList = await db.registration.findMany({
      where: { statusKelulusan: 'LULUS' },
      orderBy: { updatedAt: 'desc' },
    });

    const tidakLulusBySubJalur = await db.registration.groupBy({
      by: ['subJalur'],
      _count: { id: true },
      where: { statusKelulusan: 'TIDAK_LULUS' },
      orderBy: { _count: { id: 'desc' } },
    });

    const tidakLulusList = await db.registration.findMany({
      where: { statusKelulusan: 'TIDAK_LULUS' },
      orderBy: { updatedAt: 'desc' },
    });

    // === DAFTAR ULANG stats ===
    const daftarUlang = await db.registration.count({
      where: { statusDaftarUlang: 'DAFTAR_ULANG' },
    });

    const tidakDaftarUlang = await db.registration.count({
      where: { statusDaftarUlang: 'TIDAK_DAFTAR_ULANG' },
    });

    const daftarUlangBySubJalur = await db.registration.groupBy({
      by: ['subJalur'],
      _count: { id: true },
      where: { statusDaftarUlang: 'DAFTAR_ULANG' },
      orderBy: { _count: { id: 'desc' } },
    });

    const daftarUlangList = await db.registration.findMany({
      where: { statusDaftarUlang: 'DAFTAR_ULANG' },
      orderBy: { updatedAt: 'desc' },
    });

    const tidakDaftarUlangBySubJalur = await db.registration.groupBy({
      by: ['subJalur'],
      _count: { id: true },
      where: { statusDaftarUlang: 'TIDAK_DAFTAR_ULANG' },
      orderBy: { _count: { id: 'desc' } },
    });

    const tidakDaftarUlangList = await db.registration.findMany({
      where: { statusDaftarUlang: 'TIDAK_DAFTAR_ULANG' },
      orderBy: { updatedAt: 'desc' },
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
      // Verified details
      verifiedBySubJalur: verifiedBySubJalur.map(item => ({
        name: item.subJalur,
        count: item._count.id,
      })),
      verifiedBySekolah: verifiedBySekolah.map(item => ({
        name: item.namaSekolahPilihan,
        count: item._count.id,
      })),
      verifiedByJurusan: verifiedByJurusan.map(item => ({
        name: item.jurusan,
        count: item._count.id,
      })),
      verifiedList,
      // Rejected details
      rejectedBySubJalur: rejectedBySubJalur.map(item => ({
        name: item.subJalur,
        count: item._count.id,
      })),
      rejectedBySekolah: rejectedBySekolah.map(item => ({
        name: item.namaSekolahPilihan,
        count: item._count.id,
      })),
      rejectedByJurusan: rejectedByJurusan.map(item => ({
        name: item.jurusan,
        count: item._count.id,
      })),
      rejectedList,
      // Kelulusan details
      lulus,
      tidakLulus,
      lulusBySubJalur: lulusBySubJalur.map(item => ({
        name: item.subJalur,
        count: item._count.id,
      })),
      lulusList,
      tidakLulusBySubJalur: tidakLulusBySubJalur.map(item => ({
        name: item.subJalur,
        count: item._count.id,
      })),
      tidakLulusList,
      // Daftar Ulang details
      daftarUlang,
      tidakDaftarUlang,
      daftarUlangBySubJalur: daftarUlangBySubJalur.map(item => ({
        name: item.subJalur,
        count: item._count.id,
      })),
      daftarUlangList,
      tidakDaftarUlangBySubJalur: tidakDaftarUlangBySubJalur.map(item => ({
        name: item.subJalur,
        count: item._count.id,
      })),
      tidakDaftarUlangList,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
