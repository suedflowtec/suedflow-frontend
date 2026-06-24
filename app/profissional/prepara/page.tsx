// app/profissional/prepara/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { Badge } from '@/components/ui/Badge'
import { profissional as profissionalApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { CheckCircle2, Lock, BookOpen, ChevronRight } from 'lucide-react'

const MODULOS = [
  {
    id: 'm1',
    titulo: 'Fundamentos SUEDFLOW',
    descricao: 'Metodologia, padrões de qualidade, comunicação com clientes e sistema de pontuação SQP.',
    desbloqueiaLabel: 'Acesso ao marketplace (obrigatório)',
    obrigatorio: true,
    svcs: ['Todas as demandas'],
  },
  {
    id: 'm2',
    titulo: 'Avaliação Mercadológica NBR 14653',
    descricao: 'Metodologia de avaliação de imóveis conforme ABNT NBR 14653. PTAM e laudos de valor.',
    desbloqueiaLabel: 'SVC002 — Avaliação Mercadológica',
    obrigatorio: false,
    svcs: ['SVC002 — Avaliação Mercadológica NBR 14653'],
  },
  {
    id: 'm3',
    titulo: 'Inspeção Predial NBR 16.747',
    descricao: 'Levantamento de patologias, classificação de risco e elaboração de laudo técnico conforme IBAPE/NBR.',
    desbloqueiaLabel: 'SVC003 — Inspeção Predial',
    obrigatorio: false,
    svcs: ['SVC003 — Inspeção Predial NBR 16.747'],
  },
  {
    id: 'm4',
    titulo: 'Projetos de Engenharia',
    descricao: 'Padrões para projetos arquitetônicos, estruturais, elétricos, hidrossanitários e regularização.',
    desbloqueiaLabel: 'SVC004 a SVC008',
    obrigatorio: false,
    svcs: ['SVC004 — Projeto Arquitetônico', 'SVC005 — Projeto Estrutural', 'SVC006 — Projeto Elétrico', 'SVC007 — Projeto Hidrossanitário', 'SVC008 — Regularização de Imóvel'],
  },
  {
    id: 'm5',
    titulo: 'Gerenciamento de Obras e SINAPI',
    descricao: 'Planejamento, medições, cronograma e uso da tabela SINAPI para gestão de obras.',
    desbloqueiaLabel: 'SVC009 — Gerenciamento de Obras',
    obrigatorio: false,
    svcs: ['SVC009 — Gerenciamento de Obras / SINAPI'],
  },
  {
    id: 'm6',
    titulo: 'Perícia Judicial e Due Diligence',
    descricao: 'Elaboração de laudos periciais para juízo e due diligence técnica em transações imobiliárias.',
    desbloqueiaLabel: 'SVC010 — SVC011',
    obrigatorio: false,
    svcs: ['SVC010 — Perícia Judicial', 'SVC011 — Due Diligence Técnica'],
  },
]

export default function SuedPreparaHomePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()

  const [prepara, setPrepara] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (!user.profissional) { router.push('/cliente'); return }

    profissionalApi.perfil()
      .then((prof: any) => {
        setPrepara({
          m1: prof.prepara_m1 ?? false,
          m2: prof.prepara_m2 ?? false,
          m3: prof.prepara_m3 ?? false,
          m4: prof.prepara_m4 ?? false,
          m5: prof.prepara_m5 ?? false,
          m6: prof.prepara_m6 ?? false,
        })
      })
      .catch(() => toast('Erro ao carregar progresso do SUEDPrepara', 'error'))
      .finally(() => setLoading(false))
  }, [user, authLoading, router, toast])

  if (authLoading || !user) return null

  const concluidos = Object.values(prepara).filter(Boolean).length
  const total = MODULOS.length
  const pct = total > 0 ? Math.round((concluidos / total) * 100) : 0
  const m1Concluido = prepara.m1

  return (
    <Shell>
      <Topbar
        title="SUEDPrepara"
        subtitle={loading ? 'Carregando...' : `${concluidos} de ${total} módulos concluídos`}
      />

      <main className="p-6 max-w-3xl space-y-6">

        {/* Progresso geral */}
        <div className="card-solid space-y-3">
          <div className="flex items-center justify-between">
            <p className="section-label">Seu progresso</p>
            <span className="text-sm font-bold" style={{ color: pct === 100 ? 'var(--green)' : 'var(--orange)' }}>
              {pct}%
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--navy3)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: pct === 100 ? 'var(--green)' : 'var(--orange)' }}
            />
          </div>
          {!m1Concluido && !loading && (
            <div className="flex items-start gap-2 text-xs p-3 rounded-lg" style={{ background: 'rgba(232,103,26,0.1)', color: 'var(--orange)' }}>
              <span className="shrink-0 mt-0.5">⚠</span>
              <p>O Módulo M1 é obrigatório. Conclua-o primeiro para desbloquear o acesso às demandas e aos demais módulos.</p>
            </div>
          )}
          {concluidos === total && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--green)' }}>
                <CheckCircle2 size={16} />
                <span className="font-semibold">Habilitação completa — você está apto para todas as demandas da plataforma!</span>
              </div>
              <button
                onClick={() => router.push('/profissional/prepara/certificado')}
                className="btn w-full flex items-center justify-center gap-2"
                style={{ background: 'rgba(245,166,35,0.12)', color: 'var(--gold)', border: '1px solid rgba(245,166,35,0.3)' }}
              >
                🏆 Ver e baixar meu certificado SUEDPrepara
              </button>
            </div>
          )}
        </div>

        {/* Lista de módulos */}
        <div className="space-y-3">
          {MODULOS.map((m, idx) => {
            const concluido = prepara[m.id] ?? false
            const bloqueado = idx > 0 && !m1Concluido && !loading

            return (
              <button
                key={m.id}
                onClick={() => !bloqueado && router.push(`/profissional/prepara/${m.id}`)}
                disabled={bloqueado}
                className="w-full text-left card-solid transition-all"
                style={{
                  opacity: bloqueado ? 0.5 : 1,
                  cursor: bloqueado ? 'not-allowed' : 'pointer',
                  borderColor: concluido ? 'rgba(34,197,94,0.3)' : undefined,
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Status icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      background: concluido
                        ? 'rgba(34,197,94,0.15)'
                        : bloqueado
                        ? 'rgba(255,255,255,0.04)'
                        : 'rgba(232,103,26,0.12)',
                    }}
                  >
                    {concluido
                      ? <CheckCircle2 size={20} style={{ color: 'var(--green)' }} />
                      : bloqueado
                      ? <Lock size={18} style={{ color: 'var(--text3)' }} />
                      : <BookOpen size={18} style={{ color: 'var(--orange)' }} />
                    }
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xs font-mono font-bold" style={{ color: 'var(--text3)' }}>
                        {m.id.toUpperCase()}
                      </span>
                      {m.obrigatorio && (
                        <Badge variant="orange">Obrigatório</Badge>
                      )}
                      {concluido && (
                        <Badge variant="green">Concluído</Badge>
                      )}
                    </div>
                    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>{m.titulo}</p>
                    <p className="text-xs mb-2" style={{ color: 'var(--text3)' }}>{m.descricao}</p>
                    <p className="text-2xs" style={{ color: 'var(--text3)' }}>
                      <span style={{ color: concluido ? 'var(--green)' : 'var(--orange)' }}>↗ </span>
                      {m.desbloqueiaLabel}
                    </p>
                  </div>

                  {!bloqueado && (
                    <ChevronRight size={18} className="shrink-0 self-center" style={{ color: 'var(--text3)' }} />
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Info sobre conteúdo */}
        <div className="card-solid text-xs space-y-1" style={{ color: 'var(--text3)' }}>
          <p className="font-semibold text-white">Como funciona o SUEDPrepara</p>
          <p>Cada módulo contém os padrões, metodologias e requisitos SUEDFLOW para o grupo de serviços que habilita. Ao concluir, você declara estar apto a executar esses serviços conforme os critérios de qualidade da plataforma.</p>
          <p className="mt-1">Os módulos ficam registrados no seu perfil e são verificados pela Curadoria antes de demandas de alta complexidade.</p>
        </div>
      </main>
    </Shell>
  )
}
