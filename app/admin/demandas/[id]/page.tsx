// app/admin/demandas/[id]/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { admin } from '@/lib/api'
import { formatBRL, formatDate, statusLabel } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { AlertTriangle, User, Briefcase, Clock, FileText, History } from 'lucide-react'

const ACOES_INTERVIR = [
  { acao: 'CANCELAR',        label: 'Cancelar demanda',       variant: 'ghost' as const,  confirm: 'Cancelar esta demanda?' },
  { acao: 'PARALIZAR',       label: 'Paralisar execução',     variant: 'orange' as const, confirm: 'Paralisar a execução?' },
  { acao: 'REATIVAR',        label: 'Reativar (→ ACEITA)',    variant: 'green' as const,  confirm: 'Reativar a demanda?' },
  { acao: 'CONCLUIR_FORCADO', label: 'Concluir forçado',      variant: 'orange' as const, confirm: 'Concluir e liberar escrow ao profissional?' },
]

export default function AdminDemandaDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const id = params?.id as string

  const [demanda, setDemanda] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [motivo, setMotivo] = useState('')
  const [intervindo, setIntervindo] = useState(false)

  const carregar = () => {
    admin.demanda(id)
      .then(d => setDemanda(d.demanda))
      .catch((err: any) => toast(err.message || 'Erro ao carregar demanda', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (user.tipo !== 'ADMIN') { router.push('/admin'); return }
    if (id) carregar()
  }, [user, authLoading, router, id])

  const intervir = async (acao: string, confirmMsg: string) => {
    if (!confirm(confirmMsg)) return
    setIntervindo(true)
    try {
      await admin.intervirDemanda(id, acao, motivo.trim() || undefined)
      toast(`Ação "${acao}" executada`, 'success')
      carregar()
    } catch (err: any) {
      toast(err.message || 'Erro ao intervir', 'error')
    } finally {
      setIntervindo(false)
    }
  }

  if (authLoading || !user) return null
  if (loading) return (
    <Shell><Topbar title="Demanda" /><main className="p-6"><p style={{ color: 'var(--text3)' }}>Carregando...</p></main></Shell>
  )
  if (!demanda) return (
    <Shell><Topbar title="Demanda" /><main className="p-6"><p style={{ color: 'var(--text3)' }}>Demanda não encontrada.</p></main></Shell>
  )

  const s = statusLabel(demanda.status)
  const disputa = demanda.disputas?.[0]
  const temDisputa = demanda.status === 'EM_DISPUTA' || !!disputa

  return (
    <Shell>
      <Topbar
        title={demanda.numero || id.slice(0, 8)}
        subtitle={`${demanda.servico?.nome || demanda.svc_codigo} · ${demanda.area_m2}m² · ${demanda.cidade}/${demanda.estado}`}
        actions={<Badge variant={s.variant as any}>{s.text}</Badge>}
      />

      <main className="p-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Coluna principal ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Alerta de disputa */}
            {temDisputa && disputa && (
              <div className="card-solid" style={{ borderColor: 'var(--red)', borderWidth: 1 }}>
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} style={{ color: 'var(--red)' }} className="shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm mb-1" style={{ color: 'var(--red)' }}>
                      Disputa aberta por: {disputa.aberta_por === 'CLIENTE' ? 'Cliente' : 'Profissional'}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text2)' }}>{disputa.motivo}</p>
                    <p className="text-2xs mt-1" style={{ color: 'var(--text3)' }}>
                      {formatDate(disputa.created_at)} · Status: {disputa.status}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Partes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="card-solid">
                <div className="flex items-center gap-2 mb-3">
                  <User size={14} style={{ color: 'var(--orange)' }} />
                  <p className="section-label">Cliente</p>
                </div>
                <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                  {demanda.cliente?.usuario?.nome || '—'}
                </p>
                <p className="text-xs" style={{ color: 'var(--text3)' }}>{demanda.cliente?.usuario?.email}</p>
              </div>
              <div className="card-solid">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase size={14} style={{ color: 'var(--orange)' }} />
                  <p className="section-label">Profissional</p>
                </div>
                {demanda.profissional ? (
                  <>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                      {demanda.profissional?.usuario?.nome}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text3)' }}>{demanda.profissional?.usuario?.email}</p>
                  </>
                ) : (
                  <p className="text-sm" style={{ color: 'var(--text3)' }}>Aguardando aceite</p>
                )}
              </div>
            </div>

            {/* Dados financeiros */}
            <div className="card-solid">
              <p className="section-label mb-3">Financeiro</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Kpi label="Preço UTS" value={formatBRL(demanda.preco_servico || 0)} />
                <Kpi label="Preço final" value={formatBRL(demanda.preco_final || demanda.preco_servico || 0)} />
                <Kpi label="Total cliente" value={formatBRL(demanda.valor_total || 0)} highlight />
                <Kpi label="Líquido prof." value={formatBRL(demanda.liquido_profissional || 0)} />
              </div>
              {demanda.ajuste_pct !== 0 && (
                <p className="text-xs mt-2" style={{ color: 'var(--text3)' }}>
                  Acréscimo do profissional: {demanda.ajuste_pct > 0 ? '+' : ''}{demanda.ajuste_pct}%
                </p>
              )}
            </div>

            {/* Datas e SLA */}
            <div className="card-solid">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={14} style={{ color: 'var(--orange)' }} />
                <p className="section-label">Linha do tempo</p>
              </div>
              <div className="space-y-2 text-sm">
                <TimeRow label="Criada em" value={formatDate(demanda.created_at)} />
                {demanda.aceito_em   && <TimeRow label="Aceita em"   value={formatDate(demanda.aceito_em)} />}
                {demanda.pago_em     && <TimeRow label="Paga em"     value={formatDate(demanda.pago_em)} />}
                {demanda.iniciado_em && <TimeRow label="Iniciada em" value={formatDate(demanda.iniciado_em)} />}
                {demanda.entregue_em && <TimeRow label="Entregue em" value={formatDate(demanda.entregue_em)} />}
                {demanda.concluido_em && <TimeRow label="Concluída em" value={formatDate(demanda.concluido_em)} />}
                {demanda.prazo_entrega && (
                  <TimeRow
                    label="Prazo de entrega"
                    value={formatDate(demanda.prazo_entrega)}
                    atrasado={new Date(demanda.prazo_entrega) < new Date() && !['CONCLUIDA','CANCELADA'].includes(demanda.status)}
                  />
                )}
              </div>
            </div>

            {/* Pagamentos */}
            {demanda.pagamentos?.length > 0 && (
              <div className="card-solid">
                <p className="section-label mb-3">Pagamentos</p>
                <div className="space-y-2">
                  {demanda.pagamentos.map((p: any) => (
                    <div key={p.id} className="flex justify-between text-sm">
                      <span style={{ color: 'var(--text3)' }}>{formatDate(p.created_at)} · {p.meio || 'PIX'}</span>
                      <span className="font-mono font-semibold" style={{ color: p.status === 'APROVADO' ? 'var(--green)' : 'var(--text3)' }}>
                        {formatBRL(p.valor || 0)} · {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Histórico de eventos */}
            {demanda.historico?.length > 0 && (
              <div className="card-solid">
                <div className="flex items-center gap-2 mb-3">
                  <History size={14} style={{ color: 'var(--orange)' }} />
                  <p className="section-label">Histórico de eventos</p>
                </div>
                <div className="space-y-1.5">
                  {demanda.historico.slice(0, 10).map((h: any) => (
                    <div key={h.id} className="flex justify-between items-start text-xs gap-3">
                      <div className="flex-1">
                        <span className="font-mono" style={{ color: 'var(--orange)' }}>{h.evento}</span>
                        {h.de && <span style={{ color: 'var(--text3)' }}> {h.de} → {h.para}</span>}
                      </div>
                      <span style={{ color: 'var(--text3)' }} className="shrink-0">{formatDate(h.created_at)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Casos de curadoria */}
            {demanda.curador_casos?.length > 0 && (
              <div className="card-solid">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={14} style={{ color: 'var(--orange)' }} />
                  <p className="section-label">Curadoria</p>
                </div>
                <div className="space-y-2">
                  {demanda.curador_casos.map((c: any) => (
                    <div key={c.id} className="flex justify-between text-sm">
                      <span style={{ color: 'var(--text2)' }}>{c.tipo} · {c.status}</span>
                      <span style={{ color: 'var(--text3)' }}>{formatDate(c.created_at)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Coluna lateral: ações admin ── */}
          <div className="space-y-4">
            <Button variant="ghost" className="w-full" onClick={() => router.push('/admin/demandas')}>
              ← Todas as demandas
            </Button>

            <div className="card-solid space-y-3">
              <p className="section-label">Intervenção admin</p>
              <textarea
                className="input text-sm"
                rows={2}
                placeholder="Motivo da intervenção (opcional)"
                value={motivo}
                onChange={e => setMotivo(e.target.value)}
              />
              <div className="space-y-2">
                {ACOES_INTERVIR.map(a => (
                  <Button
                    key={a.acao}
                    variant={a.variant}
                    className="w-full text-sm"
                    disabled={intervindo}
                    onClick={() => intervir(a.acao, a.confirm)}
                  >
                    {a.label}
                  </Button>
                ))}
              </div>
              <p className="text-2xs" style={{ color: 'var(--text3)' }}>
                Ações irreversíveis — registradas no histórico da demanda.
              </p>
            </div>

            <div className="card-solid space-y-2">
              <p className="section-label">Ferramentas de teste</p>
              <Button
                variant="ghost"
                className="w-full text-sm"
                disabled={intervindo}
                onClick={async () => {
                  setIntervindo(true)
                  try {
                    await admin.teste.marcarPaga(id)
                    toast('Demanda marcada como paga (mock)', 'success')
                    carregar()
                  } catch (err: any) { toast(err.message, 'error') }
                  finally { setIntervindo(false) }
                }}
              >
                🎭 Simular pagamento PIX
              </Button>
            </div>
          </div>
        </div>
      </main>
    </Shell>
  )
}

function Kpi({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
      <p className="text-2xs mb-1" style={{ color: 'var(--text3)' }}>{label}</p>
      <p className="font-bold font-mono text-sm" style={{ color: highlight ? 'var(--orange)' : 'var(--text)' }}>{value}</p>
    </div>
  )
}

function TimeRow({ label, value, atrasado }: { label: string; value: string; atrasado?: boolean }) {
  return (
    <div className="flex justify-between">
      <span style={{ color: 'var(--text3)' }}>{label}</span>
      <span className="font-mono text-xs" style={{ color: atrasado ? 'var(--red)' : 'var(--text2)' }}>
        {atrasado ? '⚠ ' : ''}{value}
      </span>
    </div>
  )
}
