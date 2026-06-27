'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { orders } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { MessageSquareWarning } from 'lucide-react'
import { SueDisclaimer } from '@/components/ui/SueDisclaimer'

const TIER_COLOR: Record<string, string> = {
  CANDIDATO: 'var(--text3)', JUNIOR: 'var(--blue)',
  PLENO: 'var(--teal, #00D68F)', SENIOR: 'var(--purple)',
  ELITE: 'var(--gold)',
}

const CLASSE_BADGE: Record<string, string> = {
  CONFORME: 'badge-green',
  ATENCAO: 'badge-yellow',
  INCONSISTENCIA: 'badge-red',
}

const CLASSE_LABEL: Record<string, string> = {
  CONFORME: 'Conforme',
  ATENCAO: 'Atenção',
  INCONSISTENCIA: 'Inconsistência',
}

export default function ResultadoQaPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()

  const [dados, setDados] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [justificativa, setJustificativa] = useState('')
  const [justificando, setJustificando] = useState(false)
  const [justificado, setJustificado] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (!id) return
    orders.qaResultado(id)
      .then(setDados)
      .catch((err: any) => toast(err.message || 'Erro ao consultar resultado do QA', 'error'))
      .finally(() => setLoading(false))
  }, [user, authLoading, router, id])

  if (authLoading || !user) return null
  if (loading) return (
    <Shell><Topbar title="Resultado do QA" /><main className="p-6"><p style={{ color: 'var(--text3)' }}>Carregando...</p></main></Shell>
  )

  const vtc = dados?.vtc
  const scoreAtual = dados?.score_atual
  const scoreAntes = dados?.score_antes
  const penalidade = dados?.penalidade
  const variacao = scoreAntes && scoreAtual ? scoreAtual.score - scoreAntes.score : null

  return (
    <Shell>
      <Topbar
        title="Resultado do QA"
        subtitle={dados?.demanda?.numero ? `OS ${dados.demanda.numero} · ${dados.demanda.svc_nome || ''}` : 'Verificação SUE'}
        actions={
          <button className="btn btn-secondary btn-sm" onClick={() => router.push(`/profissional/demandas/${id}`)}>
            ← Voltar à demanda
          </button>
        }
      />

      <main className="p-6 space-y-6 max-w-3xl">
        {/* Disclaimer obrigatório — topo da tela */}
        <SueDisclaimer />

        {!vtc ? (
          <div className="card">
            <p className="text-sm" style={{ color: 'var(--text3)' }}>
              {dados?.msg || 'A SUE ainda não concluiu a verificação deste entregável.'}
            </p>
          </div>
        ) : (
          <>
            {/* Resumo da Verificação SUE */}
            <div className="card-accent space-y-3">
              <p className="section-label">Verificação SUE</p>
              <p className="text-sm" style={{ color: 'var(--text2)' }}>{vtc.resumo}</p>
              <div className="flex gap-2">
                {vtc.tem_inconsistencia
                  ? <span className="badge badge-red">Inconsistências encontradas</span>
                  : vtc.tem_atencao
                    ? <span className="badge badge-yellow">Pontos de atenção</span>
                    : <span className="badge badge-green">Conforme</span>}
                {dados.revisado_em && (
                  <span className="badge badge-gray">
                    Verificado em {new Date(dados.revisado_em).toLocaleString('pt-BR')}
                  </span>
                )}
              </div>
            </div>

            {/* Itens verificados */}
            {Array.isArray(vtc.itens) && vtc.itens.length > 0 && (
              <div className="card-solid space-y-3">
                <p className="section-label">Itens verificados</p>
                <ul className="space-y-3">
                  {vtc.itens.map((item: any, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className={`badge ${CLASSE_BADGE[item.classe] || 'badge-gray'} shrink-0`}>
                        {CLASSE_LABEL[item.classe] || item.classe}
                      </span>
                      <div>
                        <p className="text-sm text-white">{item.descricao}</p>
                        {item.obs && <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>{item.obs}</p>}
                        {item.nbr && <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>Referência: {item.nbr}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sugestões */}
            {Array.isArray(vtc.sugestoes) && vtc.sugestoes.length > 0 && (
              <div className="card-solid space-y-2">
                <p className="section-label">Sugestões da SUE</p>
                <ul className="space-y-1">
                  {vtc.sugestoes.map((s: any, i: number) => (
                    <li key={i} className="text-sm" style={{ color: 'var(--text2)' }}>• {typeof s === 'string' ? s : s.descricao}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* Contestação da Verificação SUE — Art. 13.1 */}
        {vtc?.tem_inconsistencia && !justificado && (
          <div className="card-solid space-y-3" style={{ borderColor: 'rgba(255,193,7,0.3)' }}>
            <div className="flex items-start gap-2">
              <MessageSquareWarning size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>Contestar Verificação SUE</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                  Se você discordar das inconsistências apontadas, justifique tecnicamente e prossiga com a entrega.
                  A justificativa fica registrada para o curador analisar junto com o entregável (Art. 13.1).
                </p>
              </div>
            </div>
            <textarea
              className="input"
              rows={3}
              placeholder="Descreva tecnicamente por que sua entrega está correta apesar da Verificação SUE (mínimo 20 caracteres)"
              value={justificativa}
              onChange={e => setJustificativa(e.target.value)}
            />
            <button
              onClick={async () => {
                if (justificativa.trim().length < 20) {
                  toast('Justificativa muito curta (mínimo 20 caracteres)', 'error')
                  return
                }
                setJustificando(true)
                try {
                  await orders.justificarVtc(id, justificativa.trim())
                  setJustificado(true)
                  toast('Contestação registrada. O curador irá analisá-la junto com o entregável.', 'success')
                } catch (err: any) {
                  toast(err.message || 'Erro ao registrar contestação', 'error')
                } finally {
                  setJustificando(false)
                }
              }}
              disabled={justificando || justificativa.trim().length < 20}
              className="btn btn-primary w-full"
              style={{ opacity: justificativa.trim().length < 20 ? 0.5 : 1 }}
            >
              {justificando ? 'Registrando...' : 'Registrar contestação técnica'}
            </button>
          </div>
        )}

        {justificado && (
          <div className="rounded-xl p-4" style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.3)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>✓ Contestação registrada</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
              O curador irá analisar sua justificativa junto com o entregável no processo de QA.
            </p>
          </div>
        )}

        {/* Impacto no Score SQP */}
        {scoreAtual && (
          <div className="card-solid space-y-4">
            <p className="section-label">Impacto no Score SQP</p>
            <div className="flex items-center gap-6">
              {scoreAntes && (
                <>
                  <div className="text-center">
                    <p className="text-3xl font-black font-mono" style={{ color: TIER_COLOR[scoreAntes.nivel] }}>
                      {scoreAntes.score}
                    </p>
                    <span className="badge badge-gray text-xs mt-1">{scoreAntes.nivel}</span>
                    <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>Antes</p>
                  </div>
                  <p className="text-2xl" style={{ color: 'var(--text3)' }}>→</p>
                </>
              )}
              <div className="text-center">
                <p className="text-3xl font-black font-mono" style={{ color: TIER_COLOR[scoreAtual.nivel] }}>
                  {scoreAtual.score}
                </p>
                <span className="badge badge-orange text-xs mt-1">{scoreAtual.nivel}</span>
                <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>Atual</p>
              </div>
              {variacao !== null && variacao !== 0 && (
                <span className={`text-sm font-semibold ${variacao > 0 ? '' : ''}`} style={{ color: variacao > 0 ? 'var(--green)' : 'var(--red)' }}>
                  {variacao > 0 ? `+${variacao}` : variacao} pts
                </span>
              )}
            </div>

            {penalidade && (
              <div className="rounded-xl p-3" style={{ background: 'rgba(255,77,109,0.08)', border: '1px solid rgba(255,77,109,0.2)' }}>
                <p className="text-sm" style={{ color: 'var(--red)' }}>
                  ⚠ Penalidade aplicada: {penalidade.motivo} ({penalidade.pontos} pts)
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                  {new Date(penalidade.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
            )}

            <a href="/profissional/score" className="text-2xs" style={{ color: 'var(--text3)' }}>
              Ver detalhes do Score SQP →
            </a>
          </div>
        )}
      </main>
    </Shell>
  )
}
