'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { profissional as profissionalApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { ArrowLeft, Lightbulb, ChevronDown, ChevronUp, RotateCcw, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

const TAB_LABELS = ['Cenário', 'Imóvel', 'Evidências', 'Briefing', 'Escopo', 'Dica do Curador']

const CLASSIFICACOES = [
  { value: 'otimo',    label: 'Ótimo' },
  { value: 'bom',      label: 'Bom' },
  { value: 'regular',  label: 'Regular' },
  { value: 'precario', label: 'Precário' },
  { value: 'critico',  label: 'Crítico' },
]

const NIVEL_COLOR: Record<string, string> = {
  AVANCADO:      'var(--green)',
  INTERMEDIARIO: 'var(--orange)',
  BASICO:        'var(--gold)',
  REPROVADO:     'var(--red)',
}

const NIVEL_LABEL: Record<string, string> = {
  AVANCADO:      'Aprovado Avançado',
  INTERMEDIARIO: 'Aprovado Intermediário',
  BASICO:        'Aprovado Básico',
  REPROVADO:     'Reprovado',
}

// Score ring animado — a assinatura visual da tela de resultado
function ScoreRing({ score, nivel }: { score: number; nivel: string }) {
  const [displayed, setDisplayed] = useState(0)
  const cor = NIVEL_COLOR[nivel] || 'var(--text3)'

  useEffect(() => {
    let frame: number
    const start = performance.now()
    const duration = 1200
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(eased * score))
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [score])

  const pct  = (score / 100) * 100
  const deg  = (pct / 100) * 360

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: 120, height: 120,
          background: `conic-gradient(${cor} ${deg}deg, rgba(255,255,255,0.08) ${deg}deg)`,
          padding: 6,
          transition: 'background 0.05s linear',
        }}
      >
        <div className="flex flex-col items-center justify-center rounded-full w-full h-full"
          style={{ background: 'var(--navy2)' }}>
          <span className="text-3xl font-black font-mono" style={{ color: cor }}>{displayed}</span>
          <span className="text-xs" style={{ color: 'var(--text3)' }}>/ 100</span>
        </div>
      </div>
      <span className="text-sm font-bold" style={{ color: cor }}>{NIVEL_LABEL[nivel] || nivel}</span>
    </div>
  )
}

