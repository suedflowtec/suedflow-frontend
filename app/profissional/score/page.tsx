'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { useAuth } from '@/hooks/useAuth'
import { profissional } from '@/lib/api'

const TIER_COLOR: Record<string, string> = {
  CANDIDATO: 'var(--text3)', JUNIOR: '#4A9BD4',
  PLENO: '#00D68F', SENIOR: 'var(--purple)',
  ELITE: 'var(--gold)',
}

const SAUDE_LABEL: Record<string, { texto: string; badge: string }> = {
  SAUDAVEL: { texto: 'Saudável', badge: 'badge-green' },
  ATENCAO: { texto: 'Atenção', badge: 'badge-gold' },
  CRITICO: { texto: 'Crítico', badge: 'badge-red' },
}

const METRICAS_LABEL: Record<string, { label: string; peso: number }> = {
  qualidadeTec: { label: 'Qualidade técnica', peso: 0.30 },
  taxaConclusao: { label: 'Taxa de conclusão', peso: 0.20 },
  taxaPontualidade: { label: 'Pontualidade', peso: 0.15 },
  qualidadeQA: { label: 'Qualidade QA', peso: 0.15 },
  avalCliente: { label: 'Avaliação cliente', peso: 0.12 },
  taxaResposta: { label: 'Taxa de resposta', peso: 0.08 },
}

const TIERS = [
  { nome: 'CANDIDATO', min: 0,   max: 199,  comissao: '22%' },
  { nome: 'JUNIOR',    min: 200, max: 399,  comissao: '21%' },
  { nome: 'PLENO',     min: 400, max: 599,  comissao: '19%' },
  { nome: 'SENIOR',    min: 600, max: 799,  comissao: '17%' },
  { nome: 'ELITE',     min: 800, max: 1000, comissao: '15%' },
]

export default function ProfissionalScore() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [dados, setDados] = useState<Awaited<ReturnType<typeof profissional.meuScore>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    profissional.meuScore()
      .then(setDados)
      .catch(err => setError(err.message || 'Não foi possível carregar o score.'))
      .finally(() => setLoading(false))
  }, [user, authLoading, router])

  if (authLoading || !user) return null

  const prof = user.profissional || {}
  const score = dados?.score ?? 0
  const nivel = dados?.nivel ?? 'CANDIDATO'
  const pct = Math.min((score / 1000) * 100, 100)
  const saude = dados?.saude

  const composicao = Object.entries(METRICAS_LABEL).map(([key, { label, peso }]) => ({
    label,
    peso,
    valor: Math.round((dados?.metricas?.[key] ?? 0) * peso * 1000),
    max: Math.round(peso * 1000),
  }))

  return (
    <Shell>
      <Topbar
        title="Score SQP"
        subtitle="Score de Qualificação Profissional · 0–1000 pts"
        actions={
          <a
            href="/profissional/perfil"
            className="btn btn-secondary btn-sm"
          >
            Meu perfil →
          </a>
        }
      />
      <main className="p-6 max-w-2xl space-y-5">

        {loading && <p style={{ color: 'var(--text3)' }}>Carregando score...</p>}
        {error && <div className="card-solid" style={{ color: 'var(--red)' }}>{error}</div>}

        {!loading && !error && (
          <>
            {/* Score principal */}
            <div className="card-accent text-center py-8">
              <p className="text-7xl font-black font-mono mb-2" style={{ color: TIER_COLOR[nivel] }}>
                {score}
              </p>
              <span className="badge badge-gold text-sm px-3 py-1">{nivel}</span>
              {saude && (
                <span className={`badge ${SAUDE_LABEL[saude.status]?.badge ?? 'badge-gold'} text-sm px-3 py-1 ml-2`}>
                  {SAUDE_LABEL[saude.status]?.texto ?? saude.status}
                </span>
              )}
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
                Recalculado diariamente · janela 90 dias · {dados?.total_concluidas ?? 0} de {dados?.total_demandas ?? 0} demandas concluídas
              </p>
              {(dados?.penalidades_acumuladas ?? 0) > 0 && (
                <p className="text-xs mt-1" style={{ color: 'var(--red)' }}>
                  −{dados!.penalidades_acumuladas} pts em penalidades nos últimos 90 dias
                </p>
              )}
            </div>

            {/* Composição */}
            <div className="card-solid">
              <p className="section-label">Composição do score</p>
              <div className="space-y-3">
                {composicao.map(c => (
                  <div key={c.label} className="flex items-center gap-3">
                    <span className="text-xs w-36 shrink-0" style={{ color: 'var(--text2)' }}>{c.label}</span>
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div className="h-1.5 rounded-full" style={{
                        width: `${c.max > 0 ? Math.min((c.valor / c.max) * 100, 100) : 0}%`,
                        background: 'var(--orange)'
                      }} />
                    </div>
                    <span className="text-xs w-10 text-right font-mono" style={{ color: 'var(--text3)' }}>
                      {c.valor}/{c.max}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Penalidades recentes */}
            {dados && dados.penalidades_recentes.length > 0 && (
              <div className="card-solid">
                <p className="section-label">Penalidades recentes</p>
                <table className="data-table">
                  <thead><tr><th>Motivo</th><th>Pontos</th><th>Data</th></tr></thead>
                  <tbody>
                    {dados.penalidades_recentes.map((p: any) => (
                      <tr key={p.id}>
                        <td>{p.motivo}</td>
                        <td className="mono" style={{ color: 'var(--red)' }}>{p.pontos}</td>
                        <td style={{ color: 'var(--text3)' }}>{new Date(p.created_at).toLocaleDateString('pt-BR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tabela de níveis */}
            <div className="card-solid">
              <p className="section-label">Níveis e comissões</p>
              <table className="data-table">
                <thead><tr><th>Nível</th><th>Pontos</th><th>Comissão plataforma</th><th>Status</th></tr></thead>
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
          </>
        )}
      </main>
    </Shell>
  )
}
