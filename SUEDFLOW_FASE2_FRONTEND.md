# SUEDFLOW Frontend — Fase 2: Identidade Visual + Telas Profissional + Integração

## CONTEXTO
O frontend atual tem o layout correto (Shell/Sidebar) mas perdeu a identidade visual
da plataforma. O demo UX v9.3 tem a identidade certa (navy #061828, orange #E8671A,
glass-morphism nos cards) mas é mobile. Precisamos:

1. Restaurar a identidade visual navy/orange no frontend desktop
2. Criar as telas do profissional que não existem ainda
3. Configurar variáveis de ambiente para integração Railway/Vercel

NÃO alterar: lib/api.ts, lib/utils.ts, hooks/

---

## PARTE 1 — RESTAURAR IDENTIDADE VISUAL

### 1.1 Atualizar globals.css

Substituir o conteúdo de frontend/app/globals.css:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');

:root {
  --navy:    #061828;
  --navy2:   #0A2238;
  --navy3:   #0F2D47;
  --orange:  #E8671A;
  --orange2: #FF8A3D;
  --glass:   rgba(255,255,255,0.06);
  --glass2:  rgba(255,255,255,0.10);
  --border:  rgba(255,255,255,0.10);
  --border2: rgba(255,255,255,0.16);
  --text:    #F0F4F8;
  --text2:   #A8BDCC;
  --text3:   #6B8499;
  --green:   #00D68F;
  --red:     #FF4D6D;
  --gold:    #F5A623;
  --purple:  #9B6DFF;
}

@layer base {
  *, *::before, *::after { box-sizing: border-box; }
  html { font-size: 14px; -webkit-font-smoothing: antialiased; }
  body {
    margin: 0; padding: 0;
    font-family: 'Inter', system-ui, sans-serif;
    background: var(--navy);
    color: var(--text);
    min-height: 100vh;
  }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
}

