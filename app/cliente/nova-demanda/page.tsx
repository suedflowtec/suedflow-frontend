// app/cliente/nova-demanda/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { Button } from '@/components/ui/Button'
import { Input, Field, Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { svc as svcApi, sue, orders } from '@/lib/api'
import { formatBRL } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'

type Etapa = 1 | 2 | 3
type SVC = { codigo: string; nome: string; descricao?: string; uts_res: number; uts_com: number; uts_ind: number; piso: number; teto: number; sla_dias: number }
type MensagemSue = { autor: 'sue' | 'usuario'; texto: string; svc?: SVC }

export default function NovaDemandaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [etapa, setEtapa] = useState<Etapa>(1)
  const [svcs, setSvcs] = useState<SVC[]>([])
  const [svcSelecionado, setSvcSelecionado] = useState<SVC | null>(null)
  const [descricaoSue, setDescricaoSue] = useState('')
  const [loadingSue, setLoadingSue] = useState(false)
  const [mensagensSue, setMensagensSue] = useState<MensagemSue[]>([
    { autor: 'sue', texto: 'Olá! Descreva o que você precisa e eu te ajudo a encontrar o serviço certo. Ex: "tenho trincas no teto" ou "vou comprar um apartamento".' },
  ])
  const [imovel, setImovel] = useState({
    tipo_imovel: 'RESIDENCIAL' as 'RESIDENCIAL' | 'COMERCIAL' | 'INDUSTRIAL',
    area_m2: '',
    estado: 'PB',
    cidade: 'João Pessoa',
    endereco: '',
    descricao: '',
    urgencia: 'NORMAL' as 'NORMAL' | 'PRIORITARIO' | 'URGENTE',
  })
  const [precoCalc, setPrecoCalc] = useState<any>(null)
  const [criando, setCriando] = useState(false)

  useEffect(() => {
    svcApi.listar()
      .then((d: any) => setSvcs(Array.isArray(d) ? d : (d?.servicos || [])))
      .catch(() => toast('Erro ao carregar serviços', 'error'))
  }, [toast])

  // Calcular preço quando dados do imóvel mudarem
  useEffect(() => {
    if (etapa !== 2 || !svcSelecionado || !imovel.area_m2) { setPrecoCalc(null); return }
    const t = setTimeout(() => {
      orders.calcularPreco({
        codigoSvc: svcSelecionado.codigo,
        tipoImovel: imovel.tipo_imovel,
        areaM2: Number(imovel.area_m2),
        urgencia: imovel.urgencia,
      })
        .then((r: any) => setPrecoCalc({
          preco_servico: r.precoServico,
          art_fee: r.artRrtFee,
          taxa_plataforma: 0,
          preco_cliente: r.totalCliente,
          prazo_dias: r.sla_dias,
          area_especial: r.area_especial,
        }))
        .catch(() => {
          // fallback: cálculo local simples
          const mult = { RESIDENCIAL: 1.0, COMERCIAL: 1.3, INDUSTRIAL: 1.7 }[imovel.tipo_imovel]
          const urg = { NORMAL: 1.0, PRIORITARIO: 1.3, URGENTE: 1.6 }[imovel.urgencia]
          const base = svcSelecionado.uts_res * 100
          const servico = Math.round(base * mult * urg * Math.max(1, Number(imovel.area_m2) / 100))
          const art = 108.39, taxa = 11.61
          setPrecoCalc({ preco_servico: servico, art_fee: art, taxa_plataforma: taxa, preco_cliente: servico + art + taxa, prazo_dias: svcSelecionado.sla_dias })
        })
    }, 400)
    return () => clearTimeout(t)
  }, [etapa, svcSelecionado, imovel])

  const buscarSue = async () => {
    const texto = descricaoSue.trim()
    if (!texto) return
    setMensagensSue(m => [...m, { autor: 'usuario', texto }])
    setDescricaoSue('')
    setLoadingSue(true)
    try {
      const r = await sue.buscarSvc(texto)
      const cod = r.svc_codigo || r.codigo
      const found = svcs.find(s => s.codigo === cod)
      if (found) {
        setMensagensSue(m => [...m, {
          autor: 'sue',
          texto: r.justificativa || `Pelo que você descreveu, recomendo o serviço "${found.nome}".`,
          svc: found,
        }])
      } else {
        setMensagensSue(m => [...m, {
          autor: 'sue',
          texto: 'Não consegui identificar um serviço específico para essa descrição. Você pode escolher manualmente na lista abaixo, ou descrever de outra forma.',
        }])
      }
    } catch {
      setMensagensSue(m => [...m, { autor: 'sue', texto: 'Não consegui consultar o serviço agora. Escolha manualmente na lista abaixo.' }])
      toast('Erro ao consultar SUE', 'error')
    } finally {
      setLoadingSue(false)
    }
  }

  const usarSvcSugerido = (s: SVC) => {
    setSvcSelecionado(s)
    setEtapa(2)
  }

  const criarDemanda = async () => {
    if (!svcSelecionado || !precoCalc) return
    setCriando(true)
    try {
      const d = await orders.criar({
        codigoSvc: svcSelecionado.codigo,
        tipoImovel: imovel.tipo_imovel,
        areaM2: Number(imovel.area_m2),
        estado: imovel.estado,
        cidade: imovel.cidade,
        endereco: imovel.endereco,
        descricao: imovel.descricao,
        urgencia: imovel.urgencia,
        meioPagamento: 'PIX',
      })
      if (d.demanda?.status === 'DEMANDA_ESPECIAL') {
        toast('Demanda registrada! Por se tratar de uma área especial, um curador irá precificar manualmente antes do pagamento.', 'success')
      } else {
        toast('Demanda criada com sucesso!', 'success')
      }
      router.push(`/cliente/demandas/${d.demanda.id}`)
    } catch (err: any) {
      toast(err.message || 'Erro ao criar demanda', 'error')
    } finally {
      setCriando(false)
    }
  }

  return (
    <Shell>
      <Topbar title="Nova demanda" />

      <main className="p-6 max-w-2xl space-y-5">
        <p className="text-sm text-ink-muted -mt-2">Etapa {etapa} de 3</p>

        {/* Stepper */}
        <div className="flex gap-1.5">
          {[1, 2, 3].map(n => (
            <div
              key={n}
              className={`flex-1 h-1 rounded-full transition-colors ${n <= etapa ? 'bg-orange' : 'bg-surface-border'}`}
            />
          ))}
        </div>

        {/* ───────── ETAPA 1 · Escolher serviço ───────── */}
        {etapa === 1 && (
          <>
            <div className="card p-4 border-orange-200 bg-orange-50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold text-white bg-teal">S</div>
                <p className="text-sm font-semibold text-navy">SUE · Assistente de serviços</p>
              </div>

              {/* Conversa */}
              <div className="space-y-2 mb-3 max-h-80 overflow-y-auto pr-1">
                {mensagensSue.map((m, i) => (
                  <div key={i} className={`flex ${m.autor === 'usuario' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${
                        m.autor === 'usuario'
                          ? 'bg-orange text-white rounded-br-none'
                          : 'bg-white text-navy border border-surface-border rounded-bl-none'
                      }`}
                    >
                      <p>{m.texto}</p>
                      {m.svc && (
                        <button
                          onClick={() => usarSvcSugerido(m.svc!)}
                          className="mt-2 text-2xs font-semibold text-white bg-orange rounded px-2 py-1 hover:opacity-90"
                        >
                          {m.svc.codigo} · {m.svc.nome} — usar este serviço →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {loadingSue && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-lg px-3 py-2 text-xs bg-white text-ink-muted border border-surface-border rounded-bl-none">
                      SUE está digitando...
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  className="text-navy placeholder:text-navy/50"
                  placeholder="Descreva sua necessidade..."
                  value={descricaoSue}
                  onChange={e => setDescricaoSue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') buscarSue() }}
                />
                <Button onClick={buscarSue} loading={loadingSue} size="sm" className="!px-4">
                  Enviar
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-surface-border" />
              <span className="text-2xs text-ink-muted uppercase tracking-wider">ou escolha</span>
              <div className="flex-1 h-px bg-surface-border" />
            </div>

            <div className="space-y-2">
              {svcs.length === 0 ? (
                <p className="text-center text-sm text-ink-muted py-6">Carregando serviços...</p>
              ) : svcs.filter(s => s.codigo !== 'SVC000').map(s => (
                <button
                  key={s.codigo}
                  onClick={() => { setSvcSelecionado(s); setEtapa(2) }}
                  className={`card w-full text-left p-4 transition-colors ${svcSelecionado?.codigo === s.codigo ? 'border-orange ring-1 ring-orange' : 'hover:bg-surface-hover'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-2xs font-mono text-ink-muted">{s.codigo}</span>
                    <Badge variant="orange">a partir de {formatBRL(s.piso || 680)}</Badge>
                  </div>
                  <p className="text-sm font-semibold text-navy mb-1">{s.nome}</p>
                  <p className="text-xs text-ink-muted line-clamp-2">{s.descricao || 'Serviço técnico SUEDFLOW'}</p>
                  <div className="flex gap-3 mt-2 text-2xs text-ink-muted">
                    <span>⏱ {s.sla_dias || 5} dias</span>
                    <span>📐 até 1.000m²</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ───────── ETAPA 2 · Dados do imóvel ───────── */}
        {etapa === 2 && svcSelecionado && (
          <>
            <div className="card p-4 flex justify-between items-center">
              <div>
                <p className="text-2xs text-ink-muted font-mono">{svcSelecionado.codigo}</p>
                <p className="text-sm font-semibold text-navy">{svcSelecionado.nome}</p>
              </div>
              <button onClick={() => setEtapa(1)} className="text-xs text-orange font-semibold hover:underline">Trocar</button>
            </div>

            <div className="space-y-3">
              <Field label="Tipo de imóvel" required>
                <select className="input" value={imovel.tipo_imovel} onChange={e => setImovel(i => ({ ...i, tipo_imovel: e.target.value as any }))}>
                  <option value="RESIDENCIAL">Residencial</option>
                  <option value="COMERCIAL">Comercial</option>
                  <option value="INDUSTRIAL">Industrial</option>
                </select>
              </Field>
              <Field label="Área (m²)" required>
                <Input type="number" value={imovel.area_m2} onChange={e => setImovel(i => ({ ...i, area_m2: e.target.value }))} placeholder="120" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Estado" required>
                  <select className="input" value={imovel.estado} onChange={e => setImovel(i => ({ ...i, estado: e.target.value }))}>
                    <option value="PB">Paraíba</option>
                    <option value="PE">Pernambuco</option>
                    <option value="RN">Rio Grande do Norte</option>
                  </select>
                </Field>
                <Field label="Cidade" required>
                  <Input value={imovel.cidade} onChange={e => setImovel(i => ({ ...i, cidade: e.target.value }))} />
                </Field>
              </div>
              <Field label="Endereço completo" required>
                <Input value={imovel.endereco} onChange={e => setImovel(i => ({ ...i, endereco: e.target.value }))} placeholder="Rua, número, bairro" />
              </Field>
              <Field label="Descreva a necessidade" hint="Ajuda o profissional a se preparar">
                <Textarea value={imovel.descricao} onChange={e => setImovel(i => ({ ...i, descricao: e.target.value }))} placeholder="Ex: trincas no teto da sala desde a obra do vizinho..." />
              </Field>
              <Field label="Urgência">
                <div className="grid grid-cols-3 gap-2">
                  {(['NORMAL', 'PRIORITARIO', 'URGENTE'] as const).map(u => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setImovel(i => ({ ...i, urgencia: u }))}
                      className={`py-2.5 px-2 rounded text-xs font-semibold border transition-colors ${
                        imovel.urgencia === u ? 'bg-orange text-white border-orange' : 'bg-white text-ink-secondary border-surface-border hover:bg-surface-hover'
                      }`}
                    >
                      {u === 'NORMAL' ? 'Normal' : u === 'PRIORITARIO' ? '+30%' : '+60%'}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            {/* Motor UTS · preview de preço */}
            {precoCalc && (
              <div className="card p-4 border-orange-200 bg-orange-50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-orange">⚡</span>
                  <p className="text-2xs uppercase tracking-wider font-semibold text-orange">Motor UTS · Preço estimado</p>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-ink-secondary"><span>Serviço</span><span>{formatBRL(precoCalc.preco_servico || 0)}</span></div>
                  <div className="flex justify-between text-ink-secondary"><span>ART/RRT</span><span>{formatBRL(precoCalc.art_fee || 0)}</span></div>
                  <div className="border-t border-surface-border my-2" />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-navy">Total</span>
                    <span className="text-2xl font-bold text-orange font-mono">{formatBRL(precoCalc.preco_cliente || 0)}</span>
                  </div>
                </div>
                <p className="text-2xs text-ink-muted mt-2">
                  Profissional pode ajustar ±15% (autonomia técnica · STF Tema 1291)
                </p>
              </div>
            )}

            {/* Aviso de Demanda Especial */}
            {precoCalc?.area_especial && (
              <div className="card p-4" style={{ borderColor: 'var(--gold)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>⚠ Demanda especial</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text2)' }}>
                  A área informada está acima do padrão para este serviço. O preço acima é uma
                  estimativa — após confirmar, um curador sênior fará a precificação final
                  antes da liberação do pagamento.
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setEtapa(1)} className="flex-1">← Voltar</Button>
              <Button
                onClick={() => setEtapa(3)}
                disabled={!imovel.area_m2 || !imovel.endereco}
                className="flex-1"
              >
                Continuar →
              </Button>
            </div>
          </>
        )}

        {/* ───────── ETAPA 3 · Confirmação ───────── */}
        {etapa === 3 && svcSelecionado && precoCalc && (
          <>
            <div className="card p-4">
              <p className="text-2xs uppercase tracking-wider font-semibold text-ink-muted mb-2">Resumo</p>
              <div className="space-y-1.5 text-sm">
                <Row label="Serviço" value={`${svcSelecionado.codigo} · ${svcSelecionado.nome}`} />
                <Row label="Tipo" value={`${imovel.tipo_imovel} · ${imovel.area_m2}m²`} />
                <Row label="Local" value={`${imovel.cidade}, ${imovel.estado}`} />
                <Row label="Urgência" value={imovel.urgencia === 'NORMAL' ? 'Normal' : imovel.urgencia === 'PRIORITARIO' ? 'Prioritária' : 'Urgente'} />
                <Row label="Prazo" value={`${precoCalc.prazo_dias || svcSelecionado.sla_dias || 5} dias úteis`} />
              </div>
            </div>

            <div className="card p-4 border-orange-200 bg-orange-50 text-center">
              <p className="text-2xs uppercase tracking-wider font-semibold text-orange mb-1">Total a pagar</p>
              <p className="text-4xl font-bold text-orange font-mono mb-1">{formatBRL(precoCalc.preco_cliente)}</p>
              <p className="text-xs text-ink-muted">PIX via Pagar.me · Escrow protegido</p>
            </div>

            {/* FSM */}
            <div className="card p-4">
              <p className="text-2xs uppercase tracking-wider font-semibold text-ink-muted mb-3">Fluxo</p>
              <div className="flex gap-1 items-center text-2xs font-semibold uppercase">
                <FsmStep label="Aguard." current />
                <span className="text-ink-light">→</span>
                <FsmStep label="Aceita" />
                <span className="text-ink-light">→</span>
                <FsmStep label="Paga" />
                <span className="text-ink-light">→</span>
                <FsmStep label="Exec." />
                <span className="text-ink-light">→</span>
                <FsmStep label="Concl." />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setEtapa(2)} className="flex-1">← Voltar</Button>
              <Button onClick={criarDemanda} loading={criando} className="flex-1">
                Confirmar →
              </Button>
            </div>
          </>
        )}
      </main>
    </Shell>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-ink-muted">{label}</span>
      <span className="font-semibold text-navy text-right">{value}</span>
    </div>
  )
}

function FsmStep({ label, current }: { label: string; current?: boolean }) {
  return (
    <div
      className={`flex-1 px-1 py-1.5 rounded text-center border ${
        current ? 'bg-orange text-white border-orange animate-pulse' : 'bg-surface text-ink-muted border-surface-border'
      }`}
    >
      {label}
    </div>
  )
}
