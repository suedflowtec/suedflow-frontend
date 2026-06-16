'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { formatBRL } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { profissional, saques } from '@/lib/api'

export default function ProfissionalFinanceiro() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [valorSaque, setValorSaque] = useState('')
  const [pixKey, setPixKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [financeiro, setFinanceiro] = useState<Awaited<ReturnType<typeof profissional.financeiro>> | null>(null)
  const [carregando, setCarregando] = useState(true)

  const carregarFinanceiro = () => {
    profissional.financeiro()
      .then(setFinanceiro)
      .catch(err => toast(err.message || 'Erro ao carregar dados financeiros', 'error'))
      .finally(() => setCarregando(false))
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    carregarFinanceiro()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router])

  if (authLoading || !user) return null
  const prof = user.profissional || {}
  const saldo = financeiro?.disponivel ?? 0

  const handleSaque = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valorSaque || Number(valorSaque) < 50) {
      toast('Valor mínimo de saque: R$50', 'error'); return
    }
    if (!pixKey.trim()) {
      toast('Informe a chave PIX', 'error'); return
    }
    setLoading(true)
    try {
      const resp = await saques.criar({ valor: Number(valorSaque), pix_key: pixKey.trim() })
      toast(resp.msg, 'success')
      setValorSaque('')
      setPixKey('')
      carregarFinanceiro()
    } catch (err: any) {
      toast(err.message || 'Erro ao solicitar saque', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Shell>
      <Topbar title="Financeiro" subtitle="Saldo e saques via PIX" />
      <main className="p-6 max-w-2xl space-y-5">

        {/* Saldo */}
        <div className="card-accent">
          <p className="section-label">Saldo disponível</p>
          <p className="text-4xl font-black font-mono" style={{ color: 'var(--green)' }}>
            {carregando ? '—' : formatBRL(saldo)}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
            Saldo em custódia: {formatBRL(financeiro?.em_custodia || 0)} · liberado após confirmação do cliente
          </p>
        </div>

        {/* Resumo do mês */}
        <div className="card-solid">
          <p className="section-label">Resumo do mês</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs" style={{ color: 'var(--text3)' }}>Faturado</p>
              <p className="text-lg font-bold font-mono text-white">{formatBRL(financeiro?.faturado_mes || 0)}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text3)' }}>Comissão</p>
              <p className="text-lg font-bold font-mono" style={{ color: 'var(--orange)' }}>{formatBRL(financeiro?.comissao_mes || 0)}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text3)' }}>Líquido</p>
              <p className="text-lg font-bold font-mono" style={{ color: 'var(--green)' }}>{formatBRL(financeiro?.liquido_mes || 0)}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text3)' }}>Demandas concluídas</p>
              <p className="text-lg font-bold font-mono text-white">{financeiro?.total_demandas_mes || 0}</p>
            </div>
          </div>
        </div>

        {/* Saque */}
        <div className="card-solid">
          <p className="section-label">Solicitar saque PIX</p>
          <form onSubmit={handleSaque} className="space-y-4">
            <div>
              <label className="label">Valor (mínimo R$50)</label>
              <div className="flex gap-2 flex-wrap mb-2">
                {[500, 1000, 2000].map(v => (
                  <button key={v} type="button" onClick={() => setValorSaque(String(Math.min(v, saldo)))}
                    className="btn btn-secondary btn-sm">
                    {formatBRL(v)}
                  </button>
                ))}
                <button type="button" onClick={() => setValorSaque(String(saldo))}
                  className="btn btn-secondary btn-sm">
                  Tudo
                </button>
              </div>
              <input
                className="input"
                type="number"
                value={valorSaque}
                onChange={e => setValorSaque(e.target.value)}
                placeholder="0,00"
                min={50}
                max={saldo}
              />
            </div>
            <div>
              <label className="label">Chave PIX</label>
              <input
                className="input"
                value={pixKey}
                onChange={e => setPixKey(e.target.value)}
                placeholder="CPF, e-mail, telefone ou chave aleatória"
              />
            </div>
            <button
              type="submit"
              disabled={loading || saldo < 50}
              className="btn btn-primary w-full"
            >
              {loading ? 'Solicitando...' : `Sacar ${valorSaque ? formatBRL(Number(valorSaque)) : ''} via PIX`}
            </button>
            <p className="text-xs text-center" style={{ color: 'var(--text3)' }}>
              Prazo: até 2 horas úteis · IRRF retido se saque {'>'} R$666,66
            </p>
          </form>
        </div>

        {/* Plano e comissão */}
        <div className="card-solid">
          <p className="section-label">Seu plano</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">{prof.plano || 'GRATIS'} · {prof.nivel || 'CANDIDATO'}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>
                Comissão atual da plataforma · baseada em tier × plano
              </p>
            </div>
            <span className="badge badge-orange">{prof.nivel || 'CANDIDATO'}</span>
          </div>
        </div>
      </main>
    </Shell>
  )
}
