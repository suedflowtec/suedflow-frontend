'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { orders, profissional as profissionalApi } from '@/lib/api'
import { formatBRL } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { Home, Building2, Factory, Radar, MapPin, Ruler, Clock, GraduationCap, Activity } from 'lucide-react'
import Link from 'next/link'

export default function ProfissionalFeed() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [demandas, setDemandas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [carga, setCarga] = useState<any>(null)
  const [aceitando, setAceitando] = useState<string | null>(null)
  const [ajusteAtivo, setAjusteAtivo] = useState<string | null>(null)
  const [ajustes, setAjustes] = useState<Record<string, number>>({})

  const carregar = () => {
    setLoading(true)
    Promise.all([
      orders.feed(),
      profissionalApi.carga().catch(() => null),
    ]).then(([feed, c]) => {
      setDemandas(feed?.demandas || [])
      if (c) setCarga(c)
    }).catch(err => {
      if (err.status === 403) toast(err.message || 'KYC ou módulo pendente', 'error')
      else toast('Erro ao carregar feed', 'error')
    }).finally(() => setLoading(false))
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    carregar()
  }, [user, authLoading, router])

  const abrirAjuste = (id: string) => {
    setAjusteAtivo(id)
    setAjustes(a => ({ ...a, [id]: 0 }))
  }

  const confirmarAceite = async (id: string) => {
    setAceitando(id)
    try {
      // Envia como valor negativo (desconto): 10% de desconto → -10
      await orders.aceitar(id, -(ajustes[id] ?? 0))
      toast('Demanda aceita! Aguardando pagamento do cliente.', 'success')
      setAjusteAtivo(null)
      carregar()
    } catch (err: any) {
      toast(err.message || 'Erro ao aceitar demanda', 'error')
    } finally {
      setAceitando(null)
    }
  }

  if (authLoading || !user) return null

  const URGENCIA_LABEL: Record<string, string> = {
    NORMAL: 'Normal', PRIORITARIO: '+30%', URGENTE: '+60%'
  }
  const TIPO_LABEL: Record<string, React.ReactNode> = {
    RESIDENCIAL: <span className="flex items-center gap-1"><Home size={12} />Residencial</span>,
    COMERCIAL:   <span className="flex items-center gap-1"><Building2 size={12} />Comercial</span>,
    INDUSTRIAL:  <span className="flex items-center gap-1"><Factory size={12} />Industrial</span>,
  }

  return (
    <Shell>
      <Topbar
        title="Feed de demandas"
        subtitle={`${demandas.length} demanda${demandas.length !== 1 ? 's' : ''} disponível${demandas.length !== 1 ? 'is' : ''}`}
        actions={
          <button onClick={carregar} className="btn btn-secondary btn-sm">
            ↻ Atualizar
          </button>
        }
      />
      <main className="p-6 space-y-4">
        {/* Aviso M1 incompleto */}
        {!user.profissional?.prepara_m1 && (
          <Link
            href="/profissional/prepara/m1"
            className="flex items-start gap-3 rounded-xl p-4 transition-opacity hover:opacity-90"
            style={{ background: 'rgba(232,103,26,0.12)', border: '1px solid rgba(232,103,26,0.35)', textDecoration: 'none' }}
          >
            <GraduationCap size={20} className="shrink-0 mt-0.5" style={{ color: 'var(--orange)' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--orange)' }}>
                SUEDPrepara M1 obrigatório para aceitar demandas
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>
                Você pode ver as demandas disponíveis, mas não conseguirá aceitá-las sem concluir o módulo de fundamentos. Clique para começar →
              </p>
            </div>
          </Link>
        )}

        {/* Indicador de carga operacional */}
        {carga && (() => {
          const svcs = Object.entries(carga.svcs || {}) as [string, any][]
          const totalAtivas = svcs.reduce((s, [, v]) => s + (v.ativas || 0), 0)
          const totalPontos = svcs.reduce((s, [, v]) => s + (v.pontos || 0), 0)
          const capPontos   = svcs.reduce((s, [, v]) => s + (v.cap_pontos || 0), 0)
          const pct = capPontos > 0 ? Math.round((totalPontos / capPontos) * 100) : 0
          const cor = pct >= 90 ? 'var(--red)' : pct >= 70 ? 'var(--gold)' : 'var(--green)'
          return (
            <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Activity size={16} className="shrink-0" style={{ color: cor }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white">Carga operacional</span>
                  <span className="text-xs font-mono font-bold" style={{ color: cor }}>{pct}%</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, background: cor }} />
                </div>
              </div>
              <span className="text-xs shrink-0" style={{ color: 'var(--text3)' }}>{totalAtivas} ativa{totalAtivas !== 1 ? 's' : ''}</span>
            </div>
          )
        })()}

        {loading ? (
          <div className="text-center py-16" style={{ color: 'var(--text3)' }}>Carregando feed...</div>
        ) : demandas.length === 0 ? (
          <div className="card text-center py-12">
            <div className="flex justify-center mb-3 opacity-50"><Radar size={40} strokeWidth={1.2} /></div>
            <p className="font-semibold text-white mb-1">Nenhuma demanda disponível agora</p>
            <p className="text-sm" style={{ color: 'var(--text3)' }}>
              Novas demandas aparecem assim que clientes as criam.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {demandas.map(d => {
              // desconto: 0 = sem desconto, 15 = 15% de desconto sobre o UTS
              const descontoPct = ajustes[d.id] ?? 0
              const fator = 1 - descontoPct / 100
              const precoBase = d.preco_servico || 0
              const liquidoBase = d.liquido_estimado || precoBase
              const precoAjustado = precoBase * fator
              const liquidoAjustado = liquidoBase * fator
              const expandido = ajusteAtivo === d.id

              return (
                <div key={d.id} className="card-solid" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono" style={{ color: 'var(--text3)' }}>{d.svc_codigo}</span>
                        <span className="text-white font-semibold">{d.svc_nome || d.svc_codigo}</span>
                        {d.urgencia !== 'NORMAL' && (
                          <span className="badge badge-orange">{URGENCIA_LABEL[d.urgencia]}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs items-center" style={{ color: 'var(--text3)' }}>
                        <span className="flex items-center gap-1">{TIPO_LABEL[d.tipo_imovel] || d.tipo_imovel}</span>
                        <span className="flex items-center gap-1"><Ruler size={12} />{d.area_m2}m²</span>
                        <span className="flex items-center gap-1"><MapPin size={12} />{d.cidade}/{d.estado}</span>
                        <span className="flex items-center gap-1"><Clock size={12} />SLA {d.sla_dias || 5} dias</span>
                      </div>
                      {d.descricao && (
                        <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--text2)' }}>{d.descricao}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold font-mono" style={{ color: 'var(--green)' }}>
                        {formatBRL(expandido ? liquidoAjustado : liquidoBase)}
                      </p>
                      <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>líquido estimado</p>
                      {!expandido ? (
                        <button
                          onClick={() => abrirAjuste(d.id)}
                          className="btn btn-primary btn-sm"
                        >
                          Aceitar demanda
                        </button>
                      ) : (
                        <button
                          onClick={() => setAjusteAtivo(null)}
                          className="btn btn-secondary btn-sm"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>

                  {expandido && (
                    <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold" style={{ color: 'var(--text2)' }}>
                          Desconto oferecido ao cliente (0% a 15%)
                        </span>
                        <span
                          className="text-sm font-bold font-mono"
                          style={{ color: descontoPct > 0 ? 'var(--orange)' : 'var(--text3)' }}
                        >
                          {descontoPct > 0 ? `-${descontoPct}%` : 'Sem desconto'}
                        </span>
                      </div>

                      <input
                        type="range"
                        min={0}
                        max={15}
                        step={1}
                        value={descontoPct}
                        onChange={e => setAjustes(a => ({ ...a, [d.id]: Number(e.target.value) }))}
                        className="w-full mb-2"
                        style={{ accentColor: 'var(--orange)' }}
                      />

                      <div className="flex justify-between text-xs mb-4" style={{ color: 'var(--text3)' }}>
                        <span>Sem desconto</span>
                        <span>-8%</span>
                        <span>-15%</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <p className="text-xs mb-1" style={{ color: 'var(--text3)' }}>Valor ao cliente</p>
                          <p className="font-bold font-mono text-white">{formatBRL(precoAjustado)}</p>
                          {descontoPct !== 0 && (
                            <p className="text-xs" style={{ color: 'var(--text3)' }}>era {formatBRL(precoBase)}</p>
                          )}
                        </div>
                        <div className="rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <p className="text-xs mb-1" style={{ color: 'var(--text3)' }}>Seu líquido</p>
                          <p className="font-bold font-mono" style={{ color: 'var(--green)' }}>{formatBRL(liquidoAjustado)}</p>
                          {descontoPct !== 0 && (
                            <p className="text-xs" style={{ color: 'var(--text3)' }}>era {formatBRL(liquidoBase)}</p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => confirmarAceite(d.id)}
                        disabled={aceitando === d.id}
                        className="btn btn-primary w-full"
                      >
                        {aceitando === d.id ? 'Aceitando...' : 'Confirmar aceite'}
                      </button>

                      <p className="text-xs text-center mt-2" style={{ color: 'var(--text3)' }}>
                        Ajuste proposto ao cliente · pagamento confirma o aceite
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </Shell>
  )
}
