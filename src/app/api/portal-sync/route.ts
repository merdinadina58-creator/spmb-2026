import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { execSync } from 'child_process';
import path from 'path';

interface PortalStudent {
  noRegistrasi: string;
  nama: string;
  nisn: string;
  subJalur: string;
  npsnSekolahPilihan: string;
  namaSekolahPilihan: string;
  jurusan: string;
  npsnSekolahAsal: string;
  namaSekolahAsal: string;
  status: string;
  waktuDaftar: string;
  nik?: string;
  tanggalLahir?: string;
  alamat?: string;
  nilaiRataRata?: string;
  skorJarak?: string;
  skorNilaiRaport?: string;
  skor?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, pages, status } = body as {
      email: string;
      password: string;
      pages?: number;
      status?: string;
    };

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    // Run the portal sync script
    const scriptPath = path.join(process.cwd(), 'scripts', 'portal-sync.ts');
    const pagesArg = pages ? `--pages ${pages}` : '';
    const statusArg = status ? `--status ${status}` : '--status accepted';
    
    let output: string;
    try {
      output = execSync(
        `bun run "${scriptPath}" --email "${email}" --password "${password}" ${pagesArg} ${statusArg}`,
        {
          timeout: 120000,
          encoding: 'utf-8',
          cwd: process.cwd(),
          stdio: ['pipe', 'pipe', 'pipe'],
        }
      ).trim();
    } catch (e: any) {
      const stderr = e.stderr?.toString() || '';
      const stdout = e.stdout?.toString() || '';
      output = stdout || stderr;
    }

    // Parse the script output - it outputs JSON lines
    const lines = output.split('\n').filter(l => l.trim());
    let fetchedData: any[] = [];
    let syncLog: string[] = [];
    let loginFailed = false;

    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.step === 'error' && parsed.error) {
          loginFailed = true;
          return NextResponse.json({ error: parsed.message }, { status: 401 });
        }
        if (parsed.step === 'done') {
          fetchedData = parsed.data || [];
        }
        syncLog.push(`${parsed.step}: ${parsed.message || ''}`);
      } catch {
        // Not JSON, skip
      }
    }

    if (fetchedData.length === 0) {
      return NextResponse.json({
        success: true,
        created: 0,
        updated: 0,
        unchanged: 0,
        total: 0,
        message: 'Tidak ada data ditemukan di portal',
        log: syncLog,
      });
    }

    // Process and save data to database
    let created = 0;
    let updated = 0;
    let unchanged = 0;

    for (const row of fetchedData) {
      // Map portal table headers to our schema
      const student = mapPortalRow(row);
      if (!student) continue;

      // Same dedup logic as portal-paste
      let existing = null;

      // Try by NISN
      if (student.nisn && student.nisn.trim()) {
        existing = await db.registration.findFirst({
          where: { nisn: student.nisn.trim() },
        });
      }

      // Fallback by noRegistrasi
      if (!existing && student.noRegistrasi && student.noRegistrasi.trim()) {
        existing = await db.registration.findFirst({
          where: { noRegistrasi: student.noRegistrasi.trim() },
        });
      }

      // Fallback by nama + subJalur
      if (!existing && student.nama && student.subJalur) {
        existing = await db.registration.findFirst({
          where: { nama: student.nama.trim(), subJalur: student.subJalur.trim() },
        });
      }

      if (existing) {
        // Update - only fill empty fields
        const updateData: Record<string, string> = {};
        const mergeField = (key: string, newVal: string | undefined, existingVal: string | null | undefined) => {
          const trimmed = newVal?.trim();
          if (trimmed && (!existingVal || existingVal.trim() === '' || existingVal === '0')) {
            updateData[key] = trimmed;
          }
        };

        mergeField('noRegistrasi', student.noRegistrasi, existing.noRegistrasi);
        mergeField('nisn', student.nisn, existing.nisn);
        mergeField('nama', student.nama, existing.nama);
        mergeField('subJalur', student.subJalur, existing.subJalur);
        mergeField('npsnSekolahPilihan', student.npsnSekolahPilihan, existing.npsnSekolahPilihan);
        mergeField('namaSekolahPilihan', student.namaSekolahPilihan, existing.namaSekolahPilihan);
        mergeField('jurusan', student.jurusan, existing.jurusan);
        mergeField('npsnSekolahAsal', student.npsnSekolahAsal, existing.npsnSekolahAsal);
        mergeField('namaSekolahAsal', student.namaSekolahAsal, existing.namaSekolahAsal);
        mergeField('status', student.status, existing.status);
        mergeField('waktuDaftar', student.waktuDaftar, existing.waktuDaftar);
        mergeField('nik', student.nik, existing.nik);
        mergeField('tanggalLahir', student.tanggalLahir, existing.tanggalLahir);
        mergeField('alamat', student.alamat, existing.alamat);
        mergeField('nilaiRataRata', student.nilaiRataRata, existing.nilaiRataRata);
        mergeField('skorJarak', student.skorJarak, existing.skorJarak);
        mergeField('skorNilaiRaport', student.skorNilaiRaport, existing.skorNilaiRaport);
        mergeField('skor', student.skor, existing.skor);

        if (Object.keys(updateData).length > 0) {
          await db.registration.update({
            where: { id: existing.id },
            data: updateData,
          });
          updated++;
        } else {
          unchanged++;
        }
      } else {
        // Create new record
        const npsn = student.npsnSekolahPilihan || '0';
        await db.registration.create({
          data: {
            noRegistrasi: student.noRegistrasi || '',
            nama: student.nama || '',
            nisn: student.nisn || '',
            subJalur: student.subJalur || '',
            npsnSekolahPilihan: npsn,
            namaSekolahPilihan: student.namaSekolahPilihan || '',
            jurusan: student.jurusan || '',
            npsnSekolahAsal: student.npsnSekolahAsal || '',
            namaSekolahAsal: student.namaSekolahAsal || '',
            status: student.status || 'ON PROGRESS',
            waktuDaftar: student.waktuDaftar || '',
            verificationStatus: 'PENDING',
            nik: student.nik || null,
            tanggalLahir: student.tanggalLahir || null,
            alamat: student.alamat || null,
            nilaiRataRata: student.nilaiRataRata || null,
            skorJarak: student.skorJarak || null,
            skorNilaiRaport: student.skorNilaiRaport || null,
            skor: student.skor || null,
          },
        });
        created++;
      }
    }

    return NextResponse.json({
      success: true,
      created,
      updated,
      unchanged,
      total: fetchedData.length,
      message: `Sinkronisasi selesai: ${created} data baru, ${updated} diperbarui, ${unchanged} tidak berubah dari total ${fetchedData.length} data`,
      log: syncLog,
    });
  } catch (error) {
    console.error('Error syncing portal:', error);
    const message = error instanceof Error ? error.message : 'Failed to sync portal data';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Maps a row from the portal HTML table to our student schema.
 * The portal table has dynamic headers, so we try to match by common keywords.
 */
function mapPortalRow(row: Record<string, string>): PortalStudent | null {
  if (!row || Object.keys(row).length === 0) return null;

  const getValue = (keywords: string[]): string => {
    for (const [key, val] of Object.entries(row)) {
      const lowerKey = key.toLowerCase();
      for (const kw of keywords) {
        if (lowerKey.includes(kw.toLowerCase())) {
          return val || '';
        }
      }
    }
    return '';
  };

  const noRegistrasi = getValue(['no reg', 'noreg', 'no_reg', 'registrasi', 'no. reg']);
  const nama = getValue(['nama', 'name']);
  const nisn = getValue(['nisn']);
  const subJalur = getValue(['jalur', 'sub jalur', 'sub_jalur', 'path']);
  const npsnSekolahPilihan = getValue(['npsn pilihan', 'npsn sekolah pilihan', 'npsn tujuan']);
  const namaSekolahPilihan = getValue(['sekolah pilihan', 'sekolah tujuan', 'asal tujuan']);
  const jurusan = getValue(['jurusan', 'major', 'kompetensi']);
  const npsnSekolahAsal = getValue(['npsn asal', 'npsn sekolah asal']);
  const namaSekolahAsal = getValue(['sekolah asal', 'asal sekolah']);
  const status = getValue(['status', 'state']);
  const waktuDaftar = getValue(['waktu', 'tanggal daftar', 'date', 'tgl']);
  const nik = getValue(['nik']);
  const tanggalLahir = getValue(['tanggal lahir', 'tgl lahir', 'birth']);
  const alamat = getValue(['alamat', 'address']);
  const nilaiRataRata = getValue(['nilai rata', 'rata-rata', 'average']);
  const skorJarak = getValue(['skor jarak', 'jarak']);
  const skorNilaiRaport = getValue(['skor nilai', 'rapor', 'raport']);
  const skor = getValue(['skor total', 'total skor', 'skor']);

  if (!nama && !nisn && !noRegistrasi) return null;

  return {
    noRegistrasi,
    nama,
    nisn,
    subJalur,
    npsnSekolahPilihan,
    namaSekolahPilihan,
    jurusan,
    npsnSekolahAsal,
    namaSekolahAsal,
    status,
    waktuDaftar,
    nik,
    tanggalLahir,
    alamat,
    nilaiRataRata,
    skorJarak,
    skorNilaiRaport,
    skor,
  };
}
