'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { svc, sue } from '@/lib/api'
import { formatBRL } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './catalogo.module.css'

const SVC_IMG: Record<string, string> = {
  SVC000: '/imagens/svc000.png',
  SVC001: '/imagens/svc001.png',
  SVC002: '/imagens/svc002.png',
  SVC003: '/imagens/svc003.png',
  SVC004: '/imagens/svc004.png',
  SVC005: '/imagens/svc005.png',
  SVC006: '/imagens/svc006.png',
  SVC007: '/imagens/svc007.png',
  SVC008: '/imagens/svc008.png',
  SVC009: '/imagens/svc009.png',
  SVC010: '/imagens/svc010.png',
  SVC011: '/imagens/svc011.png',
}

const CATEGORIAS = [
  { titulo: 'Diagnóstico e Inspeção',            svcs: ['SVC000', 'SVC001', 'SVC003', 'SVC010'] },
  { titulo: 'Projetos de Engenharia',             svcs: ['SVC004', 'SVC005', 'SVC006', 'SVC007'] },
  { titulo: 'Avaliação, Regularização e Gestão', svcs: ['SVC002', 'SVC008', 'SVC009', 'SVC011'] },
]

function precoDe(s: any): string {
  if (s.tipo_preco === 'HORA') return s.preco_hora ? `${formatBRL(s.preco_hora)}/h` : '—'
  return s.piso ? `a partir de ${formatBRL(s.piso)}` : '—'
}

export default function CatalogoPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [servicos, setServicos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [sugestao, setSugestao] = useState<any>(null)

  const scrollRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    svc.listar()
      .then((d: any) => setServicos(Array.isArray(d) ? d : (d?.servicos || [])))
      .catch(() => toast('Erro ao carregar catálogo', 'error'))
      .finally(() => setLoading(false))
  }, [user, authLoading, router, toast])

  if (authLoading || !user) return null

  // Avança/recua exatamente 1 card (480px + 16px de gap)
  const scrollRow = (rowIdx: number, dir: 'left' | 'right') => {
    scrollRefs.current[rowIdx]?.scrollBy({ left: dir === 'right' ? 496 : -496, behavior: 'smooth' })
  }

  const handleBusca = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busca.trim().length < 10) { toast('Descreva sua necessidade com pelo menos 10 caracteres.', 'error'); return }
    setBuscando(true)
    setSugestao(null)
    try {
      const resultado = await sue.buscarSvc(busca.trim())
      setSugestao(resultado)
    } catch (err: any) {
      toast(err.message || 'Busca indisponível. Escolha o serviço manualmente.', 'error')
    } finally {
      setBuscando(false)
    }
  }

  const svcMap = Object.fromEntries(servicos.map(s => [s.codigo, s]))

  return (
    <Shell>
      <Topbar
        title="Catálogo de serviços"
        subtitle="Use as setas nas laterais de cada fila para navegar"
      />

      <main className="p-6 space-y-8">

        {/* ── Busca semântica com SUE ── */}
        <div className="card-accent">
          <p className="section-label">Não sabe qual serviço escolher?</p>
          <form onSubmit={handleBusca} className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Descreva o que você precisa, ex: preciso de um laudo para regularizar minha casa..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
            <button type="submit" disabled={buscando} className="btn btn-primary">
              {buscando ? 'Buscando...' : 'Buscar com SUE'}
            </button>
          </form>

          {sugestao && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              {sugestao.svc_sugerido ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="badge badge-orange">{sugestao.svc_sugerido}</span>
                    <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{sugestao.svc_nome}</span>
                    {sugestao.confianca != null && (
                      <span className="badge" style={{
                        background: sugestao.confianca >= 0.80 ? 'rgba(22,163,74,0.15)' : sugestao.confianca >= 0.60 ? 'rgba(234,179,8,0.15)' : 'rgba(107,114,128,0.15)',
                        color: sugestao.confianca >= 0.80 ? 'var(--green)' : sugestao.confianca >= 0.60 ? '#ca8a04' : 'var(--text3)',
                      }}>
                        {Math.round(sugestao.confianca * 100)}% de exatidão
                      </span>
                    )}
                  </div>
                  {sugestao.justificativa && <p className="text-xs" style={{ color: 'var(--text3)' }}>{sugestao.justificativa}</p>}
                  {sugestao.alternativa && sugestao.confianca < 0.75 && (
                    <p className="text-xs" style={{ color: 'var(--text3)' }}>
                      Alternativa: <span style={{ color: 'var(--text2)' }}>{sugestao.alternativa}</span>
                    </p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button className="btn btn-primary btn-sm" onClick={() => router.push(`/cliente/nova-demanda?svc=${sugestao.svc_sugerido}`)}>
                      Criar demanda →
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => router.push(`/cliente/catalogo/${sugestao.svc_sugerido}`)}>
                      Ver detalhes
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm" style={{ color: 'var(--text3)' }}>Não foi possível identificar um serviço. Escolha abaixo.</p>
              )}
            </div>
          )}
        </div>

        {/* ── Carrosséis por categoria ── */}
        {loading ? (
          <p className="text-sm py-10 text-center" style={{ color: 'var(--text3)' }}>Carregando catálogo...</p>
        ) : (
          <div className="space-y-10">
            {CATEGORIAS.map((cat, rowIdx) => {
              const items = cat.svcs.map(c => svcMap[c]).filter(Boolean)
              if (items.length === 0) return null
              return (
                <section key={cat.titulo} className={styles.catSection}>

                  {/* Título da categoria */}
                  <div className={styles.catHeader}>
                    <h3 className={styles.catTitle}>{cat.titulo}</h3>
                  </div>

                  {/*
                    Linha: [← seta] [carrossel] [seta →]
                    As setas são colunas fixas no flex — sempre visíveis,
                    sempre ao lado dos cards, sem position:absolute.
                  */}
                  <div className={styles.carouselOuter}>

                    <button
                      className={`${styles.arrowBtn} ${styles.arrowBtnLeft}`}
                      onClick={() => scrollRow(rowIdx, 'left')}
                      aria-label="Voltar"
                    >
                      <ChevronLeft size={22} strokeWidth={2.5} />
                    </button>

                    <div
                      ref={el => { scrollRefs.current[rowIdx] = el }}
                      className={styles.carousel}
                    >
                      {items.map(s => (
                        <button
                          key={s.codigo}
                          className={styles.card}
                          onClick={() => router.push(`/cliente/catalogo/${s.codigo}`)}
                          aria-label={s.nome}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={SVC_IMG[s.codigo] || ''} alt={s.nome} className={styles.img} />
                          <div className={styles.overlay} />
                          <span className={styles.topBadge}>SLA {s.sla_dias}d</span>
                          <div className={styles.cardBody}>
                            <span className={styles.svcCode}>{s.codigo}</span>
                            <p className={styles.cardName}>{s.nome}</p>
                            <span className={styles.cardPrice}>{precoDe(s)}</span>
                          </div>
                          <span className={styles.cardCta}>Contratar →</span>
                        </button>
                      ))}
                    </div>

                    <button
                      className={`${styles.arrowBtn} ${styles.arrowBtnRight}`}
                      onClick={() => scrollRow(rowIdx, 'right')}
                      aria-label="Avançar"
                    >
                      <ChevronRight size={22} strokeWidth={2.5} />
                    </button>

                  </div>

                </section>
              )
            })}
          </div>
        )}
      </main>
    </Shell>
  )
}
