'use client'
import { useEffect, useState } from 'react'
import { Shell, Topbar } from '@/components/layout/Shell'
import { useRouter } from 'next/navigation'
import { admin } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

type Param = { chave: string; valor: string; descricao?: string }

const PARAM_META: Record<string, { label: string; descricao: string; tipo: 'numero' | 'texto' | 'select'; opcoes?: string[] }> = {
  PNR_UTS:    { label: 'PNR-UTS (R$ por UTS)',          tipo: 'numero', descricao: 'Preço base em reais por unidade técnica de serviço. Validação=210, Tração=270, Maturidade=375.' },
  FE:         { label: 'FE — Fator de Estágio',          tipo: 'numero', descricao: 'Multiplicador de fase da plataforma sobre o preço. Validação=0.85, Tração=0.92, Maturidade=1.00.' },
  FASE:       { label: 'Fase da plataforma',             tipo: 'select', opcoes: ['VALIDACAO', 'TRACAO', 'MATURIDADE'], descricao: 'Controla o conjunto de multiplicadores aplicado à precificação.' },
  REGIAO:     { label: 'Fator Regional (Nordeste)',       tipo: 'numero', descricao: 'Multiplicador regional aplicado ao preço final. Nordeste padrão: 0.85.' },
  IRRF_PISO:  { label: 'Piso IRRF saque (R$)',           tipo: 'numero', descricao: 'Valor mínimo de saque para retenção de IRRF 1,5%. Abaixo disso, isento.' },
  IRRF_PCT:   { label: 'Taxa IRRF sobre saque (%)',       tipo: 'numero', descricao: 'Percentual de Imposto de Renda Retido na Fonte sobre saques acima do piso.' },
  TAXA_PIX:   { label: 'Taxa PIX (%)',                   tipo: 'numero', descricao: 'Taxa percentual sobre o pagamento PIX do cliente (embutida no preço base).' },
  TAXA_SAQUE:          { label: 'Taxa de saque PIX (R$)',        tipo: 'numero', descricao: 'Custo fixo por saque PIX do profissional. Isento no Plano Elite.' },
  // Multiplicadores de nível (DECISÃO #007 — 29/06/2026)
  MULT_NIVEL_PLENO:  { label: 'Multiplicador Pleno (×)',       tipo: 'numero', descricao: 'Fator aplicado ao preço quando cliente escolhe "Pleno ou acima". Ex: 1.18 = +18%. Incide sobre o serviço; a ART/RRT permanece intacta.' },
  MULT_NIVEL_SENIOR: { label: 'Multiplicador Sênior (×)',      tipo: 'numero', descricao: 'Fator aplicado ao preço quando cliente escolhe "Sênior ou acima". Ex: 1.30 = +30%. Incide sobre o serviço; a ART/RRT permanece intacta.' },
  MULT_NIVEL_ELITE:  { label: 'Multiplicador Elite (×)',       tipo: 'numero', descricao: 'Fator aplicado ao preço quando cliente escolhe "Elite". Ex: 1.45 = +45%. Incide sobre o serviço; a ART/RRT permanece intacta.' },
}

