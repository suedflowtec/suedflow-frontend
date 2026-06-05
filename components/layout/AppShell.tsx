// components/layout/AppShell.tsx
'use client'
import { ReactNode } from 'react'

export function AppShell({ children, withBottomNav = false }: { children: ReactNode; withBottomNav?: boolean }) {
  return (
    <div className="app-shell" style={{ background: 'var(--bg-page)' }}>
      <div className={withBottomNav ? 'pb-24' : ''}>
        {children}
      </div>
    </div>
  )
}

export function StatusBar() {
  return (
    <div className="status-bar">
      <span>9:41</span>
      <span>●●● 5G 🔋</span>
    </div>
  )
}
