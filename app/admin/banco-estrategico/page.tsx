// app/admin/banco-estrategico/page.tsx
// Banco Estratégico — visualização dos LibraryRecords anonimizados (LGPD-safe)
'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { admin } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { Database, CheckCircle2, X, BarChart2, Search, SlidersHorizontal, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'

const STATUS_LABEL: Record<string, { text: string; badge: string }> = {
  TODOS:            { text: 'Todos',            badge: 'badge-gray' },
  PENDENTE_REVISAO: { text: 'Pendente revisão', badge: 'badge-yellow' },
  APROVADO:         { text: 'Aprovado',          badge: 'badge-green' },
  EXCLUIDO:         { text: 'Excluído',          badge: 'badge-gray' },
}

const SVC_LISTA = ['SVC000','SVC001','SVC002','SVC003','SVC004','SVC005','SVC006','SVC007','SVC008','SVC009','SVC010','SVC011']
const SVC_NOME: Record<string, string> = {
  SVC000:'Consultoria', SVC001:'Vistoria Cautelar', SVC002:'Avaliação NBR 14653',
  SVC003:'Inspeção Predial', SVC004:'Projeto Arquitetônico', SVC005:'Projeto Estrutural',
  SVC006:'Projeto Elétrico', SVC007:'Projeto Hidrossanitário', SVC008:'Regularização',
  SVC009:'Assist. Técnica Obra', SVC010:'Perícia Judicial', SVC011:'Due Diligence',
}

const LIMIT = 50

const FILTROS_VAZIOS = {
  status: 'APROVADO', svc: '', tipo_imovel: '', cidade: '', estado: '',
  qa_aprovado: '', avaliacao_min: '', sla_max: '', de: '', ate: '',
}

export default function AdminBancoEstrategicoPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()

  const [dados, setDados]       = useState<{ registros: any[]; total: number; stats: any[]; cidades: any[] } | null>(null)
  const [loading, setLoading]   = useState(true)
  const [atualizando, setAtualizando] = useState<string | null>(null)
  const [offset, setOffset]     = useState(0)
  const [filtros, setFiltros]   = useState({ ...FILTROS_VAZIOS })
  const [filtrosPainel, setFiltrosPainel] = useState(false) // mostrar painel avançado

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (!['ADMIN', 'MODERADOR'].includes(user.tipo)) { router.push('/curador'); return }
  }, [user, authLoading, router])

  const carregar = useCallback(() => {
    if (!user) return
    setLoading(true)
    ;(admin as any).bancoEstrategico({ ...filtros, limit: LIMIT, offset })
      .then(setDados)
      .catch(() => toast('Erro ao carregar banco estratégico', 'error'))
      .finally(() => setLoading(false))
  }, [user, filtros, offset, toast])

  useEffect(() => { carregar() }, [carregar])

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

  const set = (k: string, v: string) => {
    setFiltros(f => ({ ...f, [k]: v }))
    setOffset(0)
  }

  const limparFiltros = () => { setFiltros({ ...FILTROS_VAZIOS }); setOffset(0) }

  const filtrosAtivos = Object.entries(filtros).filter(([k, v]) =>
    v !== '' && !(k === 'status' && v === 'APROVADO')
  ).length

  const totalPages = Math.ceil((dados?.total ?? 0) / LIMIT)
  const paginaAtual = Math.floor(offset / LIMIT) + 1

  if (authLoading || !user) return null

  return (
    <Shell>
      <Topbar
        title="Banco Estratégico"
        subtitle={`${dados?.total ?? 0} registros anonimizados (LGPD-safe)`}
      />

      <main className="p-6 space-y-5 max-w-7xl">

        {/* Header informativo */}
        <div className="card-accent flex items-start gap-3">
          <Database size={18} style={{ color: 'var(--orange)', flexShrink: 0, marginTop: 2 }} />
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Banco Estratégico SUEDFLOW</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>
              SVC · tipo · área · cidade · SLA cumprido · avaliação do cliente · resultado VTC.
              Sem CPF, nome, endereço exato — base legal: dado anônimo (LGPD Art. 5°, III).
              Pipeline: job 02h45 → PENDENTE_REVISAO → admin aprova → disponível para análise.
            </p>
          </div>
        </div>

        {/* Stats resumo por SVC */}
        {dados?.stats && dados.stats.length > 0 && (
          <div className="card-solid">
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 size={14} style={{ color: 'var(--orange)' }} />
              <p className="section-label">Resumo por serviço (aprovados)</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {dados.stats.map((s: any) => (
                <button
                  key={s.svc_codigo}
                  onClick={() => set('svc', filtros.svc === s.svc_codigo ? '' : s.svc_codigo)}
                  className="text-left p-2.5 rounded-xl transition-colors"
                  style={{
                    background: filtros.svc === s.svc_codigo ? 'rgba(232,103,26,0.12)' : 'var(--glass)',
                    border: `1px solid ${filtros.svc === s.svc_codigo ? 'rgba(232,103,26,0.4)' : 'var(--border)'}`,
                  }}
                >
                  <p className="text-xs font-mono font-bold" style={{ color: 'var(--orange)' }}>{s.svc_codigo}</p>
                  <p className="text-2xs mt-0.5" style={{ color: 'var(--text3)' }}>{SVC_NOME[s.svc_codigo] || s.svc_codigo}</p>
                  <p className="text-sm font-bold mt-1" style={{ color: 'var(--text)' }}>{s._count._all}</p>
                  <div className="flex gap-2 mt-0.5">
                    {s._avg.avaliacao_cliente && (
                      <span className="text-2xs" style={{ color: 'var(--gold)' }}>
                        ★ {s._avg.avaliacao_cliente.toFixed(1)}
                      </span>
                    )}
                    {s._avg.sla_dias_real && (
                      <span className="text-2xs" style={{ color: 'var(--text3)' }}>
                        {s._avg.sla_dias_real.toFixed(0)}d
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Barra de busca e filtros */}
        <div className="card-solid space-y-3">

          {/* Linha principal de busca */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Busca por cidade */}
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text3)' }} />
              <input
                className="input pl-9 text-sm"
                placeholder="Buscar por cidade..."
                value={filtros.cidade}
                onChange={e => set('cidade', e.target.value)}
              />
            </div>

            {/* SVC */}
            <select className="input sm:w-52 text-sm" value={filtros.svc} onChange={e => set('svc', e.target.value)}>
              <option value="">Todos os SVCs</option>
              {SVC_LISTA.map(c => (
                <option key={c} value={c}>{c} · {SVC_NOME[c]}</option>
              ))}
            </select>

            {/* Tipo imóvel */}
            <select className="input sm:w-40 text-sm" value={filtros.tipo_imovel} onChange={e => set('tipo_imovel', e.target.value)}>
              <option value="">Todos os tipos</option>
              <option value="RESIDENCIAL">Residencial</option>
              <option value="COMERCIAL">Comercial</option>
              <option value="INDUSTRIAL">Industrial</option>
            </select>

            {/* Botão filtros avançados */}
            <button
              onClick={() => setFiltrosPainel(v => !v)}
              className="btn btn-secondary btn-sm flex items-center gap-1.5 shrink-0"
              style={filtrosAtivos > 0 ? { borderColor: 'rgba(232,103,26,0.5)', color: 'var(--orange)' } : {}}
            >
              <SlidersHorizontal size={13} />
              Filtros
              {filtrosAtivos > 0 && (
                <span className="rounded-full text-xs font-bold px-1.5" style={{ background: 'var(--orange)', color: '#fff' }}>
                  {filtrosAtivos}
                </span>
              )}
            </button>

            {filtrosAtivos > 0 && (
              <button onClick={limparFiltros} className="btn btn-ghost btn-sm flex items-center gap-1" title="Limpar filtros">
                <RotateCcw size={12} /> Limpar
              </button>
            )}
          </div>

          {/* Painel avançado */}
          {filtrosPainel && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
              <div>
                <label className="label">Estado (UF)</label>
                <input className="input text-sm" placeholder="Ex: PB" maxLength={2}
                  value={filtros.estado} onChange={e => set('estado', e.target.value.toUpperCase())} />
              </div>
              <div>
                <label className="label">QA 1º ciclo</label>
                <select className="input text-sm" value={filtros.qa_aprovado} onChange={e => set('qa_aprovado', e.target.value)}>
                  <option value="">Todos</option>
                  <option value="true">Aprovado no 1º ciclo</option>
                  <option value="false">Precisou de retrabalho</option>
                </select>
              </div>
              <div>
                <label className="label">Avaliação mínima ★</label>
                <select className="input text-sm" value={filtros.avaliacao_min} onChange={e => set('avaliacao_min', e.target.value)}>
                  <option value="">Qualquer</option>
                  <option value="3">3+ estrelas</option>
                  <option value="4">4+ estrelas</option>
                  <option value="5">5 estrelas</option>
                </select>
              </div>
              <div>
                <label className="label">SLA máximo (dias)</label>
                <input className="input text-sm" type="number" placeholder="Ex: 10"
                  value={filtros.sla_max} onChange={e => set('sla_max', e.target.value)} />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input text-sm" value={filtros.status} onChange={e => set('status', e.target.value)}>
                  {Object.entries(STATUS_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>{v.text}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">A partir de</label>
                <input className="input text-sm" type="date" value={filtros.de} onChange={e => set('de', e.target.value)} />
              </div>
              <div>
                <label className="label">Até</label>
                <input className="input text-sm" type="date" value={filtros.ate} onChange={e => set('ate', e.target.value)} />
              </div>
            </div>
          )}

          {/* Tabela de resultados */}
          {loading ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text3)' }}>Buscando...</p>
          ) : !dados?.registros?.length ? (
            <div className="text-center py-10 space-y-2">
              <Database size={28} style={{ color: 'var(--text3)', margin: '0 auto' }} />
              <p className="text-sm" style={{ color: 'var(--text3)' }}>
                {filtrosAtivos > 0
                  ? 'Nenhum registro encontrado com esses filtros.'
                  : 'Nenhum registro ainda. Pipeline roda às 02h45 após demandas concluídas.'}
              </p>
              {filtrosAtivos > 0 && (
                <button onClick={limparFiltros} className="btn btn-secondary btn-sm">Limpar filtros</button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>SVC</th>
                      <th>Tipo</th>
                      <th>Área</th>
                      <th>Cidade/UF</th>
                      <th>SLA</th>
                      <th>QA 1ºciclo</th>
                      <th>Avaliação</th>
                      <th>Patologias</th>
                      <th>Criado em</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.registros.map((r: any) => (
                      <tr key={r.id}>
                        <td>
                          <span className="mono bold" style={{ color: 'var(--orange)' }}>{r.svc_codigo}</span>
                          <span className="block text-2xs" style={{ color: 'var(--text3)' }}>{SVC_NOME[r.svc_codigo] || ''}</span>
                        </td>
                        <td className="text-sm" style={{ color: 'var(--text3)' }}>
                          {r.tipo_imovel === 'RESIDENCIAL' ? 'Res.' : r.tipo_imovel === 'COMERCIAL' ? 'Com.' : 'Ind.'}
                        </td>
                        <td className="mono text-sm">{r.area_m2 ? `${r.area_m2}m²` : '—'}</td>
                        <td className="text-sm" style={{ color: 'var(--text3)' }}>
                          {r.cidade && r.estado ? `${r.cidade}/${r.estado}` : r.estado || '—'}
                        </td>
                        <td>
                          {r.sla_dias_real != null ? (
                            <span className="mono text-sm" style={{
                              color: r.sla_contratado && r.sla_dias_real <= r.sla_contratado
                                ? 'var(--green)' : 'var(--red)'
                            }}>
                              {r.sla_dias_real}d
                              {r.sla_contratado && ` / ${r.sla_contratado}d`}
                            </span>
                          ) : '—'}
                        </td>
                        <td>
                          {r.qa_aprovado_1ciclo
                            ? <span className="badge badge-green">✓ Sim</span>
                            : <span className="badge badge-red">✗ Não</span>
                          }
                        </td>
                        <td>
                          {r.avaliacao_cliente ? (
                            <span className="mono font-bold" style={{ color: r.avaliacao_cliente >= 4 ? 'var(--green)' : r.avaliacao_cliente >= 3 ? 'var(--gold)' : 'var(--red)' }}>
                              {r.avaliacao_cliente.toFixed(1)} ★
                            </span>
                          ) : <span style={{ color: 'var(--text3)' }}>—</span>}
                        </td>
                        <td className="text-center">
                          {r.patologias_encontradas > 0 ? (
                            <span className="badge badge-yellow">{r.patologias_encontradas}</span>
                          ) : <span style={{ color: 'var(--text3)' }}>—</span>}
                        </td>
                        <td className="text-sm" style={{ color: 'var(--text3)' }}>
                          {new Date(r.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td>
                          <span className={`badge ${STATUS_LABEL[r.status]?.badge || 'badge-gray'} text-2xs`}>
                            {STATUS_LABEL[r.status]?.text || r.status}
                          </span>
                        </td>
                        <td>
                          {r.status === 'PENDENTE_REVISAO' && (
                            <div className="flex gap-1">
                              <button
                                className="w-7 h-7 flex items-center justify-center rounded-lg"
                                style={{ background: 'rgba(0,214,143,0.1)', color: 'var(--green)' }}
                                onClick={() => atualizarStatus(r.id, 'APROVADO')}
                                disabled={atualizando === r.id}
                                title="Aprovar"
                              >
                                <CheckCircle2 size={12} />
                              </button>
                              <button
                                className="w-7 h-7 flex items-center justify-center rounded-lg"
                                style={{ background: 'rgba(255,77,109,0.1)', color: 'var(--red)' }}
                                onClick={() => atualizarStatus(r.id, 'EXCLUIDO')}
                                disabled={atualizando === r.id}
                                title="Excluir (LGPD)"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <p className="text-xs" style={{ color: 'var(--text3)' }}>
                    {offset + 1}–{Math.min(offset + LIMIT, dados.total)} de {dados.total} registros
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={offset === 0}
                      onClick={() => setOffset(o => Math.max(0, o - LIMIT))}
                    >
                      <ChevronLeft size={14} /> Anterior
                    </button>
                    <span className="text-xs" style={{ color: 'var(--text3)' }}>
                      {paginaAtual} / {totalPages}
                    </span>
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={offset + LIMIT >= dados.total}
                      onClick={() => setOffset(o => o + LIMIT)}
                    >
                      Próxima <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </main>
    </Shell>
  )
}
