// app/cliente/page.tsx — Cliente Home
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppShell, StatusBar } from '@/components/layout/AppShell'
import { BottomNav } from '@/components/layout/BottomNav'
import { Badge } from '@/components/ui/Badge'
import { orders } from '@/lib/api'
import { formatBRL, statusLabel } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

export default function ClienteHome() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [demandas, setDemandas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    orders.listarMinhas()
      .then(d => setDemandas(Array.isArray(d) ? d : []))
      .catch(() => toast('Erro ao carregar demandas', 'error'))
      .finally(() => setLoading(false))
  }, [user, authLoading, router, toast])

  if (authLoading || !user) return null

  const ativas = demandas.filter(d => !['CONCLUIDA', 'CANCELADA'].includes(d.status))
  const concluidas = demandas.filter(d => d.status === 'CONCLUIDA')

  return (
    <AppShell withBottomNav>
      <StatusBar />

      {/* Header */}
      <div className="px-5 pt-4 pb-5 flex justify-between items-center">
        <div>
          <p className="text-xs text-white/65">Bom dia 👋</p>
          <h1 className="text-2xl font-extrabold">{user.nome.split(' ')[0]}</h1>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => router.push('/cliente/notificacoes')}
            className="w-10 h-10 rounded-full flex items-center justify-center relative"
            style={{ background: 'var(--glass)', border: '1px solid var(--border)' }}
          >
            🔔
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red rounded-full" />
          </button>
          <button
            onClick={() => router.push('/cliente/sue')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-black text-white shadow-lg"
            style={{ background: 'linear-gradient(135deg, #E8671A, #FF7A2E)' }}
          >
            S
          </button>
        </div>
      </div>

      <div className="px-5">
        {/* CTA principal · Nova demanda */}
        <Link
          href="/cliente/nova-demanda"
          className="glass-card-accent block mb-4 hover:scale-[1.01] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #E8671A, #FF7A2E)' }}
            >
              ➕
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Solicitar serviço técnico</p>
              <p className="text-xs text-white/65">Laudos · Vistorias · Perícias · Avaliações</p>
            </div>
            <span className="text-orange text-xl">→</span>
          </div>
        </Link>

        {/* SUE card */}
        <Link
          href="/cliente/sue"
          className="glass-card flex items-center gap-3 mb-5 hover:scale-[1.01] transition-transform"
          style={{ borderColor: 'rgba(155,109,255,0.3)' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black text-white shrink-0" style={{ background: 'linear-gradient(135deg, #9B6DFF, #7C3AED)' }}>
            S
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">Pergunte para a SUE</p>
            <p className="text-xs text-white/65">Não sabe qual serviço precisa? A SUE indica.</p>
          </div>
          <span className="text-purple text-xl">✨</span>
        </Link>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="glass-card !p-3 text-center">
            <p className="text-xl font-black text-orange">{ativas.length}</p>
            <p className="text-[10px] text-white/65 uppercase tracking-wider">Ativas</p>
          </div>
          <div className="glass-card !p-3 text-center">
            <p className="text-xl font-black">{concluidas.length}</p>
            <p className="text-[10px] text-white/65 uppercase tracking-wider">Concluídas</p>
          </div>
          <div className="glass-card !p-3 text-center">
            <p className="text-xl font-black text-green">⭐ 4,8</p>
            <p className="text-[10px] text-white/65 uppercase tracking-wider">Avaliação</p>
          </div>
        </div>

        {/* Demandas */}
        <div className="flex justify-between items-center mb-3">
          <p className="text-[11px] uppercase tracking-wider font-bold text-white/65">
            Suas demandas
          </p>
          <Link href="/cliente/demandas" className="text-xs text-orange font-semibold">
            Ver todas →
          </Link>
        </div>

        {loading ? (
          <div className="glass-card text-center py-8 text-white/50">Carregando...</div>
        ) : demandas.length === 0 ? (
          <div className="glass-card text-center py-8">
            <div className="text-4xl mb-2 opacity-50">📋</div>
            <p className="text-sm font-semibold mb-1">Nenhuma demanda ainda</p>
            <p className="text-xs text-white/60 mb-4">Comece criando sua primeira solicitação</p>
            <Link href="/cliente/nova-demanda" className="btn-orange btn-sm inline-flex">
              Nova demanda
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {demandas.slice(0, 5).map(d => {
              const s = statusLabel(d.status)
              return (
                <Link
                  key={d.id}
                  href={`/cliente/demandas/${d.id}`}
                  className="glass-card block hover:scale-[1.01] transition-transform"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-white/50 font-mono">{d.numero || d.id?.slice(0,8)}</p>
                      <p className="text-sm font-bold truncate">{d.svc_nome || d.svc_codigo}</p>
                    </div>
                    <Badge variant={s.variant as any}>{s.text}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/60">{d.area_m2}m² · {d.cidade}</span>
                    <span className="font-bold text-orange">{formatBRL(d.preco_cliente || d.preco_servico || 0)}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </AppShell>
  )
}
