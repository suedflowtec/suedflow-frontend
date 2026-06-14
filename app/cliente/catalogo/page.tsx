'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { svc, sue } from '@/lib/api'
import { formatBRL } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

export default function CatalogoPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [servicos, setServicos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [sugestao, setSugestao] = useState<any>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    svc.listar()
      .then((d: any) => setServicos(Array.isArray(d) ? d : (d?.servicos || [])))
      .catch(() => toast('Erro ao carregar catálogo', 'error'))
      .finally(() => setLoading(false))
  }, [user, authLoading, router, toast])

  if (authLoading || !user) return null

  const handleBusca = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busca.trim().length < 10) {
      toast('Descreva sua necessidade com pelo menos 10 caracteres.', 'error')
      return
    }
    setBuscando(true)
    setSugestao(null)
    try {
      const resultado = await sue.buscarSvc(busca.trim())
      setSugestao(resultado)
    } catch (err: any) {
      toast(err.message || 'Busca indisponível. Escolha o serviço manualmente.', 'error')
    } finally {
      setBuscando(false)
    }
  }

  const precoDe = (s: any) => {
    if (s.tipo_preco === 'HORA') return s.preco_hora ? `${formatBRL(s.preco_hora)}/h` : '—'
    return s.piso ? formatBRL(s.piso) : '—'
  }

  return (
    <Shell>
      <Topbar title="Catálogo de serviços" subtitle="12 serviços de engenharia disponíveis na plataforma" />

      <main className="p-6 space-y-6">
        {/* Busca semântica */}
        <div className="card-accent">
          <p className="section-label">Não sabe qual serviço escolher?</p>
          <form onSubmit={handleBusca} className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Descreva o que você precisa, ex: preciso de um laudo para regularizar minha casa..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
            <button type="submit" disabled={buscando} className="btn btn-primary">
              {buscando ? 'Buscando...' : 'Buscar com SUE'}
            </button>
          </form>

          {sugestao && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              {sugestao.svc_sugerido ? (
                <div>
                  <p className="text-sm" style={{ color: 'var(--text2)' }}>
                    A SUE sugere: <span className="font-bold text-white">{sugestao.svc_nome}</span>{' '}
                    <span className="badge badge-orange">{sugestao.svc_sugerido}</span>
                  </p>
                  {sugestao.justificativa && (
                    <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>{sugestao.justificativa}</p>
                  )}
                  <button
                    className="btn btn-primary btn-sm mt-3"
                    onClick={() => router.push(`/cliente/catalogo/${sugestao.svc_sugerido}`)}
                  >
                    Ver detalhes →
                  </button>
                </div>
              ) : (
                <p className="text-sm" style={{ color: 'var(--text3)' }}>
                  Não foi possível identificar um serviço. Escolha abaixo.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Grid de SVCs */}
        {loading ? (
          <p className="text-sm py-10 text-center" style={{ color: 'var(--text3)' }}>Carregando catálogo...</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {servicos.map(s => (
              <button
                key={s.codigo}
                onClick={() => router.push(`/cliente/catalogo/${s.codigo}`)}
                className="card text-left hover:border-orange transition-colors"
                style={{ borderColor: 'var(--border)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(232,103,26,0.4)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="badge badge-gray">{s.codigo}</span>
                  <span className="badge badge-teal">SLA {s.sla_dias}d</span>
                </div>
                <p className="font-semibold text-white mb-1">{s.nome}</p>
                {s.descricao && (
                  <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text3)' }}>{s.descricao}</p>
                )}
                <p className="text-sm" style={{ color: 'var(--text2)' }}>
                  A partir de <span className="font-mono font-bold text-white">{precoDe(s)}</span>
                </p>
              </button>
            ))}
          </div>
        )}
      </main>
    </Shell>
  )
}
