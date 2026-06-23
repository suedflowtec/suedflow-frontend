'use client'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { useEffect } from 'react'
import { Check, X, Zap, Star, Shield } from 'lucide-react'

type Plano = 'GRATIS' | 'PRO' | 'ELITE'

const COMISSAO: Record<Plano, Record<string, number>> = {
  GRATIS: { CANDIDATO: 22, JUNIOR: 21, PLENO: 19, SENIOR: 17, ELITE: 15 },
  PRO:    { CANDIDATO: 20, JUNIOR: 19, PLENO: 17, SENIOR: 15, ELITE: 13 },
  ELITE:  { CANDIDATO: 18, JUNIOR: 17, PLENO: 15, SENIOR: 13, ELITE: 11 },
}

const NIVEIS = ['CANDIDATO', 'JUNIOR', 'PLENO', 'SENIOR', 'ELITE']

interface PlanoConfig {
  id: Plano
  label: string
  preco: string
  descricao: string
  Icon: React.ElementType
  cor: string
  corBg: string
  destaque: boolean
  beneficios: { texto: string; incluso: boolean }[]
}

const PLANOS: PlanoConfig[] = [
  {
    id: 'GRATIS',
    label: 'Grátis',
    preco: 'R$ 0',
    descricao: 'Para começar na plataforma e crescer pelo Score SQP',
    Icon: Shield,
    cor: 'var(--text2)',
    corBg: 'rgba(255,255,255,0.04)',
    destaque: false,
    beneficios: [
      { texto: 'Acesso ao feed de demandas', incluso: true },
      { texto: 'Score SQP e progressão de nível', incluso: true },
      { texto: 'Chat com cliente', incluso: true },
      { texto: 'Suporte padrão', incluso: true },
      { texto: 'Comissão reduzida', incluso: false },
      { texto: 'Prioridade no feed', incluso: false },
      { texto: 'Badge PRO no perfil', incluso: false },
      { texto: 'Acesso ao SUEDPrepara', incluso: false },
      { texto: 'Relatórios financeiros avançados', incluso: false },
    ],
  },
  {
    id: 'PRO',
    label: 'PRO',
    preco: 'R$ 79',
    descricao: 'Para profissionais que querem crescer mais rápido com mais demandas',
    Icon: Zap,
    cor: 'var(--orange)',
    corBg: 'rgba(232,103,26,0.08)',
    destaque: true,
    beneficios: [
      { texto: 'Acesso ao feed de demandas', incluso: true },
      { texto: 'Score SQP e progressão de nível', incluso: true },
      { texto: 'Chat com cliente', incluso: true },
      { texto: 'Suporte prioritário', incluso: true },
      { texto: 'Comissão reduzida em 2%', incluso: true },
      { texto: 'Prioridade no feed de demandas', incluso: true },
      { texto: 'Badge PRO no perfil', incluso: true },
      { texto: 'Acesso ao SUEDPrepara', incluso: false },
      { texto: 'Relatórios financeiros avançados', incluso: true },
    ],
  },
  {
    id: 'ELITE',
    label: 'ELITE',
    preco: 'R$ 149',
    descricao: 'Para os melhores profissionais que querem máxima visibilidade e mínima comissão',
    Icon: Star,
    cor: '#FFD700',
    corBg: 'rgba(255,215,0,0.06)',
    destaque: false,
    beneficios: [
      { texto: 'Acesso ao feed de demandas', incluso: true },
      { texto: 'Score SQP e progressão de nível', incluso: true },
      { texto: 'Chat com cliente', incluso: true },
      { texto: 'Suporte VIP', incluso: true },
      { texto: 'Comissão reduzida em 4%', incluso: true },
      { texto: 'Máxima prioridade no feed', incluso: true },
      { texto: 'Badge ELITE no perfil', incluso: true },
      { texto: 'Acesso ao SUEDPrepara', incluso: true },
      { texto: 'Relatórios financeiros avançados', incluso: true },
    ],
  },
]

