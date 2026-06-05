// app/cliente/demandas/[id]/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppShell, StatusBar } from '@/components/layout/AppShell'
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
        // Em demo, usuário vê QR · em produção integraria Pagar.me
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
    <AppShell><StatusBar /><div className="p-8 text-center text-white/50">Carregando...</div></AppShell>
  )
  if (!demanda) return (
    <AppShell><StatusBar /><div className="p-8 text-center text-white/50">Demanda não encontrada</div></AppShell>
  )

  const s = statusLabel(demanda.status)
  const fsmStates = ['AGUARDANDO_PAGAMENTO', 'AGUARDANDO', 'ACEITA', 'EM_EXECUCAO', 'AGUARDANDO_QA', 'AGUARDANDO_CONFIRMACAO', 'CONCLUIDA']
  const currentIdx = fsmStates.indexOf(demanda.status)

  return (
    <AppShell>
      <StatusBar />
      <div className="px-5 pt-4 pb-12">
        <button onClick={() => router.back()} className="back-btn mb-3">←</button>

        <div className="flex justify-between items-start mb-1">
          <p className="text-[10px] font-mono text-white/50">{demanda.numero || demanda.id?.slice(0,8)}</p>
          <Badge variant={s.variant as any}>{s.text}</Badge>
        </div>
        <h1 className="text-xl font-black mb-1">{demanda.svc_nome || demanda.svc_codigo}</h1>
        <p className="text-sm text-white/65 mb-5">{demanda.area_m2}m² · {demanda.cidade}</p>

        {/* FSM */}
        <div className="glass-card mb-4">
          <p className="text-[11px] uppercase tracking-wider font-bold text-white/65 mb-3">Fluxo da demanda</p>
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
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      background: isDone ? 'rgba(0,214,143,0.15)' : isCurrent ? 'linear-gradient(135deg, #E8671A, #FF7A2E)' : 'var(--glass)',
                      color: isDone ? '#00D68F' : isCurrent ? 'white' : 'var(--text3)',
                      border: `1px solid ${isDone ? 'rgba(0,214,143,0.3)' : isCurrent ? 'transparent' : 'var(--border)'}`,
                      animation: isCurrent ? 'pulseOrange 2s ease-in-out infinite' : 'none',
                    }}
                  >
                    {isDone ? '✓' : step.idx + 1}
                  </div>
                  <span className={`text-sm ${isCurrent ? 'font-bold' : isDone ? 'text-white/80' : 'text-white/40'}`}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Resumo financeiro */}
        <div className="glass-card mb-4">
          <p className="text-[11px] uppercase tracking-wider font-bold text-white/65 mb-3">Pagamento</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-white/65">Total</span><span className="font-bold text-orange text-lg">{formatBRL(demanda.preco_cliente || demanda.preco_servico || 0)}</span></div>
            <div className="flex justify-between"><span className="text-white/65">Status</span><Badge variant={demanda.pago_em ? 'green' : 'gold'}>{demanda.pago_em ? '🔒 Em escrow' : 'Aguardando pagamento'}</Badge></div>
            {demanda.pago_em && <div className="flex justify-between"><span className="text-white/65">Pago em</span><span>{formatDate(demanda.pago_em)}</span></div>}
          </div>
        </div>

        {/* Profissional designado */}
        {demanda.profissional && (
          <div className="glass-card mb-4">
            <p className="text-[11px] uppercase tracking-wider font-bold text-white/65 mb-3">Profissional</p>
            <div className="flex gap-3 items-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg" style={{ background: 'rgba(232,103,26,0.15)', color: '#FF7A2E' }}>
                {(demanda.profissional?.nome || 'P').charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-bold">{demanda.profissional?.nome || 'Profissional'}</p>
                <p className="text-[11px] text-white/50 font-mono">{demanda.profissional?.conselho || 'CREA'}-{demanda.profissional?.uf_conselho || 'PB'} {demanda.profissional?.numero_conselho?.replace(/(\d{3})\d+/, '$1XXX-X')}</p>
                <div className="flex gap-1 mt-1">
                  <Badge variant="orange">{demanda.profissional?.nivel || 'PLENO'}</Badge>
                  <Badge variant="green">✓ CREA verificado</Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm">💬</Button>
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
            <Button variant="ghost" className="w-full" onClick={() => toast('Em desenvolvimento', 'info')}>💬 Chat com profissional</Button>
          )}
        </div>
      </div>
    </AppShell>
  )
}
