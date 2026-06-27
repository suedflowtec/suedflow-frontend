// app/curador/casos/[id]/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { curador as curadorApi } from '@/lib/api'
import { formatBRL, formatDate } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { CheckCircle2, XCircle, AlertTriangle, User, Briefcase, ArrowUpCircle, Eye, FileText, Image, Download } from 'lucide-react'
import { getInlineUrl, podeAbrirInline } from '@/lib/utils'

const TIPO_BADGE: Record<string, { text: string; variant: any }> = {
  QA_REPROVADO:     { text: 'QA reprovado', variant: 'gold' },
  DISPUTA:          { text: 'Disputa', variant: 'red' },
  DEMANDA_ESPECIAL: { text: 'Demanda especial', variant: 'purple' },
}

export default function CuradorCasoDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const id = params?.id as string

  const [data, setData] = useState<{ caso: any; checklist: any[]; analise_sue: any } | null>(null)
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState('')
  const [anotacao, setAnotacao] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [preco, setPreco] = useState('')
  const [sla, setSla] = useState('')
  const [obs, setObs] = useState('')

  const carregar = () => {
    curadorApi.caso(id)
      .then(setData)
      .catch((err: any) => toast(err.message || 'Erro ao carregar caso', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (!['CURADOR_SUPORTE', 'CURADOR_SENIOR', 'ADMIN'].includes(user.tipo)) {
      router.push('/cliente'); return
    }
    if (!id) return
    carregar()
  }, [user, authLoading, router, id])

  if (authLoading || !user) return null
  if (loading) return (
    <Shell><Topbar title="Caso" /><main className="p-6"><p style={{ color: 'var(--text3)' }}>Carregando...</p></main></Shell>
  )
  if (!data?.caso) return (
    <Shell><Topbar title="Caso" /><main className="p-6"><p style={{ color: 'var(--text3)' }}>Caso não encontrado.</p></main></Shell>
  )

  const { caso, checklist, analise_sue } = data
  const demanda = caso.demanda
  const tipo = TIPO_BADGE[caso.tipo] || { text: caso.tipo, variant: 'glass' }
  const disputa = demanda?.disputas?.[0]
  const isCuradorSuporte = user.tipo === 'CURADOR_SUPORTE'
  const isSeniorOuAdmin = user.tipo === 'CURADOR_SENIOR' || user.tipo === 'ADMIN'

  const aprovar = async () => {
    setEnviando(true)
    try {
      await curadorApi.aprovarQa(caso.id, feedback.trim() || undefined)
      toast('Entrega aprovada · cliente notificado para confirmar', 'success')
      router.push('/curador/fila')
    } catch (err: any) { toast(err.message || 'Erro ao aprovar', 'error') }
    finally { setEnviando(false) }
  }

  const reprovar = async () => {
    if (feedback.trim().length < 10) {
      toast('Descreva o motivo da reprovação (mínimo 10 caracteres)', 'error'); return
    }
    setEnviando(true)
    try {
      await curadorApi.reprovarQa(caso.id, feedback.trim())
      toast('Reprovado · profissional notificado para retrabalho', 'success')
      router.push('/curador/fila')
    } catch (err: any) { toast(err.message || 'Erro ao reprovar', 'error') }
    finally { setEnviando(false) }
  }

  const resolverDisputa = async (acao: 'REEMBOLSAR_CLIENTE' | 'LIBERAR_PROFISSIONAL' | 'RETOMAR_EXECUCAO') => {
    if (acao === 'REEMBOLSAR_CLIENTE' && feedback.trim().length < 10) {
      toast('Descreva o motivo da decisão (mínimo 10 caracteres)', 'error'); return
    }
    setEnviando(true)
    try {
      await curadorApi.resolverDisputa(caso.id, { acao, obs: feedback.trim() || undefined })
      toast('Disputa resolvida · partes notificadas', 'success')
      router.push('/curador/fila')
    } catch (err: any) { toast(err.message || 'Erro ao resolver disputa', 'error') }
    finally { setEnviando(false) }
  }

  const precificar = async () => {
    if (!preco || !sla) { toast('Informe preço e prazo', 'error'); return }
    setEnviando(true)
    try {
      await curadorApi.precificarEspecial(caso.demanda_id, { preco: Number(preco), sla: Number(sla), obs: obs.trim() || undefined })
      toast('Demanda especial precificada · cliente notificado', 'success')
      router.push('/curador/fila')
    } catch (err: any) { toast(err.message || 'Erro ao precificar', 'error') }
    finally { setEnviando(false) }
  }

  const prazoHoras = caso.prazo_horas || 24
  const criado = new Date(caso.created_at)
  const deadline = new Date(criado.getTime() + prazoHoras * 3600 * 1000)
  const atrasado = deadline < new Date() && caso.status !== 'RESOLVIDO'
  const horasRestantes = Math.round((deadline.getTime() - Date.now()) / 3600000)

  return (
    <Shell>
      <Topbar
        title={demanda?.numero || caso.demanda_id?.slice(0, 8)}
        subtitle={`${demanda?.servico?.nome || demanda?.svc_codigo || ''} · ${demanda?.area_m2 || '—'}m²`}
        actions={
          <div className="flex items-center gap-2">
            {atrasado
              ? <Badge variant="red">⚠ Atrasado</Badge>
              : horasRestantes <= 4
              ? <Badge variant="gold">{horasRestantes}h restantes</Badge>
              : null}
            <Badge variant={tipo.variant}>{tipo.text}</Badge>
          </div>
        }
      />

      <main className="p-6 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Coluna principal ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Partes envolvidas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="card-solid">
                <div className="flex items-center gap-1.5 mb-2">
                  <User size={13} style={{ color: 'var(--orange)' }} />
                  <p className="text-2xs uppercase tracking-wider font-semibold" style={{ color: 'var(--text3)' }}>Cliente</p>
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                  {demanda?.cliente?.usuario?.nome || '—'}
                </p>
              </div>
              <div className="card-solid">
                <div className="flex items-center gap-1.5 mb-2">
                  <Briefcase size={13} style={{ color: 'var(--orange)' }} />
                  <p className="text-2xs uppercase tracking-wider font-semibold" style={{ color: 'var(--text3)' }}>Profissional</p>
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                  {demanda?.profissional?.usuario?.nome || '—'}
                </p>
              </div>
            </div>

            {/* Dados da demanda */}
            <div className="card-solid">
              <p className="section-label mb-3">Demanda</p>
              <div className="space-y-2 text-sm">
                <Row label="Valor" value={formatBRL(demanda?.valor_total || demanda?.preco_servico || 0)} mono orange />
                <Row label="Serviço" value={`${demanda?.svc_codigo} — ${demanda?.servico?.nome || ''}`} />
                <Row label="Imóvel" value={`${demanda?.tipo_imovel} · ${demanda?.area_m2}m²`} />
                <Row label="Caso aberto em" value={formatDate(caso.created_at)} />
                {demanda?.descricao && (
                  <div className="pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-2xs mb-1" style={{ color: 'var(--text3)' }}>Descrição original</p>
                    <p className="text-sm" style={{ color: 'var(--text2)' }}>{demanda.descricao}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── DISPUTA: detalhes completos ── */}
            {caso.tipo === 'DISPUTA' && (
              <div className="card-solid" style={{ borderColor: 'rgba(220,38,38,0.3)', borderWidth: 1 }}>
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangle size={18} style={{ color: 'var(--red)' }} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--red)' }}>
                      Disputa · aberta por: {disputa ? (disputa.aberta_por === 'CLIENTE' ? 'Cliente' : 'Profissional') : '—'}
                    </p>
                    {disputa?.created_at && (
                      <p className="text-2xs mt-0.5" style={{ color: 'var(--text3)' }}>{formatDate(disputa.created_at)}</p>
                    )}
                  </div>
                </div>

                {disputa?.motivo && (
                  <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(220,38,38,0.08)' }}>
                    <p className="text-2xs font-semibold mb-1" style={{ color: 'var(--text3)' }}>MOTIVO DA DISPUTA</p>
                    <p className="text-sm" style={{ color: 'var(--text2)' }}>{disputa.motivo}</p>
                  </div>
                )}

                <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <p className="text-2xs font-semibold mb-2" style={{ color: 'var(--text3)' }}>O QUE FOI CONTRATADO</p>
                  <p className="text-xs" style={{ color: 'var(--text2)' }}>
                    {demanda?.descricao || 'Sem descrição registrada'}
                  </p>
                </div>

                {/* Escalada para Curador Sênior (apenas Suporte) */}
                {isCuradorSuporte && (
                  <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text3)' }}>
                      <ArrowUpCircle size={14} style={{ color: 'var(--purple)' }} />
                      <span>
                        Se a disputa for complexa, o Curador Sênior pode assumir em primeira ou segunda instância.
                        Entre em contato pelo canal interno para escalar este caso (#{caso.id.slice(0,8)}).
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Checklist QA */}
            {caso.tipo === 'QA_REPROVADO' && checklist.length > 0 && (
              <div className="card-solid">
                <p className="section-label mb-3">Checklist do serviço</p>
                <ul className="space-y-1.5">
                  {checklist.map((item: any) => (
                    <li key={item.id} className="flex items-start gap-2 text-sm">
                      <span style={{ color: 'var(--text3)' }}>•</span>
                      <span style={{ color: 'var(--text2)' }}>{item.descricao}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Entregável + Documentos + Fotos de marcos ── */}
            {(demanda?.url_entregavel || demanda?.documentos?.length > 0 || demanda?.marcos_execucao?.some((m: any) => m.url_foto)) && (
              <div className="card-solid space-y-3">
                <p className="section-label">Arquivos da demanda</p>

                {/* Entregável principal (PDF do profissional) */}
                {demanda.url_entregavel && (
                  <div className="rounded-xl p-3" style={{ background: 'rgba(232,103,26,0.08)', border: '1px solid rgba(232,103,26,0.25)' }}>
                    <p className="text-2xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--orange)' }}>Entregável principal</p>
                    <ArquivoLink url={demanda.url_entregavel} nome="Laudo / Relatório entregue" tipo="pdf" />
                  </div>
                )}

                {/* Fotos de marcos (check-in, pré, pós) */}
                {demanda.marcos_execucao?.some((m: any) => m.url_foto) && (
                  <div>
                    <p className="text-2xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text3)' }}>Fotos de execução</p>
                    <div className="grid grid-cols-2 gap-2">
                      {demanda.marcos_execucao.filter((m: any) => m.url_foto).map((m: any) => (
                        <a
                          key={m.id || m.tipo}
                          href={m.url_foto}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative rounded-lg overflow-hidden block"
                          style={{ aspectRatio: '16/9', background: 'rgba(255,255,255,0.04)' }}
                        >
                          <img src={m.url_foto} alt={m.tipo} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-end p-1.5" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.6))' }}>
                            <span className="text-2xs text-white font-semibold">{m.tipo.replace(/_/g, ' ')}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documentos adicionais */}
                {demanda.documentos?.length > 0 && (
                  <div>
                    <p className="text-2xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text3)' }}>Documentos de suporte</p>
                    <div className="space-y-1.5">
                      {demanda.documentos.map((doc: any) => (
                        <ArquivoLink
                          key={doc.id}
                          url={doc.url}
                          nome={doc.nome || doc.tipo || 'Documento'}
                          tipo={doc.tipo}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Análise SUE */}
            {analise_sue && (
              <div className="card-solid">
                <p className="section-label mb-3">Análise AVC (Motor QA)</p>
                <pre className="text-xs p-3 rounded-xl overflow-auto" style={{ background: 'var(--navy3)', color: 'var(--text2)' }}>
                  {JSON.stringify(analise_sue, null, 2)}
                </pre>
              </div>
            )}

            {/* ── DECISÃO: QA ── */}
            {caso.tipo === 'QA_REPROVADO' && (
              <div className="card-solid space-y-3">
                <p className="section-label">Decisão do curador</p>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Feedback (obrigatório para reprovar — mínimo 10 caracteres; opcional para aprovar)"
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button variant="green" className="flex-1" disabled={enviando} onClick={aprovar}>
                    <CheckCircle2 size={15} />Aprovar entrega
                  </Button>
                  <Button variant="orange" className="flex-1" disabled={enviando} onClick={reprovar}>
                    <XCircle size={15} />Reprovar · retrabalho
                  </Button>
                </div>
                <p className="text-2xs" style={{ color: 'var(--text3)' }}>
                  Reprovação aplica −40 pontos SQP ao profissional e retorna a demanda para EM_EXECUCAO.
                </p>
              </div>
            )}

            {/* ── DECISÃO: DISPUTA ── */}
            {caso.tipo === 'DISPUTA' && (
              <div className="card-solid space-y-3">
                <p className="section-label">Resolução da disputa</p>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Justificativa da decisão · obrigatória para reembolsar o cliente"
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                />
                <div className="space-y-2">
                  <Button variant="green" className="w-full" disabled={enviando} onClick={() => resolverDisputa('LIBERAR_PROFISSIONAL')}>
                    <CheckCircle2 size={15} />Liberar pagamento ao profissional
                  </Button>
                  <Button variant="orange" className="w-full" disabled={enviando} onClick={() => resolverDisputa('RETOMAR_EXECUCAO')}>
                    Retomar execução · manter custódia
                  </Button>
                  <Button variant="ghost" className="w-full" disabled={enviando} onClick={() => resolverDisputa('REEMBOLSAR_CLIENTE')}>
                    <XCircle size={15} />Cancelar e reembolsar o cliente
                  </Button>
                </div>
                <div className="rounded-xl p-3 text-xs space-y-1" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text3)' }}>
                  <p><strong style={{ color: 'var(--green)' }}>Liberar:</strong> conclui a demanda e libera o escrow ao profissional.</p>
                  <p><strong style={{ color: 'var(--orange)' }}>Retomar:</strong> demanda volta para EM_EXECUCAO; cliente mantém o dinheiro em custódia.</p>
                  <p><strong style={{ color: 'var(--text2)' }}>Cancelar:</strong> cancela a demanda; aplica −30 SQP ao profissional; reembolso processado pelo Pagar.me.</p>
                </div>
              </div>
            )}

            {/* ── DEMANDA ESPECIAL: precificação ── */}
            {caso.tipo === 'DEMANDA_ESPECIAL' && isSeniorOuAdmin && (
              <div className="card-solid space-y-3">
                <p className="section-label">Precificação manual · Curador Sênior</p>
                <p className="text-sm" style={{ color: 'var(--text2)' }}>
                  Área acima do limite padrão para este serviço — defina preço e prazo manualmente.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs" style={{ color: 'var(--text3)' }}>Preço (R$)</label>
                    <input className="input mt-1" type="number" step="any" value={preco} onChange={e => setPreco(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs" style={{ color: 'var(--text3)' }}>Prazo (dias úteis)</label>
                    <input className="input mt-1" type="number" value={sla} onChange={e => setSla(e.target.value)} />
                  </div>
                </div>
                <textarea className="input" rows={2} placeholder="Observações técnicas (opcional)" value={obs} onChange={e => setObs(e.target.value)} />
                <Button variant="orange" className="w-full" disabled={enviando} onClick={precificar}>
                  Enviar precificação ao cliente
                </Button>
              </div>
            )}

            {caso.tipo === 'DEMANDA_ESPECIAL' && isCuradorSuporte && (
              <div className="card-solid">
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text3)' }}>
                  <ArrowUpCircle size={16} style={{ color: 'var(--purple)' }} />
                  <p>Precificação de demandas especiais é exclusiva do <strong style={{ color: 'var(--purple)' }}>Curador Sênior</strong> (Art. 8.5). Escale este caso pelo canal interno.</p>
                </div>
              </div>
            )}
          </div>

          {/* ── Coluna lateral ── */}
          <div className="space-y-4">
            <Button variant="ghost" className="w-full" onClick={() => router.push('/curador/fila')}>
              ← Voltar para a fila
            </Button>

            {/* Status e prazo */}
            <div className="card-solid space-y-2 text-sm">
              <p className="section-label">Status do caso</p>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text3)' }}>Status</span>
                <span style={{ color: caso.status === 'RESOLVIDO' ? 'var(--green)' : 'var(--text)' }}>{caso.status}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text3)' }}>Prazo</span>
                <span style={{ color: atrasado ? 'var(--red)' : horasRestantes <= 4 ? 'var(--gold)' : 'var(--text)' }}>
                  {caso.status === 'RESOLVIDO' ? 'Resolvido' : atrasado ? `Atrasado ${Math.abs(horasRestantes)}h` : `${horasRestantes}h`}
                </span>
              </div>
              {caso.resolvido_em && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text3)' }}>Resolvido em</span>
                  <span style={{ color: 'var(--text2)' }}>{formatDate(caso.resolvido_em)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </Shell>
  )
}

function ArquivoLink({ url, nome, tipo }: { url: string; nome: string; tipo?: string }) {
  const isPdf    = tipo?.toLowerCase().includes('pdf') || url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('/raw/')
  const isImage  = /\.(jpe?g|png|gif|webp)/i.test(url) || url.includes('/image/')
  const podeVer  = podeAbrirInline(url)
  const viewUrl  = getInlineUrl(url)
  const Icon     = isImage ? Image : FileText

  return (
    <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 group"
      style={{ background: 'rgba(255,255,255,0.05)' }}>
      <Icon size={15} className="shrink-0" style={{ color: 'var(--orange)' }} />
      <span className="text-sm truncate flex-1" style={{ color: 'var(--text2)' }}>{nome}</span>
      {isPdf && <span className="shrink-0 text-2xs font-mono px-1 rounded" style={{ background: 'rgba(232,103,26,0.15)', color: 'var(--orange)' }}>PDF</span>}
      <div className="flex items-center gap-1 shrink-0">
        {/* Olho = abrir inline no navegador */}
        {podeVer && (
          <a href={viewUrl} target="_blank" rel="noopener noreferrer"
            title="Abrir no navegador"
            className="p-1 rounded hover:bg-white/10 transition-colors"
            style={{ color: 'var(--text3)' }}>
            <Eye size={13} />
          </a>
        )}
        {/* Seta = baixar o arquivo */}
        <a href={url} download={nome || true}
          title="Baixar arquivo"
          className="p-1 rounded hover:bg-white/10 transition-colors"
          style={{ color: 'var(--text3)' }}>
          <Download size={13} />
        </a>
      </div>
    </div>
  )
}

function Row({ label, value, mono, orange }: { label: string; value: string; mono?: boolean; orange?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span style={{ color: 'var(--text3)' }}>{label}</span>
      <span className={mono ? 'font-mono font-semibold' : 'font-medium'} style={{ color: orange ? 'var(--orange)' : 'var(--text)' }}>
        {value}
      </span>
    </div>
  )
}
