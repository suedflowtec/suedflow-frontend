// app/cliente/demandas/[id]/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/ui/StarRating'
import { orders } from '@/lib/api'
import { formatBRL, statusLabel, formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'

const NOTAS_INICIAIS = {
  nota_geral: 0,
  qualidade_tecnica: 0,
  pontualidade: 0,
  comunicacao: 0,
  completude: 0,
}

const FSM_STEPS = [
  { status: 'AGUARDANDO',           label: 'Visível para profissionais' },
  { status: 'ACEITA',               label: 'Aceita · aguardando pagamento' },
  { status: 'PAGA',                 label: 'Pagamento confirmado' },
  { status: 'EM_EXECUCAO',          label: 'Em execução' },
  { status: 'AGUARDANDO_QA',        label: 'Em revisão SUE' },
  { status: 'AGUARDANDO_CONFIRMACAO', label: 'Aguardando sua confirmação' },
  { status: 'CONCLUIDA',            label: 'Concluída' },
]

function formatHMS(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':')
}

function formatEvento(h: any): string {
  if (h.evento === 'STATUS_CHANGED' && h.para) {
    return `Status alterado para "${statusLabel(h.para).text}"`
  }
  if (h.evento) return h.evento.replace(/_/g, ' ')
  return 'Evento registrado'
}

