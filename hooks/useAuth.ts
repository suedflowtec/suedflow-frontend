// hooks/useAuth.ts
'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { auth as authApi, tokenStorage, userStorage } from '@/lib/api'

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // SEC: Carrega dados do servidor em vez de confiar apenas no localStorage
    // Evita que o usuário manipule o localStorage via F12 para ganhar permissões
    const token = tokenStorage.get()
    if (!token) {
      setLoading(false)
      return
    }

    // Tentativa rápida: usa localStorage como valor inicial (UX)
    const cached = userStorage.get()
    if (cached) setUser(cached)

    // Verificação real no servidor — atualiza e sobrescreve qualquer manipulação
    authApi.me()
      .then((freshUser) => {
        userStorage.set(freshUser)
        setUser(freshUser)
      })
      .catch(() => {
        // Token inválido ou expirado → limpa tudo
        tokenStorage.clear()
        userStorage.clear()
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const updateUser = useCallback((partial: Record<string, any>) => {
    setUser((prev: any) => {
      const next = { ...prev, ...partial }
      userStorage.set(next)
      return next
    })
  }, [])

  const login = useCallback(async (email: string, senha: string) => {
    const data = await authApi.login(email, senha)
    tokenStorage.set(data.token)
    userStorage.set(data.usuario)
    setUser(data.usuario)
    return data.usuario
  }, [])

  const logout = useCallback(() => {
    tokenStorage.clear()
    userStorage.clear()
    setUser(null)
    router.push('/auth/login')
  }, [router])

  return { user, loading, login, logout, updateUser, isAuthenticated: !!user }
}
