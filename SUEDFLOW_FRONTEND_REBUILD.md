# SUEDFLOW Frontend — Rebuild Completo

Reescrever o frontend SUEDFLOW do zero. O atual usa glass-morphism mobile-first
(AppShell, BottomNav, gradiente escuro) e parece app de celular no desktop.
O novo deve ser uma plataforma web B2B profissional — sidebar fixa, layout denso,
identidade de plataforma técnica de engenharia.

**NÃO alterar:** `frontend/lib/api.ts`, `frontend/lib/utils.ts`, hooks existentes.
**Reescrever:** tudo em `frontend/app/`, `frontend/components/`, `frontend/tailwind.config.js`,
`frontend/app/globals.css`.

---

## 1. TAILWIND CONFIG — substituir completamente

```js
// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy:    { DEFAULT: '#0A1F35', 50: '#EBF0F6', 100: '#C2D2E3', 200: '#94B3CC', 600: '#081929', 700: '#060F1A' },
        orange:  { DEFAULT: '#E8671A', 50: '#FEF0E7', 100: '#FBCFA6', 200: '#F7A96A', 600: '#C9570F', 700: '#A84508' },
        teal:    { DEFAULT: '#148F77', 50: '#E8F6F3', 100: '#B3E5DC', 600: '#0E7060' },
        gold:    { DEFAULT: '#D97706', 50: '#FEFCE8', 100: '#FDE68A' },
        surface: { DEFAULT: '#F7F8FA', card: '#FFFFFF', border: '#E2E6ED', hover: '#F0F2F5' },
        ink:     { primary: '#0A1F35', secondary: '#4A5568', muted: '#8A96A8', light: '#B0BAC9' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px', letterSpacing: '0.05em' }],
      },
      boxShadow: {
        card: '0 1px 3px rgba(10,31,53,0.08), 0 1px 2px rgba(10,31,53,0.04)',
        'card-hover': '0 4px 12px rgba(10,31,53,0.12), 0 2px 4px rgba(10,31,53,0.06)',
        sidebar: '1px 0 0 #E2E6ED',
      },
      borderRadius: {
        DEFAULT: '6px',
      },
    },
  },
  plugins: [],
}
```

---

## 2. GLOBALS CSS — substituir completamente

