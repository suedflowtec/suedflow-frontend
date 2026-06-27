// app/curador/escola/page.tsx
// Projeto Escola — demandas reais supervisionadas pelo Curador Suporte (70/30 split)
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { curador as curadorApi } from '@/lib/api'
import { formatBRL, formatDate, statusLabel } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { GraduationCap, UserCheck, AlertTriangle } from 'lucide-react'

export default function CuradorEscolaPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [demandas, setDemandas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [assumindo, setAssumindo] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (!['CURADOR_SUPORTE', 'CURADOR_SENIOR', 'ADMIN'].includes(user.tipo)) {
      router.push('/cliente'); return
    }
    curadorApi.escola()
      .then(r => setDemandas(r.demandas || []))
      .catch(() => toast('Erro ao carregar Projetos Escola', 'error'))
      .finally(() => setLoading(false))
  }, [user, authLoading, router, toast])

  if (authLoading || !user) return null

  const semCurador  = demandas.filter(d => !d.escola_curador_id)
  const comCurador  = demandas.filter(d => d.escola_curador_id)

  const assumir = async (demandaId: string) => {
    setAssumindo(demandaId)
    try {
      await curadorApi.assumirEscola(demandaId)
      toast('Você assumiu a supervisão desta demanda escola!', 'success')
      setDemandas(prev => prev.map(d =>
        d.id === demandaId ? { ...d, escola_curador_id: user.id } : d
      ))
    } catch (err: any) {
      toast(err.message || 'Erro ao assumir supervisão', 'error')
    } finally {
      setAssumindo(null)
    }
  }

  return (
    <Shell>
      <Topbar
        title="Projetos Escola"
        subtitle="Demandas reais com supervisão de Curador Suporte · Split 70/30"
        actions={
          <button className="btn btn-secondary btn-sm" onClick={() => router.push('/curador/regras')}>
            Ver regras e remuneração
          </button>
        }
      />

      <main className="p-6 space-y-6 max-w-4xl">

        {/* Explicação rápida */}
        <div className="card-accent flex items-start gap-3">
          <GraduationCap size={20} style={{ color: 'var(--orange)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>O que é um Projeto Escola?</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text2)' }}>
              Uma demanda real marcada como "Escola" pelo profissional (geralmente mais jovem ou em fase inicial).
              Você acompanha a execução, orienta tecnicamente e recebe 30% do valor líquido do profissional ao concluir.
              A responsabilidade técnica e a ART/RRT são sempre do profissional.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text3)' }}>Carregando...</p>
        ) : demandas.length === 0 ? (
          <div className="card text-center py-12 space-y-3">
            <GraduationCap size={36} style={{ color: 'var(--text3)', margin: '0 auto' }} />
            <p className="font-semibold" style={{ color: 'var(--text2)' }}>Nenhum Projeto Escola no momento</p>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>
              Quando profissionais criarem demandas marcadas como "Escola", elas aparecerão aqui para você supervisionar.
            </p>
          </div>
        ) : (
          <>
            {/* Sem curador — disponíveis para assumir */}
            {semCurador.length > 0 && (
              <div className="card-solid space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={15} style={{ color: 'var(--gold)' }} />
                  <p className="section-label" style={{ color: 'var(--gold)' }}>
                    Aguardando curador ({semCurador.length})
                  </p>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>OS</th><th>Serviço</th><th>Profissional</th><th>Cidade</th>
                      <th className="text-right">Líquido estimado</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {semCurador.map(d => {
                      const s = statusLabel(d.status)
                      const liquidoCurador = d.liquido_profissional ? Math.round(d.liquido_profissional * 0.30 * 100) / 100 : null
                      return (
                        <tr key={d.id}>
                          <td className="mono">{d.numero || d.id?.slice(0, 8)}</td>
                          <td className="bold">{d.servico?.nome || d.svc_codigo}</td>
                          <td style={{ color: 'var(--text3)' }}>{d.profissional?.usuario?.nome || '—'}</td>
                          <td style={{ color: 'var(--text3)' }}>{d.cidade || '—'}</td>
                          <td className="text-right font-mono font-bold" style={{ color: 'var(--green)' }}>
                            {liquidoCurador ? formatBRL(liquidoCurador) : '—'}
                            <span className="block text-2xs font-normal" style={{ color: 'var(--text3)' }}>
                              (30% do líquido)
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-primary btn-sm"
                              disabled={assumindo === d.id}
                              onClick={() => assumir(d.id)}
                            >
                              {assumindo === d.id ? 'Assumindo...' : 'Assumir supervisão'}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Com curador — em andamento */}
            {comCurador.length > 0 && (
              <div className="card-solid space-y-3">
                <div className="flex items-center gap-2">
                  <UserCheck size={15} style={{ color: 'var(--green)' }} />
                  <p className="section-label">Com supervisão atribuída ({comCurador.length})</p>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>OS</th><th>Serviço</th><th>Status</th><th>Profissional</th>
                      <th className="text-right">Seu valor (30%)</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {comCurador.map(d => {
                      const s = statusLabel(d.status)
                      const meuCaso = d.escola_curador_id === user.id
                      const liquidoCurador = d.escola_liquido_curador || (d.liquido_profissional ? Math.round(d.liquido_profissional * 0.30 * 100) / 100 : null)
                      return (
                        <tr key={d.id} onClick={() => router.push(`/cliente/demandas/${d.id}`)} className="cursor-pointer">
                          <td className="mono">{d.numero || d.id?.slice(0, 8)}</td>
                          <td className="bold">{d.servico?.nome || d.svc_codigo}</td>
                          <td><span className={`badge badge-${s.variant === 'glass' ? 'gray' : s.variant}`}>{s.text}</span></td>
                          <td style={{ color: 'var(--text3)' }}>{d.profissional?.usuario?.nome || '—'}</td>
                          <td className="text-right font-mono font-bold" style={{ color: meuCaso ? 'var(--green)' : 'var(--text3)' }}>
                            {liquidoCurador ? formatBRL(liquidoCurador) : '—'}
                          </td>
                          <td>
                            {meuCaso
                              ? <span className="badge badge-green">Você</span>
                              : <span className="badge badge-gray">Outro curador</span>
                            }
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </Shell>
  )
}
