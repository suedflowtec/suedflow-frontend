// app/cliente/demandas/page.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { orders } from '@/lib/api'
import { formatBRL, statusLabel, formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'

export default function DemandasPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [demandas, setDemandas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'TODAS' | 'ATIVAS' | 'CONCLUIDAS'>('TODAS')

  useEffect(() => {
    orders.listarMinhas()
      .then(d => setDemandas(Array.isArray(d) ? d : []))
      .catch(() => toast('Erro ao carregar', 'error'))
      .finally(() => setLoading(false))
  }, [toast])

  const filtradas = demandas.filter(d => {
    if (filtro === 'ATIVAS')     return !['CONCLUIDA', 'CANCELADA'].includes(d.status)
    if (filtro === 'CONCLUIDAS') return d.status === 'CONCLUIDA'
    return true
  })

  return (
    <Shell>
      <Topbar title="Minhas demandas" />

      <main className="p-6 space-y-4">
        <div className="flex gap-2">
          {(['TODAS', 'ATIVAS', 'CONCLUIDAS'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-1.5 rounded text-xs font-semibold border transition-colors ${
                filtro === f ? 'bg-orange text-white border-orange' : 'bg-white text-ink-secondary border-surface-border hover:bg-surface-hover'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="card">
          {loading ? (
            <div className="px-4 py-10 text-center text-sm text-ink-muted">Carregando...</div>
          ) : filtradas.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-ink-muted mb-4">Nenhuma demanda nesta categoria</p>
              <Link href="/cliente/nova-demanda" className="btn btn-primary btn-sm">Criar demanda</Link>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Serviço</th>
                  <th>Status</th>
                  <th>Cidade</th>
                  <th>Área</th>
                  <th>Criada em</th>
                  <th className="text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map(d => {
                  const s = statusLabel(d.status)
                  return (
                    <tr key={d.id} onClick={() => router.push(`/cliente/demandas/${d.id}`)}>
                      <td className="mono">{d.numero || d.id?.slice(0,8)}</td>
                      <td className="font-medium text-navy">{d.svc_nome || d.svc_codigo}</td>
                      <td><span className={`badge badge-${s.variant === 'glass' ? 'gray' : s.variant}`}>{s.text}</span></td>
                      <td>{d.cidade}</td>
                      <td>{d.area_m2}m²</td>
                      <td>{formatDate(d.created_at || d.criado_em)}</td>
                      <td className="text-right font-mono font-semibold text-navy">{formatBRL(d.preco_cliente || d.preco_servico || 0)}</td>
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
