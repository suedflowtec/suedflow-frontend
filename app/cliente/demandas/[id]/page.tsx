// app/cliente/demandas/[id]/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { orders } from '@/lib/api'
import { formatBRL, statusLabel, formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'

export default function DemandaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [demanda, setDemanda] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const id = params?.id as string

  useEffect(() => {
    if (!id) return
    orders.buscar(id)
      .then(setDemanda)
      .catch(() => toast('Erro ao carregar demanda', 'error'))
      .finally(() => setLoading(false))
  }, [id, toast])

  const pagar = async () => {
    try {
      const r = await orders.pagarPix(id)
      if (r.qr_code || r.pix_code) {
        toast('PIX gerado · veja o QR', 'success')
      }
    } catch {
      toast('Erro ao gerar PIX', 'error')
    }
  }

  const confirmar = async () => {
    try {
      await orders.confirmarEntrega(id, 5, 'Excelente trabalho')
      toast('Entrega confirmada · obrigado!', 'success')
      const updated = await orders.buscar(id)
      setDemanda(updated)
    } catch {
      toast('Erro ao confirmar', 'error')
    }
  }

  if (loading) return (
    <Shell><Topbar title="Demanda" /><div className="p-8 text-center text-sm text-ink-muted">Carregando...</div></Shell>
  )
  if (!demanda) return (
    <Shell><Topbar title="Demanda" /><div className="p-8 text-center text-sm text-ink-muted">Demanda não encontrada</div></Shell>
  )

  const s = statusLabel(demanda.status)
  const fsmStates = ['AGUARDANDO_PAGAMENTO', 'AGUARDANDO', 'ACEITA', 'EM_EXECUCAO', 'AGUARDANDO_QA', 'AGUARDANDO_CONFIRMACAO', 'CONCLUIDA']
  const currentIdx = fsmStates.indexOf(demanda.status)

  return (
    <Shell>
      <Topbar
        title={demanda.numero || demanda.id?.slice(0,8)}
        actions={<span className={`badge badge-${s.variant === 'glass' ? 'gray' : s.variant}`}>{s.text}</span>}
      />

      <main className="p-6 max-w-2xl space-y-4">
        <div>
          <h2 className="text-lg font-bold text-navy">{demanda.svc_nome || demanda.svc_codigo}</h2>
          <p className="text-sm text-ink-muted">{demanda.area_m2}m² · {demanda.cidade}</p>
        </div>

        {/* FSM */}
        <div className="card p-4">
          <p className="text-2xs uppercase tracking-wider font-semibold text-ink-muted mb-3">Fluxo da demanda</p>
          <div className="space-y-2">
            {[
              { idx: 0, label: 'Aguardando pagamento' },
              { idx: 1, label: 'Visível para profissionais' },
              { idx: 2, label: 'Profissional aceitou' },
              { idx: 3, label: 'Em execução' },
              { idx: 4, label: 'Em revisão SUE' },
              { idx: 5, label: 'Aguardando sua confirmação' },
              { idx: 6, label: 'Concluída' },
            ].map(step => {
              const isDone = step.idx < currentIdx
              const isCurrent = step.idx === currentIdx
              return (
                <div key={step.idx} className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border ${
                      isDone ? 'bg-green-50 text-green-700 border-green-200'
                        : isCurrent ? 'bg-orange text-white border-orange animate-pulse'
                        : 'bg-surface text-ink-light border-surface-border'
                    }`}
                  >
                    {isDone ? '✓' : step.idx + 1}
                  </div>
                  <span className={`text-sm ${isCurrent ? 'font-semibold text-navy' : isDone ? 'text-ink-secondary' : 'text-ink-light'}`}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Resumo financeiro */}
        <div className="card p-4">
          <p className="text-2xs uppercase tracking-wider font-semibold text-ink-muted mb-3">Pagamento</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-ink-muted">Total</span><span className="font-bold text-orange text-lg font-mono">{formatBRL(demanda.preco_cliente || demanda.preco_servico || 0)}</span></div>
            <div className="flex justify-between"><span className="text-ink-muted">Status</span><Badge variant={demanda.pago_em ? 'green' : 'gold'}>{demanda.pago_em ? '🔒 Em escrow' : 'Aguardando pagamento'}</Badge></div>
            {demanda.pago_em && <div className="flex justify-between"><span className="text-ink-muted">Pago em</span><span className="text-navy">{formatDate(demanda.pago_em)}</span></div>}
          </div>
        </div>

        {/* Profissional designado */}
        {demanda.profissional && (
          <div className="card p-4">
            <p className="text-2xs uppercase tracking-wider font-semibold text-ink-muted mb-3">Profissional</p>
            <div className="flex gap-3 items-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-orange-50 text-orange">
                {(demanda.profissional?.nome || 'P').charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-navy">{demanda.profissional?.nome || 'Profissional'}</p>
                <p className="text-2xs text-ink-muted font-mono">{demanda.profissional?.conselho || 'CREA'}-{demanda.profissional?.uf_conselho || 'PB'} {demanda.profissional?.numero_conselho?.replace(/(\d{3})\d+/, '$1XXX-X')}</p>
                <div className="flex gap-1 mt-1">
                  <Badge variant="orange">{demanda.profissional?.nivel || 'PLENO'}</Badge>
                  <Badge variant="green">✓ CREA verificado</Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push(`/cliente/demandas/${id}/chat`)}>💬</Button>
            </div>
          </div>
        )}

        {/* Ações conforme status */}
        <div className="space-y-2">
          {demanda.status === 'AGUARDANDO_PAGAMENTO' && (
            <Button onClick={pagar} className="w-full btn-lg">💳 Pagar com PIX</Button>
          )}
          {demanda.status === 'AGUARDANDO_CONFIRMACAO' && (
            <Button onClick={confirmar} variant="green" className="w-full btn-lg">✓ Confirmar entrega</Button>
          )}
          {!['CONCLUIDA', 'CANCELADA'].includes(demanda.status) && (
            <Button variant="ghost" className="w-full" onClick={() => router.push(`/cliente/demandas/${id}/chat`)}>💬 Chat com profissional</Button>
          )}
        </div>
      </main>
    </Shell>
  )
}
