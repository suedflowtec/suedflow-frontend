// app/curador/financeiro/page.tsx — Extrato financeiro do Curador
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { formatBRL } from '@/lib/utils'
import { DollarSign, CheckCircle2, GraduationCap, MessageSquareWarning, RefreshCw } from 'lucide-react'

export default function CuradorFinanceiroPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [dados, setDados] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const carregar = async () => {
    setLoading(true)
    try {
      // Buscar do histórico de demandas relacionadas ao curador
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || 'https://suedflow-backend-production.up.railway.app'}/api/curador/financeiro`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('suedflow_token')}` } }
      )
      if (res.ok) {
        const d = await res.json()
        setDados(d)
      } else {
        // Fallback: mostrar tela informativa enquanto o endpoint não existe
        setDados({ vazio: true })
      }
    } catch {
      setDados({ vazio: true })
    } finally { setLoading(false) }
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (!['CURADOR_SUPORTE', 'CURADOR_SENIOR', 'ADMIN'].includes(user.tipo)) {
      router.push('/cliente'); return
    }
    carregar()
  }, [user, authLoading])

  if (authLoading || !user) return null

  const isSenior = user.tipo === 'CURADOR_SENIOR'

  return (
    <Shell>
      <Topbar
        title="Financeiro do Curador"
        subtitle="Suas remunerações por casos e projetos"
        actions={
          <button onClick={carregar} className="btn btn-secondary btn-sm flex items-center gap-1">
            <RefreshCw size={12} />Atualizar
          </button>
        }
      />

      <main className="p-6 max-w-3xl space-y-5">

        {/* Fontes de renda */}
        <div className="card-accent space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign size={16} style={{ color: 'var(--orange)' }} />
            <p className="section-label">Suas fontes de remuneração</p>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl p-3 flex items-start gap-3" style={{ background: 'var(--glass)', border: '1px solid var(--border)' }}>
              <CheckCircle2 size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--green)' }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Revisão de QA</p>
                <p className="text-xs" style={{ color: 'var(--text3)' }}>Por caso de QA_REPROVADO revisado e concluído. Valor definido pelo admin em /admin/parametros.</p>
              </div>
            </div>

            <div className="rounded-xl p-3 flex items-start gap-3" style={{ background: 'var(--glass)', border: '1px solid var(--border)' }}>
              <MessageSquareWarning size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Mediação de Disputa</p>
                <p className="text-xs" style={{ color: 'var(--text3)' }}>Por caso de disputa resolvido. Processado após encerramento do caso.</p>
              </div>
            </div>

            <div className="rounded-xl p-3 flex items-start gap-3" style={{ background: 'rgba(0,214,143,0.08)', border: '1px solid rgba(0,214,143,0.25)' }}>
              <GraduationCap size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--green)' }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--green)' }}>Projeto Escola</p>
                <p className="text-xs" style={{ color: 'var(--text3)' }}>30% do valor líquido do profissional por demanda escola supervisionada e concluída.</p>
                <p className="text-2xs mt-1 font-mono" style={{ color: 'var(--green)' }}>Exemplo: líquido prof. R$800 → você recebe R$240</p>
              </div>
            </div>

            {isSenior && (
              <div className="rounded-xl p-3 flex items-start gap-3" style={{ background: 'rgba(155,109,255,0.08)', border: '1px solid rgba(155,109,255,0.25)' }}>
                <DollarSign size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--purple)' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--purple)' }}>Demanda Especial (Sênior)</p>
                  <p className="text-xs" style={{ color: 'var(--text3)' }}>Fee por demanda especial precificada. Valor diferenciado definido em /admin/parametros.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Histórico de pagamentos */}
        <div className="card-solid space-y-3">
          <p className="section-label">Histórico de remunerações</p>

          {loading ? (
            <p className="text-sm text-center py-6" style={{ color: 'var(--text3)' }}>Carregando...</p>
          ) : dados?.vazio || !dados?.historico?.length ? (
            <div className="text-center py-10 space-y-3">
              <DollarSign size={28} style={{ color: 'var(--text3)', margin: '0 auto' }} />
              <p className="text-sm" style={{ color: 'var(--text3)' }}>Nenhum pagamento registrado ainda.</p>
              <p className="text-xs" style={{ color: 'var(--text3)' }}>
                Seus ganhos aparecerão aqui após a conclusão de casos de QA, disputas ou Projetos Escola.
              </p>
              <div className="rounded-xl p-3 text-xs text-left space-y-1" style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', color: 'var(--text2)' }}>
                <p className="font-semibold" style={{ color: 'var(--gold)' }}>Fase 1 — Pagamento Manual</p>
                <p>Na fase atual, os pagamentos são processados manualmente pela equipe SUEDFLOW via PIX para a chave cadastrada no seu onboarding. Os valores são calculados automaticamente pelo sistema a cada demanda concluída.</p>
                <p className="mt-1">Fase 2 (futuro): split automático via ASAAS.</p>
              </div>
            </div>
          ) : (
            <table className="data-table">
              <thead><tr>
                <th>Data</th><th>Tipo</th><th>Demanda</th>
                <th className="text-right">Valor</th><th>Status</th>
              </tr></thead>
              <tbody>
                {dados.historico.map((h: any, i: number) => (
                  <tr key={i}>
                    <td className="text-sm" style={{ color: 'var(--text3)' }}>
                      {new Date(h.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="text-sm">{h.tipo}</td>
                    <td className="mono text-sm">{h.numero || '—'}</td>
                    <td className="text-right font-mono font-bold" style={{ color: 'var(--green)' }}>
                      {formatBRL(h.valor)}
                    </td>
                    <td>
                      <span className={`badge ${h.pago ? 'badge-green' : 'badge-yellow'}`}>
                        {h.pago ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p className="text-xs text-center" style={{ color: 'var(--text3)' }}>
          Para dúvidas sobre pagamentos: suedflowtecnologia@gmail.com
        </p>
      </main>
    </Shell>
  )
}
