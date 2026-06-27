// app/admin/profissionais/page.tsx
'use client'
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { admin } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

export default function AdminProfissionais() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (!['ADMIN', 'MODERADOR'].includes(user.tipo)) { router.push('/curador'); return }
    admin.profissionais()
      .then(setData)
      .catch(() => toast('Erro ao carregar', 'error'))
      .finally(() => setLoading(false))
  }, [user, authLoading, router, toast])

  const aprovar = async (id: string) => {
    try {
      await admin.aprovarKyc(id, true)
      toast('KYC aprovado', 'success')
      const fresh = await admin.profissionais()
      setData(fresh)
    } catch (e: any) { toast(e.message || 'Erro', 'error') }
  }

  const listaCompleta: any[] = Array.isArray(data) ? data : (data?.profissionais || [])

  // Filtro por busca e status KYC
  const [busca, setBusca] = useState('')
  const [filtroKyc, setFiltroKyc] = useState<'todos' | 'pendente' | 'aprovado'>('todos')

  const lista = listaCompleta.filter(p => {
    const nome  = (p.usuario?.nome || p.nome || p.usuario?.email || '').toLowerCase()
    const email = (p.usuario?.email || '').toLowerCase()
    const conselho = `${p.conselho || ''}-${p.uf_conselho || ''} ${p.numero_conselho || ''}`.toLowerCase()
    const matchBusca = !busca || nome.includes(busca.toLowerCase()) || email.includes(busca.toLowerCase()) || conselho.includes(busca.toLowerCase())
    const matchKyc = filtroKyc === 'todos' || (filtroKyc === 'pendente' && !p.kyc_aprovado) || (filtroKyc === 'aprovado' && p.kyc_aprovado)
    return matchBusca && matchKyc
  })

  return (
    <Shell>
      <Topbar title="Profissionais" subtitle={`${listaCompleta.length} cadastrados`} />

      <main className="p-6 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="kpi-card">
            <p className="kpi-value">{listaCompleta.length}</p>
            <p className="kpi-label">Total</p>
          </div>
          <div className="kpi-card cursor-pointer" onClick={() => setFiltroKyc('pendente')}
            style={{ borderColor: filtroKyc === 'pendente' ? 'rgba(232,103,26,0.5)' : undefined }}>
            <p className="kpi-value" style={{ color: 'var(--orange)' }}>{listaCompleta.filter(p => !p.kyc_aprovado).length}</p>
            <p className="kpi-label">KYC pendente</p>
          </div>
          <div className="kpi-card cursor-pointer" onClick={() => setFiltroKyc('aprovado')}
            style={{ borderColor: filtroKyc === 'aprovado' ? 'rgba(0,214,143,0.5)' : undefined }}>
            <p className="kpi-value" style={{ color: 'var(--green)' }}>{listaCompleta.filter(p => p.kyc_aprovado).length}</p>
            <p className="kpi-label">Ativos</p>
          </div>
        </div>

        {/* Busca e filtros */}
        <div className="flex gap-3 items-center flex-wrap">
          <input
            className="input flex-1 min-w-[200px]"
            placeholder="Buscar por nome, e-mail ou número de conselho..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
          <div className="flex gap-1">
            {(['todos', 'pendente', 'aprovado'] as const).map(f => (
              <button key={f} onClick={() => setFiltroKyc(f)}
                className="btn btn-sm text-xs"
                style={{
                  background: filtroKyc === f ? 'var(--orange)' : 'rgba(255,255,255,0.06)',
                  color:      filtroKyc === f ? '#fff' : 'var(--text3)',
                }}>
                {f === 'todos' ? 'Todos' : f === 'pendente' ? 'KYC pendente' : 'Ativos'}
              </button>
            ))}
          </div>
          {(busca || filtroKyc !== 'todos') && (
            <button onClick={() => { setBusca(''); setFiltroKyc('todos') }}
              className="text-xs" style={{ color: 'var(--text3)' }}>
              Limpar filtros ✕
            </button>
          )}
        </div>

        <div className="card">
          {loading ? (
            <div className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text3)' }}>Carregando...</div>
          ) : lista.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text3)' }}>
              {busca || filtroKyc !== 'todos' ? `Nenhum profissional encontrado para "${busca || filtroKyc}"` : 'Nenhum profissional cadastrado'}
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Profissional</th>
                  <th>Conselho</th>
                  <th>Nível</th>
                  <th>KYC</th>
                  <th className="text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {lista.map(p => (
                  <tr key={p.id} className="cursor-pointer" onClick={() => router.push(`/admin/profissionais/${p.id}`)}>
                    <td>
                      <p className="font-semibold text-white">{p.usuario?.nome || p.nome || p.usuario?.email || p.email}</p>
                      <p className="text-2xs" style={{ color: 'var(--text3)' }}>{p.usuario?.email}</p>
                    </td>
                    <td className="mono">{p.conselho || 'CREA'}-{p.uf_conselho || 'PB'} {p.numero_conselho}</td>
                    <td>
                      <span className={`badge ${p.nivel === 'ELITE' ? 'badge-gold' : p.nivel === 'SENIOR' ? 'badge-purple' : 'badge-orange'}`}>
                        {p.nivel || 'CANDIDATO'}
                      </span>
                    </td>
                    <td>
                      <Badge variant={p.kyc_aprovado ? 'green' : 'gold'}>
                        {p.kyc_aprovado ? '✓ KYC' : 'KYC pend.'}
                      </Badge>
                    </td>
                    <td className="text-right" onClick={e => e.stopPropagation()}>
                      {!p.kyc_aprovado && (
                        <Button onClick={() => aprovar(p.id)} size="sm">Aprovar rápido</Button>
                      )}
                      <Button variant="ghost" size="sm" className="ml-2" onClick={() => router.push(`/admin/profissionais/${p.id}`)}>
                        Ver detalhes
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </Shell>
  )
}
