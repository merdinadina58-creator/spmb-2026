'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

function parseValues(value: string): string[] {
  if (!value) return []
  return value.split(';').map(v => v.trim()).filter(Boolean)
}

export default function AlasanPenolakanDisplay({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  const reasons = parseValues(value)

  const handleCopy = () => {
    if (reasons.length === 0) return
    const copyText = reasons.map((s, i) => `${i + 1}. ${s}`).join('\n')
    navigator.clipboard.writeText(copyText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  if (reasons.length === 0) {
    return <span className="text-gray-400 italic text-xs">Tidak ada alasan</span>
  }

  return (
    <div className="flex items-start gap-1.5 min-w-0">
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        {reasons.map((reason, i) => (
          <div
            key={`reason-${i}`}
            className="text-xs text-red-700 bg-red-50 rounded px-1.5 py-0.5 border border-red-100 whitespace-normal break-words leading-tight"
          >
            <span className="text-red-400 font-medium">{i + 1}. </span>
            {reason}
          </div>
        ))}
      </div>
      <button
        className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded hover:bg-sky-50 transition-colors mt-0.5"
        onClick={handleCopy}
        title="Salin alasan penolakan untuk portal SPMB Sumut"
      >
        {copied ? (
          <Check className="w-3 h-3 text-emerald-500" />
        ) : (
          <Copy className="w-3 h-3 text-gray-400 hover:text-sky-500" />
        )}
      </button>
    </div>
  )
}
