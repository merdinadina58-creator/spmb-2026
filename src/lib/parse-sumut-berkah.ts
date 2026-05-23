/**
 * Parse Sumut Berkah pasted data (HTML table or plain text).
 * 
 * Handles multiple input formats:
 * 1. HTML table from browser copy (clipboard text/html)
 * 2. Tab-separated plain text from browser copy (clipboard text/plain)
 * 3. Manually typed/formatted text
 * 
 * Expected data columns: No, Nama Siswa, Total Nilai, Jarak Ke Sekolah
 */
export function parseSumutBerkahText(
  text: string
): Array<{ nama: string; totalNilai: string; jarakKeSekolah: string }> {
  const results: Array<{ nama: string; totalNilai: string; jarakKeSekolah: string }> = []
  const seenNames = new Set<string>()
  
  if (!text || !text.trim()) return results

  // ====== STRATEGY 1: HTML table parsing ======
  if (text.includes('<table') || text.includes('<tr') || text.includes('<td') || text.includes('<th')) {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(text, 'text/html')
      const rows = doc.querySelectorAll('tr')
      
      // First, try to detect header row to understand column layout
      let colMap: Record<string, number> | null = null
      
      for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].querySelectorAll('td, th')
        const cellTexts = Array.from(cells).map(c => (c.textContent || '').trim())
        
        // Check if this is a header row
        const joinedLower = cellTexts.join(' ').toLowerCase()
        if (joinedLower.includes('nama') || joinedLower.includes('total') || joinedLower.includes('jarak') || joinedLower.includes('nilai')) {
          colMap = {}
          cellTexts.forEach((txt, idx) => {
            const lower = txt.toLowerCase()
            if (lower.includes('no') && !lower.includes('nama') && !lower.includes('nilai')) colMap['no'] = idx
            else if (lower.includes('nama')) colMap['nama'] = idx
            else if (lower.includes('total') || lower.includes('nilai')) colMap['nilai'] = idx
            else if (lower.includes('jarak')) colMap['jarak'] = idx
          })
          break
        }
      }
      
      // If we found a header, use it to extract data from subsequent rows
      if (colMap && colMap['nama'] !== undefined) {
        let foundHeader = false
        for (let i = 0; i < rows.length; i++) {
          const cells = rows[i].querySelectorAll('td, th')
          const cellTexts = Array.from(cells).map(c => (c.textContent || '').replace(/\s+/g, ' ').trim())
          
          // Skip until after header
          const joinedLower = cellTexts.join(' ').toLowerCase()
          if (!foundHeader) {
            if (joinedLower.includes('nama') || joinedLower.includes('total') || joinedLower.includes('jarak')) {
              foundHeader = true
            }
            continue
          }
          
          // Skip empty rows
          if (cellTexts.every(c => !c)) continue
          
          const nama = cellTexts[colMap['nama']] || ''
          const totalNilai = colMap['nilai'] !== undefined ? (cellTexts[colMap['nilai']] || '') : ''
          const jarakKeSekolah = colMap['jarak'] !== undefined ? (cellTexts[colMap['jarak']] || '') : ''
          
          if (nama && nama.trim().length > 1 && !/^\d+([.,]\d+)?$/.test(nama.trim())) {
            const namaClean = nama.trim()
            const key = namaClean.toLowerCase()
            if (!seenNames.has(key)) {
              seenNames.add(key)
              results.push({
                nama: namaClean,
                totalNilai: totalNilai.replace(/[^\d.,]/g, '').trim(),
                jarakKeSekolah: jarakKeSekolah.trim()
              })
            }
          }
        }
        
        if (results.length > 0) return results
      }
      
      // Fallback: try to parse rows without header detection
      // Keep ALL cells (including empty ones) for proper alignment
      for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].querySelectorAll('td, th')
        const cellTexts = Array.from(cells).map(c => (c.textContent || '').replace(/\s+/g, ' ').trim())
        
        // Skip header rows
        const joinedLower = cellTexts.join(' ').toLowerCase()
        if (/^(no|nomor|urut|#)/.test(cellTexts[0] || '')) continue
        if (joinedLower.includes('nama siswa') || joinedLower.includes('total nilai') || joinedLower.includes('jarak ke sekolah')) continue
        
        // Must have at least 2 non-empty cells
        const nonEmpty = cellTexts.filter(c => c.length > 0)
        if (nonEmpty.length < 2) continue
        
        // Skip if first cell looks like a header
        if (/^(no|nama|total|jarak|nomor)/i.test(cellTexts[0] || '') && nonEmpty.length <= 4) continue
        
        const parsed = extractDataFromCellsPreserveEmpty(cellTexts)
        if (parsed && !seenNames.has(parsed.nama.toLowerCase())) {
          seenNames.add(parsed.nama.toLowerCase())
          results.push(parsed)
        }
      }
      
      if (results.length > 0) return results
    } catch (e) {
      console.error('HTML parse error:', e)
    }
  }

  // ====== STRATEGY 2: Plain text parsing ======
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  
  for (const line of lines) {
    // Skip header-like lines
    if (/^(no|nama|total|jarak|nomor|urut)/i.test(line)) continue
    if (/^(no|nama|total|jarak)/i.test(line.split(/[\t\s]+/)[0] || '')) continue
    
    // Try tab-separated first (most common when copying from web)
    let parts = line.split('\t').map(p => p.trim()).filter(p => p.length > 0)
    
    // If tab separation gives multiple parts, use it directly
    if (parts.length >= 3) {
      const parsed = extractDataFromCells(parts)
      if (parsed && !seenNames.has(parsed.nama.toLowerCase())) {
        seenNames.add(parsed.nama.toLowerCase())
        results.push(parsed)
      }
      continue
    }
    
    // If only 1-2 parts from tab split, try multiple-space split
    if (parts.length <= 2) {
      parts = line.split(/\s{2,}/).map(p => p.trim()).filter(p => p.length > 0)
    }
    
    if (parts.length >= 3) {
      const parsed = extractDataFromCells(parts)
      if (parsed && !seenNames.has(parsed.nama.toLowerCase())) {
        seenNames.add(parsed.nama.toLowerCase())
        results.push(parsed)
      }
      continue
    }
    
    // ====== STRATEGY 3: Regex-based extraction ======
    // Pattern: optional_number NAME VALUE DISTANCE
    // e.g. "1  AHMAD RIZKY  85.50  2.3 Km"
    // e.g. "AHMAD RIZKY  85.50  2.3 Km"
    
    // Try to find: a name (text with spaces), then a decimal number (total nilai), 
    // then another number optionally with Km/m unit (jarak)
    const regex1 = /^(?:\d+\s+)?(.+?)\s+([\d]+[.,]?[\d]*)\s+([\d]+[.,]?[\d]*\s*(?:Km|km|M|m|KM)?)\s*$/
    const match1 = line.match(regex1)
    if (match1) {
      const nama = match1[1].trim()
      const totalNilai = match1[2].replace(/[^\d.,]/g, '')
      const jarakKeSekolah = match1[3].trim()
      if (nama.length > 1 && !/^\d+([.,]\d+)?$/.test(nama) && !seenNames.has(nama.toLowerCase())) {
        seenNames.add(nama.toLowerCase())
        results.push({ nama, totalNilai, jarakKeSekolah })
        continue
      }
    }
    
    // Alternative: find two numbers from the end, everything before is the name
    // "1  AHMAD RIZKY PUTRA  85.50  2.3"
    const numberPattern = /([\d]+[.,]?[\d]*)\s*(Km|km|M|m|KM)?/g
    const allNumberMatches = [...line.matchAll(numberPattern)]
      .filter(m => {
        // Filter out the leading row number (must be a standalone integer at the start)
        const pos = m.index || 0
        if (pos === 0 && /^\d+$/.test(m[1]) && !m[2]) return false
        return true
      })
    
    if (allNumberMatches.length >= 2) {
      // Last number match = jarak, second-to-last = totalNilai
      const lastMatch = allNumberMatches[allNumberMatches.length - 1]
      const secondLastMatch = allNumberMatches[allNumberMatches.length - 2]
      
      const jarakKeSekolah = lastMatch[2] ? `${lastMatch[1]} ${lastMatch[2]}` : lastMatch[1]
      const totalNilai = secondLastMatch[1].replace(/[^\d.,]/g, '')
      
      // Name is everything before the second-to-last number position
      const nilaiStart = secondLastMatch.index || 0
      let namePart = line.substring(0, nilaiStart).trim()
      // Remove leading row number if present
      namePart = namePart.replace(/^\d+\s+/, '').trim()
      
      if (namePart.length > 1 && !/^\d+([.,]\d+)?$/.test(namePart) && !seenNames.has(namePart.toLowerCase())) {
        seenNames.add(namePart.toLowerCase())
        results.push({ nama: namePart, totalNilai, jarakKeSekolah })
        continue
      }
    }
    
    // Last resort: try to find at least a name and a value
    // "AHMAD RIZKY 85.50" (no jarak)
    const regex2 = /^(?:\d+\s+)?(.+?)\s+([\d]+[.,]?[\d]*)\s*$/
    const match2 = line.match(regex2)
    if (match2) {
      const nama = match2[1].trim()
      const totalNilai = match2[2].replace(/[^\d.,]/g, '')
      if (nama.length > 1 && !/^\d+([.,]\d+)?$/.test(nama) && !seenNames.has(nama.toLowerCase())) {
        seenNames.add(nama.toLowerCase())
        results.push({ nama, totalNilai, jarakKeSekolah: '' })
        continue
      }
    }
  }

  return results
}

