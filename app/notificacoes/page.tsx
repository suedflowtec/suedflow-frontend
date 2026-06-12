'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { notificacoes } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

const TIPO_ICON: Record<string, string> = {
  DEMANDA:   '📋',
  PAGAMENTO: '₿',
  QA:        '✓',
  SISTEMA:   '⚙',
  ALERTA:    '⚠',
}

export default function NotificacoesPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [itens, setItens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lidas, setLidas] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    notificacoes.listar()
      .then((d: any) => setItens(Array.isArray(d) ? d : (d?.notificacoes || [])))
      .catch(() => toast('Erro ao carregar notificações', 'error'))
      .finally(() => setLoading(false))
  }, [user, authLoading, router, toast])

  if (authLoading || !user) return null

  const marcarTodasComoLidas = () => {
    // TODO: integrar com endpoint de marcação em lote quando disponível no backend
    setLidas(new Set(itens.map(n => n.id)))
    toast('Notificações marcadas como lidas', 'success')
  }

  return (
    <Shell>
      <Topbar
        title="Notificações"
        actions={
          itens.length > 0 ? (
            <button onClick={marcarTodasComoLidas} className="btn btn-secondary btn-sm">
              Marcar todas como lidas
            </button>
          ) : undefined
        }
      />

      <main className="p-6 max-w-2xl space-y-3">
        {loading ? (
          <p className="text-sm py-10 text-center" style={{ color: 'var(--text3)' }}>Carregando...</p>
        ) : itens.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-sm" style={{ color: 'var(--text3)' }}>Você não tem notificações.</p>
          </div>
        ) : (
          itens.map(n => {
            const lida = n.lida || lidas.has(n.id)
            return (
              <div
                key={n.id}
                onClick={() => n.demanda_id && router.push(`/cliente/demandas/${n.demanda_id}`)}
                className="card flex gap-3 items-start"
                style={{
                  cursor: n.demanda_id ? 'pointer' : 'default',
                  borderColor: lida ? 'var(--border)' : 'rgba(232,103,26,0.35)',
                  background: lida ? 'var(--glass)' : 'rgba(232,103,26,0.06)',
                }}
              >
                <div className="text-xl shrink-0">{TIPO_ICON[n.tipo] || '🔔'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-white text-sm">{n.titulo || n.tipo}</p>
                    {!lida && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--orange)' }} />}
                  </div>
                  {n.corpo && (
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text2)' }}>{n.corpo}</p>
                  )}
                  <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                    {n.created_at ? new Date(n.created_at).toLocaleString('pt-BR') : ''}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </main>
    </Shell>
  )
}