```css
/* frontend/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300..900;1,14..32,300..900&family=JetBrains+Mono:wght@400;500;700&display=swap');

@layer base {
  *, *::before, *::after { box-sizing: border-box; }

  html { font-size: 14px; -webkit-font-smoothing: antialiased; }

  body {
    margin: 0; padding: 0;
    font-family: 'Inter', system-ui, sans-serif;
    background: #F7F8FA;
    color: #0A1F35;
    min-height: 100vh;
  }

  /* Scrollbar fina */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #C2D2E3; border-radius: 2px; }
}

@layer components {
  /* ── Card base ── */
  .card {
    @apply bg-white border border-surface-border rounded;
    box-shadow: 0 1px 3px rgba(10,31,53,0.08);
  }

  /* ── Botões ── */
  .btn {
    @apply inline-flex items-center justify-center gap-2 px-4 py-2 rounded font-semibold text-sm
           transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed;
  }
  .btn-primary {
    @apply btn bg-orange text-white hover:bg-orange-600 focus:ring-orange;
  }
  .btn-secondary {
    @apply btn bg-white text-ink-primary border border-surface-border hover:bg-surface-hover focus:ring-navy-100;
  }
  .btn-ghost {
    @apply btn text-ink-secondary hover:bg-surface-hover hover:text-ink-primary focus:ring-navy-100;
  }
  .btn-danger {
    @apply btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500;
  }
  .btn-sm { @apply px-3 py-1.5 text-xs; }
  .btn-lg { @apply px-6 py-3 text-base; }

  /* ── Inputs ── */
  .input {
    @apply w-full px-3 py-2 text-sm bg-white border border-surface-border rounded
           text-ink-primary placeholder:text-ink-light
           focus:outline-none focus:ring-2 focus:ring-orange focus:border-orange
           transition-colors duration-150;
  }
  .input-error { @apply border-red-400 focus:ring-red-400; }

  /* ── Labels ── */
  .label {
    @apply block text-xs font-semibold text-ink-secondary mb-1.5 uppercase tracking-wide;
  }

  /* ── Status badges ── */
  .badge {
    @apply inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-semibold border;
  }
  .badge-yellow  { @apply bg-yellow-50  text-yellow-700  border-yellow-200; }
  .badge-blue    { @apply bg-blue-50    text-blue-700    border-blue-200; }
  .badge-indigo  { @apply bg-indigo-50  text-indigo-700  border-indigo-200; }
  .badge-purple  { @apply bg-purple-50  text-purple-700  border-purple-200; }
  .badge-orange  { @apply bg-orange-50  text-orange-700  border-orange-200; }
  .badge-red     { @apply bg-red-50     text-red-600     border-red-200; }
  .badge-teal    { @apply bg-teal-50    text-teal-600    border-teal-100; }
  .badge-green   { @apply bg-green-50   text-green-700   border-green-200; }
  .badge-gray    { @apply bg-gray-50    text-gray-500    border-gray-200; }
  .badge-gold    { @apply bg-gold-50    text-yellow-700  border-yellow-200; }

  /* ── Tabela densa ── */
  .data-table { @apply w-full text-sm; }
  .data-table thead tr { @apply border-b border-surface-border bg-surface; }
  .data-table thead th {
    @apply px-4 py-2.5 text-left text-2xs font-semibold text-ink-muted uppercase tracking-wide;
  }
  .data-table tbody tr {
    @apply border-b border-surface-border hover:bg-surface-hover cursor-pointer transition-colors;
  }
  .data-table tbody td { @apply px-4 py-3 text-ink-secondary; }
  .data-table tbody td.mono { @apply font-mono text-xs text-ink-muted; }

  /* ── Sidebar nav item ── */
  .nav-item {
    @apply flex items-center gap-3 px-3 py-2 rounded text-sm font-medium text-ink-secondary
           hover:bg-navy-50 hover:text-navy transition-colors cursor-pointer;
  }
  .nav-item.active {
    @apply bg-orange-50 text-orange font-semibold;
    border-left: 2px solid #E8671A;
    margin-left: -1px;
  }

  /* ── KPI card ── */
  .kpi-card {
    @apply card p-4;
  }
  .kpi-value {
    @apply text-2xl font-bold font-mono text-navy tabular-nums;
  }
  .kpi-label {
    @apply text-2xs font-semibold text-ink-muted uppercase tracking-wide mt-0.5;
  }

  /* ── Topbar ── */
  .topbar {
    @apply h-14 bg-white border-b border-surface-border flex items-center px-6 gap-4 sticky top-0 z-20;
  }

  /* ── Page header ── */
  .page-header {
    @apply flex items-center justify-between mb-6;
  }
  .page-title {
    @apply text-xl font-bold text-navy;
  }
}
```

---

## 3. LAYOUT PRINCIPAL — sidebar fixa