/**
 * Extract nama, totalNilai, jarakKeSekolah from an array of cell texts.
 * This version PRESERVES empty cells for proper column alignment from HTML tables.
 */
function extractDataFromCellsPreserveEmpty(
  cellTexts: string[]
): { nama: string; totalNilai: string; jarakKeSekolah: string } | null {
  if (cellTexts.length < 2) return null
  
  // Find non-empty cells and their indices
  const nonEmpty: { idx: number; text: string }[] = []
  cellTexts.forEach((text, idx) => {
    if (text.trim()) nonEmpty.push({ idx, text: text.trim() })
  })
  
  if (nonEmpty.length < 2) return null
  
  const firstNonEmpty = nonEmpty[0]
  const isFirstCellNumber = /^\d+$/.test(firstNonEmpty.text)
  
  let nama = ''
  let totalNilai = ''
  let jarakKeSekolah = ''
  
  if (cellTexts.length >= 4) {
    // With 4+ columns, use index-based extraction
    if (isFirstCellNumber) {
      // Format: No | Nama | Total Nilai | Jarak [optional more columns]
      nama = cellTexts[1] || ''
      totalNilai = cellTexts[2] || ''
      jarakKeSekolah = cellTexts[3] || ''
    } else {
      // No row number: Nama | Total Nilai | Jarak [optional more columns]
      nama = cellTexts[0] || ''
      totalNilai = cellTexts[1] || ''
      jarakKeSekolah = cellTexts[2] || ''
    }
  } else if (cellTexts.length === 3) {
    if (isFirstCellNumber) {
      // No | Nama | Combined Nilai+Jarak
      nama = cellTexts[1] || ''
      const lastCell = cellTexts[2] || ''
      
      // Try to split combined value: "85.50 2.3 Km" or "85.50  2.3Km"
      const combined = lastCell.match(/^([\d.,]+)\s+([\d.,]+\s*(?:Km|km|M|m|KM)?)$/)
      if (combined) {
        totalNilai = combined[1]
        jarakKeSekolah = combined[2]
      } else {
        // Maybe it's No | Nama | Nilai (no jarak)
        totalNilai = lastCell
      }
    } else {
      // Nama | Nilai | Jarak
      nama = cellTexts[0] || ''
      totalNilai = cellTexts[1] || ''
      jarakKeSekolah = cellTexts[2] || ''
    }
  } else if (cellTexts.length === 2) {
    if (isFirstCellNumber) {
      // No | Name (unlikely to have useful data)
      nama = cellTexts[1] || ''
    } else {
      // Nama | Combined Nilai+Jarak
      nama = cellTexts[0] || ''
      const lastCell = cellTexts[1] || ''
      const combined = lastCell.match(/^([\d.,]+)\s+([\d.,]+\s*(?:Km|km|M|m|KM)?)$/)
      if (combined) {
        totalNilai = combined[1]
        jarakKeSekolah = combined[2]
      } else if (/^[\d.,]+$/.test(lastCell)) {
        totalNilai = lastCell
      }
    }
  }
  
  // Validate: nama should not be just a number, and should be at least 2 chars
  nama = nama.trim()
  if (!nama || nama.length <= 1 || /^\d+([.,]\d+)?$/.test(nama)) return null
  
  // Clean up values
  totalNilai = totalNilai.replace(/[^\d.,]/g, '').trim()
  jarakKeSekolah = jarakKeSekolah.trim()
  
  // Must have at least a name
  if (!nama) return null
  
  return { nama, totalNilai, jarakKeSekolah }
}

