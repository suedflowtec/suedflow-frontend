'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { suePublica } from '@/lib/api'
import { X, Send, Minimize2 } from 'lucide-react'

function SueIcon({ size = 22, color = 'white', withLabel = false }: { size?: number; color?: string; withLabel?: boolean }) {
  return (
    <span
      aria-hidden="true"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, userSelect: 'none' }}
    >
      <span style={{ fontSize: size * 0.95, fontWeight: 900, color, letterSpacing: -0.5, lineHeight: 1 }}>S</span>
      {withLabel && <span style={{ fontSize: 8, fontWeight: 800, color, letterSpacing: 1.5, lineHeight: 1, opacity: 0.9 }}>SUE</span>}
    </span>
  )
}

interface Msg {
  role: 'user' | 'assistant'
  content: string
}

const SUGESTOES = [
  'O que é a SUEDFLOW?',
  'Preciso de um laudo para financiamento',
  'Sou engenheiro, como me cadastro?',
  'Tenho fissuras na parede, o que faço?',
]

export function SueChatPublica() {
  const [aberto, setAberto] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCta, setShowCta] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  const scroll = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)

  useEffect(() => {
    if (aberto) {
      if (msgs.length === 0) {
        setMsgs([{
          role: 'assistant',
          content: 'Pode descrever o que precisa para o seu imóvel — vistoria, laudo, projeto ou qualquer dúvida técnica. Identifico o serviço certo.',
        }])
      }
      scroll()
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [aberto])

  useEffect(() => { if (aberto) scroll() }, [msgs, aberto])

  const enviar = async (texto?: string) => {
    const msg = (texto ?? input).trim()
    if (!msg || loading) return
    setInput('')
    const novasMsgs: Msg[] = [...msgs, { role: 'user', content: msg }]
    setMsgs(novasMsgs)
    setLoading(true)

    const historico = novasMsgs
      .slice(-10)
      .map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await suePublica.chat(msg, historico.slice(0, -1))
      setMsgs(m => [...m, { role: 'assistant', content: res.resposta }])
      // Mostra CTA depois da 2ª resposta da SUE
      if (novasMsgs.filter(x => x.role === 'user').length >= 2) setShowCta(true)
    } catch {
      setMsgs(m => [...m, { role: 'assistant', content: 'Estou com instabilidade. Tente novamente em instantes.' }])
    } finally {
      setLoading(false)
    }
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() }
  }

  const userCount = msgs.filter(m => m.role === 'user').length

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setAberto(v => !v)}
        className="fixed bottom-6 right-4 z-[100] rounded-2xl flex flex-col items-center justify-center shadow-xl transition-all duration-200"
        style={{
          width: 52,
          height: aberto ? 52 : 60,
          background: aberto
            ? '#0F2030'
            : 'linear-gradient(135deg, #E8671A, #FF8A3D)',
          border: '2px solid rgba(255,255,255,0.12)',
          boxShadow: aberto
            ? '0 4px 20px rgba(0,0,0,0.4)'
            : '0 8px 28px rgba(232,103,26,0.45)',
        }}
        title="SUE — Tire dúvidas sobre a SUEDFLOW"
        aria-label="Abrir chat da SUE"
      >
        {aberto
          ? <Minimize2 size={20} color="rgba(255,255,255,0.7)" />
          : <SueIcon size={20} withLabel />
        }
      </button>

      {/* Drawer */}
      {aberto && (
        <div
          className="fixed bottom-[76px] right-4 z-[99] flex flex-col rounded-2xl overflow-hidden"
          style={{
            width: 340,
            maxWidth: 'calc(100vw - 32px)',
            height: 500,
            background: '#0F2030',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(232,103,26,0.06)' }}
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #E8671A, #FF8A3D)' }}>
              <SueIcon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">SUE</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Suedflow Unified Engine · Online</p>
            </div>
            <button onClick={() => setAberto(false)} style={{ color: 'rgba(255,255,255,0.4)' }}>
              <X size={16} />
            </button>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mr-2 mt-1"
                    style={{ background: 'linear-gradient(135deg, #E8671A, #FF8A3D)' }}>
                    <SueIcon size={12} />
                  </div>
                )}
                <div
                  className="max-w-[80%] px-3 py-2.5 rounded-xl text-sm leading-relaxed"
                  style={m.role === 'user'
                    ? { background: 'linear-gradient(135deg, #E8671A, #FF8A3D)', color: '#fff', borderBottomRightRadius: 4 }
                    : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)', borderBottomLeftRadius: 4 }
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mr-2 mt-1"
                  style={{ background: 'linear-gradient(135deg, #E8671A, #FF8A3D)' }}>
                  <SueIcon size={12} />
                </div>
                <div className="px-3 py-2.5 rounded-xl text-sm"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}>
                  <span className="animate-pulse">digitando…</span>
                </div>
              </div>
            )}

            {/* Sugestões iniciais */}
            {userCount === 0 && !loading && (
              <div className="space-y-1 pt-1">
                {SUGESTOES.map(s => (
                  <button
                    key={s}
                    onClick={() => enviar(s)}
                    className="w-full text-left text-xs px-3 py-2 rounded-lg transition-colors"
                    style={{
                      background: 'rgba(232,103,26,0.08)',
                      border: '1px solid rgba(232,103,26,0.2)',
                      color: 'rgba(255,255,255,0.7)',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* CTA após 2 interações */}
            {showCta && !loading && (
              <div className="pt-1 space-y-2">
                <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Pronto para criar sua demanda?
                </p>
                <div className="flex gap-2">
                  <Link
                    href="/auth/cadastro?tipo=CLIENTE"
                    className="flex-1 text-center text-xs font-semibold py-2 rounded-lg"
                    style={{ background: 'linear-gradient(135deg, #E8671A, #FF8A3D)', color: '#fff' }}
                  >
                    Criar conta grátis
                  </Link>
                  <Link
                    href="/auth/login"
                    className="flex-1 text-center text-xs font-semibold py-2 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
                  >
                    Já tenho conta
                  </Link>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-2 flex gap-2 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="O que você precisa para o seu imóvel?"
              disabled={loading}
              className="flex-1 text-sm rounded-xl px-3 py-2 outline-none"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.9)',
              }}
            />
            <button
              onClick={() => enviar()}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-opacity disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #E8671A, #FF8A3D)' }}
            >
              <Send size={15} color="white" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
