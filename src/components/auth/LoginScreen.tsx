'use client'

import { ShieldCheck, Lock, XCircle, Mail, EyeOff, Eye, Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface LoginScreenProps {
  onLogin: (e: React.FormEvent) => void
  loginLoading: boolean
  loginError: string
  loginUsername: string
  setLoginUsername: (v: string) => void
  loginPassword: string
  setLoginPassword: (v: string) => void
  showLoginPassword: boolean
  setShowLoginPassword: (v: boolean) => void
}

export default function LoginScreen({
  onLogin,
  loginLoading,
  loginError,
  loginUsername,
  setLoginUsername,
  loginPassword,
  setLoginPassword,
  showLoginPassword,
  setShowLoginPassword,
}: LoginScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">SPMB 2026</h1>
          <p className="text-emerald-200/80 text-sm">Sistem Verifikasi Penerimaan Peserta Didik Baru</p>
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
            <form onSubmit={onLogin} className="space-y-4" autoComplete="off">
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
                    autoComplete="current-password"
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
          &copy; 2026 SPMB Verifikasi System
        </p>
      </div>
    </div>
  )
}
