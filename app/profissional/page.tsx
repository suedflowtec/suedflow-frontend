'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { orders, auth as authApi } from '@/lib/api'
import { formatBRL, statusLabel } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { Radar, Wallet, Star, CreditCard } from 'lucide-react'

const STATUS_BADGE: Record<string, string> = {
  AGUARDANDO: 'badge badge-yellow', PAGA: 'badge badge-blue',
  ACEITA: 'badge badge-indigo', EM_EXECUCAO: 'badge badge-purple',
  AGUARDANDO_QA: 'badge badge-orange', QA_REPROVADO: 'badge badge-red',
  AGUARDANDO_CONFIRMACAO: 'badge badge-teal', CONCLUIDA: 'badge badge-green',
  CANCELADA: 'badge badge-gray', EM_DISPUTA: 'badge badge-red',
}

export default function ProfissionalHome() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [demandas, setDemandas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (!user.profissional) { router.push('/cliente'); return }
    orders.listarMinhas('profissional')
      .then((d: any) => setDemandas(Array.isArray(d) ? d : (d?.demandas || [])))
      .catch(() => toast('Erro ao carregar demandas', 'error'))
      .finally(() => setLoading(false))
  }, [user, authLoading, router, toast])

  if (authLoading || !user) return null

  const ativas    = demandas.filter(d => !['CONCLUIDA','CANCELADA'].includes(d.status))
  const concluidas = demandas.filter(d => d.status === 'CONCLUIDA')
  const receita   = concluidas.reduce((s, d) => s + (d.liquido_profissional || 0), 0)
  const prof      = user.profissional || {}

  return (
    <Shell>
      <Topbar
        title={`Olá, ${user.nome?.includes('@') ? (user.username || 'você') : (user.nome?.split(' ')[0] || 'você')} 👋`}
        subtitle={prof.nivel ? `${prof.nivel} · ${prof.plano || 'GRATIS'}` : undefined}
        actions={
          <Link href="/profissional/feed" className="btn btn-primary btn-sm">
            Ver feed de demandas
          </Link>
        }
      />
      <main className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <div className="kpi-card">
            <p className="kpi-value" style={{ color: 'var(--orange)' }}>{ativas.length}</p>
            <p className="kpi-label">Em andamento</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-value">{concluidas.length}</p>
            <p className="kpi-label">Concluídas</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-value" style={{ color: 'var(--green)' }}>{formatBRL(prof.saldo_disponivel || 0)}</p>
            <p className="kpi-label">Saldo disponível</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-value">{prof.score || 0}</p>
            <p className="kpi-label">Score SQP</p>
          </div>
        </div>

        {/* Demandas em andamento */}
        <div className="card-solid">
          <div className="flex items-center justify-between mb-4">
            <p className="section-label">Demandas em andamento</p>
            <Link href="/profissional/demandas" className="text-xs font-semibold" style={{ color: 'var(--orange)' }}>
              Ver todas →
            </Link>
          </div>
          {loading ? (
            <p className="text-sm py-6 text-center" style={{ color: 'var(--text3)' }}>Carregando...</p>
          ) : ativas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm mb-3" style={{ color: 'var(--text3)' }}>Nenhuma demanda em andamento</p>
              <Link href="/profissional/feed" className="btn btn-primary btn-sm">Ver feed de demandas</Link>
            </div>
          ) : (
            <table className="data-table">
              <thead><tr>
                <th>OS</th><th>Serviço</th><th>Status</th><th>Prazo</th>
                <th className="text-right">Valor líquido</th>
              </tr></thead>
              <tbody>
                {ativas.slice(0,8).map(d => (
                  <tr key={d.id} onClick={() => router.push(`/profissional/demandas/${d.id}`)}>
                    <td className="mono">{d.numero || d.id?.slice(0,8)}</td>
                    <td className="bold">{d.svc_nome || d.svc_codigo}</td>
                    <td><span className={STATUS_BADGE[d.status] || 'badge badge-gray'}>{statusLabel(d.status).text}</span></td>
                    <td style={{ color: 'var(--text3)' }}>{d.prazo_entrega ? new Date(d.prazo_entrega).toLocaleDateString('pt-BR') : '—'}</td>
                    <td className="text-right font-mono font-bold" style={{ color: 'var(--green)' }}>
                      {formatBRL(d.liquido_profissional || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Atalhos rápidos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {([
            { href: '/profissional/feed',      Icon: Radar,       label: 'Feed de demandas', desc: 'Ver demandas disponíveis' },
            { href: '/profissional/financeiro', Icon: Wallet,      label: 'Financeiro',        desc: 'Saldo e saques PIX' },
            { href: '/profissional/score',      Icon: Star,        label: 'Score SQP',         desc: 'Minha reputação' },
            { href: '/profissional/planos',     Icon: CreditCard,  label: 'Meu plano',         desc: `${prof.plano || 'GRATIS'} · ver opções` },
          ] as const).map(item => (
            <Link key={item.href} href={item.href} className="card-solid block"
              style={{ borderColor: 'rgba(255,255,255,0.07)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(232,103,26,0.4)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
            >
              <div className="mb-2" style={{ color: 'var(--orange)' }}>
                <item.Icon size={22} strokeWidth={1.5} />
              </div>
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{item.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </Shell>
  )
}
