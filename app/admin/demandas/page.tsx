// app/admin/demandas/page.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppShell, StatusBar } from '@/components/layout/AppShell'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { admin } from '@/lib/api'
import { formatBRL, statusLabel, formatDate } from '@/lib/utils'
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
    <AppShell>
      <StatusBar />
      <div className="px-5 pt-4 pb-12">
        <button onClick={() => router.back()} className="back-btn mb-3">←</button>
        <h1 className="text-xl font-extrabold mb-3">Todas as demandas</h1>

        <Input placeholder="🔍 Buscar por número ou cliente" value={busca} onChange={e => setBusca(e.target.value)} className="mb-4" />

        {loading ? (
          <div className="text-center py-8 text-white/50">Carregando...</div>
        ) : filtradas.length === 0 ? (
          <p className="text-center text-white/50 py-8">Nenhuma demanda encontrada</p>
        ) : (
          <div className="space-y-2">
            {filtradas.map(d => {
              const s = statusLabel(d.status)
              return (
                <Link key={d.id} href={`/admin/demandas/${d.id}`} className="glass-card block hover:scale-[1.01] transition-transform">
                  <div className="flex justify-between items-start mb-1">
                    <div className="min-w-0">
                      <p className="text-[10px] font-mono text-white/50">{d.numero || d.id?.slice(0,8)}</p>
                      <p className="text-sm font-bold truncate">{d.cliente?.nome || '—'}</p>
                    </div>
                    <Badge variant={s.variant as any}>{s.text}</Badge>
                  </div>
                  <div className="flex justify-between text-xs text-white/60">
                    <span>{d.svc_codigo} · {d.profissional?.nome || 'Sem prof.'}</span>
                    <span className="font-bold text-orange">{formatBRL(d.preco_cliente || 0)}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
