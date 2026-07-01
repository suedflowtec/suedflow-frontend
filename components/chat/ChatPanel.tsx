'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { chat as chatApi, notificacoes as notifApi } from '@/lib/api'
import { getSocket } from '@/lib/socket'
import { useToast } from '@/hooks/useToast'
import { Send, Lock, Check, CheckCheck, Clock, MessageCircle } from 'lucide-react'

// Status que permitem enviar mensagens (espelho do backend)
const STATUSES_ATIVO = new Set([
  'PAGA', 'EM_EXECUCAO', 'AGUARDANDO_QA', 'QA_REPROVADO',
  'AGUARDANDO_CONFIRMACAO', 'PARALISADA_PROF', 'PARALISADA_CLIENTE', 'DEMANDA_ESPECIAL',
])

const STATUS_MSG: Record<string, string> = {
  AGUARDANDO:            'O chat fica disponível após o pagamento.',
  ACEITA:                'O chat fica disponível após o pagamento.',
  CONCLUIDA:             'Esta demanda foi concluída. O chat está encerrado.',
  CANCELADA:             'Esta demanda foi cancelada. O chat está encerrado.',
  EM_DISPUTA:            'Esta demanda está em disputa. O chat está bloqueado.',
}

interface ChatPanelProps {
  demandaId: string
  currentUserId: string
  demandaStatus?: string
  outroNome?: string
}

