// app/cliente/configuracoes/page.tsx
// Configurações do cliente — mantém o nav no modo cliente
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import ConfiguracoesCore from '@/components/configuracoes/ConfiguracoesCore'

export default function ClienteConfiguracoesPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!user) { router.push('/auth/login'); return }
    if (!user.cliente) { router.push('/cliente'); return }
  }, [user, loading, router])

  if (loading || !user) return null
  return <ConfiguracoesCore modoForcado="CLIENTE" />
}
