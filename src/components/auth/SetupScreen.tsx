'use client'

import { ShieldCheck, AlertCircle, XCircle, Users, Mail, Lock, EyeOff, Eye, Loader2, Save } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SetupScreenProps {
  onSetup: (e: React.FormEvent) => void
  setupLoading: boolean
  setupError: string
  setupNamaLengkap: string
  setSetupNamaLengkap: (v: string) => void
  setupUsername: string
  setSetupUsername: (v: string) => void
  setupPassword: string
  setSetupPassword: (v: string) => void
  showSetupPassword: boolean
  setShowSetupPassword: (v: boolean) => void
}

export default function SetupScreen({
  onSetup,
  setupLoading,
  setupError,
  setupNamaLengkap,
  setSetupNamaLengkap,
  setupUsername,
  setSetupUsername,
  setupPassword,
  setSetupPassword,
  showSetupPassword,
  setShowSetupPassword,
}: SetupScreenProps) {
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
              Ini adalah akun pertama yang akan digunakan untuk mengelola sistem verifikasi SPMB 2026.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSetup} className="space-y-4" autoComplete="off">
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
