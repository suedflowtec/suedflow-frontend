// app/admin/demandas/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { admin } from '@/lib/api'
import { formatBRL, statusLabel } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'

export default function AdminDemandas() {
  const router = useRouter()
  const { toast } = useToast()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    admin.demandas()
      .then(setData)
      .catch(() => toast('Erro ao carregar', 'error'))
      .finally(() => setLoading(false))
  }, [toast])

  const lista: any[] = Array.isArray(data) ? data : (data?.demandas || [])
  const filtradas = lista.filter(d =>
    !busca || (d.numero || '').toLowerCase().includes(busca.toLowerCase()) ||
    (d.cliente?.nome || '').toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <Shell>
      <Topbar title="Todas as demandas" />

      <main className="p-6 space-y-4">
        <Input placeholder="Buscar por número ou cliente" value={busca} onChange={e => setBusca(e.target.value)} className="max-w-sm" />

        <div className="card">
          {loading ? (
            <div className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text3)' }}>Carregando...</div>
          ) : filtradas.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text3)' }}>Nenhuma demanda encontrada</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Cliente</th>
                  <th>Serviço</th>
                  <th>Profissional</th>
                  <th>Status</th>
                  <th className="text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map(d => {
                  const s = statusLabel(d.status)
                  return (
                    <tr key={d.id} onClick={() => router.push(`/admin/demandas/${d.id}`)}>
                      <td className="mono">{d.numero || d.id?.slice(0,8)}</td>
                      <td className="font-semibold text-white">{d.cliente?.nome || '—'}</td>
                      <td>{d.svc_codigo}</td>
                      <td>{d.profissional?.nome || 'Sem prof.'}</td>
                      <td><span className={`badge badge-${s.variant === 'glass' ? 'gray' : s.variant}`}>{s.text}</span></td>
                      <td className="text-right font-mono font-semibold" style={{ color: 'var(--green)' }}>{formatBRL(d.preco_cliente || 0)}</td>
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
