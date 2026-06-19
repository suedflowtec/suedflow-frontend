// frontend/app/cliente/page.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { orders } from '@/lib/api'
import { formatBRL, statusLabel } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

const STATUS_BADGE: Record<string, string> = {
  AGUARDANDO: 'badge badge-yellow',
  PAGA: 'badge badge-blue',
  ACEITA: 'badge badge-indigo',
  EM_EXECUCAO: 'badge badge-purple',
  AGUARDANDO_QA: 'badge badge-orange',
  QA_REPROVADO: 'badge badge-red',
  AGUARDANDO_CONFIRMACAO: 'badge badge-teal',
  CONCLUIDA: 'badge badge-green',
  CANCELADA: 'badge badge-gray',
  EM_DISPUTA: 'badge badge-red',
  DEMANDA_ESPECIAL: 'badge badge-gold',
}

export default function ClienteHome() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [demandas, setDemandas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    orders.listarMinhas('cliente')
      .then(d => setDemandas(Array.isArray(d) ? d : []))
      .catch(() => toast('Erro ao carregar demandas', 'error'))
      .finally(() => setLoading(false))
  }, [user, authLoading, router, toast])

  if (authLoading || !user) return null

  const ativas    = demandas.filter(d => !['CONCLUIDA','CANCELADA'].includes(d.status))
  const concluidas = demandas.filter(d => d.status === 'CONCLUIDA')
  const valorTotal = concluidas.reduce((s, d) => s + (d.valor_total || 0), 0)

  return (
    <Shell>
      <Topbar
        title={`Olá, ${user.username ?? (user.nome?.includes('@') ? user.nome.split('@')[0] : user.nome?.split(' ')[0]) ?? 'você'}`}
        actions={
          <>
            <Link href="/cliente/catalogo" className="btn btn-secondary">
              Ver catálogo
            </Link>
            <Link href="/cliente/nova-demanda" className="btn btn-primary">
              + Nova demanda
            </Link>
          </>
        }
      />

      <main className="p-6 lg:p-8">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="kpi-card">
              <p className="kpi-label">Demandas ativas</p>
              <p className="kpi-value" style={{ color: 'var(--orange)' }}>{ativas.length}</p>
            </div>
            <div className="kpi-card">
              <p className="kpi-label">Concluídas</p>
              <p className="kpi-value">{concluidas.length}</p>
            </div>
            <div className="kpi-card">
              <p className="kpi-label">Total de demandas</p>
              <p className="kpi-value">{demandas.length}</p>
            </div>
            <div className="kpi-card">
              <p className="kpi-label">Valor investido</p>
              <p className="kpi-value">{formatBRL(valorTotal)}</p>
            </div>
          </div>

          {/* Tabela de demandas */}
          <div className="card">
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Suas demandas</h2>
              <Link href="/cliente/demandas" className="text-xs font-semibold hover:underline" style={{ color: 'var(--orange)' }}>
                Ver todas →
              </Link>
            </div>

            {loading ? (
              <div className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text3)' }}>Carregando...</div>
            ) : demandas.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <p className="text-sm mb-4" style={{ color: 'var(--text3)' }}>Nenhuma demanda ainda.</p>
                <Link href="/cliente/nova-demanda" className="btn btn-primary btn-sm">
                  Criar primeira demanda
                </Link>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Serviço</th>
                    <th>Status</th>
                    <th>Cidade</th>
                    <th>Área</th>
                    <th className="text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {demandas.slice(0, 10).map(d => {
                    const s = statusLabel(d.status)
                    const badgeCls = STATUS_BADGE[d.status] || 'badge badge-gray'
                    return (
                      <tr key={d.id} onClick={() => router.push(`/cliente/demandas/${d.id}`)}>
                        <td className="mono">{d.numero || d.id?.slice(0,8)}</td>
                        <td className="font-medium bold">{d.svc_nome || d.svc_codigo}</td>
                        <td><span className={badgeCls}>{s.text}</span></td>
                        <td>{d.cidade || '—'}</td>
                        <td>{d.area_m2 ? `${d.area_m2}m²` : '—'}</td>
                        <td className="text-right font-mono font-semibold bold">
                          {formatBRL(d.valor_total || d.preco_servico || 0)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </Shell>
  )
}
