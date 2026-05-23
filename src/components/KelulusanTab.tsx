'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { GraduationCap, XCircle, RotateCcw } from 'lucide-react'
import type { Registration, DashboardStats } from '@/lib/types'
import { STATUS_COLORS, SUB_JALUR_COLORS, STATUS_LULUS_COLORS } from '@/lib/constants'

interface KelulusanTabProps {
  stats: DashboardStats | null
  appName: string
  schoolName: string
  appSubtitle: string
  registrations: Registration[]
  selectedIds: Set<string>
  setSelectedIds: (v: Set<string>) => void
  fetchStats: () => void
  fetchRegistrations: () => void
  toast: (opts: { title: string; description: string; variant?: string }) => void
}

export default function KelulusanTab(props: KelulusanTabProps) {
  const { stats, appName, schoolName, appSubtitle, registrations, selectedIds, setSelectedIds, fetchStats, fetchRegistrations, toast } = props

  return (
    <>
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 p-4 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold tracking-wide">KELULUSAN</h2>
              <p className="text-emerald-100 mt-0.5 sm:mt-1 text-xs sm:text-sm">{appName}{schoolName ? ` — ${schoolName}` : ''} — Status Kelulusan</p>
            </div>
          </div>
        </div>
        <CardContent className="p-3 sm:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            <div className="bg-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-emerald-100"><p className="text-xl sm:text-3xl font-bold text-emerald-700">{stats?.lulus || 0}</p><p className="text-[10px] sm:text-xs text-emerald-600 font-medium mt-0.5 sm:mt-1">Lulus</p></div>
            <div className="bg-red-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-red-100"><p className="text-xl sm:text-3xl font-bold text-red-700">{stats?.tidakLulus || 0}</p><p className="text-[10px] sm:text-xs text-red-600 font-medium mt-0.5 sm:mt-1">Tidak Lulus</p></div>
            <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-gray-200"><p className="text-xl sm:text-3xl font-bold text-gray-600">{stats?.belumLulus || 0}</p><p className="text-[10px] sm:text-xs text-gray-500 font-medium mt-0.5 sm:mt-1">Belum Ditentukan</p></div>
            <div className="bg-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-emerald-100"><p className="text-xl sm:text-3xl font-bold text-emerald-700">{stats?.total ? Math.round(((stats.lulus || 0) / stats.total) * 100) : 0}%</p><p className="text-[10px] sm:text-xs text-emerald-600 font-medium mt-0.5 sm:mt-1">Persentase Lulus</p></div>
          </div>
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Distribusi Lulus Per Sub Jalur</h3>
            <div className="space-y-2.5">
              {(stats?.lulusBySubJalur || []).map((item, idx) => (
                <div key={`lsub-${item.name}-${idx}`} className="flex items-center gap-3">
                  <Badge variant="outline" className={`${SUB_JALUR_COLORS[item.name] || 'bg-gray-100 text-gray-800'} min-w-[130px] justify-center text-xs`}>{item.name}</Badge>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 relative overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: stats?.lulus ? `${(item.count / stats.lulus) * 100}%` : '0%' }} /></div>
                  <span className="text-sm font-semibold text-gray-700 min-w-[40px] text-right">{item.count}</span>
                </div>
              ))}
              {(stats?.lulusBySubJalur || []).length === 0 && <p className="text-xs text-gray-400 text-center py-2">Belum ada data</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Aksi Massal:</span>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={async () => {
              const ids = Array.from(selectedIds)
              if (ids.length === 0) { toast({ title: 'Perhatian', description: 'Pilih pendaftar terlebih dahulu', variant: 'destructive' }); return }
              try { const res = await fetch('/api/registrations/status-lulus', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids, statusLulus: 'LULUS' }) }); const data = await res.json(); if (data.success) { toast({ title: 'Berhasil', description: `${data.updated} pendaftar ditetapkan LULUS` }); setSelectedIds(new Set()); fetchStats(); fetchRegistrations() } } catch { toast({ title: 'Gagal', description: 'Gagal mengubah status', variant: 'destructive' }) }
            }}><GraduationCap className="w-4 h-4 mr-1" /> Lulus ({selectedIds.size})</Button>
            <Button size="sm" variant="destructive" onClick={async () => {
              const ids = Array.from(selectedIds)
              if (ids.length === 0) { toast({ title: 'Perhatian', description: 'Pilih pendaftar terlebih dahulu', variant: 'destructive' }); return }
              try { const res = await fetch('/api/registrations/status-lulus', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids, statusLulus: 'TIDAK_LULUS' }) }); const data = await res.json(); if (data.success) { toast({ title: 'Berhasil', description: `${data.updated} pendaftar ditetapkan TIDAK LULUS` }); setSelectedIds(new Set()); fetchStats(); fetchRegistrations() } } catch { toast({ title: 'Gagal', description: 'Gagal mengubah status', variant: 'destructive' }) }
            }}><XCircle className="w-4 h-4 mr-1" /> Tidak Lulus ({selectedIds.size})</Button>
            <Button size="sm" variant="outline" onClick={async () => {
              const ids = Array.from(selectedIds)
              if (ids.length === 0) { toast({ title: 'Perhatian', description: 'Pilih pendaftar terlebih dahulu', variant: 'destructive' }); return }
              try { const res = await fetch('/api/registrations/status-lulus', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids, statusLulus: 'BELUM' }) }); const data = await res.json(); if (data.success) { toast({ title: 'Berhasil', description: `${data.updated} pendaftar direset ke BELUM` }); setSelectedIds(new Set()); fetchStats(); fetchRegistrations() } } catch { toast({ title: 'Gagal', description: 'Gagal mengubah status', variant: 'destructive' }) }
            }}><RotateCcw className="w-4 h-4 mr-1" /> Reset</Button>
            {selectedIds.size > 0 && <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}><XCircle className="w-4 h-4 mr-1" /> Batal Pilih</Button>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Data Status Kelulusan</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-white">
                <TableRow className="bg-emerald-50/80">
                  <TableHead className="w-10 text-center">No</TableHead>
                  <TableHead className="w-10 text-center"><Checkbox checked={(() => { const _s = new Set<string>(); const allRegs = [...(stats?.lulusList || []), ...(stats?.tidakLulusList || []), ...(registrations.filter(r => r.statusLulus === 'BELUM' || !r.statusLulus))].filter(r => { if (_s.has(r.id)) return false; _s.add(r.id); return true }); return allRegs.length > 0 && selectedIds.size === allRegs.length })()} onCheckedChange={() => { const _s = new Set<string>(); const allRegs = [...(stats?.lulusList || []), ...(stats?.tidakLulusList || []), ...(registrations.filter(r => r.statusLulus === 'BELUM' || !r.statusLulus))].filter(r => { if (_s.has(r.id)) return false; _s.add(r.id); return true }); if (selectedIds.size === allRegs.length) setSelectedIds(new Set()); else setSelectedIds(new Set(allRegs.map(r => r.id))) }} /></TableHead>
                  <TableHead>No. Registrasi</TableHead><TableHead>Nama Peserta</TableHead><TableHead>Sub Jalur</TableHead><TableHead>Sekolah Asal</TableHead><TableHead>Status Verifikasi</TableHead><TableHead>Status Kelulusan</TableHead><TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  const _seen = new Set<string>()
                  const allData = [...(stats?.lulusList || []), ...(stats?.tidakLulusList || []), ...(registrations.filter(r => r.statusLulus === 'BELUM' || !r.statusLulus))].filter(r => { if (_seen.has(r.id)) return false; _seen.add(r.id); return true })
                  if (allData.length === 0) return <TableRow><TableCell colSpan={10} className="text-center py-12"><GraduationCap className="w-10 h-10 mx-auto text-gray-300 mb-2" /><p className="text-gray-500 font-medium">Belum ada data kelulusan</p><p className="text-sm text-gray-400">Tentukan status kelulusan peserta dari menu aksi</p></TableCell></TableRow>
                  return allData.map((reg, idx) => (
                    <TableRow key={`lulus-${reg.id}-${idx}`} className={reg.statusLulus === 'LULUS' ? 'bg-emerald-50/40' : reg.statusLulus === 'TIDAK_LULUS' ? 'bg-red-50/40' : ''}>
                      <TableCell className="text-center text-sm text-gray-500">{idx + 1}</TableCell>
                      <TableCell className="text-center"><Checkbox checked={selectedIds.has(reg.id)} onCheckedChange={() => { const next = new Set(selectedIds); if (next.has(reg.id)) next.delete(reg.id); else next.add(reg.id); setSelectedIds(next) }} /></TableCell>
                      <TableCell className="font-mono text-sm">{reg.noRegistrasi}</TableCell>
                      <TableCell className="font-medium text-sm">{reg.nama}</TableCell>
                      <TableCell><Badge variant="outline" className={SUB_JALUR_COLORS[reg.subJalur] || 'bg-gray-100 text-gray-800'}>{reg.subJalur}</Badge></TableCell>
                      <TableCell className="text-sm text-gray-600">{reg.namaSekolahAsal}</TableCell>
                      <TableCell><Badge variant="outline" className={STATUS_COLORS[reg.verificationStatus]}>{reg.verificationStatus === 'PENDING' ? 'Menunggu' : reg.verificationStatus === 'VERIFIED' ? 'Diterima' : 'Ditolak'}</Badge></TableCell>
                      <TableCell><Badge variant="outline" className={STATUS_LULUS_COLORS[reg.statusLulus || 'BELUM']}>{reg.statusLulus === 'LULUS' ? 'Lulus' : reg.statusLulus === 'TIDAK_LULUS' ? 'Tidak Lulus' : 'Belum'}</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-white hover:bg-emerald-600" title="Tetapkan Lulus" onClick={async () => { try { const res = await fetch('/api/registrations/status-lulus', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: reg.id, statusLulus: 'LULUS' }) }); const data = await res.json(); if (data.success) { toast({ title: 'Berhasil', description: `${reg.nama} ditetapkan LULUS` }); fetchStats(); fetchRegistrations() } } catch { toast({ title: 'Gagal', description: 'Gagal mengubah status', variant: 'destructive' }) } }}><GraduationCap className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-white hover:bg-red-600" title="Tetapkan Tidak Lulus" onClick={async () => { try { const res = await fetch('/api/registrations/status-lulus', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: reg.id, statusLulus: 'TIDAK_LULUS' }) }); const data = await res.json(); if (data.success) { toast({ title: 'Berhasil', description: `${reg.nama} ditetapkan TIDAK LULUS` }); fetchStats(); fetchRegistrations() } } catch { toast({ title: 'Gagal', description: 'Gagal mengubah status', variant: 'destructive' }) } }}><XCircle className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-white hover:bg-gray-500" title="Reset ke Belum" onClick={async () => { try { const res = await fetch('/api/registrations/status-lulus', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: reg.id, statusLulus: 'BELUM' }) }); const data = await res.json(); if (data.success) { toast({ title: 'Berhasil', description: `Status ${reg.nama} direset` }); fetchStats(); fetchRegistrations() } } catch { toast({ title: 'Gagal', description: 'Gagal mengubah status', variant: 'destructive' }) } }}><RotateCcw className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                })()}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
