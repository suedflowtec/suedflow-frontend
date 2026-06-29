// app/profissional/configuracoes/page.tsx
// Configurações do profissional — mantém o nav no modo profissional
// Esta rota existe dentro de /profissional/ para que o Shell mantenha
// o contexto correto ao trocar entre modos cliente/profissional na mesma conta.
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import ConfiguracoesCore from '@/components/configuracoes/ConfiguracoesCore'

export default function ProfissionalConfiguracoesPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!user) { router.push('/auth/login'); return }
    if (!user.profissional) { router.push('/profissional'); return }
  }, [user, loading, router])

  if (loading || !user) return null
  return <ConfiguracoesCore modoForcado="PROFISSIONAL" />
}
