'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { tokenStorage, userStorage, svc as svcApi } from '@/lib/api'
import { Logo } from '@/components/ui/Logo'
import { SueChatPublica } from '@/components/ui/SueChatPublica'
import './landing.css'

type Audience = 'cliente' | 'profissional'
type SvcFilter = 'all' | 'res' | 'com' | 'ind'

const COPY = {
  cliente: {
    navCta: 'Solicitar serviço',
    heroTitle: <>Encontre o profissional certo para o seu <span className="lp-highlight">imóvel</span>, sem complicação.</>,
    heroLede: 'Laudos, vistorias, projetos e regularizações com profissionais verificados, orçamento automático e pagamento protegido até a entrega.',
    heroCtaPrimary: 'Solicitar diagnóstico grátis',
    heroCtaSecondary: 'Ver serviços disponíveis',
    flowTitle: 'Da solicitação ao laudo assinado',
    flowLede: 'Você acompanha cada etapa em tempo real, do orçamento ao pagamento liberado.',
    svcTitle: 'Tudo que o seu imóvel precisa, em um só lugar',
    svcLede: 'Do diagnóstico inicial ao projeto executivo — cada serviço já vem com escopo, checklist de QA e ART/RRT definidos.',
    trustTitle: 'Confiança técnica, financeira e jurídica',
    trustLede: 'Cada demanda é protegida em três frentes — para o cliente e para o profissional.',
    testiTitle: 'O que dizem nossos clientes',
    ctaTitle: 'Pronto para resolver a pendência técnica do seu imóvel?',
    ctaLede: 'Cadastre-se em poucos minutos e receba seu primeiro orçamento sem compromisso.',
    ctaPrimary: 'Criar conta gratuita',
    ctaSecondary: 'Falar com a SUE',
    registerHref: '/auth/cadastro?tipo=CLIENTE',
  },
  profissional: {
    navCta: 'Cadastrar como profissional',
    heroTitle: <>Receba demandas qualificadas e <span className="lp-highlight">suba de nível</span> com suas entregas.</>,
    heroLede: 'Trabalhe com escopo, checklist de QA e ART/RRT já definidos — e veja sua comissão cair conforme seu SQP sobe.',
    heroCtaPrimary: 'Cadastrar como profissional',
    heroCtaSecondary: 'Entender o Score SQP',
    flowTitle: 'Do aceite à liberação do pagamento',
    flowLede: 'Cada demanda tem escopo, prazo e valor calculados automaticamente — sem negociação, só execução.',
    svcTitle: 'Serviços que você pode executar na plataforma',
    svcLede: 'Cada SVC tem escopo técnico, checklist de QA e ART/RRT já mapeados — você chega, executa e entrega.',
    trustTitle: 'Por que profissionais confiam na SUEDFLOW',
    trustLede: 'Você entrega o serviço, nós garantimos o pagamento, a credibilidade e o crescimento.',
    testiTitle: 'O que dizem os profissionais',
    ctaTitle: 'Pronto para receber demandas e subir de nível?',
    ctaLede: 'Cadastre seu CREA/CAU e comece a receber demandas compatíveis com sua especialidade.',
    ctaPrimary: 'Criar cadastro profissional',
    ctaSecondary: 'Entender o Score SQP',
    registerHref: '/auth/cadastro?tipo=PROFISSIONAL',
  },
} as const

