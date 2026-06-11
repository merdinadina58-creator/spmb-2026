import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser, unauthenticatedResponse } from '@/lib/auth';

interface SumutBerkahUpdate {
  nama: string;
  totalNilai: string;
  jarakKeSekolah: string;
}

function normalizeNama(nama: string): string {
  return nama
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')  // normalize multiple spaces
    .replace(/[.,]/g, '');  // remove dots and commas
}

export async function POST(request: NextRequest) {
  try {
    // Auth required
    const user = await getAuthUser(request);
    if (!user) {
      return unauthenticatedResponse();
    }

    const body = await request.json();
    const updates: SumutBerkahUpdate[] = body.updates;

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: 'Data updates wajib diisi' }, { status: 400 });
    }

    // Fetch all registrations once (only id and nama) for matching
    const allRegistrations = await db.registration.findMany({
      select: { id: true, nama: true },
    });

    // Build multiple lookup maps for flexible matching
    // 1. Exact normalized name
    const namaMap = new Map<string, { id: string; nama: string }>();
    // 2. Name without spaces (for variations like "AHMAD RIZKY" vs "AHMADRIZKY")
    const noSpaceMap = new Map<string, { id: string; nama: string }>();
    // 3. First word + last word for very flexible matching
    const firstLastMap = new Map<string, { id: string; nama: string }>();
    
    for (const reg of allRegistrations) {
      const normalized = normalizeNama(reg.nama || '');
      const noSpace = normalized.replace(/\s/g, '');
      const words = normalized.split(' ').filter(Boolean)
      const firstLast = words.length >= 2 ? `${words[0]}${words[words.length - 1]}` : ''
      
      if (normalized && !namaMap.has(normalized)) {
        namaMap.set(normalized, reg as { id: string; nama: string });
      }
      if (noSpace && !noSpaceMap.has(noSpace)) {
        noSpaceMap.set(noSpace, reg as { id: string; nama: string });
      }
      if (firstLast && !firstLastMap.has(firstLast)) {
        firstLastMap.set(firstLast, reg as { id: string; nama: string });
      }
    }

    let matched = 0;
    let updated = 0;
    const notFound: string[] = [];

    for (const item of updates) {
      if (!item.nama || !item.nama.trim()) {
        notFound.push(item.nama || '(kosong)');
        continue;
      }

      const namaTrimmed = item.nama.trim();
      const lookupKey = normalizeNama(namaTrimmed);
      const noSpaceKey = lookupKey.replace(/\s/g, '');
      
      // Try exact normalized match first
      let match = namaMap.get(lookupKey);
      
      // Try without spaces
      if (!match) {
        match = noSpaceMap.get(noSpaceKey);
      }

      // Try first+last word match
      if (!match) {
        const words = lookupKey.split(' ').filter(Boolean)
        if (words.length >= 2) {
          const firstLastKey = `${words[0]}${words[words.length - 1]}`
          match = firstLastMap.get(firstLastKey);
        }
      }
      
      // Try partial match: if the lookup name contains or is contained in a DB name
      if (!match) {
        for (const [dbKey, dbReg] of namaMap.entries()) {
          if (dbKey.includes(lookupKey) || lookupKey.includes(dbKey)) {
            match = dbReg;
            break;
          }
        }
      }

      // Try fuzzy match: each word of lookup name appears in the DB name
      if (!match) {
        const lookupWords = lookupKey.split(' ').filter(w => w.length > 2)
        if (lookupWords.length >= 2) {
          for (const [dbKey, dbReg] of namaMap.entries()) {
            const dbWords = dbKey.split(' ').filter(w => w.length > 2)
            const matchCount = lookupWords.filter(w => dbWords.some(dw => dw.includes(w) || w.includes(dw))).length
            if (matchCount >= Math.ceil(lookupWords.length * 0.6)) {
              match = dbReg;
              break;
            }
          }
        }
      }

      if (match) {
        matched++;
        const updateData: Record<string, unknown> = {};
        if (item.totalNilai && item.totalNilai.trim()) {
          updateData.totalNilai = item.totalNilai.trim();
        }
        if (item.jarakKeSekolah && item.jarakKeSekolah.trim()) {
          updateData.jarakKeSekolah = item.jarakKeSekolah.trim();
        }

        if (Object.keys(updateData).length > 0) {
          try {
            await db.registration.update({
              where: { id: match.id },
              data: updateData,
            });
            updated++;
          } catch (err) {
            console.error('Error updating registration:', err);
          }
        }
      } else {
        notFound.push(namaTrimmed);
      }
    }

    return NextResponse.json({
      success: true,
      matched,
      updated,
      notFound,
    });
  } catch (error) {
    console.error('Error processing Sumut Berkah data:', error);
    const message = error instanceof Error ? error.message : 'Failed to process data';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
