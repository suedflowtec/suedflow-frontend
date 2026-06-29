// app/admin/page.tsx — Centro de Controle SUEDFLOW v2
'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { admin } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { formatBRL } from '@/lib/utils'
import {
  Eye, EyeOff, TrendingUp, AlertTriangle, CheckCircle2,
  ClipboardList, Users, Settings, SlidersHorizontal,
  FlaskConical, Database, Shield, Activity, RefreshCw,
  ShieldAlert, GraduationCap,
} from 'lucide-react'

// ── Componente: KPI de Pulso ─────────────────────────────────
function PulsoCard({ label, value, cor, sub }: { label: string; value: number; cor: string; sub?: string }) {
  const isAlert = cor === 'var(--red)' && value > 0
  return (
    <div className="rounded-xl p-3 flex flex-col gap-1 border"
      style={{
        background: isAlert ? `rgba(255,77,109,0.08)` : 'var(--glass)',
        borderColor: isAlert ? `rgba(255,77,109,0.35)` : 'var(--border)',
        borderLeft: `3px solid ${cor}`,
      }}>
      <p className="text-2xl font-black font-mono leading-none" style={{ color: cor }}>{value}</p>
      <p className="text-2xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text3)' }}>{label}</p>
      {sub && <p className="text-2xs" style={{ color: 'var(--text3)' }}>{sub}</p>}
    </div>
  )
}

// ── Componente: Grupo temático ────────────────────────────────
function Grupo({ titulo, cor, children }: { titulo: string; cor: string; children: React.ReactNode }) {
  return (
    <div className="card-solid" style={{ borderLeft: `3px solid ${cor}`, paddingLeft: 16 }}>
      <p className="section-label mb-3 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cor }} />
        {titulo}
      </p>
      {children}
    </div>
  )
}

// ── Componente: Passo do funil ────────────────────────────────
function FunilPasso({ label, value, total, ultimo }: { label: string; value: number; total: number; ultimo?: boolean }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="flex-1 flex flex-col items-center gap-1 text-center">
      <div className="w-full rounded-lg py-2.5 px-1" style={{ background: 'var(--glass)', border: '1px solid var(--border)' }}>
        <p className="text-xl font-black font-mono" style={{ color: 'var(--text)' }}>{value}</p>
        <p className="text-2xs font-semibold" style={{ color: 'var(--text3)' }}>{label}</p>
      </div>
      {!ultimo && (
        <div className="flex items-center gap-1 text-2xs font-mono" style={{ color: pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--gold)' : 'var(--red)' }}>
          {pct}% →
        </div>
      )}
    </div>
  )
}