const SVCS = [
  { code: 'SVC000', name: 'Consultoria de Engenharia',       desc: 'Diagnóstico inicial com SUE para identificar o serviço técnico ideal para o seu caso.', cat: ['all','res','com','ind'], icon: <path d="M9 18l-5-5 5-5M15 6l5 5-5 5"/> },
  { code: 'SVC001', name: 'Laudo Técnico / Vistoria Cautelar', desc: 'Registro detalhado das condições do imóvel antes de obras ou locações.', cat: ['all','res','com','ind'], icon: <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></> },
  { code: 'SVC002', name: 'Avaliação Mercadológica NBR 14653', desc: 'Valor de mercado do imóvel com metodologia normativa reconhecida.', cat: ['all','res','com','ind'], icon: <><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-6"/></> },
  { code: 'SVC003', name: 'Inspeção Predial NBR 16.747',      desc: 'Checklist normativo de manutenção predial e prazos de manutenção.', cat: ['all','res','com'], icon: <><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></> },
  { code: 'SVC004', name: 'Projeto Arquitetônico',            desc: 'Planta e memorial para construção, reforma ou ampliação.', cat: ['all','res','com'], icon: <><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></> },
  { code: 'SVC005', name: 'Projeto Estrutural NBR 6118',      desc: 'Dimensionamento estrutural completo para execução segura.', cat: ['all','res','com','ind'], icon: <><path d="M4 21V8l8-5 8 5v13"/><path d="M9 21v-7h6v7M4 14h16"/></> },
  { code: 'SVC006', name: 'Projeto Elétrico NBR 5410',        desc: 'Dimensionamento de circuitos, quadros e proteção elétrica.', cat: ['all','res','com','ind'], icon: <path d="M13 2L3 14h7l-1 8 10-12h-7z"/> },
  { code: 'SVC007', name: 'Projeto Hidrossanitário',          desc: 'Redes de água, esgoto e drenagem dimensionadas conforme norma.', cat: ['all','res','com','ind'], icon: <path d="M12 2v6M12 22v-6M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M16 12h6M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24"/> },
  { code: 'SVC008', name: 'Regularização de Imóvel',          desc: 'Documentação técnica para averbação e regularização junto à prefeitura.', cat: ['all','res','com'], icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 15l2 2 4-4"/></> },
  { code: 'SVC009', name: 'Gerenciamento de Obras / SINAPI',  desc: 'Acompanhamento de execução com referência de custos SINAPI.', cat: ['all','com','ind'], icon: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></> },
  { code: 'SVC010', name: 'Perícia Judicial',                 desc: 'Laudo técnico-pericial para processos judiciais e arbitragens.', cat: ['all','res','com','ind'], icon: <><path d="M12 3v18M5 8l7-5 7 5M5 8v9a2 2 0 0 0 2 2h2M19 8v9a2 2 0 0 1-2 2h-2"/></> },
  { code: 'SVC011', name: 'Due Diligence Técnica',            desc: 'Análise completa de riscos técnicos antes da compra de um imóvel.', cat: ['all','com','ind'], icon: <path d="M11 4a8 8 0 1 0 5.3 14L21 22"/> },
]

const TIERS = [
  { rank: 'Nível 1', name: 'Candidato', comm: 22, pts: '0–199 pontos',   bar: 20 },
  { rank: 'Nível 2', name: 'Júnior',    comm: 21, pts: '200–399 pontos', bar: 40 },
  { rank: 'Nível 3', name: 'Pleno',     comm: 19, pts: '400–699 pontos', bar: 60 },
  { rank: 'Nível 4', name: 'Sênior',    comm: 17, pts: '700–899 pontos', bar: 80 },
  { rank: 'Nível 5', name: 'Elite',     comm: 15, pts: '900+ pontos',    bar: 100, elite: true },
]

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  )
}
function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 5l7 7-7 7"/>
    </svg>
  )
}

