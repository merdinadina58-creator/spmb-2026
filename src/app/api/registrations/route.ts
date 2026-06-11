import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser, unauthenticatedResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Auth required
    const user = await getAuthUser(request)
    if (!user) {
      return unauthenticatedResponse()
    }

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
    const limit = Math.min(1000, Math.max(1, parseInt(searchParams.get('limit') || '10') || 10));
    const search = searchParams.get('search') || '';
    const subJalur = searchParams.get('subJalur') || '';
    const verificationStatus = searchParams.get('verificationStatus') || '';
    const sekolahPilihan = searchParams.get('sekolahPilihan') || '';
    const jurusan = searchParams.get('jurusan') || '';
    const tahapParam = searchParams.get('tahap') || '';

    const where: Record<string, unknown> = {};

    // Tahap filter
    if (tahapParam) {
      where.tahap = parseInt(tahapParam);
    }

    if (search) {
      where.OR = [
        { nama: { contains: search } },
        { noRegistrasi: { contains: search } },
        { nisn: { contains: search } },
      ];
    }

    if (subJalur) {
      // Support comma-separated subJalur for grouping (e.g. Afirmasi = KTM + Anak Guru)
      const jalurValues = subJalur.split(',').map(s => s.trim()).filter(Boolean);
      if (jalurValues.length === 1) {
        where.subJalur = jalurValues[0];
      } else if (jalurValues.length > 1) {
        where.subJalur = { in: jalurValues };
      }
    }

    if (verificationStatus) {
      where.verificationStatus = verificationStatus;
    }

    if (sekolahPilihan) {
      where.namaSekolahPilihan = { contains: sekolahPilihan };
    }

    if (jurusan) {
      where.jurusan = jurusan;
    }

    const total = await db.registration.count({ where });
    const data = await db.registration.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
  }
}
