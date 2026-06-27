// components/chat/ChatPanel.tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import { chat } from '@/lib/api'
import { getSocket } from '@/lib/socket'
import { useToast } from '@/hooks/useToast'

interface ChatPanelProps {
  demandaId: string
  currentUserId: string
}

export function ChatPanel({ demandaId, currentUserId }: ChatPanelProps) {
  const { toast } = useToast()
  const [mensagens, setMensagens] = useState<any[]>([])
  const [texto, setTexto] = useState('')
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chat.listar(demandaId)
      .then(r => setMensagens(r.mensagens || []))
      .catch(() => toast('Erro ao carregar conversa', 'error'))
      .finally(() => setLoading(false))
  }, [demandaId, toast])

  useEffect(() => {
    const socket = getSocket()
    socket.emit('join_demanda', demandaId)

    const onNova = (msg: any) => {
      if (msg.demanda_id !== demandaId) return
      setMensagens(prev => {
        // Remove mensagem otimista equivalente (mesmo remetente + conteúdo + recente)
        const filtered = prev.filter(m => {
          if (!m._pending) return true
          if (m.remetente_id !== msg.remetente_id || m.conteudo !== msg.conteudo) return true
          return Math.abs(new Date(msg.created_at).getTime() - new Date(m.created_at).getTime()) > 10000
        })
        return [...filtered, msg]
      })
    }
    socket.on('nova_mensagem', onNova)
    return () => { socket.off('nova_mensagem', onNova) }
  }, [demandaId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  const enviar = async () => {
    const conteudo = texto.trim()
    if (!conteudo || enviando) return
    setEnviando(true)
    setTexto('')
    const tempId = `_pending_${Date.now()}`
    // Adicionar localmente antes da resposta do servidor (otimista)
    setMensagens(prev => [...prev, {
      id: tempId,
      demanda_id: demandaId,
      remetente_id: currentUserId,
      conteudo,
      created_at: new Date().toISOString(),
      _pending: true,
    }])
    try {
      await chat.enviar(demandaId, conteudo)
      // Socket.io removerá o _pending e adicionará a versão real via onNova
    } catch {
      setMensagens(prev => prev.filter(m => m.id !== tempId))
      toast('Erro ao enviar mensagem', 'error')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="card-solid flex flex-col h-[65vh]">
      <div className="flex-1 overflow-y-auto space-y-3 px-1">
        {loading ? (
          <p className="text-sm" style={{ color: 'var(--text3)' }}>Carregando conversa...</p>
        ) : mensagens.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text3)' }}>Nenhuma mensagem ainda. Envie a primeira.</p>
        ) : (
          mensagens.map(m => {
            const mine = m.remetente_id === currentUserId
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[75%] rounded-xl px-3 py-2 text-sm"
                  style={{
                    background: mine ? 'linear-gradient(135deg, #E8671A, #FF8A3D)' : 'var(--navy3)',
                    color: mine ? '#fff' : 'var(--text)',
                  }}
                >
                  <p>{m.conteudo}</p>
                  <p className="text-2xs mt-1 text-right" style={{ color: mine ? 'rgba(255,255,255,0.7)' : 'var(--text3)' }}>
                    {m.created_at ? new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 pt-3 mt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <input
          className="input flex-1"
          placeholder="Escreva uma mensagem..."
          value={texto}
          onChange={e => setTexto(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') enviar() }}
        />
        <button className="btn btn-primary" onClick={enviar} disabled={enviando || !texto.trim()}>
          Enviar
        </button>
      </div>
    </div>
  )
}
