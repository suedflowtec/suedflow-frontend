// app/curador/casos/[id]/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { curador as curadorApi } from '@/lib/api'
import { formatBRL, formatDate } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

const TIPO_BADGE: Record<string, { text: string; variant: any }> = {
  QA_REPROVADO:     { text: 'QA reprovado', variant: 'gold' },
  DISPUTA:          { text: 'Disputa', variant: 'red' },
  DEMANDA_ESPECIAL: { text: 'Demanda especial', variant: 'purple' },
}

export default function CuradorCasoDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const id = params?.id as string

  const [data, setData] = useState<{ caso: any; checklist: any[]; analise_sue: any } | null>(null)
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [preco, setPreco] = useState('')
  const [sla, setSla] = useState('')
  const [obs, setObs] = useState('')

  const carregar = () => {
    curadorApi.caso(id)
      .then(setData)
      .catch((err: any) => toast(err.message || 'Erro ao carregar caso', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (!id) return
    carregar()
  }, [user, authLoading, router, id])

  if (authLoading || !user) return null
  if (loading) return (
    <Shell><Topbar title="Caso" /><main className="p-6"><p style={{ color: 'var(--text3)' }}>Carregando...</p></main></Shell>
  )
  if (!data?.caso) return (
    <Shell><Topbar title="Caso" /><main className="p-6"><p style={{ color: 'var(--text3)' }}>Caso não encontrado.</p></main></Shell>
  )

  const { caso, checklist, analise_sue } = data
  const demanda = caso.demanda
  const tipo = TIPO_BADGE[caso.tipo] || { text: caso.tipo, variant: 'glass' }

  const aprovar = async () => {
    setEnviando(true)
    try {
      await curadorApi.aprovarQa(caso.id, feedback.trim() || undefined)
      toast('Caso aprovado', 'success')
      router.push('/curador/fila')
    } catch (err: any) {
      toast(err.message || 'Erro ao aprovar', 'error')
    } finally {
      setEnviando(false)
    }
  }

  const reprovar = async () => {
    if (feedback.trim().length < 10) {
      toast('Descreva o motivo da reprovação (mínimo 10 caracteres)', 'error')
      return
    }
    setEnviando(true)
    try {
      await curadorApi.reprovarQa(caso.id, feedback.trim())
      toast('Caso reprovado · profissional notificado', 'success')
      router.push('/curador/fila')
    } catch (err: any) {
      toast(err.message || 'Erro ao reprovar', 'error')
    } finally {
      setEnviando(false)
    }
  }

  const precificar = async () => {
    if (!preco || !sla) {
      toast('Informe preço e prazo (SLA em dias)', 'error')
      return
    }
    setEnviando(true)
    try {
      await curadorApi.precificarEspecial(caso.demanda_id, { preco: Number(preco), sla: Number(sla), obs: obs.trim() || undefined })
      toast('Demanda especial precificada · cliente notificado', 'success')
      router.push('/curador/fila')
    } catch (err: any) {
      toast(err.message || 'Erro ao precificar', 'error')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Shell>
      <Topbar
        title={demanda?.numero || caso.demanda_id?.slice(0, 8)}
        subtitle={`${demanda?.servico?.nome || demanda?.svc_codigo || ''} · ${demanda?.area_m2 || '—'}m²`}
        actions={<Badge variant={tipo.variant}>{tipo.text}</Badge>}
      />

      <main className="p-6 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card-solid">
              <p className="section-label mb-3">Demanda</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text3)' }}>Cliente</span>
                  <span style={{ color: 'var(--text)' }}>{demanda?.cliente?.usuario?.nome || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text3)' }}>Profissional</span>
                  <span style={{ color: 'var(--text)' }}>{demanda?.profissional?.usuario?.nome || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text3)' }}>Valor</span>
                  <span className="font-mono" style={{ color: 'var(--orange)' }}>{formatBRL(demanda?.preco_servico || demanda?.valor_total || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text3)' }}>Aberto em</span>
                  <span style={{ color: 'var(--text)' }}>{formatDate(caso.created_at)}</span>
                </div>
                {demanda?.descricao && (
                  <div className="pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-2xs mb-1" style={{ color: 'var(--text3)' }}>Descrição</p>
                    <p style={{ color: 'var(--text2)' }}>{demanda.descricao}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Motivo da disputa */}
            {caso.tipo === 'DISPUTA' && caso.obs && (
              <div className="card-solid">
                <p className="section-label mb-2">Motivo da disputa</p>
                <p className="text-sm" style={{ color: 'var(--text2)' }}>{caso.obs}</p>
              </div>
            )}

            {/* Checklist QA */}
            {caso.tipo === 'QA_REPROVADO' && checklist.length > 0 && (
              <div className="card-solid">
                <p className="section-label mb-3">Checklist do serviço</p>
                <ul className="space-y-1">
                  {checklist.map((item: any) => (
                    <li key={item.id} className="text-sm" style={{ color: 'var(--text2)' }}>• {item.descricao}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Análise SUE */}
            {analise_sue && (
              <div className="card-solid">
                <p className="section-label mb-3">Análise SUE (AVC)</p>
                <pre className="text-xs p-3 rounded-xl overflow-auto" style={{ background: 'var(--navy3)', color: 'var(--text2)' }}>
                  {JSON.stringify(analise_sue, null, 2)}
                </pre>
              </div>
            )}

            {/* Ações */}
            {caso.tipo === 'QA_REPROVADO' && (
              <div className="card-solid space-y-3">
                <p className="section-label">Decisão</p>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Feedback (obrigatório para reprovar, opcional para aprovar)"
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button variant="green" className="flex-1" disabled={enviando} onClick={aprovar}>
                    ✓ Aprovar entrega
                  </Button>
                  <Button variant="orange" className="flex-1" disabled={enviando} onClick={reprovar}>
                    ✗ Reprovar (retrabalho)
                  </Button>
                </div>
              </div>
            )}

            {caso.tipo === 'DISPUTA' && (
              <div className="card-solid">
                <p className="text-sm" style={{ color: 'var(--text2)' }}>
                  A resolução formal de disputas (decisão de reembolso/liberação de escrow) ainda
                  não tem endpoint dedicado no backend — registrado como pendência técnica.
                  Use o chat da demanda para mediar diretamente com cliente e profissional.
                </p>
              </div>
            )}

            {caso.tipo === 'DEMANDA_ESPECIAL' && (user.tipo === 'CURADOR_SENIOR' || user.tipo === 'ADMIN') && (
              <div className="card-solid space-y-3">
                <p className="section-label">Precificação manual</p>
                <p className="text-sm" style={{ color: 'var(--text2)' }}>
                  Área acima do limite padrão do serviço — defina preço e prazo manualmente.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs" style={{ color: 'var(--text3)' }}>Preço (R$)</label>
                    <input className="input mt-1" type="number" step="any" value={preco} onChange={e => setPreco(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs" style={{ color: 'var(--text3)' }}>Prazo (dias úteis)</label>
                    <input className="input mt-1" type="number" value={sla} onChange={e => setSla(e.target.value)} />
                  </div>
                </div>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="Observações (opcional)"
                  value={obs}
                  onChange={e => setObs(e.target.value)}
                />
                <Button variant="orange" className="w-full" disabled={enviando} onClick={precificar}>
                  Enviar precificação ao cliente
                </Button>
              </div>
            )}
          </div>

          {/* Coluna lateral */}
          <div className="space-y-4">
            <Button variant="ghost" className="w-full" onClick={() => router.push('/curador/fila')}>
              ← Voltar para a fila
            </Button>
          </div>
        </div>
      </main>
    </Shell>
  )
}