export default function DemandaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [demanda, setDemanda] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [avaliando, setAvaliando] = useState(false)
  const [notas, setNotas] = useState(NOTAS_INICIAIS)
  const [comentario, setComentario] = useState('')
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false)
  const [disputaAberta, setDisputaAberta] = useState(false)
  const [motivoDisputa, setMotivoDisputa] = useState('')
  const [enviandoDisputa, setEnviandoDisputa] = useState(false)
  const [agora, setAgora] = useState(() => Date.now())
  const [cancelando, setCancelando] = useState(false)
  const [motivoCancelamento, setMotivoCancelamento] = useState('')
  const [enviandoCancelamento, setEnviandoCancelamento] = useState(false)

  const id = params?.id as string

  useEffect(() => {
    if (!id) return
    orders.buscar(id)
      .then(setDemanda)
      .catch(() => toast('Erro ao carregar demanda', 'error'))
      .finally(() => setLoading(false))
  }, [id, toast])

  useEffect(() => {
    if (!demanda || demanda.status !== 'AGUARDANDO') return
    const t = setInterval(() => setAgora(Date.now()), 1000)
    return () => clearInterval(t)
  }, [demanda])

  const cancelarDemanda = async () => {
    if (motivoCancelamento.trim().length < 5) {
      toast('Descreva o motivo com pelo menos 5 caracteres', 'error')
      return
    }
    setEnviandoCancelamento(true)
    try {
      await orders.cancelar(id, motivoCancelamento.trim())
      toast('Demanda cancelada', 'success')
      const updated = await orders.buscar(id)
      setDemanda(updated)
      setCancelando(false)
      setMotivoCancelamento('')
    } catch (err: any) {
      toast(err.message || 'Erro ao cancelar demanda', 'error')
    } finally {
      setEnviandoCancelamento(false)
    }
  }

  const confirmarComAvaliacao = async () => {
    if (Object.values(notas).some(n => n === 0)) {
      toast('Avalie todos os critérios antes de confirmar', 'error')
      return
    }
    setEnviandoAvaliacao(true)
    try {
      await orders.avaliar(id, { ...notas, comentario: comentario.trim() || undefined })
      await orders.confirmarEntrega(id)
      toast('Entrega confirmada · obrigado pela avaliação!', 'success')
      const updated = await orders.buscar(id)
      setDemanda(updated)
      setAvaliando(false)
    } catch {
      toast('Erro ao confirmar entrega', 'error')
    } finally {
      setEnviandoAvaliacao(false)
    }
  }

  const enviarDisputa = async () => {
    if (motivoDisputa.trim().length < 10) {
      toast('Descreva o motivo com pelo menos 10 caracteres', 'error')
      return
    }
    setEnviandoDisputa(true)
    try {
      await orders.abrirDisputa(id, motivoDisputa.trim())
      toast('Disputa aberta · um curador irá analisar', 'success')
      const updated = await orders.buscar(id)
      setDemanda(updated)
      setDisputaAberta(false)
      setMotivoDisputa('')
    } catch (err: any) {
      toast(err.message || 'Erro ao abrir disputa', 'error')
    } finally {
      setEnviandoDisputa(false)
    }
  }

  if (loading) return (
    <Shell><Topbar title="Demanda" /><main className="p-6"><p style={{ color: 'var(--text3)' }}>Carregando...</p></main></Shell>
  )
  if (!demanda) return (
    <Shell><Topbar title="Demanda" /><main className="p-6"><p style={{ color: 'var(--text3)' }}>Demanda não encontrada.</p></main></Shell>
  )

  const s = statusLabel(demanda.status)
  const currentIdx = FSM_STEPS.findIndex(step => step.status === demanda.status)
  const historico: any[] = demanda.historico || []
  const marcoArt = (demanda.marcos_execucao || []).find((m: any) => m.tipo === 'ART_ATIVA')

  return (
    <Shell>
      <Topbar
        title={demanda.numero || demanda.id?.slice(0, 8)}
        subtitle={`${demanda.svc_nome || demanda.svc_codigo} · ${demanda.area_m2}m² · ${demanda.cidade || '—'}`}
        actions={<Badge variant={s.variant === 'glass' ? 'glass' : s.variant as any}>{s.text}</Badge>}
      />

      <main className="p-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-4">

            {/* Aguardando profissional — countdown */}
            {demanda.status === 'AGUARDANDO' && (
              <div className="card-accent text-center py-8">
                <div className="text-4xl mb-2" style={{ animation: 'sue-pulse 2s ease-in-out infinite' }}>⏳</div>
                <p className="font-semibold" style={{ color: 'var(--text)' }}>Buscando profissional disponível</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
                  Sua demanda de {demanda.svc_codigo} em {demanda.cidade || 'sua região'} está visível
                  para profissionais qualificados.
                </p>

                <div className="mt-5 inline-block card-solid px-6 py-3">
                  <p className="text-2xs section-label mb-1">Tempo restante para aceite</p>
                  <p className="text-2xl font-mono font-bold" style={{ color: 'var(--orange)' }}>
                    {formatHMS(new Date(demanda.created_at).getTime() + 24 * 60 * 60 * 1000 - agora)}
                  </p>
                  <p className="text-2xs mt-1" style={{ color: 'var(--text3)' }}>
                    Se não aceito em 24h, a demanda vai para outros profissionais
                  </p>
                </div>

                <div className="flex justify-center gap-2 mt-4">
                  {[
                    { status: 'AGUARDANDO', label: 'Aguardando' },
                    { status: 'ACEITA', label: 'Aceita' },
                    { status: 'PAGA', label: 'Paga' },
                    { status: 'EM_EXECUCAO', label: 'Execução' },
                  ].map((etapa, idx) => (
                    <div key={etapa.status} className="flex items-center gap-2">
                      <span
                        className="badge"
                        style={idx === 0
                          ? { background: 'var(--green)', color: '#fff' }
                          : { background: 'var(--navy3)', color: 'var(--text3)' }}
                      >
                        {idx === 0 ? '✓ ' : ''}{etapa.label}
                      </span>
                      {idx < 3 && <span style={{ color: 'var(--text3)' }}>›</span>}
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  {!cancelando ? (
                    <Button variant="ghost" size="sm" onClick={() => setCancelando(true)}>Cancelar demanda</Button>
                  ) : (
                    <div className="max-w-md mx-auto text-left space-y-2">
                      <p className="section-label">Motivo do cancelamento</p>
                      <textarea
                        className="input"
                        rows={2}
                        placeholder="Descreva o motivo (mínimo 5 caracteres)"
                        value={motivoCancelamento}
                        onChange={e => setMotivoCancelamento(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button variant="orange" className="flex-1" onClick={cancelarDemanda} loading={enviandoCancelamento}>
                          Confirmar cancelamento
                        </Button>
                        <Button variant="ghost" onClick={() => setCancelando(false)}>Voltar</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Progresso da demanda */}
            <div className="card-solid">
              <p className="section-label mb-3">Progresso da demanda</p>
              <div className="flex flex-wrap gap-2">
                {FSM_STEPS.map((step, idx) => {
                  const isDone = currentIdx >= 0 && idx < currentIdx
                  const isCurrent = idx === currentIdx
                  return (
                    <div key={step.status} className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{
                          background: isDone ? 'var(--green)' : isCurrent ? 'var(--orange)' : 'var(--navy3)',
                          color: isDone || isCurrent ? '#fff' : 'var(--text3)',
                        }}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span className="text-xs" style={{ color: isCurrent ? 'var(--text)' : 'var(--text3)', fontWeight: isCurrent ? 600 : 400 }}>
                        {step.label}
                      </span>
                      {idx < FSM_STEPS.length - 1 && <span style={{ color: 'var(--text3)' }}>›</span>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Linha do tempo */}
            <div className="card-solid">
              <p className="section-label mb-3">Linha do tempo</p>
              {historico.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--text3)' }}>Nenhum evento registrado ainda.</p>
              ) : (
                <ul className="space-y-0">
                  {historico.map((h: any, i: number) => (
                    <li key={h.id || i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
                          style={{ background: i === historico.length - 1 ? 'var(--orange)' : 'var(--text3)' }}
                        />
                        {i < historico.length - 1 && (
                          <span className="w-px flex-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm" style={{ color: 'var(--text)' }}>{formatEvento(h)}</p>
                        <p className="text-2xs" style={{ color: 'var(--text3)' }}>
                          {h.created_at ? new Date(h.created_at).toLocaleString('pt-BR') : ''}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Em disputa */}
            {demanda.status === 'EM_DISPUTA' && (
              <div className="card-solid" style={{ borderColor: 'var(--red)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--red)' }}>⚠ Demanda em disputa</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
                  Um curador irá analisar o caso e responder em até 5 dias úteis.
                </p>
              </div>
            )}

            {/* Entrega do profissional + avaliação */}
            {demanda.status === 'AGUARDANDO_CONFIRMACAO' && (
              <div className="card-solid space-y-3">
                <p className="section-label">Entrega do profissional</p>

                {demanda.url_entregavel && (
                  <a
                    href={demanda.url_entregavel}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm inline-block"
                  >
                    📄 Ver entregável (PDF)
                  </a>
                )}

                {!avaliando ? (
                  <Button onClick={() => setAvaliando(true)} variant="green" className="w-full btn-lg">
                    ✓ Avaliar e confirmar entrega
                  </Button>
                ) : (
                  <div className="space-y-3 pt-2">
                    <StarRating label="Nota geral" value={notas.nota_geral} onChange={v => setNotas(n => ({ ...n, nota_geral: v }))} />
                    <StarRating label="Qualidade técnica" value={notas.qualidade_tecnica} onChange={v => setNotas(n => ({ ...n, qualidade_tecnica: v }))} />
                    <StarRating label="Pontualidade" value={notas.pontualidade} onChange={v => setNotas(n => ({ ...n, pontualidade: v }))} />
                    <StarRating label="Comunicação" value={notas.comunicacao} onChange={v => setNotas(n => ({ ...n, comunicacao: v }))} />
                    <StarRating label="Completude" value={notas.completude} onChange={v => setNotas(n => ({ ...n, completude: v }))} />
                    <textarea
                      className="input"
                      rows={3}
                      placeholder="Comentário (opcional)"
                      value={comentario}
                      onChange={e => setComentario(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button variant="green" className="flex-1" onClick={confirmarComAvaliacao} loading={enviandoAvaliacao}>
                        Enviar avaliação e confirmar
                      </Button>
                      <Button variant="ghost" onClick={() => setAvaliando(false)}>Cancelar</Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Ações conforme status */}
            <div className="flex flex-wrap gap-2">
              {demanda.status === 'ACEITA' && (
                <Button onClick={() => router.push(`/cliente/demandas/${id}/pagamento`)} className="btn-lg">
                  💳 Pagar com PIX
                </Button>
              )}
              {!['CONCLUIDA', 'CANCELADA'].includes(demanda.status) && (
                <Button variant="ghost" onClick={() => router.push(`/cliente/demandas/${id}/chat`)}>💬 Chat com profissional</Button>
              )}
            </div>

            {/* Disputa */}
            {!['CONCLUIDA', 'CANCELADA', 'EM_DISPUTA'].includes(demanda.status) && (
              <div className="card-solid space-y-2">
                {!disputaAberta ? (
                  <Button variant="ghost" onClick={() => setDisputaAberta(true)}>⚠ Abrir disputa</Button>
                ) : (
                  <div className="space-y-2">
                    <p className="section-label">Motivo da disputa</p>
                    <textarea
                      className="input"
                      rows={3}
                      placeholder="Descreva o problema (mínimo 10 caracteres)"
                      value={motivoDisputa}
                      onChange={e => setMotivoDisputa(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button variant="orange" className="flex-1" onClick={enviarDisputa} loading={enviandoDisputa}>Enviar disputa</Button>
                      <Button variant="ghost" onClick={() => setDisputaAberta(false)}>Cancelar</Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Coluna lateral */}
          <div className="space-y-4">

            {/* Pagamento */}
            <div className="card-solid">
              <p className="section-label mb-3">Pagamento</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text3)' }}>Total</span>
                  <span className="font-bold text-lg font-mono" style={{ color: 'var(--orange)' }}>
                    {formatBRL(demanda.valor_total || demanda.preco_final || demanda.preco_servico || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text3)' }}>Status</span>
                  <Badge variant={demanda.pago_em ? 'green' : 'gold'}>
                    {demanda.pago_em ? '🔒 Em escrow' : 'Aguardando pagamento'}
                  </Badge>
                </div>
                {demanda.pago_em && (
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text3)' }}>Pago em</span>
                    <span style={{ color: 'var(--text)' }}>{formatDate(demanda.pago_em)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ART/RRT */}
            <div className="card-solid">
              <p className="section-label mb-3">ART/RRT</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text3)' }}>Situação</span>
                  <Badge variant={marcoArt ? 'green' : 'glass'}>
                    {marcoArt ? '✓ Ativa' : 'Pendente'}
                  </Badge>
                </div>
                {marcoArt && (
                  <>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text3)' }}>Número/protocolo</span>
                      <span className="font-mono" style={{ color: 'var(--text)' }}>{marcoArt.obs || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text3)' }}>Registrada em</span>
                      <span style={{ color: 'var(--text)' }}>{formatDate(marcoArt.created_at)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text3)' }}>Taxa ART</span>
                  <span className="font-mono" style={{ color: 'var(--text)' }}>{formatBRL(demanda.art_fee || 0)}</span>
                </div>
              </div>
            </div>

            {/* Profissional designado */}
            {demanda.profissional && (
              <div className="card-solid">
                <p className="section-label mb-3">Profissional</p>
                <div className="flex gap-3 items-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0"
                    style={{ background: 'rgba(232,103,26,0.15)', color: 'var(--orange)' }}
                  >
                    {(demanda.profissional?.usuario?.nome || demanda.profissional?.nome || 'P').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: 'var(--text)' }}>
                      {demanda.profissional?.usuario?.nome || demanda.profissional?.nome || 'Profissional'}
                    </p>
                    <p className="text-2xs font-mono" style={{ color: 'var(--text3)' }}>
                      {demanda.profissional?.conselho || 'CREA'}-{demanda.profissional?.uf_conselho || 'PB'} {demanda.profissional?.numero_conselho?.replace(/(\d{3})\d+/, '$1XXX-X')}
                    </p>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="orange">{demanda.profissional?.nivel || 'PLENO'}</Badge>
                      <Badge variant="green">✓ CREA verificado</Badge>
                    </div>
                    {demanda.profissional?.id && (
                      <a
                        href={`/profissionais/${demanda.profissional.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-2xs"
                        style={{ color: 'var(--text3)' }}
                      >
                        Ver perfil público →
                      </a>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => router.push(`/cliente/demandas/${id}/chat`)}>💬</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </Shell>
  )
}
