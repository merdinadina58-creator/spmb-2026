import { getJalurSubFilter } from '@/lib/utils-shared'

/**
 * Parse portal SPMB text and extract registration data fields.
 * This is a pure utility function extracted from page.tsx.
 */
export function parsePortalText(
  text: string,
  jalurConfigs: Array<{ id: string; nama: string; persentase: number; urutan: number; aktif: boolean }>
): Record<string, string> {
  const result: Record<string, string> = {}
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  // Helper: find value after a label line
  const findValueAfter = (label: string, startFrom = 0): { value: string; index: number } | null => {
    for (let i = startFrom; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(label.toLowerCase())) {
        // Check if value is on same line after ":"
        const colonIdx = lines[i].indexOf(':')
        if (colonIdx !== -1 && lines[i].length > colonIdx + 1) {
          return { value: lines[i].substring(colonIdx + 1).trim(), index: i }
        }
        // Value is on the next line
        if (i + 1 < lines.length) {
          return { value: lines[i + 1].trim(), index: i + 1 }
        }
      }
    }
    return null
  }

  // Helper: find value for a label that's on its own line
  const findNextLine = (label: string): string => {
    const found = findValueAfter(label)
    return found?.value || ''
  }

  // No. Registrasi - from "No. Registrasi:" pattern
  const noRegMatch = text.match(/No\.\s*Registrasi\s*:\s*(\S+)/i)
  if (noRegMatch) result['noRegistrasi'] = noRegMatch[1]

  // ==================== JALUR AUTO-DETECTION ====================
  // This is the improved detection that handles many variations of how
  // the portal SPMB might display the jalur name.
  const activeJalurNames = jalurConfigs.filter(j => j.aktif).map(j => j.nama)

  // Build a comprehensive mapping: keyword/pattern → jalur config name
  // The target must be an active jalur name that exists in jalurConfigs
  const portalJalurMapping: Array<{ keywords: string[]; targetJalur: string }> = []

  // 1. Add all active jalur names as their own keywords
  for (const name of activeJalurNames) {
    portalJalurMapping.push({ keywords: [name], targetJalur: name })
  }

  // 2. Add common aliases that might appear in portal text
  // These map portal text variations to the actual jalur config name
  const aliasMap: Record<string, string> = {
    'Keluarga Tidak Mampu': 'Keluarga Tidak Mampu',
    'KTM': 'Keluarga Tidak Mampu',
    'Afirmasi': 'Keluarga Tidak Mampu',
    'Jalur Afirmasi': 'Keluarga Tidak Mampu',
    'Disabilitas': 'Penyandang Disabilitas',
    'Penyandang Disabilitas': 'Penyandang Disabilitas',
    'Terdampak Bencana Alam': 'Terdampak Bencana Alam',
    'Bencana Alam': 'Terdampak Bencana Alam',
    'Mutasi': 'Mutasi Orangtua/Wali',
    'Mutasi Orang tua/ Wali': 'Mutasi Orangtua/Wali',
    'Mutasi Orang Tua': 'Mutasi Orangtua/Wali',
    'Perpindahan Orang Tua': 'Mutasi Orangtua/Wali',
    'Perpindahan Tugas': 'Mutasi Orangtua/Wali',
    'Jalur Mutasi': 'Mutasi Orangtua/Wali',
    'Anak Guru': 'Anak Guru',
    'Domisili': 'Domisili',
    'Zonasi': 'Domisili',
    'Jalur Zonasi': 'Domisili',
    'Prestasi Akademik': 'Prestasi Akademik',
    'Akademik': 'Prestasi Akademik',
    'Prestasi Nilai Rapor': 'Prestasi Akademik',
    'Nilai Rapor': 'Prestasi Akademik',
    'Prestasi Nonakademik': 'Prestasi Nonakademik',
    'Prestasi Non Akademik': 'Prestasi Nonakademik',
    'Prestasi Non-Akademik': 'Prestasi Nonakademik',
    'Non Akademik': 'Prestasi Nonakademik',
    'Non-Akademik': 'Prestasi Nonakademik',
    'Nonakademik': 'Prestasi Nonakademik',
    // Legacy typo aliases
    'Presatasi Nonakademik': 'Prestasi Nonakademik',
    'Presatasi Non Akademik': 'Prestasi Nonakademik',
    'Presatasi Non-Akademik': 'Prestasi Nonakademik',
    'Jalur Prestasi': 'Prestasi Akademik',
  }

  // Normalize helper: lowercase + remove all non-alphanumeric for fuzzy matching
  const normalizeName = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

  for (const [alias, target] of Object.entries(aliasMap)) {
    // Try exact match first, then fuzzy (normalized) match
    const matchedTarget = activeJalurNames.includes(target)
      ? target
      : activeJalurNames.find(n => normalizeName(n) === normalizeName(target))
    if (matchedTarget) {
      portalJalurMapping.push({ keywords: [alias], targetJalur: matchedTarget })
    }
  }

  // Strategy 1: Look for "Jalur Pendaftaran" or "Jalur" label with value after it
  // This is the most reliable way - portal often shows "Jalur Pendaftaran: Zonasi"
  const jalurLabelPatterns = [
    /Jalur\s*Pendaftaran\s*:\s*(.+)/i,
    /Jalur\s*:\s*(.+)/i,
    /Jenis\s*Jalur\s*:\s*(.+)/i,
    /Sub\s*Jalur\s*:\s*(.+)/i,
  ]
  let detected = false
  for (const pattern of jalurLabelPatterns) {
    const match = text.match(pattern)
    if (match) {
      const value = match[1].trim()
      // Find the best matching jalur config for this value
      for (const mapping of portalJalurMapping) {
        for (const keyword of mapping.keywords) {
          if (value.toLowerCase() === keyword.toLowerCase() ||
              value.toLowerCase().includes(keyword.toLowerCase())) {
            result['subJalur'] = getJalurSubFilter(mapping.targetJalur)
            result['_detectedJalurNama'] = mapping.targetJalur
            result['_jalurAutoDetected'] = 'true'
            detected = true
            break
          }
        }
        if (detected) break
      }
      if (detected) break
    }
  }

  // Strategy 2: Look for standalone jalur name lines in the text
  // Portal text often has the jalur name on its own line
  if (!detected) {
    for (const mapping of portalJalurMapping) {
      for (const keyword of mapping.keywords) {
        for (const line of lines) {
          // Exact match (case-insensitive)
          if (line.toLowerCase() === keyword.toLowerCase()) {
            result['subJalur'] = getJalurSubFilter(mapping.targetJalur)
            result['_detectedJalurNama'] = mapping.targetJalur
            result['_jalurAutoDetected'] = 'true'
            detected = true
            break
          }
          // Match "Jalur X" or "Jalur: X" pattern
          if (line.toLowerCase().includes(keyword.toLowerCase()) &&
              (line.toLowerCase().startsWith('jalur') || line.toLowerCase().includes('jalur'))) {
            result['subJalur'] = getJalurSubFilter(mapping.targetJalur)
            result['_detectedJalurNama'] = mapping.targetJalur
            result['_jalurAutoDetected'] = 'true'
            detected = true
            break
          }
        }
        if (detected) break
      }
      if (detected) break
    }
  }

  // Strategy 3: Check for jalur name as a section header or in the full text
  // Broader search — look for keywords anywhere in the text (less precise)
  if (!detected) {
    // Priority order for broader detection (most specific first)
    const priorityKeywords = [
      'Keluarga Tidak Mampu', 'Penyandang Disabilitas', 'Terdampak Bencana Alam',
      'Mutasi Orangtua/Wali', 'Mutasi Orang tua/ Wali', 'Anak Guru',
      'Prestasi Akademik', 'Prestasi Nonakademik', 'Prestasi Non Akademik', 'Prestasi Non-Akademik',
      'Domisili', 'Zonasi', 'KTM', 'Disabilitas',
    ]
    for (const keyword of priorityKeywords) {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        // Find the matching target jalur
        const mapping = portalJalurMapping.find(m =>
          m.keywords.some(k => k.toLowerCase() === keyword.toLowerCase())
        )
        if (mapping) {
          result['subJalur'] = getJalurSubFilter(mapping.targetJalur)
          result['_detectedJalurNama'] = mapping.targetJalur
          result['_jalurAutoDetected'] = 'true'
          detected = true
          break
        }
      }
    }
  }

  // ==================== END JALUR DETECTION ====================

  // Nama - after "Nama Peserta"
  result['nama'] = findNextLine('Nama Peserta')
  // Fallback: first line might be the name
  if (!result['nama'] && lines.length > 0) {
    // Check if first line looks like a name (not starting with a number or known label)
    const firstLine = lines[0]
    if (firstLine && !firstLine.match(/^\d/) && !firstLine.toLowerCase().includes('no.') && !firstLine.toLowerCase().includes('registrasi')) {
      result['nama'] = firstLine
    }
  }

  // Tanggal Lahir
  result['tanggalLahir'] = findNextLine('Tanggal Lahir')

  // NIK
  result['nik'] = findNextLine('NIK')

  // NISN
  result['nisn'] = findNextLine('NISN')

  // Alamat
  result['alamat'] = findNextLine('Alamat')
  // But "Alamat Lengkap" should be separate - handle that
  const alamatLengkap = findNextLine('Alamat Lengkap')
  if (alamatLengkap) {
    result['alamatLengkap'] = alamatLengkap
  }

  // Phone numbers
  result['noTelpSiswa'] = findNextLine('No.Telp/Hp Siswa') || findNextLine('No. Telp/Hp Siswa') || findNextLine('NoTelp/Hp Siswa')
  result['noTelpOrangtua'] = findNextLine('No.Telp/Hp Orangtua') || findNextLine('No. Telp/Hp Orangtua') || findNextLine('NoTelp/Hp Orangtua/Wali')

  // Asal Sekolah
  result['namaSekolahAsal'] = findNextLine('Asal Sekolah')

  // Sekolah Pilihan
  result['namaSekolahPilihan'] = findNextLine('Sekolah Pilihan')

  // Waktu Pendaftaran
  result['waktuDaftar'] = findNextLine('Waktu Pendaftaran')

  // Lokasi dan Jarak
  result['lokasiJarak'] = findNextLine('Lokasi dan Jarak')

  // Latitude / Longitude
  result['latitude'] = findNextLine('Latitude')
  result['longitude'] = findNextLine('Longitude')

  // Nilai Rapor - parse subject grades
  const subjects = ['Pendidikan Agama', 'PPKn', 'Bahasa Indonesia', 'Matematika', 'Ilmu Pengetahuan Alam', 'Ilmu Pengetahuan Sosial', 'Bahasa Inggris']
  const grades: Record<string, string> = {}
  for (const subject of subjects) {
    // Find pattern: "Subject\n: value" or "Subject : value"
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] === subject || lines[i].startsWith(subject)) {
        // Check if value is on same line after ":"
        if (lines[i].includes(':')) {
          const val = lines[i].split(':').pop()?.trim()
          if (val && val.match(/\d+/)) {
            grades[subject] = val
            break
          }
        }
        // Check next line for ": value"
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1]
          const match = nextLine.match(/:\s*(\d+[\.,]?\d*)/)
          if (match) {
            grades[subject] = match[1]
            break
          }
        }
      }
    }
  }
  if (Object.keys(grades).length > 0) {
    result['nilaiRapor'] = JSON.stringify(grades)
  }

  // Nilai Rata-rata
  const nilaiRataRata = findNextLine('Nilai Rata-rata')
  if (nilaiRataRata) {
    // Could be "74.571" or ": 74.571"
    const match = nilaiRataRata.match(/([\d]+[\.,]?[\d]*)/)
    result['nilaiRataRata'] = match ? match[1] : nilaiRataRata
  }

  // Skor Jarak (from Ringkasan section)
  const skorJarak = findNextLine('Skor Jarak')
  if (skorJarak) result['skorJarak'] = skorJarak

  // Skor (from Ringkasan section) - need to find the LAST "Skor" line
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i] === 'Skor' || lines[i] === 'Skor') {
      if (i + 1 < lines.length) {
        const match = lines[i + 1].match(/([\d]+[\.,]?[\d]*)/)
        if (match) {
          result['skor'] = match[1]
          break
        }
      }
    }
  }

  // Skor Nilai Raport - from "Skor Nilai Raport" or derive from nilaiRataRata
  const skorNilaiRaport = findNextLine('Skor Nilai Raport')
  if (skorNilaiRaport) {
    const match = skorNilaiRaport.match(/([\d]+[\.,]?[\d]*)/)
    result['skorNilaiRaport'] = match ? match[1] : skorNilaiRaport
  } else if (result['nilaiRataRata']) {
    // If no explicit Skor Nilai Raport, use nilaiRataRata as fallback
    result['skorNilaiRaport'] = result['nilaiRataRata']
  }

  // Skor Lomba - from "Skor Lomba" label
  const skorLomba = findNextLine('Skor Lomba')
  if (skorLomba) {
    const match = skorLomba.match(/([\d]+[\.,]?[\d]*)/)
    result['skorLomba'] = match ? match[1] : skorLomba
  }

  // Nilai Rata Rata TKA - from "Nilai Rata Rata TKA" or "Nilai Rata-rata TKA" label
  const nilaiRataRataTKA = findNextLine('Nilai Rata Rata TKA') || findNextLine('Nilai Rata-rata TKA') || findNextLine('Rata-rata TKA') || findNextLine('Rata Rata TKA')
  if (nilaiRataRataTKA) {
    const match = nilaiRataRataTKA.match(/([\d]+[\.,]?[\d]*)/)
    result['nilaiRataRataTKA'] = match ? match[1] : nilaiRataRataTKA
  }

  // Skor Prestasi Akademik - separate parsing for Akademik
  const skorAkademikLabels = [
    'Skor Prestasi Akademik',
  ]
  for (const label of skorAkademikLabels) {
    for (let i = 0; i < lines.length; i++) {
      // Exact match: the line must start with the label (possibly followed by ":" and value)
      // This prevents "Skor Prestasi Akademik" from matching "Skor Prestasi Non Akademik"
      if (lines[i].toLowerCase().startsWith(label.toLowerCase())) {
        const colonIdx = lines[i].indexOf(':')
        if (colonIdx !== -1 && lines[i].length > colonIdx + 1) {
          const value = lines[i].substring(colonIdx + 1).trim()
          const match = value.match(/([\d]+[\.,]?[\d]*)/)
          if (match) {
            result['skorPrestasiAkademik'] = match[1]
            break
          }
        } else if (i + 1 < lines.length) {
          const match = lines[i + 1].trim().match(/([\d]+[\.,]?[\d]*)/)
          if (match) {
            result['skorPrestasiAkademik'] = match[1]
            break
          }
        }
      }
    }
    if (result['skorPrestasiAkademik']) break
  }

  // Skor Prestasi Non Akademik - separate parsing for Non Akademik
  const skorNonAkademikLabels = [
    'Skor Prestasi Non Akademik',
    'Skor Prestasi Non-Akademik',
    'Skor Prestasi Nonakademik',
    'Skor Prestasi NonAkademik',
  ]
  for (const label of skorNonAkademikLabels) {
    for (let i = 0; i < lines.length; i++) {
      // Exact match: the line must start with the label
      if (lines[i].toLowerCase().startsWith(label.toLowerCase())) {
        const colonIdx = lines[i].indexOf(':')
        if (colonIdx !== -1 && lines[i].length > colonIdx + 1) {
          const value = lines[i].substring(colonIdx + 1).trim()
          const match = value.match(/([\d]+[\.,]?[\d]*)/)
          if (match) {
            result['skorPrestasiNonAkademik'] = match[1]
            break
          }
        } else if (i + 1 < lines.length) {
          const match = lines[i + 1].trim().match(/([\d]+[\.,]?[\d]*)/)
          if (match) {
            result['skorPrestasiNonAkademik'] = match[1]
            break
          }
        }
      }
    }
    if (result['skorPrestasiNonAkademik']) break
  }

  // Dokumen - parse from "Dokumen" section
  const dokumenSection = findNextLine('Dokumen')
  if (dokumenSection) {
    result['dokumen'] = dokumenSection
  }

  // Sertifikat Prestasi - parse from "Dokumen Sertifikat Prestasi" section
  // Handles both "Dokumen Sertifikat Prestasi Akademik" and "Dokumen Sertifikat Prestasi Non-Akademik"
  const sertifikatPatterns = [
    /Dokumen\s+Sertifikat\s+Prestasi\s+Non[\s-]?Akademik[^:\n]*\n([\s\S]*?)(?=\n\n|\n[A-Z][a-z]|$)/i,
    /Dokumen\s+Sertifikat\s+Prestasi\s+Akademik[^:\n]*\n([\s\S]*?)(?=\n\n|\n[A-Z][a-z]|$)/i,
    /Dokumen\s+Sertifikat\s+Prestasi[^:\n]*\n([\s\S]*?)(?=\n\n|\n[A-Z][a-z]|$)/i,
  ]
  for (const pattern of sertifikatPatterns) {
    const match = text.match(pattern)
    if (match && match[1].trim()) {
      result['sertifikatPrestasi'] = match[1].trim().split('\n').map(l => l.trim()).filter(Boolean).join('; ')
      break
    }
  }

  // Status detection - try to detect from portal text
  const statusPatterns = [
    /Status\s*:\s*(DITERIMA|DITOLAK|ON PROGRESS|DITERIMA\s*\([^)]*\))/i,
    /Status\s+Pendaftaran\s*:\s*(DITERIMA|DITOLAK|ON PROGRESS)/i,
    /Status\s+Peserta\s*:\s*(DITERIMA|DITOLAK|ON PROGRESS)/i,
  ]
  let statusDetected = false
  for (const pattern of statusPatterns) {
    const match = text.match(pattern)
    if (match) {
      const statusVal = match[1].toUpperCase().trim()
      if (statusVal.startsWith('DITERIMA')) {
        result['status'] = 'DITERIMA'
      } else if (statusVal === 'DITOLAK') {
        result['status'] = 'DITOLAK'
      } else {
        result['status'] = 'ON PROGRESS'
      }
      statusDetected = true
      break
    }
  }
  // Also check for standalone status lines
  if (!statusDetected) {
    for (const line of lines) {
      if (line.toUpperCase() === 'DITERIMA') {
        result['status'] = 'DITERIMA'
        statusDetected = true
        break
      }
      if (line.toUpperCase() === 'DITOLAK') {
        result['status'] = 'DITOLAK'
        statusDetected = true
        break
      }
    }
  }
  if (!statusDetected) {
    result['status'] = 'ON PROGRESS'
  }

  // NPSN - we don't have this from portal, use empty
  result['npsnSekolahPilihan'] = ''
  result['npsnSekolahAsal'] = ''
  result['jurusan'] = ''

  return result
}
