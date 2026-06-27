'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { curador as curadorApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { formatDate } from '@/lib/utils'
import { AlertTriangle, CheckCircle2, ClipboardList, Clock, ArrowRight, ShieldCheck, Star } from 'lucide-react'

// Retorna a "temperatura" de urgência baseada nas horas restantes
function urgenciaCor(horasRestantes: number): string {
  if (horasRestantes <= 2)  return 'var(--red)'
  if (horasRestantes <= 6)  return '#FF6B35'   // laranja quente
  if (horasRestantes <= 24) return 'var(--gold)'
  return 'var(--green)'
}

function urgenciaLabel(horasRestantes: number): string {
  if (horasRestantes <= 0)  return 'Vencido'
  if (horasRestantes <= 2)  return `${horasRestantes}h — URGENTE`
  if (horasRestantes <= 24) return `${horasRestantes}h restantes`
  const dias = Math.floor(horasRestantes / 24)
  return `${dias}d restante${dias !== 1 ? 's' : ''}`
}

const TIPO_CONFIG: Record<string, { label: string; cor: string; icon: React.ReactNode }> = {
  QA_REPROVADO:     { label: 'QA Reprovado',       cor: 'rgba(255,77,109,0.15)',    icon: <AlertTriangle size={13} /> },
  DISPUTA:          { label: 'Disputa',             cor: 'rgba(245,166,35,0.15)',    icon: <AlertTriangle size={13} /> },
  DEMANDA_ESPECIAL: { label: 'Demanda Especial',    cor: 'rgba(155,109,255,0.15)',   icon: <Star size={13} /> },
}

