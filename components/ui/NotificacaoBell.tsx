'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, X, CheckCheck, Volume2, VolumeX, ExternalLink } from 'lucide-react'
import { notificacoes as notifApi } from '@/lib/api'
import { getSocket } from '@/lib/socket'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

// ── Constantes visuais ─────────────────────────────────────────

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
const CAT_LABEL: Record<string, string> = {
  FINANCEIRO: 'Financeiro',
  DEMANDA:    'Demanda',
  SEGURANCA:  'Segurança',
  CADASTRO:   'Cadastro',
  SISTEMA:    'Sistema',
}

// ── Utilitários ────────────────────────────────────────────────

function getRolePrefix(user: any): string {
  if (user?.profissional)                                        return 'profissional'
  if (user?.role === 'CLIENTE' || user?.cliente)                 return 'cliente'
  if (['CURADOR_SUPORTE', 'CURADOR_SENIOR'].includes(user?.role)) return 'curador'
  if (['ADMIN', 'MODERADOR'].includes(user?.role))               return 'admin'
  return 'profissional'
}

function getNavUrl(n: any, user: any): string {
  const role = getRolePrefix(user)
  if (n.demanda_id) return `/${role}/demandas/${n.demanda_id}`
  switch (n.categoria) {
    case 'FINANCEIRO': return `/${role}/financeiro`
    case 'CADASTRO':   return role === 'profissional' ? '/profissional/perfil' : '/cliente/perfil'
    default:           return '/notificacoes'
  }
}

function formatDate(dt: string): string {
  return new Date(dt).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

// Lê/grava preferência de som no localStorage (seguro para SSR)
function getSoundPref(): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem('suedflow_notif_sound') !== 'false'
}
function setSoundPref(on: boolean) {
  localStorage.setItem('suedflow_notif_sound', on ? 'true' : 'false')
}

// Tom de notificação: acorde ascendente C6-E6-G6 (suave, 3 notas)
function playNotifSound() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx() as AudioContext
    const t   = ctx.currentTime

    const note = (freq: number, delay: number, dur: number, vol: number) => {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, t + delay)
      gain.gain.setValueAtTime(vol, t + delay)
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + dur)
      osc.start(t + delay)
      osc.stop(t + delay + dur)
    }

    note(1047, 0,    0.30, 0.18)  // C6
    note(1319, 0.10, 0.35, 0.14)  // E6
    note(1568, 0.19, 0.45, 0.12)  // G6

    setTimeout(() => ctx.close(), 1500)
  } catch { /* sem AudioContext no browser */ }
}

// ── Componente ─────────────────────────────────────────────────

