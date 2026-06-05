// app/cliente/demandas/page.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppShell, StatusBar } from '@/components/layout/AppShell'
import { BottomNav } from '@/components/layout/BottomNav'
import { Badge } from '@/components/ui/Badge'
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
    <AppShell withBottomNav>
      <StatusBar />
      <div className="px-5 pt-4 pb-4">
        <button onClick={() => router.back()} className="back-btn mb-3">←</button>
        <h1 className="text-2xl font-extrabold mb-3">Minhas demandas</h1>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {(['TODAS', 'ATIVAS', 'CONCLUIDAS'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className="px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all"
              style={filtro === f
                ? { background: 'linear-gradient(135deg, #E8671A, #FF7A2E)', color: 'white' }
                : { background: 'var(--glass)', border: '1px solid var(--border)', color: 'var(--text2)' }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-2">
        {loading ? (
          <div className="text-center py-8 text-white/50">Carregando...</div>
        ) : filtradas.length === 0 ? (
          <div className="glass-card text-center py-10">
            <div className="text-4xl mb-2 opacity-50">📋</div>
            <p className="text-sm font-bold">Nenhuma demanda nesta categoria</p>
            <Link href="/cliente/nova-demanda" className="btn-orange btn-sm inline-flex mt-4">Criar demanda</Link>
          </div>
        ) : (
          filtradas.map(d => {
            const s = statusLabel(d.status)
            return (
              <Link key={d.id} href={`/cliente/demandas/${d.id}`} className="glass-card block hover:scale-[1.01] transition-transform">
                <div className="flex justify-between items-start mb-2">
                  <div className="min-w-0">
                    <p className="text-[10px] text-white/50 font-mono">{d.numero || d.id?.slice(0,8)}</p>
                    <p className="text-sm font-bold truncate">{d.svc_nome || d.svc_codigo}</p>
                  </div>
                  <Badge variant={s.variant as any}>{s.text}</Badge>
                </div>
                <div className="flex justify-between text-xs text-white/60">
                  <span>{d.cidade} · {d.area_m2}m²</span>
                  <span className="font-bold text-orange">{formatBRL(d.preco_cliente || d.preco_servico || 0)}</span>
                </div>
                <p className="text-[10px] text-white/45 mt-1">{formatDate(d.created_at || d.criado_em)}</p>
              </Link>
            )
          })
        )}
      </div>

      <BottomNav />
    </AppShell>
  )
}
