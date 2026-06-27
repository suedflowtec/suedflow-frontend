'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { orders } from '@/lib/api'
import { formatBRL, statusLabel } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { CheckCircle2, AlertTriangle, MapPin, MessageCircle, Camera, Navigation } from 'lucide-react'

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
  const [vtcResult, setVtcResult] = useState<any>(null)
  const [carregandoVtc, setCarregandoAvc] = useState(false)
  const [disputaAberta, setDisputaAberta] = useState(false)
  const [motivoDisputa, setMotivoDisputa] = useState('')
  const [enviandoDisputa, setEnviandoDisputa] = useState(false)
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false)
  const [cancelando, setCancelando] = useState(false)
  const [fazendoCheckin, setFazendoCheckin] = useState(false)
  const selfieRef = useRef<HTMLInputElement>(null)
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null)

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

  const cancelarAceite = async () => {
    setCancelando(true)
    try {
      await orders.cancelar(id, 'Cancelamento por conveniência')
      toast('Aceite cancelado · a demanda voltou para o feed', 'success')
      router.push('/profissional/feed')
    } catch (err: any) {
      toast(err.message || 'Erro ao cancelar aceite', 'error')
    } finally {
      setCancelando(false)
    }
  }

  const capturarSelfie = () => selfieRef.current?.click()

  const handleSelfie = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setSelfieFile(f)
    setSelfiePreview(URL.createObjectURL(f))
  }

  const fazerCheckin = () => {
    if (!selfieFile) { toast('Tire uma selfie no local antes de fazer o check-in.', 'error'); return }
    if (!navigator.geolocation) { toast('Geolocalização não suportada neste navegador', 'error'); return }
    setFazendoCheckin(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const fd = new FormData()
          fd.append('lat', String(pos.coords.latitude))
          fd.append('lng', String(pos.coords.longitude))
          fd.append('selfie', selfieFile)
          await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'https://suedflow-backend-production.up.railway.app'}/api/orders/${id}/checkin`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${localStorage.getItem('suedflow_token')}` },
            body: fd,
          }).then(async r => { if (!r.ok) throw new Error((await r.json()).error || 'Erro') })
          toast('Check-in realizado com selfie! Execução iniciada.', 'success')
          setSelfieFile(null); setSelfiePreview(null)
          carregar()
        } catch (err: any) {
          toast(err.message || 'Erro ao fazer check-in', 'error')
        } finally {
          setFazendoCheckin(false)
        }
      },
      () => {
        toast('Não foi possível obter sua localização. Permita o acesso no navegador.', 'error')
        setFazendoCheckin(false)
      }
    )
  }

  const verResultadoQa = async () => {
    setCarregandoAvc(true)
    try {
      const r = await orders.vtc(id)
      setVtcResult(r)
    } catch (err: any) {
      toast(err.message || 'Erro ao consultar Verificação SUE', 'error')
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
            <p className="text-sm" style={{ color: 'var(--text)' }}>{demanda.endereco || demanda.cidade || '—'}</p>
          </div>
          <div>
            <p className="section-label">Prazo de entrega</p>
            <p className="text-sm" style={{ color: 'var(--text)' }}>
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

        {/* Mapa do local + traçar rota */}
        {(demanda.endereco || demanda.cidade) && (
          <div className="card-solid overflow-hidden" style={{ padding: 0 }}>
            <div className="px-4 pt-3 pb-2 flex items-center justify-between">
              <p className="section-label flex items-center gap-1"><MapPin size={12} />Local da demanda</p>
              <a
                href={`https://www.google.com/maps/dir//${encodeURIComponent([demanda.endereco, demanda.cidade, demanda.estado, 'Brasil'].filter(Boolean).join(', '))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-2xs font-semibold hover:underline"
                style={{ color: 'var(--orange)' }}
              >
                <Navigation size={11} />Traçar rota →
              </a>
            </div>
            <iframe
              title="Localização da demanda"
              src={`https://maps.google.com/maps?q=${encodeURIComponent([demanda.endereco, demanda.cidade, demanda.estado, 'Brasil'].filter(Boolean).join(', '))}&output=embed&z=16`}
              width="100%"
              height="220"
              style={{ border: 0, display: 'block' }}
              loading="lazy"
              allowFullScreen
            />
          </div>
        )}

        <button className="btn btn-secondary" onClick={() => router.push(`/profissional/demandas/${id}/chat`)}>
          💬 Chat com cliente
        </button>

        {/* Aguardando pagamento do cliente */}
        {demanda.status === 'ACEITA' && (
          <div className="card-accent space-y-3">
            <p className="section-label">Aguardando pagamento do cliente</p>
            <p className="text-sm" style={{ color: 'var(--text2)' }}>
              Você aceitou esta demanda{demanda.aceito_em ? ` em ${new Date(demanda.aceito_em).toLocaleString('pt-BR')}` : ''}.
              O cliente precisa confirmar o pagamento (PIX/Boleto) para liberar a execução.
              Você será notificado automaticamente quando o pagamento for confirmado.
            </p>
            {!confirmandoCancelamento ? (
              <button className="btn btn-secondary btn-sm" onClick={() => setConfirmandoCancelamento(true)}>
                Cancelar aceite
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm" style={{ color: 'var(--red)' }}>
                  ⚠ Cancelar o aceite após confirmar a demanda gera penalidade no seu Score SQP. Tem certeza?
                </p>
                <div className="flex gap-2">
                  <button className="btn btn-primary flex-1" disabled={cancelando} onClick={cancelarAceite}>
                    {cancelando ? 'Cancelando...' : 'Sim, cancelar aceite'}
                  </button>
                  <button className="btn btn-secondary" onClick={() => setConfirmandoCancelamento(false)}>Voltar</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Marcos de execução */}
        <div className="card-solid space-y-4">
          <p className="section-label">Marcos de execução</p>

          {marcos.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text3)' }}>Nenhum marco registrado ainda.</p>
          ) : (
            <ul className="space-y-2">
              {marcos.map((m: any) => (
                <li key={m.tipo} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1" style={{ color: 'var(--text)' }}><CheckCircle2 size={13} />{MARCO_LABEL[m.tipo] || m.tipo}</span>
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

        {/* Check-in (inicia execução) */}
        {demanda.status === 'PAGA' && (
          <div className="card-accent space-y-3">
            <p className="section-label">Fazer check-in</p>
            {temArtAtiva ? (
              <div className="space-y-3">
                <p className="text-sm" style={{ color: 'var(--text2)' }}>
                  Pagamento confirmado e ART/RRT registrada. Para iniciar a execução, tire uma selfie no local e confirme sua localização GPS.
                </p>

                {/* Selfie */}
                <input
                  ref={selfieRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleSelfie}
                  className="hidden"
                />
                {selfiePreview ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={selfiePreview}
                      alt="Selfie"
                      className="rounded-lg object-cover"
                      style={{ width: 72, height: 72, border: '2px solid var(--green)' }}
                    />
                    <div>
                      <p className="text-xs font-semibold" style={{ color: 'var(--green)' }}>Selfie capturada ✓</p>
                      <button
                        className="text-2xs underline mt-1"
                        style={{ color: 'var(--text3)' }}
                        onClick={capturarSelfie}
                      >
                        Tirar outra
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="btn btn-secondary flex items-center gap-2"
                    onClick={capturarSelfie}
                  >
                    <Camera size={14} />
                    Tirar selfie no local (câmera frontal)
                  </button>
                )}

                <button
                  className="btn btn-primary"
                  disabled={fazendoCheckin || !selfieFile}
                  onClick={fazerCheckin}
                  title={!selfieFile ? 'Tire uma selfie antes de fazer o check-in' : ''}
                >
                  {fazendoCheckin ? 'Verificando localização...' : <><MapPin size={14} className="inline mr-1" />Fazer check-in com GPS</>}
                </button>
                {!selfieFile && (
                  <p className="text-2xs" style={{ color: 'var(--text3)' }}>
                    ⚠ Selfie obrigatória para confirmar presença no local.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text2)' }}>
                Registre o marco "ART/RRT ativa" acima (com o número/protocolo da ART) antes de fazer o check-in.
              </p>
            )}
          </div>
        )}

        {/* Submissão do entregável */}
        {temArtAtiva && (
          <div className="card-accent space-y-3">
            <p className="section-label">Entregável</p>
            {jaEnviouEntregavel ? (
              <p className="text-sm flex items-center gap-1" style={{ color: 'var(--green)' }}><CheckCircle2 size={14} />Entregável enviado para confirmação do cliente.</p>
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

        {/* Resultado QA / Verificação SUE */}
        {jaEnviouEntregavel && (
          <div className="card space-y-3">
            <p className="section-label">Verificação SUE</p>
            <p className="text-2xs flex items-start gap-1.5" style={{ color: 'var(--text3)' }}>
              <span style={{ flexShrink: 0 }}>⚠️</span>
              A SUE é uma assistente de IA e pode cometer erros. Este resultado é informativo — a responsabilidade técnica é exclusivamente do profissional detentor da ART/RRT.
            </p>
            <button onClick={verResultadoQa} disabled={carregandoVtc} className="btn btn-secondary btn-sm">
              {carregandoVtc ? 'Consultando...' : 'Ver resultado QA'}
            </button>

            {vtcResult && (
              vtcResult.vtc ? (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => router.push(`/profissional/demandas/${id}/qa`)}
                >
                  Ver resultado completo e impacto no Score SQP →
                </button>
              ) : (
                <p className="text-sm" style={{ color: 'var(--text3)' }}>{vtcResult.msg || 'A SUE ainda não concluiu a verificação.'}</p>
              )
            )}
          </div>
        )}

        {/* Disputa */}
        {!['CONCLUIDA', 'CANCELADA', 'EM_DISPUTA'].includes(demanda.status) && (
          <div className="card space-y-2">
            {!disputaAberta ? (
              <button className="btn btn-secondary w-full flex items-center justify-center gap-1" onClick={() => setDisputaAberta(true)}><AlertTriangle size={14} />Abrir disputa</button>
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
            <p className="text-sm font-semibold flex items-center gap-1" style={{ color: 'var(--red)' }}><AlertTriangle size={14} />Demanda em disputa</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
              Um curador irá analisar o caso e responder em até 5 dias úteis.
            </p>
          </div>
        )}
      </main>
    </Shell>
  )
}
