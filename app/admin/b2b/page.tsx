// app/admin/b2b/page.tsx — Painel B2B Corporate (Fase 2)
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { Building2, TrendingUp, FileText, Users, CreditCard, CheckCircle2 } from 'lucide-react'

const PLANOS_B2B = [
  {
    id: 'STARTER',
    label: 'Starter',
    preco: 'R$ 490/mês',
    demandas: 'Até 10 demandas/mês',
    desconto: '5% de desconto nas demandas',
    sla: 'SLA padrão',
    pagamento: 'Boleto mensal',
    suporte: 'Suporte por e-mail',
    cor: 'var(--blue)',
  },
  {
    id: 'BUSINESS',
    label: 'Business',
    preco: 'R$ 1.290/mês',
    demandas: 'Até 40 demandas/mês',
    desconto: '12% de desconto nas demandas',
    sla: 'SLA reduzido (+20% velocidade)',
    pagamento: 'Boleto mensal ou trimestral',
    suporte: 'Gerente de conta dedicado',
    cor: 'var(--orange)',
    destaque: true,
  },
  {
    id: 'ENTERPRISE',
    label: 'Enterprise',
    preco: 'Sob consulta',
    demandas: 'Ilimitado + fila prioritária',
    desconto: 'Desconto negociado + API',
    sla: 'SLA customizado + penalidade',
    pagamento: 'NF-e automática + faturamento',
    suporte: 'Squad dedicado + integrações',
    cor: 'var(--purple)',
  },
]

const CASOS_USO = [
  { Icon: Building2, label: 'Administradoras de condomínio', desc: 'Inspeções prediais periódicas obrigatórias em carteira de condomínios' },
  { Icon: TrendingUp, label: 'Imobiliárias', desc: 'Laudos de vistoria cautelar e avaliações para toda a carteira' },
  { Icon: FileText, label: 'Construtoras', desc: 'Auditorias de obra, medições para pagamento e regularizações' },
  { Icon: CreditCard, label: 'Bancos e fintechs', desc: 'Due diligence e laudos para operações de crédito imobiliário' },
]

export default function AdminB2BPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (!['ADMIN', 'MODERADOR'].includes(user.tipo)) { router.push('/curador'); return }
  }, [user, authLoading])

  if (authLoading || !user) return null

  return (
    <Shell>
      <Topbar
        title="B2B Corporate"
        subtitle="Planos para empresas — em implementação"
      />

      <main className="p-6 max-w-5xl space-y-6">

        {/* Banner de status */}
        <div className="card-accent flex items-start gap-3">
          <span className="text-2xl">🏗️</span>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Módulo B2B pronto para ativação</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text2)' }}>
              Os planos, regras e estrutura de dados estão definidos. O primeiro cliente B2B dispara a implementação completa do fluxo de contratação, NF-e automática e dashboard da empresa cliente.
              Gatilho: primeiro contato de empresa interessada.
            </p>
          </div>
        </div>

        {/* Casos de uso */}
        <div className="card-solid space-y-4">
          <p className="section-label">Perfis de cliente B2B identificados</p>
          <div className="grid grid-cols-2 gap-3">
            {CASOS_USO.map(caso => (
              <div key={caso.label} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'var(--glass)', border: '1px solid var(--border)' }}>
                <caso.Icon size={16} style={{ color: 'var(--orange)', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{caso.label}</p>
                  <p className="text-2xs mt-0.5" style={{ color: 'var(--text3)' }}>{caso.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Planos */}
        <div className="space-y-3">
          <p className="section-label">Planos B2B definidos</p>
          <div className="grid grid-cols-3 gap-4">
            {PLANOS_B2B.map(plano => (
              <div key={plano.id} className="rounded-2xl p-5 space-y-3" style={{
                background: plano.destaque ? 'rgba(232,103,26,0.08)' : 'var(--glass)',
                border: `1px solid ${plano.destaque ? 'rgba(232,103,26,0.35)' : 'var(--border)'}`,
                borderTop: `3px solid ${plano.cor}`,
              }}>
                <div>
                  <span className="badge text-xs" style={{ background: `${plano.cor}20`, color: plano.cor, border: `1px solid ${plano.cor}40` }}>{plano.label}</span>
                  <p className="text-xl font-black mt-2" style={{ color: 'var(--text)' }}>{plano.preco}</p>
                </div>
                <div className="space-y-1.5 text-xs" style={{ color: 'var(--text2)' }}>
                  {[plano.demandas, plano.desconto, plano.sla, plano.pagamento, plano.suporte].map((item, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 size={11} className="shrink-0 mt-0.5" style={{ color: plano.cor }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* O que precisa para ativar */}
        <div className="card-solid space-y-3">
          <p className="section-label">Checklist de ativação B2B</p>
          <div className="space-y-2 text-sm" style={{ color: 'var(--text2)' }}>
            {[
              { ok: true,  item: 'Planos B2B definidos (STARTER/BUSINESS/ENTERPRISE) — ✅ schema já tem PlanoB2B' },
              { ok: true,  item: 'Estrutura de dados no banco — ✅ enums e relações já existem' },
              { ok: false, item: 'Tela de contratação B2B para a empresa cliente' },
              { ok: false, item: 'Fluxo de aprovação pelo admin + contrato digital' },
              { ok: false, item: 'Dashboard da empresa cliente (visão consolidada de todos os imóveis)' },
              { ok: false, item: 'NF-e automática (aguarda ISS na Prefeitura JP + FocusNFe)' },
              { ok: false, item: 'API para integração com sistemas das empresas (Fase Enterprise)' },
            ].map((row, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-xs shrink-0 mt-0.5" style={{ color: row.ok ? 'var(--green)' : 'var(--text3)' }}>
                  {row.ok ? '✓' : '○'}
                </span>
                <span style={{ color: row.ok ? 'var(--text2)' : 'var(--text3)' }}>{row.item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-center" style={{ color: 'var(--text3)' }}>
          Para ativar o B2B: suedflowtecnologia@gmail.com · Primeiro cliente B2B confirma a prioridade de implementação.
        </p>
      </main>
    </Shell>
  )
}
