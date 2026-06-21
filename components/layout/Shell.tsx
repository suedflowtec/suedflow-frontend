// frontend/components/layout/Shell.tsx
'use client'
import { useState, useEffect, createContext, useContext } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutGrid, List, Plus, Home, Radar, Wallet, Star,
  User, Settings, FlaskConical, HeartPulse, ArrowLeftRight,
  LogOut, Sun, Moon, ChevronLeft, ChevronRight, Menu, X, ShieldCheck,
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Avatar } from '@/components/ui/Avatar'
import { SueChat } from '@/components/ui/SueChat'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'

// ── Context para o toggle da sidebar ─────────────────────────
const SidebarCtx = createContext<{ open: boolean; toggle: () => void }>({
  open: true,
  toggle: () => {},
})
export const useSidebar = () => useContext(SidebarCtx)

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
    { href: '/admin',               Icon: LayoutGrid,   label: 'Dashboard' },
    { href: '/admin/demandas',      Icon: List,         label: 'Demandas' },
    { href: '/admin/profissionais', Icon: Star,         label: 'Profissionais' },
    { href: '/admin/precos',        Icon: Settings,     label: 'Motor UTS' },
    { href: '/admin/teste',         Icon: FlaskConical, label: 'Ferramentas' },
    { href: '/admin/health',        Icon: HeartPulse,   label: 'Saúde do sistema' },
    { href: '/curador',             Icon: ShieldCheck,  label: 'Curadoria' },
    { href: '/curador/fila',        Icon: List,         label: 'Fila de casos' },
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

  // sidebar state — desktop: collapsible; mobile: overlay
  const [open, setOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setOpen(false)
      } else {
        const saved = localStorage.getItem('sb_open')
        setOpen(saved !== 'false')
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggle_sidebar = () => {
    setOpen(v => {
      const next = !v
      if (!isMobile) localStorage.setItem('sb_open', String(next))
      return next
    })
  }

  const nav = getNav(user, pathname)
  const temAmbosPerfis = !!(user?.cliente && user?.profissional)
  const emModoProfissional = pathname.startsWith('/profissional')

  const TIPO_LABEL: Record<string, string> = {
    CLIENTE: 'Cliente', PROFISSIONAL: 'Profissional',
    ADMIN: 'Administrador', MODERADOR: 'Moderador',
    CURADOR_SUPORTE: 'Curador Suporte', CURADOR_SENIOR: 'Curador Sênior',
  }

  const sidebarW = open ? 256 : (isMobile ? 0 : 64)

  return (
    <SidebarCtx.Provider value={{ open, toggle: toggle_sidebar }}>
      <div className="flex min-h-screen" style={{ background: 'var(--navy)' }}>

        {/* Backdrop mobile */}
        {open && isMobile && (
          <div
            className="fixed inset-0 z-[39] bg-black/60"
            onClick={() => setOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className="fixed h-full z-40 flex flex-col transition-all duration-300 overflow-hidden"
          style={{
            width: open ? 256 : (isMobile ? 0 : 64),
            background: 'rgba(5,14,26,0.99)',
            borderRight: '1px solid rgba(255,255,255,0.07)',
            borderTop: '3px solid var(--orange)',
          }}
        >
          {/* Logo + toggle */}
          <div
            className="h-16 flex items-center shrink-0 transition-all"
            style={{
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              padding: open ? '0 12px 0 16px' : '0 12px',
              justifyContent: open ? 'space-between' : 'center',
            }}
          >
            {open && <Logo height={42} />}
            <button
              onClick={toggle_sidebar}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors shrink-0"
              style={{ color: 'var(--text3)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              title={open ? 'Recolher menu' : 'Expandir menu'}
            >
              {open
                ? <ChevronLeft size={16} strokeWidth={2} />
                : <ChevronRight size={16} strokeWidth={2} />
              }
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
            {nav.map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => isMobile && setOpen(false)}
                  className={`nav-item ${active ? 'active' : ''} ${!open ? 'justify-center px-0' : ''}`}
                  title={!open ? item.label : undefined}
                >
                  <item.Icon size={16} strokeWidth={1.8} className="shrink-0" />
                  {open && <span>{item.label}</span>}
                </Link>
              )
            })}

            <div className="pt-3 mt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <Link
                href="/configuracoes"
                onClick={() => isMobile && setOpen(false)}
                className={`nav-item ${pathname === '/configuracoes' ? 'active' : ''} ${!open ? 'justify-center px-0' : ''}`}
                title={!open ? 'Configurações' : undefined}
              >
                <Settings size={16} strokeWidth={1.8} className="shrink-0" />
                {open && <span>Configurações</span>}
              </Link>

              <button
                onClick={toggle}
                className={`nav-item w-full text-left mt-0.5 ${!open ? 'justify-center px-0' : ''}`}
                title={!open ? (theme === 'dark' ? 'Tema claro' : 'Tema escuro') : undefined}
              >
                {theme === 'dark'
                  ? <Sun size={16} strokeWidth={1.8} className="shrink-0" />
                  : <Moon size={16} strokeWidth={1.8} className="shrink-0" />
                }
                {open && <span>{theme === 'dark' ? 'Tema claro' : 'Tema escuro'}</span>}
              </button>
            </div>
          </nav>

          {/* Footer — visível apenas com sidebar aberta */}
          {open && (
            <div className="p-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              {temAmbosPerfis && (
                <Link
                  href={emModoProfissional ? '/cliente' : '/profissional'}
                  onClick={() => isMobile && setOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-2 py-2 mb-2 rounded-xl text-xs font-semibold transition-colors"
                  style={{ background: 'var(--glass)', color: 'var(--orange)', border: '1px solid var(--border)' }}
                >
                  <ArrowLeftRight size={13} strokeWidth={2} />
                  {emModoProfissional ? 'Modo Cliente' : 'Modo Profissional'}
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
                    {temAmbosPerfis
                      ? (emModoProfissional ? 'Profissional' : 'Cliente')
                      : (TIPO_LABEL[user?.tipo] ?? user?.tipo ?? '')}
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
          )}

          {/* Footer compacto — sidebar fechada no desktop */}
          {!open && !isMobile && (
            <div className="pb-3 flex flex-col items-center gap-2 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12 }}>
              <Avatar nome={user?.nome} fotoUrl={user?.foto_perfil} size={28} />
              <button
                onClick={logout}
                title="Sair da conta"
                className="w-8 h-8 flex items-center justify-center rounded-lg"
                style={{ color: 'var(--orange)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(232,103,26,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <LogOut size={14} strokeWidth={2} />
              </button>
            </div>
          )}
        </aside>

        {/* Content */}
        <div
          className="flex-1 flex flex-col min-h-screen transition-all duration-300"
          style={{ marginLeft: sidebarW }}
        >
          {children}
        </div>

        {/* Botão hamburger mobile (quando sidebar fechada) */}
        {!open && isMobile && (
          <button
            onClick={() => setOpen(true)}
            className="fixed top-3 left-3 z-[38] w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{
              background: 'rgba(5,14,26,0.95)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <Menu size={18} color="var(--orange)" strokeWidth={2} />
          </button>
        )}

        {/* SUE — assistente flutuante */}
        <SueChat />
      </div>
    </SidebarCtx.Provider>
  )
}

export function Topbar({ title, actions, subtitle }: {
  title: string
  actions?: React.ReactNode
  subtitle?: string
}) {
  return (
    <header className="topbar">
      <div className="flex-1 min-w-0">
        <h1 className="page-title truncate">{title}</h1>
        {subtitle && <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text3)' }}>{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </header>
  )
}