export default function LandingPage() {
  const router = useRouter()
  const [audience, setAudience] = useState<Audience>('cliente')
  const [svcFilter, setSvcFilter] = useState<SvcFilter>('all')
  const [openSue, setOpenSue] = useState(false)
  const [depoimentos, setDepoimentos] = useState<any[]>([])
  const revealRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const token = tokenStorage.get()
    const user = userStorage.get()
    if (token && user) {
      const map: Record<string, string> = {
        ADMIN: '/admin', MODERADOR: '/admin',
        PROFISSIONAL: '/profissional',
        CURADOR_SUPORTE: '/curador', CURADOR_SENIOR: '/curador',
        CLIENTE: '/cliente',
      }
      router.push(map[user.tipo] ?? '/cliente')
    }
  }, [router])

  const setupReveal = useCallback(() => {
    const els = document.querySelectorAll('.reveal, .reveal-stagger')
    if (!els.length) return
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in')
          io.unobserve(e.target)
        }
      })
    }, { threshold: 0.10 })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const cleanup = setupReveal()
    return cleanup
  }, [setupReveal, audience])

  // Buscar depoimentos reais da API ao montar o componente
  useEffect(() => {
    svcApi.depoimentos().then(r => { if (r.depoimentos?.length) setDepoimentos(r.depoimentos) }).catch(() => {})
  }, [])

  const c = COPY[audience]
  const visibleSvcs = SVCS.filter(s => s.cat.includes(svcFilter))

  return (
    <div className="landing-page" ref={revealRef}>

      {/* ═══ NAV ═══ */}
      <div className="lp-nav">
        <div className="lp-nav-inner">
          <Link href="/" aria-label="SUEDFLOW">
            <Logo height={46} />
          </Link>

          <nav className="lp-nav-links">
            <a href="#como-funciona">Como funciona</a>
            <a href="#servicos">Serviços</a>
            <a href="#confianca">Segurança</a>
          </nav>

          <div className="lp-nav-actions">
            <div className="lp-aud-toggle">
              <button className={audience === 'cliente' ? 'active' : ''} onClick={() => setAudience('cliente')}>
                Sou cliente
              </button>
              <button className={audience === 'profissional' ? 'active' : ''} onClick={() => setAudience('profissional')}>
                Sou profissional
              </button>
            </div>
            <Link href="/auth/login" className="lp-btn lp-btn-ghost">Entrar</Link>
            <Link href={c.registerHref} className="lp-btn lp-btn-primary">{c.navCta}</Link>
          </div>
        </div>
      </div>

      {/* ═══ HERO ═══ */}
      <section className="lp-hero">
        <div className="lp-hero-bg">
          <div className="lp-blob lp-blob-1" />
          <div className="lp-blob lp-blob-2" />
        </div>
        <div className="lp-wrap lp-hero-grid">

          {/* coluna texto */}
          <div>
            <div className="lp-eyebrow">
              <span className="dot" />
              Engenharia &amp; Arquitetura sob demanda
            </div>
            <h1 className="lp-hero-title">{c.heroTitle}</h1>
            <p className="lp-lede">{c.heroLede}</p>
            <div className="lp-hero-ctas">
              <Link href={c.registerHref} className="lp-btn lp-btn-primary lp-btn-lg">
                {c.heroCtaPrimary}
                <ArrowIcon />
              </Link>
              <a href="#servicos" className="lp-btn lp-btn-outline lp-btn-lg">
                {c.heroCtaSecondary}
              </a>
            </div>

            <div className="lp-trust-row">
              {audience === 'cliente' ? (
                <>
                  <div className="item"><CheckIcon />Pagamento em escrow</div>
                  <div className="item"><CheckIcon />ART/RRT inclusa</div>
                  <div className="item"><CheckIcon />Profissionais com CREA/CAU</div>
                </>
              ) : (
                <>
                  <div className="item"><CheckIcon />Demandas com escopo pronto</div>
                  <div className="item"><CheckIcon />Pagamento garantido</div>
                  <div className="item"><CheckIcon />Score SQP = menor comissão</div>
                </>
              )}
            </div>
          </div>

          {/* coluna visual — painel de demanda ao vivo */}
          <div className="lp-hero-visual">

            {/* ── Dashboard ao vivo — v2 ── */}
            <div className="lp-dash">

              {/* Topo: título + dot ao vivo */}
              <div className="lp-dash-top">
                <div className="lp-dash-brand">
                  <span className="lp-dash-brand-name">SUEDFLOW</span>
                  <span className="lp-dash-live"><span className="lp-lc-dot" />Ao vivo</span>
                </div>
                <span className="lp-lc-os">SF-2026-0019</span>
              </div>

              {/* KPIs coloridos */}
              <div className="lp-dash-kpis">
                <div className="lp-dash-kpi lp-kpi-orange">
                  <span className="lp-kpi-num">47</span>
                  <span className="lp-kpi-lbl">Demandas<br/>ativas</span>
                </div>
                <div className="lp-dash-kpi lp-kpi-green">
                  <span className="lp-kpi-num">12</span>
                  <span className="lp-kpi-lbl">Concluídas<br/>este mês</span>
                </div>
                <div className="lp-dash-kpi lp-kpi-purple">
                  <span className="lp-kpi-num">842</span>
                  <span className="lp-kpi-lbl">Score SQP<br/>· Pleno</span>
                </div>
              </div>

              {/* Demanda em andamento */}
              <div className="lp-dash-demand">
                <div className="lp-dd-header">
                  <span className="lp-dd-svc">Avaliação Mercadológica NBR 14653</span>
                  <span className="lp-dd-badge-exec">● EM EXECUÇÃO</span>
                </div>
                <div className="lp-dd-meta">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{width:11,height:11,flexShrink:0}}>
                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  120m² · Tambaú, João Pessoa/PB
                </div>

                {/* Status pills */}
                <div className="lp-dd-pills">
                  <span className="lp-pill lp-pill-done">✓ Aceite</span>
                  <span className="lp-pill-arrow">→</span>
                  <span className="lp-pill lp-pill-done">✓ Pago</span>
                  <span className="lp-pill-arrow">→</span>
                  <span className="lp-pill lp-pill-active">⬤ Execução</span>
                  <span className="lp-pill-arrow">→</span>
                  <span className="lp-pill lp-pill-pending">QA</span>
                </div>

                {/* Profissional + Escrow */}
                <div className="lp-dd-row">
                  <div className="lp-dd-prof">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}>
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span>CREA-PB 28.471</span>
                    <span className="lp-dd-check">✓ ativo</span>
                  </div>
                  <div className="lp-dd-escrow">
                    <span className="lp-dd-escrow-lbl">escrow</span>
                    <span className="lp-dd-escrow-val">R$ 1.620</span>
                  </div>
                </div>
              </div>

              {/* Feed de atividade recente */}
              <div className="lp-dash-feed">
                <div className="lp-feed-item lp-feed-green">
                  <span className="lp-feed-dot" style={{background:'#00D68F'}} />
                  <span>Laudo SF-0017 aprovado pelo curador</span>
                  <span className="lp-feed-time">2 min</span>
                </div>
                <div className="lp-feed-item lp-feed-orange">
                  <span className="lp-feed-dot" style={{background:'#E8671A'}} />
                  <span>R$ 2.340 liberados para Carlos M.</span>
                  <span className="lp-feed-time">8 min</span>
                </div>
                <div className="lp-feed-item lp-feed-purple">
                  <span className="lp-feed-dot" style={{background:'#9B6DFF'}} />
                  <span>KYC aprovado · CREA-PB 31.205</span>
                  <span className="lp-feed-time">15 min</span>
                </div>
              </div>

              {/* Rodapé */}
              <div className="lp-dash-footer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{width:11,height:11}}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                ART/RRT obrigatória · escrow protegido · curadoria de qualidade
              </div>
            </div>

            {/* Chips flutuantes mantidos */}
            <div className="lp-float-chip lp-chip-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/>
              </svg>
              Laudo aprovado
            </div>
            <div className="lp-float-chip lp-chip-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/>
              </svg>
              Pagamento liberado em 1 clique
            </div>
            {audience === 'profissional' && (
              <div className="lp-float-chip lp-chip-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3 6 6 1-4.5 4.5L17.5 20 12 17l-5.5 3 1-6.5L3 9l6-1z"/>
                </svg>
                SQP 842 · Pleno
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══ SHOWCASE — imagem em tamanho real ═══ */}
      <section className="lp-showcase">
        <div className="lp-wrap">
          <div className="lp-showcase-head reveal">
            <div className="lp-kicker">A plataforma em ação</div>
            <h2>Tudo o que você precisa, em uma tela.</h2>
            <p style={{ color: 'var(--lp-muted)', maxWidth: 480, margin: '0 auto' }}>
              Da criação da demanda à confirmação do pagamento — acompanhe em tempo real, no computador ou celular.
            </p>
          </div>
          <div className="lp-showcase-frame reveal">
            <div className="lp-showcase-glow" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/marketing-hero.png"
              alt="Interface SUEDFLOW — tela de demanda ativa com check-in, marcos e chat"
              className="lp-showcase-img"
            />
            {/* Callouts flutuantes apontando para features */}
            <div className="lp-sc-callout lp-sc-c1">
              <span className="lp-sc-dot" />
              <span className="lp-sc-label">Score SQP em tempo real</span>
            </div>
            <div className="lp-sc-callout lp-sc-c2">
              <span className="lp-sc-dot" />
              <span className="lp-sc-label">Pagamento em escrow</span>
            </div>
            <div className="lp-sc-callout lp-sc-c3">
              <span className="lp-sc-dot" />
              <span className="lp-sc-label">Chat com o profissional</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <div className="lp-stats">
        <div className="lp-wrap lp-stats-grid reveal-stagger">
          <div><div className="num"><span>12</span></div><div className="lbl">Serviços técnicos no catálogo</div></div>
          <div><div className="num">5</div><div className="lbl">Níveis de qualificação SQP</div></div>
          <div><div className="num">100%</div><div className="lbl">Demandas com ART/RRT</div></div>
          <div><div className="num">João Pessoa/PB</div><div className="lbl">Fase de validação 2026</div></div>
        </div>
      </div>

      {/* ═══ SERVIÇOS ═══ */}
      <section className="lp-section-pad" id="servicos">
        <div className="lp-wrap">
          <div className="lp-section-head reveal">
            <div className="lp-kicker">Catálogo de serviços</div>
            <h2>{c.svcTitle}</h2>
            <p>{c.svcLede}</p>
          </div>

          <div className="lp-tabs">
            {([['all','Todos'],['res','Residencial'],['com','Comercial'],['ind','Industrial']] as const).map(([key, label]) => (
              <button key={key} className={`lp-tab${svcFilter === key ? ' active' : ''}`} onClick={() => setSvcFilter(key)}>
                {key === 'res' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 10l9-7 9 7v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/></svg>}
                {key === 'com' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 9h1M14 9h1M9 13h1M14 13h1M9 17h1M14 17h1"/></svg>}
                {key === 'ind' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h20M4 20V10l4 3V10l4 3V10l4 3V6l4 3v11"/></svg>}
                {label}
              </button>
            ))}
          </div>

          <div className="lp-services-grid reveal-stagger">
            {visibleSvcs.map(svc => (
              <div key={svc.code} className="lp-svc-card" onClick={() => router.push(c.registerHref)}>
                <div className="lp-svc-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    {svc.icon}
                  </svg>
                </div>
                <div className="lp-svc-arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7M7 7h10v10"/>
                  </svg>
                </div>
                <div className="lp-svc-code">{svc.code}</div>
                <div className="lp-svc-name">{svc.name}</div>
                <div className="lp-svc-desc">{svc.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COMO FUNCIONA ═══ */}
      <section className="lp-section-pad lp-section-alt" id="como-funciona">
        <div className="lp-wrap">
          <div className="lp-section-head reveal">
            <div className="lp-kicker">Como funciona</div>
            <h2>{c.flowTitle}</h2>
            <p>{c.flowLede}</p>
          </div>

          <div className="lp-flow">
            <div className="lp-flow-line" />
            <div className="lp-flow-grid reveal-stagger">
              {audience === 'cliente' ? (
                <>
                  <div className="lp-flow-step"><div className="lp-flow-num">1</div><h3>Descreva a necessidade</h3><p>Converse com a SUE e receba o serviço técnico ideal indicado para o seu caso.</p></div>
                  <div className="lp-flow-step"><div className="lp-flow-num">2</div><h3>Receba o orçamento</h3><p>Preço calculado automaticamente pela área, complexidade e urgência do imóvel.</p></div>
                  <div className="lp-flow-step"><div className="lp-flow-num">3</div><h3>Pague com segurança</h3><p>Valor retido em escrow até a aprovação do serviço executado.</p></div>
                  <div className="lp-flow-step"><div className="lp-flow-num">4</div><h3>Acompanhe a execução</h3><p>Chat direto com o profissional e atualizações de status em tempo real.</p></div>
                  <div className="lp-flow-step"><div className="lp-flow-num">5</div><h3>Receba o laudo</h3><p>PDF entregue com ART/RRT vinculada, pronto para uso oficial e registros.</p></div>
                </>
              ) : (
                <>
                  <div className="lp-flow-step"><div className="lp-flow-num">1</div><h3>Cadastre CREA ou CAU</h3><p>Informe seu conselho, UF e especializações. Validação automática em tempo real.</p></div>
                  <div className="lp-flow-step"><div className="lp-flow-num">2</div><h3>Receba demandas qualificadas</h3><p>Demandas compatíveis com sua área chegam no feed com escopo e valor já definidos.</p></div>
                  <div className="lp-flow-step"><div className="lp-flow-num">3</div><h3>Faça check-in GPS no local</h3><p>Registre o marco de chegada via geolocalização — a ART/RRT é vinculada automaticamente.</p></div>
                  <div className="lp-flow-step"><div className="lp-flow-num">4</div><h3>Entregue com ART/RRT</h3><p>Envie o PDF do entregável. A SUE verifica conformidade antes do cliente aprovar.</p></div>
                  <div className="lp-flow-step"><div className="lp-flow-num">5</div><h3>Saque seu pagamento</h3><p>Valor líquido disponível no saldo após aprovação. Saque via PIX com NF-e automática.</p></div>
                </>
              )}
            </div>
          </div>

          <div className="lp-section-foot">
            <Link href={c.registerHref} className="lp-section-link">
              {audience === 'cliente' ? 'Ver guia completo de como funciona' : 'Ver fluxo completo do profissional'}
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ TIERS (apenas profissional) ═══ */}
      {audience === 'profissional' && (
        <section id="tiers" className="lp-section-pad">
          <div className="lp-wrap">
            <div className="lp-tiers-wrap reveal">
              <div className="lp-tiers-head">
                <div className="lp-kicker">Score de Qualificação Profissional</div>
                <h2>Quanto mais você entrega, menor a comissão.</h2>
                <p>O SQP avalia seus últimos 90 dias — prazo, qualidade e satisfação do cliente — e ajusta sua comissão automaticamente. Suba de nível entregando consistência.</p>
              </div>
              <div className="lp-tiers-grid">
                {TIERS.map(t => (
                  <div key={t.rank} className={`lp-tier-card${t.elite ? ' elite' : ''}`}>
                    <div className="lp-tier-rank">{t.rank}</div>
                    <div className="lp-tier-name">{t.name}</div>
                    <div className="lp-tier-comm"><b>{t.comm}%</b> comissão</div>
                    <div className="lp-tier-pts">{t.pts}</div>
                    <div className="lp-tier-bar"><i style={{ width: `${t.bar}%` }} /></div>
                  </div>
                ))}
              </div>
              <div className="lp-section-foot">
                <Link href="/auth/cadastro?tipo=PROFISSIONAL" className="lp-section-link" style={{ color: '#FF8A3D' }}>
                  Ver como o SQP é calculado <ArrowIcon />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══ CONFIANÇA ═══ */}
      <section className="lp-section-pad" id="confianca">
        <div className="lp-wrap">
          <div className="lp-section-head reveal">
            <div className="lp-kicker">Segurança da operação</div>
            <h2>{c.trustTitle}</h2>
            <p>{c.trustLede}</p>
          </div>

          {audience === 'cliente' ? (
            <div className="lp-trust-grid reveal-stagger">
              <div className="lp-trust-card">
                <div className="lp-trust-icon t1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
                </div>
                <h3>Pagamento em escrow</h3>
                <p>O valor é retido em custódia (escrow) pela plataforma e só é liberado ao profissional após você confirmar o recebimento do serviço.</p>
              </div>
              <div className="lp-trust-card">
                <div className="lp-trust-icon t2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                </div>
                <h3>ART/RRT em toda demanda</h3>
                <p>Todo entregável técnico inclui Anotação ou Registro de Responsabilidade Técnica vinculado ao CREA/CAU do profissional.</p>
              </div>
              <div className="lp-trust-card">
                <div className="lp-trust-icon t3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                </div>
                <h3>Diagnóstico assistido pela SUE</h3>
                <p>A SUE entende sua necessidade em linguagem natural e direciona para o serviço técnico correto antes do orçamento.</p>
              </div>
            </div>
          ) : (
            <div className="lp-trust-grid reveal-stagger">
              <div className="lp-trust-card">
                <div className="lp-trust-icon t1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
                </div>
                <h3>Sem inadimplência</h3>
                <p>O valor fica em escrow antes de você iniciar o serviço. Entregou, foi aprovado — o dinheiro vai para o seu saldo. Zero risco de calote.</p>
              </div>
              <div className="lp-trust-card">
                <div className="lp-trust-icon t2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                </div>
                <h3>Credencial CREA/CAU validada</h3>
                <p>A plataforma valida seu registro profissional antes de você aparecer no feed. Clientes sabem que estão contratando alguém certificado.</p>
              </div>
              <div className="lp-trust-card">
                <div className="lp-trust-icon t3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-6"/></svg>
                </div>
                <h3>Score SQP = mais lucro</h3>
                <p>Cada entrega bem-avaliada sobe seu Score. Em poucos meses você pode reduzir a comissão de 22% para 15% — sem negociar, automaticamente.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══ DEPOIMENTOS ═══ */}
      <section className="lp-section-pad lp-section-alt">
        <div className="lp-wrap">
          <div className="lp-section-head reveal">
            <div className="lp-kicker">Quem já usou</div>
            <h2>{c.testiTitle}</h2>
            {depoimentos.length > 0 && (
              <p style={{ color: 'var(--lp-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                Avaliações reais de usuários verificados · atualizadas automaticamente após cada demanda concluída
              </p>
            )}
          </div>

          {/* Depoimentos REAIS da API — substituem os simulados quando disponíveis */}
          {depoimentos.length > 0 ? (
            <div className="lp-testi-grid reveal-stagger">
              {depoimentos.slice(0, 3).map((d, i) => {
                const cores = [
                  'linear-gradient(135deg,#E8671A,#FF8A3D)',
                  'linear-gradient(135deg,#2C6FB0,#5A9BD8)',
                  'linear-gradient(135deg,#059669,#34D399)',
                  'linear-gradient(135deg,#7C3AED,#A78BFA)',
                  'linear-gradient(135deg,#0E7490,#22D3EE)',
                  'linear-gradient(135deg,#1C4663,#0E2A3D)',
                ]
                return (
                  <div key={d.id} className="lp-testi-card">
                    <div className="lp-testi-stars">{'★'.repeat(Math.round(d.nota))}{'☆'.repeat(5 - Math.round(d.nota))}</div>
                    <p>"{d.comentario}"</p>
                    <div className="lp-testi-who">
                      <div className="lp-avatar" style={{ background: cores[i % cores.length] }}>{d.iniciais}</div>
                      <div>
                        <div className="name">{d.nome_cliente}</div>
                        <div className="role">{d.svc_nome}{d.cidade ? ` · ${d.cidade}/${d.estado}` : ''}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : audience === 'cliente' ? (
            <div className="lp-testi-grid reveal-stagger">
              <div className="lp-testi-card">
                <div className="lp-testi-stars">★★★★★</div>
                <p>"Pedi uma inspeção predial e em dois dias já tinha o laudo com ART. O pagamento só saiu da minha conta depois que aprovei o relatório — exatamente como deveria ser."</p>
                <div className="lp-testi-who">
                  <div className="lp-avatar" style={{ background: 'linear-gradient(135deg,#E8671A,#FF8A3D)' }}>MC</div>
                  <div><div className="name">Marina C.</div><div className="role">Síndica · João Pessoa/PB</div></div>
                </div>
              </div>
              <div className="lp-testi-card">
                <div className="lp-testi-stars">★★★★★</div>
                <p>"A SUE sugeriu o serviço certo, o orçamento veio na hora e em 5 dias recebi o projeto assinado com ART. Zero complicação."</p>
                <div className="lp-testi-who">
                  <div className="lp-avatar" style={{ background: 'linear-gradient(135deg,#2C6FB0,#5A9BD8)' }}>JL</div>
                  <div><div className="name">João L.</div><div className="role">Proprietário · Campina Grande/PB</div></div>
                </div>
              </div>
              <div className="lp-testi-card lp-testi-placeholder">
                <p style={{ color: 'var(--lp-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px 0' }}>
                  Esta seção exibirá avaliações reais dos usuários assim que as primeiras demandas forem concluídas.
                </p>
              </div>
            </div>
          ) : (
            <div className="lp-testi-grid reveal-stagger">
              <div className="lp-testi-card">
                <div className="lp-testi-stars">★★★★★</div>
                <p>"Comecei no nível Candidato. Em 4 meses cheguei ao Pleno e a comissão caiu de 22% para 19%. Cada laudo entregue no prazo conta no Score."</p>
                <div className="lp-testi-who">
                  <div className="lp-avatar" style={{ background: 'linear-gradient(135deg,#1C4663,#0E2A3D)' }}>RC</div>
                  <div><div className="name">Rafael C.</div><div className="role">Eng. Civil · CREA-PB</div></div>
                </div>
              </div>
              <div className="lp-testi-card">
                <div className="lp-testi-stars">★★★★★</div>
                <p>"Sem negociação de preço com cliente, sem risco de calote — o dinheiro cai no meu saldo assim que o laudo é aprovado."</p>
                <div className="lp-testi-who">
                  <div className="lp-avatar" style={{ background: 'linear-gradient(135deg,#7C3AED,#A78BFA)' }}>AL</div>
                  <div><div className="name">Ana L.</div><div className="role">Arquiteta · CAU-PB</div></div>
                </div>
              </div>
              <div className="lp-testi-card lp-testi-placeholder">
                <p style={{ color: 'var(--lp-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px 0' }}>
                  As avaliações reais dos profissionais aparecerão aqui automaticamente após as primeiras demandas.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="lp-section-pad">
        <div className="lp-wrap">
          <div className="lp-cta-final reveal">
            <h2>{c.ctaTitle}</h2>
            <p>{c.ctaLede}</p>
            <div className="lp-ctas">
              <Link href={c.registerHref} className="lp-btn lp-btn-primary lp-btn-lg">{c.ctaPrimary}</Link>
              {audience === 'cliente' ? (
                <button
                  className="lp-btn lp-btn-lg"
                  style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,0.25)' }}
                  onClick={() => setOpenSue(true)}
                >
                  {c.ctaSecondary}
                </button>
              ) : (
                <a
                  href="#tiers"
                  className="lp-btn lp-btn-lg"
                  style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,0.25)' }}
                >
                  {c.ctaSecondary}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SUE PÚBLICA ═══ */}
      <SueChatPublica forceOpen={openSue} />

      {/* ═══ FOOTER ═══ */}
      <footer>
        <div className="lp-wrap">
          <div className="lp-footer-grid">
            <div className="lp-footer-brand">
              <Link href="/"><Logo height={40} /></Link>
              <p>Marketplace de engenharia e arquitetura com responsabilidade técnica, escrow e qualificação de profissionais por desempenho.</p>
              <div className="lp-footer-social">
                <a href="#" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>
                </a>
                <a href="#" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
              </div>
            </div>
            <div className="lp-footer-col">
              <h4>Plataforma</h4>
              <a href="#servicos">Catálogo de serviços</a>
              <a href="#como-funciona">Como funciona</a>
              <a href="#confianca">Segurança</a>
            </div>
            <div className="lp-footer-col">
              <h4>Para clientes</h4>
              <Link href="/auth/cadastro?tipo=CLIENTE">Solicitar serviço</Link>
              <Link href="/auth/login">Acompanhar demanda</Link>
              <a href="mailto:suedflowtecnologia@gmail.com">Central de ajuda</a>
            </div>
            <div className="lp-footer-col">
              <h4>Para profissionais</h4>
              <Link href="/auth/cadastro?tipo=PROFISSIONAL">Cadastro profissional</Link>
              <a href="#tiers" onClick={() => setAudience('profissional')}>Score SQP</a>
              <a href="#confianca" onClick={() => setAudience('profissional')}>Níveis e comissões</a>
            </div>
            <div className="lp-footer-col">
              <h4>Legal &amp; Contato</h4>
              <Link href="/termos">Termos de uso</Link>
              <Link href="/privacidade">Privacidade (LGPD)</Link>
              <a href="mailto:suedflowtecnologia@gmail.com">suedflowtecnologia@gmail.com</a>
              <a href="mailto:contato@suedflow.com.br">Fale conosco</a>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <span>© 2026 SUEDFLOW TECNOLOGIA INOVA SIMPLES (I.S.) · CNPJ 67.671.499/0001-30 · João Pessoa, PB</span>
            <span>Fase de validação · Pagamentos via ASAAS</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
