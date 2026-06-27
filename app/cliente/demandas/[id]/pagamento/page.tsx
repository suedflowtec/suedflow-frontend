// app/cliente/demandas/[id]/pagamento/page.tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { Shell, Topbar } from '@/components/layout/Shell'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { orders } from '@/lib/api'
import { formatBRL, statusLabel } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00'
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

type Metodo = 'PIX' | 'BOLETO'

export default function PagamentoPixPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const id = params?.id as string

  const [demanda, setDemanda] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [metodo, setMetodo] = useState<Metodo>('PIX')
  const [pix, setPix] = useState<{ pix_code: string; pix_qr: string | null; valor: number; expira_em: string; mock?: boolean } | null>(null)
  const [boleto, setBoleto] = useState<{ boleto_url: string; boleto_codigo: string; valor: number; vencimento: string } | null>(null)
  const [gerando, setGerando] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [agora, setAgora] = useState(Date.now())
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const carregarDemanda = () => orders.buscar(id).then(setDemanda)

  useEffect(() => {
    if (!id) return
    carregarDemanda().catch(() => toast('Erro ao carregar demanda', 'error')).finally(() => setLoading(false))
  }, [id])

  // Tique do cronômetro
  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  // Polling de status enquanto aguarda confirmação (modo real)
  useEffect(() => {
    if (!pix || pix.mock) return
    pollRef.current = setInterval(async () => {
      try {
        const d = await orders.buscar(id)
        if (d.status === 'PAGA') {
          setDemanda(d)
          if (pollRef.current) clearInterval(pollRef.current)
          toast('Pagamento confirmado!', 'success')
        }
      } catch { /* ignora erro de polling */ }
    }, 5000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [pix, id])

  const gerarPix = async () => {
    setGerando(true)
    try {
      const r = await orders.pagarPix(id)
      setPix(r)
    } catch (err: any) {
      toast(err.message || 'Erro ao gerar PIX', 'error')
    } finally {
      setGerando(false)
    }
  }

  const gerarBoleto = async () => {
    setGerando(true)
    try {
      const r = await orders.pagarBoleto(id)
      setBoleto(r)
    } catch (err: any) {
      toast(err.message || 'Erro ao gerar boleto', 'error')
    } finally {
      setGerando(false)
    }
  }

  // Gera PIX automaticamente ao entrar, se a demanda estiver ACEITA e metodo=PIX.
  // Se já existe pix_code no banco (sessão anterior), recupera sem criar nova cobrança.
  useEffect(() => {
    if (demanda?.status === 'ACEITA' && metodo === 'PIX' && !pix && !gerando) {
      if (demanda.pix_code) {
        // PIX já gerado — reconstituir do dado persistido para não duplicar cobranças no ASAAS
        setPix({
          pix_code:  demanda.pix_code,
          pix_qr:    demanda.pix_qr_url || null,
          valor:     demanda.valor_total,
          expira_em: '',
        })
      } else {
        gerarPix()
      }
    }
  }, [demanda, metodo])

  const simularConfirmacao = async () => {
    setConfirmando(true)
    try {
      await orders.mockConfirmarPagamento(id)
      toast('Pagamento confirmado (simulado)', 'success')
      const d = await orders.buscar(id)
      setDemanda(d)
    } catch (err: any) {
      toast(err.message || 'Erro ao confirmar pagamento simulado', 'error')
    } finally {
      setConfirmando(false)
    }
  }

  const copiarCodigo = async () => {
    if (!pix) return
    try {
      await navigator.clipboard.writeText(pix.pix_code)
      toast('Código PIX copiado', 'success')
    } catch {
      toast('Não foi possível copiar', 'error')
    }
  }

  if (loading) return (
    <Shell><Topbar title="Pagamento" /><main className="p-6"><p style={{ color: 'var(--text3)' }}>Carregando...</p></main></Shell>
  )
  if (!demanda) return (
    <Shell><Topbar title="Pagamento" /><main className="p-6"><p style={{ color: 'var(--text3)' }}>Demanda não encontrada.</p></main></Shell>
  )

  const s = statusLabel(demanda.status)
  const expiraEm = pix ? new Date(pix.expira_em).getTime() : 0
  const restante = expiraEm - agora
  const expirado = pix ? restante <= 0 : false

  return (
    <Shell>
      <Topbar
        title="Pagamento via PIX"
        subtitle={`${demanda.servico?.nome || demanda.svc_codigo} · ${demanda.numero || demanda.id?.slice(0, 8)}`}
        actions={<Badge variant={s.variant as any}>{s.text}</Badge>}
      />

      <main className="p-6 max-w-5xl">
        {['PAGA','EM_EXECUCAO','AGUARDANDO_QA','QA_REPROVADO','AGUARDANDO_CONFIRMACAO','CONCLUIDA'].includes(demanda.status) ? (
          <div className="card-solid max-w-md text-center space-y-3">
            <p className="text-3xl">✅</p>
            <p className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Pagamento confirmado</p>
            <p className="text-sm" style={{ color: 'var(--text2)' }}>
              O valor de {formatBRL(demanda.valor_total || 0)} está em escrow na plataforma e será liberado
              ao profissional após a confirmação da entrega.
            </p>
            <Button className="w-full" onClick={() => router.push(`/cliente/demandas/${id}`)}>
              Voltar para a demanda
            </Button>
          </div>
        ) : demanda.status !== 'ACEITA' ? (
          <div className="card-solid max-w-md space-y-3">
            <p className="text-sm" style={{ color: 'var(--text2)' }}>
              Esta demanda não está disponível para pagamento no momento (status atual: {s.text}).
            </p>
            <Button variant="ghost" onClick={() => router.push(`/cliente/demandas/${id}`)}>Voltar para a demanda</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Painel de pagamento */}
            <div className="lg:col-span-2 card-solid space-y-4">
              {/* Toggle PIX / Boleto */}
              <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {(['PIX', 'BOLETO'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setMetodo(m)}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      background: metodo === m ? 'linear-gradient(135deg, var(--orange), var(--orange2))' : 'transparent',
                      color: metodo === m ? '#fff' : 'var(--text3)',
                      boxShadow: metodo === m ? '0 2px 8px rgba(232,103,26,0.35)' : 'none',
                    }}
                  >
                    {m === 'PIX' ? '⚡ PIX' : '📄 Boleto'}
                  </button>
                ))}
              </div>

              <p className="section-label">{metodo === 'PIX' ? 'Pague com PIX' : 'Pague com Boleto Bancário'}</p>

              {/* ── PIX ── */}
              {metodo === 'PIX' && (
              <>
              {pix?.mock && (
                <div className="text-2xs px-3 py-2 rounded-lg" style={{ background: 'rgba(255,193,7,0.12)', color: 'var(--gold)' }}>
                  🎭 Modo demonstração (PAYMENT_MODE=mock) · este PIX é simulado. A integração real com o Pagar.me
                  será ativada quando a conta estiver configurada (depende do CNPJ).
                </div>
              )}

              {gerando && !pix ? (
                <p className="text-sm" style={{ color: 'var(--text3)' }}>Gerando código PIX...</p>
              ) : pix ? (
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                  <div className="p-4 rounded-xl shrink-0" style={{ background: '#fff' }}>
                    <QRCodeSVG value={pix.pix_code} size={200} />
                  </div>
                  <div className="flex-1 w-full space-y-3">
                    <div>
                      <p className="text-sm mb-1" style={{ color: 'var(--text2)' }}>
                        Escaneie o QR Code com o app do seu banco ou copie o código abaixo.
                      </p>
                      <p className="text-xs" style={{ color: expirado ? 'var(--red)' : 'var(--text3)' }}>
                        {expirado ? 'Código expirado · gere um novo PIX.' : `Expira em ${formatCountdown(restante)}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={pix.pix_code}
                        className="input flex-1 text-xs font-mono"
                        onFocus={e => e.target.select()}
                      />
                      <Button variant="ghost" onClick={copiarCodigo}>Copiar</Button>
                    </div>
                    {expirado && (
                      <Button onClick={gerarPix} loading={gerando}>Gerar novo PIX</Button>
                    )}
                    {pix.mock && !expirado && (
                      <Button variant="green" className="w-full" onClick={simularConfirmacao} loading={confirmando}>
                        ✓ Simular pagamento confirmado
                      </Button>
                    )}
                    {!pix.mock && !expirado && (
                      <p className="text-2xs" style={{ color: 'var(--text3)' }}>
                        Aguardando confirmação do pagamento... esta página será atualizada automaticamente.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <Button onClick={gerarPix} loading={gerando}>Gerar código PIX</Button>
              )}
              </>
              )}

              {/* ── BOLETO ── */}
              {metodo === 'BOLETO' && (
                <div className="space-y-3">
                  <p className="text-sm" style={{ color: 'var(--text2)' }}>
                    Prazo de compensação: até 3 dias úteis. A demanda será iniciada após a confirmação do banco.
                  </p>
                  {!boleto ? (
                    <Button onClick={gerarBoleto} loading={gerando} className="w-full">
                      Gerar boleto bancário
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <p className="text-xs font-semibold" style={{ color: 'var(--text3)' }}>Código do boleto</p>
                        <input
                          readOnly
                          value={boleto.boleto_codigo}
                          className="input text-xs font-mono w-full"
                          onFocus={e => e.target.select()}
                        />
                        <p className="text-xs" style={{ color: 'var(--text3)' }}>
                          Vencimento: {new Date(boleto.vencimento).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <a
                        href={boleto.boleto_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary w-full flex items-center justify-center gap-2"
                      >
                        Abrir boleto para imprimir / salvar ↗
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Resumo */}
            <div className="card-solid space-y-2">
              <p className="section-label mb-1">Resumo do pedido</p>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text3)' }}>Serviço</span>
                <span style={{ color: 'var(--text)' }}>{demanda.servico?.nome || demanda.svc_codigo}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text3)' }}>Área</span>
                <span style={{ color: 'var(--text)' }}>{demanda.area_m2}m²</span>
              </div>
              <div className="divider" />
              <div className="flex justify-between">
                <span style={{ color: 'var(--text3)' }}>Total</span>
                <span className="font-bold text-lg font-mono" style={{ color: 'var(--orange)' }}>
                  {formatBRL(demanda.valor_total || demanda.preco_final || demanda.preco_servico || 0)}
                </span>
              </div>
              <p className="text-2xs pt-1" style={{ color: 'var(--text3)' }}>
                O valor fica retido em escrow na plataforma SUEDFLOW até a confirmação da entrega.
              </p>
            </div>
          </div>
        )}
      </main>
    </Shell>
  )
}
