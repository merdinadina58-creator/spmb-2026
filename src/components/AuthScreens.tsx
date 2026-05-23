'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ShieldCheck,
  AlertCircle,
  XCircle,
  Users,
  Mail,
  Lock,
  Loader2,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react'

interface AuthScreensProps {
  authLoading: boolean
  needsSetup: boolean
  isAuthenticated: boolean
  appName: string
  schoolName: string
  appIcon: string
  appSubtitle: string
  // Login form
  loginUsername: string
  setLoginUsername: (v: string) => void
  loginPassword: string
  setLoginPassword: (v: string) => void
  loginLoading: boolean
  loginError: string
  showLoginPassword: boolean
  setShowLoginPassword: (v: boolean) => void
  handleLogin: (e: React.FormEvent) => void
  // Setup form
  setupUsername: string
  setSetupUsername: (v: string) => void
  setupPassword: string
  setSetupPassword: (v: string) => void
  setupNamaLengkap: string
  setSetupNamaLengkap: (v: string) => void
  setupLoading: boolean
  setupError: string
  showSetupPassword: boolean
  setShowSetupPassword: (v: boolean) => void
  handleSetup: (e: React.FormEvent) => void
}

export default function AuthScreens(props: AuthScreensProps) {
  const {
    authLoading,
    needsSetup,
    isAuthenticated,
    appName,
    schoolName,
    appIcon,
    appSubtitle,
    loginUsername,
    setLoginUsername,
    loginPassword,
    setLoginPassword,
    loginLoading,
    loginError,
    showLoginPassword,
    setShowLoginPassword,
    handleLogin,
    setupUsername,
    setSetupUsername,
    setupPassword,
    setSetupPassword,
    setupNamaLengkap,
    setSetupNamaLengkap,
    setupLoading,
    setupError,
    showSetupPassword,
    setShowSetupPassword,
    handleSetup,
  } = props

  // Auth loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900" suppressHydrationWarning>
        <div className="text-center" suppressHydrationWarning>
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30 animate-pulse overflow-hidden">
            {appIcon ? (
              <img src={appIcon} alt="Ikon" className="w-full h-full object-cover" />
            ) : (
              <ShieldCheck className="w-10 h-10 text-white" />
            )}
          </div>
          <h1 className="text-xl font-bold text-white mb-1">{appName}</h1>
          {schoolName && <p className="text-emerald-200 text-base font-semibold mb-2">{schoolName}</p>}
          <p className="text-emerald-200 text-sm">Memuat sistem...</p>
        </div>
      </div>
    )
  }

  // Setup screen (First Time)
  if (needsSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 p-4">
        <div className="w-full max-w-md">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30 overflow-hidden">
              {appIcon ? (
                <img src={appIcon} alt="Ikon" className="w-full h-full object-cover" />
              ) : (
                <ShieldCheck className="w-10 h-10 text-white" />
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{appName}</h1>
            {schoolName && <p className="text-emerald-200 text-lg font-semibold mb-2">{schoolName}</p>}
            {appSubtitle.split('\n').map((line, i) => (
              <p key={i} className="text-emerald-200/80 text-sm">{line}</p>
            ))}
            <div className="mt-4 inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 rounded-full px-4 py-1.5">
              <AlertCircle className="w-4 h-4 text-amber-300" />
              <span className="text-amber-200 text-xs font-medium">Pengaturan Awal — Buat Akun Admin</span>
            </div>
          </div>

          {/* Setup Form */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-lg">Buat Akun Administrator</CardTitle>
              <CardDescription className="text-emerald-200/60 text-xs">
                Ini adalah akun pertama yang akan digunakan untuk mengelola sistem verifikasi.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSetup} className="space-y-4" autoComplete="off">
                {setupError && (
                  <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-300 shrink-0" />
                    <p className="text-red-200 text-sm">{setupError}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-emerald-100">Nama Lengkap</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300/50" />
                    <Input
                      name="setup-nama-lengkap"
                      value={setupNamaLengkap}
                      onChange={(e) => setSetupNamaLengkap(e.target.value)}
                      placeholder="Nama lengkap Anda"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-emerald-200/40 focus:border-emerald-400/50 focus:ring-emerald-400/30"
                      autoComplete="off"
                      data-lpignore="true"
                      data-1p-ignore
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-emerald-100">Username</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300/50" />
                    <Input
                      name="setup-username"
                      value={setupUsername}
                      onChange={(e) => setSetupUsername(e.target.value)}
                      placeholder="Username untuk login"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-emerald-200/40 focus:border-emerald-400/50 focus:ring-emerald-400/30"
                      autoComplete="off"
                      data-lpignore="true"
                      data-1p-ignore
                      required
                      minLength={3}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-emerald-100">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300/50" />
                    <Input
                      type={showSetupPassword ? 'text' : 'password'}
                      name="setup-password"
                      value={setupPassword}
                      onChange={(e) => setSetupPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-emerald-200/40 focus:border-emerald-400/50 focus:ring-emerald-400/30 pr-10"
                      autoComplete="new-password"
                      data-lpignore="true"
                      data-1p-ignore
                      required
                      minLength={6}
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-200/40 hover:text-emerald-200" onClick={() => setShowSetupPassword(!showSetupPassword)}>
                      {showSetupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/30 h-11"
                  disabled={setupLoading}
                >
                  {setupLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Membuat Akun...</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" /> Buat Akun & Mulai</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 p-4">
        <div className="w-full max-w-md">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30 overflow-hidden">
              {appIcon ? (
                <img src={appIcon} alt="Ikon" className="w-full h-full object-cover" />
              ) : (
                <ShieldCheck className="w-10 h-10 text-white" />
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{appName}</h1>
            {schoolName && <p className="text-emerald-200 text-lg sm:text-xl font-semibold mb-1">{schoolName}</p>}
            {appSubtitle.split('\n').map((line, i) => (
              <p key={i} className="text-emerald-200/80 text-sm">{line}</p>
            ))}
          </div>

          {/* Login Form */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                Masuk ke Sistem
              </CardTitle>
              <CardDescription className="text-emerald-200/60 text-xs">
                Masukkan username dan password untuk mengakses sistem verifikasi.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
                {loginError && (
                  <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-300 shrink-0" />
                    <p className="text-red-200 text-sm">{loginError}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-emerald-100">Username</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300/50" />
                    <Input
                      name="username"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="Masukkan username"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-emerald-200/40 focus:border-emerald-400/50 focus:ring-emerald-400/30"
                      autoComplete="off"
                      data-lpignore="true"
                      data-1p-ignore
                      required
                      autoFocus
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-emerald-100">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300/50" />
                    <Input
                      type={showLoginPassword ? 'text' : 'password'}
                      name="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Masukkan password"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-emerald-200/40 focus:border-emerald-400/50 focus:ring-emerald-400/30 pr-10"
                      autoComplete="new-password"
                      data-lpignore="true"
                      data-1p-ignore
                      required
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-200/40 hover:text-emerald-200" onClick={() => setShowLoginPassword(!showLoginPassword)}>
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/30 h-11"
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Memproses...</>
                  ) : (
                    <><Lock className="w-4 h-4 mr-2" /> Masuk</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-emerald-200/40 text-xs mt-6">
            &copy; 2026 {appName}{schoolName ? ` — ${schoolName}` : ''}
          </p>
        </div>
      </div>
    )
  }

  return null
}
