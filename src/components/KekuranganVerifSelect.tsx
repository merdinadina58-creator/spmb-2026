'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Search,
  AlertTriangle,
  Check,
  X as XIcon,
  Copy,
  ListPlus,
  Pencil,
} from 'lucide-react'
import { DEFAULT_KEKURANGAN_OPTIONS } from '@/lib/constants'

// VerifyKekuranganPicker: Inline multi-select for rejection dialog
// Sama persis dengan kolom Kekurangan Verifikasi — multi-select, search, add new, copy to portal, bank alasan
export function VerifyKekuranganPicker({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [search, setSearch] = useState('')
  const [newOption, setNewOption] = useState('')
  const [copied, setCopied] = useState(false)
  const [customOptions, setCustomOptions] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('spmb_custom_kekurangan')
        return saved ? JSON.parse(saved) : []
      } catch { return [] }
    }
    return []
  })

  const allOptions = [...new Set([...DEFAULT_KEKURANGAN_OPTIONS, ...customOptions])]
  const selectedItems: string[] = value ? value.split(' | ').filter(Boolean) : []

  const filtered = search
    ? allOptions.filter(opt => opt.toLowerCase().includes(search.toLowerCase()))
    : allOptions

  const toggleItem = (opt: string) => {
    let next: string[]
    if (selectedItems.includes(opt)) {
      next = selectedItems.filter(s => s !== opt)
    } else {
      next = [...selectedItems, opt]
    }
    onChange(next.join(' | '))
  }

  const addNewOption = () => {
    const trimmed = newOption.trim()
    if (!trimmed) return
    if (allOptions.includes(trimmed)) {
      if (!selectedItems.includes(trimmed)) toggleItem(trimmed)
      setNewOption('')
      return
    }
    const updated = [...customOptions, trimmed]
    setCustomOptions(updated)
    localStorage.setItem('spmb_custom_kekurangan', JSON.stringify(updated))
    onChange([...selectedItems, trimmed].join(' | '))
    setNewOption('')
  }

  const handleCopy = () => {
    if (!value) return
    // Copy with newlines for easy pasting into Portal SPMB Sumut
    const copyText = selectedItems.join('\n')
    navigator.clipboard.writeText(copyText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleCopyInline = () => {
    if (!value) return
    // Copy with " | " separator (same format as stored)
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-red-50 px-3 py-2 border-b flex items-center justify-between">
        <label className="text-sm font-medium text-red-700 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" /> Kekurangan Verifikasi
        </label>
        {selectedItems.length > 0 && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="text-xs flex items-center gap-1 px-2 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700 transition-colors font-medium"
              title="Copy alasan (baris baru) untuk paste ke Portal SPMB Sumut"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Tersalin!' : 'Copy ke Portal'}
            </button>
            <button
              onClick={handleCopyInline}
              className="text-xs flex items-center gap-1 px-1.5 py-1 rounded hover:bg-red-100 text-red-500 transition-colors"
              title="Copy alasan (dengan pemisah | )"
            >
              <Copy className="w-3 h-3" /> |
            </button>
            <button
              onClick={() => onChange('')}
              className="text-xs flex items-center gap-1 px-1.5 py-1 rounded hover:bg-red-100 text-red-600 transition-colors"
            >
              <XIcon className="w-3 h-3" /> Hapus
            </button>
          </div>
        )}
      </div>

      {/* Selected tags */}
      {selectedItems.length > 0 && (
        <div className="px-3 py-2 bg-white border-b">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[10px] text-red-600 font-medium">Alasan dipilih ({selectedItems.length}):</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedItems.map((item, idx) => (
              <span
                key={`tag-${idx}`}
                className="inline-flex items-center gap-0.5 text-[10px] bg-red-50 border border-red-200 rounded px-1.5 py-0.5 text-red-700"
              >
                {item.length > 50 ? item.substring(0, 48) + '…' : item}
                <button onClick={() => toggleItem(item)} className="ml-0.5 hover:text-red-900 shrink-0">
                  <XIcon className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center px-3 py-2 border-b gap-2 bg-gray-50">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          placeholder="Cari alasan kekurangan..."
          className="flex-1 text-sm outline-none bg-transparent"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors shrink-0"
            title="Hapus pencarian"
          >
            <XIcon className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      {/* Options list */}
      <div className="max-h-48 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Tidak ditemukan</p>
        ) : (
          filtered.map((opt, idx) => (
            <div
              key={`opt-${idx}`}
              className={`px-3 py-1.5 text-xs cursor-pointer hover:bg-sky-50 transition-colors flex items-start gap-2 ${
                selectedItems.includes(opt) ? 'bg-red-50' : ''
              }`}
              onClick={() => toggleItem(opt)}
            >
              <Checkbox checked={selectedItems.includes(opt)} className="mt-0.5 shrink-0" />
              <span className={selectedItems.includes(opt) ? 'font-medium text-red-700' : 'text-gray-700'}>
                {opt}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Add new option to bank */}
      <div className="border-t px-3 py-2 bg-gray-50">
        <div className="flex items-center gap-2">
          <input
            placeholder="Tambah alasan baru ke bank..."
            className="flex-1 text-xs outline-none bg-white border rounded px-2 py-1.5 focus:ring-1 focus:ring-sky-400"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addNewOption() } }}
          />
          <Button size="sm" variant="outline" className="h-7 px-2 text-xs shrink-0" onClick={addNewOption} disabled={!newOption.trim()}>
            <ListPlus className="w-3 h-3 mr-1" /> Tambah
          </Button>
        </div>
        <p className="text-[9px] text-gray-400 mt-1">Alasan baru akan ditambahkan ke bank dan tersedia untuk dipilih kembali</p>
      </div>
    </div>
  )
}