export default function AdminParametrosPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [params, setParams] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [editados, setEditados] = useState<Record<string, string>>({})

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (!['ADMIN', 'MODERADOR'].includes(user.tipo)) { router.push('/curador'); return }
    admin.paramsGlobais()
      .then(r => {
        setParams(r.params || {})
        setEditados(r.params || {})
      })
      .catch(() => toast('Erro ao carregar parâmetros', 'error'))
      .finally(() => setLoading(false))
  }, [user, authLoading, router, toast])

  // Valores padrão por fase — ao mudar a FASE, esses valores são aplicados automaticamente
  const FASE_DEFAULTS: Record<string, { PNR_UTS: string; FE: string }> = {
    VALIDACAO: { PNR_UTS: '210', FE: '0.85' },
    TRACAO:    { PNR_UTS: '270', FE: '0.92' },
    MATURIDADE:{ PNR_UTS: '375', FE: '1.00' },
  }

  const salvar = async (chave: string) => {
    const valor = editados[chave] ?? params[chave]
    if (valor === params[chave]) return
    setSaving(chave)
    try {
      // Quando FASE muda: atualiza também PNR_UTS e FE automaticamente
      if (chave === 'FASE' && FASE_DEFAULTS[valor]) {
        const defaults = FASE_DEFAULTS[valor]
        const confirmar = window.confirm(
          `Mudar para fase ${valor} irá redefinir:\n• PNR-UTS: R$ ${defaults.PNR_UTS}\n• FE: ${defaults.FE}\n\nConfirmar?`
        )
        if (!confirmar) {
          setEditados(e => ({ ...e, [chave]: params[chave] }))
          setSaving(null)
          return
        }
        // Salva FASE + PNR_UTS + FE em paralelo
        await Promise.all([
          admin.atualizarParamsGlobais({ fase: valor } as any),
          admin.atualizarParamsGlobais({ pnr: Number(defaults.PNR_UTS) } as any),
          admin.atualizarParamsGlobais({ fe: Number(defaults.FE) } as any),
        ])
        setParams(p => ({ ...p, FASE: valor, PNR_UTS: defaults.PNR_UTS, FE: defaults.FE }))
        setEditados(e => ({ ...e, FASE: valor, PNR_UTS: defaults.PNR_UTS, FE: defaults.FE }))
        toast(`Fase alterada para ${valor} — PNR-UTS e FE atualizados automaticamente`, 'success')
      } else {
        await admin.atualizarParamsGlobais({ [chave.toLowerCase()]: valor } as any)
        setParams(p => ({ ...p, [chave]: valor }))
        toast(`${PARAM_META[chave]?.label || chave} atualizado`, 'success')
      }
    } catch (err: any) {
      toast(err.message || 'Erro ao salvar', 'error')
      setEditados(e => ({ ...e, [chave]: params[chave] }))
    } finally {
      setSaving(null)
    }
  }

  const mudou = (chave: string) => editados[chave] !== undefined && editados[chave] !== params[chave]

  const GRUPOS = [
    { titulo: 'Motor de Precificação (UTS)', chaves: ['PNR_UTS', 'FE', 'FASE', 'REGIAO'] },
    { titulo: 'Multiplicadores de Nível (DECISÃO #007)', chaves: ['MULT_NIVEL_PLENO', 'MULT_NIVEL_SENIOR', 'MULT_NIVEL_ELITE'] },
    { titulo: 'Tributação e Taxas',          chaves: ['IRRF_PISO', 'IRRF_PCT', 'TAXA_PIX', 'TAXA_SAQUE'] },
  ]

  return (
    <Shell>
      <Topbar title="Parâmetros globais" subtitle="Configurações financeiras e de precificação da plataforma" />

      <main className="p-6 max-w-3xl space-y-6">
        {loading ? (
          <p className="text-sm py-10 text-center" style={{ color: 'var(--text3)' }}>Carregando parâmetros...</p>
        ) : (
          <>
            {GRUPOS.map(grupo => (
              <div key={grupo.titulo} className="card-solid space-y-4">
                <p className="section-label">{grupo.titulo}</p>

                {grupo.chaves.map(chave => {
                  const meta = PARAM_META[chave]
                  const valor = editados[chave] ?? params[chave] ?? ''
                  const alterado = mudou(chave)

                  return (
                    <div key={chave} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${alterado ? 'rgba(232,103,26,0.4)' : 'rgba(255,255,255,0.06)'}` }}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono font-bold" style={{ color: 'var(--text3)' }}>{chave}</span>
                            {alterado && <span className="badge badge-orange text-2xs">Alterado</span>}
                          </div>
                          <p className="text-sm font-semibold text-white mb-1">{meta?.label || chave}</p>
                          <p className="text-xs" style={{ color: 'var(--text3)' }}>{meta?.descricao}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {meta?.tipo === 'select' ? (
                            <select
                              className="input w-40"
                              value={valor}
                              onChange={e => setEditados(ed => ({ ...ed, [chave]: e.target.value }))}
                            >
                              {meta.opcoes?.map(op => (
                                <option key={op} value={op}>{op}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="number"
                              step="any"
                              className="input w-32 text-right font-mono"
                              value={valor}
                              onChange={e => setEditados(ed => ({ ...ed, [chave]: e.target.value }))}
                              onKeyDown={e => e.key === 'Enter' && salvar(chave)}
                            />
                          )}
                          <button
                            onClick={() => salvar(chave)}
                            disabled={!alterado || saving === chave}
                            className="btn btn-sm"
                            style={{
                              background: alterado ? 'var(--orange)' : 'rgba(255,255,255,0.06)',
                              color: alterado ? '#fff' : 'var(--text3)',
                              opacity: saving === chave ? 0.6 : 1,
                              minWidth: 72,
                            }}
                          >
                            {saving === chave ? '...' : alterado ? 'Salvar' : 'Salvo'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}

            <div className="rounded-xl p-4 text-xs space-y-1" style={{ background: 'rgba(232,103,26,0.06)', borderLeft: '3px solid var(--orange)' }}>
              <p className="font-semibold text-white">Fórmula de precificação (Motor UTS)</p>
              <p style={{ color: 'var(--text3)' }}>
                Preço = ceil(UTS_base × FEA) × PNR_UTS × Complexidade × Urgência × Escassez × FE × REGIAO
              </p>
              <p style={{ color: 'var(--text3)' }}>
                Onde FEA é o fator de área (0.90–2.20 por faixa de m²), UTS_base varia por tipo de imóvel (Res/Com/Ind) e SVC.
              </p>
            </div>
          </>
        )}
      </main>
    </Shell>
  )
}
