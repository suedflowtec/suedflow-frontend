// app/admin/page.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { Badge } from '@/components/ui/Badge'
import { admin } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { formatBRL } from '@/lib/utils'

export default function AdminDashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
          <div className="text-center py-10 text-sm text-ink-muted">Carregando dashboard...</div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-4 gap-4">
              <div className="kpi-card">
                <p className="kpi-value">{stats.demandas_hoje ?? 0}</p>
                <p className="kpi-label">Demandas hoje</p>
                {stats.trend_demandas_hoje && <p className="text-2xs text-green-700 mt-1">▲ {stats.trend_demandas_hoje}</p>}
              </div>
              <div className="kpi-card">
                <p className="kpi-value">{stats.em_execucao ?? 0}</p>
                <p className="kpi-label">Em execução</p>
              </div>
              <div className="kpi-card">
                <p className="kpi-value">{formatBRL(stats.receita_mes ?? 0)}</p>
                <p className="kpi-label">Receita do mês</p>
                {stats.trend_receita && <p className="text-2xs text-green-700 mt-1">▲ {stats.trend_receita}</p>}
              </div>
              <div className="kpi-card">
                <p className="kpi-value">{stats.sqp_medio ?? 0}</p>
                <p className="kpi-label">SQP médio · {stats.profissionais_ativos ?? 0} prof.</p>
              </div>
            </div>

            {/* Atalhos admin */}
            <div className="card p-4">
              <h2 className="text-sm font-semibold text-navy mb-3">Acesso rápido</h2>
              <div className="grid grid-cols-4 gap-2">
                <AdminLink href="/admin/demandas" icon="📋" label="Demandas" />
                <AdminLink href="/admin/profissionais" icon="👷" label="Profissionais" />
                <AdminLink href="/admin/teste" icon="🧪" label="Ferramentas teste" highlight />
                <AdminLink href="/admin/precos" icon="💰" label="Preços (UTS)" />
              </div>
            </div>

            {/* Demandas requerendo atenção */}
            {data?.demandas_atencao?.length > 0 && (
              <div className="card p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-sm font-semibold text-navy">Atenção</h2>
                  <Badge variant="red">{data.demandas_atencao.length}</Badge>
                </div>
                <div className="space-y-2">
                  {data.demandas_atencao.slice(0, 3).map((d: any) => (
                    <Link key={d.id} href={`/admin/demandas/${d.id}`} className="flex justify-between items-center py-2 border-b border-surface-border last:border-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-navy truncate">{d.numero || d.id?.slice(0,8)}</p>
                        <p className="text-2xs text-ink-muted">{d.motivo_atencao || d.svc_codigo}</p>
                      </div>
                      <span className="text-orange">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* KYC pendentes */}
            {data?.kyc_pendentes?.length > 0 && (
              <div className="card p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-sm font-semibold text-navy">KYC pendentes</h2>
                  <Badge variant="orange">{data.kyc_pendentes.length}</Badge>
                </div>
                <Link href="/admin/profissionais" className="text-xs text-orange font-semibold hover:underline">
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

function AdminLink({ href, icon, label, highlight }: { href: string; icon: string; label: string; highlight?: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded p-3 flex flex-col items-center gap-1 text-center border transition-colors ${
        highlight ? 'bg-orange-50 border-orange-200 hover:bg-orange-100' : 'bg-surface border-surface-border hover:bg-surface-hover'
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-semibold text-ink-secondary">{label}</span>
    </Link>
  )
}
