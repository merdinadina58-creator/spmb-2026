'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ClipboardCheck, XCircle, RotateCcw } from 'lucide-react'
import type { Registration, DashboardStats } from '@/lib/types'
import { SUB_JALUR_COLORS, STATUS_LULUS_COLORS, STATUS_DAFTAR_ULANG_COLORS } from '@/lib/constants'

interface DaftarUlangTabProps {
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

export default function DaftarUlangTab(props: DaftarUlangTabProps) {
  const { stats, appName, schoolName, appSubtitle, registrations, selectedIds, setSelectedIds, fetchStats, fetchRegistrations, toast } = props

  return (
    <>
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 p-4 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold tracking-wide">DAFTAR ULANG</h2>
              <p className="text-blue-100 mt-0.5 sm:mt-1 text-xs sm:text-sm">{appName}{schoolName ? ` — ${schoolName}` : ''} — Status Daftar Ulang</p>
            </div>
          </div>
        </div>
        <CardContent className="p-3 sm:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-blue-100"><p className="text-xl sm:text-3xl font-bold text-blue-700">{stats?.daftarUlang || 0}</p><p className="text-[10px] sm:text-xs text-blue-600 font-medium mt-0.5 sm:mt-1">Daftar Ulang</p></div>
            <div className="bg-orange-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-orange-100"><p className="text-xl sm:text-3xl font-bold text-orange-700">{stats?.tidakDaftarUlang || 0}</p><p className="text-[10px] sm:text-xs text-orange-600 font-medium mt-0.5 sm:mt-1">Tidak Daftar Ulang</p></div>
            <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-gray-200"><p className="text-xl sm:text-3xl font-bold text-gray-600">{stats?.belumDaftarUlang || 0}</p><p className="text-[10px] sm:text-xs text-gray-500 font-medium mt-0.5 sm:mt-1">Belum Ditentukan</p></div>
            <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-blue-100"><p className="text-xl sm:text-3xl font-bold text-blue-700">{stats?.lulus ? (stats.lulus > 0 ? Math.round(((stats.daftarUlang || 0) / stats.lulus) * 100) : 0) : 0}%</p><p className="text-[10px] sm:text-xs text-blue-600 font-medium mt-0.5 sm:mt-1">Persentase Daftar Ulang</p></div>
          </div>
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Distribusi Daftar Ulang Per Sub Jalur</h3>
            <div className="space-y-2.5">
              {(stats?.daftarUlangBySubJalur || []).map((item, idx) => (
                <div key={`dusub-${item.name}-${idx}`} className="flex items-center gap-3">
                  <Badge variant="outline" className={`${SUB_JALUR_COLORS[item.name] || 'bg-gray-100 text-gray-800'} min-w-[130px] justify-center text-xs`}>{item.name}</Badge>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 relative overflow-hidden"><div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: stats?.daftarUlang ? `${(item.count / stats.daftarUlang) * 100}%` : '0%' }} /></div>
                  <span className="text-sm font-semibold text-gray-700 min-w-[40px] text-right">{item.count}</span>
                </div>
              ))}
              {(stats?.daftarUlangBySubJalur || []).length === 0 && <p className="text-xs text-gray-400 text-center py-2">Belum ada data</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Aksi Massal:</span>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={async () => {
              const ids = Array.from(selectedIds)
              if (ids.length === 0) { toast({ title: 'Perhatian', description: 'Pilih pendaftar terlebih dahulu', variant: 'destructive' }); return }
              try { const res = await fetch('/api/registrations/status-daftar-ulang', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids, statusDaftarUlang: 'DAFTAR_ULANG' }) }); const data = await res.json(); if (data.success) { toast({ title: 'Berhasil', description: `${data.updated} pendaftar ditetapkan DAFTAR ULANG` }); setSelectedIds(new Set()); fetchStats(); fetchRegistrations() } } catch { toast({ title: 'Gagal', description: 'Gagal mengubah status', variant: 'destructive' }) }
            }}><ClipboardCheck className="w-4 h-4 mr-1" /> Daftar Ulang ({selectedIds.size})</Button>
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={async () => {
              const ids = Array.from(selectedIds)
              if (ids.length === 0) { toast({ title: 'Perhatian', description: 'Pilih pendaftar terlebih dahulu', variant: 'destructive' }); return }
              try { const res = await fetch('/api/registrations/status-daftar-ulang', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids, statusDaftarUlang: 'TIDAK_DAFTAR_ULANG' }) }); const data = await res.json(); if (data.success) { toast({ title: 'Berhasil', description: `${data.updated} pendaftar ditetapkan TIDAK DAFTAR ULANG` }); setSelectedIds(new Set()); fetchStats(); fetchRegistrations() } } catch { toast({ title: 'Gagal', description: 'Gagal mengubah status', variant: 'destructive' }) }
            }}><XCircle className="w-4 h-4 mr-1" /> Tidak Daftar Ulang ({selectedIds.size})</Button>
            <Button size="sm" variant="outline" onClick={async () => {
              const ids = Array.from(selectedIds)
              if (ids.length === 0) { toast({ title: 'Perhatian', description: 'Pilih pendaftar terlebih dahulu', variant: 'destructive' }); return }
              try { const res = await fetch('/api/registrations/status-daftar-ulang', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids, statusDaftarUlang: 'BELUM' }) }); const data = await res.json(); if (data.success) { toast({ title: 'Berhasil', description: `${data.updated} pendaftar direset ke BELUM` }); setSelectedIds(new Set()); fetchStats(); fetchRegistrations() } } catch { toast({ title: 'Gagal', description: 'Gagal mengubah status', variant: 'destructive' }) }
            }}><RotateCcw className="w-4 h-4 mr-1" /> Reset</Button>
            {selectedIds.size > 0 && <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}><XCircle className="w-4 h-4 mr-1" /> Batal Pilih</Button>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Data Status Daftar Ulang</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-white">
                <TableRow className="bg-blue-50/80">
                  <TableHead className="w-10 text-center">No</TableHead>
                  <TableHead className="w-10 text-center"><Checkbox checked={(() => { const _s = new Set<string>(); const allRegs = [...(stats?.daftarUlangList || []), ...(stats?.tidakDaftarUlangList || []), ...(registrations.filter(r => r.statusDaftarUlang === 'BELUM' || !r.statusDaftarUlang))].filter(r => { if (_s.has(r.id)) return false; _s.add(r.id); return true }); return allRegs.length > 0 && selectedIds.size === allRegs.length })()} onCheckedChange={() => { const _s = new Set<string>(); const allRegs = [...(stats?.daftarUlangList || []), ...(stats?.tidakDaftarUlangList || []), ...(registrations.filter(r => r.statusDaftarUlang === 'BELUM' || !r.statusDaftarUlang))].filter(r => { if (_s.has(r.id)) return false; _s.add(r.id); return true }); if (selectedIds.size === allRegs.length) setSelectedIds(new Set()); else setSelectedIds(new Set(allRegs.map(r => r.id))) }} /></TableHead>
                  <TableHead>No. Registrasi</TableHead><TableHead>Nama Peserta</TableHead><TableHead>Sub Jalur</TableHead><TableHead>Sekolah Asal</TableHead><TableHead>Status Kelulusan</TableHead><TableHead>Status Daftar Ulang</TableHead><TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  const _seen = new Set<string>()
                  const allData = [...(stats?.daftarUlangList || []), ...(stats?.tidakDaftarUlangList || []), ...(registrations.filter(r => r.statusDaftarUlang === 'BELUM' || !r.statusDaftarUlang))].filter(r => { if (_seen.has(r.id)) return false; _seen.add(r.id); return true })
                  if (allData.length === 0) return <TableRow><TableCell colSpan={10} className="text-center py-12"><ClipboardCheck className="w-10 h-10 mx-auto text-gray-300 mb-2" /><p className="text-gray-500 font-medium">Belum ada data daftar ulang</p><p className="text-sm text-gray-400">Tentukan status daftar ulang peserta dari menu aksi</p></TableCell></TableRow>
                  return allData.map((reg, idx) => (
                    <TableRow key={`du-${reg.id}-${idx}`} className={reg.statusDaftarUlang === 'DAFTAR_ULANG' ? 'bg-blue-50/40' : reg.statusDaftarUlang === 'TIDAK_DAFTAR_ULANG' ? 'bg-orange-50/40' : ''}>
                      <TableCell className="text-center text-sm text-gray-500">{idx + 1}</TableCell>
                      <TableCell className="text-center"><Checkbox checked={selectedIds.has(reg.id)} onCheckedChange={() => { const next = new Set(selectedIds); if (next.has(reg.id)) next.delete(reg.id); else next.add(reg.id); setSelectedIds(next) }} /></TableCell>
                      <TableCell className="font-mono text-sm">{reg.noRegistrasi}</TableCell>
                      <TableCell className="font-medium text-sm">{reg.nama}</TableCell>
                      <TableCell><Badge variant="outline" className={SUB_JALUR_COLORS[reg.subJalur] || 'bg-gray-100 text-gray-800'}>{reg.subJalur}</Badge></TableCell>
                      <TableCell className="text-sm text-gray-600">{reg.namaSekolahAsal}</TableCell>
                      <TableCell><Badge variant="outline" className={STATUS_LULUS_COLORS[reg.statusLulus || 'BELUM']}>{reg.statusLulus === 'LULUS' ? 'Lulus' : reg.statusLulus === 'TIDAK_LULUS' ? 'Tidak Lulus' : 'Belum'}</Badge></TableCell>
                      <TableCell><Badge variant="outline" className={STATUS_DAFTAR_ULANG_COLORS[reg.statusDaftarUlang || 'BELUM']}>{reg.statusDaftarUlang === 'DAFTAR_ULANG' ? 'Daftar Ulang' : reg.statusDaftarUlang === 'TIDAK_DAFTAR_ULANG' ? 'Tidak Daftar Ulang' : 'Belum'}</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-white hover:bg-blue-600" title="Tetapkan Daftar Ulang" onClick={async () => { try { const res = await fetch('/api/registrations/status-daftar-ulang', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: reg.id, statusDaftarUlang: 'DAFTAR_ULANG' }) }); const data = await res.json(); if (data.success) { toast({ title: 'Berhasil', description: `${reg.nama} ditetapkan DAFTAR ULANG` }); fetchStats(); fetchRegistrations() } } catch { toast({ title: 'Gagal', description: 'Gagal mengubah status', variant: 'destructive' }) } }}><ClipboardCheck className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" className="text-orange-600 hover:text-white hover:bg-orange-600" title="Tetapkan Tidak Daftar Ulang" onClick={async () => { try { const res = await fetch('/api/registrations/status-daftar-ulang', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: reg.id, statusDaftarUlang: 'TIDAK_DAFTAR_ULANG' }) }); const data = await res.json(); if (data.success) { toast({ title: 'Berhasil', description: `${reg.nama} ditetapkan TIDAK DAFTAR ULANG` }); fetchStats(); fetchRegistrations() } } catch { toast({ title: 'Gagal', description: 'Gagal mengubah status', variant: 'destructive' }) } }}><XCircle className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-white hover:bg-gray-500" title="Reset ke Belum" onClick={async () => { try { const res = await fetch('/api/registrations/status-daftar-ulang', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: reg.id, statusDaftarUlang: 'BELUM' }) }); const data = await res.json(); if (data.success) { toast({ title: 'Berhasil', description: `Status ${reg.nama} direset` }); fetchStats(); fetchRegistrations() } } catch { toast({ title: 'Gagal', description: 'Gagal mengubah status', variant: 'destructive' }) } }}><RotateCcw className="w-4 h-4" /></Button>
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
