'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { orders } from '@/lib/api'
import { formatBRL, statusLabel } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { Search, X, MessageCircle } from 'lucide-react'
import { chat as chatApi } from '@/lib/api'

const STATUS_BADGE: Record<string, string> = {
  AGUARDANDO: 'badge badge-yellow', PAGA: 'badge badge-blue',
  ACEITA: 'badge badge-indigo', EM_EXECUCAO: 'badge badge-purple',
  AGUARDANDO_QA: 'badge badge-orange', QA_REPROVADO: 'badge badge-red',
  AGUARDANDO_CONFIRMACAO: 'badge badge-teal', CONCLUIDA: 'badge badge-green',
  CANCELADA: 'badge badge-gray', EM_DISPUTA: 'badge badge-red',
}

const FILTROS = [
  { key: 'TODAS', label: 'Todas' },
  { key: 'EM_ANDAMENTO', label: 'Em andamento' },
  { key: 'CONCLUIDAS', label: 'Concluídas' },
] as const

type Filtro = typeof FILTROS[number]['key']

export default function ProfissionalDemandasPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [demandas, setDemandas]   = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [filtro, setFiltro]       = useState<Filtro>('TODAS')
  const [busca, setBusca]         = useState('')
  const [naoLidas, setNaoLidas]   = useState<Record<string, number>>({})

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    Promise.all([
      orders.listarMinhas('profissional'),
      chatApi.naoLidas().catch(() => ({ nao_lidas: {} })),
    ])
      .then(([d, nl]: [any, any]) => {
        setDemandas(Array.isArray(d) ? d : (d?.demandas || []))
        setNaoLidas(nl.nao_lidas || {})
      })
      .catch(() => toast('Erro ao carregar demandas', 'error'))
      .finally(() => setLoading(false))
  }, [user, authLoading, router, toast])

  if (authLoading || !user) return null

  const filtradas = demandas.filter(d => {
    if (filtro === 'CONCLUIDAS' && d.status !== 'CONCLUIDA') return false
    if (filtro === 'EM_ANDAMENTO' && ['CONCLUIDA', 'CANCELADA'].includes(d.status)) return false
    if (busca) {
      const q = busca.toLowerCase()
      const campos = [d.numero, d.servico?.nome, d.svc_codigo, d.cidade, d.estado]
      if (!campos.some(c => c?.toLowerCase().includes(q))) return false
    }
    return true
  })

  return (
    <Shell>
      <Topbar title="Minhas demandas" subtitle="Acompanhe a execução das suas ordens de serviço" />

      <main className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text3)' }} />
            <input
              className="input pl-9"
              placeholder="Buscar por OS, serviço, cidade..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
            {busca && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text3)' }} onClick={() => setBusca('')}>
                <X size={13} />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {FILTROS.map(f => (
              <button
                key={f.key}
                onClick={() => setFiltro(f.key)}
                className={filtro === f.key ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="card-solid">
          {loading ? (
            <p className="text-sm py-10 text-center" style={{ color: 'var(--text3)' }}>Carregando...</p>
          ) : filtradas.length === 0 ? (
            <p className="text-sm py-10 text-center" style={{ color: 'var(--text3)' }}>Nenhuma demanda encontrada.</p>
          ) : (
            <table className="data-table">
              <thead><tr>
                <th>OS</th><th>Serviço</th><th>Status</th><th>Prazo</th>
                <th className="text-right">Valor líquido</th>
                <th></th>
              </tr></thead>
              <tbody>
                {filtradas.map(d => {
                  const msgs = naoLidas[d.id] || 0
                  return (
                    <tr key={d.id} onClick={() => router.push(`/profissional/demandas/${d.id}`)}>
                      <td className="mono">{d.numero || d.id?.slice(0, 8)}</td>
                      <td className="bold">{d.servico?.nome || d.svc_codigo}</td>
                      <td><span className={STATUS_BADGE[d.status] || 'badge badge-gray'}>{statusLabel(d.status).text}</span></td>
                      <td style={{ color: 'var(--text3)' }}>
                        {d.prazo_entrega ? new Date(d.prazo_entrega).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td className="text-right font-mono font-bold" style={{ color: 'var(--green)' }}>
                        {formatBRL(d.liquido_profissional || 0)}
                      </td>
                      <td>
                        <button
                          onClick={e => { e.stopPropagation(); router.push(`/profissional/demandas/${d.id}/chat`) }}
                          className="relative flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                          style={{
                            background: msgs > 0 ? 'rgba(232,103,26,0.15)' : 'var(--glass)',
                            color: msgs > 0 ? 'var(--orange)' : 'var(--text3)',
                            border: `1px solid ${msgs > 0 ? 'rgba(232,103,26,0.35)' : 'var(--border)'}`,
                          }}
                          title={msgs > 0 ? `${msgs} mensagem${msgs > 1 ? 's' : ''} não lida${msgs > 1 ? 's' : ''}` : 'Chat'}
                        >
                          <MessageCircle size={13} />
                          {msgs > 0 && (
                            <span
                              className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center rounded-full text-white font-black"
                              style={{ background: 'var(--orange)', fontSize: 9, padding: '0 3px', boxShadow: '0 0 6px rgba(232,103,26,0.5)' }}
                            >
                              {msgs > 9 ? '9+' : msgs}
                            </span>
                          )}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </Shell>
  )
}
