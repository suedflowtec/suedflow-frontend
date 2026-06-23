// app/cliente/catalogo/[codigo]/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { Button } from '@/components/ui/Button'
import { svc } from '@/lib/api'
import { formatBRL } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

const SECOES = [
  { campo: 'para_quem',   icone: '👤', titulo: 'Para quem é este serviço' },
  { campo: 'voce_precisa',icone: '📋', titulo: 'O que você precisa ter antes de contratar' },
  { campo: 'entregaveis', icone: '📦', titulo: 'O que você vai receber' },
  { campo: 'nao_inclui',  icone: '🚫', titulo: 'Não está incluído neste serviço' },
] as const

export default function SvcDetalhePage() {
  const router = useRouter()
  const params = useParams()
  const codigo = String(params?.codigo || '')
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [servico, setServico] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    svc.buscar(codigo)
      .then(setServico)
      .catch(() => toast('Serviço não encontrado', 'error'))
      .finally(() => setLoading(false))
  }, [user, authLoading, codigo, router, toast])

  if (authLoading || !user) return null

  const precoDe = (s: any) => {
    if (s.tipo_preco === 'HORA') return s.preco_hora ? `${formatBRL(s.preco_hora)}/h` : '—'
    return s.piso ? formatBRL(s.piso) : '—'
  }

  return (
    <Shell>
      <Topbar title={servico?.nome || codigo} subtitle="Detalhes do serviço" />

      <main className="p-6 max-w-3xl space-y-4 pb-24">
        <button
          className="text-sm"
          style={{ color: 'var(--text3)' }}
          onClick={() => router.push('/cliente/catalogo')}
        >
          ← Voltar ao catálogo
        </button>

        {loading ? (
          <p className="text-sm py-10 text-center" style={{ color: 'var(--text3)' }}>Carregando...</p>
        ) : !servico ? (
          <div className="card-accent text-center py-10">
            <p className="text-sm" style={{ color: 'var(--text2)' }}>Serviço não encontrado.</p>
          </div>
        ) : (
          <>
            {/* Cabeçalho */}
            <div className="card-solid">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{servico.icone || '🔧'}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge badge-gray">{servico.codigo}</span>
                    <span className="badge badge-teal">SLA {servico.sla_dias}d</span>
                    {servico.requer_art && <span className="badge badge-orange">ART: {formatBRL(servico.art_fee || 0)}</span>}
                  </div>
                  <h2 className="text-xl font-bold text-white">{servico.nome}</h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
                    A partir de <span className="font-mono font-bold text-white">{precoDe(servico)}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* O que é */}
            {servico.o_que_e && (
              <div className="card">
                <p className="section-label">O que é</p>
                <p className="text-sm" style={{ color: 'var(--text2)' }}>{servico.o_que_e}</p>
              </div>
            )}

            {/* Seções dinâmicas */}
            {SECOES.map(secao => {
              const itens = servico[secao.campo] as string[] | null
              if (!itens || itens.length === 0) return null
              return (
                <div key={secao.campo} className="card">
                  <p className="section-label">{secao.icone} {secao.titulo}</p>
                  <ul className="space-y-1">
                    {itens.map((item, i) => (
                      <li key={i} className="text-sm flex gap-2" style={{ color: 'var(--text2)' }}>
                        <span style={{ color: 'var(--text3)' }}>•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}

            {/* Disclaimer ART/escrow */}
            <div className="card-accent">
              <p className="text-xs" style={{ color: 'var(--text3)' }}>
                ⚖️ A responsabilidade técnica (ART/RRT) é do profissional que executar o
                serviço. O pagamento fica retido em escrow na SUEDFLOW e só é liberado ao
                profissional após a confirmação da entrega pelo cliente.
              </p>
            </div>

            {/* Ação */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => router.push('/cliente/catalogo')}>
                Voltar
              </Button>
              <Button onClick={() => router.push(`/cliente/nova-demanda?svc=${servico.codigo}`)}>
                Contratar →
              </Button>
            </div>
          </>
        )}
      </main>
    </Shell>
  )
}
