// app/auth/login/page.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppShell, StatusBar } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'
import { Input, Field } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState('admin@suedflow.com.br')
  const [senha, setSenha] = useState('Suedflow@2026!')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const u = await login(email, senha)
      toast(`Bem-vindo, ${u.nome.split(' ')[0]}!`, 'success')
      // Redirecionar conforme tipo
      if (u.tipo === 'ADMIN') router.push('/admin')
      else if (u.tipo === 'PROFISSIONAL') router.push('/cliente') // por enquanto
      else router.push('/cliente')
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell>
      <StatusBar />
      <div className="relative px-6 pt-12 pb-12 min-h-[calc(100vh-40px)]">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-30 blur-3xl" style={{ background: 'var(--orange)' }} />

        <Link href="/" className="back-btn mb-6 inline-flex">←</Link>

        <h1 className="text-2xl font-black mb-1">Entrar</h1>
        <p className="text-sm text-white/65 mb-8">Acesse sua conta SUEDFLOW</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="E-mail" required>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
              required
            />
          </Field>
          <Field label="Senha" required>
            <Input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha"
              autoComplete="current-password"
              required
            />
            <Link href="/auth/recuperar" className="text-xs text-orange font-semibold mt-1 inline-block">
              Esqueci minha senha
            </Link>
          </Field>

          {error && (
            <div className="px-4 py-3 rounded-xl border border-red/30 bg-red/10 text-red text-sm">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full btn-lg">
            Entrar
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/45 uppercase tracking-wider">ou</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <p className="text-center text-sm text-white/65">
          Não tem conta ainda?{' '}
          <Link href="/auth/cadastro" className="text-orange font-bold">Cadastre-se grátis →</Link>
        </p>
      </div>
    </AppShell>
  )
}
