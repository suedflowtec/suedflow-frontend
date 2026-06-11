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
