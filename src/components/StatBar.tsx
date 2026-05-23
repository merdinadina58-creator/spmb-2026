'use client'

export default function StatBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500 tabular-nums">{count} ({total > 0 ? Math.round((count / total) * 100) : 0}%)</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
        />
      </div>
    </div>
  )
}
