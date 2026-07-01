'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { notificacoes as notifApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import {
  ShieldCheck, UserCheck, Wallet, ClipboardList, Settings,
  Bell, AlertTriangle, CheckCircle2, Info, XCircle, ExternalLink,
} from 'lucide-react'

type Categoria = 'TODAS' | 'SEGURANCA' | 'CADASTRO' | 'FINANCEIRO' | 'DEMANDA' | 'SISTEMA'

const CAT_CONFIG: Record<Categoria, { label: string; icon: React.FC<any>; color: string; bg: string }> = {
  TODAS:     { label: 'Todas',      icon: Bell,          color: 'var(--text2)',  bg: 'rgba(255,255,255,0.06)' },
  SEGURANCA: { label: 'Segurança',  icon: ShieldCheck,   color: '#60a5fa',       bg: 'rgba(96,165,250,0.10)' },
  CADASTRO:  { label: 'Cadastro',   icon: UserCheck,     color: 'var(--purple)', bg: 'rgba(155,109,255,0.10)' },
  FINANCEIRO:{ label: 'Financeiro', icon: Wallet,        color: 'var(--green)',  bg: 'rgba(0,214,143,0.10)' },
  DEMANDA:   { label: 'Demandas',   icon: ClipboardList, color: 'var(--orange)', bg: 'rgba(232,103,26,0.10)' },
  SISTEMA:   { label: 'Sistema',    icon: Settings,      color: 'var(--text3)',  bg: 'rgba(255,255,255,0.04)' },
}

const TIPO_ICON: Record<string, React.FC<any>> = {
  SUCESSO: CheckCircle2,
  ALERTA:  AlertTriangle,
  ERRO:    XCircle,
  INFO:    Info,
}
const TIPO_COLOR: Record<string, string> = {
  SUCESSO: 'var(--green)',
  ALERTA:  'var(--gold)',
  ERRO:    'var(--red)',
  INFO:    'var(--text3)',
}

function getRolePrefix(user: any): string {
  if (user?.profissional)                                         return 'profissional'
  if (user?.role === 'CLIENTE' || user?.cliente)                  return 'cliente'
  if (['CURADOR_SUPORTE', 'CURADOR_SENIOR'].includes(user?.role)) return 'curador'
  if (['ADMIN', 'MODERADOR'].includes(user?.role))                return 'admin'
  return 'profissional'
}

