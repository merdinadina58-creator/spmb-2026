'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
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
  PanelLeftClose,
  PanelLeftOpen,
  ChevronsLeft,
  ChevronsRight,
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

// Sidebar nav item component for cleaner code
function SidebarNavItem({
  tab,
  activeTab,
  setActiveTab,
  icon: Icon,
  label,
  badge,
  colorScheme = 'emerald',
  collapsed,
}: {
  tab: string
  activeTab: string
  setActiveTab: (tab: string) => void
  icon: React.ComponentType<{ className?: string }>
  label: string
  badge?: React.ReactNode
  colorScheme?: 'emerald' | 'amber' | 'red' | 'sky' | 'gray'
  collapsed: boolean
}) {
  const colorClasses = {
    emerald: {
      active: 'bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100/50',
      activeIcon: 'text-emerald-600',
      activeBar: 'before:bg-emerald-500',
    },
    amber: {
      active: 'bg-amber-50 text-amber-700 shadow-sm shadow-amber-100/50',
      activeIcon: 'text-amber-600',
      activeBar: 'before:bg-amber-500',
    },
    red: {
      active: 'bg-red-50 text-red-700 shadow-sm shadow-red-100/50',
      activeIcon: 'text-red-600',
      activeBar: 'before:bg-red-500',
    },
    sky: {
      active: 'bg-sky-50 text-sky-700 shadow-sm shadow-sky-100/50',
      activeIcon: 'text-sky-600',
      activeBar: 'before:bg-sky-500',
    },
    gray: {
      active: 'bg-gray-100 text-gray-700 shadow-sm',
      activeIcon: 'text-gray-600',
      activeBar: 'before:bg-gray-500',
    },
  }

  const isActive = activeTab === tab
  const colors = colorClasses[colorScheme]

  const button = (
    <button
      onClick={() => setActiveTab(tab)}
      className={`w-full flex items-center gap-3 rounded-lg text-sm transition-all duration-200 relative group
        ${collapsed ? 'px-2 py-2.5 justify-center' : 'px-3 py-2.5'}
        ${isActive
          ? `${colors.active} font-medium before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-5 before:rounded-full ${colors.activeBar} ${collapsed ? 'before:-ml-2' : 'before:-ml-3'}`
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${isActive ? colors.activeIcon : 'text-gray-400 group-hover:text-gray-600'}`} />
      {!collapsed && (
        <>
          <span className="flex-1 text-left">{label}</span>
          {badge}
        </>
      )}
    </button>
  )

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8} className="flex items-center gap-2">
          {label}
          {badge}
        </TooltipContent>
      </Tooltip>
    )
  }

  return button
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

  // Sidebar collapse state - persisted in localStorage
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('spmb-sidebar-collapsed')
      return saved === 'true'
    }
    return false
  })

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => {
      const next = !prev
      localStorage.setItem('spmb-sidebar-collapsed', String(next))
      return next
    })
  }, [])

  return (
    <TooltipProvider delayDuration={0}>
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
          <aside
            className={`hidden lg:flex flex-col border-r border-gray-200/60 bg-gradient-to-b from-white via-gray-50/30 to-white shrink-0 sticky top-[4.5rem] h-[calc(100vh-4.5rem)] transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-16' : 'w-64'}`}
          >
            {/* Sidebar Header */}
            <div className={`border-b border-gray-100/80 transition-all duration-300 ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
              {sidebarCollapsed ? (
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-200/50 overflow-hidden">
                    {appIcon ? (
                      <img src={appIcon} alt="Ikon" className="w-full h-full object-cover" />
                    ) : (
                      <ShieldCheck className="w-5 h-5" />
                    )}
                  </div>
                </div>
              ) : (
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
              )}
            </div>

            {/* Navigation */}
            <nav className={`flex-1 overflow-y-auto py-3 space-y-0.5 transition-all duration-300 ${sidebarCollapsed ? 'px-2' : 'px-3'}`}>
              {/* UMUM Section */}
              {!sidebarCollapsed ? (
                <div className="pt-1 pb-2 px-3"><span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">Umum</span></div>
              ) : (
                <div className="pt-1 pb-2 flex justify-center">
                  <div className="w-5 h-px bg-gray-200/80" />
                </div>
              )}
              <SidebarNavItem
                tab="dashboard"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                icon={Eye}
                label="Dashboard"
                colorScheme="emerald"
                collapsed={sidebarCollapsed}
              />

              {/* VERIFIKASI Section */}
              {!sidebarCollapsed ? (
                <div className="pt-5 pb-2 px-3 flex items-center gap-2">
                  <div className="h-px bg-gray-200/80 flex-1" />
                  <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase shrink-0">Verifikasi</span>
                  <div className="h-px bg-gray-200/80 flex-1" />
                </div>
              ) : (
                <div className="pt-5 pb-2 flex justify-center">
                  <div className="w-5 h-px bg-gray-200/80" />
                </div>
              )}
              <SidebarNavItem
                tab="lembar-verifikasi"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                icon={ClipboardCheck}
                label="Lembar Verifikasi"
                colorScheme="amber"
                badge={stats && stats.pending > 0 ? <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0 min-w-[20px] h-5 flex items-center justify-center rounded-full shadow-sm">{stats.pending}</Badge> : undefined}
                collapsed={sidebarCollapsed}
              />
              <SidebarNavItem
                tab="data"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                icon={School}
                label="Data Pendaftar"
                colorScheme="emerald"
                collapsed={sidebarCollapsed}
              />

              {/* HASIL Section */}
              {!sidebarCollapsed ? (
                <div className="pt-5 pb-2 px-3 flex items-center gap-2">
                  <div className="h-px bg-gray-200/80 flex-1" />
                  <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase shrink-0">Hasil</span>
                  <div className="h-px bg-gray-200/80 flex-1" />
                </div>
              ) : (
                <div className="pt-5 pb-2 flex justify-center">
                  <div className="w-5 h-px bg-gray-200/80" />
                </div>
              )}
              {authUser?.role === 'admin' && (
                <SidebarNavItem
                  tab="ranking"
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  icon={Trophy}
                  label="Perangkingan"
                  colorScheme="amber"
                  collapsed={sidebarCollapsed}
                />
              )}
              <SidebarNavItem
                tab="diterima"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                icon={ThumbsUp}
                label="Diterima"
                colorScheme="emerald"
                badge={stats && stats.verified > 0 ? <Badge className="bg-emerald-600 text-white text-[10px] px-1.5 py-0 min-w-[20px] h-5 flex items-center justify-center rounded-full shadow-sm">{stats.verified}</Badge> : undefined}
                collapsed={sidebarCollapsed}
              />
              <SidebarNavItem
                tab="ditolak"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                icon={ThumbsDown}
                label="Ditolak"
                colorScheme="red"
                badge={stats && stats.rejected > 0 ? <Badge className="bg-red-600 text-white text-[10px] px-1.5 py-0 min-w-[20px] h-5 flex items-center justify-center rounded-full shadow-sm">{stats.rejected}</Badge> : undefined}
                collapsed={sidebarCollapsed}
              />

              {/* KEPUTUSAN Section */}
              {!sidebarCollapsed ? (
                <div className="pt-5 pb-2 px-3 flex items-center gap-2">
                  <div className="h-px bg-gray-200/80 flex-1" />
                  <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase shrink-0">Keputusan</span>
                  <div className="h-px bg-gray-200/80 flex-1" />
                </div>
              ) : (
                <div className="pt-5 pb-2 flex justify-center">
                  <div className="w-5 h-px bg-gray-200/80" />
                </div>
              )}
              <SidebarNavItem
                tab="kelulusan"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                icon={GraduationCap}
                label="Kelulusan"
                colorScheme="emerald"
                badge={stats && stats.lulus > 0 ? <Badge className="bg-emerald-600 text-white text-[10px] px-1.5 py-0 min-w-[20px] h-5 flex items-center justify-center rounded-full shadow-sm">{stats.lulus}</Badge> : undefined}
                collapsed={sidebarCollapsed}
              />
              <SidebarNavItem
                tab="daftar-ulang"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                icon={ClipboardCheck}
                label="Daftar Ulang"
                colorScheme="sky"
                badge={stats && stats.daftarUlang > 0 ? <Badge className="bg-sky-600 text-white text-[10px] px-1.5 py-0 min-w-[20px] h-5 flex items-center justify-center rounded-full shadow-sm">{stats.daftarUlang}</Badge> : undefined}
                collapsed={sidebarCollapsed}
              />

              {/* SISTEM Section */}
              {!sidebarCollapsed ? (
                <div className="pt-5 pb-2 px-3 flex items-center gap-2">
                  <div className="h-px bg-gray-200/80 flex-1" />
                  <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase shrink-0">Sistem</span>
                  <div className="h-px bg-gray-200/80 flex-1" />
                </div>
              ) : (
                <div className="pt-5 pb-2 flex justify-center">
                  <div className="w-5 h-px bg-gray-200/80" />
                </div>
              )}
              {authUser?.role === 'admin' && (
                <SidebarNavItem
                  tab="pengaturan"
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  icon={Settings}
                  label="Pengaturan"
                  colorScheme="gray"
                  collapsed={sidebarCollapsed}
                />
              )}
            </nav>

            {/* Sidebar Footer - Collapse toggle + user info */}
            <div className={`border-t border-gray-100/80 transition-all duration-300 ${sidebarCollapsed ? 'p-2' : 'p-3'}`}>
              {sidebarCollapsed ? (
                <div className="flex flex-col items-center gap-2">
                  {/* User avatar */}
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm cursor-default">
                        <span className="text-xs font-bold text-white">{authUser?.namaLengkap?.charAt(0) || 'U'}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>
                      <div className="text-left">
                        <p className="font-medium">{authUser?.namaLengkap}</p>
                        <p className="text-[10px] opacity-80">{authUser?.role === 'admin' ? 'Administrator' : 'Verifikator'}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  {/* Expand toggle */}
                  <button
                    onClick={toggleSidebar}
                    title="Expand Sidebar"
                    className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-gray-50/80">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
                      <span className="text-xs font-bold text-white">{authUser?.namaLengkap?.charAt(0) || 'U'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{authUser?.namaLengkap}</p>
                      <p className="text-[10px] text-gray-400">{authUser?.role === 'admin' ? 'Administrator' : 'Verifikator'}</p>
                    </div>
                  </div>
                  {/* Collapse toggle */}
                  <button
                    onClick={toggleSidebar}
                    className="w-full mt-2 flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors text-xs"
                  >
                    <ChevronsLeft className="w-4 h-4 shrink-0" />
                    <span>Minimize</span>
                  </button>
                </>
              )}
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
    </TooltipProvider>
  )
}