// Multi-select Kekurangan Verifikasi Dropdown with copy & add new
export function KekuranganVerifSelect({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [newOption, setNewOption] = useState('')
  const [copied, setCopied] = useState(false)
  const [customOptions, setCustomOptions] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('spmb_custom_kekurangan')
        return saved ? JSON.parse(saved) : []
      } catch { return [] }
    }
    return []
  })

  // All options = default + custom
  const allOptions = [...new Set([...DEFAULT_KEKURANGAN_OPTIONS, ...customOptions])]

  // Parse current value into array (separated by " | ")
  const selectedItems: string[] = value ? value.split(' | ').filter(Boolean) : []

  const filtered = search
    ? allOptions.filter(opt => opt.toLowerCase().includes(search.toLowerCase()))
    : allOptions

  const toggleItem = (opt: string) => {
    let next: string[]
    if (selectedItems.includes(opt)) {
      next = selectedItems.filter(s => s !== opt)
    } else {
      next = [...selectedItems, opt]
    }
    onChange(next.join(' | '))
  }

  const addNewOption = () => {
    const trimmed = newOption.trim()
    if (!trimmed) return
    if (allOptions.includes(trimmed)) {
      // Just select it if it already exists
      if (!selectedItems.includes(trimmed)) {
        toggleItem(trimmed)
      }
      setNewOption('')
      return
    }
    // Add to custom options and select it
    const updated = [...customOptions, trimmed]
    setCustomOptions(updated)
    localStorage.setItem('spmb_custom_kekurangan', JSON.stringify(updated))
    const nextSelected = [...selectedItems, trimmed]
    onChange(nextSelected.join(' | '))
    setNewOption('')
  }

  const handleCopy = () => {
    if (!value) return
    // Copy with newlines for easy pasting into Portal SPMB Sumut
    const copyText = selectedItems.join('\n')
    navigator.clipboard.writeText(copyText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleCopyInline = () => {
    if (!value) return
    // Copy with " | " separator (same format as stored)
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const clearAll = () => {
    onChange('')
    setOpen(false)
    setSearch('')
  }

  // Display in cell
  const cellDisplay = selectedItems.length === 0
    ? <span className="text-gray-400">-</span>
    : (
      <span className="text-gray-800">
        {selectedItems.length === 1
          ? (selectedItems[0].length > 22 ? selectedItems[0].substring(0, 20) + '…' : selectedItems[0])
          : <span className="inline-flex items-center gap-1">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-sky-100 text-sky-700">{selectedItems.length} alasan</Badge>
              <span className="text-[10px] text-gray-500 truncate max-w-[120px]">{selectedItems[0]}</span>
            </span>
        }
      </span>
    )

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setSearch(''); setNewOption('') } }}>
      <PopoverTrigger asChild>
        <span
          className="cursor-pointer hover:bg-sky-50 px-1 py-0.5 rounded inline-flex items-center gap-1 group min-h-[24px] text-xs"
          title={value || '-'}
        >
          {cellDisplay}
          <Pencil className="w-3 h-3 text-gray-300 group-hover:text-sky-500 shrink-0" />
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start" side="bottom">
        {/* Search */}
        <div className="flex items-center border-b px-3 py-2 gap-2">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            placeholder="Cari alasan kekurangan..."
            className="flex-1 text-sm outline-none bg-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors shrink-0"
              title="Hapus pencarian"
            >
              <XIcon className="w-2.5 h-2.5" />
            </button>
          )}
        </div>

        {/* Selected items preview */}
        {selectedItems.length > 0 && (
          <div className="px-3 py-2 bg-red-50 border-b">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-red-700">Alasan dipilih ({selectedItems.length}):</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopy}
                  className="text-xs flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-100 hover:bg-red-200 text-red-700 transition-colors font-medium"
                  title="Copy alasan (baris baru) untuk paste ke Portal SPMB Sumut"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Tersalin!' : 'Copy ke Portal'}
                </button>
                <button
                  onClick={handleCopyInline}
                  className="text-xs flex items-center gap-1 px-1 py-0.5 rounded hover:bg-red-100 text-red-500 transition-colors"
                  title="Copy alasan (dengan pemisah | )"
                >
                  <Copy className="w-3 h-3" /> |
                </button>
                <button
                  onClick={clearAll}
                  className="text-xs flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-red-100 text-red-600 transition-colors"
                  title="Hapus semua pilihan"
                >
                  <XIcon className="w-3 h-3" /> Hapus
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedItems.map((item, idx) => (
                <span
                  key={`vtag-${idx}`}
                  className="inline-flex items-center gap-0.5 text-[10px] bg-white border border-red-200 rounded px-1.5 py-0.5 text-red-700"
                >
                  {item.length > 40 ? item.substring(0, 38) + '…' : item}
                  <button
                    onClick={() => toggleItem(item)}
                    className="ml-0.5 hover:text-red-900 shrink-0"
                  >
                    <XIcon className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Options list with checkboxes */}
        <div className="max-h-56 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Tidak ditemukan</p>
          ) : (
            filtered.map((opt, idx) => (
              <div
                key={`vopt-${idx}`}
                className={`px-3 py-1.5 text-xs cursor-pointer hover:bg-sky-50 transition-colors flex items-start gap-2 ${
                  selectedItems.includes(opt) ? 'bg-red-50' : ''
                }`}
                onClick={() => toggleItem(opt)}
              >
                <Checkbox
                  checked={selectedItems.includes(opt)}
                  className="mt-0.5 shrink-0"
                />
                <span className={selectedItems.includes(opt) ? 'font-medium text-red-700' : 'text-gray-700'}>
                  {opt}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Add new option to bank */}
        <div className="border-t px-3 py-2">
          <div className="flex items-center gap-2">
            <input
              placeholder="Tambah alasan baru ke bank..."
              className="flex-1 text-xs outline-none bg-gray-50 border rounded px-2 py-1.5 focus:ring-1 focus:ring-sky-400 focus:bg-white"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addNewOption() } }}
            />
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs shrink-0"
              onClick={addNewOption}
              disabled={!newOption.trim()}
            >
              <ListPlus className="w-3 h-3 mr-1" /> Tambah
            </Button>
          </div>
          <p className="text-[9px] text-gray-400 mt-1">Alasan baru akan ditambahkan ke bank dan tersedia untuk dipilih kembali</p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
