'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { orders } from '@/lib/api'
import { formatBRL, statusLabel } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

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
  const [demandas, setDemandas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<Filtro>('TODAS')

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    orders.listarMinhas()
      .then((d: any) => setDemandas(Array.isArray(d) ? d : (d?.demandas || [])))
      .catch(() => toast('Erro ao carregar demandas', 'error'))
      .finally(() => setLoading(false))
  }, [user, authLoading, router, toast])

  if (authLoading || !user) return null

  const filtradas = demandas.filter(d => {
    if (filtro === 'TODAS') return true
    if (filtro === 'CONCLUIDAS') return d.status === 'CONCLUIDA'
    return !['CONCLUIDA', 'CANCELADA'].includes(d.status)
  })

  return (
    <Shell>
      <Topbar title="Minhas demandas" subtitle="Acompanhe a execução das suas ordens de serviço" />

      <main className="p-6 space-y-4">
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
              </tr></thead>
              <tbody>
                {filtradas.map(d => (
                  <tr key={d.id} onClick={() => router.push(`/profissional/demandas/${d.id}`)}>
                    <td className="mono">{d.numero || d.id?.slice(0, 8)}</td>
                    <td className="bold">{d.svc_nome || d.svc_codigo}</td>
                    <td><span className={STATUS_BADGE[d.status] || 'badge badge-gray'}>{statusLabel(d.status).text}</span></td>
                    <td style={{ color: 'var(--text3)' }}>
                      {d.prazo_entrega ? new Date(d.prazo_entrega).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="text-right font-mono font-bold" style={{ color: 'var(--green)' }}>
                      {formatBRL(d.liquido_profissional || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </Shell>
  )
}