// ── Componente: Atalho ────────────────────────────────────────
function Atalho({ href, Icon, label, badge, badgeCor }: { href: string; Icon: any; label: string; badge?: number; badgeCor?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all" style={{
      background: 'var(--glass)', border: '1px solid var(--border)', textDecoration: 'none',
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(232,103,26,0.4)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <Icon size={14} style={{ color: 'var(--orange)', flexShrink: 0 }} />
      <span className="text-xs font-semibold" style={{ color: 'var(--text2)' }}>{label}</span>
      {badge != null && badge > 0 && (
        <span className="ml-auto text-xs font-bold rounded-full px-1.5 py-0.5"
          style={{ background: badgeCor || 'var(--orange)', color: '#fff', fontSize: 9 }}>{badge}</span>
      )}
    </Link>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [financeiro, setFinanceiro] = useState(false)
  const [atualizando, setAtualizando] = useState(false)

  const carregar = () => {
    setAtualizando(true)
    admin.dashboard()
      .then(setData)
      .catch(() => toast('Erro ao carregar dashboard', 'error'))
      .finally(() => { setLoading(false); setAtualizando(false) })
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (!['ADMIN', 'MODERADOR'].includes(user.tipo)) { router.push('/cliente'); return }
    carregar()
    // Auto-refresh a cada 5 min
    const t = setInterval(carregar, 5 * 60 * 1000)
    return () => clearInterval(t)
  }, [user, authLoading])

  if (authLoading || !user) return null

  const p = data?.pulso || {}
  const f = data?.financeiro || {}
  const funil = data?.funil || {}
  const q = data?.qualidade || {}
  const atencao = data?.demandas_atencao || []

  // Saúde geral
  const semAlertas = p.demandas_atrasadas === 0 && p.disputas_abertas === 0 && p.qa_reprovados === 0
  const alertasMedio = p.demandas_atrasadas <= 2 && p.disputas_abertas <= 1

  return (
    <Shell>
      <Topbar
        title="Centro de Controle"
        subtitle={`SUEDFLOW · ${new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}`}
        actions={
          <div className="flex items-center gap-2">
            <span className="badge" style={{ background: semAlertas ? 'rgba(0,214,143,0.15)' : alertasMedio ? 'rgba(245,166,35,0.15)' : 'rgba(255,77,109,0.15)', color: semAlertas ? 'var(--green)' : alertasMedio ? 'var(--gold)' : 'var(--red)', border: `1px solid ${semAlertas ? 'rgba(0,214,143,0.3)' : alertasMedio ? 'rgba(245,166,35,0.3)' : 'rgba(255,77,109,0.3)'}` }}>
              {semAlertas ? '● Sistema saudável' : alertasMedio ? '◐ Atenção' : '● Requer ação'}
            </span>
            <button onClick={carregar} disabled={atualizando} className="btn btn-secondary btn-sm flex items-center gap-1">
              <RefreshCw size={12} className={atualizando ? 'animate-spin' : ''} />
              Atualizar
            </button>
          </div>
        }
      />

      <main className="p-6 space-y-4 max-w-6xl">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="kpi-card animate-pulse" style={{ height: 72 }} />
            ))}
          </div>
        ) : (
          <>
            {/* ── PULSO: vitals da plataforma ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <PulsoCard label="Demandas hoje" value={p.demandas_hoje ?? 0} cor="var(--orange)" />
              <PulsoCard label="Em execução" value={p.em_execucao ?? 0} cor="var(--blue)" />
              <PulsoCard label="Aguardando QA" value={p.qa_pendente ?? 0} cor={p.qa_pendente > 3 ? 'var(--gold)' : 'var(--text3)'} />
              <PulsoCard label="KYC pendentes" value={p.kyc_pendente ?? 0} cor={p.kyc_pendente > 0 ? 'var(--purple)' : 'var(--text3)'} />
              <PulsoCard label="Disputas abertas" value={p.disputas_abertas ?? 0} cor={p.disputas_abertas > 0 ? 'var(--red)' : 'var(--text3)'} />
              <PulsoCard label="Atrasadas" value={p.demandas_atrasadas ?? 0} cor={p.demandas_atrasadas > 0 ? 'var(--red)' : 'var(--text3)'} />
            </div>

            {/* ── GRADE PRINCIPAL ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Coluna central + esquerda (2/3) */}
              <div className="lg:col-span-2 space-y-4">

                {/* Financeiro */}
                <Grupo titulo="Financeiro · mês atual" cor="var(--green)">
                  <div className="flex items-center justify-between mb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black font-mono" style={{ color: 'var(--green)' }}>
                          {financeiro ? formatBRL(f.gmv_mes ?? 0) : '••••••'}
                        </span>
                        <span className="text-xs font-semibold" style={{ color: 'var(--text3)' }}>GMV</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold font-mono" style={{ color: 'var(--text2)' }}>
                          {financeiro ? formatBRL(f.receita_mes ?? 0) : '••••'}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text3)' }}>receita líquida SUEDFLOW</span>
                      </div>
                    </div>
                    <button onClick={() => setFinanceiro(v => !v)} className="btn btn-ghost btn-sm" title="Mostrar/ocultar valores">
                      {financeiro ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg p-2.5 text-center" style={{ background: 'rgba(155,109,255,0.08)', border: '1px solid rgba(155,109,255,0.2)' }}>
                      <p className="text-sm font-bold font-mono" style={{ color: 'var(--purple)' }}>
                        {financeiro ? formatBRL(f.mrr_pro ?? 0) : '••••'}
                      </p>
                      <p className="text-2xs mt-0.5" style={{ color: 'var(--text3)' }}>MRR PRO ({f.prof_pro ?? 0})</p>
                    </div>
                    <div className="rounded-lg p-2.5 text-center" style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)' }}>
                      <p className="text-sm font-bold font-mono" style={{ color: 'var(--gold)' }}>
                        {financeiro ? formatBRL(f.mrr_elite ?? 0) : '••••'}
                      </p>
                      <p className="text-2xs mt-0.5" style={{ color: 'var(--text3)' }}>MRR ELITE ({f.prof_elite ?? 0})</p>
                    </div>
                    <div className="rounded-lg p-2.5 text-center" style={{ background: 'rgba(0,214,143,0.08)', border: '1px solid rgba(0,214,143,0.2)' }}>
                      <p className="text-sm font-bold font-mono" style={{ color: 'var(--green)' }}>
                        {financeiro ? formatBRL(f.mrr_total ?? 0) : '••••'}
                      </p>
                      <p className="text-2xs mt-0.5" style={{ color: 'var(--text3)' }}>MRR total</p>
                    </div>
                  </div>
                </Grupo>

                {/* Funil operacional */}
                <Grupo titulo="Funil · operações do mês" cor="var(--blue)">
                  <div className="flex items-end gap-1">
                    <FunilPasso label="Criadas" value={funil.criadas ?? 0} total={funil.criadas ?? 1} />
                    <FunilPasso label="Aceitas" value={funil.aceitas ?? 0} total={funil.criadas ?? 1} />
                    <FunilPasso label="Pagas" value={funil.pagas ?? 0} total={funil.criadas ?? 1} />
                    <FunilPasso label="Concluídas" value={funil.concluidas ?? 0} total={funil.criadas ?? 1} ultimo />
                  </div>
                  {funil.criadas > 0 && (
                    <p className="text-2xs mt-2 text-center" style={{ color: 'var(--text3)' }}>
                      Taxa geral de conclusão: {Math.round((funil.concluidas / funil.criadas) * 100)}%
                    </p>
                  )}
                </Grupo>

                {/* Qualidade */}
                <Grupo titulo="Qualidade" cor={q.qa_1_ciclo_pct >= 80 ? 'var(--green)' : q.qa_1_ciclo_pct >= 60 ? 'var(--gold)' : 'var(--red)'}>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-2xl font-black font-mono" style={{ color: 'var(--orange)' }}>{q.sqp_medio ?? 0}</p>
                      <p className="text-2xs mt-0.5" style={{ color: 'var(--text3)' }}>SQP médio</p>
                      <p className="text-2xs" style={{ color: 'var(--text3)' }}>{q.profissionais_ativos ?? 0} prof. ativos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black font-mono" style={{ color: q.qa_1_ciclo_pct >= 80 ? 'var(--green)' : q.qa_1_ciclo_pct >= 60 ? 'var(--gold)' : 'var(--red)' }}>
                        {q.qa_1_ciclo_pct ?? 100}%
                      </p>
                      <p className="text-2xs mt-0.5" style={{ color: 'var(--text3)' }}>QA 1º ciclo</p>
                      <p className="text-2xs" style={{ color: 'var(--text3)' }}>aprovados sem retrabalho</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black font-mono" style={{ color: 'var(--text2)' }}>{q.total_clientes ?? 0}</p>
                      <p className="text-2xs mt-0.5" style={{ color: 'var(--text3)' }}>Clientes</p>
                      <p className="text-2xs" style={{ color: 'var(--text3)' }}>{q.total_profissionais ?? 0} profissionais</p>
                    </div>
                  </div>
                </Grupo>

              </div>

              {/* Coluna direita (1/3) */}
              <div className="space-y-4">

                {/* Alertas */}
                <Grupo titulo="Alertas ativos" cor={atencao.length === 0 ? 'var(--green)' : 'var(--red)'}>
                  {atencao.length === 0 ? (
                    <div className="flex items-center gap-2 py-2">
                      <CheckCircle2 size={14} style={{ color: 'var(--green)' }} />
                      <p className="text-xs" style={{ color: 'var(--text3)' }}>Sem itens críticos</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {atencao.slice(0, 5).map((d: any) => (
                        <Link key={d.id} href={`/admin/demandas/${d.id}`}
                          className="flex items-center justify-between py-1.5 px-2 rounded-lg transition-colors"
                          style={{ background: 'var(--glass)', textDecoration: 'none' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--glass2)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'var(--glass)')}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-white truncate">{d.numero || d.id?.slice(0,8)}</p>
                            <p className="text-2xs" style={{ color: 'var(--text3)' }}>{d.motivo_atencao}</p>
                          </div>
                          <span className="text-2xs ml-2 badge" style={{
                            background: d.motivo_atencao === 'Disputa aberta' ? 'rgba(255,77,109,0.15)' : 'rgba(245,166,35,0.15)',
                            color: d.motivo_atencao === 'Disputa aberta' ? 'var(--red)' : 'var(--gold)',
                          }}>
                            {d.svc_codigo}
                          </span>
                        </Link>
                      ))}
                      {atencao.length > 5 && (
                        <Link href="/admin/demandas?atrasada=1" className="text-2xs text-center block py-1" style={{ color: 'var(--orange)' }}>
                          +{atencao.length - 5} mais →
                        </Link>
                      )}
                    </div>
                  )}
                </Grupo>

                {/* Atalhos */}
                <div className="card-solid space-y-1.5">
                  <p className="section-label mb-2">Acesso rápido</p>
                  <Atalho href="/admin/demandas" Icon={ClipboardList} label="Demandas" />
                  <Atalho href="/admin/profissionais" Icon={Users} label="Profissionais" badge={p.kyc_pendente} badgeCor="var(--purple)" />
                  <Atalho href="/admin/riscos" Icon={ShieldAlert} label="Monitoramento de Riscos" badge={p.demandas_atrasadas} badgeCor="var(--red)" />
                  <Atalho href="/admin/qa" Icon={Activity} label="Fila QA" badge={p.qa_pendente} badgeCor="var(--gold)" />
                  <Atalho href="/admin/banco-estrategico" Icon={Database} label="Banco Estratégico" />
                  <Atalho href="/admin/precos" Icon={Settings} label="Motor UTS" />
                  <Atalho href="/admin/parametros" Icon={SlidersHorizontal} label="Parâmetros" />
                  <Atalho href="/curador/escola" Icon={GraduationCap} label="Projeto Escola" />
                  <Atalho href="/admin/teste" Icon={FlaskConical} label="Ferramentas" />
                </div>

              </div>
            </div>
          </>
        )}
      </main>
    </Shell>
  )
}
