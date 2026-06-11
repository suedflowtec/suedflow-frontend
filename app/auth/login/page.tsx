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
