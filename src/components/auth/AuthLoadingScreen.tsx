'use client'

import { ShieldCheck } from 'lucide-react'

export default function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900" suppressHydrationWarning>
      <div className="text-center" suppressHydrationWarning>
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30 animate-pulse">
          <ShieldCheck className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">SPMB 2026</h1>
        <p className="text-emerald-200 text-sm">Memuat sistem...</p>
      </div>
    </div>
  )
}
