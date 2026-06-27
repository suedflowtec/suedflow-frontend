// app/curador/regras/page.tsx
// Guia completo do Curador Suporte e Curador Sênior — regras, acesso e remuneração
'use client'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { useAuth } from '@/hooks/useAuth'
import { ShieldCheck, Star, BookOpen, DollarSign, AlertTriangle, CheckCircle2, X } from 'lucide-react'

export default function CuradorRegrasPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  if (loading || !user) return null

  const isSenior = user.tipo === 'CURADOR_SENIOR'

  return (
    <Shell>
      <Topbar
        title={isSenior ? 'Regras — Curador Sênior' : 'Regras — Curador Suporte'}
        subtitle="Responsabilidades, acesso e remuneração"
      />

      <main className="p-6 max-w-3xl space-y-6">

        {/* Identidade do papel */}
        <div className="card-accent space-y-3">
          <div className="flex items-center gap-3">
            {isSenior
              ? <Star size={24} style={{ color: 'var(--gold)' }} />
              : <ShieldCheck size={24} style={{ color: 'var(--orange)' }} />
            }
            <div>
              <p className="font-bold text-base" style={{ color: 'var(--text)' }}>
                {isSenior ? 'Curador Sênior' : 'Curador Suporte'}
              </p>
              <p className="text-xs" style={{ color: 'var(--text3)' }}>
                {isSenior
                  ? 'Nível máximo de curadoria · Acesso completo ao sistema'
                  : 'Curador operacional · Foco em QA e supervisão de Projetos Escola'}
              </p>
            </div>
          </div>
          <p className="text-sm" style={{ color: 'var(--text2)' }}>
            {isSenior
              ? 'Você revisa todos os tipos de caso, precifica demandas especiais e supervisiona curadores suporte. Sua decisão no caso é final.'
              : 'Você revisa laudos (QA), media disputas e supervisiona Projetos Escola. Você NÃO precifica demandas especiais — isso é responsabilidade do Curador Sênior.'}
          </p>
        </div>

        {/* O que você pode fazer */}
        <div className="card-solid space-y-4">
          <p className="section-label">✓ O que você pode fazer</p>
          <div className="space-y-2">
            {[
              { label: 'Revisar entregas com QA reprovado (laudos e projetos)', both: true },
              { label: 'Mediar disputas entre cliente e profissional', both: true },
              { label: 'Dar feedback técnico ao profissional sobre a entrega', both: true },
              { label: 'Supervisionar Projetos Escola (orientar profissional inexperiente)', both: true },
              { label: 'Aprovar ou reprovar KYC de profissionais', both: true },
              { label: 'Precificar Demandas Especiais (área acima do padrão)', senior: true },
              { label: 'Acessar dashboards analíticos da plataforma', senior: true },
              { label: 'Supervisionar e orientar Curadores Suporte', senior: true },
            ].filter(item => item.both || (isSenior && item.senior)).map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 size={14} style={{ color: 'var(--green)', shrink: 0 }} />
                <span className="text-sm" style={{ color: 'var(--text2)' }}>{item.label}</span>
                {item.senior && <span className="badge badge-gold text-2xs">Sênior</span>}
              </div>
            ))}
          </div>
        </div>

        {/* O que você NÃO pode fazer */}
        {!isSenior && (
          <div className="card-solid space-y-3">
            <p className="section-label">✕ O que você NÃO pode fazer (Curador Suporte)</p>
            <div className="space-y-2">
              {[
                'Precificar Demandas Especiais — acionar Curador Sênior para esses casos',
                'Acessar dados financeiros da plataforma (faturamento, GMV)',
                'Alterar configurações de SVCs ou parâmetros do Motor UTS',
                'Encerrar uma demanda sem revisão técnica fundamentada',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <X size={14} style={{ color: 'var(--red)', flexShrink: 0 }} />
                  <span className="text-sm" style={{ color: 'var(--text2)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Remuneração */}
        <div className="card-solid space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign size={16} style={{ color: 'var(--green)' }} />
            <p className="section-label">Como você é remunerado</p>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl p-3 space-y-1" style={{ background: 'var(--glass)', border: '1px solid var(--border)' }}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Revisão de QA</p>
                  <p className="text-xs" style={{ color: 'var(--text3)' }}>Por caso de QA_REPROVADO revisado e concluído</p>
                </div>
                <span className="badge badge-green">Por caso</span>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                Valor definido pelo admin no painel de parâmetros. Fase 1: processado manualmente via saque PIX.
              </p>
            </div>

            <div className="rounded-xl p-3 space-y-1" style={{ background: 'var(--glass)', border: '1px solid var(--border)' }}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Mediação de Disputa</p>
                  <p className="text-xs" style={{ color: 'var(--text3)' }}>Por caso de disputa resolvido</p>
                </div>
                <span className="badge badge-orange">Por caso</span>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                Valor definido pelo admin. Processado após encerramento do caso.
              </p>
            </div>

            <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(0,214,143,0.08)', border: '1px solid rgba(0,214,143,0.25)' }}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--green)' }}>🏫 Projeto Escola</p>
                  <p className="text-xs" style={{ color: 'var(--text3)' }}>Por demanda escola supervisionada e concluída</p>
                </div>
                <span className="badge badge-teal font-bold">30% do líquido</span>
              </div>
              <div className="text-xs space-y-1" style={{ color: 'var(--text2)' }}>
                <p>Exemplo: demanda com líquido de R$800 para o profissional →</p>
                <p>→ Profissional recebe R$560 (70%)</p>
                <p>→ Você recebe R$240 (30%)</p>
                <p style={{ color: 'var(--text3)' }}>ART/RRT e comissão da plataforma são calculados antes da divisão.</p>
              </div>
            </div>

            {isSenior && (
              <div className="rounded-xl p-3 space-y-1" style={{ background: 'var(--glass)', border: '1px solid var(--border)' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Demanda Especial</p>
                    <p className="text-xs" style={{ color: 'var(--text3)' }}>Por demanda especial precificada e concluída</p>
                  </div>
                  <span className="badge badge-purple">Sênior</span>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                  Valor diferenciado pelo critério técnico exigido. Definido no painel de parâmetros.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-xl p-3" style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.25)' }}>
            <div className="flex items-start gap-2">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
              <p className="text-xs" style={{ color: 'var(--text2)' }}>
                <strong>Fase 1 (atual):</strong> Remuneração registrada automaticamente no sistema e processada manualmente pela SUEDFLOW via PIX. Fase 2: split automático via ASAAS quando a plataforma operar em modo marketplace operator.
              </p>
            </div>
          </div>
        </div>

        {/* Código de conduta */}
        <div className="card-solid space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen size={16} style={{ color: 'var(--orange)' }} />
            <p className="section-label">Código de conduta</p>
          </div>
          <div className="space-y-2 text-sm" style={{ color: 'var(--text2)' }}>
            <p>1. Imparcialidade: decisões técnicas fundamentadas, sem favorecimento de parte.</p>
            <p>2. Prazo: responder a cada caso em no máximo 5 dias úteis após atribuição.</p>
            <p>3. Confidencialidade: não divulgar dados de demandas, clientes ou profissionais fora da plataforma.</p>
            <p>4. Qualidade: feedback ao profissional deve ser construtivo e tecnicamente embasado.</p>
            <p>5. Conflito de interesses: não revisar demandas de profissionais com quem tenha relação pessoal ou comercial.</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="btn btn-primary flex-1" onClick={() => router.push('/curador/fila')}>
            Ir para fila de casos →
          </button>
          {!isSenior && (
            <button className="btn btn-secondary" onClick={() => router.push('/curador/escola')}>
              Projetos Escola →
            </button>
          )}
        </div>
      </main>
    </Shell>
  )
}
