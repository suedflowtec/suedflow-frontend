'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { orders } from '@/lib/api'
import { formatBRL, statusLabel } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

const MARCOS_VALIDOS = [
  { tipo: 'CHECK_IN_GPS',       label: 'Check-in GPS' },
  { tipo: 'ART_ATIVA',          label: 'ART/RRT ativa' },
  { tipo: 'FOTO_PRE',           label: 'Foto pré-execução' },
  { tipo: 'EXECUCAO_INICIADA',  label: 'Execução iniciada' },
  { tipo: 'FOTO_POS',           label: 'Foto pós-execução' },
  { tipo: 'CHECK_OUT',          label: 'Check-out' },
]

const MARCO_LABEL: Record<string, string> = MARCOS_VALIDOS.reduce(
  (acc, m) => ({ ...acc, [m.tipo]: m.label }), { ENTREGAVEL_ENVIADO: 'Entregável enviado' } as Record<string, string>
)

export default function ProfissionalDemandaDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)

  const [demanda, setDemanda] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tipoMarco, setTipoMarco] = useState(MARCOS_VALIDOS[0].tipo)
  const [obsMarco, setObsMarco] = useState('')
  const [registrando, setRegistrando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [avc, setAvc] = useState<any>(null)
  const [carregandoAvc, setCarregandoAvc] = useState(false)
  const [disputaAberta, setDisputaAberta] = useState(false)
  const [motivoDisputa, setMotivoDisputa] = useState('')
  const [enviandoDisputa, setEnviandoDisputa] = useState(false)

  const carregar = () => {
    if (!id) return
    orders.buscar(id)
      .then(setDemanda)
      .catch(() => toast('Erro ao carregar demanda', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    carregar()
  }, [user, authLoading, router, id])

  if (authLoading || !user) return null
  if (loading) return (
    <Shell><Topbar title="Demanda" /><main className="p-6"><p style={{ color: 'var(--text3)' }}>Carregando...</p></main></Shell>
  )
  if (!demanda) return (
    <Shell><Topbar title="Demanda" /><main className="p-6"><p style={{ color: 'var(--text3)' }}>Demanda não encontrada.</p></main></Shell>
  )

  const marcos: any[] = demanda.marcos_execucao || []
  const temArtAtiva = marcos.some(m => m.tipo === 'ART_ATIVA')
  const jaEnviouEntregavel = marcos.some(m => m.tipo === 'ENTREGAVEL_ENVIADO') || demanda.status === 'AGUARDANDO_CONFIRMACAO' || demanda.status === 'CONCLUIDA'

  const registrarMarco = async () => {
    setRegistrando(true)
    try {
      await orders.registrarMarco(id, tipoMarco, obsMarco || undefined)
      toast('Marco registrado com sucesso', 'success')
      setObsMarco('')
      carregar()
    } catch (err: any) {
      toast(err.message || 'Erro ao registrar marco', 'error')
    } finally {
      setRegistrando(false)
    }
  }

  const submeterEntregavel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setEnviando(true)
    try {
      await orders.submeterEntregavel(id, file)
      toast('Entregável enviado para confirmação do cliente', 'success')
      carregar()
    } catch (err: any) {
      toast(err.message || 'Erro ao enviar entregável', 'error')
    } finally {
      setEnviando(false)
      if (fileRef.current) fileRef.current.value = ''
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
      setDisputaAberta(false)
      setMotivoDisputa('')
      carregar()
    } catch (err: any) {
      toast(err.message || 'Erro ao abrir disputa', 'error')
    } finally {
      setEnviandoDisputa(false)
    }
  }

  const verResultadoQa = async () => {
    setCarregandoAvc(true)
    try {
      const r = await orders.avc(id)
      setAvc(r)
    } catch (err: any) {
      toast(err.message || 'Erro ao consultar AVC', 'error')
    } finally {
      setCarregandoAvc(false)
    }
  }

  const s = statusLabel(demanda.status)

  return (
    <Shell>
      <Topbar
        title={demanda.svc_nome || demanda.svc_codigo || 'Demanda'}
        subtitle={`OS ${demanda.numero || demanda.id?.slice(0, 8)}`}
        actions={<span className={`badge badge-${s.variant === 'glass' ? 'gray' : s.variant}`}>{s.text}</span>}
      />

      <main className="p-6 space-y-6 max-w-3xl">
        {/* Resumo */}
        <div className="card grid grid-cols-3 gap-4">
          <div>
            <p className="section-label">Endereço</p>
            <p className="text-sm text-white">{demanda.endereco || demanda.cidade || '—'}</p>
          </div>
          <div>
            <p className="section-label">Prazo de entrega</p>
            <p className="text-sm text-white">
              {demanda.prazo_entrega ? new Date(demanda.prazo_entrega).toLocaleDateString('pt-BR') : '—'}
            </p>
          </div>
          <div>
            <p className="section-label">Valor líquido</p>
            <p className="text-sm font-mono font-bold" style={{ color: 'var(--green)' }}>
              {formatBRL(demanda.liquido_profissional || 0)}
            </p>
          </div>
        </div>

        <button className="btn btn-secondary" onClick={() => router.push(`/profissional/demandas/${id}/chat`)}>
          💬 Chat com cliente
        </button>

        {/* Marcos de execução */}
        <div className="card-solid space-y-4">
          <p className="section-label">Marcos de execução</p>

          {marcos.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text3)' }}>Nenhum marco registrado ainda.</p>
          ) : (
            <ul className="space-y-2">
              {marcos.map((m: any) => (
                <li key={m.tipo} className="flex items-center justify-between text-sm">
                  <span className="text-white">✓ {MARCO_LABEL[m.tipo] || m.tipo}</span>
                  <span style={{ color: 'var(--text3)' }}>
                    {m.created_at ? new Date(m.created_at).toLocaleString('pt-BR') : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="divider" />

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="label">Tipo de marco</label>
              <select className="input" value={tipoMarco} onChange={e => setTipoMarco(e.target.value)}>
                {MARCOS_VALIDOS.map(m => (
                  <option key={m.tipo} value={m.tipo}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="label">Observação (opcional)</label>
              <input className="input" value={obsMarco} onChange={e => setObsMarco(e.target.value)} placeholder="Ex: número da ART" />
            </div>
            <button onClick={registrarMarco} disabled={registrando} className="btn btn-primary">
              {registrando ? 'Registrando...' : 'Registrar marco'}
            </button>
          </div>
        </div>

        {/* Submissão do entregável */}
        {temArtAtiva && (
          <div className="card-accent space-y-3">
            <p className="section-label">Entregável</p>
            {jaEnviouEntregavel ? (
              <p className="text-sm" style={{ color: 'var(--green)' }}>✓ Entregável enviado para confirmação do cliente.</p>
            ) : (
              <div>
                <p className="text-sm mb-3" style={{ color: 'var(--text2)' }}>
                  ART/RRT registrada. Envie o PDF do entregável final para o cliente confirmar.
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf"
                  onChange={submeterEntregavel}
                  className="hidden"
                  id="entregavel-input"
                />
                <button
                  className="btn btn-primary"
                  disabled={enviando}
                  onClick={() => fileRef.current?.click()}
                >
                  {enviando ? 'Enviando...' : 'Submeter entregável (PDF)'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Resultado QA / AVC */}
        {jaEnviouEntregavel && (
          <div className="card space-y-3">
            <p className="section-label">Verificação SUE (AVC)</p>
            <button onClick={verResultadoQa} disabled={carregandoAvc} className="btn btn-secondary btn-sm">
              {carregandoAvc ? 'Consultando...' : 'Ver resultado QA'}
            </button>

            {avc && (
              avc.avc ? (
                <pre className="text-xs p-3 rounded-xl overflow-auto" style={{ background: 'var(--navy3)', color: 'var(--text2)' }}>
                  {JSON.stringify(avc.avc, null, 2)}
                </pre>
              ) : (
                <p className="text-sm" style={{ color: 'var(--text3)' }}>{avc.msg || 'A SUE ainda não concluiu a verificação.'}</p>
              )
            )}
          </div>
        )}

        {/* Disputa */}
        {!['CONCLUIDA', 'CANCELADA', 'EM_DISPUTA'].includes(demanda.status) && (
          <div className="card space-y-2">
            {!disputaAberta ? (
              <button className="btn btn-secondary w-full" onClick={() => setDisputaAberta(true)}>⚠ Abrir disputa</button>
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
                  <button className="btn btn-primary flex-1" disabled={enviandoDisputa} onClick={enviarDisputa}>
                    {enviandoDisputa ? 'Enviando...' : 'Enviar disputa'}
                  </button>
                  <button className="btn btn-secondary" onClick={() => setDisputaAberta(false)}>Cancelar</button>
                </div>
              </div>
            )}
          </div>
        )}

        {demanda.status === 'EM_DISPUTA' && (
          <div className="card" style={{ borderColor: 'var(--red)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--red)' }}>⚠ Demanda em disputa</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
              Um curador irá analisar o caso e responder em até 5 dias úteis.
            </p>
          </div>
        )}
      </main>
    </Shell>
  )
}
