// app/admin/banco-estrategico/page.tsx
// Banco Estratégico — visualização dos LibraryRecords anonimizados (LGPD-safe)
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { admin } from '@/lib/api'
import { formatBRL } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { Database, CheckCircle2, X, BarChart2 } from 'lucide-react'

const STATUS_LABEL: Record<string, { text: string; badge: string }> = {
  PENDENTE_REVISAO: { text: 'Pendente revisão', badge: 'badge-yellow' },
  APROVADO:         { text: 'Aprovado',          badge: 'badge-green' },
  EXCLUIDO:         { text: 'Excluído',          badge: 'badge-gray' },
}

export default function AdminBancoEstrategicoPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [dados, setDados] = useState<{ registros: any[]; total: number; stats: any[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFiltro, setStatusFiltro] = useState('PENDENTE_REVISAO')
  const [atualizando, setAtualizando] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (!['ADMIN', 'MODERADOR'].includes(user.tipo)) { router.push('/curador'); return }
    carregar()
  }, [user, authLoading, statusFiltro])

  const carregar = () => {
    setLoading(true)
    ;(admin as any).bancoEstrategico(statusFiltro)
      .then(setDados)
      .catch(() => toast('Erro ao carregar banco estratégico', 'error'))
      .finally(() => setLoading(false))
  }

  const atualizarStatus = async (id: string, status: 'APROVADO' | 'EXCLUIDO') => {
    setAtualizando(id)
    try {
      await (admin as any).atualizarBancoEstrategico(id, status)
      toast(status === 'APROVADO' ? 'Registro aprovado' : 'Registro excluído', 'success')
      carregar()
    } catch (err: any) {
      toast(err.message || 'Erro ao atualizar', 'error')
    } finally { setAtualizando(null) }
  }

  if (authLoading || !user) return null

  return (
    <Shell>
      <Topbar
        title="Banco Estratégico"
        subtitle="Dados anonimizados de demandas concluídas (LGPD-safe)"
      />

      <main className="p-6 space-y-6 max-w-6xl">

        {/* O que é */}
        <div className="card-accent flex items-start gap-3">
          <Database size={20} style={{ color: 'var(--orange)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>O que é o Banco Estratégico?</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text2)' }}>
              Dados anonimizados de cada demanda concluída — SVC, tipo de imóvel, área, cidade, SLA cumprido, avaliação do cliente e resultado da Verificação SUE.
              Nenhum dado pessoal (CPF, nome, endereço exato) é armazenado — base legal: dado anônimo (LGPD Art. 5°, III).
              Este banco alimenta comparativos, relatórios de mercado e a inteligência da SUE.
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
              Pipeline: job às 02h45 → gera registros em PENDENTE_REVISAO → admin aprova → disponível para análise.
            </p>
          </div>
        </div>

        {/* Stats por SVC */}
        {dados?.stats && dados.stats.length > 0 && (
          <div className="card-solid">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 size={15} style={{ color: 'var(--orange)' }} />
              <p className="section-label">Estatísticas por serviço (registros aprovados)</p>
            </div>
            <table className="data-table">
              <thead><tr>
                <th>SVC</th><th className="text-right">Qtd. demandas</th>
                <th className="text-right">Avaliação média</th><th className="text-right">SLA médio (dias)</th>
              </tr></thead>
              <tbody>
                {dados.stats.map((s: any) => (
                  <tr key={s.svc_codigo}>
                    <td className="mono bold">{s.svc_codigo}</td>
                    <td className="text-right">{s._count._all}</td>
                    <td className="text-right" style={{ color: 'var(--green)' }}>
                      {s._avg.avaliacao_cliente ? `${s._avg.avaliacao_cliente.toFixed(1)} ★` : '—'}
                    </td>
                    <td className="text-right" style={{ color: 'var(--text3)' }}>
                      {s._avg.sla_real_dias ? `${s._avg.sla_real_dias.toFixed(1)}d` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Filtros e lista */}
        <div className="card-solid space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="section-label">Registros · {dados?.total ?? 0} total</p>
            <div className="flex gap-2">
              {['PENDENTE_REVISAO', 'APROVADO', 'EXCLUIDO'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFiltro(s)}
                  className={statusFiltro === s ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                >
                  {STATUS_LABEL[s]?.text || s}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text3)' }}>Carregando...</p>
          ) : !dados?.registros?.length ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text3)' }}>
              Nenhum registro com status "{STATUS_LABEL[statusFiltro]?.text}".
              {statusFiltro === 'PENDENTE_REVISAO' && ' Demandas são processadas pelo pipeline às 02h45.'}
            </p>
          ) : (
            <table className="data-table">
              <thead><tr>
                <th>SVC</th><th>Tipo imóvel</th><th>Área</th><th>Cidade/UF</th>
                <th>SLA real</th><th>QA 1º ciclo</th><th>Avaliação</th><th>Status</th>
                <th></th>
              </tr></thead>
              <tbody>
                {dados.registros.map((r: any) => (
                  <tr key={r.id}>
                    <td className="mono bold">{r.svc_codigo}</td>
                    <td style={{ color: 'var(--text3)' }}>{r.tipo_imovel}</td>
                    <td className="mono">{r.area_m2 ? `${r.area_m2}m²` : '—'}</td>
                    <td style={{ color: 'var(--text3)' }}>{r.cidade && r.estado ? `${r.cidade}/${r.estado}` : '—'}</td>
                    <td className="mono">{r.sla_real_dias != null ? `${r.sla_real_dias}d` : '—'}</td>
                    <td>
                      {r.qa_aprovado_1ciclo
                        ? <span className="badge badge-green">Sim</span>
                        : <span className="badge badge-red">Não</span>
                      }
                    </td>
                    <td className="mono" style={{ color: 'var(--gold)' }}>
                      {r.avaliacao_cliente ? `${r.avaliacao_cliente.toFixed(1)} ★` : '—'}
                    </td>
                    <td>
                      <span className={`badge ${STATUS_LABEL[r.status]?.badge || 'badge-gray'}`}>
                        {STATUS_LABEL[r.status]?.text || r.status}
                      </span>
                    </td>
                    <td>
                      {r.status === 'PENDENTE_REVISAO' && (
                        <div className="flex gap-1">
                          <button
                            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                            style={{ background: 'rgba(0,214,143,0.1)', color: 'var(--green)' }}
                            onClick={() => atualizarStatus(r.id, 'APROVADO')}
                            disabled={atualizando === r.id}
                            title="Aprovar"
                          >
                            <CheckCircle2 size={13} />
                          </button>
                          <button
                            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                            style={{ background: 'rgba(255,77,109,0.1)', color: 'var(--red)' }}
                            onClick={() => atualizarStatus(r.id, 'EXCLUIDO')}
                            disabled={atualizando === r.id}
                            title="Excluir (LGPD)"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </Shell>
  )
}
