// app/profissional/demandas/[id]/checklist/page.tsx
// Checklist de Campo — preenchimento durante a visita presencial ao imóvel
'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { checklist as checklistApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { CheckCircle2, AlertCircle, XCircle, Camera, MapPin, ChevronRight, Clock, AlertTriangle } from 'lucide-react'

type Status = 'PENDENTE' | 'OK' | 'PROBLEMA_LEVE' | 'PROBLEMA_GRAVE' | 'NAO_APLICAVEL'

const STATUS_CFG: Record<Status, { label: string; cor: string; bg: string; Icon: any }> = {
  PENDENTE:       { label: 'Pendente',      cor: 'var(--text3)',  bg: 'var(--glass)',                          Icon: Clock },
  OK:             { label: 'OK',            cor: 'var(--green)',  bg: 'rgba(0,214,143,0.10)',                  Icon: CheckCircle2 },
  PROBLEMA_LEVE:  { label: 'Atenção',       cor: 'var(--gold)',   bg: 'rgba(245,166,35,0.10)',                 Icon: AlertCircle },
  PROBLEMA_GRAVE: { label: 'Grave',         cor: 'var(--red)',    bg: 'rgba(255,77,109,0.10)',                 Icon: XCircle },
  NAO_APLICAVEL:  { label: 'N/A',           cor: 'var(--text3)',  bg: 'rgba(255,255,255,0.04)',                Icon: ChevronRight },
}

