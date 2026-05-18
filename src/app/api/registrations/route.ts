import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const subJalur = searchParams.get('subJalur') || '';
    const verificationStatus = searchParams.get('verificationStatus') || '';
    const sekolahPilihan = searchParams.get('sekolahPilihan') || '';
    const jurusan = searchParams.get('jurusan') || '';

    const where: Record<string, unknown> = {};

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