export default function DemoDetalhePage() {
  const params  = useParams()
  const router  = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const modulo  = (params?.modulo  as string || '').toLowerCase()
  const numero  = Number(params?.numero)

  const [demo, setDemo]         = useState<any>(null)
  const [historico, setHistorico] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [polling, setPolling]   = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [form, setForm] = useState({
    art_numero:   '',
    patologias:   '',
    classificacao:'regular',
    analise:      '',
    conclusao:    '',
    cronograma:   '',
  })
  const [enviando, setEnviando] = useState(false)

  const carregar = () => {
    profissionalApi.demoDetalhe(modulo, numero)
      .then(r => {
        setDemo(r.demo)
        setHistorico(r.historico || [])
        // Se há tentativa AVALIANDO, iniciar polling
        const avaliando = r.historico?.find((h: any) => h.status === 'AVALIANDO')
        if (avaliando) startPolling()
        else if (r.historico?.[0]?.status === 'CONCLUIDO') setShowResult(true)
      })
      .catch(() => toast('Erro ao carregar projeto demo', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    carregar()
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [user, authLoading, modulo, numero])

  const startPolling = () => {
    setPolling(true)
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const r = await profissionalApi.demoResultado(modulo, numero)
        if (r.resultado?.status === 'CONCLUIDO') {
          clearInterval(pollRef.current!)
          setPolling(false)
          setHistorico(prev => [r.resultado, ...prev.filter(h => h.id !== r.resultado.id)])
          setShowResult(true)
        }
      } catch { /* continua polling */ }
    }, 5000)
  }

  const enviar = async () => {
    if (!form.art_numero.trim()) { toast('Informe o número ART-demo', 'error'); return }
    if (!form.patologias.trim()) { toast('Descreva as patologias identificadas', 'error'); return }
    if (!form.conclusao.trim()) { toast('Escreva a conclusão do laudo', 'error'); return }

    setEnviando(true)
    setShowResult(false)
    try {
      await profissionalApi.demoSubmeter(modulo, numero, form)
      toast('Laudo recebido! Avaliando em até 1 minuto...', 'success')
      startPolling()
      carregar()
    } catch (err: any) {
      toast(err.message || 'Erro ao enviar', 'error')
    } finally {
      setEnviando(false)
    }
  }

  const reiniciar = () => {
    setShowResult(false)
    setForm({ art_numero: '', patologias: '', classificacao: 'regular', analise: '', conclusao: '', cronograma: '' })
  }

  if (authLoading || !user) return null
  if (loading) return <Shell><Topbar title="Projeto Demo" /><main className="p-6"><p style={{ color: 'var(--text3)' }}>Carregando...</p></main></Shell>
  if (!demo) return <Shell><Topbar title="Projeto Demo" /><main className="p-6"><p style={{ color: 'var(--text3)' }}>Projeto não encontrado.</p></main></Shell>

  const ultimoResultado = historico.find(h => h.status === 'CONCLUIDO')
  const estaAvaliando   = historico.some(h => h.status === 'AVALIANDO')

  const NIVEL_STARS_N: Record<string, number> = {
    'BÁSICO': 1, 'INTERMEDIÁRIO': 2, 'INTERMEDIÁRIO AVANÇADO': 3, 'AVANÇADO': 4, 'ESPECIALISTA': 5,
  }
  const stars = NIVEL_STARS_N[demo.nivel] || 1

  return (
    <Shell>
      <Topbar
        title={demo.titulo}
        subtitle={`${demo.nivel} · ${demo.tipo_imovel} ${demo.area_m2}m²`}
        actions={
          <button onClick={() => router.push(`/profissional/prepara/${modulo}/demo`)}
            className="flex items-center gap-1.5 text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ color: 'var(--text3)' }}>
            <ArrowLeft size={14} /> Todos os projetos
          </button>
        }
      />

      <main className="p-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Coluna esquerda: briefing com tabs (sticky) ── */}
          <div className="lg:col-span-3 lg:sticky lg:top-6 space-y-4" style={{ alignSelf: 'start' }}>

            {/* Dificuldade + número */}
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black font-mono" style={{ color: 'var(--orange)' }}>#{demo.numero}</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-sm" style={{ color: i < stars ? 'var(--gold)' : 'rgba(255,255,255,0.15)' }}>★</span>
                ))}
              </div>
              <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text3)' }}>{demo.nivel}</span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 flex-wrap">
              {TAB_LABELS.map((t, i) => (
                <button key={i} onClick={() => setActiveTab(i)}
                  className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
                  style={{
                    background:   activeTab === i ? 'var(--orange)' : 'rgba(255,255,255,0.05)',
                    color:        activeTab === i ? '#fff' : 'var(--text3)',
                  }}>
                  {t}
                </button>
              ))}
            </div>

            <div className="card-solid min-h-[280px]">
              {activeTab === 0 && (
                <div>
                  <p className="section-label mb-3">Descrição do cenário</p>
                  <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text2)' }}>{demo.contexto}</p>
                </div>
              )}
              {activeTab === 1 && (
                <div>
                  <p className="section-label mb-3">Dados do imóvel</p>
                  <div className="space-y-1.5 text-sm">
                    {[
                      ['Tipo', demo.tipo_imovel],
                      ['Área', `${demo.area_m2} m²`],
                      ['Nível de dificuldade', demo.nivel],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between py-1.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        <span style={{ color: 'var(--text3)' }}>{k}</span>
                        <span style={{ color: 'var(--text)' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 2 && (
                <div>
                  <p className="section-label mb-3">Evidências fornecidas</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>
                    Ao aceitar este projeto demo você recebe as evidências fotográficas simuladas descritas no cenário.
                    Elabore o laudo com base nas descrições das fotos fornecidas.
                  </p>
                  <div className="mt-3 rounded-lg p-3 text-xs" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text3)' }}>
                    As evidências incluem fotos de: fachada, ambientes internos, patologias específicas do cenário, elementos construtivos relevantes e planta baixa (quando aplicável).
                  </div>
                </div>
              )}
              {activeTab === 3 && (
                <div>
                  <p className="section-label mb-3">Briefing do cliente</p>
                  <blockquote className="text-sm leading-relaxed italic pl-3 border-l-2" style={{ color: 'var(--text2)', borderColor: 'var(--orange)' }}>
                    "{demo.briefing_cliente}"
                  </blockquote>
                </div>
              )}
              {activeTab === 4 && (
                <div>
                  <p className="section-label mb-3">Escopo do serviço</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>
                    {demo.foco_avaliacao}
                  </p>
                  <p className="text-xs mt-3 font-semibold" style={{ color: 'var(--text3)' }}>Fora do escopo:</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                    Projeto de reforço · Orçamento de correção · Análise de culpabilidade civil · Avaliação mercadológica
                  </p>
                </div>
              )}
              {activeTab === 5 && (
                <div>
                  {/* Dica do Curador — barra laranja vertical como anotação de margem técnica */}
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb size={14} style={{ color: 'var(--gold)' }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--gold)' }}>Dica do Curador</span>
                  </div>
                  <div className="pl-4 border-l-2 space-y-2" style={{ borderColor: 'var(--orange)' }}>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>
                      {demo.foco_avaliacao}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Coluna direita: formulário ou resultado ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Estado: avaliando */}
            {estaAvaliando && !showResult && (
              <div className="card-solid text-center py-10 space-y-3">
                <div className="w-10 h-10 rounded-full mx-auto border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--orange)', borderTopColor: 'transparent' }} />
                <p className="text-sm font-semibold text-white">Avaliando seu laudo...</p>
                <p className="text-xs" style={{ color: 'var(--text3)' }}>A SUE está revisando contra a rubrica. Resultado em até 1 minuto.</p>
              </div>
            )}

            {/* Estado: resultado */}
            {showResult && ultimoResultado && (
              <div className="card-solid space-y-5">
                <ScoreRing score={ultimoResultado.score ?? 0} nivel={ultimoResultado.nivel ?? 'REPROVADO'} />

                {/* Bloqueante */}
                {ultimoResultado.bloqueante_falhou && (
                  <div className="rounded-lg p-3 flex items-start gap-2 text-xs" style={{ background: 'rgba(255,77,109,0.10)', borderLeft: '3px solid var(--red)' }}>
                    <XCircle size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--red)' }} />
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--red)' }}>Critério bloqueante {ultimoResultado.bloqueante_falhou} não atendido</p>
                      <p style={{ color: 'var(--text3)' }}>O laudo foi reprovado automaticamente por ausência de item obrigatório.</p>
                    </div>
                  </div>
                )}

                {/* Breakdown por critério */}
                {ultimoResultado.feedback?.criterios?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text3)' }}>Pontuação por critério</p>
                    <div className="space-y-1.5">
                      {ultimoResultado.feedback.criterios.map((c: any) => {
                        const pct = c.max > 0 ? (c.obtido / c.max) * 100 : 0
                        const barColor = pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--orange)' : 'var(--red)'
                        return (
                          <div key={c.id}>
                            <div className="flex justify-between text-xs mb-0.5">
                              <span style={{ color: 'var(--text2)' }}>{c.nome}</span>
                              <span className="font-mono" style={{ color: barColor }}>{c.obtido}/{c.max}</span>
                            </div>
                            <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: barColor }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Resumo da avaliação */}
                {ultimoResultado.feedback?.resumo && (
                  <div className="rounded-lg p-3 text-xs leading-relaxed" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text2)' }}>
                    {ultimoResultado.feedback.resumo}
                  </div>
                )}

                <button onClick={reiniciar} className="btn btn-ghost w-full flex items-center justify-center gap-2">
                  <RotateCcw size={14} /> Tentar novamente
                </button>
              </div>
            )}

            {/* Formulário de submissão */}
            {!showResult && !estaAvaliando && (
              <div className="card-solid space-y-4">
                <p className="section-label">Elabore seu laudo</p>

                {historico.length > 0 && (
                  <div className="rounded-lg p-2.5 text-xs" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text3)' }}>
                    Última tentativa: score {historico[0]?.score ?? '—'}/100 · {NIVEL_LABEL[historico[0]?.nivel] || historico[0]?.nivel}
                  </div>
                )}

                <div>
                  <label className="label">Número ART-demo *</label>
                  <input
                    className="input font-mono text-sm"
                    placeholder="ART-DEMO-[seu CREA]-[data]"
                    value={form.art_numero}
                    onChange={e => setForm(f => ({ ...f, art_numero: e.target.value }))}
                  />
                  <p className="text-2xs mt-1" style={{ color: 'var(--text3)' }}>Ex: ART-DEMO-PB-12345-2026-06-24</p>
                </div>

                <div>
                  <label className="label">Patologias identificadas *</label>
                  <textarea
                    className="input"
                    rows={4}
                    placeholder="Liste as patologias encontradas com localização, descrição e classificação de risco (mínimo/moderado/crítico)..."
                    value={form.patologias}
                    onChange={e => setForm(f => ({ ...f, patologias: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="label">Classificação geral de conservação</label>
                  <select className="input" value={form.classificacao} onChange={e => setForm(f => ({ ...f, classificacao: e.target.value }))}>
                    {CLASSIFICACOES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Análise técnica do cenário</label>
                  <textarea
                    className="input"
                    rows={4}
                    placeholder="Responda especificamente às perguntas do cliente. Para este cenário: analise o padrão de patologias, identifique a origem mais provável, avalie o risco..."
                    value={form.analise}
                    onChange={e => setForm(f => ({ ...f, analise: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="label">Conclusão e parecer técnico *</label>
                  <textarea
                    className="input"
                    rows={4}
                    placeholder="Conclusão objetiva: classificação geral, resposta ao briefing do cliente, principais recomendações..."
                    value={form.conclusao}
                    onChange={e => setForm(f => ({ ...f, conclusao: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="label">Cronograma de recomendações</label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="Imediato: ... | Até 30 dias: ... | Até 90 dias: ... | Manutenção anual: ..."
                    value={form.cronograma}
                    onChange={e => setForm(f => ({ ...f, cronograma: e.target.value }))}
                  />
                </div>

                <button
                  onClick={enviar}
                  disabled={enviando}
                  className="btn btn-primary w-full"
                >
                  {enviando ? 'Enviando...' : 'Enviar laudo para avaliação'}
                </button>

                <p className="text-2xs text-center" style={{ color: 'var(--text3)' }}>
                  A SUE avalia em até 1 minuto · sem penalidade de SQP · tentativas ilimitadas
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </Shell>
  )
}
