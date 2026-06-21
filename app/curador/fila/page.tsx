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
  DEMANDA_ESPECIAL: { text: 'Demanda especial', variant: 'purple' },
}

export default function CuradorFilaPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()

  const [casos, setCasos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (!['CURADOR_SUPORTE', 'CURADOR_SENIOR', 'ADMIN'].includes(user.tipo)) {
      router.push('/cliente'); return
    }
    curadorApi.fila()
      .then(({ casos }) => setCasos(casos))
      .catch(() => toast('Erro ao carregar fila de casos', 'error'))
      .finally(() => setLoading(false))
  }, [user, authLoading, router, toast])

  if (authLoading || !user) return null

  return (
    <Shell>
      <Topbar title="Fila de casos" subtitle="QA reprovado, disputas e demandas especiais aguardando análise" />

      <main className="p-6">
        <div className="card-solid">
          {loading ? (
            <p className="text-sm" style={{ color: 'var(--text3)' }}>Carregando...</p>
          ) : casos.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text3)' }}>Nenhum caso na fila. 🎉</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Número</th>
                  <th>Serviço</th>
                  <th>Cliente</th>
                  <th>Profissional</th>
                  <th>Valor</th>
                  <th>Prazo</th>
                </tr>
              </thead>
              <tbody>
                {casos.map(c => {
                  const tipo = TIPO_BADGE[c.tipo] || { text: c.tipo, variant: 'glass' }
                  return (
                    <tr key={c.id} onClick={() => router.push(`/curador/casos/${c.id}`)} className="cursor-pointer">
                      <td><Badge variant={tipo.variant}>{tipo.text}</Badge></td>
                      <td className="font-mono">{c.numero || c.demanda_id?.slice(0, 8)}</td>
                      <td style={{ color: 'var(--text)' }}>{c.servico_nome || c.codigoSvc}</td>
                      <td style={{ color: 'var(--text2)' }}>{c.cliente_nome || '—'}</td>
                      <td style={{ color: 'var(--text2)' }}>{c.profissional_nome || '—'}</td>
                      <td className="font-mono" style={{ color: 'var(--orange)' }}>{formatBRL(c.preco_estimado || 0)}</td>
                      <td style={{ color: c.prazo_horas <= 4 ? 'var(--red)' : 'var(--text3)' }}>{c.prazo_horas}h</td>
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
