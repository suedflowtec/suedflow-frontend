'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { sue as sueApi, orders } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { X, Send, Minimize2, Bot } from 'lucide-react'

interface Mensagem {
  role: 'user' | 'assistant'
  conteudo: string
  trigger?: string | null
}

export function SueChat() {
  const { user } = useAuth()
  const [aberto, setAberto]       = useState(false)
  const [msgs, setMsgs]           = useState<Mensagem[]>([])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [inicializado, setInicializado] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  const scrollBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  const inicializar = useCallback(async () => {
    if (inicializado || !user) return
    setInicializado(true)

    // Carrega histórico ou gera saudação
    try {
      const hist = await sueApi.historico()
      if (hist.mensagens.length > 0) {
        setMsgs(hist.mensagens.map(m => ({ role: m.role, conteudo: m.conteudo, trigger: m.trigger })))
      } else {
        // Saudação inicial contextual
        let ativas = 0
        try {
          const d = await orders.listarMinhas('cliente')
          ativas = Array.isArray(d) ? d.filter((x: any) => !['CONCLUIDA','CANCELADA'].includes(x.status)).length : 0
        } catch { /* silencioso */ }

        const saudacao = ativas > 0
          ? `Olá, ${user.nome.split(' ')[0]}! Você tem ${ativas} demanda${ativas > 1 ? 's' : ''} ativa${ativas > 1 ? 's' : ''}. Posso te ajudar com algo?`
          : `Olá, ${user.nome.split(' ')[0]}! Sou a SUE, sua assistente de engenharia. Descreva o que você precisa e eu encontro o serviço certo.`

        setMsgs([{ role: 'assistant', conteudo: saudacao }])
      }
    } catch {
      setMsgs([{ role: 'assistant', conteudo: `Olá, ${user?.nome?.split(' ')[0] || ''}! Como posso ajudar?` }])
    }
  }, [inicializado, user])

  useEffect(() => {
    if (aberto) {
      inicializar()
      scrollBottom()
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [aberto, inicializar])

  useEffect(() => {
    if (aberto) scrollBottom()
  }, [msgs, aberto])

  const enviar = async () => {
    const texto = input.trim()
    if (!texto || loading) return
    setInput('')
    setMsgs(m => [...m, { role: 'user', conteudo: texto }])
    setLoading(true)
    try {
      const res = await sueApi.chat(texto)
      setMsgs(m => [...m, { role: 'assistant', conteudo: res.resposta, trigger: res.trigger }])
    } catch (e: any) {
      setMsgs(m => [...m, { role: 'assistant', conteudo: 'Estou com instabilidade no momento. Tente novamente em instantes.' }])
    } finally {
      setLoading(false)
    }
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() }
  }

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setAberto(v => !v)}
        className="fixed bottom-6 right-6 z-[200] w-13 h-13 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-200"
        style={{
          width: 52, height: 52,
          background: aberto ? 'var(--navy2)' : 'linear-gradient(135deg, var(--orange), var(--orange2))',
          border: '2px solid rgba(255,255,255,0.12)',
          boxShadow: aberto ? '0 4px 20px rgba(0,0,0,0.3)' : '0 8px 28px rgba(232,103,26,0.45)',
        }}
        title="SUE — Assistente de Engenharia"
      >
        {aberto
          ? <Minimize2 size={20} color="var(--text2)" />
          : <Bot size={22} color="white" />
        }
      </button>

      {/* Drawer */}
      {aberto && (
        <div
          className="fixed bottom-[72px] right-6 z-[199] flex flex-col rounded-2xl overflow-hidden"
          style={{
            width: 340,
            height: 480,
            background: 'var(--navy2)',
            border: '1px solid var(--border2)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)', background: 'rgba(232,103,26,0.06)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, var(--orange), var(--orange2))' }}>
              <Bot size={16} color="white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>SUE</p>
              <p className="text-xs" style={{ color: 'var(--text3)' }}>Suedflow Unified Engine · Online</p>
            </div>
            <button onClick={() => setAberto(false)} style={{ color: 'var(--text3)' }}>
              <X size={16} />
            </button>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mr-2 mt-1" style={{ background: 'linear-gradient(135deg, var(--orange), var(--orange2))' }}>
                    <Bot size={12} color="white" />
                  </div>
                )}
                <div
                  className="max-w-[80%] px-3 py-2.5 rounded-xl text-sm leading-relaxed"
                  style={m.role === 'user'
                    ? { background: 'linear-gradient(135deg, var(--orange), var(--orange2))', color: '#fff', borderBottomRightRadius: 4 }
                    : {
                        background: 'var(--glass)',
                        border: `1px solid ${m.trigger === 'ALERT' ? 'rgba(255,77,109,0.3)' : m.trigger === 'REVEAL' ? 'rgba(245,166,35,0.3)' : 'var(--border)'}`,
                        color: 'var(--text)',
                        borderBottomLeftRadius: 4,
                      }
                  }
                >
                  {m.conteudo}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mr-2 mt-1" style={{ background: 'linear-gradient(135deg, var(--orange), var(--orange2))' }}>
                  <Bot size={12} color="white" />
                </div>
                <div className="px-3 py-2.5 rounded-xl text-sm" style={{ background: 'var(--glass)', border: '1px solid var(--border)', color: 'var(--text3)' }}>
                  <span className="animate-pulse">digitando…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Aviso legal */}
          <div className="px-3 py-1.5 shrink-0 text-center" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-[10px]" style={{ color: 'var(--text3)' }}>SUE monitora este chat. Comunicações fora da plataforma violam SUED-TU-001.</p>
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-2 flex gap-2 shrink-0">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Digite sua necessidade…"
              disabled={loading}
              className="input flex-1 text-sm"
              style={{ padding: '8px 12px', borderRadius: 12 }}
            />
            <button
              onClick={enviar}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-opacity disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, var(--orange), var(--orange2))' }}
            >
              <Send size={15} color="white" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