function ItemCard({ item, onResposta, uploadando }: {
  item: any
  onResposta: (id: string, status: Status, obs?: string) => void
  uploadando: boolean
}) {
  const [obs, setObs] = useState(item.obs || '')
  const [expandido, setExpandido] = useState(item.status === 'PENDENTE' || item.status === 'PROBLEMA_GRAVE')
  const status: Status = item.status || 'PENDENTE'
  const cfg = STATUS_CFG[status]

  return (
    <div className="rounded-xl border transition-all" style={{ background: cfg.bg, borderColor: `${cfg.cor}40`, borderLeft: `3px solid ${cfg.cor}` }}>
      {/* Header clicável */}
      <button className="w-full text-left p-3 flex items-start gap-3" onClick={() => setExpandido(v => !v)}>
        <cfg.Icon size={16} className="shrink-0 mt-0.5" style={{ color: cfg.cor }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              {item.item?.titulo || item.titulo}
            </p>
            {item.item?.bloqueante && (
              <span className="badge badge-red text-2xs">BLOQ.</span>
            )}
            {item.item?.obrigatorio && status === 'PENDENTE' && (
              <span className="badge badge-orange text-2xs">OBRIG.</span>
            )}
          </div>
          {item.item?.norma_referencia && (
            <p className="text-2xs mt-0.5" style={{ color: 'var(--text3)' }}>{item.item.norma_referencia}</p>
          )}
        </div>
        <span className="badge shrink-0" style={{ background: `${cfg.cor}20`, color: cfg.cor, border: `1px solid ${cfg.cor}40` }}>
          {cfg.label}
        </span>
      </button>

      {/* Expandido: dica + resposta */}
      {expandido && (
        <div className="px-3 pb-3 space-y-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          {item.item?.dica_tecnica && (
            <div className="rounded-lg p-2 mt-2" style={{ background: 'rgba(232,103,26,0.08)', border: '1px solid rgba(232,103,26,0.2)' }}>
              <p className="text-2xs" style={{ color: 'var(--text2)' }}>💡 {item.item.dica_tecnica}</p>
            </div>
          )}

          {/* Botões de resposta */}
          <div className="grid grid-cols-4 gap-1.5 mt-2">
            {(['OK', 'PROBLEMA_LEVE', 'PROBLEMA_GRAVE', 'NAO_APLICAVEL'] as Status[]).map(s => {
              const c = STATUS_CFG[s]
              const sel = status === s
              return (
                <button key={s} onClick={() => onResposta(item.id, s, obs)}
                  className="py-2 px-1 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: sel ? `${c.cor}20` : 'var(--glass)',
                    color: sel ? c.cor : 'var(--text3)',
                    border: `1px solid ${sel ? c.cor : 'var(--border)'}`,
                  }}>
                  {c.label}
                </button>
              )
            })}
          </div>

          {/* Observação */}
          {['PROBLEMA_LEVE', 'PROBLEMA_GRAVE'].includes(status) && (
            <textarea
              className="input text-sm"
              rows={2}
              placeholder="Descreva o problema encontrado..."
              value={obs}
              onChange={e => setObs(e.target.value)}
              onBlur={() => obs !== item.obs && onResposta(item.id, status, obs)}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default function ChecklistCampoPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const demandaId = params?.id as string

  const [execucao, setExecucao] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [iniciando, setIniciando] = useState(false)
  const [finalizando, setFinalizando] = useState(false)
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'buscando' | 'ok' | 'erro'>('idle')

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    // Tentar carregar execução existente
    checklistApi.buscar(demandaId)
      .then(r => { if (r?.execucao) setExecucao(r.execucao) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, authLoading, demandaId])

  const obterGPS = () => {
    setGpsStatus('buscando')
    navigator.geolocation?.getCurrentPosition(
      pos => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGpsStatus('ok')
      },
      () => {
        setGpsStatus('erro')
        toast('GPS não disponível. Prossiga sem localização.', 'info')
      },
      { timeout: 10000 }
    )
  }

  const iniciar = async () => {
    setIniciando(true)
    try {
      const r = await checklistApi.iniciar(demandaId, gps?.lat, gps?.lng)
      setExecucao(r.execucao)
      toast(r.retomada ? 'Checklist retomado.' : 'Checklist iniciado!', 'success')
    } catch (err: any) {
      toast(err.message || 'Erro ao iniciar checklist', 'error')
    } finally { setIniciando(false) }
  }

  const responder = async (itemId: string, status: Status, obs?: string) => {
    try {
      const r = await checklistApi.responder(itemId, { status, obs })
      setExecucao((prev: any) => ({
        ...prev,
        itens: prev.itens.map((i: any) => i.id === itemId ? { ...i, status, obs } : i)
      }))
    } catch (err: any) {
      toast(err.message || 'Erro ao salvar resposta', 'error')
    }
  }

  const finalizar = async () => {
    setFinalizando(true)
    try {
      const r = await checklistApi.finalizar(execucao.id)
      toast('Checklist finalizado com sucesso!', 'success')
      router.push(`/profissional/demandas/${demandaId}`)
    } catch (err: any) {
      toast(err.message || 'Erro ao finalizar', 'error')
    } finally { setFinalizando(false) }
  }

  if (authLoading || !user) return null

  // Calcular progresso
  const itens = execucao?.itens || []
  const respondidos = itens.filter((i: any) => i.status && i.status !== 'PENDENTE').length
  const graves = itens.filter((i: any) => i.status === 'PROBLEMA_GRAVE').length
  const pct = itens.length > 0 ? Math.round((respondidos / itens.length) * 100) : 0
  const podeFinalizr = respondidos === itens.length && itens.length > 0

  return (
    <Shell>
      <Topbar
        title="Checklist de Campo"
        subtitle={execucao ? `${respondidos}/${itens.length} itens · ${pct}%` : 'Vistoria presencial'}
        actions={
          <button onClick={() => router.push(`/profissional/demandas/${demandaId}`)} className="btn btn-ghost btn-sm">
            ← Voltar
          </button>
        }
      />

      <main className="p-4 max-w-2xl space-y-4">

        {loading ? (
          <p className="text-sm text-center py-10" style={{ color: 'var(--text3)' }}>Carregando...</p>
        ) : !execucao ? (
          /* Tela de início */
          <div className="space-y-4">
            <div className="card-accent space-y-3">
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Iniciar vistoria presencial</p>
              <p className="text-xs" style={{ color: 'var(--text2)' }}>
                O checklist de campo guia você item a item durante a visita. Cada resposta é salva automaticamente.
                O GPS registra sua presença no local.
              </p>
            </div>

            {/* GPS */}
            <div className="card-solid space-y-3">
              <div className="flex items-center gap-2">
                <MapPin size={14} style={{ color: gpsStatus === 'ok' ? 'var(--green)' : 'var(--text3)' }} />
                <p className="section-label">Localização GPS</p>
              </div>
              {gpsStatus === 'idle' && (
                <button onClick={obterGPS} className="btn btn-secondary btn-sm">
                  Capturar GPS
                </button>
              )}
              {gpsStatus === 'buscando' && <p className="text-xs" style={{ color: 'var(--text3)' }}>Obtendo localização...</p>}
              {gpsStatus === 'ok' && gps && (
                <p className="text-xs font-mono" style={{ color: 'var(--green)' }}>
                  ✓ {gps.lat.toFixed(6)}, {gps.lng.toFixed(6)}
                </p>
              )}
              {gpsStatus === 'erro' && (
                <p className="text-xs" style={{ color: 'var(--gold)' }}>GPS indisponível — prossiga sem localização</p>
              )}
            </div>

            <button
              onClick={iniciar}
              disabled={iniciando}
              className="btn btn-primary w-full"
            >
              {iniciando ? 'Iniciando...' : '🏗️ Iniciar Checklist de Campo'}
            </button>
          </div>
        ) : (
          /* Checklist em andamento */
          <>
            {/* Barra de progresso */}
            <div className="card-solid space-y-2">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--text3)' }}>{respondidos}/{itens.length} itens</span>
                <span style={{ color: pct === 100 ? 'var(--green)' : 'var(--text3)' }}>{pct}% concluído</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: pct === 100 ? 'var(--green)' : 'linear-gradient(90deg, var(--orange), var(--orange2))' }} />
              </div>
              {graves > 0 && (
                <div className="flex items-center gap-1.5">
                  <AlertTriangle size={12} style={{ color: 'var(--red)' }} />
                  <p className="text-xs" style={{ color: 'var(--red)' }}>{graves} problema{graves > 1 ? 's' : ''} grave{graves > 1 ? 's' : ''} registrado{graves > 1 ? 's' : ''}</p>
                </div>
              )}
            </div>

            {/* Itens */}
            <div className="space-y-2">
              {itens.map((item: any) => (
                <ItemCard key={item.id} item={item} onResposta={responder} uploadando={false} />
              ))}
            </div>

            {/* Finalizar */}
            {podeFinalizr && (
              <button onClick={finalizar} disabled={finalizando} className="btn btn-primary w-full">
                {finalizando ? 'Finalizando...' : '✅ Finalizar Checklist'}
              </button>
            )}
            {!podeFinalizr && (
              <p className="text-xs text-center py-2" style={{ color: 'var(--text3)' }}>
                Responda todos os {itens.length} itens para finalizar
              </p>
            )}
          </>
        )}
      </main>
    </Shell>
  )
}