```tsx
// frontend/components/layout/Shell.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { tokenStorage, userStorage } from '@/lib/api'

const NAV_CLIENTE = [
  { href: '/cliente',            icon: '⊞', label: 'Painel' },
  { href: '/cliente/demandas',   icon: '≡', label: 'Demandas' },
  { href: '/cliente/nova-demanda', icon: '+', label: 'Nova demanda' },
]

const NAV_PROFISSIONAL = [
  { href: '/profissional',        icon: '⊞', label: 'Painel' },
  { href: '/profissional/feed',   icon: '◉', label: 'Feed de demandas' },
  { href: '/profissional/demandas', icon: '≡', label: 'Minhas demandas' },
  { href: '/profissional/saque',  icon: '↑', label: 'Saque' },
]

const NAV_ADMIN = [
  { href: '/admin',              icon: '⊞', label: 'Dashboard' },
  { href: '/admin/demandas',     icon: '≡', label: 'Demandas' },
  { href: '/admin/profissionais', icon: '★', label: 'Profissionais' },
  { href: '/admin/teste',        icon: '⚗', label: 'Ferramentas teste' },
]

const NAV_CURADOR = [
  { href: '/curador',            icon: '⊞', label: 'Painel' },
  { href: '/curador/fila',       icon: '≡', label: 'Fila de casos' },
]

function getNav(tipo?: string) {
  if (tipo === 'ADMIN' || tipo === 'MODERADOR') return NAV_ADMIN
  if (tipo === 'PROFISSIONAL') return NAV_PROFISSIONAL
  if (tipo === 'CURADOR_SUPORTE' || tipo === 'CURADOR_SENIOR') return NAV_CURADOR
  return NAV_CLIENTE
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setUser(userStorage.get())
  }, [])

  const nav = getNav(user?.tipo)

  const handleLogout = () => {
    tokenStorage.clear()
    userStorage.clear()
    router.push('/auth/login')
  }

  const initials = user?.nome
    ? user.nome.split(' ').map((n: string) => n[0]).slice(0,2).join('').toUpperCase()
    : '?'

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-surface-border flex flex-col fixed h-full z-30">
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-surface-border">
          <span className="font-black text-navy text-lg tracking-tight">SUED<span className="text-orange">FLOW</span></span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {nav.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${pathname === item.href || pathname.startsWith(item.href + '/') ? 'active' : ''}`}
            >
              <span className="w-5 text-center text-base leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}

          <div className="pt-4 mt-4 border-t border-surface-border space-y-0.5">
            <Link href="/configuracoes" className={`nav-item ${pathname === '/configuracoes' ? 'active' : ''}`}>
              <span className="w-5 text-center">⚙</span>
              <span>Configurações</span>
            </Link>
          </div>
        </nav>

        {/* Footer: usuário + sair */}
        <div className="p-3 border-t border-surface-border">
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1 rounded bg-surface">
            <div className="w-7 h-7 rounded-full bg-navy flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-navy truncate">{user?.nome?.split(' ')[0] ?? '—'}</p>
              <p className="text-2xs text-ink-muted truncate">{user?.tipo ?? ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2 py-2 rounded text-xs font-semibold text-orange hover:bg-orange-50 transition-colors"
          >
            <span>↩</span> Sair
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

export function Topbar({ title, actions }: { title: string; actions?: React.ReactNode }) {
  return (
    <header className="topbar">
      <h1 className="page-title flex-1">{title}</h1>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}
```

---

## 4. LAYOUT.TSX — substituir completamente

```tsx
// frontend/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/hooks/useToast'

export const metadata: Metadata = {
  title: 'SUEDFLOW · Plataforma de Engenharia',
  description: 'Plataforma de intermediação técnica de engenharia e arquitetura',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
```

---

## 5. SPLASH / LANDING — substituir completamente

```tsx
// frontend/app/page.tsx
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-navy flex flex-col">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-white/10">
        <span className="font-black text-white text-xl tracking-tight">
          SUED<span className="text-orange">FLOW</span>
        </span>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-white/70 hover:text-white transition-colors font-medium">
            Entrar
          </Link>
          <Link href="/auth/cadastro" className="btn btn-primary btn-sm">
            Criar conta grátis
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 text-center py-24">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange/30 bg-orange/10 text-orange text-xs font-semibold mb-8">
          ⚡ Plataforma em fase de Validação · João Pessoa/PB
        </div>

        <h1 className="text-5xl font-black text-white leading-tight max-w-2xl mb-6">
          De quem sabe<br />
          <span className="text-orange">para quem precisa.</span>
        </h1>

        <p className="text-lg text-white/60 max-w-xl mb-10 leading-relaxed">
          Laudos, vistorias, inspeções e projetos técnicos com
          responsabilidade ART garantida, escrow protegido e
          verificação por IA.
        </p>

        <div className="flex items-center gap-4">
          <Link href="/auth/cadastro?tipo=CLIENTE" className="btn btn-primary btn-lg">
            Solicitar serviço técnico
          </Link>
          <Link href="/auth/cadastro?tipo=PROFISSIONAL" className="btn btn-secondary btn-lg" style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', color: 'white' }}>
            Sou engenheiro/arquiteto →
          </Link>
        </div>

        {/* Credenciais */}
        <div className="flex items-center gap-8 mt-16 text-white/40 text-xs">
          <span>🔒 Escrow Pagar.me</span>
          <span>📋 ART/RRT obrigatória</span>
          <span>🤖 Verificação SUE</span>
          <span>⚖ Conforme LGPD</span>
        </div>
      </main>
    </div>
  )
}
```

---

## 6. LOGIN — substituir completamente

```tsx
// frontend/app/auth/login/page.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

const REDIRECT: Record<string, string> = {
  ADMIN: '/admin', MODERADOR: '/admin',
  PROFISSIONAL: '/profissional',
  CURADOR_SUPORTE: '/curador', CURADOR_SENIOR: '/curador',
  CLIENTE: '/cliente',
}

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null); setLoading(true)
    try {
      const u = await login(email, senha)
      toast(`Bem-vindo, ${u.nome.split(' ')[0]}!`, 'success')
      router.push(REDIRECT[u.tipo] ?? '/cliente')
    } catch (err: any) {
      setError(err.message || 'E-mail ou senha inválidos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Painel esquerdo */}
      <div className="hidden lg:flex w-[420px] shrink-0 bg-navy flex-col justify-between p-10">
        <Link href="/" className="font-black text-white text-xl tracking-tight">
          SUED<span className="text-orange">FLOW</span>
        </Link>
        <div>
          <p className="text-white/50 text-sm mb-3 uppercase tracking-widest font-semibold">Plataforma técnica</p>
          <h2 className="text-3xl font-black text-white leading-snug mb-4">
            Engenharia com<br />
            <span className="text-orange">responsabilidade técnica</span><br />
            garantida.
          </h2>
          <p className="text-white/50 text-sm">
            ART embutida · Escrow protegido · Verificação SUE
          </p>
        </div>
        <p className="text-white/25 text-xs">SUEDFLOW Tecnologia Ltda. · João Pessoa/PB</p>
      </div>

      {/* Formulário */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Link href="/" className="font-black text-navy text-xl tracking-tight">
              SUED<span className="text-orange">FLOW</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-navy mb-1">Entrar</h1>
          <p className="text-sm text-ink-muted mb-8">Acesse sua conta SUEDFLOW</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">E-mail</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Senha</label>
                <Link href="/auth/recuperar" className="text-xs text-orange font-semibold hover:underline">
                  Esqueci a senha
                </Link>
              </div>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-secondary"
                  tabIndex={-1}
                >
                  {showSenha ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-3 py-2.5 rounded border border-red-200 bg-red-50 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary w-full btn-lg mt-2">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-sm text-ink-muted mt-6">
            Não tem conta?{' '}
            <Link href="/auth/cadastro" className="text-orange font-semibold hover:underline">
              Cadastre-se grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
```

---

## 7. CADASTRO — substituir CadastroClient.tsx completamente

```tsx
// frontend/app/auth/cadastro/CadastroClient.tsx
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth as authApi, tokenStorage, userStorage } from '@/lib/api'
import { useToast } from '@/hooks/useToast'

export default function CadastroClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [tipo, setTipo] = useState<'CLIENTE' | 'PROFISSIONAL'>('CLIENTE')
  const [form, setForm] = useState({
    nome: '', email: '', senha: '', cpf_cnpj: '', telefone: '',
    estado: 'PB', cidade: 'João Pessoa',
  })
  const [showSenha, setShowSenha] = useState(false)
  const [aceito, setAceito] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams?.get('tipo') === 'PROFISSIONAL') setTipo('PROFISSIONAL')
  }, [searchParams])

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!aceito) { setError('Aceite os termos para continuar.'); return }
    setError(null); setLoading(true)
    try {
      await authApi.registrar({ ...form, tipo })
      const data = await authApi.login(form.email, form.senha)
      tokenStorage.set(data.token)
      userStorage.set(data.usuario)
      toast('Conta criada com sucesso!', 'success')
      router.push(tipo === 'PROFISSIONAL' ? '/profissional/onboarding' : '/cliente')
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Painel esquerdo */}
      <div className="hidden lg:flex w-[420px] shrink-0 bg-navy flex-col justify-between p-10">
        <Link href="/" className="font-black text-white text-xl tracking-tight">
          SUED<span className="text-orange">FLOW</span>
        </Link>
        <div>
          <p className="text-white/50 text-sm mb-3 uppercase tracking-widest font-semibold">Cadastro gratuito</p>
          <h2 className="text-3xl font-black text-white leading-snug mb-4">
            Comece a usar<br />
            <span className="text-orange">em menos de 2 minutos.</span>
          </h2>
          <ul className="space-y-2 text-white/60 text-sm">
            <li>✓ Sem mensalidade para começar</li>
            <li>✓ ART/RRT embutida em cada serviço</li>
            <li>✓ Pagamento protegido em escrow</li>
          </ul>
        </div>
        <p className="text-white/25 text-xs">SUEDFLOW Tecnologia Ltda. · João Pessoa/PB</p>
      </div>

      {/* Formulário */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-6">
            <Link href="/" className="font-black text-navy text-xl tracking-tight">
              SUED<span className="text-orange">FLOW</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-navy mb-1">Criar conta</h1>
          <p className="text-sm text-ink-muted mb-6">Cadastro gratuito · Sem mensalidade inicial</p>

          {/* Toggle tipo */}
          <div className="flex border border-surface-border rounded overflow-hidden mb-6">
            {(['CLIENTE', 'PROFISSIONAL'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTipo(t)}
                className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                  tipo === t
                    ? 'bg-navy text-white'
                    : 'bg-white text-ink-secondary hover:bg-surface-hover'
                }`}
              >
                {t === 'CLIENTE' ? '🏠 Sou cliente' : '🔧 Sou profissional'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="label">Nome completo</label>
              <input className="input" value={form.nome} onChange={e => update('nome', e.target.value)} placeholder="Seu nome completo" required />
            </div>
            <div>
              <label className="label">{tipo === 'CLIENTE' ? 'CPF ou CNPJ' : 'CPF'}</label>
              <input className="input" value={form.cpf_cnpj} onChange={e => update('cpf_cnpj', e.target.value)} placeholder="000.000.000-00" required />
            </div>
            <div>
              <label className="label">E-mail</label>
              <input className="input" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="seu@email.com" required />
            </div>
            <div>
              <label className="label">Telefone (WhatsApp)</label>
              <input className="input" value={form.telefone} onChange={e => update('telefone', e.target.value)} placeholder="(83) 99999-0000" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Estado</label>
                <select className="input" value={form.estado} onChange={e => update('estado', e.target.value)}>
                  <option value="PB">Paraíba</option>
                  <option value="PE">Pernambuco</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="CE">Ceará</option>
                </select>
              </div>
              <div>
                <label className="label">Cidade</label>
                <input className="input" value={form.cidade} onChange={e => update('cidade', e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showSenha ? 'text' : 'password'}
                  value={form.senha}
                  onChange={e => update('senha', e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                  required
                />
                <button type="button" onClick={() => setShowSenha(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-secondary" tabIndex={-1}>
                  {showSenha ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-2 pt-2 cursor-pointer">
              <input type="checkbox" checked={aceito} onChange={e => setAceito(e.target.checked)}
                className="mt-0.5 accent-orange shrink-0" />
              <span className="text-xs text-ink-muted">
                Li e concordo com os{' '}
                <Link href="/termos" className="text-orange font-semibold hover:underline">Termos de Uso</Link>
                {' '}e a{' '}
                <Link href="/privacidade" className="text-orange font-semibold hover:underline">Política de Privacidade</Link>.
              </span>
            </label>

            {error && (
              <div className="px-3 py-2.5 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
            )}

            <button type="submit" disabled={loading || !aceito} className="btn btn-primary w-full btn-lg mt-1">
              {loading ? 'Criando conta...' : 'Criar minha conta'}
            </button>
          </form>

          <p className="text-center text-sm text-ink-muted mt-6">
            Já tem conta?{' '}
            <Link href="/auth/login" className="text-orange font-semibold hover:underline">Fazer login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
```

---

## 8. DASHBOARD CLIENTE — substituir completamente

```tsx
// frontend/app/cliente/page.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { orders } from '@/lib/api'
import { formatBRL, statusLabel } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

const STATUS_BADGE: Record<string, string> = {
  AGUARDANDO: 'badge badge-yellow',
  PAGA: 'badge badge-blue',
  ACEITA: 'badge badge-indigo',
  EM_EXECUCAO: 'badge badge-purple',
  AGUARDANDO_QA: 'badge badge-orange',
  QA_REPROVADO: 'badge badge-red',
  AGUARDANDO_CONFIRMACAO: 'badge badge-teal',
  CONCLUIDA: 'badge badge-green',
  CANCELADA: 'badge badge-gray',
  EM_DISPUTA: 'badge badge-red',
  DEMANDA_ESPECIAL: 'badge badge-gold',
}

export default function ClienteHome() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [demandas, setDemandas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    orders.listarMinhas()
      .then(d => setDemandas(Array.isArray(d) ? d : []))
      .catch(() => toast('Erro ao carregar demandas', 'error'))
      .finally(() => setLoading(false))
  }, [user, authLoading, router, toast])

  if (authLoading || !user) return null

  const ativas    = demandas.filter(d => !['CONCLUIDA','CANCELADA'].includes(d.status))
  const concluidas = demandas.filter(d => d.status === 'CONCLUIDA')
  const valorTotal = concluidas.reduce((s, d) => s + (d.valor_total || 0), 0)

  return (
    <Shell>
      <Topbar
        title={`Olá, ${user.nome.split(' ')[0]}`}
        actions={
          <Link href="/cliente/nova-demanda" className="btn btn-primary">
            + Nova demanda
          </Link>
        }
      />

      <main className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <div className="kpi-card">
            <p className="kpi-value text-orange">{ativas.length}</p>
            <p className="kpi-label">Demandas ativas</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-value">{concluidas.length}</p>
            <p className="kpi-label">Concluídas</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-value">{demandas.length}</p>
            <p className="kpi-label">Total de demandas</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-value">{formatBRL(valorTotal)}</p>
            <p className="kpi-label">Valor investido</p>
          </div>
        </div>

        {/* Tabela de demandas */}
        <div className="card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
            <h2 className="text-sm font-semibold text-navy">Suas demandas</h2>
            <Link href="/cliente/demandas" className="text-xs text-orange font-semibold hover:underline">
              Ver todas →
            </Link>
          </div>

          {loading ? (
            <div className="px-4 py-10 text-center text-sm text-ink-muted">Carregando...</div>
          ) : demandas.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-ink-muted mb-4">Nenhuma demanda ainda.</p>
              <Link href="/cliente/nova-demanda" className="btn btn-primary btn-sm">
                Criar primeira demanda
              </Link>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Serviço</th>
                  <th>Status</th>
                  <th>Cidade</th>
                  <th>Área</th>
                  <th className="text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {demandas.slice(0, 10).map(d => {
                  const s = statusLabel(d.status)
                  const badgeCls = STATUS_BADGE[d.status] || 'badge badge-gray'
                  return (
                    <tr key={d.id} onClick={() => router.push(`/cliente/demandas/${d.id}`)}>
                      <td className="mono">{d.numero || d.id?.slice(0,8)}</td>
                      <td className="font-medium text-navy">{d.svc_nome || d.svc_codigo}</td>
                      <td><span className={badgeCls}>{s.text}</span></td>
                      <td>{d.cidade || '—'}</td>
                      <td>{d.area_m2 ? `${d.area_m2}m²` : '—'}</td>
                      <td className="text-right font-mono font-semibold text-navy">
                        {formatBRL(d.valor_total || d.preco_servico || 0)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </Shell>
  )
}
```

---

## 9. PÁGINA DE CONFIGURAÇÕES — criar nova

```tsx
// frontend/app/configuracoes/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { tokenStorage, userStorage } from '@/lib/api'

export default function ConfiguracoesPage() {
  const router = useRouter()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const handleCancelarConta = () => {
    if (confirmText !== 'CONFIRMAR') return
    // TODO: chamar DELETE /api/auth/cancelar-conta quando endpoint existir
    tokenStorage.clear()
    userStorage.clear()
    router.push('/auth/login')
  }

  return (
    <Shell>
      <Topbar title="Configurações" />

      <main className="p-6 max-w-2xl space-y-6">

        {/* Aparência */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-navy mb-4">Aparência</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-primary font-medium">Tema</p>
              <p className="text-xs text-ink-muted">Claro · o tema escuro estará disponível em breve</p>
            </div>
            <span className="badge badge-gray">Claro</span>
          </div>
        </div>

        {/* Conta */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-navy mb-4">Conta</h2>
          <div className="space-y-3 text-sm text-ink-secondary">
            <div className="flex justify-between">
              <span className="text-ink-muted">E-mail</span>
              <span className="font-medium text-navy">—</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Tipo</span>
              <span className="font-medium text-navy">—</span>
            </div>
          </div>
        </div>

        {/* Zona de perigo */}
        <div className="card p-5 border-red-200 bg-red-50/40">
          <h2 className="text-sm font-semibold text-red-700 mb-1">Zona de perigo</h2>
          <p className="text-xs text-red-600/80 mb-4">
            Ao cancelar sua conta, você perderá o acesso imediatamente.
            Seus dados são mantidos por 60 dias conforme a LGPD (Art. 18).
            Esta ação é irreversível.
          </p>
          <button
            onClick={() => setShowCancelModal(true)}
            className="btn btn-sm border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
          >
            Cancelar minha conta
          </button>
        </div>
      </main>

      {/* Modal de confirmação */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-base font-bold text-navy mb-2">Cancelar conta</h3>
            <p className="text-sm text-ink-secondary mb-4">
              Esta ação não pode ser desfeita. Digite <strong>CONFIRMAR</strong> para prosseguir.
            </p>
            <input
              className="input mb-4"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="Digite CONFIRMAR"
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowCancelModal(false); setConfirmText('') }}
                className="btn btn-secondary flex-1">
                Cancelar
              </button>
              <button
                onClick={handleCancelarConta}
                disabled={confirmText !== 'CONFIRMAR'}
                className="btn btn-danger flex-1"
              >
                Confirmar cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}
```

---

## 10. INSTRUÇÕES FINAIS DE EXECUÇÃO

Após aplicar todas as alterações acima:

1. Verificar que `frontend/components/layout/Shell.tsx` foi criado corretamente.
2. Remover ou deixar `frontend/components/layout/AppShell.tsx` e `BottomNav.tsx` — eles não são mais importados pelas páginas novas.
3. Rodar:
   ```bash
   cd frontend && npm run build
   ```
4. Se houver erro de importação de `AppShell` ou `BottomNav` em outras páginas (admin, etc.), substituir por:
   ```tsx
   import { Shell, Topbar } from '@/components/layout/Shell'
   ```
   e envolver o conteúdo em `<Shell><Topbar title="..." /><main>...</main></Shell>`.
5. Confirmar que `npm run build` passa sem erros.
6. Retornar o resultado do build.
Abrir o arquivo CLAUDE.md na raiz do projeto SUEDFLOW e adicionar,
sem remover nada existente, as seguintes seções ao final:

## Convenções de código (Frontend)
- Sempre usar componentes funcionais com hooks
- Props tipadas com TypeScript explícito
- Nunca usar document.querySelector — usar useRef
- Nunca mutar estado diretamente — sempre setState/useState
- Componentes acima de 150 linhas devem ser divididos
- Importar apenas o que for usado (tree-shaking)

## O que NUNCA fazer
- Nunca colocar credenciais no código (nem de teste)
- Nunca usar any explícito no TypeScript
- Nunca chamar API direto no componente — sempre via lib/api.ts
- Nunca duplicar lógica de autenticação — sempre via useAuth hook
- Nunca alterar arquivos em lib/api.ts, lib/utils.ts sem revisão
- Nunca usar glass-morphism, backdrop-blur ou gradientes decorativos no frontend

## Ao fazer mudanças no frontend
1. Manter o layout Shell + Sidebar — nunca voltar para AppShell/BottomNav
2. Usar as classes CSS definidas em globals.css (.btn, .card, .input, .badge, .data-table)
3. Tabelas densas para listas, não cards empilhados
4. Verificar npm run build sem erros antes de commitar

Retornar confirmação de que o arquivo foi atualizado.