export function NotificacaoBell() {
  const { user }   = useAuth()
  const router     = useRouter()
  const ref        = useRef<HTMLDivElement>(null)
  const bellRef    = useRef<HTMLSpanElement>(null)

  const [aberto, setAberto]       = useState(false)
  const [notifs, setNotifs]       = useState<any[]>([])
  const [naoLidas, setNaoLidas]   = useState(0)
  const [loading, setLoading]     = useState(false)
  const [soundOn, setSoundOn]     = useState(getSoundPref)
  const soundOnRef                = useRef(soundOn)
  soundOnRef.current              = soundOn

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

  // Polling (fallback para quando socket não está conectado)
  useEffect(() => {
    if (!user) return
    const t = setInterval(() => {
      notifApi.listar({ nao_lida: 'true', limit: 1 } as any)
        .then(r => setNaoLidas(r.nao_lidas || 0))
        .catch(() => {})
    }, 30_000)
    return () => clearInterval(t)
  }, [user])

  // Socket.io — notificações em tempo real
  // Dependência em user?.id (não no objeto inteiro) para recriar listener
  // quando muda de conta, mesmo que o objeto user seja recriado com outro id
  useEffect(() => {
    if (!user?.id) return
    const socket = getSocket()

    const handler = (n: any) => {
      // Atualiza badge
      setNaoLidas(prev => prev + 1)
      // Adiciona ao topo da lista se dropdown estiver aberto
      setNotifs(prev => [{ ...n, lida: false }, ...prev])

      // Som
      if (soundOnRef.current) playNotifSound()

      // Animação no sino
      if (bellRef.current) {
        bellRef.current.classList.remove('bell-shaking')
        void bellRef.current.offsetWidth // reflow para reiniciar animação
        bellRef.current.classList.add('bell-shaking')
        setTimeout(() => bellRef.current?.classList.remove('bell-shaking'), 700)
      }

      // Dispara evento para o NotifToastStack mostrar popup
      window.dispatchEvent(new CustomEvent('notif:nova', { detail: n }))
    }

    socket.on('notificacao', handler)
    return () => { socket.off('notificacao', handler) }
  }, [user?.id])

  const toggleSound = () => {
    setSoundOn(prev => { setSoundPref(!prev); return !prev })
  }

  const abrir = useCallback(async () => {
    const novoEstado = !aberto
    setAberto(novoEstado)
    if (novoEstado) {
      setLoading(true)
      try {
        const r = await notifApi.listar({ limit: 30 } as any)
        setNotifs(r.notificacoes || [])
        setNaoLidas(r.nao_lidas || 0)
      } catch { /* silencioso */ }
      finally { setLoading(false) }
    }
  }, [aberto])

  const marcarTodasLidas = async () => {
    try {
      await notifApi.marcarLidas()
      setNotifs(prev => prev.map(n => ({ ...n, lida: true })))
      setNaoLidas(0)
    } catch { /* silencioso */ }
  }

  const clicarNotif = async (n: any) => {
    // Marca como lida
    if (!n.lida) {
      notifApi.marcarLida(n.id).catch(() => {})
      setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, lida: true } : x))
      setNaoLidas(prev => Math.max(0, prev - 1))
    }
    // Navega
    const url = getNavUrl(n, user)
    setAberto(false)
    router.push(url)
  }

  if (!user) return null

  return (
    <div ref={ref} className="relative shrink-0">

      {/* Botão sino */}
      <button
        onClick={abrir}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all"
        style={{
          background: aberto ? 'rgba(232,103,26,0.15)' : 'var(--glass)',
          border:     `1px solid ${aberto ? 'rgba(232,103,26,0.45)' : 'var(--border)'}`,
          color:      aberto ? 'var(--orange)' : 'var(--text2)',
          boxShadow:  aberto ? '0 0 12px rgba(232,103,26,0.2)' : 'none',
        }}
        title="Notificações"
      >
        <span ref={bellRef} style={{ display: 'flex', lineHeight: 0 }}>
          <Bell size={16} strokeWidth={2} />
        </span>

        {naoLidas > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-black text-white"
            style={{
              background: 'var(--orange)',
              padding: '0 3px',
              boxShadow: '0 0 8px rgba(232,103,26,0.6)',
              letterSpacing: 0,
            }}
          >
            {naoLidas > 99 ? '99+' : naoLidas}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {aberto && (
        <div
          className="absolute right-0 top-12 z-50 flex flex-col rounded-2xl shadow-2xl"
          style={{
            width: 380,
            maxWidth: 'calc(100vw - 24px)',
            maxHeight: 540,
            background: 'var(--navy2)',
            border: '1px solid var(--border2)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        >

          {/* Cabeçalho */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <Bell size={14} style={{ color: 'var(--orange)' }} />
              <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>Notificações</span>
              {naoLidas > 0 && (
                <span className="badge badge-orange">{naoLidas} nova{naoLidas !== 1 ? 's' : ''}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {/* Toggle de som */}
              <button
                onClick={toggleSound}
                className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: soundOn ? 'var(--orange)' : 'var(--text3)' }}
                title={soundOn ? 'Desativar som' : 'Ativar som'}
              >
                {soundOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
              </button>
              {/* Marcar todas como lidas */}
              {naoLidas > 0 && (
                <button
                  onClick={marcarTodasLidas}
                  className="flex items-center gap-1 text-xs font-semibold rounded-lg px-2 py-1 transition-colors"
                  style={{ color: 'var(--orange)' }}
                  title="Marcar todas como lidas"
                >
                  <CheckCheck size={13} />
                  Lidas
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
          <div className="flex-1 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
            {loading ? (
              <p className="text-xs text-center py-8" style={{ color: 'var(--text3)' }}>Carregando...</p>
            ) : notifs.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Bell size={28} style={{ color: 'var(--text3)', margin: '0 auto', opacity: 0.4 }} />
                <p className="text-xs" style={{ color: 'var(--text3)' }}>Nenhuma notificação ainda</p>
              </div>
            ) : (
              notifs.map(n => {
                const cor = CAT_COLOR[n.categoria] || 'var(--text3)'
                return (
                  <div
                    key={n.id}
                    onClick={() => clicarNotif(n)}
                    className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors group"
                    style={{
                      background: n.lida ? 'transparent' : `${cor}0d`,
                      borderBottom: '1px solid var(--border)',
                      borderLeft: n.lida ? '3px solid transparent' : `3px solid ${cor}`,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--glass)')}
                    onMouseLeave={e => (e.currentTarget.style.background = n.lida ? 'transparent' : `${cor}0d`)}
                  >
                    {/* Ícone */}
                    <span className="text-lg shrink-0 mt-0.5 leading-none">
                      {TIPO_ICON[n.tipo] || '🔔'}
                    </span>

                    <div className="flex-1 min-w-0">
                      {/* Título + badge não-lida */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-xs font-bold leading-snug" style={{ color: 'var(--text)' }}>
                          {n.titulo}
                        </p>
                        {!n.lida && (
                          <span className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ background: cor }} />
                        )}
                      </div>

                      {/* Corpo — sem truncamento, texto completo */}
                      {n.corpo && (
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>
                          {n.corpo}
                        </p>
                      )}

                      {/* Rodapé: categoria + data + link de ação */}
                      <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          {n.categoria && (
                            <span
                              className="text-2xs font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                              style={{ color: cor, background: `${cor}20`, fontSize: 9 }}
                            >
                              {CAT_LABEL[n.categoria] || n.categoria}
                            </span>
                          )}
                          <span className="text-2xs" style={{ color: 'var(--text3)', fontSize: 9 }}>
                            {formatDate(n.created_at)}
                          </span>
                        </div>
                        {n.demanda_id && (
                          <span
                            className="flex items-center gap-1 text-2xs font-bold"
                            style={{ color: cor, fontSize: 10 }}
                          >
                            Ver demanda <ExternalLink size={9} />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Rodapé — link para página completa */}
          <div
            className="shrink-0 px-4 py-2.5"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <Link
              href="/notificacoes"
              onClick={() => setAberto(false)}
              className="flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors"
              style={{ color: 'var(--orange)' }}
            >
              Ver todas as notificações <ExternalLink size={11} />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
