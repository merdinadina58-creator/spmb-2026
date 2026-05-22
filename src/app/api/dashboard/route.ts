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

    // By sekolah asal (all)
    const bySekolahAsal = await db.registration.groupBy({
      by: ['namaSekolahAsal'],
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
      by: ['namaSekolahAsal'],
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
      by: ['namaSekolahAsal'],
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
      where: { statusLulus: 'LULUS' },
    });

    const tidakLulus = await db.registration.count({
      where: { statusLulus: 'TIDAK_LULUS' },
    });

    const belumLulus = await db.registration.count({
      where: { statusLulus: 'BELUM' },
    });

    // Lulus by sub jalur
    const lulusBySubJalur = await db.registration.groupBy({
      by: ['subJalur'],
      _count: { id: true },
      where: { statusLulus: 'LULUS' },
      orderBy: { _count: { id: 'desc' } },
    });

    const tidakLulusBySubJalur = await db.registration.groupBy({
      by: ['subJalur'],
      _count: { id: true },
      where: { statusLulus: 'TIDAK_LULUS' },
      orderBy: { _count: { id: 'desc' } },
    });

    // Lulus list
    const lulusList = await db.registration.findMany({
      where: { statusLulus: 'LULUS' },
      orderBy: { updatedAt: 'desc' },
    });

    const tidakLulusList = await db.registration.findMany({
      where: { statusLulus: 'TIDAK_LULUS' },
      orderBy: { updatedAt: 'desc' },
    });

    // === DAFTAR ULANG stats ===
    const daftarUlang = await db.registration.count({
      where: { statusDaftarUlang: 'DAFTAR_ULANG' },
    });

    const tidakDaftarUlang = await db.registration.count({
      where: { statusDaftarUlang: 'TIDAK_DAFTAR_ULANG' },
    });

    const belumDaftarUlang = await db.registration.count({
      where: { statusDaftarUlang: 'BELUM' },
    });

    // Daftar Ulang by sub jalur
    const daftarUlangBySubJalur = await db.registration.groupBy({
      by: ['subJalur'],
      _count: { id: true },
      where: { statusDaftarUlang: 'DAFTAR_ULANG' },
      orderBy: { _count: { id: 'desc' } },
    });

    const tidakDaftarUlangBySubJalur = await db.registration.groupBy({
      by: ['subJalur'],
      _count: { id: true },
      where: { statusDaftarUlang: 'TIDAK_DAFTAR_ULANG' },
      orderBy: { _count: { id: 'desc' } },
    });

    // Daftar Ulang list
    const daftarUlangList = await db.registration.findMany({
      where: { statusDaftarUlang: 'DAFTAR_ULANG' },
      orderBy: { updatedAt: 'desc' },
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
      // Verified details
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
      // Rejected details
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
      // Kelulusan stats
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
      // Daftar Ulang stats
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