export default function PlanosPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (!user.profissional) { router.push('/cliente'); return }
  }, [user, authLoading, router])

  if (authLoading || !user) return null

  const prof = user.profissional || {}
  const planoAtual: Plano = (prof.plano as Plano) || 'GRATIS'
  const nivelAtual: string = prof.nivel || 'CANDIDATO'

  const handleAssinar = (plano: Plano) => {
    if (plano === planoAtual) return
    if (plano === 'GRATIS') {
      toast('Para fazer downgrade para Grátis, entre em contato com o suporte.', 'error')
      return
    }
    toast('Assinatura em implementação — contate suporte@suedflow.com.br', 'error')
  }

  return (
    <Shell>
      <Topbar
        title="Meu plano"
        subtitle={`Plano atual: ${planoAtual} · Nível SQP: ${nivelAtual}`}
      />

      <main className="p-6 max-w-5xl space-y-8">

        {/* Plano atual */}
        {planoAtual !== 'GRATIS' && (
          <div className="card-accent flex items-center gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--orange)' }}>
                Seu plano atual
              </p>
              <p className="text-lg font-black text-white mt-0.5">{planoAtual}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                Comissão com seu nível {nivelAtual}: {COMISSAO[planoAtual]?.[nivelAtual] ?? '—'}%
              </p>
            </div>
          </div>
        )}

        {/* Cards de plano */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANOS.map(p => {
            const ativo = p.id === planoAtual
            const comissao = COMISSAO[p.id]?.[nivelAtual]

            return (
              <div
                key={p.id}
                className="card-solid flex flex-col"
                style={{
                  background: p.corBg,
                  border: ativo
                    ? `2px solid ${p.cor}`
                    : p.destaque
                    ? `1.5px solid rgba(232,103,26,0.35)`
                    : '1.5px solid rgba(255,255,255,0.08)',
                  position: 'relative',
                }}
              >
                {p.destaque && !ativo && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: 'var(--orange)', color: '#fff', whiteSpace: 'nowrap' }}
                  >
                    Mais popular
                  </div>
                )}
                {ativo && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: p.cor, color: p.cor === '#FFD700' ? '#000' : '#fff', whiteSpace: 'nowrap' }}
                  >
                    Plano atual
                  </div>
                )}

                {/* Cabeçalho */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <p.Icon size={20} strokeWidth={1.8} style={{ color: p.cor }} />
                    <span className="font-black text-white text-lg">{p.label}</span>
                  </div>
                  <p className="text-2xl font-black" style={{ color: p.cor }}>
                    {p.preco}
                    <span className="text-sm font-normal" style={{ color: 'var(--text3)' }}>/mês</span>
                  </p>
                  <p className="text-xs mt-2" style={{ color: 'var(--text3)' }}>{p.descricao}</p>
                </div>

                {/* Comissão para o nível atual */}
                <div
                  className="rounded-lg px-3 py-2 mb-4"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <p className="text-xs" style={{ color: 'var(--text3)' }}>
                    Sua comissão com nível {nivelAtual}
                  </p>
                  <p className="text-2xl font-black font-mono" style={{ color: p.cor }}>
                    {comissao ?? '—'}%
                  </p>
                </div>

                {/* Benefícios */}
                <ul className="space-y-2 flex-1 mb-6">
                  {p.beneficios.map(b => (
                    <li key={b.texto} className="flex items-center gap-2 text-xs">
                      {b.incluso
                        ? <Check size={14} strokeWidth={2.5} style={{ color: 'var(--green)', flexShrink: 0 }} />
                        : <X size={14} strokeWidth={2.5} style={{ color: 'var(--text3)', flexShrink: 0 }} />
                      }
                      <span style={{ color: b.incluso ? 'var(--text2)' : 'var(--text3)' }}>{b.texto}</span>
                    </li>
                  ))}
                </ul>

                {/* Botão de ação */}
                <button
                  onClick={() => handleAssinar(p.id)}
                  disabled={ativo}
                  className="btn w-full"
                  style={{
                    background: ativo
                      ? 'rgba(255,255,255,0.06)'
                      : p.id === 'ELITE'
                      ? 'linear-gradient(135deg, #b8860b, #FFD700)'
                      : 'linear-gradient(135deg, #E8671A, #FF8A3D)',
                    color: ativo ? 'var(--text3)' : p.id === 'ELITE' ? '#000' : '#fff',
                    border: 'none',
                    cursor: ativo ? 'default' : 'pointer',
                  }}
                >
                  {ativo ? 'Plano atual' : p.id === 'GRATIS' ? 'Fazer downgrade' : `Assinar ${p.label}`}
                </button>
              </div>
            )
          })}
        </div>

        {/* Tabela de comissão por nível × plano */}
        <div className="card-solid">
          <p className="section-label mb-4">Comissão por nível SQP × plano</p>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nível SQP</th>
                  <th className="text-center">GRÁTIS</th>
                  <th className="text-center" style={{ color: 'var(--orange)' }}>PRO</th>
                  <th className="text-center" style={{ color: '#FFD700' }}>ELITE</th>
                </tr>
              </thead>
              <tbody>
                {NIVEIS.map(nivel => (
                  <tr key={nivel} style={nivel === nivelAtual ? { background: 'rgba(232,103,26,0.06)' } : {}}>
                    <td>
                      <span className="font-mono font-bold text-white">{nivel}</span>
                      {nivel === nivelAtual && (
                        <span className="ml-2 text-xs" style={{ color: 'var(--orange)' }}>← você</span>
                      )}
                    </td>
                    {(['GRATIS', 'PRO', 'ELITE'] as Plano[]).map(plano => (
                      <td
                        key={plano}
                        className="text-center font-mono font-semibold"
                        style={{
                          color: (plano === planoAtual && nivel === nivelAtual)
                            ? 'var(--green)'
                            : 'var(--text2)',
                        }}
                      >
                        {COMISSAO[plano]?.[nivel] ?? '—'}%
                        {plano === planoAtual && nivel === nivelAtual && (
                          <span className="ml-1 text-xs" style={{ color: 'var(--green)' }}>✓</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs mt-3" style={{ color: 'var(--text3)' }}>
            Comissão descontada automaticamente no repasse. Quanto menor, mais você retém por demanda concluída.
          </p>
        </div>

        {/* Como funciona a progressão */}
        <div className="card-solid">
          <p className="section-label mb-3">Como funciona</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <p className="font-bold text-white mb-1">Score SQP (grátis)</p>
              <p style={{ color: 'var(--text3)' }}>
                Seu nível sobe automaticamente conforme você conclui demandas com qualidade, pontualidade e boa avaliação.
                Chegar ao nível ELITE reduz sua comissão para 15% mesmo no plano GRÁTIS.
              </p>
            </div>
            <div>
              <p className="font-bold text-white mb-1">Plano PRO (R$ 79/mês)</p>
              <p style={{ color: 'var(--text3)' }}>
                Reduz a comissão em 2% em todos os níveis. Você aparece com prioridade no feed, tem badge PRO
                e acesso a relatórios avançados. Ideal para quem quer crescer mais rápido.
              </p>
            </div>
            <div>
              <p className="font-bold text-white mb-1">Plano ELITE (R$ 149/mês)</p>
              <p style={{ color: 'var(--text3)' }}>
                Reduz a comissão em 4%. Máxima prioridade no feed, badge ELITE, acesso ao SUEDPrepara
                para treinamento técnico e suporte VIP. Para os melhores da plataforma.
              </p>
            </div>
          </div>
        </div>

      </main>
    </Shell>
  )
}
