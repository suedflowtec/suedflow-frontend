// app/admin/profissionais/page.tsx
'use client'
import { useEffect, useState } from 'react'
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

  const lista: any[] = Array.isArray(data) ? data : (data?.profissionais || [])

  return (
    <Shell>
      <Topbar title="Profissionais" />

      <main className="p-6 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="kpi-card">
            <p className="kpi-value">{lista.length}</p>
            <p className="kpi-label">Total</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-value text-orange">{lista.filter(p => !p.kyc_aprovado).length}</p>
            <p className="kpi-label">KYC pendente</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-value">{lista.filter(p => p.kyc_aprovado).length}</p>
            <p className="kpi-label">Ativos</p>
          </div>
        </div>

        <div className="card">
          {loading ? (
            <div className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text3)' }}>Carregando...</div>
          ) : lista.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text3)' }}>Nenhum profissional cadastrado</div>
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
                    <td className="font-semibold text-white">{p.usuario?.nome || p.nome || p.usuario?.email || p.email}</td>
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
