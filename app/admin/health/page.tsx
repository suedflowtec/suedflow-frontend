'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { health } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

export default function AdminHealth() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
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

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (!['ADMIN', 'MODERADOR'].includes(user.tipo)) { router.push('/curador'); return }
    checar()
  }, [user, authLoading, router])

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
