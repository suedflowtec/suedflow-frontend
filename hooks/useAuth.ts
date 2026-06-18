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
    const stored = userStorage.get()
    if (stored) setUser(stored)
    setLoading(false)
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
