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
        title={`Olá, ${user.nome.split(' ')[0]}`}
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

      <main className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <div className="kpi-card">
            <p className="kpi-value text-orange">{ativas.length}</p>
            <p className="kpi-label">Demandas ativas</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-value">{concluidas.length}</p>
            <p className="kpi-label">Concluídas</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-value">{demandas.length}</p>
            <p className="kpi-label">Total de demandas</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-value">{formatBRL(valorTotal)}</p>
            <p className="kpi-label">Valor investido</p>
          </div>
        </div>

        {/* Tabela de demandas */}
        <div className="card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
            <h2 className="text-sm font-semibold text-navy">Suas demandas</h2>
            <Link href="/cliente/demandas" className="text-xs text-orange font-semibold hover:underline">
              Ver todas →
            </Link>
          </div>

          {loading ? (
            <div className="px-4 py-10 text-center text-sm text-ink-muted">Carregando...</div>
          ) : demandas.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-ink-muted mb-4">Nenhuma demanda ainda.</p>
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
                      <td className="font-medium text-navy">{d.svc_nome || d.svc_codigo}</td>
                      <td><span className={badgeCls}>{s.text}</span></td>
                      <td>{d.cidade || '—'}</td>
                      <td>{d.area_m2 ? `${d.area_m2}m²` : '—'}</td>
                      <td className="text-right font-mono font-semibold text-navy">
                        {formatBRL(d.valor_total || d.preco_servico || 0)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </Shell>
  )
}
