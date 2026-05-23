const { PrismaClient } = require('@prisma/client');
const { readFileSync } = require('fs');

const db = new PrismaClient();

function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }
  }

  return rows;
}

async function main() {
  const csvText = readFileSync('/home/z/my-project/upload/registration-e14134af-9d57-4dcb-a3ca-29e87658cc2b.csv', 'utf-8');
  const rows = parseCSV(csvText);
  
  console.log(`Found ${rows.length} rows to import`);
  
  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    try {
      const noRegistrasi = row['No.Registrasi'];
      const npsnSekolahPilihan = row['NPSN Sekolah Pilihan'];

      if (!noRegistrasi || !npsnSekolahPilihan) {
        skipped++;
        continue;
      }

      const existing = await db.registration.findFirst({
        where: { noRegistrasi, npsnSekolahPilihan },
      });

      if (existing) {
        await db.registration.update({
          where: { id: existing.id },
          data: {
            nama: row['Nama'] || existing.nama,
            nisn: row['NISN'] || existing.nisn,
            subJalur: row['Sub Jalur'] || existing.subJalur,
            namaSekolahPilihan: row['Nama Sekolah Pilihan'] || existing.namaSekolahPilihan,
            jurusan: row['Jurusan'] || existing.jurusan,
            npsnSekolahAsal: row['NPSN Sekolah Asal'] || existing.npsnSekolahAsal,
            namaSekolahAsal: row['Nama Sekolah Asal'] || existing.namaSekolahAsal,
            status: row['Status'] || existing.status,
            waktuDaftar: row['Waktu Daftar'] || existing.waktuDaftar,
          },
        });
        imported++;
      } else {
        await db.registration.create({
          data: {
            noRegistrasi,
            nama: row['Nama'] || '',
            nisn: row['NISN'] || '',
            subJalur: row['Sub Jalur'] || '',
            npsnSekolahPilihan,
            namaSekolahPilihan: row['Nama Sekolah Pilihan'] || '',
            jurusan: row['Jurusan'] || '',
            npsnSekolahAsal: row['NPSN Sekolah Asal'] || '',
            namaSekolahAsal: row['Nama Sekolah Asal'] || '',
            status: row['Status'] || 'ON PROGRESS',
            waktuDaftar: row['Waktu Daftar'] || '',
            verificationStatus: 'PENDING',
          },
        });
        imported++;
      }
    } catch (err) {
      console.error(`Error importing row ${row['No.Registrasi']}:`, err.message);
      skipped++;
    }
  }

  console.log(`Import complete: ${imported} imported, ${skipped} skipped`);
  
  const total = await db.registration.count();
  console.log(`Total registrations in database: ${total}`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
