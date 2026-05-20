'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-600/20 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Terjadi Kesalahan</h2>
        <p className="text-emerald-200/60 text-sm mb-4">
          Aplikasi mengalami error. Coba refresh halaman.
        </p>
        {error?.message && (
          <p className="text-red-300/60 text-xs mb-4 font-mono bg-white/5 rounded px-3 py-2">
            {error.message}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => reset()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Coba Lagi
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
          >
            Refresh Halaman
          </Button>
        </div>
      </div>
    </div>
  )
}
