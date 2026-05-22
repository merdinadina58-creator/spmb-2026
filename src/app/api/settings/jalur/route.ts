import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminUser } from '@/lib/auth'

// POST - Create new jalur (admin only)
export async function POST(request: NextRequest) {
  try {
    const adminUser = await getAdminUser(request)
    if (!adminUser) {
      return NextResponse.json({ error: 'Akses ditolak. Hanya admin.' }, { status: 403 })
    }

    const body = await request.json();
    const { nama, persentase, urutan } = body as { nama: string; persentase: number; urutan?: number };

    if (!nama || !nama.trim()) {
      return NextResponse.json({ error: 'Nama jalur wajib diisi' }, { status: 400 });
    }

    // Check if nama already exists
    const existing = await db.jalurConfig.findFirst({
      where: { nama: nama.trim() },
    });

    if (existing) {
      return NextResponse.json({ error: `Jalur "${nama}" sudah ada` }, { status: 400 });
    }

    // Get max urutan if not provided
    let urutanValue = urutan;
    if (urutanValue === undefined || urutanValue === null) {
      const maxUrutan = await db.jalurConfig.findFirst({
        orderBy: { urutan: 'desc' },
        select: { urutan: true },
      });
      urutanValue = (maxUrutan?.urutan || 0) + 1;
    }

    const jalur = await db.jalurConfig.create({
      data: {
        nama: nama.trim(),
        persentase: persentase || 0,
        urutan: urutanValue,
        aktif: true,
      },
    });

    return NextResponse.json({ success: true, data: jalur });
  } catch (error) {
    console.error('Error creating jalur:', error);
    return NextResponse.json({ error: 'Failed to create jalur' }, { status: 500 });
  }
}

// PUT - Update jalur (admin only)
export async function PUT(request: NextRequest) {
  try {
    const adminUser = await getAdminUser(request)
    if (!adminUser) {
      return NextResponse.json({ error: 'Akses ditolak. Hanya admin.' }, { status: 403 })
    }

    const body = await request.json();
    const { id, nama, persentase, urutan, aktif } = body as {
      id: string;
      nama?: string;
      persentase?: number;
      urutan?: number;
      aktif?: boolean;
    };

    if (!id) {
      return NextResponse.json({ error: 'ID jalur wajib diisi' }, { status: 400 });
    }

    const existing = await db.jalurConfig.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Jalur tidak ditemukan' }, { status: 404 });
    }

    // Check for name conflict if renaming
    if (nama && nama.trim() !== existing.nama) {
      const nameConflict = await db.jalurConfig.findFirst({
        where: { nama: nama.trim(), NOT: { id } },
      });
      if (nameConflict) {
        return NextResponse.json({ error: `Jalur "${nama}" sudah ada` }, { status: 400 });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (nama !== undefined) updateData.nama = nama.trim();
    if (persentase !== undefined) updateData.persentase = persentase;
    if (urutan !== undefined) updateData.urutan = urutan;
    if (aktif !== undefined) updateData.aktif = aktif;

    const updated = await db.jalurConfig.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating jalur:', error);
    return NextResponse.json({ error: 'Failed to update jalur' }, { status: 500 });
  }
}

// DELETE - Delete jalur (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const adminUser = await getAdminUser(request)
    if (!adminUser) {
      return NextResponse.json({ error: 'Akses ditolak. Hanya admin.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID jalur wajib diisi' }, { status: 400 });
    }

    const existing = await db.jalurConfig.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Jalur tidak ditemukan' }, { status: 404 });
    }

    await db.jalurConfig.delete({ where: { id } });

    return NextResponse.json({ success: true, message: `Jalur "${existing.nama}" berhasil dihapus` });
  } catch (error) {
    console.error('Error deleting jalur:', error);
    return NextResponse.json({ error: 'Failed to delete jalur' }, { status: 500 });
  }
}
