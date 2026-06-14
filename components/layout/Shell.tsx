// frontend/components/layout/Shell.tsx
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
    { href: '/admin/health',          icon: '❤', label: 'Saúde do sistema' },
  ],
  CURADOR: [
    { href: '/curador',      icon: '⊞', label: 'Painel' },
    { href: '/curador/fila', icon: '≡', label: 'Fila de casos' },
  ],
}

// v4.4.5.8 · item 8.12 — contas com perfil de Cliente e Profissional ao mesmo
// tempo decidem o menu pelo prefixo da rota atual, não mais por um `tipo`
// único da conta.
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
  const router   = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => { setUser(userStorage.get()) }, [])

  const nav = getNav(user, pathname)
  const temAmbosPerfis = !!(user?.cliente && user?.profissional)
  const emModoProfissional = pathname.startsWith('/profissional')

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
          {temAmbosPerfis && (
            <Link
              href={emModoProfissional ? '/cliente' : '/profissional'}
              className="w-full flex items-center justify-center gap-2 px-2 py-2 mb-2 rounded-xl text-xs font-semibold transition-colors"
              style={{ background: 'var(--glass)', color: 'var(--orange)', border: '1px solid var(--border)' }}
            >
              <span>⇄</span>
              {emModoProfissional ? 'Mudar para modo Cliente' : 'Mudar para modo Profissional'}
            </Link>
          )}
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
