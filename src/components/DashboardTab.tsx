'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Users,
  Clock,
  UserCheck,
  UserX,
  Filter,
  School,
  GraduationCap,
  ShieldCheck,
  ClipboardCheck,
  Sparkles,
} from 'lucide-react'
import type { DashboardStats, LembarVerifikasiConfig } from '@/lib/types'
import { StatBar } from '@/lib/utils-shared'

interface DashboardTabProps {
  stats: DashboardStats | null
  appName: string
  schoolName: string
  appSubtitle: string
  lembarVerifikasi: LembarVerifikasiConfig[]
  setActiveTab: (tab: string) => void
  setLembarTab: (tab: string) => void
  verificationPercent: number
  verifiedPercent: number
  rejectedPercent: number
  pendingPercent: number
  getPendingForLembar: (subJalurFilter: string) => number
  authUser: { id: string; username: string; namaLengkap: string; role: string } | null
}

export default function DashboardTab({
  stats,
  appName,
  schoolName,
  appSubtitle,
  lembarVerifikasi,
  setActiveTab,
  setLembarTab,
  verificationPercent,
  verifiedPercent,
  rejectedPercent,
  pendingPercent,
  getPendingForLembar,
}: DashboardTabProps) {
  return (
    <>
      {/* Hero Welcome Section */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative p-4 sm:p-6 text-white shadow-lg shadow-emerald-200/50">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-emerald-200" />
                <h2 className="text-lg sm:text-2xl font-bold tracking-tight">Selamat Datang di {appName}</h2>
              </div>
              {schoolName && <p className="text-emerald-100 text-sm font-semibold">{schoolName}</p>}
              {appSubtitle.split('\n').map((line, i) => (
                <p key={i} className="text-emerald-100/80 text-xs sm:text-sm">{line}</p>
              ))}
            </div>
            <div className="flex gap-2 sm:gap-3">
              <div className="bg-white/15 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-5 py-2 sm:py-2.5 text-center border border-white/20">
                <p className="text-2xl sm:text-3xl font-bold">{stats?.total || 0}</p>
                <p className="text-[10px] sm:text-xs text-emerald-100 font-medium">Pendaftar</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-5 py-2 sm:py-2.5 text-center border border-white/20">
                <p className="text-2xl sm:text-3xl font-bold">{verificationPercent}%</p>
                <p className="text-[10px] sm:text-xs text-emerald-100 font-medium">Terverifikasi</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 p-3 sm:p-4 shadow-lg shadow-slate-300/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-6 -mt-6" />
          <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full -ml-4 -mb-4" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">Total Pendaftar</p>
                <p className="text-xl sm:text-3xl font-bold text-white mt-0.5">{stats?.total || 0}</p>
              </div>
              <div className="p-2 sm:p-2.5 bg-white/10 rounded-lg sm:rounded-xl backdrop-blur-sm border border-white/10 group-hover:bg-white/20 transition-colors">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-slate-200" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-600 p-3 sm:p-4 shadow-lg shadow-amber-200/40 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-6 -mt-6" />
          <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/10 rounded-full -ml-4 -mb-4" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-amber-100 font-medium">Menunggu</p>
                <p className="text-xl sm:text-3xl font-bold text-white mt-0.5">{stats?.pending || 0}</p>
              </div>
              <div className="p-2 sm:p-2.5 bg-white/15 rounded-lg sm:rounded-xl backdrop-blur-sm border border-white/10 group-hover:bg-white/25 transition-colors">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 p-3 sm:p-4 shadow-lg shadow-emerald-200/40 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group cursor-pointer" onClick={() => setActiveTab('diterima')}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-6 -mt-6" />
          <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/10 rounded-full -ml-4 -mb-4" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-emerald-100 font-medium">Diterima</p>
                <p className="text-xl sm:text-3xl font-bold text-white mt-0.5">{stats?.verified || 0}</p>
              </div>
              <div className="p-2 sm:p-2.5 bg-white/15 rounded-lg sm:rounded-xl backdrop-blur-sm border border-white/10 group-hover:bg-white/25 transition-colors">
                <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-500 via-rose-500 to-pink-600 p-3 sm:p-4 shadow-lg shadow-red-200/40 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group cursor-pointer" onClick={() => setActiveTab('ditolak')}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-6 -mt-6" />
          <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/10 rounded-full -ml-4 -mb-4" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-red-100 font-medium">Ditolak</p>
                <p className="text-xl sm:text-3xl font-bold text-white mt-0.5">{stats?.rejected || 0}</p>
              </div>
              <div className="p-2 sm:p-2.5 bg-white/15 rounded-lg sm:rounded-xl backdrop-blur-sm border border-white/10 group-hover:bg-white/25 transition-colors">
                <UserX className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            Progres Verifikasi
          </CardTitle>
          <CardDescription>
            {verificationPercent}% pendaftar telah diproses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700 ease-out" style={{ width: `${verifiedPercent}%` }} />
            <div className="absolute inset-y-0 bg-gradient-to-r from-red-400 to-rose-500 rounded-full transition-all duration-700 ease-out" style={{ left: `${verifiedPercent}%`, width: `${rejectedPercent}%` }} />
          </div>
          <div className="flex justify-between mt-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm shadow-emerald-200" />
              <span className="text-gray-600 font-medium">Diterima: {stats?.verified || 0} ({verifiedPercent}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-400 to-rose-500 shadow-sm shadow-red-200" />
              <span className="text-gray-600 font-medium">Ditolak: {stats?.rejected || 0} ({rejectedPercent}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 shadow-sm shadow-amber-200" />
              <span className="text-gray-600 font-medium">Menunggu: {stats?.pending || 0} ({pendingPercent}%)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        {/* By Sub Jalur */}
        <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100">
                <Filter className="w-4 h-4 text-emerald-600" />
              </div>
              Berdasarkan Sub Jalur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(stats?.bySubJalur || []).map((item, idx) => (
                <StatBar key={`subjalur-${item.name}-${idx}`} label={item.name} count={item.count} total={stats?.total || 0} color="bg-gradient-to-r from-emerald-500 to-teal-500" />
              ))}
              {(stats?.bySubJalur || []).length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Belum ada data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* By Sekolah Asal */}
        <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-100">
                <School className="w-4 h-4 text-sky-600" />
              </div>
              Berdasarkan Sekolah Asal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {(stats?.bySekolahAsal || []).map((item, idx) => (
                <StatBar key={`sekolah-${item.name}-${idx}`} label={item.name} count={item.count} total={stats?.total || 0} color="bg-gradient-to-r from-sky-500 to-blue-500" />
              ))}
              {(stats?.bySekolahAsal || []).length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Belum ada data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* By Jurusan */}
        <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-violet-100">
                <GraduationCap className="w-4 h-4 text-violet-600" />
              </div>
              Berdasarkan Jurusan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(stats?.byJurusan || []).map((item, idx) => (
                <StatBar key={`jurusan-${item.name}-${idx}`} label={item.name} count={item.count} total={stats?.total || 0} color="bg-gradient-to-r from-violet-500 to-purple-500" />
              ))}
              {(stats?.byJurusan || []).length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Belum ada data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Verification Status */}
        <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-100">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
              </div>
              Ringkasan Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <StatBar label="Diterima (Terverifikasi)" count={stats?.verified || 0} total={stats?.total || 0} color="bg-gradient-to-r from-emerald-500 to-teal-500" />
              <StatBar label="Ditolak" count={stats?.rejected || 0} total={stats?.total || 0} color="bg-gradient-to-r from-red-400 to-rose-500" />
              <StatBar label="Menunggu Verifikasi" count={stats?.pending || 0} total={stats?.total || 0} color="bg-gradient-to-r from-amber-400 to-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lembar Verifikasi Quick Links */}
      <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-100">
              <ClipboardCheck className="w-4 h-4 text-amber-600" />
            </div>
            Lembar Verifikasi per Jalur
          </CardTitle>
          <CardDescription>Klik untuk membuka lembar verifikasi masing-masing jalur</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {lembarVerifikasi.map((lv) => {
              const LvIcon = lv.icon
              const pendingCount = getPendingForLembar(lv.subJalurFilter)
              const hasChildren = lv.children && lv.children.length > 0
              const totalCount = pendingCount
              const gradientClass = lv.cardGradient || 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900'
              const textClass = lv.cardText || 'text-white'
              const iconBgClass = lv.cardIconBg || 'bg-white/20'
              const badgeBgClass = lv.badgeBg || 'bg-white/25'
              const badgeTextClass = lv.badgeText || 'text-white'

              return (
                <div
                  key={lv.key}
                  className={`relative overflow-hidden rounded-xl sm:rounded-2xl cursor-pointer hover:scale-[1.03] hover:shadow-2xl transition-all duration-300 group ${gradientClass} shadow-lg`}
                  onClick={() => { setActiveTab('lembar-verifikasi'); setLembarTab(lv.key) }}
                >
                  {/* Decorative circles */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-500" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-4 -mb-4 group-hover:scale-125 transition-transform duration-500" />
                  
                  <div className="relative p-3 sm:p-4 text-center">
                    <div className={`inline-flex p-2 sm:p-2.5 rounded-xl ${iconBgClass} backdrop-blur-sm border border-white/10 mb-2 group-hover:scale-110 transition-transform duration-300`}>
                      <LvIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${textClass}`} />
                    </div>
                    <p className={`font-bold ${textClass} text-xs sm:text-sm leading-tight`}>{lv.label}</p>
                    <p className={`text-[10px] sm:text-xs ${textClass} opacity-70 mt-1`}>{totalCount} menunggu verifikasi</p>
                    <span className={`inline-block mt-1.5 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full ${badgeBgClass} ${badgeTextClass} backdrop-blur-sm border border-white/10 font-medium`}>
                      {lv.needsSkor ? '⚡ Jarak + Skor' : '📍 Jarak Saja'}
                    </span>
                    {hasChildren && (
                      <div className="flex flex-wrap justify-center gap-1 mt-2">
                        {lv.children!.map((child) => (
                          <span key={child.key} className={`text-[9px] px-1.5 py-0.5 rounded-full ${badgeBgClass} ${badgeTextClass} border border-white/10 opacity-80`}>
                            {child.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
