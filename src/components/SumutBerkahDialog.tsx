'use client'

import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
  ClipboardPaste,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RotateCcw,
  Check,
} from 'lucide-react'
import { parseSumutBerkahText } from '@/lib/parse-sumut-berkah'

interface SumutBerkahPreviewItem {
  nama: string
  totalNilai: string
  jarakKeSekolah: string
}

interface SumutBerkahResult {
  matched: number
  updated: number
  notFound: string[]
}

interface SumutBerkahDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sumutBerkahText: string
  setSumutBerkahText: (text: string) => void
  sumutBerkahParsing: boolean
  setSumutBerkahParsing: (v: boolean) => void
  sumutBerkahPreview: SumutBerkahPreviewItem[] | null
  setSumutBerkahPreview: (preview: SumutBerkahPreviewItem[] | null) => void
  sumutBerkahResult: SumutBerkahResult | null
  setSumutBerkahResult: (result: SumutBerkahResult | null) => void
  onSave: () => void
  toast: (opts: { title: string; description: string; variant?: string }) => void
}

export default function SumutBerkahDialog({
  open,
  onOpenChange,
  sumutBerkahText,
  setSumutBerkahText,
  sumutBerkahParsing,
  setSumutBerkahParsing,
  sumutBerkahPreview,
  setSumutBerkahPreview,
  sumutBerkahResult,
  setSumutBerkahResult,
  onSave,
  toast,
}: SumutBerkahDialogProps) {
  // Track whether we have HTML paste data
  const [htmlPasteData, setHtmlPasteData] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Handle paste event to capture HTML data
  const handlePaste = (e: React.ClipboardEvent) => {
    const htmlData = e.clipboardData.getData('text/html')
    if (htmlData && (htmlData.includes('<table') || htmlData.includes('<tr') || htmlData.includes('<td'))) {
      e.preventDefault()
      setHtmlPasteData(htmlData)
      
      // Also set the plain text in the textarea for user to see
      const plainText = e.clipboardData.getData('text/plain')
      setSumutBerkahText(plainText || htmlData)
      
      // Auto-parse immediately with HTML data
      tryParse(htmlData)
    } else {
      // No HTML table data, let normal paste happen
      setHtmlPasteData(null)
    }
  }

  // Parse the data (from HTML or plain text)
  const tryParse = (textToParse?: string) => {
    const inputText = textToParse || htmlPasteData || sumutBerkahText
    if (!inputText.trim()) return
    
    setSumutBerkahParsing(true)
    try {
      const parsed = parseSumutBerkahText(inputText)
      if (parsed.length === 0) {
        toast({ title: 'Gagal', description: 'Tidak dapat mengenali data dari teks yang di-paste', variant: 'destructive' })
      } else {
        setSumutBerkahPreview(parsed)
        toast({ title: 'Berhasil', description: `${parsed.length} data berhasil diparse` })
      }
    } catch {
      toast({ title: 'Gagal', description: 'Terjadi kesalahan saat memparse data', variant: 'destructive' })
    } finally {
      setSumutBerkahParsing(false)
    }
  }

  // Manual parse button
  const handleParse = () => {
    tryParse()
  }

  const handleClose = (isOpen: boolean) => {
    onOpenChange(isOpen)
    if (!isOpen) {
      setSumutBerkahText('')
      setSumutBerkahPreview(null)
      setSumutBerkahResult(null)
      setHtmlPasteData(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardPaste className="w-5 h-5 text-teal-600" />
            Paste Data Sumut Berkah
          </DialogTitle>
          <DialogDescription>
            Copy data dari portal Sumut Berkah, lalu paste di sini. Sistem akan mengenali nama, total nilai, dan jarak ke sekolah.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!sumutBerkahResult ? (
            !sumutBerkahPreview ? (
              <>
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                  <div className="flex gap-2">
                    <ClipboardCheck className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                    <div className="text-sm text-teal-700">
                      <p className="font-medium">Cara penggunaan:</p>
                      <ol className="mt-1 list-decimal list-inside space-y-0.5">
                        <li>Buka portal Sumut Berkah</li>
                        <li>Select all (Ctrl+A) lalu Copy (Ctrl+C) data tabel</li>
                        <li>Paste (Ctrl+V) di kotak di bawah ini</li>
                        <li>Data akan otomatis diparse, atau klik &quot;Parse Data&quot;</li>
                        <li>Periksa preview lalu klik &quot;Update Data&quot;</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {htmlPasteData && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs text-emerald-700 font-medium">HTML tabel terdeteksi — data akan diparse otomatis</span>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Data dari Portal Sumut Berkah
                  </label>
                  <Textarea
                    ref={textareaRef}
                    placeholder="Paste data dari portal Sumut Berkah di sini...&#10;&#10;Contoh format yang dikenali:&#10;1   NAMA SISWA      85.50   2.3 Km&#10;2    NAMA SISWA2     78.25   3.1 Km&#10;&#10;Atau langsung copy-paste dari tabel portal (HTML)."
                    value={sumutBerkahText}
                    onChange={(e) => {
                      setSumutBerkahText(e.target.value)
                      setHtmlPasteData(null) // Reset HTML data if user types manually
                    }}
                    onPaste={handlePaste}
                    rows={12}
                    className="font-mono text-xs"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
                    <div className="text-sm text-teal-700">
                      <p className="font-medium">{sumutBerkahPreview.length} data berhasil diparse!</p>
                      <p>Periksa data di bawah sebelum mengupdate database.</p>
                    </div>
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto border rounded-lg">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <TableHead className="text-xs">No</TableHead>
                        <TableHead className="text-xs">Nama Siswa</TableHead>
                        <TableHead className="text-xs text-center">Total Nilai</TableHead>
                        <TableHead className="text-xs text-center">Jarak</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sumutBerkahPreview.map((item, idx) => (
                        <TableRow key={`sb-preview-${idx}`}>
                          <TableCell className="text-xs text-gray-500">{idx + 1}</TableCell>
                          <TableCell className="text-sm font-medium">{item.nama}</TableCell>
                          <TableCell className="text-sm text-center font-mono">{item.totalNilai}</TableCell>
                          <TableCell className="text-sm text-center">{item.jarakKeSekolah}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )
          ) : (
            <>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-emerald-800">Data Sumut Berkah Berhasil Diupdate!</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{sumutBerkahResult.matched}</p>
                    <p className="text-xs text-gray-500">Nama Cocok</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-teal-600">{sumutBerkahResult.updated}</p>
                    <p className="text-xs text-gray-500">Data Diupdate</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-amber-600">{sumutBerkahResult.notFound.length}</p>
                    <p className="text-xs text-gray-500">Tidak Ditemukan</p>
                  </div>
                </div>
              </div>

              {sumutBerkahResult.notFound.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <p className="text-sm font-medium text-amber-800">Nama tidak ditemukan di database:</p>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {sumutBerkahResult.notFound.map((nama, idx) => (
                      <p key={`nf-${idx}`} className="text-xs text-amber-700 font-mono">• {nama}</p>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          {sumutBerkahResult ? (
            <Button onClick={() => { handleClose(false) }} className="bg-emerald-600 hover:bg-emerald-700">
              <Check className="w-4 h-4" /> Selesai
            </Button>
          ) : !sumutBerkahPreview ? (
            <Button onClick={handleParse} disabled={!sumutBerkahText.trim() || sumutBerkahParsing} className="bg-teal-600 hover:bg-teal-700">
              {sumutBerkahParsing ? (<><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>) : (<><ClipboardCheck className="w-4 h-4" /> Parse Data</>)}
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => { setSumutBerkahPreview(null); setSumutBerkahText(''); setHtmlPasteData(null) }}>
                <RotateCcw className="w-4 h-4" /> Parse Ulang
              </Button>
              <Button onClick={onSave} disabled={sumutBerkahParsing} className="bg-teal-600 hover:bg-teal-700">
                {sumutBerkahParsing ? (<><Loader2 className="w-4 h-4 animate-spin" /> Mengupdate...</>) : (<><Check className="w-4 h-4" /> Update Data</>)}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
