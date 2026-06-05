// app/admin/page.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppShell, StatusBar } from '@/components/layout/AppShell'
import { Badge } from '@/components/ui/Badge'
import { admin } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { formatBRL } from '@/lib/utils'

export default function AdminDashboard() {
  const router = useRouter()
  const { user, loading: authLoading, logout } = useAuth()
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
    <AppShell>
      <StatusBar />

      <div className="px-5 pt-4 pb-4 flex justify-between items-center">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-orange font-bold">SUEDFLOW Admin</p>
          <h1 className="text-xl font-extrabold">Painel</h1>
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant="green">● Sistema OK</Badge>
          <button onClick={logout} className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--glass)', border: '1px solid var(--border)' }}>
            {user.nome.charAt(0)}
          </button>
        </div>
      </div>

      <div className="px-5 pb-12 space-y-4">
        {/* KPIs */}
        {loading ? (
          <div className="text-center py-8 text-white/50">Carregando dashboard...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <KpiCard label="Demandas hoje" value={stats.demandas_hoje ?? 0} trend={stats.trend_demandas_hoje} />
              <KpiCard label="Em execução" value={stats.em_execucao ?? 0} subtitle="distribuídas" />
              <KpiCard label="Receita do mês" value={formatBRL(stats.receita_mes ?? 0)} trend={stats.trend_receita} />
              <KpiCard label="SQP médio" value={stats.sqp_medio ?? 0} subtitle={`${stats.profissionais_ativos ?? 0} profissionais`} />
            </div>

            {/* Atalhos admin */}
            <div className="glass-card">
              <p className="text-[11px] uppercase tracking-wider font-bold text-white/65 mb-3">Acesso rápido</p>
              <div className="grid grid-cols-2 gap-2">
                <AdminLink href="/admin/demandas" icon="📋" label="Demandas" />
                <AdminLink href="/admin/profissionais" icon="👷" label="Profissionais" />
                <AdminLink href="/admin/teste" icon="🧪" label="Ferramentas teste" highlight />
                <AdminLink href="/admin/precos" icon="💰" label="Preços (UTS)" />
              </div>
            </div>

            {/* Demandas requerendo atenção */}
            {data?.demandas_atencao?.length > 0 && (
              <div className="glass-card">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-[11px] uppercase tracking-wider font-bold text-white/65">Atenção</p>
                  <Badge variant="red">{data.demandas_atencao.length}</Badge>
                </div>
                <div className="space-y-2">
                  {data.demandas_atencao.slice(0, 3).map((d: any) => (
                    <Link key={d.id} href={`/admin/demandas/${d.id}`} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold truncate">{d.numero || d.id?.slice(0,8)}</p>
                        <p className="text-[11px] text-white/60">{d.motivo_atencao || d.svc_codigo}</p>
                      </div>
                      <span className="text-orange">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* KYC pendentes */}
            {data?.kyc_pendentes?.length > 0 && (
              <div className="glass-card">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-[11px] uppercase tracking-wider font-bold text-white/65">KYC pendentes</p>
                  <Badge variant="orange">{data.kyc_pendentes.length}</Badge>
                </div>
                <Link href="/admin/profissionais" className="text-xs text-orange font-bold">
                  Ver todos →
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  )
}

function KpiCard({ label, value, trend, subtitle }: { label: string; value: any; trend?: string; subtitle?: string }) {
  return (
    <div className="glass-card !p-4">
      <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold">{label}</p>
      <p className="text-2xl font-black mt-1">{value}</p>
      {trend && <p className="text-[11px] text-green mt-1">▲ {trend}</p>}
      {subtitle && <p className="text-[11px] text-white/50 mt-1">{subtitle}</p>}
    </div>
  )
}

function AdminLink({ href, icon, label, highlight }: { href: string; icon: string; label: string; highlight?: boolean }) {
  return (
    <Link
      href={href}
      className="rounded-xl p-3 flex flex-col items-center gap-1 text-center transition-transform hover:scale-105"
      style={{
        background: highlight ? 'linear-gradient(135deg, rgba(232,103,26,0.15), rgba(255,122,46,0.05))' : 'var(--glass)',
        border: `1px solid ${highlight ? 'rgba(232,103,26,0.3)' : 'var(--border)'}`,
      }}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-bold">{label}</span>
    </Link>
  )
}