export default function CuradorPainelPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()

  const [casos, setCasos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (!['CURADOR_SUPORTE', 'CURADOR_SENIOR', 'ADMIN'].includes(user.tipo)) {
      router.push('/cliente'); return
    }
    curadorApi.fila()
      .then(({ casos }) => setCasos(casos))
      .catch(() => toast('Erro ao carregar fila de casos', 'error'))
      .finally(() => setLoading(false))
  }, [user, authLoading, router, toast])

  if (authLoading || !user) return null

  const agora       = new Date()
  const urgentes    = casos.filter(c => (c.prazo_horas ?? 99) <= 4)
  const porTipo     = (tipo: string) => casos.filter(c => c.tipo === tipo)
  const isSenior    = user.tipo === 'CURADOR_SENIOR' || user.tipo === 'ADMIN'

  // Ordenar casos por urgência (menor prazo primeiro)
  const casosOrdenados = [...casos].sort((a, b) => (a.prazo_horas ?? 99) - (b.prazo_horas ?? 99))

  return (
    <Shell>
      <Topbar
        title="Painel de Curadoria"
        subtitle={`${user.tipo === 'CURADOR_SENIOR' ? 'Curador Sênior' : 'Curador Suporte'} · ${user.nome?.split(' ')[0] || ''}`}
        actions={
          urgentes.length > 0 ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(255,77,109,0.15)', color: 'var(--red)', border: '1px solid rgba(255,77,109,0.35)' }}>
              <AlertTriangle size={12} />
              {urgentes.length} caso{urgentes.length !== 1 ? 's' : ''} urgente{urgentes.length !== 1 ? 's' : ''}
            </div>
          ) : undefined
        }
      />

      <main className="p-6 max-w-5xl space-y-6">

        {/* Métricas de trabalho — SEM dados financeiros */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="kpi-card" style={{ borderColor: casos.length > 0 ? 'rgba(232,103,26,0.3)' : undefined }}>
            <p className="kpi-value" style={{ color: casos.length > 5 ? 'var(--orange)' : 'var(--text)' }}>
              {loading ? '—' : casos.length}
            </p>
            <p className="kpi-label">Na fila agora</p>
          </div>
          <div className="kpi-card" style={{ borderColor: urgentes.length > 0 ? 'rgba(255,77,109,0.3)' : undefined }}>
            <p className="kpi-value" style={{ color: urgentes.length > 0 ? 'var(--red)' : 'var(--text)' }}>
              {loading ? '—' : urgentes.length}
            </p>
            <p className="kpi-label">Prazo ≤ 4h</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-value" style={{ color: 'var(--gold)' }}>
              {loading ? '—' : porTipo('DISPUTA').length}
            </p>
            <p className="kpi-label">Disputas</p>
          </div>
          {isSenior ? (
            <div className="kpi-card" style={{ borderColor: 'rgba(155,109,255,0.3)' }}>
              <p className="kpi-value" style={{ color: 'var(--purple)' }}>
                {loading ? '—' : porTipo('DEMANDA_ESPECIAL').length}
              </p>
              <p className="kpi-label">Especiais (Sênior)</p>
            </div>
          ) : (
            <div className="kpi-card">
              <p className="kpi-value">
                {loading ? '—' : porTipo('QA_REPROVADO').length}
              </p>
              <p className="kpi-label">QA reprovado</p>
            </div>
          )}
        </div>

        {/* Fila direta na tela, ordenada por urgência com borda-termômetro */}
        <div className="card-solid">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ClipboardList size={15} style={{ color: 'var(--orange)' }} />
              <p className="section-label">Fila de trabalho — por urgência</p>
            </div>
            <button
              onClick={() => router.push('/curador/fila')}
              className="text-xs font-semibold hover:underline flex items-center gap-1"
              style={{ color: 'var(--orange)' }}
            >
              Ver fila completa <ArrowRight size={12} />
            </button>
          </div>

          {loading ? (
            <p className="text-sm py-6 text-center" style={{ color: 'var(--text3)' }}>Carregando fila...</p>
          ) : casosOrdenados.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <CheckCircle2 size={32} className="mx-auto" style={{ color: 'var(--green)', opacity: 0.5 }} />
              <p className="text-sm font-semibold text-white">Fila vazia — em dia!</p>
              <p className="text-xs" style={{ color: 'var(--text3)' }}>
                Nenhum caso pendente de revisão no momento.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {casosOrdenados.slice(0, 8).map(caso => {
                const horas  = caso.prazo_horas ?? 99
                const cor    = urgenciaCor(horas)
                const tipoCfg = TIPO_CONFIG[caso.tipo] || { label: caso.tipo, cor: 'rgba(255,255,255,0.06)', icon: null }
                const demanda = caso.demanda

                return (
                  <button
                    key={caso.id}
                    onClick={() => router.push(`/curador/casos/${caso.id}`)}
                    className="w-full text-left rounded-xl overflow-hidden flex transition-all hover:scale-[1.005] group"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    {/* Barra de temperatura/urgência — a assinatura visual */}
                    <div className="w-1 shrink-0 rounded-l-xl" style={{ background: cor }} />

                    <div className="flex-1 px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Tipo + OS */}
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold px-2 py-0.5 rounded"
                              style={{ background: tipoCfg.cor, color: cor }}>
                              {tipoCfg.label}
                            </span>
                            <span className="text-xs font-mono" style={{ color: 'var(--text3)' }}>
                              {demanda?.numero || caso.demanda_id?.slice(0, 8)}
                            </span>
                          </div>
                          {/* Serviço */}
                          <p className="text-sm font-semibold text-white truncate">
                            {demanda?.servico?.nome || demanda?.svc_codigo || 'Serviço'}
                          </p>
                          {/* Local e partes */}
                          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text3)' }}>
                            {demanda?.tipo_imovel} · {demanda?.area_m2}m²
                            {demanda?.cidade ? ` · ${demanda.cidade}/${demanda.estado}` : ''}
                          </p>
                        </div>

                        {/* Prazo + seta */}
                        <div className="shrink-0 flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: cor }}>
                            <Clock size={11} />
                            {urgenciaLabel(horas)}
                          </div>
                          <ArrowRight size={13} className="opacity-40 group-hover:opacity-100 transition-opacity"
                            style={{ color: 'var(--text3)' }} />
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}

              {casosOrdenados.length > 8 && (
                <button
                  onClick={() => router.push('/curador/fila')}
                  className="w-full text-center text-xs py-2.5 rounded-lg font-semibold hover:underline"
                  style={{ color: 'var(--orange)', background: 'rgba(232,103,26,0.07)' }}
                >
                  + {casosOrdenados.length - 8} casos na fila completa →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Escopo do curador — informativo, visível */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card-solid space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={14} style={{ color: 'var(--green)' }} />
              <p className="section-label">Suas responsabilidades</p>
            </div>
            {[
              'Revisar entregáveis de QA antes do cliente ver',
              'Aprovar ou reprovar com feedback técnico claro',
              'Mediar disputas entre cliente e profissional',
              'Aprovar KYC de novos profissionais',
              isSenior ? 'Precificar demandas especiais (áreas acima do padrão)' : null,
            ].filter(Boolean).map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text2)' }}>
                <span style={{ color: 'var(--green)' }}>✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="card-solid space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} style={{ color: 'var(--red)' }} />
              <p className="section-label">Fora do escopo do curador</p>
            </div>
            {[
              'Configurar preços dos SVCs (apenas Admin)',
              'Alterar parâmetros do Motor UTS (apenas Admin)',
              'Ver faturamento ou KPIs financeiros da plataforma',
              'Acessar ferramentas de teste (apenas Admin)',
              !isSenior ? 'Precificar demandas especiais (exclusivo Curador Sênior)' : null,
            ].filter(Boolean).map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text3)' }}>
                <span style={{ color: 'var(--red)' }}>✗</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

      </main>
    </Shell>
  )
}
