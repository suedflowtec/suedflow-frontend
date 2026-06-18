'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { orders } from '@/lib/api'
import { formatBRL } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { Home, Building2, Factory, Radar, MapPin, Ruler, Clock } from 'lucide-react'

export default function ProfissionalFeed() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [demandas, setDemandas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [aceitando, setAceitando] = useState<string | null>(null)
  const [ajusteAtivo, setAjusteAtivo] = useState<string | null>(null)
  const [ajustes, setAjustes] = useState<Record<string, number>>({})

  const carregar = () => {
    setLoading(true)
    orders.feed()
      .then(d => setDemandas(d?.demandas || []))
      .catch(err => {
        if (err.status === 403) toast(err.message || 'KYC ou módulo pendente', 'error')
        else toast('Erro ao carregar feed', 'error')
      })
      .finally(() => setLoading(false))
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
      await orders.aceitar(id, ajustes[id] ?? 0)
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
      <main className="p-6">
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
              const ajustePct = ajustes[d.id] ?? 0
              const fator = 1 + ajustePct / 100
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
                          Ajuste de preço (opcional · ±15%)
                        </span>
                        <span
                          className="text-sm font-bold font-mono"
                          style={{ color: ajustePct > 0 ? 'var(--green)' : ajustePct < 0 ? 'var(--red)' : 'var(--text3)' }}
                        >
                          {ajustePct > 0 ? `+${ajustePct}%` : ajustePct < 0 ? `${ajustePct}%` : 'Sem ajuste'}
                        </span>
                      </div>

                      <input
                        type="range"
                        min={-15}
                        max={15}
                        step={1}
                        value={ajustePct}
                        onChange={e => setAjustes(a => ({ ...a, [d.id]: Number(e.target.value) }))}
                        className="w-full mb-2"
                        style={{ accentColor: 'var(--orange)' }}
                      />

                      <div className="flex justify-between text-xs mb-4" style={{ color: 'var(--text3)' }}>
                        <span>−15%</span>
                        <span>0%</span>
                        <span>+15%</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <p className="text-xs mb-1" style={{ color: 'var(--text3)' }}>Valor ao cliente</p>
                          <p className="font-bold font-mono text-white">{formatBRL(precoAjustado)}</p>
                          {ajustePct !== 0 && (
                            <p className="text-xs" style={{ color: 'var(--text3)' }}>era {formatBRL(precoBase)}</p>
                          )}
                        </div>
                        <div className="rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <p className="text-xs mb-1" style={{ color: 'var(--text3)' }}>Seu líquido</p>
                          <p className="font-bold font-mono" style={{ color: 'var(--green)' }}>{formatBRL(liquidoAjustado)}</p>
                          {ajustePct !== 0 && (
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
