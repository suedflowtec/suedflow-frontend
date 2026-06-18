// frontend/components/layout/Shell.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutGrid, List, Plus, Home, Radar, Wallet, Star,
  User, Settings, FlaskConical, HeartPulse, ArrowLeftRight,
  LogOut, Sun, Moon,
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Avatar } from '@/components/ui/Avatar'
import { SueChat } from '@/components/ui/SueChat'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'

const NAV = {
  CLIENTE: [
    { href: '/cliente',              Icon: LayoutGrid, label: 'Painel' },
    { href: '/cliente/demandas',     Icon: List,        label: 'Demandas' },
    { href: '/cliente/nova-demanda', Icon: Plus,        label: 'Nova demanda' },
    { href: '/cliente/imoveis',      Icon: Home,        label: 'Meus imóveis' },
  ],
  PROFISSIONAL: [
    { href: '/profissional',            Icon: LayoutGrid, label: 'Painel' },
    { href: '/profissional/feed',       Icon: Radar,      label: 'Feed de demandas' },
    { href: '/profissional/demandas',   Icon: List,       label: 'Em andamento' },
    { href: '/profissional/financeiro', Icon: Wallet,     label: 'Financeiro' },
    { href: '/profissional/score',      Icon: Star,       label: 'Score SQP' },
    { href: '/profissional/perfil',     Icon: User,       label: 'Meu perfil' },
  ],
  ADMIN: [
    { href: '/admin',               Icon: LayoutGrid,  label: 'Dashboard' },
    { href: '/admin/demandas',      Icon: List,        label: 'Demandas' },
    { href: '/admin/profissionais', Icon: Star,        label: 'Profissionais' },
    { href: '/admin/precos',        Icon: Settings,    label: 'Motor UTS' },
    { href: '/admin/teste',         Icon: FlaskConical, label: 'Ferramentas' },
    { href: '/admin/health',        Icon: HeartPulse,  label: 'Saúde do sistema' },
  ],
  CURADOR: [
    { href: '/curador',      Icon: LayoutGrid, label: 'Painel' },
    { href: '/curador/fila', Icon: List,       label: 'Fila de casos' },
  ],
}

function getNav(user: any, pathname: string) {
  const tipo = user?.tipo
  if (tipo === 'ADMIN' || tipo === 'MODERADOR') return NAV.ADMIN
  if (tipo === 'CURADOR_SUPORTE' || tipo === 'CURADOR_SENIOR') return NAV.CURADOR
  if (user?.cliente && user?.profissional) {
    return pathname.startsWith('/profissional') ? NAV.PROFISSIONAL : NAV.CLIENTE
  }
  if (user?.profissional) return NAV.PROFISSIONAL
  return NAV.CLIENTE
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()

  const nav = getNav(user, pathname)
  const temAmbosPerfis = !!(user?.cliente && user?.profissional)
  const emModoProfissional = pathname.startsWith('/profissional')

  const TIPO_LABEL: Record<string, string> = {
    CLIENTE: 'Cliente', PROFISSIONAL: 'Profissional',
    ADMIN: 'Administrador', MODERADOR: 'Moderador',
    CURADOR_SUPORTE: 'Curador Suporte', CURADOR_SENIOR: 'Curador Sênior',
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--navy)' }}>
      {/* Sidebar */}
      <aside
        data-sidebar
        className="w-64 shrink-0 flex flex-col fixed h-full z-30"
        style={{ background: 'rgba(5,14,26,0.99)', borderRight: '1px solid rgba(255,255,255,0.07)', borderTop: '3px solid var(--orange)' }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <Logo height={46} />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {nav.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link key={item.href} href={item.href} className={`nav-item ${active ? 'active' : ''}`}>
                <item.Icon size={16} strokeWidth={1.8} className="shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}

          <div className="pt-3 mt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <Link href="/configuracoes" className={`nav-item ${pathname === '/configuracoes' ? 'active' : ''}`}>
              <Settings size={16} strokeWidth={1.8} className="shrink-0" />
              <span>Configurações</span>
            </Link>

            {/* Toggle tema claro/escuro */}
            <button
              onClick={toggle}
              className="nav-item w-full text-left mt-0.5"
              title={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
            >
              {theme === 'dark'
                ? <Sun size={16} strokeWidth={1.8} className="shrink-0" />
                : <Moon size={16} strokeWidth={1.8} className="shrink-0" />
              }
              <span>{theme === 'dark' ? 'Tema claro' : 'Tema escuro'}</span>
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {temAmbosPerfis && (
            <Link
              href={emModoProfissional ? '/cliente' : '/profissional'}
              className="w-full flex items-center justify-center gap-2 px-2 py-2 mb-2 rounded-xl text-xs font-semibold transition-colors"
              style={{ background: 'var(--glass)', color: 'var(--orange)', border: '1px solid var(--border)' }}
            >
              <ArrowLeftRight size={13} strokeWidth={2} />
              {emModoProfissional ? 'Mudar para modo Cliente' : 'Mudar para modo Profissional'}
            </Link>
          )}
          <div
            className="flex items-center gap-2.5 px-2 py-2 mb-1 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <Avatar nome={user?.nome} fotoUrl={user?.foto_perfil} size={28} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.username ? `@${user.username}` : (user?.nome?.split(' ')[0] ?? '—')}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text3)' }}>
                {TIPO_LABEL[user?.tipo] ?? user?.tipo ?? ''}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl text-xs font-semibold transition-colors"
            style={{ color: 'var(--orange)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(232,103,26,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <LogOut size={13} strokeWidth={2} />
            Sair da conta
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {children}
      </div>

      {/* SUE — assistente flutuante */}
      <SueChat />
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
