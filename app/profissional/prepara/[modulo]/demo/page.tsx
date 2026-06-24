'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { profissional as profissionalApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { ArrowLeft, FlaskConical, CheckCircle2, Clock, Lock } from 'lucide-react'

const NIVEL_STARS: Record<string, number> = {
  'BÁSICO': 1, 'INTERMEDIÁRIO': 2, 'INTERMEDIÁRIO AVANÇADO': 3, 'AVANÇADO': 4, 'ESPECIALISTA': 5,
}

const NIVEL_RESULT_COLOR: Record<string, string> = {
  AVANCADO:      'var(--green)',
  INTERMEDIARIO: 'var(--orange)',
  BASICO:        'var(--gold)',
  REPROVADO:     'var(--red)',
}

function Stars({ n, total = 5 }: { n: number; total?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className="text-xs" style={{ color: i < n ? 'var(--gold)' : 'rgba(255,255,255,0.15)' }}>★</span>
      ))}
    </div>
  )
}

// A assinatura visual: barras de dificuldade como medidor de nível sonoro
function DifficultyBar({ nivel, total = 5 }: { nivel: number; total?: number }) {
  const bars = Array.from({ length: total })
  return (
    <div className="flex items-end gap-0.5" style={{ height: 20 }}>
      {bars.map((_, i) => {
        const height = 6 + i * 3 // crescente: 6, 9, 12, 15, 18px
        const active = i < nivel
        return (
          <div
            key={i}
            className="rounded-sm transition-all"
            style={{
              width: 4,
              height,
              background: active
                ? `rgba(232,103,26,${0.4 + i * 0.12})`
                : 'rgba(255,255,255,0.1)',
            }}
          />
        )
      })}
    </div>
  )
}

export default function DemoListPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const modulo = (params?.modulo as string || '').toLowerCase()

  const [demos, setDemos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    profissionalApi.demos(modulo)
      .then(r => setDemos(r.demos || []))
      .catch(() => toast('Erro ao carregar projetos demo', 'error'))
      .finally(() => setLoading(false))
  }, [user, authLoading, modulo, router, toast])

  if (authLoading || !user) return null

  const moduloLabel = modulo.toUpperCase()
  const concluidos = demos.filter(d => d.progresso?.nivel_resultado && d.progresso.nivel_resultado !== 'REPROVADO').length

  return (
    <Shell>
      <Topbar
        title={`Laboratório de Projetos — ${moduloLabel}`}
        subtitle={`${concluidos}/${demos.length} projetos aprovados`}
        actions={
          <button
            onClick={() => router.push(`/profissional/prepara/${modulo}`)}
            className="flex items-center gap-1.5 text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ color: 'var(--text3)' }}
          >
            <ArrowLeft size={14} /> Voltar ao módulo
          </button>
        }
      />

      <main className="p-6 max-w-4xl space-y-6">

        {/* Cabeçalho explicativo */}
        <div className="rounded-xl p-4" style={{ background: 'rgba(232,103,26,0.07)', border: '1px solid rgba(232,103,26,0.2)' }}>
          <div className="flex items-start gap-3">
            <FlaskConical size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--orange)' }} />
            <div>
              <p className="text-sm font-semibold text-white mb-1">Como funciona o Laboratório</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text3)' }}>
                Cada projeto apresenta um cenário real simulado com briefing de cliente, evidências fotográficas e escopo definido.
                Você elabora o laudo técnico no formulário e a SUE avalia em até 1 minuto contra critérios objetivos.
                Sem penalidade de SQP — você pode tentar quantas vezes quiser.
              </p>
            </div>
          </div>
        </div>

        {/* Grid de demos */}
        {loading ? (
          <div className="text-center py-16" style={{ color: 'var(--text3)' }}>Carregando projetos...</div>
        ) : demos.length === 0 ? (
          <div className="card-solid text-center py-12">
            <p className="text-sm" style={{ color: 'var(--text3)' }}>Nenhum projeto demo disponível para este módulo ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {demos.map((demo, idx) => {
              const stars = NIVEL_STARS[demo.nivel] || 1
              const prog  = demo.progresso
              const aprovado = prog?.nivel_resultado && prog.nivel_resultado !== 'REPROVADO'

              return (
                <button
                  key={demo.numero}
                  onClick={() => router.push(`/profissional/prepara/${modulo}/demo/${demo.numero}`)}
                  className="text-left rounded-2xl p-5 border transition-all hover:scale-[1.01] hover:border-orange-500/30 group"
                  style={{
                    background:  aprovado ? 'rgba(0,214,143,0.06)' : 'rgba(255,255,255,0.04)',
                    borderColor: aprovado ? 'rgba(0,214,143,0.25)' : 'rgba(255,255,255,0.08)',
                  }}
                >
                  {/* Header: número + dificuldade */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-bold font-mono px-2 py-0.5 rounded"
                        style={{ background: 'rgba(232,103,26,0.15)', color: 'var(--orange)' }}
                      >
                        #{demo.numero}
                      </span>
                      <DifficultyBar nivel={stars} />
                    </div>
                    {aprovado ? (
                      <CheckCircle2 size={16} style={{ color: 'var(--green)' }} />
                    ) : prog?.status === 'AVALIANDO' ? (
                      <Clock size={16} className="animate-pulse" style={{ color: 'var(--gold)' }} />
                    ) : null}
                  </div>

                  {/* Título */}
                  <p className="text-sm font-semibold text-white mb-1 leading-snug">{demo.titulo}</p>

                  {/* Meta: nível + tipo + área */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-2xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--text3)' }}>
                      {demo.nivel}
                    </span>
                    <span className="text-2xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--text3)' }}>
                      {demo.tipo_imovel} · {demo.area_m2}m²
                    </span>
                  </div>

                  {/* Status / Score */}
                  {prog ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--text3)' }}>
                        Tentativa {prog.tentativa}
                      </span>
                      {prog.status === 'AVALIANDO' ? (
                        <span className="text-xs font-semibold" style={{ color: 'var(--gold)' }}>Avaliando...</span>
                      ) : prog.score !== null && prog.score !== undefined ? (
                        <span className="text-sm font-bold font-mono" style={{ color: NIVEL_RESULT_COLOR[prog.nivel_resultado] || 'var(--text)' }}>
                          {prog.score}/100 · {prog.nivel_resultado}
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--text3)' }}>Não iniciado · clique para começar</span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Rubrica resumida */}
        <div className="card-solid">
          <p className="section-label mb-3">Critérios de avaliação</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs" style={{ color: 'var(--text3)' }}>
            {[
              ['Estrutura do laudo', '10 pts'],
              ['Registro fotográfico', '20 pts'],
              ['Identificação de patologias', '25 pts'],
              ['Fundamentação técnica', '20 pts'],
              ['Conclusão e recomendações', '15 pts'],
              ['Apresentação e linguagem', '10 pts'],
            ].map(([nome, pts]) => (
              <div key={nome} className="flex justify-between border-b py-1" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <span>{nome}</span>
                <span className="font-mono font-semibold" style={{ color: 'var(--text2)' }}>{pts}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 text-xs">
            {[['50-69', 'Básico', 'var(--gold)'], ['70-84', 'Intermediário', 'var(--orange)'], ['85-100', 'Avançado', 'var(--green)']].map(([range, label, color]) => (
              <span key={range}>
                <span className="font-mono" style={{ color }}>{range}</span>
                <span style={{ color: 'var(--text3)' }}> {label}</span>
              </span>
            ))}
          </div>
        </div>
      </main>
    </Shell>
  )
}
