'use client'
import { useEffect, useState, useRef } from 'react'
import { Bell, X, CheckCheck } from 'lucide-react'
import { notificacoes as notifApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

const TIPO_ICON: Record<string, string> = {
  ALERTA: '⚠️', SUCESSO: '✅', INFO: 'ℹ️', ERRO: '❌',
}
const CATEGORIA_COLOR: Record<string, string> = {
  FINANCEIRO: 'var(--green)',
  DEMANDA: 'var(--orange)',
  SEGURANCA: 'var(--red)',
  CADASTRO: 'var(--purple)',
  SISTEMA: 'var(--text3)',
}

export function NotificacaoBell() {
  const { user } = useAuth()
  const [aberto, setAberto]       = useState(false)
  const [notifs, setNotifs]       = useState<any[]>([])
  const [naoLidas, setNaoLidas]   = useState(0)
  const [loading, setLoading]     = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Fecha ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Carrega contagem inicial
  useEffect(() => {
    if (!user) return
    notifApi.listar({ nao_lida: 'true', limit: 1 } as any)
      .then(r => setNaoLidas(r.nao_lidas || 0))
      .catch(() => {})
  }, [user])

  // Polling leve a cada 60s
  useEffect(() => {
    if (!user) return
    const t = setInterval(() => {
      notifApi.listar({ nao_lida: 'true', limit: 1 } as any)
        .then(r => setNaoLidas(r.nao_lidas || 0))
        .catch(() => {})
    }, 60_000)
    return () => clearInterval(t)
  }, [user])

  const abrir = async () => {
    setAberto(v => !v)
    if (!aberto) {
      setLoading(true)
      try {
        const r = await notifApi.listar({ limit: 20 } as any)
        setNotifs(r.notificacoes || [])
        setNaoLidas(r.nao_lidas || 0)
      } catch { /* silencioso */ }
      finally { setLoading(false) }
    }
  }

  const marcarTodasLidas = async () => {
    try {
      await notifApi.marcarLidas()
      setNotifs(prev => prev.map(n => ({ ...n, lida: true })))
      setNaoLidas(0)
    } catch { /* silencioso */ }
  }

  const marcarLida = async (id: string) => {
    try {
      await (notifApi as any).marcarLida(id)
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n))
      setNaoLidas(prev => Math.max(0, prev - 1))
    } catch { /* silencioso */ }
  }

  if (!user) return null

  return (
    <div ref={ref} className="relative shrink-0">
      {/* Botão sino */}
      <button
        onClick={abrir}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
        style={{
          background: aberto ? 'rgba(232,103,26,0.15)' : 'var(--glass)',
          border: `1px solid ${aberto ? 'rgba(232,103,26,0.4)' : 'var(--border)'}`,
          color: aberto ? 'var(--orange)' : 'var(--text2)',
        }}
        title="Notificações"
      >
        <Bell size={16} strokeWidth={2} />
        {naoLidas > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ background: 'var(--orange)', padding: '0 3px' }}
          >
            {naoLidas > 99 ? '99+' : naoLidas}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {aberto && (
        <div
          className="absolute right-0 top-11 z-50 rounded-2xl shadow-2xl flex flex-col"
          style={{
            width: 360,
            maxWidth: 'calc(100vw - 24px)',
            background: 'var(--navy2)',
            border: '1px solid var(--border2)',
            maxHeight: 480,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <Bell size={14} style={{ color: 'var(--orange)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Notificações</span>
              {naoLidas > 0 && (
                <span className="badge badge-orange">{naoLidas} nova{naoLidas > 1 ? 's' : ''}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {naoLidas > 0 && (
                <button
                  onClick={marcarTodasLidas}
                  className="flex items-center gap-1 text-xs font-semibold rounded-lg px-2 py-1 transition-colors"
                  style={{ color: 'var(--orange)' }}
                  title="Marcar todas como lidas"
                >
                  <CheckCheck size={13} />
                  Marcar lidas
                </button>
              )}
              <button
                onClick={() => setAberto(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: 'var(--text3)' }}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="text-xs text-center py-8" style={{ color: 'var(--text3)' }}>Carregando...</p>
            ) : notifs.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Bell size={28} style={{ color: 'var(--text3)', margin: '0 auto' }} />
                <p className="text-xs" style={{ color: 'var(--text3)' }}>Nenhuma notificação ainda</p>
              </div>
            ) : (
              notifs.map(n => (
                <div
                  key={n.id}
                  onClick={() => !n.lida && marcarLida(n.id)}
                  className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors"
                  style={{
                    background: n.lida ? 'transparent' : 'rgba(232,103,26,0.05)',
                    borderBottom: '1px solid var(--border)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--glass)')}
                  onMouseLeave={e => (e.currentTarget.style.background = n.lida ? 'transparent' : 'rgba(232,103,26,0.05)')}
                >
                  <span className="text-base shrink-0 mt-0.5">{TIPO_ICON[n.tipo] || 'ℹ️'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold leading-snug" style={{ color: 'var(--text)' }}>{n.titulo}</p>
                      {!n.lida && (
                        <span className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ background: 'var(--orange)' }} />
                      )}
                    </div>
                    <p className="text-xs mt-0.5 leading-relaxed line-clamp-2" style={{ color: 'var(--text3)' }}>{n.corpo}</p>
                    <div className="flex items-center justify-between mt-1">
                      {n.categoria && (
                        <span className="text-2xs font-semibold uppercase tracking-wide"
                          style={{ color: CATEGORIA_COLOR[n.categoria] || 'var(--text3)', fontSize: 9 }}>
                          {n.categoria}
                        </span>
                      )}
                      <span className="text-2xs" style={{ color: 'var(--text3)', fontSize: 9 }}>
                        {new Date(n.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
