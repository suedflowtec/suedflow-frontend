'use client'
import { useState } from 'react'
import Link from 'next/link'
import { auth as authApi } from '@/lib/api'

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null); setLoading(true)
    try {
      await authApi.recuperarSenha(email)
      setEnviado(true)
    } catch (err: any) {
      setError(err.message || 'Não foi possível enviar o e-mail de recuperação.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--navy)' }}>
      <div className="w-full max-w-sm">
        <Link href="/" className="font-black text-white text-xl tracking-tight block mb-8 text-center">
          SUED<span style={{ color: 'var(--orange)' }}>FLOW</span>
        </Link>

        <div className="card">
          <h1 className="text-xl font-bold text-white mb-1">Recuperar senha</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text3)' }}>
            Informe seu e-mail cadastrado para receber as instruções de redefinição.
          </p>

          {enviado ? (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: 'var(--green)' }}>
                ✓ Se o e-mail estiver cadastrado, você receberá um link de redefinição em breve.
              </p>
              <Link href="/auth/login" className="btn btn-primary w-full">Voltar ao login</Link>
            </div>
          ) : (
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

              {error && (
                <div className="text-sm" style={{ color: 'var(--red)' }}>{error}</div>
              )}

              <button type="submit" disabled={loading} className="btn btn-primary w-full">
                {loading ? 'Enviando...' : 'Enviar instruções'}
              </button>

              <p className="text-center text-sm" style={{ color: 'var(--text3)' }}>
                <Link href="/auth/login" className="font-semibold hover:underline" style={{ color: 'var(--orange)' }}>
                  Voltar ao login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
