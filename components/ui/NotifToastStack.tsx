'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { X } from 'lucide-react'

interface Toast {
  uid: number
  id: string
  titulo: string
  corpo?: string
  tipo: string
  categoria: string
  demanda_id?: string
}

const TIPO_ICON: Record<string, string> = {
  ALERTA: '⚠️', SUCESSO: '✅', INFO: 'ℹ️', ERRO: '❌',
}
const CAT_COLOR: Record<string, string> = {
  FINANCEIRO: 'var(--green)',
  DEMANDA:    'var(--orange)',
  SEGURANCA:  'var(--red)',
  CADASTRO:   'var(--purple)',
  SISTEMA:    'var(--text3)',
}

function getRolePrefix(user: any): string {
  if (user?.profissional)                                      return 'profissional'
  if (user?.role === 'CLIENTE' || user?.cliente)               return 'cliente'
  if (['CURADOR_SUPORTE', 'CURADOR_SENIOR'].includes(user?.role)) return 'curador'
  if (['ADMIN', 'MODERADOR'].includes(user?.role))             return 'admin'
  return 'profissional'
}

function getNavUrl(n: Toast, user: any): string {
  const role = getRolePrefix(user)
  if (n.demanda_id) return `/${role}/demandas/${n.demanda_id}`
  switch (n.categoria) {
    case 'FINANCEIRO': return `/${role}/financeiro`
    case 'CADASTRO':   return role === 'profissional' ? '/profissional/perfil' : '/cliente/perfil'
    case 'SEGURANCA':  return '/notificacoes'
    default:           return '/notificacoes'
  }
}

const TOAST_DURATION = 5000

function getRoleFromPath(pathname: string, user: any): string | null {
  if (pathname?.startsWith('/profissional')) return 'PROFISSIONAL'
  if (pathname?.startsWith('/cliente'))      return 'CLIENTE'
  if (user?.profissional) return 'PROFISSIONAL'
  if (user?.role === 'CLIENTE' || user?.cliente) return 'CLIENTE'
  return null
}

export function NotifToastStack() {
  const { user }  = useAuth()
  const router    = useRouter()
  const pathname  = usePathname()
  const [toasts, setToasts] = useState<Toast[]>([])
  const chatsAtivos = useRef<Set<string>>(new Set())

  const dismiss = useCallback((uid: number) => {
    setToasts(prev => prev.filter(t => t.uid !== uid))
  }, [])

  // Rastrear quais chats estão com o usuário ativamente visualizando
  useEffect(() => {
    const onAtivo  = (e: Event) => chatsAtivos.current.add((e as CustomEvent).detail?.demandaId)
    const onFechado = (e: Event) => chatsAtivos.current.delete((e as CustomEvent).detail?.demandaId)
    window.addEventListener('chat:ativo',  onAtivo)
    window.addEventListener('chat:fechado', onFechado)
    return () => {
      window.removeEventListener('chat:ativo',  onAtivo)
      window.removeEventListener('chat:fechado', onFechado)
    }
  }, [])

  useEffect(() => {
    const paraRole = getRoleFromPath(pathname, user)
    const handler  = (e: Event) => {
      const n = (e as CustomEvent).detail as Omit<Toast, 'uid'> & { para_role?: string }
      // Filtrar toast se for de role diferente do contexto atual
      if (n.para_role && paraRole && n.para_role !== paraRole) return
      // Suprimir toast se o usuário já está no chat dessa demanda
      if (n.demanda_id && chatsAtivos.current.has(n.demanda_id)) return
      const uid = Date.now() + Math.random()
      setToasts(prev => [...prev.slice(-2), { ...n, uid }])
      setTimeout(() => dismiss(uid), TOAST_DURATION)
    }
    window.addEventListener('notif:nova', handler)
    return () => window.removeEventListener('notif:nova', handler)
  }, [dismiss, pathname, user])

  if (!toasts.length || !user) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 76,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        alignItems: 'flex-end',
        pointerEvents: 'none',
      }}
    >
      {toasts.map(t => {
        const cor = CAT_COLOR[t.categoria] || 'var(--orange)'
        return (
          <div
            key={t.uid}
            onClick={() => { dismiss(t.uid); router.push(getNavUrl(t, user)) }}
            style={{
              width: 340,
              maxWidth: 'calc(100vw - 40px)',
              background: 'var(--navy2)',
              border: '1px solid var(--border2)',
              borderLeft: `4px solid ${cor}`,
              borderRadius: 14,
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
              cursor: 'pointer',
              animation: 'notif-slide-in 0.32s cubic-bezier(0.22,1,0.36,1)',
              overflow: 'hidden',
              pointerEvents: 'auto',
            }}
          >
            <div style={{ padding: '12px 12px 12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>
                {TIPO_ICON[t.tipo] || '🔔'}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  color: 'var(--text)',
                  fontWeight: 700,
                  fontSize: 12,
                  marginBottom: 3,
                  lineHeight: 1.35,
                }}>
                  {t.titulo}
                </p>
                {t.corpo && (
                  <p style={{
                    color: 'var(--text2)',
                    fontSize: 11,
                    lineHeight: 1.5,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {t.corpo}
                  </p>
                )}
                {t.demanda_id && (
                  <p style={{ color: cor, fontSize: 10, marginTop: 5, fontWeight: 700 }}>
                    Toque para ver a demanda →
                  </p>
                )}
              </div>
              <button
                onClick={e => { e.stopPropagation(); dismiss(t.uid) }}
                style={{
                  color: 'var(--text3)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 2,
                  lineHeight: 0,
                  flexShrink: 0,
                }}
              >
                <X size={13} />
              </button>
            </div>

            {/* Barra de progresso animada */}
            <div style={{ height: 3, background: 'rgba(255,255,255,0.05)' }}>
              <div
                style={{
                  height: '100%',
                  background: cor,
                  animation: `notif-progress ${TOAST_DURATION}ms linear forwards`,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
