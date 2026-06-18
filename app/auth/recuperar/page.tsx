'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { auth as authApi } from '@/lib/api'
import { Eye, EyeOff } from 'lucide-react'

type Step = 'email' | 'otp'

export default function RecuperarSenhaPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const otpRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (step === 'otp') setTimeout(() => otpRef.current?.focus(), 200)
  }, [step])

  const handleEnviarEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null); setLoading(true)
    try {
      await authApi.recuperarSenha(email)
      setStep('otp')
    } catch (err: any) {
      setError(err.message || 'Não foi possível enviar o código de recuperação.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerificarOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) { setError('Digite os 6 dígitos do código.'); return }
    if (novaSenha.length < 6) { setError('A nova senha deve ter pelo menos 6 caracteres.'); return }
    setError(null); setLoading(true)
    try {
      await authApi.verificarOtp(email, otp, novaSenha)
      router.push('/auth/login?msg=senha_alterada')
    } catch (err: any) {
      setError(err.message || 'Código inválido ou expirado.')
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
          {step === 'email' ? (
            <>
              <h1 className="text-xl font-bold text-white mb-1">Recuperar senha</h1>
              <p className="text-sm mb-6" style={{ color: 'var(--text3)' }}>
                Informe seu e-mail cadastrado para receber o código de redefinição.
              </p>

              <form onSubmit={handleEnviarEmail} className="space-y-4">
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

                {error && <div className="text-sm" style={{ color: 'var(--red)' }}>{error}</div>}

                <button type="submit" disabled={loading} className="btn btn-primary w-full">
                  {loading ? 'Enviando...' : 'Enviar código'}
                </button>

                <p className="text-center text-sm" style={{ color: 'var(--text3)' }}>
                  <Link href="/auth/login" className="font-semibold hover:underline" style={{ color: 'var(--orange)' }}>
                    Voltar ao login
                  </Link>
                </p>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-white mb-1">Redefinir senha</h1>
              <p className="text-sm mb-6" style={{ color: 'var(--text3)' }}>
                Código enviado para <span className="font-semibold" style={{ color: 'var(--text2)' }}>{email}</span>.
                Válido por 15 minutos.
              </p>

              <form onSubmit={handleVerificarOtp} className="space-y-4">
                <div>
                  <label className="label">Código de verificação</label>
                  <input
                    ref={otpRef}
                    className="input text-center text-2xl font-bold tracking-[0.5em]"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    required
                  />
                </div>

                <div>
                  <label className="label">Nova senha</label>
                  <div className="relative">
                    <input
                      className="input pr-10"
                      type={showSenha ? 'text' : 'password'}
                      value={novaSenha}
                      onChange={e => setNovaSenha(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      minLength={6}
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

                {error && <div className="text-sm" style={{ color: 'var(--red)' }}>{error}</div>}

                <button type="submit" disabled={loading || otp.length !== 6} className="btn btn-primary w-full">
                  {loading ? 'Redefinindo...' : 'Redefinir senha'}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep('email'); setOtp(''); setError(null) }}
                  className="w-full text-center text-sm"
                  style={{ color: 'var(--text3)' }}
                >
                  ← Tentar com outro e-mail
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
