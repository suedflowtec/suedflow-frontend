// components/layout/BottomNav.tsx
'use client'
import { usePathname, useRouter } from 'next/navigation'

const ITEMS_CLIENTE = [
  { href: '/cliente',           icon: '🏠', label: 'Home' },
  { href: '/cliente/demandas',  icon: '📋', label: 'Demandas' },
  { href: '/cliente/nova-demanda', icon: '➕', label: 'Nova', highlight: true },
  { href: '/cliente/sue',       icon: '✨', label: 'SUE' },
  { href: '/cliente/perfil',    icon: '👤', label: 'Perfil' },
]

export function BottomNav({ items = ITEMS_CLIENTE }: { items?: typeof ITEMS_CLIENTE }) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="bottom-nav">
      {items.map(item => {
        const active = pathname === item.href || (item.href !== '/cliente' && pathname?.startsWith(item.href))
        return (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className={`bn-item ${active ? 'active' : ''} ${item.highlight ? 'relative' : ''}`}
          >
            {item.highlight ? (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center -mt-3 shadow-lg text-2xl text-white"
                style={{ background: 'linear-gradient(135deg, #E8671A, #FF7A2E)' }}
              >
                {item.icon}
              </div>
            ) : (
              <span className="bn-item-icon">{item.icon}</span>
            )}
            <span className="text-[10px]">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
