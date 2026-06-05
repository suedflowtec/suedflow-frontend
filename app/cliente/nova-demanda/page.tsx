// app/cliente/nova-demanda/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell, StatusBar } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'
import { Input, Field, Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { svc as svcApi, sue, orders } from '@/lib/api'
import { formatBRL } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'

type Etapa = 1 | 2 | 3
type SVC = { codigo: string; nome: string; descricao?: string; uts_res: number; uts_com: number; uts_ind: number; piso: number; teto: number; sla_dias: number }

export default function NovaDemandaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [etapa, setEtapa] = useState<Etapa>(1)
  const [svcs, setSvcs] = useState<SVC[]>([])
  const [svcSelecionado, setSvcSelecionado] = useState<SVC | null>(null)
  const [descricaoSue, setDescricaoSue] = useState('')
  const [loadingSue, setLoadingSue] = useState(false)
  const [imovel, setImovel] = useState({
    tipo_imovel: 'RESIDENCIAL' as 'RESIDENCIAL' | 'COMERCIAL' | 'INDUSTRIAL',
    area_m2: '',
    estado: 'PB',
    cidade: 'João Pessoa',
    endereco: '',
    descricao: '',
    urgencia: 'NORMAL' as 'NORMAL' | 'PRIORITARIA' | 'URGENTE',
  })
  const [precoCalc, setPrecoCalc] = useState<any>(null)
  const [criando, setCriando] = useState(false)

  useEffect(() => {
    svcApi.listar()
      .then(d => setSvcs(Array.isArray(d) ? d : []))
      .catch(() => toast('Erro ao carregar serviços', 'error'))
  }, [toast])

  // Calcular preço quando dados do imóvel mudarem
  useEffect(() => {
    if (etapa !== 2 || !svcSelecionado || !imovel.area_m2) { setPrecoCalc(null); return }
    const t = setTimeout(() => {
      orders.calcularPreco({
        svc_codigo: svcSelecionado.codigo,
        tipo_imovel: imovel.tipo_imovel,
        area_m2: Number(imovel.area_m2),
        urgencia: imovel.urgencia,
        estado: imovel.estado,
      })
        .then(setPrecoCalc)
        .catch(() => {
          // fallback: cálculo local simples
          const mult = { RESIDENCIAL: 1.0, COMERCIAL: 1.3, INDUSTRIAL: 1.7 }[imovel.tipo_imovel]
          const urg = { NORMAL: 1.0, PRIORITARIA: 1.3, URGENTE: 1.6 }[imovel.urgencia]
          const base = svcSelecionado.uts_res * 100
          const servico = Math.round(base * mult * urg * Math.max(1, Number(imovel.area_m2) / 100))
          const art = 108.39, taxa = 11.61
          setPrecoCalc({ preco_servico: servico, art_fee: art, taxa_plataforma: taxa, preco_cliente: servico + art + taxa, prazo_dias: svcSelecionado.sla_dias })
        })
    }, 400)
    return () => clearTimeout(t)
  }, [etapa, svcSelecionado, imovel])

  const buscarSue = async () => {
    if (!descricaoSue.trim()) return
    setLoadingSue(true)
    try {
      const r = await sue.buscarSvc(descricaoSue)
      const cod = r.svc_codigo || r.codigo
      const found = svcs.find(s => s.codigo === cod)
      if (found) {
        setSvcSelecionado(found)
        toast(`SUE identificou: ${found.nome}`, 'success')
        setEtapa(2)
      } else {
        toast('SUE não encontrou serviço · escolha manualmente', 'info')
      }
    } catch {
      toast('Erro ao consultar SUE', 'error')
    } finally {
      setLoadingSue(false)
    }
  }

  const criarDemanda = async () => {
    if (!svcSelecionado || !precoCalc) return
    setCriando(true)
    try {
      const d = await orders.criar({
        svc_codigo: svcSelecionado.codigo,
        tipo_imovel: imovel.tipo_imovel,
        area_m2: Number(imovel.area_m2),
        estado: imovel.estado,
        cidade: imovel.cidade,
        endereco: imovel.endereco,
        descricao: imovel.descricao,
        urgencia: imovel.urgencia,
      })
      toast('Demanda criada com sucesso!', 'success')
      router.push(`/cliente/demandas/${d.id}`)
    } catch (err: any) {
      toast(err.message || 'Erro ao criar demanda', 'error')
    } finally {
      setCriando(false)
    }
  }

  return (
    <AppShell>
      <StatusBar />
      <div className="px-5 pt-4 pb-12">
        <button onClick={() => router.back()} className="back-btn mb-4">←</button>

        <h1 className="text-2xl font-black mb-1">Nova demanda</h1>
        <p className="text-sm text-white/65 mb-5">Etapa {etapa} de 3</p>

        {/* Stepper */}
        <div className="flex gap-1.5 mb-6">
          {[1, 2, 3].map(n => (
            <div
              key={n}
              className="flex-1 h-1 rounded-full transition-colors"
              style={{
                background: n <= etapa ? 'linear-gradient(90deg, #E8671A, #FF7A2E)' : 'rgba(255,255,255,0.1)',
              }}
            />
          ))}
        </div>

        {/* ───────── ETAPA 1 · Escolher serviço ───────── */}
        {etapa === 1 && (
          <>
            <div className="glass-card-accent mb-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white" style={{ background: 'linear-gradient(135deg, #9B6DFF, #7C3AED)' }}>S</div>
                <p className="text-sm font-bold">SUE · Pergunte para a IA</p>
              </div>
              <p className="text-xs text-white/65 mb-3">
                Descreva o que precisa em linguagem natural. Ex: "trincas no teto" ou "vou comprar um apartamento".
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Descreva sua necessidade..."
                  value={descricaoSue}
                  onChange={e => setDescricaoSue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') buscarSue() }}
                />
                <Button onClick={buscarSue} loading={loadingSue} size="sm" className="!px-4">
                  Identificar
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] text-white/45 uppercase tracking-wider">ou escolha</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <div className="space-y-2">
              {svcs.length === 0 ? (
                <p className="text-center text-white/50 py-6">Carregando serviços...</p>
              ) : svcs.filter(s => s.codigo !== 'SVC000').map(s => (
                <button
                  key={s.codigo}
                  onClick={() => { setSvcSelecionado(s); setEtapa(2) }}
                  className={`glass-card w-full text-left transition-all ${svcSelecionado?.codigo === s.codigo ? 'ring-2 ring-orange' : 'hover:border-orange'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-mono text-white/50">{s.codigo}</span>
                    <Badge variant="orange">a partir de {formatBRL(s.piso || 680)}</Badge>
                  </div>
                  <p className="text-sm font-bold mb-1">{s.nome}</p>
                  <p className="text-xs text-white/60 line-clamp-2">{s.descricao || 'Serviço técnico SUEDFLOW'}</p>
                  <div className="flex gap-3 mt-2 text-[11px] text-white/50">
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
            <div className="glass-card mb-4 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-white/50 font-mono">{svcSelecionado.codigo}</p>
                <p className="text-sm font-bold">{svcSelecionado.nome}</p>
              </div>
              <button onClick={() => setEtapa(1)} className="text-xs text-orange font-semibold">Trocar</button>
            </div>

            <div className="space-y-3 mb-4">
              <Field label="Tipo de imóvel" required>
                <select className="input-field" value={imovel.tipo_imovel} onChange={e => setImovel(i => ({ ...i, tipo_imovel: e.target.value as any }))}>
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
                  <select className="input-field" value={imovel.estado} onChange={e => setImovel(i => ({ ...i, estado: e.target.value }))}>
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
                  {(['NORMAL', 'PRIORITARIA', 'URGENTE'] as const).map(u => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setImovel(i => ({ ...i, urgencia: u }))}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${imovel.urgencia === u ? 'text-white' : 'text-white/60'}`}
                      style={imovel.urgencia === u
                        ? { background: 'linear-gradient(135deg, #E8671A, #FF7A2E)' }
                        : { background: 'var(--glass)', border: '1px solid var(--border)' }}
                    >
                      {u === 'NORMAL' ? 'Normal' : u === 'PRIORITARIA' ? '+30%' : '+60%'}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            {/* Motor UTS · preview de preço */}
            {precoCalc && (
              <div className="glass-card-accent mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-orange">⚡</span>
                  <p className="text-[11px] uppercase tracking-wider font-bold text-orange">Motor UTS · Preço estimado</p>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-white/70"><span>Serviço</span><span>{formatBRL(precoCalc.preco_servico || 0)}</span></div>
                  <div className="flex justify-between text-white/70"><span>ART/RRT</span><span>{formatBRL(precoCalc.art_fee || 0)}</span></div>
                  <div className="flex justify-between text-white/70"><span>Taxa plataforma</span><span>{formatBRL(precoCalc.taxa_plataforma || 0)}</span></div>
                  <div className="border-t border-white/10 my-2" />
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total</span>
                    <span className="text-2xl font-black text-orange">{formatBRL(precoCalc.preco_cliente || 0)}</span>
                  </div>
                </div>
                <p className="text-[10px] text-white/50 mt-2">
                  Profissional pode ajustar ±15% (autonomia técnica · STF Tema 1291)
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
            <div className="glass-card mb-3">
              <p className="text-[11px] uppercase tracking-wider font-bold text-white/65 mb-2">Resumo</p>
              <div className="space-y-1.5 text-sm">
                <Row label="Serviço" value={`${svcSelecionado.codigo} · ${svcSelecionado.nome}`} />
                <Row label="Tipo" value={`${imovel.tipo_imovel} · ${imovel.area_m2}m²`} />
                <Row label="Local" value={`${imovel.cidade}, ${imovel.estado}`} />
                <Row label="Urgência" value={imovel.urgencia === 'NORMAL' ? 'Normal' : imovel.urgencia === 'PRIORITARIA' ? 'Prioritária' : 'Urgente'} />
                <Row label="Prazo" value={`${precoCalc.prazo_dias || svcSelecionado.sla_dias || 5} dias úteis`} />
              </div>
            </div>

            <div className="glass-card-accent mb-4 text-center">
              <p className="text-[11px] uppercase tracking-wider font-bold text-orange mb-1">Total a pagar</p>
              <p className="text-4xl font-black text-orange mb-1">{formatBRL(precoCalc.preco_cliente)}</p>
              <p className="text-xs text-white/60">PIX via Pagar.me · Escrow protegido</p>
            </div>

            {/* FSM */}
            <div className="glass-card mb-4">
              <p className="text-[11px] uppercase tracking-wider font-bold text-white/65 mb-3">Fluxo</p>
              <div className="flex gap-1 items-center text-[10px] font-bold uppercase">
                <FsmStep label="Aguard." current />
                <span className="text-white/30">→</span>
                <FsmStep label="Aceita" />
                <span className="text-white/30">→</span>
                <FsmStep label="Paga" />
                <span className="text-white/30">→</span>
                <FsmStep label="Exec." />
                <span className="text-white/30">→</span>
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
      </div>
    </AppShell>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-white/60">{label}</span>
      <span className="font-semibold text-right">{value}</span>
    </div>
  )
}

function FsmStep({ label, current }: { label: string; current?: boolean }) {
  return (
    <div
      className="flex-1 px-1 py-1.5 rounded-md text-center text-[9px]"
      style={{
        background: current ? 'linear-gradient(135deg, #E8671A, #FF7A2E)' : 'var(--glass)',
        border: '1px solid var(--border)',
        color: current ? 'white' : 'var(--text2)',
        animation: current ? 'pulseOrange 2s ease-in-out infinite' : 'none',
      }}
    >
      {label}
    </div>
  )
}
