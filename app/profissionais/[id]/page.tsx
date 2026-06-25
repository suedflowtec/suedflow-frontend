// app/profissionais/[id]/page.tsx — perfil público do profissional (sem autenticação)
'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { profissional as profissionalApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'

const NIVEL_VARIANT: Record<string, any> = {
  CANDIDATO: 'glass',
  JUNIOR: 'blue',
  PLENO: 'green',
  SENIOR: 'orange',
  ELITE: 'gold',
}

function Estrelas({ media }: { media: number }) {
  const cheias = Math.round(media)
  return (
    <span style={{ color: 'var(--gold)' }}>
      {'★'.repeat(cheias)}
      <span style={{ color: 'var(--text3)' }}>{'★'.repeat(5 - cheias)}</span>
    </span>
  )
}

export default function PerfilPublicoPage() {
  const params = useParams()
  const id = params?.id as string

  const [data, setData] = useState<any>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    profissionalApi.perfilPublico(id)
      .then(setData)
      .catch((err: any) => setErro(err.message || 'Profissional não encontrado'))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-2xl space-y-4">
        <div className="text-center mb-2">
          <p className="text-xl font-bold" style={{ color: 'var(--orange)' }}>SUEDFLOW</p>
          <p className="text-sm" style={{ color: 'var(--text3)' }}>Perfil profissional verificado</p>
        </div>

        {loading ? (
          <p className="text-center text-sm" style={{ color: 'var(--text3)' }}>Carregando...</p>
        ) : erro || !data ? (
          <div className="card-solid text-center">
            <p className="text-sm" style={{ color: 'var(--text2)' }}>{erro || 'Profissional não encontrado.'}</p>
          </div>
        ) : (
          <>
            {/* Cabeçalho */}
            <div className="card-accent text-center space-y-2">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl mx-auto"
                style={{ background: 'rgba(232,103,26,0.15)', color: 'var(--orange)' }}
              >
                {(data.nome || 'P').charAt(0)}
              </div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                {data.nome || 'Nome não informado'}
              </h2>
              {data.nome_incompleto && (
                <p className="text-xs" style={{ color: 'var(--gold)' }}>
                  ⚠ Profissional ainda não completou o nome no perfil
                </p>
              )}
              {/* Número do conselho — cliente pode verificar no CREA/CAU */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <p className="text-sm font-mono font-semibold" style={{ color: 'var(--text)' }}>
                  {data.conselho}-{data.uf_conselho || '—'} {data.numero_conselho || '—'}
                </p>
              </div>
              <p className="text-2xs" style={{ color: 'var(--text3)' }}>
                Verifique a inscrição em{' '}
                {data.conselho === 'CAU'
                  ? <a href="https://transparencia.caubr.gov.br" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--orange)' }}>transparencia.caubr.gov.br ↗</a>
                  : <a href="https://www.creanet.crea.br" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--orange)' }}>creanet.crea.br ↗</a>
                }
              </p>
              <div className="flex justify-center gap-2 flex-wrap">
                <Badge variant={NIVEL_VARIANT[data.nivel] || 'glass'}>{data.nivel}</Badge>
                {data.crea_ativo && <Badge variant="green">✓ {data.conselho} ativo</Badge>}
              </div>
              {data.total_avaliacoes > 0 ? (
                <p className="text-sm">
                  <Estrelas media={data.avaliacao_media} />{' '}
                  <span className="font-semibold" style={{ color: 'var(--text2)' }}>
                    {data.avaliacao_media.toFixed(1)} ({data.total_avaliacoes} avaliação{data.total_avaliacoes === 1 ? '' : 'ões'})
                  </span>
                </p>
              ) : (
                <p className="text-sm" style={{ color: 'var(--text3)' }}>Ainda sem avaliações</p>
              )}
              {(data.cidade || data.estado) && (
                <p className="text-sm" style={{ color: 'var(--text3)' }}>
                  {[data.cidade, data.estado].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>

            {/* Métricas */}
            <div className="card-solid">
              <p className="section-label mb-3">Desempenho na plataforma</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="kpi-card">
                  <p className="kpi-value">{data.total_demandas}</p>
                  <p className="kpi-label">Demandas</p>
                </div>
                <div className="kpi-card">
                  <p className="kpi-value" style={{ color: 'var(--orange)' }}>{data.score}</p>
                  <p className="kpi-label">SQP</p>
                </div>
                <div className="kpi-card">
                  <p className="kpi-value" style={{ color: 'var(--green)' }}>
                    {data.taxa_conclusao !== null ? `${data.taxa_conclusao}%` : '—'}
                  </p>
                  <p className="kpi-label">Conclusão</p>
                </div>
              </div>
            </div>

            {/* Serviços habilitados */}
            {data.svcs_habilitados?.length > 0 && (
              <div className="card-solid">
                <p className="section-label mb-3">Serviços habilitados</p>
                <div className="flex flex-wrap gap-2">
                  {data.svcs_habilitados.map((s: any) => (
                    <span key={s.codigo} className="badge badge-glass">{s.codigo} {s.nome}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Avaliações recentes */}
            {data.avaliacoes_recentes?.length > 0 && (
              <div className="card-solid">
                <p className="section-label mb-3">Avaliações recentes</p>
                <ul className="space-y-3">
                  {data.avaliacoes_recentes.map((a: any, i: number) => (
                    <li key={i}>
                      <div className="flex justify-between">
                        <Estrelas media={a.nota_geral} />
                        <span className="text-2xs" style={{ color: 'var(--text3)' }}>{formatDate(a.created_at)}</span>
                      </div>
                      {a.comentario && (
                        <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>{a.comentario}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-center text-2xs pt-2" style={{ color: 'var(--text3)' }}>
              Dados verificados pela plataforma SUEDFLOW · suedflow.com.br
            </p>
          </>
        )}
      </div>
    </div>
  )
}
