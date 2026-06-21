// app/curador/fila/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { Badge } from '@/components/ui/Badge'
import { curador as curadorApi } from '@/lib/api'
import { formatBRL } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

const TIPO_BADGE: Record<string, { text: string; variant: any }> = {
  QA_REPROVADO:     { text: 'QA reprovado', variant: 'gold' },
  DISPUTA:          { text: 'Disputa', variant: 'red' },
  DEMANDA_ESPECIAL: { text: 'Dem. especial', variant: 'purple' },
}

function prazoInfo(prazoHoras: number) {
  if (prazoHoras <= 0)  return { label: 'Atrasado', color: 'var(--red)',  urgente: true }
  if (prazoHoras <= 4)  return { label: `${prazoHoras}h`, color: 'var(--red)',  urgente: true }
  if (prazoHoras <= 12) return { label: `${prazoHoras}h`, color: 'var(--gold)', urgente: false }
  return { label: `${prazoHoras}h`, color: 'var(--text3)', urgente: false }
}

export default function CuradorFilaPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()

  const [casos, setCasos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (!['CURADOR_SUPORTE', 'CURADOR_SENIOR', 'ADMIN'].includes(user.tipo)) {
      router.push('/cliente'); return
    }
    curadorApi.fila()
      .then(({ casos }) => {
        // Ordenar: atrasados/urgentes primeiro, depois por prazo crescente
        const sorted = [...casos].sort((a, b) => (a.prazo_horas ?? 999) - (b.prazo_horas ?? 999))
        setCasos(sorted)
      })
      .catch(() => toast('Erro ao carregar fila de casos', 'error'))
      .finally(() => setLoading(false))
  }, [user, authLoading, router, toast])

  if (authLoading || !user) return null

  const filtrados = casos.filter(c =>
    !filtro ||
    (c.numero || '').toLowerCase().includes(filtro.toLowerCase()) ||
    (c.cliente_nome || '').toLowerCase().includes(filtro.toLowerCase()) ||
    (c.tipo || '').toLowerCase().includes(filtro.toLowerCase())
  )

  const urgentes = casos.filter(c => c.prazo_horas <= 4).length
  const atrasados = casos.filter(c => c.prazo_horas <= 0).length

  return (
    <Shell>
      <Topbar
        title="Fila de casos"
        subtitle={`${casos.length} caso${casos.length !== 1 ? 's' : ''} aguardando análise`}
        actions={
          <div className="flex items-center gap-2">
            {atrasados > 0 && <Badge variant="red">{atrasados} atrasado{atrasados !== 1 ? 's' : ''}</Badge>}
            {urgentes > 0 && <Badge variant="gold">{urgentes} ≤4h</Badge>}
          </div>
        }
      />

      <main className="p-6 space-y-4">
        <input
          className="input max-w-sm text-sm"
          placeholder="Filtrar por número, cliente ou tipo..."
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
        />

        <div className="card-solid overflow-x-auto">
          {loading ? (
            <p className="text-sm p-4" style={{ color: 'var(--text3)' }}>Carregando...</p>
          ) : filtrados.length === 0 ? (
            <p className="text-sm p-4" style={{ color: 'var(--text3)' }}>
              {filtro ? 'Nenhum caso encontrado.' : 'Nenhum caso na fila. 🎉'}
            </p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Prazo</th>
                  <th>Tipo</th>
                  <th>Número</th>
                  <th>Serviço</th>
                  <th>Cliente</th>
                  <th>Profissional</th>
                  <th className="text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(c => {
                  const tipo = TIPO_BADGE[c.tipo] || { text: c.tipo, variant: 'glass' }
                  const prazo = prazoInfo(c.prazo_horas ?? 999)
                  return (
                    <tr
                      key={c.id}
                      onClick={() => router.push(`/curador/casos/${c.id}`)}
                      className="cursor-pointer"
                      style={prazo.urgente ? { background: 'rgba(220,38,38,0.04)' } : undefined}
                    >
                      <td>
                        <span className="font-mono text-xs font-semibold" style={{ color: prazo.color }}>
                          {prazo.label}
                        </span>
                      </td>
                      <td><Badge variant={tipo.variant}>{tipo.text}</Badge></td>
                      <td className="font-mono text-xs">{c.numero || c.demanda_id?.slice(0, 8)}</td>
                      <td style={{ color: 'var(--text)' }}>{c.servico_nome || c.svc_codigo || '—'}</td>
                      <td style={{ color: 'var(--text2)' }}>{c.cliente_nome || '—'}</td>
                      <td style={{ color: 'var(--text2)' }}>{c.profissional_nome || '—'}</td>
                      <td className="text-right font-mono text-sm" style={{ color: 'var(--orange)' }}>
                        {formatBRL(c.preco_estimado || 0)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </Shell>
  )
}