export function ChatPanel({ demandaId, currentUserId, demandaStatus, outroNome }: ChatPanelProps) {
  const { toast }    = useToast()
  const bottomRef    = useRef<HTMLDivElement>(null)
  const inputRef     = useRef<HTMLInputElement>(null)

  const [mensagens, setMensagens] = useState<any[]>([])
  const [texto, setTexto]         = useState('')
  const [loading, setLoading]     = useState(true)
  const [enviando, setEnviando]   = useState(false)
  const [chatAtivo, setChatAtivo] = useState(STATUSES_ATIVO.has(demandaStatus || ''))
  const [statusDemanda, setStatusDemanda] = useState(demandaStatus || '')

  // Carregar mensagens iniciais
  useEffect(() => {
    chatApi.listar(demandaId)
      .then(r => {
        setMensagens(r.mensagens || [])
        setChatAtivo(r.chat_ativo ?? STATUSES_ATIVO.has(r.status_demanda || ''))
        setStatusDemanda(r.status_demanda || demandaStatus || '')
      })
      .catch(() => toast('Erro ao carregar conversa', 'error'))
      .finally(() => setLoading(false))
  }, [demandaId])

  // Sinalizar que o chat está ativo (suprime toast de notificação enquanto estamos aqui)
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('chat:ativo', { detail: { demandaId } }))
    // Limpar notificações de demanda persistentes (bell badge)
    notifApi.marcarLidasPorDemanda(demandaId).catch(() => {})
    return () => {
      window.dispatchEvent(new CustomEvent('chat:fechado', { detail: { demandaId } }))
    }
  }, [demandaId])

  // Socket.io — mensagens em tempo real
  useEffect(() => {
    const socket = getSocket()
    socket.emit('join_demanda', demandaId)

    const onNova = (msg: any) => {
      if (msg.demanda_id !== demandaId) return

      setMensagens(prev => {
        // Remove versão otimista equivalente
        const filtered = prev.filter(m => {
          if (!m._pending) return true
          if (m.remetente_id !== msg.remetente_id || m.conteudo !== msg.conteudo) return true
          return Math.abs(new Date(msg.created_at).getTime() - new Date(m.created_at).getTime()) > 10000
        })
        return [...filtered, msg]
      })

      // Se a mensagem é do outro, marca como lida imediatamente
      if (msg.remetente_id !== currentUserId) {
        chatApi.marcarLidas(demandaId).catch(() => {})
      }
    }

    // Read receipts: o outro leu nossas mensagens
    const onLidas = ({ demandaId: dId, lidas_por }: any) => {
      if (dId !== demandaId || lidas_por === currentUserId) return
      setMensagens(prev => prev.map(m =>
        m.remetente_id === currentUserId ? { ...m, lida: true } : m
      ))
    }

    socket.on('nova_mensagem', onNova)
    socket.on('mensagens_lidas', onLidas)
    return () => {
      socket.off('nova_mensagem', onNova)
      socket.off('mensagens_lidas', onLidas)
    }
  }, [demandaId, currentUserId])

  // Scroll automático ao receber novas mensagens
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  const enviar = useCallback(async () => {
    const conteudo = texto.trim()
    if (!conteudo || enviando || !chatAtivo) return
    setEnviando(true)
    setTexto('')
    const tempId = `_pending_${Date.now()}`

    setMensagens(prev => [...prev, {
      id: tempId,
      demanda_id:  demandaId,
      remetente_id: currentUserId,
      conteudo,
      created_at:  new Date().toISOString(),
      lida:        false,
      _pending:    true,
    }])

    try {
      await chatApi.enviar(demandaId, conteudo)
    } catch (e: any) {
      setMensagens(prev => prev.filter(m => m.id !== tempId))
      const msg = e?.message?.includes('encerrado') ? 'O chat desta demanda está encerrado.' : 'Erro ao enviar mensagem.'
      toast(msg, 'error')
      if (e?.message?.includes('encerrado') || e?.message?.includes('pagamento')) {
        setChatAtivo(false)
      }
    } finally {
      setEnviando(false)
      inputRef.current?.focus()
    }
  }, [texto, enviando, chatAtivo, demandaId, currentUserId, toast])

  // ── Render ─────────────────────────────────────────────────────

  const msgEncerrado = STATUS_MSG[statusDemanda]

  return (
    <div
      className="flex flex-col"
      style={{
        height: '65vh',
        minHeight: 360,
        background: 'var(--navy2)',
        borderRadius: 16,
        border: '1px solid var(--border2)',
        overflow: 'hidden',
      }}
    >
      {/* Header do chat */}
      <div
        className="flex items-center gap-2 px-4 py-3 shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--navy3)' }}
      >
        <MessageCircle size={15} style={{ color: 'var(--orange)' }} />
        <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>
          {outroNome ? `Chat com ${outroNome}` : 'Chat da demanda'}
        </span>
        <span
          className="text-2xs px-2 py-0.5 rounded-full font-semibold ml-auto"
          style={{
            background: chatAtivo ? 'rgba(0,214,143,0.15)' : 'rgba(255,255,255,0.06)',
            color:      chatAtivo ? 'var(--green)' : 'var(--text3)',
          }}
        >
          {chatAtivo ? '● ativo' : '● encerrado'}
        </span>
      </div>

      {/* Lista de mensagens */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3 space-y-2"
        style={{ overscrollBehavior: 'contain' }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm" style={{ color: 'var(--text3)' }}>Carregando conversa...</p>
          </div>
        ) : mensagens.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50">
            <MessageCircle size={32} style={{ color: 'var(--text3)' }} />
            <p className="text-sm" style={{ color: 'var(--text3)' }}>
              {chatAtivo ? 'Nenhuma mensagem ainda. Seja o primeiro a escrever.' : 'Nenhuma mensagem nesta conversa.'}
            </p>
          </div>
        ) : (
          mensagens.map(m => {
            const mine = m.remetente_id === currentUserId
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  style={{
                    maxWidth: '75%',
                    background: mine ? 'linear-gradient(135deg, #E8671A, #FF8A3D)' : 'var(--navy3)',
                    borderRadius: mine ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    padding: '8px 12px',
                    opacity: m._pending ? 0.65 : 1,
                  }}
                >
                  {/* Nome do outro (se não for minha mensagem) */}
                  {!mine && m.remetente?.nome && (
                    <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--orange)', marginBottom: 2 }}>
                      {m.remetente.nome.split(' ')[0]}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed" style={{ color: mine ? '#fff' : 'var(--text)' }}>
                    {m.conteudo}
                  </p>
                  {/* Timestamp + read receipt */}
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span style={{ fontSize: 9, color: mine ? 'rgba(255,255,255,0.65)' : 'var(--text3)' }}>
                      {m.created_at ? new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                    {mine && (
                      <span style={{ color: m.lida ? '#5adb9e' : 'rgba(255,255,255,0.5)', lineHeight: 0 }}>
                        {m._pending
                          ? <Clock size={10} />
                          : m.lida
                          ? <CheckCheck size={11} />
                          : <Check size={11} />
                        }
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Banner de chat encerrado */}
      {!chatAtivo && msgEncerrado && (
        <div
          className="shrink-0 flex items-center justify-center gap-2 py-2 px-4 text-xs font-semibold"
          style={{ background: 'rgba(255,255,255,0.04)', borderTop: '1px solid var(--border)', color: 'var(--text3)' }}
        >
          <Lock size={12} />
          {msgEncerrado}
        </div>
      )}

      {/* Input de mensagem */}
      {chatAtivo && (
        <div
          className="flex gap-2 px-4 py-3 shrink-0"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <input
            ref={inputRef}
            className="input flex-1"
            placeholder={enviando ? 'Enviando...' : 'Escreva uma mensagem...'}
            value={texto}
            onChange={e => setTexto(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() } }}
            disabled={enviando}
            autoComplete="off"
          />
          <button
            className="btn btn-primary"
            style={{ padding: '0 14px', minWidth: 44 }}
            onClick={enviar}
            disabled={enviando || !texto.trim()}
            title="Enviar (Enter)"
          >
            <Send size={15} />
          </button>
        </div>
      )}
    </div>
  )
}
