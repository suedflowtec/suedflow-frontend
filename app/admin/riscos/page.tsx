// app/admin/riscos/page.tsx — Monitoramento de Riscos Operacionais
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shell, Topbar } from '@/components/layout/Shell'
import { admin } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { formatDate, statusLabel } from '@/lib/utils'
import { AlertTriangle, Clock, MessageSquareWarning, ShieldX, RefreshCw, TrendingDown } from 'lucide-react'

const CATEGORIAS_RISCO = [
  { id: 'atrasadas',   label: 'Demandas atrasadas',      cor: 'var(--red)',    Icon: Clock,                desc: 'Passaram do prazo de entrega' },
  { id: 'disputas',    label: 'Disputas abertas',         cor: 'var(--red)',    Icon: MessageSquareWarning, desc: 'Pendentes de mediação do curador' },
  { id: 'qa_reprov',   label: 'QA reprovado',             cor: 'var(--gold)',   Icon: ShieldX,              desc: 'Aguardando correção do profissional' },
  { id: 'paralisadas', label: 'Demandas paralisadas',     cor: 'var(--purple)', Icon: TrendingDown,         desc: 'Com execução pausada' },
]

function GaugeRisco({ nivel }: { nivel: 'BAIXO' | 'MÉDIO' | 'ALTO' | 'CRÍTICO' }) {
  const config = {
    BAIXO:    { cor: 'var(--green)',  pct: 15, bg: 'rgba(0,214,143,0.10)' },
    MÉDIO:    { cor: 'var(--gold)',   pct: 45, bg: 'rgba(245,166,35,0.10)' },
    ALTO:     { cor: 'var(--orange)', pct: 72, bg: 'rgba(232,103,26,0.10)' },
    CRÍTICO:  { cor: 'var(--red)',    pct: 95, bg: 'rgba(255,77,109,0.10)' },
  }[nivel]

  return (
    <div className="rounded-2xl p-5 flex flex-col items-center gap-3" style={{ background: config.bg, border: `1px solid ${config.cor}30` }}>
      {/* Gauge semicircle (CSS only) */}
      <div className="relative" style={{ width: 120, height: 60 }}>
        <svg viewBox="0 0 120 60" style={{ width: 120, height: 60 }}>
          <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" strokeLinecap="round" />
          <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke={config.cor}
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${config.pct * 1.57} 157`}
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-end justify-center pb-1">
          <p className="text-xs font-bold" style={{ color: config.cor }}>{nivel}</p>
        </div>
      </div>
      <p className="text-xs font-semibold text-center" style={{ color: 'var(--text3)' }}>
        Nível de risco operacional
      </p>
    </div>
  )
}

export default function AdminRiscosPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [dados, setDados] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const carregar = () => {
    Promise.all([
      admin.dashboard(),
      (admin as any).demandas({ atrasada: '1', limit: 20 }),
    ]).then(([dash, atrasadas]) => {
      setDados({ dash, atrasadas: atrasadas?.demandas || [] })
    }).catch(() => toast('Erro ao carregar riscos', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (!['ADMIN', 'MODERADOR'].includes(user.tipo)) { router.push('/curador'); return }
    carregar()
  }, [user, authLoading])

  if (authLoading || !user) return null

  const p = dados?.dash?.pulso || {}
  const totalAlertas = (p.demandas_atrasadas || 0) + (p.disputas_abertas || 0) + (p.qa_reprovados || 0) + (p.paralisadas || 0)
  const nivel: 'BAIXO' | 'MÉDIO' | 'ALTO' | 'CRÍTICO' =
    totalAlertas === 0 ? 'BAIXO' :
    totalAlertas <= 3  ? 'MÉDIO' :
    totalAlertas <= 8  ? 'ALTO'  : 'CRÍTICO'

  return (
    <Shell>
      <Topbar
        title="Monitoramento de Riscos"
        subtitle="Demandas que precisam de atenção imediata"
        actions={
          <button onClick={carregar} className="btn btn-secondary btn-sm flex items-center gap-1">
            <RefreshCw size={12} />Atualizar
          </button>
        }
      />

      <main className="p-6 space-y-6 max-w-5xl">

        {loading ? (
          <p className="text-sm text-center py-12" style={{ color: 'var(--text3)' }}>Analisando riscos...</p>
        ) : (
          <>
            {/* Gauge + contadores por categoria */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="sm:col-span-2 lg:col-span-1">
                <GaugeRisco nivel={nivel} />
              </div>
              {CATEGORIAS_RISCO.map(cat => {
                const val = cat.id === 'atrasadas' ? p.demandas_atrasadas :
                            cat.id === 'disputas' ? p.disputas_abertas :
                            cat.id === 'qa_reprov' ? p.qa_reprovados :
                            cat.id === 'paralisadas' ? (p.paralisadas || 0) : 0
                const temRisco = (val || 0) > 0
                return (
                  <div key={cat.id} className="rounded-xl p-4 flex flex-col gap-2" style={{
                    background: temRisco ? `${cat.cor}12` : 'var(--glass)',
                    border: `1px solid ${temRisco ? `${cat.cor}40` : 'var(--border)'}`,
                    borderLeft: `3px solid ${temRisco ? cat.cor : 'var(--border)'}`,
                  }}>
                    <div className="flex items-center gap-2">
                      <cat.Icon size={14} style={{ color: temRisco ? cat.cor : 'var(--text3)', flexShrink: 0 }} />
                      <span className="text-2xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text3)' }}>{cat.label}</span>
                    </div>
                    <p className="text-3xl font-black font-mono" style={{ color: temRisco ? cat.cor : 'var(--text3)' }}>{val || 0}</p>
                    <p className="text-2xs" style={{ color: 'var(--text3)' }}>{cat.desc}</p>
                  </div>
                )
              })}
            </div>

            {/* Demandas atrasadas */}
            <div className="card-solid space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={14} style={{ color: 'var(--red)' }} />
                  <p className="section-label" style={{ color: 'var(--red)' }}>
                    Demandas atrasadas ({dados.atrasadas?.length ?? 0})
                  </p>
                </div>
                <Link href="/admin/demandas?atrasada=1" className="text-xs" style={{ color: 'var(--orange)' }}>
                  Ver todas →
                </Link>
              </div>

              {!dados.atrasadas?.length ? (
                <p className="text-sm text-center py-6" style={{ color: 'var(--text3)' }}>
                  Nenhuma demanda atrasada.
                </p>
              ) : (
                <table className="data-table">
                  <thead><tr>
                    <th>OS</th><th>Serviço</th><th>Profissional</th>
                    <th>Prazo</th><th>Atraso</th><th>Ação</th>
                  </tr></thead>
                  <tbody>
                    {dados.atrasadas.map((d: any) => {
                      const atrasoMs = d.prazo_entrega ? Date.now() - new Date(d.prazo_entrega).getTime() : 0
                      const atrasoD  = Math.ceil(atrasoMs / (1000 * 60 * 60 * 24))
                      return (
                        <tr key={d.id}>
                          <td className="mono">{d.numero || d.id?.slice(0,8)}</td>
                          <td>{d.servico?.nome || d.svc_codigo}</td>
                          <td style={{ color: 'var(--text3)' }}>{d.profissional?.usuario?.nome || '—'}</td>
                          <td className="mono text-sm" style={{ color: 'var(--red)' }}>
                            {d.prazo_entrega ? new Date(d.prazo_entrega).toLocaleDateString('pt-BR') : '—'}
                          </td>
                          <td>
                            <span className="badge badge-red">{atrasoD}d atraso</span>
                          </td>
                          <td>
                            <div className="flex gap-1">
                              <Link href={`/admin/demandas/${d.id}`} className="btn btn-secondary btn-sm text-xs">Ver</Link>
                              <Link href={`/admin/demandas/${d.id}`} className="btn btn-sm btn-sm text-xs"
                                style={{ background: 'rgba(245,166,35,0.15)', color: 'var(--gold)', border: '1px solid rgba(245,166,35,0.3)' }}>
                                Intervir
                              </Link>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Ações recomendadas */}
            {totalAlertas > 0 && (
              <div className="card space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} style={{ color: 'var(--gold)' }} />
                  <p className="section-label">Ações recomendadas</p>
                </div>
                <div className="space-y-2 text-sm" style={{ color: 'var(--text2)' }}>
                  {p.demandas_atrasadas > 0 && (
                    <div className="flex items-start gap-2">
                      <span style={{ color: 'var(--red)', flexShrink: 0 }}>1.</span>
                      <span>
                        {p.demandas_atrasadas} demanda{p.demandas_atrasadas > 1 ? 's' : ''} atrasada{p.demandas_atrasadas > 1 ? 's' : ''} —
                        notifique o profissional ou acione a prorrogação via painel de intervenção.
                      </span>
                    </div>
                  )}
                  {p.disputas_abertas > 0 && (
                    <div className="flex items-start gap-2">
                      <span style={{ color: 'var(--red)', flexShrink: 0 }}>2.</span>
                      <span>
                        {p.disputas_abertas} disputa{p.disputas_abertas > 1 ? 's' : ''} aberta{p.disputas_abertas > 1 ? 's' : ''} —
                        acione o curador para mediação. Prazo máximo: 5 dias úteis.
                      </span>
                    </div>
                  )}
                  {p.qa_reprovados > 0 && (
                    <div className="flex items-start gap-2">
                      <span style={{ color: 'var(--gold)', flexShrink: 0 }}>3.</span>
                      <span>
                        {p.qa_reprovados} QA reprovado{p.qa_reprovados > 1 ? 's' : ''} aguardando retrabalho —
                        verifique se o profissional recebeu a notificação da Verificação SUE.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </Shell>
  )
}
