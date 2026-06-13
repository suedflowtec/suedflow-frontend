// app/profissional/demandas/[id]/chat/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { orders } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

export default function ChatProfissionalPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [demanda, setDemanda] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (!id) return
    orders.buscar(id)
      .then(setDemanda)
      .catch(() => toast('Erro ao carregar demanda', 'error'))
      .finally(() => setLoading(false))
  }, [id, user, authLoading, router, toast])

  if (authLoading || !user) return null
  if (loading) return (
    <Shell><Topbar title="Chat" /><main className="p-6"><p style={{ color: 'var(--text3)' }}>Carregando...</p></main></Shell>
  )

  const nomeCliente = demanda?.cliente?.usuario?.nome || demanda?.cliente?.nome

  return (
    <Shell>
      <Topbar
        title="Chat"
        subtitle={nomeCliente ? `Cliente: ${nomeCliente}` : demanda?.svc_nome || demanda?.svc_codigo}
      />
      <main className="p-6 max-w-2xl">
        <ChatPanel demandaId={id} currentUserId={user.id} />
      </main>
    </Shell>
  )
}