export default function NotificacoesPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()

  const [itens, setItens]       = useState<any[]>([])
  const [naoLidas, setNaoLidas] = useState(0)
  const [loading, setLoading]   = useState(true)
  const [catAtiva, setCatAtiva] = useState<Categoria>('TODAS')
  const [marcando, setMarcando] = useState(false)

  const carregar = (cat?: Categoria) => {
    setLoading(true)
    const params = cat && cat !== 'TODAS' ? { categoria: cat } : {}
    notifApi.listar(params)
      .then(d => { setItens(d.notificacoes || []); setNaoLidas(d.nao_lidas || 0) })
      .catch(() => toast('Erro ao carregar notificações', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    carregar(catAtiva)
  }, [user, authLoading])

  const trocarCategoria = (cat: Categoria) => {
    setCatAtiva(cat)
    carregar(cat)
  }

  const marcarTodasLidas = async () => {
    setMarcando(true)
    try {
      await notifApi.marcarLidas()
      setItens(prev => prev.map(n => ({ ...n, lida: true })))
      setNaoLidas(0)
      toast('Todas marcadas como lidas', 'success')
    } catch { toast('Erro ao marcar como lidas', 'error') }
    finally { setMarcando(false) }
  }

  const clicar = async (n: any) => {
    if (!user) return
    // Marca como lida antes de navegar
    if (!n.lida) {
      notifApi.marcarLida(n.id).catch(() => {})
      setItens(prev => prev.map(x => x.id === n.id ? { ...x, lida: true } : x))
      setNaoLidas(prev => Math.max(0, prev - 1))
    }
    // Navega para destino contextual
    const role = getRolePrefix(user)
    if (n.demanda_id) {
      router.push(`/${role}/demandas/${n.demanda_id}`)
      return
    }
    switch (n.categoria) {
      case 'FINANCEIRO': router.push(`/${role}/financeiro`); break
      case 'CADASTRO':   router.push(role === 'profissional' ? '/profissional/perfil' : '/cliente/perfil'); break
    }
  }

  if (authLoading || !user) return null

  const CATEGORIAS: Categoria[] = ['TODAS', 'SEGURANCA', 'CADASTRO', 'FINANCEIRO', 'DEMANDA', 'SISTEMA']

  return (
    <Shell>
      <Topbar
        title="Notificações"
        subtitle={naoLidas > 0 ? `${naoLidas} não lida${naoLidas !== 1 ? 's' : ''}` : 'Em dia'}
        actions={
          naoLidas > 0 ? (
            <button onClick={marcarTodasLidas} disabled={marcando} className="btn btn-secondary btn-sm">
              {marcando ? '...' : 'Marcar todas como lidas'}
            </button>
          ) : undefined
        }
      />

      <main className="p-6 max-w-2xl space-y-4">

        {/* Filtros por categoria */}
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIAS.map(cat => {
            const cfg  = CAT_CONFIG[cat]
            const Icon = cfg.icon
            const ativa = catAtiva === cat
            return (
              <button
                key={cat}
                onClick={() => trocarCategoria(cat)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
                style={{
                  background: ativa ? cfg.bg : 'rgba(255,255,255,0.04)',
                  color:      ativa ? cfg.color : 'var(--text3)',
                  border:     `1px solid ${ativa ? cfg.color + '40' : 'rgba(255,255,255,0.07)'}`,
                }}
              >
                <Icon size={13} />
                {cfg.label}
              </button>
            )
          })}
        </div>

        {/* Lista */}
        {loading ? (
          <p className="text-sm py-10 text-center" style={{ color: 'var(--text3)' }}>Carregando...</p>
        ) : itens.length === 0 ? (
          <div className="card-solid text-center py-12 space-y-2">
            <Bell size={32} className="mx-auto opacity-30" />
            <p className="text-sm" style={{ color: 'var(--text3)' }}>
              {catAtiva === 'TODAS'
                ? 'Você não tem notificações.'
                : `Nenhuma notificação de ${CAT_CONFIG[catAtiva].label.toLowerCase()}.`}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {itens.map(n => {
              const catCfg  = CAT_CONFIG[(n.categoria || 'SISTEMA') as Categoria] || CAT_CONFIG.SISTEMA
              const TipoIco = TIPO_ICON[n.tipo] || Info
              const tipoCor = TIPO_COLOR[n.tipo] || 'var(--text3)'
              const CatIco  = catCfg.icon
              const isLida  = n.lida
              const temAcao = !!n.demanda_id || ['FINANCEIRO', 'CADASTRO'].includes(n.categoria)

              return (
                <div
                  key={n.id}
                  onClick={() => clicar(n)}
                  className="rounded-xl p-4 flex gap-3 items-start transition-all"
                  style={{
                    background: isLida ? 'rgba(255,255,255,0.03)' : catCfg.bg,
                    border:     `1px solid ${isLida ? 'rgba(255,255,255,0.06)' : catCfg.color + '30'}`,
                    borderLeft: isLida ? `3px solid transparent` : `3px solid ${catCfg.color}`,
                    cursor:     temAcao ? 'pointer' : 'default',
                    opacity:    isLida ? 0.8 : 1,
                  }}
                  onMouseEnter={e => { if (temAcao) e.currentTarget.style.background = catCfg.bg }}
                  onMouseLeave={e => { e.currentTarget.style.background = isLida ? 'rgba(255,255,255,0.03)' : catCfg.bg }}
                >
                  {/* Ícone de categoria */}
                  <div
                    className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: catCfg.bg, color: catCfg.color }}
                  >
                    <CatIco size={16} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Título + ícone tipo + badge não-lida */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-bold text-sm text-white leading-snug">{n.titulo}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        {!isLida && (
                          <span className="w-2 h-2 rounded-full" style={{ background: catCfg.color }} />
                        )}
                        <TipoIco size={13} style={{ color: tipoCor }} />
                      </div>
                    </div>

                    {/* Corpo — texto completo */}
                    {n.corpo && (
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{n.corpo}</p>
                    )}

                    {/* Rodapé: categoria + data + CTA */}
                    <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-2xs px-1.5 py-0.5 rounded font-bold uppercase"
                          style={{ background: catCfg.bg, color: catCfg.color }}
                        >
                          {catCfg.label}
                        </span>
                        <span className="text-2xs" style={{ color: 'var(--text3)' }}>
                          {n.created_at
                            ? new Date(n.created_at).toLocaleString('pt-BR', {
                                day: '2-digit', month: 'short',
                                hour: '2-digit', minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>

                      {n.demanda_id && (
                        <span
                          className="flex items-center gap-1 text-xs font-bold"
                          style={{ color: catCfg.color }}
                        >
                          Ver demanda <ExternalLink size={11} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </Shell>
  )
}
