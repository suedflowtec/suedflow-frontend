// app/admin/page.tsx
'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { Badge } from '@/components/ui/Badge'
import { admin } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { formatBRL } from '@/lib/utils'
import { ClipboardList, Users, Settings, SlidersHorizontal, FlaskConical, Eye, EyeOff } from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [receitaVisivel, setReceitaVisivel] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (user.tipo !== 'ADMIN') { router.push('/cliente'); return }
    admin.dashboard()
      .then(setData)
      .catch(() => toast('Erro ao carregar dashboard', 'error'))
      .finally(() => setLoading(false))
  }, [user, authLoading, router, toast])

  if (authLoading || !user) return null

  const stats = data?.kpis || {}

  return (
    <Shell>
      <Topbar title="Painel" actions={<Badge variant="green">● Sistema OK</Badge>} />

      <main className="p-6 space-y-6">
        {loading ? (
          <div className="text-center py-10 text-sm" style={{ color: 'var(--text3)' }}>Carregando dashboard...</div>
        ) : (
          <>
            {/* KPIs — grid responsivo 2 colunas mobile, 4 desktop */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="kpi-card">
                <p className="kpi-value">{stats.demandas_hoje ?? 0}</p>
                <p className="kpi-label">Demandas hoje</p>
                {stats.trend_demandas_hoje && <p className="text-2xs mt-1" style={{ color: 'var(--green)' }}>▲ {stats.trend_demandas_hoje}</p>}
              </div>
              <div className="kpi-card">
                <p className="kpi-value">{stats.em_execucao ?? 0}</p>
                <p className="kpi-label">Em execução</p>
              </div>
              {/* Receita com toggle de visibilidade */}
              <div className="kpi-card" style={{ position: 'relative' }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="kpi-value truncate" style={{ fontSize: receitaVisivel ? undefined : '1.5rem' }}>
                      {receitaVisivel ? formatBRL(stats.receita_mes ?? 0) : '••••••'}
                    </p>
                    <p className="kpi-label">Receita do mês</p>
                    {receitaVisivel && stats.trend_receita && (
                      <p className="text-2xs mt-1" style={{ color: 'var(--green)' }}>▲ {stats.trend_receita}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setReceitaVisivel(v => !v)}
                    className="shrink-0 ml-1 mt-0.5 p-1 rounded transition-opacity hover:opacity-80"
                    style={{ color: 'var(--text3)' }}
                    title={receitaVisivel ? 'Ocultar receita' : 'Mostrar receita'}
                  >
                    {receitaVisivel ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
              <div className="kpi-card">
                <p className="kpi-value">{stats.sqp_medio ?? 0}</p>
                <p className="kpi-label">SQP médio · {stats.profissionais_ativos ?? 0} prof.</p>
              </div>
            </div>

            {/* Atalhos admin — ícones Lucide, sem emojis */}
            <div className="card p-4">
              <h2 className="text-sm font-semibold text-white mb-3">Acesso rápido</h2>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                <AdminLink href="/admin/demandas"      Icon={ClipboardList}   label="Demandas" />
                <AdminLink href="/admin/profissionais"  Icon={Users}           label="Profissionais" />
                <AdminLink href="/admin/precos"         Icon={Settings}        label="Motor UTS" />
                <AdminLink href="/admin/parametros"     Icon={SlidersHorizontal} label="Parâmetros" />
                <AdminLink href="/admin/teste"          Icon={FlaskConical}    label="Ferramentas" highlight />
              </div>
            </div>

            {/* Demandas requerendo atenção */}
            {data?.demandas_atencao?.length > 0 && (
              <div className="card p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-sm font-semibold text-white">Atenção</h2>
                  <Badge variant="red">{data.demandas_atencao.length}</Badge>
                </div>
                <div className="space-y-2">
                  {data.demandas_atencao.slice(0, 3).map((d: any) => (
                    <Link key={d.id} href={`/admin/demandas/${d.id}`} className="flex justify-between items-center py-2 border-b last:border-0" style={{ borderColor: 'rgba(255,255,255,0.08)', textDecoration: 'none' }}>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">{d.numero || d.id?.slice(0,8)}</p>
                        <p className="text-2xs" style={{ color: 'var(--text3)' }}>{d.motivo_atencao || d.svc_codigo}</p>
                      </div>
                      <span style={{ color: 'var(--orange)' }}>→</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* KYC pendentes */}
            {data?.kyc_pendentes?.length > 0 && (
              <div className="card p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-sm font-semibold text-white">KYC pendentes</h2>
                  <Badge variant="orange">{data.kyc_pendentes.length}</Badge>
                </div>
                <Link href="/admin/profissionais" className="text-xs font-semibold hover:underline" style={{ color: 'var(--orange)' }}>
                  Ver todos →
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </Shell>
  )
}

function AdminLink({ href, Icon, label, highlight }: { href: string; Icon: React.FC<any>; label: string; highlight?: boolean }) {
  return (
    <Link
      href={href}
      className="rounded-xl p-3 flex flex-col items-center gap-2 text-center border transition-all hover:opacity-90"
      style={{
        background:     highlight ? 'rgba(232,103,26,0.12)' : 'rgba(255,255,255,0.04)',
        borderColor:    highlight ? 'rgba(232,103,26,0.35)' : 'rgba(255,255,255,0.08)',
        textDecoration: 'none',
      }}
    >
      <Icon size={20} style={{ color: highlight ? 'var(--orange)' : 'var(--text2)' }} />
      <span className="text-xs font-semibold leading-tight" style={{ color: 'var(--text2)' }}>{label}</span>
    </Link>
  )
}