@layer components {

  /* ── Cards ── */
  .card {
    background: var(--glass);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 16px;
    backdrop-filter: blur(8px);
  }
  .card-accent {
    background: linear-gradient(135deg, rgba(232,103,26,0.12), rgba(232,103,26,0.04));
    border: 1px solid rgba(232,103,26,0.3);
    border-radius: 16px;
    padding: 16px;
  }
  .card-solid {
    background: var(--navy2);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 16px;
  }

  /* ── Botões ── */
  .btn {
    @apply inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm
           transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1
           disabled:opacity-40 disabled:cursor-not-allowed;
  }
  .btn-primary {
    background: linear-gradient(135deg, #E8671A, #FF8A3D);
    color: white;
    box-shadow: 0 4px 14px rgba(232,103,26,0.35);
  }
  .btn-primary:hover { opacity: 0.92; transform: translateY(-1px); }
  .btn-secondary {
    background: var(--glass2);
    border: 1px solid var(--border2);
    color: var(--text);
  }
  .btn-secondary:hover { background: rgba(255,255,255,0.14); }
  .btn-ghost {
    color: var(--text2);
    background: transparent;
  }
  .btn-ghost:hover { color: var(--text); background: var(--glass); }
  .btn-danger {
    background: rgba(255,77,109,0.15);
    border: 1px solid rgba(255,77,109,0.3);
    color: #FF4D6D;
  }
  .btn-danger:hover { background: rgba(255,77,109,0.25); }
  .btn-sm { @apply px-3 py-1.5 text-xs rounded-lg; }
  .btn-lg { @apply px-6 py-3 text-base rounded-xl; }

  /* ── Inputs ── */
  .input {
    @apply w-full px-3 py-2.5 text-sm rounded-xl transition-colors duration-150;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    color: var(--text);
  }
  .input::placeholder { color: var(--text3); }
  .input:focus {
    outline: none;
    border-color: var(--orange);
    background: rgba(255,255,255,0.09);
    box-shadow: 0 0 0 3px rgba(232,103,26,0.15);
  }

  /* ── Labels ── */
  .label {
    @apply block text-xs font-semibold mb-1.5 uppercase tracking-wide;
    color: var(--text3);
  }

  /* ── Status badges ── */
  .badge { @apply inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold; }
  .badge-yellow  { background: rgba(245,166,35,0.15);  color: #F5A623; border: 1px solid rgba(245,166,35,0.3); }
  .badge-blue    { background: rgba(77,159,255,0.15);  color: #4D9FFF; border: 1px solid rgba(77,159,255,0.3); }
  .badge-indigo  { background: rgba(99,102,241,0.15);  color: #818CF8; border: 1px solid rgba(99,102,241,0.3); }
  .badge-purple  { background: rgba(155,109,255,0.15); color: #9B6DFF; border: 1px solid rgba(155,109,255,0.3); }
  .badge-orange  { background: rgba(232,103,26,0.15);  color: #FF8A3D; border: 1px solid rgba(232,103,26,0.3); }
  .badge-red     { background: rgba(255,77,109,0.15);  color: #FF4D6D; border: 1px solid rgba(255,77,109,0.3); }
  .badge-teal    { background: rgba(0,214,143,0.12);   color: #00D68F; border: 1px solid rgba(0,214,143,0.25); }
  .badge-green   { background: rgba(0,214,143,0.12);   color: #00D68F; border: 1px solid rgba(0,214,143,0.25); }
  .badge-gray    { background: rgba(255,255,255,0.06); color: var(--text3); border: 1px solid var(--border); }
  .badge-gold    { background: rgba(245,166,35,0.15);  color: #F5A623; border: 1px solid rgba(245,166,35,0.3); }

  /* ── Tabela ── */
  .data-table { @apply w-full text-sm; }
  .data-table thead tr { border-bottom: 1px solid var(--border); }
  .data-table thead th {
    @apply px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide;
    color: var(--text3);
  }
  .data-table tbody tr {
    border-bottom: 1px solid rgba(255,255,255,0.05);
    transition: background 0.15s;
    cursor: pointer;
  }
  .data-table tbody tr:hover { background: var(--glass); }
  .data-table tbody td { @apply px-4 py-3; color: var(--text2); }
  .data-table tbody td.mono { @apply font-mono text-xs; color: var(--text3); }
  .data-table tbody td.bold { color: var(--text); font-weight: 600; }

  /* ── KPI Card ── */
  .kpi-card { @apply card; }
  .kpi-value { font-size: 28px; font-weight: 800; color: var(--text); font-family: 'JetBrains Mono', monospace; }
  .kpi-label { font-size: 10px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 2px; }

  /* ── Sidebar nav ── */
  .nav-item {
    @apply flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer;
    color: var(--text3);
  }
  .nav-item:hover { background: var(--glass); color: var(--text2); }
  .nav-item.active {
    background: rgba(232,103,26,0.12);
    color: var(--orange);
    border-left: 2px solid var(--orange);
    padding-left: calc(12px - 2px);
  }

  /* ── Topbar ── */
  .topbar {
    @apply h-14 flex items-center px-6 gap-4 sticky top-0 z-20;
    background: rgba(6,24,40,0.95);
    border-bottom: 1px solid var(--border);
    backdrop-filter: blur(20px);
  }
  .page-title { @apply text-lg font-bold; color: var(--text); }

  /* ── Misc ── */
  .section-label {
    font-size: 10px; font-weight: 700; color: var(--text3);
    text-transform: uppercase; letter-spacing: 0.1em;
    margin-bottom: 10px;
  }
  .divider { height: 1px; background: var(--border); margin: 12px 0; }
}
```

### 1.2 Atualizar tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy:   { DEFAULT: '#061828', 2: '#0A2238', 3: '#0F2D47' },
        orange: { DEFAULT: '#E8671A', 2: '#FF8A3D' },
        green:  { DEFAULT: '#00D68F' },
        red:    { DEFAULT: '#FF4D6D' },
        gold:   { DEFAULT: '#F5A623' },
        purple: { DEFAULT: '#9B6DFF' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
```

### 1.3 Atualizar Shell.tsx para visual navy

Substituir frontend/components/layout/Shell.tsx:

```tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { tokenStorage, userStorage } from '@/lib/api'

const NAV = {
  CLIENTE: [
    { href: '/cliente',              icon: '⊞', label: 'Painel' },
    { href: '/cliente/demandas',     icon: '≡', label: 'Demandas' },
    { href: '/cliente/nova-demanda', icon: '+', label: 'Nova demanda' },
    { href: '/cliente/imoveis',      icon: '🏠', label: 'Meus imóveis' },
  ],
  PROFISSIONAL: [
    { href: '/profissional',            icon: '⊞', label: 'Painel' },
    { href: '/profissional/feed',       icon: '◉', label: 'Feed de demandas' },
    { href: '/profissional/demandas',   icon: '≡', label: 'Em andamento' },
    { href: '/profissional/financeiro', icon: '₿', label: 'Financeiro' },
    { href: '/profissional/score',      icon: '★', label: 'Score SQP' },
    { href: '/profissional/perfil',     icon: '👤', label: 'Meu perfil' },
  ],
  ADMIN: [
    { href: '/admin',                 icon: '⊞', label: 'Dashboard' },
    { href: '/admin/demandas',        icon: '≡', label: 'Demandas' },
    { href: '/admin/profissionais',   icon: '★', label: 'Profissionais' },
    { href: '/admin/precos',          icon: '⚙', label: 'Motor UTS' },
    { href: '/admin/teste',           icon: '⚗', label: 'Ferramentas' },
  ],
  CURADOR: [
    { href: '/curador',      icon: '⊞', label: 'Painel' },
    { href: '/curador/fila', icon: '≡', label: 'Fila de casos' },
  ],
}

function getNav(tipo?: string) {
  if (tipo === 'ADMIN' || tipo === 'MODERADOR') return NAV.ADMIN
  if (tipo === 'PROFISSIONAL') return NAV.PROFISSIONAL
  if (tipo === 'CURADOR_SUPORTE' || tipo === 'CURADOR_SENIOR') return NAV.CURADOR
  return NAV.CLIENTE
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => { setUser(userStorage.get()) }, [])

  const nav = getNav(user?.tipo)

  const handleLogout = () => {
    tokenStorage.clear()
    userStorage.clear()
    router.push('/auth/login')
  }

  const initials = user?.nome
    ? user.nome.split(' ').map((n: string) => n[0]).slice(0,2).join('').toUpperCase()
    : '?'

  const TIPO_LABEL: Record<string, string> = {
    CLIENTE: 'Cliente', PROFISSIONAL: 'Profissional',
    ADMIN: 'Administrador', MODERADOR: 'Moderador',
    CURADOR_SUPORTE: 'Curador Suporte', CURADOR_SENIOR: 'Curador Sênior',
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--navy)' }}>
      {/* Sidebar */}
      <aside
        className="w-56 shrink-0 flex flex-col fixed h-full z-30"
        style={{ background: 'rgba(6,18,32,0.98)', borderRight: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #E8671A, #FF8A3D)' }}
            >
              <span className="text-white font-black text-sm">S</span>
            </div>
            <span className="font-black text-white text-base tracking-tight">
              SUED<span style={{ color: '#E8671A' }}>FLOW</span>
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {nav.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link key={item.href} href={item.href} className={`nav-item ${active ? 'active' : ''}`}>
                <span className="w-5 text-center text-sm leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}

          <div className="pt-3 mt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <Link href="/configuracoes" className={`nav-item ${pathname === '/configuracoes' ? 'active' : ''}`}>
              <span className="w-5 text-center text-sm">⚙</span>
              <span>Configurações</span>
            </Link>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div
            className="flex items-center gap-2.5 px-2 py-2 mb-1 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, #E8671A, #FF8A3D)' }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.nome?.split(' ')[0] ?? '—'}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text3)' }}>
                {TIPO_LABEL[user?.tipo] ?? user?.tipo ?? ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl text-xs font-semibold transition-colors"
            style={{ color: 'var(--orange)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(232,103,26,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <span>↩</span> Sair da conta
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="ml-56 flex-1 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  )
}

export function Topbar({ title, actions, subtitle }: {
  title: string
  actions?: React.ReactNode
  subtitle?: string
}) {
  return (
    <header className="topbar">
      <div className="flex-1">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}
```

---

## PARTE 2 — CRIAR TELAS DO PROFISSIONAL

### 2.1 Dashboard do profissional

Criar frontend/app/profissional/page.tsx:

```tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { orders, auth as authApi } from '@/lib/api'
import { formatBRL, statusLabel } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

const STATUS_BADGE: Record<string, string> = {
  AGUARDANDO: 'badge badge-yellow', PAGA: 'badge badge-blue',
  ACEITA: 'badge badge-indigo', EM_EXECUCAO: 'badge badge-purple',
  AGUARDANDO_QA: 'badge badge-orange', QA_REPROVADO: 'badge badge-red',
  AGUARDANDO_CONFIRMACAO: 'badge badge-teal', CONCLUIDA: 'badge badge-green',
  CANCELADA: 'badge badge-gray', EM_DISPUTA: 'badge badge-red',
}

export default function ProfissionalHome() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [demandas, setDemandas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (user.tipo !== 'PROFISSIONAL') { router.push('/cliente'); return }
    orders.listarMinhas()
      .then(d => setDemandas(Array.isArray(d) ? d : d?.demandas || []))
      .catch(() => toast('Erro ao carregar demandas', 'error'))
      .finally(() => setLoading(false))
  }, [user, authLoading, router, toast])

  if (authLoading || !user) return null

  const ativas    = demandas.filter(d => !['CONCLUIDA','CANCELADA'].includes(d.status))
  const concluidas = demandas.filter(d => d.status === 'CONCLUIDA')
  const receita   = concluidas.reduce((s, d) => s + (d.liquido_profissional || 0), 0)
  const prof      = user.profissional || {}

  return (
    <Shell>
      <Topbar
        title={`Olá, ${user.nome.split(' ')[0]} 👋`}
        subtitle={prof.nivel ? `${prof.nivel} · ${prof.plano || 'GRATIS'}` : undefined}
        actions={
          <Link href="/profissional/feed" className="btn btn-primary btn-sm">
            Ver feed de demandas
          </Link>
        }
      />
      <main className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <div className="kpi-card">
            <p className="kpi-value" style={{ color: 'var(--orange)' }}>{ativas.length}</p>
            <p className="kpi-label">Em andamento</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-value">{concluidas.length}</p>
            <p className="kpi-label">Concluídas</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-value" style={{ color: 'var(--green)' }}>{formatBRL(prof.saldo_disponivel || 0)}</p>
            <p className="kpi-label">Saldo disponível</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-value">{prof.score || 0}</p>
            <p className="kpi-label">Score SQP</p>
          </div>
        </div>

        {/* Demandas em andamento */}
        <div className="card-solid">
          <div className="flex items-center justify-between mb-4">
            <p className="section-label">Demandas em andamento</p>
            <Link href="/profissional/demandas" className="text-xs font-semibold" style={{ color: 'var(--orange)' }}>
              Ver todas →
            </Link>
          </div>
          {loading ? (
            <p className="text-sm py-6 text-center" style={{ color: 'var(--text3)' }}>Carregando...</p>
          ) : ativas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm mb-3" style={{ color: 'var(--text3)' }}>Nenhuma demanda em andamento</p>
              <Link href="/profissional/feed" className="btn btn-primary btn-sm">Ver feed de demandas</Link>
            </div>
          ) : (
            <table className="data-table">
              <thead><tr>
                <th>OS</th><th>Serviço</th><th>Status</th><th>Prazo</th>
                <th className="text-right">Valor líquido</th>
              </tr></thead>
              <tbody>
                {ativas.slice(0,8).map(d => (
                  <tr key={d.id} onClick={() => router.push(`/profissional/demandas/${d.id}`)}>
                    <td className="mono">{d.numero || d.id?.slice(0,8)}</td>
                    <td className="bold">{d.svc_nome || d.svc_codigo}</td>
                    <td><span className={STATUS_BADGE[d.status] || 'badge badge-gray'}>{statusLabel(d.status).text}</span></td>
                    <td style={{ color: 'var(--text3)' }}>{d.prazo_entrega ? new Date(d.prazo_entrega).toLocaleDateString('pt-BR') : '—'}</td>
                    <td className="text-right font-mono font-bold" style={{ color: 'var(--green)' }}>
                      {formatBRL(d.liquido_profissional || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Atalhos rápidos */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { href: '/profissional/feed',       icon: '◉', label: 'Feed de demandas', desc: 'Ver demandas disponíveis' },
            { href: '/profissional/financeiro',  icon: '₿', label: 'Financeiro',       desc: 'Saldo e saques PIX' },
            { href: '/profissional/score',       icon: '★', label: 'Score SQP',        desc: 'Minha reputação' },
          ].map(item => (
            <Link key={item.href} href={item.href} className="card-solid hover:border-orange transition-colors block"
              style={{ borderColor: 'rgba(255,255,255,0.07)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(232,103,26,0.4)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{item.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </Shell>
  )
}
```

### 2.2 Feed de demandas do profissional

Criar frontend/app/profissional/feed/page.tsx:

```tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { orders } from '@/lib/api'
import { formatBRL } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

export default function ProfissionalFeed() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [demandas, setDemandas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [aceitando, setAceitando] = useState<string | null>(null)

  const carregar = () => {
    setLoading(true)
    orders.feed()
      .then(d => setDemandas(d?.demandas || []))
      .catch(err => {
        if (err.status === 403) toast(err.message || 'KYC ou módulo pendente', 'error')
        else toast('Erro ao carregar feed', 'error')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    carregar()
  }, [user, authLoading, router])

  const aceitar = async (id: string) => {
    setAceitando(id)
    try {
      await orders.aceitar(id, 0) // ajuste 0% = sem alteração
      toast('Demanda aceita! Aguardando pagamento do cliente.', 'success')
      carregar()
    } catch (err: any) {
      toast(err.message || 'Erro ao aceitar demanda', 'error')
    } finally {
      setAceitando(null)
    }
  }

  if (authLoading || !user) return null

  const URGENCIA_LABEL: Record<string, string> = {
    NORMAL: 'Normal', PRIORITARIO: '+30%', URGENTE: '+60%'
  }
  const TIPO_LABEL: Record<string, string> = {
    RESIDENCIAL: '🏠 Residencial', COMERCIAL: '🏢 Comercial', INDUSTRIAL: '🏭 Industrial'
  }

  return (
    <Shell>
      <Topbar
        title="Feed de demandas"
        subtitle={`${demandas.length} demanda${demandas.length !== 1 ? 's' : ''} disponível${demandas.length !== 1 ? 'is' : ''}`}
        actions={
          <button onClick={carregar} className="btn btn-secondary btn-sm">
            ↻ Atualizar
          </button>
        }
      />
      <main className="p-6">
        {loading ? (
          <div className="text-center py-16" style={{ color: 'var(--text3)' }}>Carregando feed...</div>
        ) : demandas.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-3 opacity-50">◉</div>
            <p className="font-semibold text-white mb-1">Nenhuma demanda disponível agora</p>
            <p className="text-sm" style={{ color: 'var(--text3)' }}>
              Novas demandas aparecem assim que clientes as criam.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {demandas.map(d => (
              <div key={d.id} className="card-solid" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono" style={{ color: 'var(--text3)' }}>{d.svc_codigo}</span>
                      <span className="text-white font-semibold">{d.svc_nome || d.svc_codigo}</span>
                      {d.urgencia !== 'NORMAL' && (
                        <span className="badge badge-orange">{URGENCIA_LABEL[d.urgencia]}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--text3)' }}>
                      <span>{TIPO_LABEL[d.tipo_imovel] || d.tipo_imovel}</span>
                      <span>📐 {d.area_m2}m²</span>
                      <span>📍 {d.cidade}/{d.estado}</span>
                      <span>⏱ SLA {d.sla_dias || 5} dias</span>
                    </div>
                    {d.descricao && (
                      <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--text2)' }}>{d.descricao}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold font-mono" style={{ color: 'var(--green)' }}>
                      {formatBRL(d.liquido_estimado || d.preco_servico || 0)}
                    </p>
                    <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>líquido estimado</p>
                    <button
                      onClick={() => aceitar(d.id)}
                      disabled={aceitando === d.id}
                      className="btn btn-primary btn-sm"
                    >
                      {aceitando === d.id ? 'Aceitando...' : 'Aceitar demanda'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </Shell>
  )
}
```

### 2.3 Financeiro do profissional

Criar frontend/app/profissional/financeiro/page.tsx:

```tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { formatBRL } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

export default function ProfissionalFinanceiro() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [valorSaque, setValorSaque] = useState('')
  const [pixKey, setPixKey] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
  }, [user, authLoading, router])

  if (authLoading || !user) return null
  const prof = user.profissional || {}
  const saldo = prof.saldo_disponivel || 0

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
      // TODO: chamar endpoint de saque quando implementado
      toast('Saque solicitado! Processamento em até 2h úteis.', 'success')
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
            {formatBRL(saldo)}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
            Saldo em custódia: {formatBRL(prof.saldo_custodia || 0)} · liberado após confirmação do cliente
          </p>
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
```

### 2.4 Score SQP do profissional

Criar frontend/app/profissional/score/page.tsx:

```tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { useAuth } from '@/hooks/useAuth'

const TIER_COLOR: Record<string, string> = {
  CANDIDATO: 'var(--text3)', JUNIOR: 'var(--blue)',
  PLENO: 'var(--teal, #00D68F)', SENIOR: 'var(--purple)',
  ELITE: 'var(--gold)',
}

export default function ProfissionalScore() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
  }, [user, authLoading, router])

  if (authLoading || !user) return null
  const prof = user.profissional || {}
  const score = prof.score || 0
  const nivel = prof.nivel || 'CANDIDATO'
  const pct = Math.min((score / 1000) * 100, 100)

  const COMPOSICAO = [
    { label: 'Qualidade técnica',  peso: '30%', valor: Math.round(score * 0.30) },
    { label: 'Taxa de conclusão',  peso: '20%', valor: Math.round(score * 0.20) },
    { label: 'Pontualidade',       peso: '15%', valor: Math.round(score * 0.15) },
    { label: 'Avaliação cliente',  peso: '12%', valor: Math.round(score * 0.12) },
    { label: 'Taxa de resposta',   peso: '8%',  valor: Math.round(score * 0.08) },
    { label: 'Retrabalho (neg.)',   peso: '15%', valor: Math.round(score * 0.15) },
  ]

  const TIERS = [
    { nome: 'CANDIDATO', min: 0,   max: 199,  comissao: '22%/19%/16%' },
    { nome: 'JUNIOR',    min: 200, max: 399,  comissao: '21%/18%/15%' },
    { nome: 'PLENO',     min: 400, max: 599,  comissao: '19%/16%/13%' },
    { nome: 'SENIOR',    min: 600, max: 799,  comissao: '17%/14%/11%' },
    { nome: 'ELITE',     min: 800, max: 1000, comissao: '15%/12%/9%'  },
  ]

  return (
    <Shell>
      <Topbar title="Score SQP" subtitle="Score de Qualificação Profissional · 0–1000 pts" />
      <main className="p-6 max-w-2xl space-y-5">

        {/* Score principal */}
        <div className="card-accent text-center py-8">
          <p className="text-7xl font-black font-mono mb-2" style={{ color: TIER_COLOR[nivel] }}>
            {score}
          </p>
          <span className="badge badge-gold text-sm px-3 py-1">{nivel}</span>
          <div className="mt-6 mx-4">
            <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #E8671A, #F5A623)' }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs" style={{ color: 'var(--text3)' }}>0</span>
              <span className="text-xs" style={{ color: 'var(--text3)' }}>1000</span>
            </div>
          </div>
          <p className="text-xs mt-3" style={{ color: 'var(--text3)' }}>
            Recalculado diariamente · janela 90 dias
          </p>
        </div>

        {/* Composição */}
        <div className="card-solid">
          <p className="section-label">Composição do score</p>
          <div className="space-y-3">
            {COMPOSICAO.map(c => (
              <div key={c.label} className="flex items-center gap-3">
                <span className="text-xs w-36 shrink-0" style={{ color: 'var(--text2)' }}>{c.label}</span>
                <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-1.5 rounded-full" style={{
                    width: `${Math.min((c.valor / 300) * 100, 100)}%`,
                    background: 'var(--orange)'
                  }} />
                </div>
                <span className="text-xs w-8 text-right font-mono" style={{ color: 'var(--text3)' }}>{c.peso}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabela de tiers */}
        <div className="card-solid">
          <p className="section-label">Tiers e comissões (Grátis/PRO/Elite)</p>
          <table className="data-table">
            <thead><tr><th>Tier</th><th>Pontos</th><th>Comissão</th><th>Status</th></tr></thead>
            <tbody>
              {TIERS.map(t => (
                <tr key={t.nome} style={t.nome === nivel ? { background: 'rgba(232,103,26,0.08)' } : {}}>
                  <td className="bold" style={{ color: TIER_COLOR[t.nome] }}>{t.nome}</td>
                  <td className="mono">{t.min}–{t.max}</td>
                  <td style={{ color: 'var(--text3)' }}>{t.comissao}</td>
                  <td>{t.nome === nivel ? <span className="badge badge-orange">Atual</span> : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </Shell>
  )
}
```

---

## PARTE 3 — CONFIGURAÇÕES MELHORADAS

Substituir frontend/app/configuracoes/page.tsx:

```tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { tokenStorage, userStorage } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

export default function ConfiguracoesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [notifEmail, setNotifEmail] = useState(true)
  const [notifPush, setNotifPush] = useState(true)

  const handleCancelarConta = () => {
    if (confirmText !== 'CONFIRMAR') return
    // Soft delete — quando endpoint existir: DELETE /api/auth/cancelar-conta
    tokenStorage.clear()
    userStorage.clear()
    router.push('/?cancelado=1')
  }

  return (
    <Shell>
      <Topbar title="Configurações" />
      <main className="p-6 max-w-xl space-y-5">

        {/* Perfil */}
        <div className="card-solid">
          <p className="section-label">Minha conta</p>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg"
              style={{ background: 'linear-gradient(135deg, #E8671A, #FF8A3D)' }}>
              {user?.nome?.charAt(0) || '?'}
            </div>
            <div>
              <p className="font-semibold text-white">{user?.nome || '—'}</p>
              <p className="text-xs" style={{ color: 'var(--text3)' }}>{user?.email || '—'}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: 'var(--text3)' }}>Tipo de conta</span>
              <span className="text-white font-medium">{user?.tipo || '—'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span style={{ color: 'var(--text3)' }}>Telefone</span>
              <span className="text-white">{user?.telefone || 'Não informado'}</span>
            </div>
          </div>
        </div>

        {/* Notificações */}
        <div className="card-solid">
          <p className="section-label">Notificações</p>
          <div className="space-y-3">
            {[
              { label: 'E-mail', desc: 'Atualizações de demandas e pagamentos', val: notifEmail, set: setNotifEmail },
              { label: 'Push', desc: 'Alertas em tempo real no navegador', val: notifPush, set: setNotifPush },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs" style={{ color: 'var(--text3)' }}>{item.desc}</p>
                </div>
                <button
                  onClick={() => item.set(!item.val)}
                  className="w-11 h-6 rounded-full transition-colors relative"
                  style={{ background: item.val ? 'var(--orange)' : 'rgba(255,255,255,0.1)' }}
                >
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 transition-all"
                    style={{ left: item.val ? '24px' : '4px' }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* LGPD */}
        <div className="card-solid">
          <p className="section-label">Privacidade e dados (LGPD)</p>
          <div className="space-y-2 text-sm" style={{ color: 'var(--text3)' }}>
            <p>Seus dados são tratados conforme a Lei 13.709/2018 (LGPD).</p>
            <p>Direitos: acesso, correção, portabilidade e exclusão.</p>
            <div className="flex gap-2 pt-2">
              <button className="btn btn-secondary btn-sm">Exportar meus dados</button>
              <button className="btn btn-secondary btn-sm" onClick={() => router.push('/privacidade')}>
                Política de privacidade
              </button>
            </div>
          </div>
        </div>

        {/* Zona de perigo */}
        <div className="card" style={{ borderColor: 'rgba(255,77,109,0.3)', background: 'rgba(255,77,109,0.05)' }}>
          <p className="section-label" style={{ color: '#FF4D6D' }}>Zona de perigo</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text2)' }}>
            Ao cancelar sua conta, o acesso é encerrado imediatamente.
            Seus dados são mantidos por 60 dias conforme a LGPD (Art. 18).
            Esta ação é irreversível.
          </p>
          <button onClick={() => setShowCancelModal(true)} className="btn btn-danger btn-sm">
            Cancelar minha conta
          </button>
        </div>
      </main>

      {/* Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-sm p-6 rounded-2xl" style={{ background: 'var(--navy2)', border: '1px solid var(--border2)' }}>
            <h3 className="text-base font-bold text-white mb-2">Cancelar conta</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text2)' }}>
              Esta ação não pode ser desfeita. Digite <strong className="text-white">CONFIRMAR</strong> para prosseguir.
            </p>
            <input
              className="input mb-4"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="CONFIRMAR"
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowCancelModal(false); setConfirmText('') }}
                className="btn btn-secondary flex-1">Voltar</button>
              <button
                onClick={handleCancelarConta}
                disabled={confirmText !== 'CONFIRMAR'}
                className="btn btn-danger flex-1"
              >Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}
```

---

## PARTE 4 — INTEGRAÇÃO RAILWAY/VERCEL

### 4.1 Criar arquivo de variáveis de ambiente

O arquivo frontend/.env.local já existe com:
NEXT_PUBLIC_API_BASE=https://suedflow-backend-production.up.railway.app

### 4.2 Adicionar página de saúde da integração

Criar frontend/app/admin/health/page.tsx:

```tsx
'use client'
import { useEffect, useState } from 'react'
import { Shell, Topbar } from '@/components/layout/Shell'
import { health } from '@/lib/api'

export default function AdminHealth() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checar = () => {
    setLoading(true)
    setError(null)
    health()
      .then(s => setStatus(s))
      .catch(err => setError(err.message || 'Backend inacessível'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { checar() }, [])

  return (
    <Shell>
      <Topbar title="Saúde do sistema" subtitle="Status da integração backend/frontend"
        actions={<button onClick={checar} className="btn btn-secondary btn-sm">↻ Verificar</button>}
      />
      <main className="p-6 max-w-xl space-y-4">
        <div className={`card-solid ${error ? 'border-red' : ''}`}
          style={{ borderColor: error ? 'rgba(255,77,109,0.4)' : status?.status === 'ok' ? 'rgba(0,214,143,0.4)' : 'rgba(255,255,255,0.08)' }}>
          {loading ? (
            <p style={{ color: 'var(--text3)' }}>Verificando conexão com o backend...</p>
          ) : error ? (
            <div>
              <p className="font-semibold" style={{ color: 'var(--red)' }}>❌ Backend inacessível</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>{error}</p>
              <p className="text-xs mt-2" style={{ color: 'var(--text3)' }}>
                URL: {process.env.NEXT_PUBLIC_API_BASE || 'não configurada'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="font-semibold" style={{ color: 'var(--green)' }}>✅ Backend online</p>
              {Object.entries(status || {}).map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text3)' }}>{k}</span>
                  <span className="font-mono text-white">{String(v)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card-solid">
          <p className="section-label">Configuração atual</p>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span style={{ color: 'var(--text3)' }}>API Base</span>
              <span className="font-mono text-xs text-white">
                {typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_BASE || 'padrão Railway') : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--text3)' }}>Ambiente</span>
              <span className="font-mono text-xs text-white">{process.env.NODE_ENV}</span>
            </div>
          </div>
        </div>
      </main>
    </Shell>
  )
}
```

Adicionar link para /admin/health no NAV.ADMIN do Shell.tsx:
{ href: '/admin/health', icon: '❤', label: 'Saúde do sistema' }

---

## PARTE 5 — EXECUTAR

Após aplicar todas as mudanças:

1. Rodar: npm run build no diretório frontend
2. Se build passar, commitar:
   git add -A
   git commit -m "feat: identidade visual navy/orange + telas profissional + configurações + health"
   git push origin main
3. Retornar resultado do build e lista de arquivos criados/modificados.
