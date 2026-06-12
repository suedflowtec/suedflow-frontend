'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { useAuth } from '@/hooks/useAuth'

const TIER_COLOR: Record<string, string> = {
  CANDIDATO: 'var(--text3)', JUNIOR: 'var(--blue)',
  PLENO: 'var(--teal, #00D68F)', SENIOR: 'var(--purple)',
  ELITE: 'var(--gold)',
}

export default function ProfissionalScore() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
  }, [user, authLoading, router])

  if (authLoading || !user) return null
  const prof = user.profissional || {}
  const score = prof.score || 0
  const nivel = prof.nivel || 'CANDIDATO'
  const pct = Math.min((score / 1000) * 100, 100)

  const COMPOSICAO = [
    { label: 'Qualidade técnica',  peso: '30%', valor: Math.round(score * 0.30) },
    { label: 'Taxa de conclusão',  peso: '20%', valor: Math.round(score * 0.20) },
    { label: 'Pontualidade',       peso: '15%', valor: Math.round(score * 0.15) },
    { label: 'Avaliação cliente',  peso: '12%', valor: Math.round(score * 0.12) },
    { label: 'Taxa de resposta',   peso: '8%',  valor: Math.round(score * 0.08) },
    { label: 'Retrabalho (neg.)',   peso: '15%', valor: Math.round(score * 0.15) },
  ]

  const TIERS = [
    { nome: 'CANDIDATO', min: 0,   max: 199,  comissao: '22%/19%/16%' },
    { nome: 'JUNIOR',    min: 200, max: 399,  comissao: '21%/18%/15%' },
    { nome: 'PLENO',     min: 400, max: 599,  comissao: '19%/16%/13%' },
    { nome: 'SENIOR',    min: 600, max: 799,  comissao: '17%/14%/11%' },
    { nome: 'ELITE',     min: 800, max: 1000, comissao: '15%/12%/9%'  },
  ]

  return (
    <Shell>
      <Topbar title="Score SQP" subtitle="Score de Qualificação Profissional · 0–1000 pts" />
      <main className="p-6 max-w-2xl space-y-5">

        {/* Score principal */}
        <div className="card-accent text-center py-8">
          <p className="text-7xl font-black font-mono mb-2" style={{ color: TIER_COLOR[nivel] }}>
            {score}
          </p>
          <span className="badge badge-gold text-sm px-3 py-1">{nivel}</span>
          <div className="mt-6 mx-4">
            <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #E8671A, #F5A623)' }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs" style={{ color: 'var(--text3)' }}>0</span>
              <span className="text-xs" style={{ color: 'var(--text3)' }}>1000</span>
            </div>
          </div>
          <p className="text-xs mt-3" style={{ color: 'var(--text3)' }}>
            Recalculado diariamente · janela 90 dias
          </p>
        </div>

        {/* Composição */}
        <div className="card-solid">
          <p className="section-label">Composição do score</p>
          <div className="space-y-3">
            {COMPOSICAO.map(c => (
              <div key={c.label} className="flex items-center gap-3">
                <span className="text-xs w-36 shrink-0" style={{ color: 'var(--text2)' }}>{c.label}</span>
                <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-1.5 rounded-full" style={{
                    width: `${Math.min((c.valor / 300) * 100, 100)}%`,
                    background: 'var(--orange)'
                  }} />
                </div>
                <span className="text-xs w-8 text-right font-mono" style={{ color: 'var(--text3)' }}>{c.peso}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabela de tiers */}
        <div className="card-solid">
          <p className="section-label">Tiers e comissões (Grátis/PRO/Elite)</p>
          <table className="data-table">
            <thead><tr><th>Tier</th><th>Pontos</th><th>Comissão</th><th>Status</th></tr></thead>
            <tbody>
              {TIERS.map(t => (
                <tr key={t.nome} style={t.nome === nivel ? { background: 'rgba(232,103,26,0.08)' } : {}}>
                  <td className="bold" style={{ color: TIER_COLOR[t.nome] }}>{t.nome}</td>
                  <td className="mono">{t.min}–{t.max}</td>
                  <td style={{ color: 'var(--text3)' }}>{t.comissao}</td>
                  <td>{t.nome === nivel ? <span className="badge badge-orange">Atual</span> : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </Shell>
  )
}