/**
 * Extract nama, totalNilai, jarakKeSekolah from an array of cell texts (non-empty only).
 * Handles various column layouts:
 * - [No, Nama, Total Nilai, Jarak] (4+ columns)
 * - [Nama, Total Nilai, Jarak] (3 columns, no row number)
 * - [No, Nama, Nilai+Jarak] (3 columns, last column combined)
 * - [Nama, Nilai+Jarak] (2 columns)
 */
function extractDataFromCells(
  cellTexts: string[]
): { nama: string; totalNilai: string; jarakKeSekolah: string } | null {
  if (cellTexts.length < 2) return null
  
  const firstCell = cellTexts[0]
  const isFirstCellNumber = /^\d+$/.test(firstCell)
  
  let nama = ''
  let totalNilai = ''
  let jarakKeSekolah = ''
  
  if (cellTexts.length >= 4) {
    // Could be: No | Nama | Nilai | Jarak
    // or: Nama | something | Nilai | Jarak
    if (isFirstCellNumber) {
      // Format: No | Nama | Total Nilai | Jarak [optional more columns]
      nama = cellTexts[1] || ''
      totalNilai = cellTexts[2] || ''
      jarakKeSekolah = cellTexts[3] || ''
    } else {
      // Format: Nama | something | Nilai | Jarak
      // Try to figure out which columns are which by checking for numeric patterns
      
      // Strategy: find the last two numeric values - they're likely totalNilai and jarak
      let nilaiIdx = -1
      let jarakIdx = -1
      
      for (let i = cellTexts.length - 1; i >= 0; i--) {
        const cell = cellTexts[i]
        if (jarakIdx === -1 && /^[\d.,]+\s*(Km|km|M|m|KM)?$/.test(cell)) {
          jarakIdx = i
        } else if (nilaiIdx === -1 && /^[\d.,]+$/.test(cell) && i !== jarakIdx) {
          nilaiIdx = i
        }
      }
      
      if (nilaiIdx > 0 && jarakIdx > 0) {
        // Name is everything before nilaiIdx
        nama = cellTexts.slice(0, nilaiIdx).join(' ')
        totalNilai = cellTexts[nilaiIdx]
        jarakKeSekolah = cellTexts[jarakIdx]
      } else if (jarakIdx > 0) {
        // Only found jarak, name is everything before
        nama = cellTexts.slice(0, jarakIdx).join(' ')
        jarakKeSekolah = cellTexts[jarakIdx]
      } else {
        // Can't determine, try first 3 cells
        nama = cellTexts[0] || ''
        totalNilai = cellTexts[1] || ''
        jarakKeSekolah = cellTexts[2] || ''
      }
    }
  } else if (cellTexts.length === 3) {
    if (isFirstCellNumber) {
      // No | Nama | Combined Nilai+Jarak
      nama = cellTexts[1] || ''
      const lastCell = cellTexts[2] || ''
      
      // Try to split combined value: "85.50 2.3 Km" or "85.50  2.3Km"
      const combined = lastCell.match(/^([\d.,]+)\s+([\d.,]+\s*(?:Km|km|M|m|KM)?)$/)
      if (combined) {
        totalNilai = combined[1]
        jarakKeSekolah = combined[2]
      } else {
        // Maybe it's No | Nama | Nilai (no jarak)
        totalNilai = lastCell
      }
    } else {
      // Nama | Nilai | Jarak
      nama = cellTexts[0] || ''
      totalNilai = cellTexts[1] || ''
      jarakKeSekolah = cellTexts[2] || ''
    }
  } else if (cellTexts.length === 2) {
    if (isFirstCellNumber) {
      // No | Name (unlikely to have useful data)
      nama = cellTexts[1] || ''
    } else {
      // Nama | Combined Nilai+Jarak
      nama = cellTexts[0] || ''
      const lastCell = cellTexts[1] || ''
      const combined = lastCell.match(/^([\d.,]+)\s+([\d.,]+\s*(?:Km|km|M|m|KM)?)$/)
      if (combined) {
        totalNilai = combined[1]
        jarakKeSekolah = combined[2]
      } else if (/^[\d.,]+$/.test(lastCell)) {
        totalNilai = lastCell
      }
    }
  }
  
  // Validate: nama should not be just a number, and should be at least 2 chars
  nama = nama.trim()
  if (!nama || nama.length <= 1 || /^\d+([.,]\d+)?$/.test(nama)) return null
  
  // Clean up values
  totalNilai = totalNilai.replace(/[^\d.,]/g, '').trim()
  jarakKeSekolah = jarakKeSekolah.trim()
  
  // Must have at least a name
  if (!nama) return null
  
  return { nama, totalNilai, jarakKeSekolah }
}
