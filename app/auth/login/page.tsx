'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { Logo } from '@/components/ui/Logo'
import { Eye, EyeOff, ShieldAlert } from 'lucide-react'

type Modo = 'CLIENTE' | 'PROFISSIONAL' | 'ADMIN' | 'CURADOR'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { toast } = useToast()

  const [modo, setModo]         = useState<Modo>('CLIENTE')
  const [email, setEmail]       = useState('')
  const [senha, setSenha]       = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const u = await login(email, senha)

      if (modo === 'ADMIN') {
        if (u.tipo !== 'ADMIN' && u.tipo !== 'MODERADOR') {
          setError('Acesso não autorizado. Esta área é restrita aos administradores SUEDFLOW.')
          setLoading(false)
          return
        }
        toast(`Bem-vindo, ${u.nome.split(' ')[0]}.`, 'success')
        router.push('/admin')
        return
      }

      if (modo === 'CURADOR') {
        if (u.tipo !== 'CURADOR_SUPORTE' && u.tipo !== 'CURADOR_SENIOR' && u.tipo !== 'ADMIN') {
          setError('Acesso não autorizado. Esta área é restrita aos curadores SUEDFLOW.')
          setLoading(false)
          return
        }
        toast(`Bem-vindo, ${u.nome.split(' ')[0]}.`, 'success')
        router.push('/curador')
        return
      }

      if (modo === 'PROFISSIONAL') {
        if (!u.profissional) {
          setError('Você não possui cadastro como profissional. Cadastre-se como profissional primeiro.')
          setLoading(false)
          return
        }
        toast(`Bem-vindo, ${u.nome.split(' ')[0]}!`, 'success')
        router.push('/profissional')
        return
      }

      // Modo CLIENTE (padrão)
      toast(`Bem-vindo, ${u.nome.split(' ')[0]}!`, 'success')
      router.push('/cliente')
    } catch (err: any) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.')
      } else {
        setError(err.message || 'E-mail ou senha inválidos.')
      }
    } finally {
      setLoading(false)
    }
  }

  const isAdmin    = modo === 'ADMIN'
  const isCurador  = modo === 'CURADOR'
  const isRestrito = isAdmin || isCurador

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Painel esquerdo — navy */}
      <div className={`hidden lg:flex w-[420px] shrink-0 flex-col justify-between p-10 transition-colors duration-300 ${isRestrito ? 'bg-[#0A0E18]' : 'bg-navy'}`}>
        <Link href="/">
          <Logo height={36} />
        </Link>
        <div>
          {isAdmin ? (
            <>
              <p className="text-orange/70 text-xs mb-3 uppercase tracking-widest font-semibold flex items-center gap-2">
                <ShieldAlert size={13} /> Área restrita
              </p>
              <h2 className="text-3xl font-black text-white leading-snug mb-4">
                Acesso exclusivo<br />
                <span className="text-orange">administradores</span>
              </h2>
              <p className="text-white/40 text-sm">
                Somente administradores e moderadores têm acesso a este painel.
              </p>
            </>
          ) : isCurador ? (
            <>
              <p className="text-orange/70 text-xs mb-3 uppercase tracking-widest font-semibold flex items-center gap-2">
                <ShieldAlert size={13} /> Painel de curadoria
              </p>
              <h2 className="text-3xl font-black text-white leading-snug mb-4">
                Curadoria de<br />
                <span className="text-orange">qualidade técnica</span>
              </h2>
              <p className="text-white/40 text-sm">
                Revisão de entregas, aprovação de KYC e resolução de disputas.
              </p>
            </>
          ) : (
            <>
              <p className="text-white/50 text-sm mb-3 uppercase tracking-widest font-semibold">Plataforma técnica</p>
              <h2 className="text-3xl font-black text-white leading-snug mb-4">
                Engenharia com<br />
                <span className="text-orange">responsabilidade técnica</span><br />
                garantida.
              </h2>
              <p className="text-white/50 text-sm">ART embutida · Escrow protegido · Verificação SUE</p>
            </>
          )}
        </div>
        <p className="text-white/25 text-xs">SUEDFLOW Tecnologia Ltda. · João Pessoa/PB</p>
      </div>

      {/* Formulário */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Logo mobile */}
          <div className="lg:hidden mb-8">
            <Link href="/"><Logo height={32} /></Link>
          </div>

          {/* Seletor de perfil — visível apenas quando não está em modo restrito */}
          {!isRestrito && (
            <div className="flex gap-1 mb-8 p-1 rounded-xl" style={{ background: 'var(--glass)', border: '1px solid var(--border)' }}>
              {(['CLIENTE', 'PROFISSIONAL'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setModo(m); setError(null) }}
                  className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all"
                  style={{
                    background: modo === m ? 'linear-gradient(135deg, var(--orange), var(--orange2))' : 'transparent',
                    color: modo === m ? '#fff' : 'var(--text3)',
                    boxShadow: modo === m ? '0 2px 8px rgba(232,103,26,0.35)' : 'none',
                  }}
                >
                  {m === 'CLIENTE' ? 'Sou cliente' : 'Sou profissional'}
                </button>
              ))}
            </div>
          )}

          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>
            {isAdmin ? 'Acesso administrativo' : isCurador ? 'Acesso curador' : 'Entrar'}
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text3)' }}>
            {isAdmin    ? 'Restrito a administradores SUEDFLOW'
            : isCurador ? 'Painel de curadoria e qualidade'
            : modo === 'PROFISSIONAL' ? 'Acesse sua conta de profissional'
            : 'Acesse sua conta de cliente'}
          </p>

          {/* Aviso área restrita */}
          {isRestrito && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl mb-5 text-xs"
              style={{ background: 'rgba(232,103,26,0.08)', border: '1px solid rgba(232,103,26,0.2)', color: 'var(--text2)' }}>
              <ShieldAlert size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--orange)' }} />
              Acesso monitorado. Tentativas não autorizadas são registradas.
            </div>
          )}

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
                {!isAdmin && (
                  <Link href="/auth/recuperar" className="text-xs font-semibold hover:underline" style={{ color: 'var(--orange)' }}>
                    Esqueci a senha
                  </Link>
                )}
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
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text3)' }}
                  tabIndex={-1}
                >
                  {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-3 py-2.5 rounded-xl text-sm" style={{ background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.25)', color: 'var(--red)' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full btn-lg mt-2"
            >
              {loading ? 'Entrando…' : isAdmin ? 'Acessar painel admin' : isCurador ? 'Acessar painel curador' : 'Entrar'}
            </button>
          </form>

          {!isRestrito && (
            <p className="text-center text-sm mt-6" style={{ color: 'var(--text3)' }}>
              Não tem conta?{' '}
              <Link href="/auth/cadastro" className="font-semibold hover:underline" style={{ color: 'var(--orange)' }}>
                Cadastre-se grátis
              </Link>
            </p>
          )}

          {/* Links de acesso restrito na base */}
          <div className="mt-10 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
            {isRestrito ? (
              <button
                type="button"
                onClick={() => { setModo('CLIENTE'); setError(null) }}
                className="text-xs hover:underline w-full text-center"
                style={{ color: 'var(--text3)' }}
              >
                ← Voltar para login de clientes
              </button>
            ) : (
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => { setModo('CURADOR'); setError(null) }}
                  className="text-xs hover:underline"
                  style={{ color: 'var(--text3)' }}
                >
                  Acesso curador
                </button>
                <button
                  type="button"
                  onClick={() => { setModo('ADMIN'); setError(null) }}
                  className="text-xs hover:underline"
                  style={{ color: 'var(--text3)' }}
                >
                  Acesso administrador
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
