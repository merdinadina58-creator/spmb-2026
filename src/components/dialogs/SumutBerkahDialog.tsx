'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Search,
  CheckCircle2,
  Loader2,
  Trash2,
  Eye,
  EyeOff,
  Globe,
  ClipboardPaste,
  Award,
  MapPinned,
  Check,
} from 'lucide-react'
import { getJalurSubFilter } from '@/lib/helpers'

interface SumutBerkahEntry {
  no: number
  nama: string
  nisn: string
  totalNilai: string
  jarak: string
  jarakMeter: number
}

interface SumutBerkahDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDataChanged: () => void
  toast: any
}

export default function SumutBerkahDialog({ open, onOpenChange, onDataChanged, toast }: SumutBerkahDialogProps) {
  // Sumut Berkah paste state
  const [sumutBerkahRawText, setSumutBerkahRawText] = useState('')
  const [sumutBerkahHtmlContent, setSumutBerkahHtmlContent] = useState('')
  const [sumutBerkahParsed, setSumutBerkahParsed] = useState<SumutBerkahEntry[]>([])
  const [sumutBerkahImporting, setSumutBerkahImporting] = useState(false)
  const [sumutBerkahResult, setSumutBerkahResult] = useState<{
    summary: { total: number; matchedUpdated: number; matchedUnchanged: number; notFound: number; created: number }
    results: Array<{ no: number; nama: string; nisn: string; action: string; totalNilai: string; jarak: string; message: string }>
  } | null>(null)
  const [sumutBerkahShowRaw, setSumutBerkahShowRaw] = useState(false)

  // Keep getJalurSubFilter available for potential future use within this component
  void getJalurSubFilter

  // ============================================================
  // CORE: Ultra-robust token classifier
  // Tries EVERY possible way to identify a token's type
  // ============================================================
  const classifyTokens = (tokens: string[]): { nama: string; nisn: string; totalNilai: string; jarak: string; jarakMeter: number } => {
    let nama = '', nisn = '', totalNilai = '', jarak = '', jarakMeter = 0

    // Helper: extract distance in meters
    const extractMeters = (v: string): number => {
      const m = v.match(/([\d]+[\.,]?[\d]*)\s*m/i)
      return m ? parseFloat(m[1].replace(',', '.')) : 0
    }

    // Helper: clean a name token - strip initials, NISN, extra spaces
    const cleanName = (v: string): string => {
      let c = v.replace(/\s+/g, ' ').trim()
      // Remove leading initials like "SA " "JT "
      c = c.replace(/^[A-Z]{2,4}\s+/, '')
      // Remove embedded NISN (8-12 digit numbers)
      c = c.replace(/\s+\d{8,12}\s*/g, ' ').trim()
      c = c.replace(/^\d{8,12}\s+/, '').trim()
      c = c.replace(/\s+\d{8,12}$/, '').trim()
      return c
    }

    // PASS 1: Classify obvious tokens first (strict matching)
    for (const raw of tokens) {
      const t = raw.replace(/\s+/g, ' ').trim()
      if (!t) continue

      // Skip 2-4 letter all-caps initials
      if (/^[A-Z]{2,4}$/.test(t)) continue

      // Distance: "529 m", "1.342 m", "1,342 m"
      if (/^[\d]+[\.,]?[\d]*\s*m$/i.test(t) && !jarak) {
        jarak = t; jarakMeter = extractMeters(t); continue
      }

      // NISN: 8-12 digit number starting with 0
      if (/^0\d{7,11}$/.test(t) && !nisn) { nisn = t; continue }

      // Decimal number (nilai): 97.971, 97,971
      if (/^[\d]+[\.,][\d]+$/.test(t) && !totalNilai) { totalNilai = t; continue }

      // NISN without leading 0: 8-12 digit number
      if (/^\d{8,12}$/.test(t) && !nisn && !totalNilai) { nisn = t; continue }
    }

    // PASS 2: Find the name — the LONGEST token containing alphabetic characters
    // This is the most reliable heuristic: names are always the longest text token
    const nameCandidates: Array<{ text: string; score: number }> = []
    for (const raw of tokens) {
      const t = raw.replace(/\s+/g, ' ').trim()
      if (!t) continue
      // Skip initials
      if (/^[A-Z]{2,4}$/.test(t)) continue
      // Skip pure numbers (NISN, nilai, etc.)
      if (/^\d+[\.,]?\d*$/.test(t)) continue
      // Skip distances
      if (/^[\d]+[\.,]?[\d]*\s*m$/i.test(t)) continue
      // Must contain at least one letter
      if (!/[a-zA-Z]/.test(t)) continue
      // Must not be just "m" or single chars
      if (t.length < 2) continue

      // Score: prefer longer tokens with more words and alphabetic chars
      const alphaCount = (t.match(/[a-zA-Z]/g) || []).length
      const wordCount = t.split(/\s+/).length
      const hasLower = /[a-z]/.test(t)
      const score = alphaCount * 2 + wordCount * 5 + (hasLower ? 10 : 0) + t.length

      nameCandidates.push({ text: t, score })
    }

    if (nameCandidates.length > 0 && !nama) {
      // Pick the highest-scoring candidate
      nameCandidates.sort((a, b) => b.score - a.score)
      nama = cleanName(nameCandidates[0].text)
    }

    // PASS 3: If still no name, try to find name within combined tokens
    // e.g., "SA" + "Samuel Alfatiasa Lahagu" might have been one token
    if (!nama) {
      for (const raw of tokens) {
        const t = raw.replace(/\s+/g, ' ').trim()
        if (!t) continue
        // Look for tokens that have initials embedded at start
        const match = t.match(/^[A-Z]{2,4}\s+(.+)$/)
        if (match && match[1].length >= 3 && /[a-zA-Z]/.test(match[1])) {
          nama = cleanName(match[1])
          break
        }
      }
    }

    return { nama, nisn, totalNilai, jarak, jarakMeter }
  }

  // ============================================================
  // Sumut Berkah: HTML paste parser
  // ============================================================
  const parseSumutBerkahHtml = (html: string): SumutBerkahEntry[] => {
    const results: SumutBerkahEntry[] = []
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')

      // Strategy A: Parse HTML <table>
      const tables = doc.querySelectorAll('table')
      for (const table of tables) {
        const rows = table.querySelectorAll('tr')
        if (rows.length < 2) continue

        // Detect header
        const firstRow = rows[0]
        const headerCells = firstRow.querySelectorAll('th, td')
        const colMap: Record<string, number> = {}
        headerCells.forEach((cell, idx) => {
          const text = cell.textContent?.trim().toLowerCase() || ''
          if (text === 'no' || text.includes('nomor') || text.includes('urut')) colMap['no'] = idx
          if ((text.includes('nama') && !text.includes('sekolah')) || text.includes('name')) colMap['nama'] = idx
          if (text.includes('nisn')) colMap['nisn'] = idx
          if (text.includes('total') || text.includes('nilai') || text.includes('score')) colMap['totalNilai'] = idx
          if (text.includes('jarak') || text.includes('distance')) colMap['jarak'] = idx
        })

        const startIdx = Object.keys(colMap).length > 0 ? 1 : 0

        for (let i = startIdx; i < rows.length; i++) {
          const cells = rows[i].querySelectorAll('td, th')
          if (cells.length < 2) continue

          const cellTexts: string[] = []
          cells.forEach(cell => cellTexts.push(cell.textContent?.trim() || ''))

          let no = 0
          // Extract rank number
          for (const ct of cellTexts) {
            if (/^\d{1,4}$/.test(ct) && parseInt(ct) <= 9999 && no === 0) {
              no = parseInt(ct)
              break
            }
          }

          const classified = classifyTokens(cellTexts)
          if (classified.nama || classified.nisn || classified.totalNilai || classified.jarak) {
            results.push({ no: no || results.length + 1, ...classified })
          }
        }
      }

      // Strategy B: If no table found, extract text from HTML body and use text parser
      if (results.length === 0) {
        const bodyText = doc.body?.textContent || ''
        if (bodyText.trim()) {
          return parseSumutBerkahText(bodyText)
        }
      }
    } catch (e) {
      console.error('HTML parse error:', e)
    }
    return results
  }

  // ============================================================
  // Sumut Berkah: Plain text parser
  // Uses multiple strategies and picks the best result
  // ============================================================
  const parseSumutBerkahText = (text: string, existingEntries?: SumutBerkahEntry[]): SumutBerkahEntry[] => {
    const results: SumutBerkahEntry[] = []
    const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    const allLines = normalized.split('\n').map(l => l.trim())
    const nonEmptyLines = allLines.filter(Boolean)

    // Skip header/UI noise lines
    const isNoise = (line: string): boolean => {
      const lower = line.toLowerCase()
      return lower.includes('nama siswa') || lower.includes('total nilai') ||
             lower.includes('jarak ke sekolah') || lower === 'no' || lower === 'nama' ||
             lower === 'total' || lower === 'jarak' || lower.includes('filter') ||
             lower.includes('cari') || lower.includes('search') || lower.includes('showing') ||
             lower.includes('halaman') || lower.includes('page') || lower.includes('data') ||
             lower.includes('perangkingan') || lower.includes('ranking') || lower.includes('prev') ||
             lower.includes('next') || lower.includes('previous') || lower.includes('pagination') ||
             lower.includes('»') || lower.includes('«') || /^\[\d+\]$/.test(line)
    }

    // ============================================================
    // STRATEGY 1: Sequential — group by rank numbers (1,2,3...)
    // Each rank number starts a new entry; all tokens until next rank belong to that entry
    // ============================================================
    const sequentialParse = (): SumutBerkahEntry[] => {
      const res: SumutBerkahEntry[] = []
      interface Pending { no: number; tokens: string[] }
      let pending: Pending | null = null

      const flush = () => {
        if (!pending || pending.tokens.length === 0) return
        const classified = classifyTokens(pending.tokens)
        if (classified.nama || classified.nisn || classified.totalNilai || classified.jarak) {
          res.push({ no: pending.no, ...classified })
        }
        pending = null
      }

      for (const line of nonEmptyLines) {
        if (isNoise(line)) continue

        // Split by tabs too
        const subTokens = line.split('\t').map(t => t.trim()).filter(Boolean)
        const first = subTokens[0]

        // Check if this starts a new entry (rank number 1-9999)
        if (/^\d{1,4}$/.test(first) && parseInt(first) <= 9999) {
          // But it's only a rank number if: it's a small number OR it appears to be sequential
          // Don't confuse NISN (10-digit) with rank (1-3 digit)
          const num = parseInt(first)
          if (num <= 500 || (num <= 9999 && subTokens.length > 1)) {
            flush()
            pending = { no: num, tokens: subTokens.slice(1) }
            continue
          }
        }

        // Add to current entry
        if (pending) {
          pending.tokens.push(...subTokens)
        } else {
          // Start a new entry without a rank number
          const useful = subTokens.some(t =>
            /[a-zA-Z]{2,}/.test(t) || /^\d{8,12}$/.test(t) || /^[\d]+[\.,][\d]+$/.test(t) || /^[\d]+[\.,]?[\d]*\s*m$/i.test(t)
          )
          if (useful) {
            pending = { no: res.length + 1, tokens: subTokens }
          }
        }
      }
      flush()
      return res
    }

    // ============================================================
    // STRATEGY 2: Tab-separated table
    // ============================================================
    const tabTableParse = (): SumutBerkahEntry[] => {
      const res: SumutBerkahEntry[] = []
      const tabLines = nonEmptyLines.filter(l => l.includes('\t'))
      if (tabLines.length < 2) return res

      let startIdx = 0
      const firstLine = tabLines[0].toLowerCase()
      if (firstLine.includes('nama') || firstLine.includes('total') || firstLine.includes('jarak') || firstLine.includes('no')) {
        startIdx = 1
      }

      // Detect header column mapping
      const colMap: Record<string, number> = {}
      if (startIdx === 1) {
        const headerCols = tabLines[0].split('\t').map(c => c.trim().toLowerCase())
        headerCols.forEach((col, idx) => {
          if (col.includes('nama') && !col.includes('sekolah')) colMap['nama'] = idx
          if (col.includes('nisn')) colMap['nisn'] = idx
          if (col.includes('total') || col.includes('nilai')) colMap['totalNilai'] = idx
          if (col.includes('jarak')) colMap['jarak'] = idx
          if (col === 'no' || col.includes('nomor')) colMap['no'] = idx
        })
      }

      for (let i = startIdx; i < tabLines.length; i++) {
        const cols = tabLines[i].split('\t').map(c => c.trim())
        if (cols.length < 2) continue

        let no = 0

        if (Object.keys(colMap).length >= 2) {
          // Use header map
          const getCol = (key: string) => colMap[key] !== undefined ? (cols[colMap[key]] || '').trim() : ''
          no = parseInt(getCol('no')) || 0
          const namaRaw = getCol('nama')
          const nisnRaw = getCol('nisn')
          const nilaiRaw = getCol('totalNilai')
          const jarakRaw = getCol('jarak')

          // Extract jarak meter
          let jarakMeter = 0
          const mMatch = jarakRaw.match(/([\d]+[\.,]?[\d]*)\s*m/i)
          if (mMatch) jarakMeter = parseFloat(mMatch[1].replace(',', '.'))

          // Clean nama (might have initials + NISN embedded)
          let namaClean = namaRaw
          namaClean = namaClean.replace(/^[A-Z]{2,4}\s+/, '')
          namaClean = namaClean.replace(/\s+\d{8,12}\s*/g, ' ').trim()

          if (namaClean || nisnRaw || nilaiRaw || jarakRaw) {
            res.push({ no: no || res.length + 1, nama: namaClean, nisn: nisnRaw, totalNilai: nilaiRaw, jarak: jarakRaw, jarakMeter })
          }
        } else {
          // Auto-detect
          no = parseInt(cols[0]) || 0
          const classified = classifyTokens(cols.slice(1))
          if (classified.nama || classified.nisn || classified.totalNilai || classified.jarak) {
            res.push({ no: no || res.length + 1, ...classified })
          }
        }
      }
      return res
    }

    // ============================================================
    // STRATEGY 3: NISN-anchored — find all NISNs and extract context
    // ============================================================
    const nisnAnchoredParse = (): SumutBerkahEntry[] => {
      const res: SumutBerkahEntry[] = []
      // Find all 10-digit numbers starting with 0 (NISN pattern)
      const nisnRegex = /(0\d{9,11})/g
      let match: RegExpExecArray | null
      const found: Array<{ nisn: string; idx: number }> = []
      while ((match = nisnRegex.exec(normalized)) !== null) {
        found.push({ nisn: match[1], idx: match.index })
      }

      for (const { nisn, idx } of found) {
        // Get surrounding text: 400 chars before, 200 chars after
        const start = Math.max(0, idx - 400)
        const end = Math.min(normalized.length, idx + nisn.length + 200)
        const context = normalized.substring(start, end)
        const tokens = context.split(/[\n\t]+/).map(t => t.trim()).filter(Boolean)

        let no = 0
        // Find rank number in tokens
        for (const t of tokens) {
          if (/^\d{1,3}$/.test(t) && parseInt(t) <= 500 && no === 0) {
            no = parseInt(t)
            break
          }
        }

        const classified = classifyTokens(tokens)
        // Make sure we use the found NISN, not some other number
        if (!classified.nisn) classified.nisn = nisn
        if (classified.nama || classified.nisn || classified.totalNilai || classified.jarak) {
          res.push({ no: no || res.length + 1, ...classified })
        }
      }
      return res
    }

    // ============================================================
    // STRATEGY 4: Fixed-field width — assumes consistent column widths
    // ============================================================
    const fixedFieldParse = (): SumutBerkahEntry[] => {
      const res: SumutBerkahEntry[] = []
      // For each non-empty line, try to extract fields by position
      for (const line of nonEmptyLines) {
        if (isNoise(line)) continue
        // Split by multiple spaces (2+), tabs, or any combination
        const fields = line.split(/[\t]+|\s{2,}/).map(f => f.trim()).filter(Boolean)
        if (fields.length < 3) continue

        let no = 0
        // First field might be rank number
        if (/^\d{1,4}$/.test(fields[0]) && parseInt(fields[0]) <= 9999) {
          no = parseInt(fields[0])
        }

        const classified = classifyTokens(fields.slice(no ? 1 : 0))
        if (classified.nama || classified.nisn || classified.totalNilai || classified.jarak) {
          res.push({ no: no || res.length + 1, ...classified })
        }
      }
      return res
    }

    // ============================================================
    // Run all strategies, pick the best
    // ============================================================
    const strategies = [
      { name: 'sequential', fn: sequentialParse },
      { name: 'tabTable', fn: tabTableParse },
      { name: 'fixedField', fn: fixedFieldParse },
      { name: 'nisnAnchored', fn: nisnAnchoredParse },
    ]

    let bestResult: SumutBerkahEntry[] = []
    let bestScore = -1

    for (const strategy of strategies) {
      try {
        const result = strategy.fn()
        // Score: count entries with name OR NISN
        const score = result.filter(r => r.nama || r.nisn).length
        if (score > bestScore) {
          bestScore = score
          bestResult = result
        }
      } catch {
        // Strategy failed
      }
    }

    // Deduplicate
    if (bestResult.length > 0) {
      const seen = new Set<string>()
      const deduped: SumutBerkahEntry[] = []
      for (const entry of bestResult) {
        const key = entry.nisn || entry.nama.toLowerCase()
        if (key && seen.has(key)) continue
        if (key) seen.add(key)
        deduped.push(entry)
      }
      deduped.forEach((r, i) => { if (!r.no || r.no === 0) r.no = i + 1 })

      // Merge with existing entries if provided
      if (existingEntries && existingEntries.length > 0) {
        const merged = [...existingEntries]
        const exNISNs = new Set(merged.map(e => e.nisn).filter(Boolean))
        const exNames = new Set(merged.map(e => e.nama.toLowerCase()).filter(Boolean))
        for (const entry of deduped) {
          if (entry.nisn && exNISNs.has(entry.nisn)) continue
          if (entry.nama && exNames.has(entry.nama.toLowerCase())) continue
          merged.push({ ...entry, no: merged.length + 1 })
        }
        return merged
      }
      return deduped
    }

    if (existingEntries && existingEntries.length > 0) return existingEntries
    return bestResult
  }

  // ============================================================
  // Sumut Berkah: Handle paste event — ALWAYS capture HTML
  // ============================================================
  const handleSumutBerkahPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    try {
      const htmlData = e.clipboardData.getData('text/html')
      if (htmlData && htmlData.trim()) {
        setSumutBerkahHtmlContent(htmlData)
      }
    } catch {
      // Ignore clipboard errors
    }
  }

  // ============================================================
  // Sumut Berkah: Smart parse using HTML + text
  // ============================================================
  const doSumutBerkahParse = () => {
    let parsed: SumutBerkahEntry[] = []

    // Try HTML first (most reliable for web table copy)
    if (sumutBerkahHtmlContent) {
      const htmlResult = parseSumutBerkahHtml(sumutBerkahHtmlContent)
      if (htmlResult.length > 0) {
        parsed = htmlResult
      }
    }

    // Fallback to plain text
    if (parsed.length === 0 && sumutBerkahRawText.trim()) {
      parsed = parseSumutBerkahText(sumutBerkahRawText, sumutBerkahParsed.length > 0 ? sumutBerkahParsed : undefined)
    }

    // If still no results but we have HTML content, try extracting text from HTML body
    if (parsed.length === 0 && sumutBerkahHtmlContent && !sumutBerkahRawText.trim()) {
      try {
        const parser = new DOMParser()
        const doc = parser.parseFromString(sumutBerkahHtmlContent, 'text/html')
        const bodyText = doc.body?.textContent || ''
        if (bodyText.trim()) {
          parsed = parseSumutBerkahText(bodyText, sumutBerkahParsed.length > 0 ? sumutBerkahParsed : undefined)
        }
      } catch {
        // Ignore
      }
    }

    // Merge with existing entries
    if (sumutBerkahParsed.length > 0 && parsed.length > 0) {
      const existingNISNs = new Set(sumutBerkahParsed.map(e => e.nisn).filter(Boolean))
      const existingNames = new Set(sumutBerkahParsed.map(e => e.nama.toLowerCase()).filter(Boolean))
      const newEntries = parsed.filter(p => {
        if (p.nisn && existingNISNs.has(p.nisn)) return false
        if (p.nama && existingNames.has(p.nama.toLowerCase())) return false
        return true
      })
      if (newEntries.length > 0) {
        const merged = [...sumutBerkahParsed, ...newEntries.map((e, i) => ({ ...e, no: sumutBerkahParsed.length + i + 1 }))]
        setSumutBerkahParsed(merged)
        toast({ title: 'Data Ditambahkan', description: `${newEntries.length} data baru ditambahkan (total: ${merged.length})` })
      } else {
        toast({ title: 'Tidak Ada Data Baru', description: 'Semua data sudah ada sebelumnya' })
      }
    } else if (parsed.length > 0) {
      setSumutBerkahParsed(parsed)
      toast({ title: 'Berhasil', description: `${parsed.length} siswa ditemukan` })
    } else {
      toast({ title: 'Gagal', description: 'Tidak dapat mengenali data. Coba: 1) Select all di tabel Sumut Berkah, 2) Ctrl+C, 3) Ctrl+V di sini. Jika masih gagal, klik "Lihat Raw Text" untuk debug.', variant: 'destructive' })
    }

    // Clear raw text (ready for next paste)
    setSumutBerkahRawText('')
    setSumutBerkahHtmlContent('')
  }

  const handleSumutBerkahImport = async () => {
    if (sumutBerkahParsed.length === 0) return
    setSumutBerkahImporting(true)
    try {
      const res = await fetch('/api/registrations/sumut-berkah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: sumutBerkahParsed }),
      })
      const data = await res.json()
      if (data.success) {
        setSumutBerkahResult(data)
        onDataChanged()
      } else {
        toast({ title: 'Gagal', description: data.error || 'Terjadi kesalahan', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Gagal', description: 'Terjadi kesalahan koneksi', variant: 'destructive' })
    } finally {
      setSumutBerkahImporting(false)
    }
  }

  const resetState = () => {
    setSumutBerkahRawText('')
    setSumutBerkahHtmlContent('')
    setSumutBerkahParsed([])
    setSumutBerkahResult(null)
    setSumutBerkahShowRaw(false)
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open)
      if (!open) resetState()
    }}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-sky-600" />
            Paste Data Sumut Berkah
            {sumutBerkahParsed.length > 0 && (
              <Badge className="bg-sky-100 text-sky-700 border-sky-200 ml-2">{sumutBerkahParsed.length} siswa</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Paste data dari website Sumut Berkah (tabel perangkingan). Bisa paste berkali-kali untuk menambah data. Sistem akan otomatis mengenali Nama, NISN, Total Nilai, dan Jarak Ke Sekolah.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!sumutBerkahResult ? (
            <>
              {/* Instructions */}
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-3">
                <div className="flex gap-2">
                  <Globe className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
                  <div className="text-sm text-sky-700">
                    <p className="font-medium">Cara penggunaan:</p>
                    <ol className="mt-1 list-decimal list-inside space-y-0.5">
                      <li>Buka website Sumut Berkah (perangkingan siswa)</li>
                      <li>Blok/select data tabel → Copy (Ctrl+C)</li>
                      <li>Paste (Ctrl+V) di kotak di bawah ini</li>
                      <li>Klik <strong>&quot;Parse Data&quot;</strong> → data akan muncul di tabel</li>
                      <li>Bisa paste lagi untuk menambah data dari halaman lain!</li>
                    </ol>
                    <p className="mt-2 text-xs text-sky-600">💡 Tips: Copy langsung dari tabel website (bukan dari view source). Sistem mendukung format HTML tabel dan teks biasa.</p>
                  </div>
                </div>
              </div>

              {/* Paste area */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    Data dari Sumut Berkah
                  </span>
                  <div className="flex items-center gap-2">
                    {sumutBerkahHtmlContent && (
                      <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                        ✓ HTML terdeteksi
                      </Badge>
                    )}
                    <span className="text-xs text-gray-400">{sumutBerkahRawText.length > 0 ? `${sumutBerkahRawText.split('\n').filter(l => l.trim()).length} baris` : ''}</span>
                  </div>
                </label>
                <Textarea
                  placeholder="Paste data dari Sumut Berkah di sini...&#10;&#10;Cukup Ctrl+V langsung dari tabel website Sumut Berkah.&#10;Sistem akan otomatis mengenali format data (HTML tabel / teks biasa).&#10;&#10;Bisa paste berkali-kali untuk menambah data!"
                  value={sumutBerkahRawText}
                  onChange={(e) => { setSumutBerkahRawText(e.target.value); setSumutBerkahHtmlContent('') }}
                  onPaste={handleSumutBerkahPaste}
                  rows={12}
                  className="font-mono text-xs min-h-[200px]"
                />
              </div>

              {/* Debug: Show raw text toggle */}
              {sumutBerkahRawText.trim() && (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-xs text-gray-500 h-7" onClick={() => setSumutBerkahShowRaw(!sumutBerkahShowRaw)}>
                    {sumutBerkahShowRaw ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                    {sumutBerkahShowRaw ? 'Sembunyikan Raw Text' : 'Lihat Raw Text (Debug)'}
                  </Button>
                </div>
              )}
              {sumutBerkahShowRaw && sumutBerkahRawText && (
                <div className="bg-gray-900 text-green-400 rounded-lg p-3 max-h-48 overflow-y-auto">
                  <pre className="text-xs font-mono whitespace-pre-wrap break-all">{sumutBerkahRawText.substring(0, 5000)}{sumutBerkahRawText.length > 5000 ? '\n... (dipotong)' : ''}</pre>
                </div>
              )}

              {/* Parsed data table */}
              {sumutBerkahParsed.length > 0 && (
                <>
                  <div className="bg-sky-50 border border-sky-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0" />
                        <div className="text-sm text-sky-700">
                          <p className="font-medium">{sumutBerkahParsed.length} siswa ditemukan.</p>
                          <p>Bisa paste lagi untuk menambah data, atau klik Import untuk menyimpan.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-amber-600 font-medium">{sumutBerkahParsed.filter(e => e.totalNilai).length} nilai</span>
                        <span className="text-sky-600 font-medium">{sumutBerkahParsed.filter(e => e.jarak).length} jarak</span>
                        <span className="text-emerald-600 font-medium">{sumutBerkahParsed.filter(e => e.nisn).length} NISN</span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="sticky top-0 bg-white">
                        <TableRow className="bg-sky-50/80">
                          <TableHead className="w-10 text-center font-semibold text-xs">No</TableHead>
                          <TableHead className="font-semibold text-xs">Nama Siswa</TableHead>
                          <TableHead className="font-semibold text-xs">NISN</TableHead>
                          <TableHead className="text-right font-semibold text-xs">Total Nilai</TableHead>
                          <TableHead className="text-right font-semibold text-xs">Jarak</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sumutBerkahParsed.map((entry, idx) => (
                          <TableRow key={idx} className="hover:bg-sky-50/30">
                            <TableCell className="text-center text-xs text-gray-500">{entry.no}</TableCell>
                            <TableCell className="text-sm font-medium">{entry.nama || <span className="text-gray-400 italic">Tidak terdeteksi</span>}</TableCell>
                            <TableCell className="text-xs font-mono text-gray-600">{entry.nisn || '-'}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline" className="font-bold text-amber-700 bg-amber-50 border-amber-200">
                                {entry.totalNilai || '-'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline" className="text-sky-700 bg-sky-50 border-sky-200">
                                {entry.jarak || '-'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      Total Nilai → <code className="bg-gray-100 px-1 rounded">totalNilai</code>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPinned className="w-3.5 h-3.5 text-sky-500" />
                      Jarak → <code className="bg-gray-100 px-1 rounded">jarakKeSekolah</code>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {/* Import Result */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <p className="font-semibold text-emerald-800">Import Selesai!</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white rounded-lg p-2.5 text-center border">
                    <p className="text-2xl font-bold text-emerald-600">{sumutBerkahResult.summary.matchedUpdated}</p>
                    <p className="text-xs text-gray-500">Diperbarui</p>
                  </div>
                  <div className="bg-white rounded-lg p-2.5 text-center border">
                    <p className="text-2xl font-bold text-gray-400">{sumutBerkahResult.summary.matchedUnchanged}</p>
                    <p className="text-xs text-gray-500">Sudah Sesuai</p>
                  </div>
                  <div className="bg-white rounded-lg p-2.5 text-center border">
                    <p className="text-2xl font-bold text-sky-600">{sumutBerkahResult.summary.created}</p>
                    <p className="text-xs text-gray-500">Data Baru</p>
                  </div>
                  <div className="bg-white rounded-lg p-2.5 text-center border">
                    <p className="text-2xl font-bold text-red-500">{sumutBerkahResult.summary.notFound}</p>
                    <p className="text-xs text-gray-500">Tidak Ditemukan</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-white">
                    <TableRow>
                      <TableHead className="w-8 text-center font-semibold text-xs">No</TableHead>
                      <TableHead className="font-semibold text-xs">Nama</TableHead>
                      <TableHead className="font-semibold text-xs">Nilai</TableHead>
                      <TableHead className="font-semibold text-xs">Jarak</TableHead>
                      <TableHead className="font-semibold text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sumutBerkahResult.results.map((r, idx) => (
                      <TableRow key={idx} className={
                        r.action === 'matched_updated' ? 'bg-emerald-50/40' :
                        r.action === 'created' ? 'bg-sky-50/40' :
                        r.action === 'not_found' ? 'bg-red-50/40' : ''
                      }>
                        <TableCell className="text-center text-xs text-gray-500">{r.no}</TableCell>
                        <TableCell className="text-sm">{r.nama}</TableCell>
                        <TableCell className="text-xs">{r.totalNilai || '-'}</TableCell>
                        <TableCell className="text-xs">{r.jarak || '-'}</TableCell>
                        <TableCell className="text-xs">{r.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => {
            if (sumutBerkahResult) {
              onOpenChange(false)
              resetState()
            } else {
              onOpenChange(false)
              resetState()
            }
          }}>
            {sumutBerkahResult ? 'Tutup' : 'Batal'}
          </Button>
          {!sumutBerkahResult && (
            <Button
              onClick={doSumutBerkahParse}
              disabled={!sumutBerkahRawText.trim() && !sumutBerkahHtmlContent}
              className="bg-sky-600 hover:bg-sky-700"
            >
              <Search className="w-4 h-4 mr-1" /> Parse Data
            </Button>
          )}
          {!sumutBerkahResult && sumutBerkahParsed.length > 0 && (
            <>
              <Button variant="outline" onClick={() => { setSumutBerkahParsed([]) }}>
                <Trash2 className="w-4 h-4 mr-1" /> Hapus Parsed
              </Button>
              <Button
                onClick={handleSumutBerkahImport}
                disabled={sumutBerkahImporting}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {sumutBerkahImporting ? (<><Loader2 className="w-4 h-4 animate-spin mr-1" /> Mengimpor...</>) : (<><Check className="w-4 h-4 mr-1" /> Import {sumutBerkahParsed.length} Data</>)}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
