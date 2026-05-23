'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ShieldCheck,
  Upload,
  ClipboardPaste,
  Lock,
  Eye,
  GraduationCap,
  School,
  ClipboardCheck,
  Trophy,
  ThumbsUp,
  ThumbsDown,
  Settings,
  Users,
  ArrowLeftRight,
} from 'lucide-react'
import type { DashboardStats, LembarVerifikasiData } from '@/lib/types'

interface AppLayoutProps {
  appName: string
  schoolName: string
  appIcon: string
  appSubtitle: string
  authUser: { id: string; username: string; namaLengkap: string; role: string } | null
  activeTab: string
  setActiveTab: (tab: string) => void
  setLembarTab: (tab: string) => void
  stats: DashboardStats | null
  setPortalPasteOpen: (v: boolean) => void
  setImportDialogOpen: (v: boolean) => void
  setChangePasswordOpen: (v: boolean) => void
  handleLogout: () => void
  lembarVerifikasi: LembarVerifikasiData[]
  getPendingForLembar: (subJalurFilter: string) => number
  children: React.ReactNode
  dialogs?: React.ReactNode
  tahap?: number
}

export default function AppLayout(props: AppLayoutProps) {
  const {
    appName, schoolName, appIcon, appSubtitle, authUser, activeTab, setActiveTab,
    setLembarTab, stats,
    setPortalPasteOpen, setImportDialogOpen, setChangePasswordOpen,
    handleLogout, lembarVerifikasi, getPendingForLembar,
    children, dialogs,
    tahap,
  } = props

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50/30">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900 border-b border-emerald-400/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-18">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-600 text-white ring-2 ring-emerald-400/30 shadow-lg shadow-emerald-500/20 overflow-hidden">
                {appIcon ? (
                  <img src={appIcon} alt="Ikon" className="w-full h-full object-cover" />
                ) : (
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-white tracking-tight">{appName}</h1>
                {schoolName && <p className="text-[10px] sm:text-xs text-emerald-200 font-medium">{schoolName}</p>}
                {appSubtitle.split('\n').map((line, i) => <p key={i} className="text-[10px] sm:text-xs text-emerald-200/60 hidden xs:block">{line}</p>)}
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Tahap Indicator */}
              {tahap && (
                <Badge className={`h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm font-semibold gap-1.5 ${tahap === 1 ? 'bg-amber-500/90 text-white border-amber-400/50' : 'bg-emerald-500/90 text-white border-emerald-400/50'} shadow-sm`}>
                  <ArrowLeftRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  Tahap {tahap}
                </Badge>
              )}
              <Button onClick={() => setPortalPasteOpen(true)} variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20 h-8 sm:h-9 px-2 sm:px-3">
                <ClipboardPaste className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Paste Portal</span>
              </Button>
              {authUser?.role === 'admin' && (
                <Button onClick={() => setImportDialogOpen(true)} size="sm" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 h-8 sm:h-9 px-2 sm:px-3">
                  <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Import CSV</span>
                </Button>
              )}
              <div className="hidden sm:flex items-center gap-2 ml-1 pl-2 border-l border-white/20">
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-600/40 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{authUser?.namaLengkap?.charAt(0) || 'U'}</span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-xs font-medium text-white leading-tight">{authUser?.namaLengkap}</p>
                    <p className="text-[10px] text-emerald-200/60 leading-tight">{authUser?.role === 'admin' ? 'Administrator' : 'Verifikator'}</p>
                  </div>
                </div>
              </div>
              <Button onClick={() => setChangePasswordOpen(true)} variant="outline" size="sm" className="bg-white/5 hover:bg-white/20 text-white/70 hover:text-white border-white/10 h-8 sm:h-9 px-2" title="Ganti Password">
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline ml-1">Ganti Password</span>
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm" className="bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-300 border-white/10 hover:border-red-400/30 h-8 sm:h-9 px-2" title="Keluar">
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden lg:inline ml-1">Keluar</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-gray-200/60 bg-gradient-to-b from-white via-gray-50/30 to-white shrink-0 sticky top-[4.5rem] h-[calc(100vh-4.5rem)]">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-100/80">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-200/50 overflow-hidden">
                {appIcon ? (
                  <img src={appIcon} alt="Ikon" className="w-full h-full object-cover" />
                ) : (
                  <ShieldCheck className="w-5 h-5" />
                )}
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 tracking-tight">{appName}</h2>
                {schoolName && <p className="text-[10px] text-gray-500 font-medium leading-tight">{schoolName}</p>}
                <p className="text-[10px] text-gray-400 font-medium">Menu Navigasi</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
            {/* UMUM Section */}
            <div className="pt-1 pb-2 px-3"><span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">Umum</span></div>
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 relative group ${activeTab === 'dashboard' ? 'bg-emerald-50 text-emerald-700 font-medium shadow-sm shadow-emerald-100/50 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-5 before:bg-emerald-500 before:rounded-full before:-ml-3' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <Eye className={`w-4 h-4 shrink-0 ${activeTab === 'dashboard' ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              <span>Dashboard</span>
            </button>

            {/* VERIFIKASI Section */}
            <div className="pt-5 pb-2 px-3 flex items-center gap-2">
              <div className="h-px bg-gray-200/80 flex-1" />
              <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase shrink-0">Verifikasi</span>
              <div className="h-px bg-gray-200/80 flex-1" />
            </div>
            <button onClick={() => setActiveTab('lembar-verifikasi')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 relative group ${activeTab === 'lembar-verifikasi' ? 'bg-amber-50 text-amber-700 font-medium shadow-sm shadow-amber-100/50 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-5 before:bg-amber-500 before:rounded-full before:-ml-3' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <ClipboardCheck className={`w-4 h-4 shrink-0 ${activeTab === 'lembar-verifikasi' ? 'text-amber-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              <span className="flex-1 text-left">Lembar Verifikasi</span>
              {stats && stats.pending > 0 && <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0 min-w-[20px] h-5 flex items-center justify-center rounded-full shadow-sm">{stats.pending}</Badge>}
            </button>
            <button onClick={() => setActiveTab('data')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 relative group ${activeTab === 'data' ? 'bg-emerald-50 text-emerald-700 font-medium shadow-sm shadow-emerald-100/50 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-5 before:bg-emerald-500 before:rounded-full before:-ml-3' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <School className={`w-4 h-4 shrink-0 ${activeTab === 'data' ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              <span>Data Pendaftar</span>
            </button>

            {/* HASIL Section */}
            <div className="pt-5 pb-2 px-3 flex items-center gap-2">
              <div className="h-px bg-gray-200/80 flex-1" />
              <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase shrink-0">Hasil</span>
              <div className="h-px bg-gray-200/80 flex-1" />
            </div>
            {authUser?.role === 'admin' && (
              <button onClick={() => setActiveTab('ranking')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 relative group ${activeTab === 'ranking' ? 'bg-amber-50 text-amber-700 font-medium shadow-sm shadow-amber-100/50 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-5 before:bg-amber-500 before:rounded-full before:-ml-3' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <Trophy className={`w-4 h-4 shrink-0 ${activeTab === 'ranking' ? 'text-amber-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span>Perangkingan</span>
              </button>
            )}
            <button onClick={() => setActiveTab('diterima')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 relative group ${activeTab === 'diterima' ? 'bg-emerald-50 text-emerald-700 font-medium shadow-sm shadow-emerald-100/50 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-5 before:bg-emerald-500 before:rounded-full before:-ml-3' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <ThumbsUp className={`w-4 h-4 shrink-0 ${activeTab === 'diterima' ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              <span className="flex-1 text-left">Diterima</span>
              {stats && stats.verified > 0 && <Badge className="bg-emerald-600 text-white text-[10px] px-1.5 py-0 min-w-[20px] h-5 flex items-center justify-center rounded-full shadow-sm">{stats.verified}</Badge>}
            </button>
            <button onClick={() => setActiveTab('ditolak')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 relative group ${activeTab === 'ditolak' ? 'bg-red-50 text-red-700 font-medium shadow-sm shadow-red-100/50 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-5 before:bg-red-500 before:rounded-full before:-ml-3' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <ThumbsDown className={`w-4 h-4 shrink-0 ${activeTab === 'ditolak' ? 'text-red-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              <span className="flex-1 text-left">Ditolak</span>
              {stats && stats.rejected > 0 && <Badge className="bg-red-600 text-white text-[10px] px-1.5 py-0 min-w-[20px] h-5 flex items-center justify-center rounded-full shadow-sm">{stats.rejected}</Badge>}
            </button>

            {/* KEPUTUSAN Section */}
            <div className="pt-5 pb-2 px-3 flex items-center gap-2">
              <div className="h-px bg-gray-200/80 flex-1" />
              <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase shrink-0">Keputusan</span>
              <div className="h-px bg-gray-200/80 flex-1" />
            </div>
            <button onClick={() => setActiveTab('kelulusan')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 relative group ${activeTab === 'kelulusan' ? 'bg-emerald-50 text-emerald-700 font-medium shadow-sm shadow-emerald-100/50 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-5 before:bg-emerald-500 before:rounded-full before:-ml-3' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <GraduationCap className={`w-4 h-4 shrink-0 ${activeTab === 'kelulusan' ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              <span className="flex-1 text-left">Kelulusan</span>
              {stats && stats.lulus > 0 && <Badge className="bg-emerald-600 text-white text-[10px] px-1.5 py-0 min-w-[20px] h-5 flex items-center justify-center rounded-full shadow-sm">{stats.lulus}</Badge>}
            </button>
            <button onClick={() => setActiveTab('daftar-ulang')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 relative group ${activeTab === 'daftar-ulang' ? 'bg-sky-50 text-sky-700 font-medium shadow-sm shadow-sky-100/50 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-5 before:bg-sky-500 before:rounded-full before:-ml-3' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <ClipboardCheck className={`w-4 h-4 shrink-0 ${activeTab === 'daftar-ulang' ? 'text-sky-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              <span className="flex-1 text-left">Daftar Ulang</span>
              {stats && stats.daftarUlang > 0 && <Badge className="bg-sky-600 text-white text-[10px] px-1.5 py-0 min-w-[20px] h-5 flex items-center justify-center rounded-full shadow-sm">{stats.daftarUlang}</Badge>}
            </button>

            {/* SISTEM Section */}
            <div className="pt-5 pb-2 px-3 flex items-center gap-2">
              <div className="h-px bg-gray-200/80 flex-1" />
              <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase shrink-0">Sistem</span>
              <div className="h-px bg-gray-200/80 flex-1" />
            </div>
            {authUser?.role === 'admin' && (
              <button onClick={() => setActiveTab('pengaturan')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 relative group ${activeTab === 'pengaturan' ? 'bg-gray-100 text-gray-700 font-medium shadow-sm before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-5 before:bg-gray-500 before:rounded-full before:-ml-3' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <Settings className={`w-4 h-4 shrink-0 ${activeTab === 'pengaturan' ? 'text-gray-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span>Pengaturan</span>
              </button>
            )}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-gray-100/80">
            <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-gray-50/80">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
                <span className="text-xs font-bold text-white">{authUser?.namaLengkap?.charAt(0) || 'U'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">{authUser?.namaLengkap}</p>
                <p className="text-[10px] text-gray-400">{authUser?.role === 'admin' ? 'Administrator' : 'Verifikator'}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 min-w-0 px-3 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl mx-auto w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Mobile: scrollable horizontal pill tabs */}
            <div className="lg:hidden overflow-x-auto -mx-3 px-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 scrollbar-hide">
              <TabsList className="flex-nowrap bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-2xl p-1.5 shadow-sm shadow-gray-200/50 w-max sm:w-auto gap-0.5">
                <TabsTrigger value="dashboard" className="gap-1.5 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm transition-all duration-300 data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-emerald-200/50 whitespace-nowrap"><Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />Dashboard</TabsTrigger>
                <TabsTrigger value="lembar-verifikasi" className="gap-1.5 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm transition-all duration-300 data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-amber-200/50 whitespace-nowrap"><ClipboardCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" /><span className="hidden sm:inline">Lembar Verifikasi</span><span className="sm:hidden">Verifikasi</span>{stats && stats.pending > 0 && <Badge className="ml-0.5 sm:ml-1 bg-amber-500 text-white text-[10px] sm:text-xs px-1 sm:px-1.5 py-0 min-w-[16px] sm:min-w-[20px] h-4 sm:h-5 flex items-center justify-center rounded-full">{stats.pending}</Badge>}</TabsTrigger>
                <TabsTrigger value="data" className="gap-1.5 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm transition-all duration-300 data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-emerald-200/50 whitespace-nowrap"><School className="w-3.5 h-3.5 sm:w-4 sm:h-4" /><span className="hidden sm:inline">Data Pendaftar</span><span className="sm:hidden">Pendaftar</span></TabsTrigger>
                {authUser?.role === 'admin' && <TabsTrigger value="ranking" className="gap-1.5 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm transition-all duration-300 data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-amber-200/50 whitespace-nowrap"><Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" /><span className="hidden sm:inline">Perangkingan</span><span className="sm:hidden">Rangking</span></TabsTrigger>}
                <TabsTrigger value="diterima" className="gap-1.5 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm transition-all duration-300 data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-emerald-200/50 whitespace-nowrap"><ThumbsUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />Diterima{stats && stats.verified > 0 && <Badge className="ml-0.5 sm:ml-1 bg-emerald-600 text-white text-[10px] sm:text-xs px-1 sm:px-1.5 py-0 min-w-[16px] sm:min-w-[20px] h-4 sm:h-5 flex items-center justify-center rounded-full">{stats.verified}</Badge>}</TabsTrigger>
                <TabsTrigger value="ditolak" className="gap-1.5 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm transition-all duration-300 data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-red-200/50 whitespace-nowrap"><ThumbsDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />Ditolak{stats && stats.rejected > 0 && <Badge className="ml-0.5 sm:ml-1 bg-red-600 text-white text-[10px] sm:text-xs px-1 sm:px-1.5 py-0 min-w-[16px] sm:min-w-[20px] h-4 sm:h-5 flex items-center justify-center rounded-full">{stats.rejected}</Badge>}</TabsTrigger>
                <TabsTrigger value="kelulusan" className="gap-1.5 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm transition-all duration-300 data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-emerald-200/50 whitespace-nowrap"><GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" /><span className="hidden sm:inline">Kelulusan</span><span className="sm:hidden">Lulus</span>{stats && stats.lulus > 0 && <Badge className="ml-0.5 sm:ml-1 bg-emerald-600 text-white text-[10px] sm:text-xs px-1 sm:px-1.5 py-0 min-w-[16px] sm:min-w-[20px] h-4 sm:h-5 flex items-center justify-center rounded-full">{stats.lulus}</Badge>}</TabsTrigger>
                <TabsTrigger value="daftar-ulang" className="gap-1.5 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm transition-all duration-300 data-[state=active]:bg-sky-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-sky-200/50 whitespace-nowrap"><ClipboardCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" /><span className="hidden sm:inline">Daftar Ulang</span><span className="sm:hidden">Dft.Ulang</span>{stats && stats.daftarUlang > 0 && <Badge className="ml-0.5 sm:ml-1 bg-sky-600 text-white text-[10px] sm:text-xs px-1 sm:px-1.5 py-0 min-w-[16px] sm:min-w-[20px] h-4 sm:h-5 flex items-center justify-center rounded-full">{stats.daftarUlang}</Badge>}</TabsTrigger>
                {authUser?.role === 'admin' && <TabsTrigger value="pengaturan" className="gap-1.5 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm transition-all duration-300 data-[state=active]:bg-gray-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-gray-200/50 whitespace-nowrap"><Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" /><span className="hidden sm:inline">Pengaturan</span><span className="sm:hidden">Setting</span></TabsTrigger>}
              </TabsList>
            </div>

            {children}
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900 mt-auto">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              <p className="text-xs sm:text-sm text-emerald-100 font-medium">&copy; 2026 {appName}{schoolName ? ` — ${schoolName}` : ''}</p>
            </div>
            {appSubtitle.split('\n').map((line, i) => <p key={i} className="text-[10px] sm:text-xs text-emerald-200/60">{line}</p>)}
          </div>
        </div>
      </footer>

      {/* Dialogs */}
      {dialogs}
    </div>
  )
}
