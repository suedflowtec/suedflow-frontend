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
type SVC = { codigo: string; nome: string; descricao?: string; uts_res: number; uts_com: number; uts_ind: number; piso: number; teto: number; sla_dias: number; area_max_res?: number | null; area_max_com?: number | null; area_max_ind?: number | null }
type MensagemSue = { autor: 'sue' | 'usuario'; texto: string; svc?: SVC }

const SVC_IMG: Record<string, string> = {
  SVC000: '/imagens/svc000.png',
  SVC001: '/imagens/svc001.png',
  SVC002: '/imagens/svc002.png',
  SVC003: '/imagens/svc003.png',
  SVC004: '/imagens/svc004.png',
  SVC005: '/imagens/svc005.png',
  SVC006: '/imagens/svc006.png',
  SVC007: '/imagens/svc007.png',
  SVC008: '/imagens/svc008.png',
  SVC009: '/imagens/svc009.png',
  SVC010: '/imagens/svc010.png',
  SVC011: '/imagens/svc011.png',
}

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
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    ponto_referencia: '',
    descricao: '',
    urgencia: 'NORMAL' as 'NORMAL' | 'PRIORITARIO' | 'URGENTE',
  })
  const [cep, setCep] = useState('')
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [precoCalc, setPrecoCalc] = useState<any>(null)
  const [criando, setCriando] = useState(false)
  const [nivelCliente, setNivelCliente] = useState<'' | 'CANDIDATO' | 'PLENO' | 'SENIOR' | 'ELITE'>('')
  const [svc009Sub, setSvc009Sub] = useState<'' | 'ORCAMENTACAO' | 'LEVANTAMENTO' | 'MEDICAO' | 'AUDITORIA'>('')

  const SVC009_SUBS = [
    {
      id: 'ORCAMENTACAO' as const,
      label: 'Orçamentação de Obra',
      desc: 'Planilha de custos por etapas com referência SINAPI — ideal antes de contratar uma construtora',
      entrega: 'Planilha orçamentária + memorial de composição de custos + ART/RRT',
      sla: '10 dias úteis',
    },
    {
      id: 'LEVANTAMENTO' as const,
      label: 'Levantamento Arquitetônico (As-Built)',
      desc: 'Planta do imóvel como construído — quando não existe projeto original ou houve alterações',
      entrega: 'Planta cotada de todos os pavimentos + ART/RRT',
      sla: '7 dias úteis',
    },
    {
      id: 'MEDICAO' as const,
      label: 'Medição de Obra para Pagamento',
      desc: 'Certificação técnica independente do que foi executado — pague a construtora só pelo que está pronto',
      entrega: 'Relatório de medição certificado com fotos das etapas aferidas + ART/RRT',
      sla: '5 dias úteis',
    },
    {
      id: 'AUDITORIA' as const,
      label: 'Auditoria de Obra',
      desc: 'Verificação técnica da conformidade da execução com o projeto e normas — detecta irregularidades',
      entrega: 'Relatório de não-conformidades com fotos e referência normativa + ART/RRT',
      sla: '7 dias úteis',
    },
  ]

  useEffect(() => {
    svcApi.listar()
      .then((d: any) => setSvcs(Array.isArray(d) ? d : (d?.servicos || [])))
      .catch(() => toast('Erro ao carregar serviços', 'error'))
  }, [toast])

  useEffect(() => {
    if (etapa === 3) return
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

  const buscarCep = async () => {
    const c = cep.replace(/\D/g, '')
    if (c.length !== 8) { toast('CEP deve ter 8 dígitos.', 'error'); return }
    setBuscandoCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${c}/json/`)
      const data = await res.json()
      if (data.erro) { toast('CEP não encontrado.', 'error'); return }
      setImovel(i => ({
        ...i,
        estado:     data.uf || i.estado,
        cidade:     data.localidade || i.cidade,
        logradouro: data.logradouro || i.logradouro,
        bairro:     data.bairro || i.bairro,
      }))
    } catch {
      toast('Não foi possível buscar o CEP. Preencha manualmente.', 'error')
    } finally {
      setBuscandoCep(false)
    }
  }

  const buscarSue = async () => {
    const texto = descricaoSue.trim()
    if (!texto) return
    if (texto.length < 10) {
      setMensagensSue(m => [...m, { autor: 'sue', texto: 'Descreva um pouco mais — preciso de pelo menos 10 caracteres para entender a necessidade.' }])
      return
    }
    setMensagensSue(m => [...m, { autor: 'usuario', texto }])
    setDescricaoSue('')
    setLoadingSue(true)
    try {
      const r = await sue.buscarSvc(texto)
      const cod = r.svc_sugerido
      const found = svcs.find(s => s.codigo === cod)
      if (found) {
        const confianca = r.confianca ? ` (${Math.round(r.confianca * 100)}% de confiança)` : ''
        setMensagensSue(m => [...m, {
          autor: 'sue',
          texto: (r.justificativa || `Pelo que você descreveu, recomendo o serviço "${found.nome}".`) + confianca,
          svc: found,
        }])
      } else {
        setMensagensSue(m => [...m, { autor: 'sue', texto: 'Não consegui identificar um serviço específico para essa descrição. Tente detalhar mais — por exemplo: "tenho trincas no teto do apartamento" — ou escolha manualmente ao lado.' }])
      }
    } catch {
      setMensagensSue(m => [...m, { autor: 'sue', texto: 'Não foi possível consultar agora. Escolha o serviço manualmente na lista ao lado.' }])
    } finally {
      setLoadingSue(false)
    }
  }

  const usarSvcSugerido = (s: SVC) => { setSvcSelecionado(s); setEtapa(2) }

  const criarDemanda = async () => {
    if (!svcSelecionado) { toast('Selecione um serviço antes de continuar.', 'error'); return }
    if (!precoCalc) { toast('Aguarde o cálculo de preço finalizar.', 'error'); return }
    setCriando(true)
    try {
      const enderecoCompleto = [imovel.logradouro, imovel.numero, imovel.complemento, imovel.bairro].filter(Boolean).join(', ')
      const d = await orders.criar({
        codigoSvc: svcSelecionado.codigo,
        tipoImovel: imovel.tipo_imovel,
        areaM2: Number(imovel.area_m2),
        estado: imovel.estado,
        cidade: imovel.cidade,
        endereco: enderecoCompleto,
        cep: cep.replace(/\D/g, '') || undefined,
        logradouro: imovel.logradouro || undefined,
        numero: imovel.numero || undefined,
        complemento: imovel.complemento || undefined,
        bairro: imovel.bairro || undefined,
        ponto_referencia: imovel.ponto_referencia || undefined,
        descricao: imovel.descricao,
        urgencia: imovel.urgencia,
        meioPagamento: 'PIX',
        nivel_minimo_cliente: nivelCliente || undefined,
        svc_subservico: svcSelecionado?.codigo === 'SVC009' ? svc009Sub || undefined : undefined,
      })
      if (!d?.demanda?.id) throw new Error('Resposta inesperada do servidor ao criar demanda.')
      if (d.demanda.status === 'DEMANDA_ESPECIAL') {
        toast('Demanda registrada! Área especial — curador sênior irá precificar antes do pagamento.', 'success')
      } else {
        toast('Demanda criada! Aguardando profissional disponível.', 'success')
      }
      router.push(`/cliente/demandas/${d.demanda.id}`)
    } catch (err: any) {
      toast(err.message || 'Erro ao criar demanda. Tente novamente.', 'error')
    } finally {
      setCriando(false)
    }
  }

  return (
    <Shell>
      <Topbar title="Nova demanda" />

      <main className="p-6 lg:p-8">
        <div className="max-w-[1100px] mx-auto">

          {/* Stepper */}
          <div className="space-y-2 mb-8">
            <p className="text-sm" style={{ color: 'var(--text3)' }}>Etapa {etapa} de 3</p>
            <div className="flex gap-1.5">
              {[1, 2, 3].map(n => (
                <div
                  key={n}
                  className="flex-1 h-1 rounded-full transition-colors"
                  style={{ background: n <= etapa ? 'var(--orange)' : 'var(--navy3)' }}
                />
              ))}
            </div>
          </div>

          {/* ───────── ETAPA 1 · Escolher serviço ───────── */}
          {etapa === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Coluna esquerda: SUE */}
              <div>
                <p className="section-label mb-3">Assistente SUE</p>
                <div className="card-accent">
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ background: 'var(--orange)' }}
                    >S</div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>SUE · Assistente de serviços</p>
                  </div>

                  <div className="space-y-2 mb-3 max-h-80 overflow-y-auto pr-1">
                    {mensagensSue.map((m, i) => (
                      <div key={i} className={`flex ${m.autor === 'usuario' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${
                            m.autor === 'usuario' ? 'bg-orange text-white rounded-br-none' : 'rounded-bl-none'
                          }`}
                          style={m.autor === 'usuario' ? undefined : { background: 'var(--navy3)', color: 'var(--text)', border: '1px solid var(--border)' }}
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
                        <div
                          className="max-w-[85%] rounded-lg px-3 py-2 text-xs rounded-bl-none"
                          style={{ background: 'var(--navy3)', color: 'var(--text3)', border: '1px solid var(--border)' }}
                        >
                          SUE está digitando...
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Input
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
              </div>

              {/* Coluna direita: seleção visual de serviços */}
              <div>
                <p className="section-label mb-3">Ou escolha manualmente</p>
                <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1 pb-2">
                  {svcs.length === 0 ? (
                    <p className="text-center text-sm py-6" style={{ color: 'var(--text3)' }}>Carregando serviços...</p>
                  ) : svcs.filter(s => s.codigo !== 'SVC000').map(s => (
                    <button
                      key={s.codigo}
                      onClick={() => { setSvcSelecionado(s); setEtapa(2) }}
                      className="w-full text-left rounded-xl overflow-hidden transition-all"
                      style={{
                        background: 'var(--navy2)',
                        border: svcSelecionado?.codigo === s.codigo
                          ? '1.5px solid var(--orange)'
                          : '1.5px solid rgba(255,255,255,0.08)',
                        boxShadow: svcSelecionado?.codigo === s.codigo
                          ? '0 0 0 2px rgba(232,103,26,0.25)'
                          : undefined,
                      }}
                    >
                      {/* Image header */}
                      <div className="relative overflow-hidden" style={{ height: 76 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={SVC_IMG[s.codigo] || '/imagens/svc001.png'}
                          alt={s.nome}
                          className="w-full h-full object-cover"
                        />
                        <div
                          className="absolute inset-0"
                          style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(6,24,40,0.82))' }}
                        />
                        <span
                          className="absolute bottom-1.5 left-2.5 text-2xs font-mono font-bold"
                          style={{ color: 'rgba(255,255,255,0.55)' }}
                        >
                          {s.codigo}
                        </span>
                      </div>
                      {/* Content row */}
                      <div className="px-3 py-2 flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{s.nome}</p>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-2xs" style={{ color: 'var(--text3)' }}>⏱ {s.sla_dias || 5}d</span>
                          <Badge variant="orange">a partir de {formatBRL(s.piso || 680)}</Badge>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ───────── ETAPA 2 · Dados do imóvel ───────── */}
          {etapa === 2 && svcSelecionado && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
              {/* Coluna esquerda: formulário */}
              <div className="lg:col-span-3 space-y-4">
                <div className="card flex justify-between items-center">
                  <div>
                    <p className="text-2xs font-mono" style={{ color: 'var(--text3)' }}>{svcSelecionado.codigo}</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{svcSelecionado.nome}</p>
                  </div>
                  <button onClick={() => setEtapa(1)} className="text-xs font-semibold hover:underline" style={{ color: 'var(--orange)' }}>Trocar</button>
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
                  <Field label="CEP" hint="Preencha o CEP para localizar automaticamente">
                    <div className="flex gap-2">
                      <input
                        className="input flex-1"
                        type="text"
                        inputMode="numeric"
                        maxLength={9}
                        value={cep}
                        onChange={e => setCep(e.target.value.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').slice(0, 9))}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); buscarCep() } }}
                        placeholder="00000-000"
                      />
                      <button
                        type="button"
                        onClick={buscarCep}
                        disabled={buscandoCep || cep.replace(/\D/g, '').length !== 8}
                        className="btn btn-secondary btn-sm shrink-0"
                      >
                        {buscandoCep ? 'Buscando...' : 'Buscar CEP'}
                      </button>
                    </div>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Estado" required>
                      <Input value={imovel.estado} onChange={e => setImovel(i => ({ ...i, estado: e.target.value.toUpperCase().slice(0, 2) }))} placeholder="PB" />
                    </Field>
                    <Field label="Cidade" required>
                      <Input value={imovel.cidade} onChange={e => setImovel(i => ({ ...i, cidade: e.target.value }))} />
                    </Field>
                  </div>
                  <Field label="Logradouro (rua/avenida)" required>
                    <Input value={imovel.logradouro} onChange={e => setImovel(i => ({ ...i, logradouro: e.target.value }))} placeholder="Rua das Flores" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Número" required>
                      <Input value={imovel.numero} onChange={e => setImovel(i => ({ ...i, numero: e.target.value }))} placeholder="123" />
                    </Field>
                    <Field label="Complemento">
                      <Input value={imovel.complemento} onChange={e => setImovel(i => ({ ...i, complemento: e.target.value }))} placeholder="Apto 301, Bloco B..." />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Bairro">
                      <Input value={imovel.bairro} onChange={e => setImovel(i => ({ ...i, bairro: e.target.value }))} placeholder="Centro" />
                    </Field>
                    <Field label="Ponto de referência">
                      <Input value={imovel.ponto_referencia} onChange={e => setImovel(i => ({ ...i, ponto_referencia: e.target.value }))} placeholder="Próximo ao mercado..." />
                    </Field>
                  </div>
                  <Field label="Descreva a necessidade" hint="Ajuda o profissional a se preparar">
                    <Textarea value={imovel.descricao} onChange={e => setImovel(i => ({ ...i, descricao: e.target.value }))} placeholder="Ex: trincas no teto da sala desde a obra do vizinho..." />
                  </Field>
                  {/* SVC009 — sub-serviço obrigatório */}
                  {svcSelecionado?.codigo === 'SVC009' && (
                    <Field label="Qual assistência você precisa? (obrigatório — 1 por demanda)">
                      <div className="space-y-2">
                        {SVC009_SUBS.map(sub => {
                          const sel = svc009Sub === sub.id
                          return (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => setSvc009Sub(sub.id)}
                              className="w-full text-left p-3 rounded-xl border transition-colors"
                              style={{
                                background: sel ? 'rgba(232,103,26,0.10)' : 'var(--navy3)',
                                borderColor: sel ? 'rgba(232,103,26,0.5)' : 'var(--border)',
                              }}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold" style={{ color: sel ? 'var(--orange)' : 'var(--text)' }}>{sub.label}</p>
                                <span className="text-2xs shrink-0 mt-0.5" style={{ color: 'var(--text3)' }}>{sub.sla}</span>
                              </div>
                              <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{sub.desc}</p>
                              {sel && (
                                <p className="text-2xs mt-1.5 font-semibold" style={{ color: 'var(--orange)' }}>
                                  ✓ Entrega: {sub.entrega}
                                </p>
                              )}
                            </button>
                          )
                        })}
                        {!svc009Sub && (
                          <p className="text-2xs" style={{ color: 'var(--red)' }}>Selecione o sub-serviço para continuar</p>
                        )}
                      </div>
                    </Field>
                  )}

                  {/* Nível do profissional — seletor estilo Uber */}
                  <Field label="Nível do profissional">
                    <div className="space-y-2">
                      <p className="text-2xs" style={{ color: 'var(--text3)' }}>
                        Escolha o nível de experiência desejado. Profissionais mais experientes têm histórico verificado de demandas concluídas com qualidade.
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {([
                          { nivel: '', label: 'Qualquer profissional', desc: 'Preço base', mult: 1.00, disponivel: true },
                          { nivel: 'PLENO', label: 'Pleno ou acima', desc: '+18% · 400+ pts SQP', mult: 1.18, disponivel: false },
                          { nivel: 'SENIOR', label: 'Sênior ou acima', desc: '+30% · 600+ pts SQP', mult: 1.30, disponivel: false },
                          { nivel: 'ELITE', label: 'Elite', desc: '+45% · 800+ pts SQP', mult: 1.45, disponivel: false },
                        ] as const).map(op => {
                          const sel = nivelCliente === op.nivel
                          return (
                            <button
                              key={op.nivel}
                              type="button"
                              disabled={!op.disponivel}
                              onClick={() => op.disponivel && setNivelCliente(op.nivel as any)}
                              className={`py-2.5 px-3 rounded-xl text-left border transition-colors ${!op.disponivel ? 'opacity-40 cursor-not-allowed' : ''}`}
                              style={{
                                background: sel ? 'rgba(232,103,26,0.12)' : 'var(--navy3)',
                                borderColor: sel ? 'rgba(232,103,26,0.5)' : 'var(--border)',
                              }}
                            >
                              <p className="text-xs font-semibold" style={{ color: sel ? 'var(--orange)' : 'var(--text)' }}>{op.label}</p>
                              <p className="text-2xs mt-0.5" style={{ color: 'var(--text3)' }}>
                                {!op.disponivel ? '🔒 Em breve · nenhum disponível ainda' : op.desc}
                              </p>
                              {op.disponivel && precoCalc && op.mult > 1 && (
                                <p className="text-2xs font-mono font-bold mt-0.5" style={{ color: 'var(--orange)' }}>
                                  ≈ {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((precoCalc.preco_cliente || 0) * op.mult)}
                                </p>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </Field>

                  <Field label="Urgência">
                    <div className="grid grid-cols-3 gap-2">
                      {(['NORMAL', 'PRIORITARIO', 'URGENTE'] as const).map(u => {
                        const baseSla = svcSelecionado?.sla_dias || 5
                        const slaMap = { NORMAL: baseSla, PRIORITARIO: Math.max(1, Math.ceil(baseSla * 0.7)), URGENTE: Math.max(1, Math.ceil(baseSla * 0.5)) }
                        const sla = slaMap[u]
                        return (
                          <button
                            key={u}
                            type="button"
                            onClick={() => setImovel(i => ({ ...i, urgencia: u }))}
                            className={`py-2.5 px-2 rounded text-xs font-semibold border transition-colors ${
                              imovel.urgencia === u ? 'bg-orange text-white border-orange' : 'hover:bg-white/5'
                            }`}
                            style={imovel.urgencia === u ? undefined : { background: 'var(--navy3)', color: 'var(--text2)', borderColor: 'var(--border)' }}
                          >
                            <span className="block">{u === 'NORMAL' ? 'Normal' : u === 'PRIORITARIO' ? 'Prioritário +30%' : 'Urgente +60%'}</span>
                            <span className="block font-normal opacity-70 mt-0.5">{sla}d úteis</span>
                          </button>
                        )
                      })}
                    </div>
                  </Field>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="ghost" onClick={() => setEtapa(1)} className="flex-1">← Voltar</Button>
                  <Button
                    onClick={() => setEtapa(3)}
                    disabled={!imovel.area_m2 || !imovel.logradouro || !imovel.numero || !precoCalc || (svcSelecionado?.codigo === 'SVC009' && !svc009Sub)}
                    loading={!!(imovel.area_m2 && imovel.logradouro && imovel.numero && !precoCalc)}
                    className="flex-1"
                  >
                    {imovel.area_m2 && imovel.logradouro && imovel.numero && !precoCalc ? 'Calculando...' : 'Continuar →'}
                  </Button>
                </div>
              </div>

              {/* Coluna direita: preview de preço (sticky) */}
              <div className="lg:col-span-2 lg:sticky lg:top-[72px] space-y-4">
                {!imovel.area_m2 ? (
                  <div className="card text-center py-10">
                    <p className="text-3xl mb-3">⚡</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text2)' }}>Preço calculado automaticamente</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>Informe a área do imóvel para ver o valor estimado</p>
                  </div>
                ) : !precoCalc ? (
                  <div className="card-accent text-center py-10">
                    <p className="text-sm" style={{ color: 'var(--text3)' }}>⚡ Calculando preço...</p>
                  </div>
                ) : (
                  <div className="card-accent">
                    <div className="flex items-center gap-2 mb-4">
                      <span style={{ color: 'var(--orange)' }}>⚡</span>
                      <p className="text-2xs uppercase tracking-wider font-semibold" style={{ color: 'var(--orange)' }}>Motor UTS · Preço estimado</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between" style={{ color: 'var(--text2)' }}>
                        <span>Serviço</span>
                        <span className="font-mono">{formatBRL(precoCalc.preco_servico || 0)}</span>
                      </div>
                      <div className="flex justify-between" style={{ color: 'var(--text2)' }}>
                        <span>
                          Responsabilidade Técnica
                          <span className="block text-2xs" style={{ color: 'var(--text3)' }}>ART/RRT · repasse ao CREA/CAU</span>
                        </span>
                        <span className="font-mono">{formatBRL(precoCalc.art_fee || 0)}</span>
                      </div>
                      <div className="my-3" style={{ borderTop: '1px solid var(--border)' }} />
                      <div className="flex justify-between items-center">
                        <span className="font-semibold" style={{ color: 'var(--text)' }}>Total estimado</span>
                        <span className="text-2xl font-bold font-mono" style={{ color: 'var(--orange)' }}>
                          {formatBRL(precoCalc.preco_cliente || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1" style={{ color: 'var(--text2)' }}>
                        <span>Prazo de entrega</span>
                        <span className="font-semibold" style={{ color: 'var(--green)' }}>
                          {precoCalc.prazo_dias || svcSelecionado?.sla_dias || '—'} dias úteis
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <p className="text-2xs font-semibold mb-1" style={{ color: 'var(--text2)' }}>Faixa de pagamento</p>
                      <p className="text-xs font-mono" style={{ color: 'var(--text)' }}>
                        {formatBRL(Math.floor(precoCalc.preco_cliente * 0.85))} até {formatBRL(precoCalc.preco_cliente)}
                      </p>
                      <p className="text-2xs mt-1" style={{ color: 'var(--text3)' }}>
                        O profissional pode oferecer desconto de até 15% sobre o valor calculado.
                        Você será notificado do valor final antes de pagar.
                      </p>
                    </div>
                  </div>
                )}

                {precoCalc?.area_especial && (
                  <div className="card" style={{ borderColor: 'var(--gold)' }}>
                    <p className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>⚠ Demanda especial</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text2)' }}>
                      Área acima do padrão para este serviço. Um curador sênior fará a precificação final após o registro.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ───────── ETAPA 3 · Confirmação ───────── */}
          {etapa === 3 && svcSelecionado && !precoCalc && (
            <div className="card text-center py-10">
              <p className="text-sm" style={{ color: 'var(--text3)' }}>Calculando preço final...</p>
            </div>
          )}
          {etapa === 3 && svcSelecionado && precoCalc && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
              {/* Coluna esquerda: resumo + fluxo */}
              <div className="lg:col-span-3 space-y-4">
                <div className="card">
                  <p className="section-label mb-3">Resumo da demanda</p>
                  <div className="space-y-2 text-sm">
                    <Row label="Serviço" value={`${svcSelecionado.codigo} · ${svcSelecionado.nome}`} />
                    <Row label="Imóvel" value={`${imovel.tipo_imovel} · ${imovel.area_m2}m²`} />
                    <Row label="Local" value={`${imovel.cidade}, ${imovel.estado}`} />
                    <Row label="Urgência" value={imovel.urgencia === 'NORMAL' ? 'Normal' : imovel.urgencia === 'PRIORITARIO' ? 'Prioritária (+30%)' : 'Urgente (+60%)'} />
                    <Row label="Prazo estimado" value={`${precoCalc.prazo_dias || svcSelecionado.sla_dias || 5} dias úteis`} />
                  </div>
                </div>

                <div className="card-solid">
                  <p className="section-label mb-3">Fluxo após confirmação</p>
                  <div className="flex gap-1 items-center text-2xs font-semibold uppercase">
                    <FsmStep label="Aguard." current />
                    <span style={{ color: 'var(--text3)' }}>→</span>
                    <FsmStep label="Aceita" />
                    <span style={{ color: 'var(--text3)' }}>→</span>
                    <FsmStep label="Paga" />
                    <span style={{ color: 'var(--text3)' }}>→</span>
                    <FsmStep label="Exec." />
                    <span style={{ color: 'var(--text3)' }}>→</span>
                    <FsmStep label="Concl." />
                  </div>
                </div>

                <div className="flex">
                  <Button variant="ghost" onClick={() => setEtapa(2)}>← Voltar</Button>
                </div>
              </div>

              {/* Coluna direita: total + confirmação (sticky) */}
              <div className="lg:col-span-2 lg:sticky lg:top-[72px] space-y-4">
                <div className="card-accent text-center py-6">
                  <p className="text-2xs uppercase tracking-wider font-semibold mb-2" style={{ color: 'var(--orange)' }}>Valor base estimado</p>
                  <p className="text-4xl font-bold font-mono mb-1" style={{ color: 'var(--orange)' }}>
                    {formatBRL(precoCalc.preco_cliente)}
                  </p>
                  <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>PIX via ASAAS · Escrow protegido</p>
                  <div className="rounded-lg px-3 py-2 text-left" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <p className="text-2xs font-semibold mb-0.5" style={{ color: 'var(--text2)' }}>Faixa de pagamento</p>
                    <p className="text-xs font-mono" style={{ color: 'var(--text)' }}>
                      {formatBRL(Math.floor(precoCalc.preco_cliente * 0.85))} — {formatBRL(precoCalc.preco_cliente)}
                    </p>
                    <p className="text-2xs mt-1" style={{ color: 'var(--text3)' }}>
                      O profissional pode oferecer desconto de até 15%. Você será notificado do valor final antes de pagar.
                    </p>
                  </div>
                </div>
                <Button onClick={criarDemanda} loading={criando} className="w-full btn-lg">
                  Confirmar e criar demanda →
                </Button>
                <p className="text-2xs text-center" style={{ color: 'var(--text3)' }}>
                  Ao confirmar, sua demanda fica visível para profissionais qualificados na sua região.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </Shell>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span style={{ color: 'var(--text3)' }}>{label}</span>
      <span className="font-semibold text-right" style={{ color: 'var(--text)' }}>{value}</span>
    </div>
  )
}

function FsmStep({ label, current }: { label: string; current?: boolean }) {
  return (
    <div
      className={`flex-1 px-1 py-1.5 rounded text-center border ${current ? 'bg-orange text-white border-orange animate-pulse' : ''}`}
      style={current ? undefined : { background: 'var(--navy3)', color: 'var(--text3)', borderColor: 'var(--border)' }}
    >
      {label}
    </div>
  )
}
