// frontend/app/auth/cadastro/CadastroClient.tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth as authApi, termos as termosApi, tokenStorage, userStorage } from '@/lib/api'
import { useToast } from '@/hooks/useToast'
import { Logo } from '@/components/ui/Logo'
import { Eye, EyeOff, MailCheck, RefreshCw } from 'lucide-react'

type Step = 'form' | 'verify'

export default function CadastroClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [tipo, setTipo] = useState<'CLIENTE' | 'PROFISSIONAL'>('CLIENTE')
  const [form, setForm] = useState({
    nome: '', email: '', senha: '', cpf: '', cnpj: '', telefone: '',
    estado: 'PB', cidade: 'João Pessoa',
  })
  const [showSenha, setShowSenha] = useState(false)
  const [aceito, setAceito] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [termosIds, setTermosIds] = useState<string[]>([])

  // Passo 2 — verificação OTP
  const [step, setStep] = useState<Step>('form')
  const [verifyUserId, setVerifyUserId] = useState('')
  const [verifyEmail, setVerifyEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [reenvioLoading, setReenvioLoading] = useState(false)
  const otpRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchParams?.get('tipo') === 'PROFISSIONAL') setTipo('PROFISSIONAL')
  }, [searchParams])

  useEffect(() => {
    termosApi.listar(tipo).then(r => {
      setTermosIds(r.termos.map((t: { id: string }) => t.id))
    }).catch(() => {})
  }, [tipo])

  useEffect(() => {
    if (step === 'verify') setTimeout(() => otpRef.current?.focus(), 200)
  }, [step])

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!aceito) { setError('Aceite os termos para continuar.'); return }
    setError(null); setLoading(true)
    try {
      const result = await authApi.registrar({ ...form, tipo, termo_ids: termosIds })

      if (result.step === 'verify') {
        // Novo usuário — aguarda verificação por OTP
        setVerifyUserId(result.userId)
        setVerifyEmail(result.email)
        setStep('verify')
      } else if (result.token) {
        // Usuário existente adicionando perfil — token retornado diretamente
        tokenStorage.set(result.token)
        userStorage.set(result.usuario)
        toast('Perfil adicionado com sucesso!', 'success')
        router.push(tipo === 'PROFISSIONAL' ? '/profissional/onboarding' : '/cliente')
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) { setError('Digite os 6 dígitos do código.'); return }
    setError(null); setLoading(true)
    try {
      const data = await authApi.verificarCadastro(verifyUserId, otp)
      tokenStorage.set(data.token)
      userStorage.set(data.usuario)
      toast('E-mail confirmado! Bem-vindo à SUEDFLOW.', 'success')
      router.push(tipo === 'PROFISSIONAL' ? '/profissional/onboarding' : '/cliente')
    } catch (err: any) {
      setError(err.message || 'Código inválido. Verifique e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleReenvio = async () => {
    setReenvioLoading(true)
    try {
      await authApi.reenviarOtpCadastro(verifyUserId)
      toast('Novo código enviado para seu e-mail.', 'success')
      setOtp('')
      setError(null)
    } catch {
      toast('Não foi possível reenviar. Tente em instantes.', 'error')
    } finally {
      setReenvioLoading(false)
    }
  }

  // ── Passo 2: verificação OTP ───────────────────────────────────
  if (step === 'verify') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: 'var(--navy)' }}>
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, var(--orange), var(--orange2))' }}
            >
              <MailCheck size={28} color="white" />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>Confirme seu e-mail</h1>
            <p className="text-sm" style={{ color: 'var(--text3)' }}>
              Enviamos um código de 6 dígitos para<br />
              <span className="font-semibold" style={{ color: 'var(--text2)' }}>{verifyEmail}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
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
              <p className="text-xs mt-1.5" style={{ color: 'var(--text3)' }}>Válido por 30 minutos.</p>
            </div>

            {error && (
              <div className="px-3 py-2.5 rounded-xl text-sm" style={{ background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.25)', color: 'var(--red)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading || otp.length !== 6} className="btn btn-primary w-full btn-lg">
              {loading ? 'Verificando…' : 'Confirmar e-mail'}
            </button>

            <button
              type="button"
              onClick={handleReenvio}
              disabled={reenvioLoading}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm transition-opacity disabled:opacity-50"
              style={{ color: 'var(--text3)' }}
            >
              <RefreshCw size={14} className={reenvioLoading ? 'animate-spin' : ''} />
              {reenvioLoading ? 'Enviando…' : 'Reenviar código'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── Passo 1: formulário de cadastro ───────────────────────────
  return (
    <div className="min-h-screen flex" style={{ background: 'var(--surface)' }}>
      {/* Painel esquerdo */}
      <div className="hidden lg:flex w-[420px] shrink-0 flex-col justify-between p-10" style={{ background: 'var(--navy)' }}>
        <Link href="/">
          <Logo height={36} />
        </Link>
        <div>
          <p className="text-sm mb-3 uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Cadastro gratuito
          </p>
          <h2 className="text-3xl font-black leading-snug mb-4" style={{ color: '#fff' }}>
            Comece a usar<br />
            <span style={{ color: 'var(--orange)' }}>em menos de 2 minutos.</span>
          </h2>
          <ul className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <li>✓ Sem mensalidade para começar</li>
            <li>✓ ART/RRT embutida em cada serviço</li>
            <li>✓ Pagamento protegido em escrow</li>
          </ul>
        </div>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>SUEDFLOW TECNOLOGIA INOVA SIMPLES (I.S.) · CNPJ 67.671.499/0001-30 · João Pessoa/PB</p>
      </div>

      {/* Formulário */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-6">
            <Link href="/"><Logo height={32} /></Link>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>Criar conta</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text3)' }}>Cadastro gratuito · Sem mensalidade inicial</p>

          {/* Toggle tipo */}
          <div className="flex p-1 rounded-xl mb-6" style={{ background: 'var(--glass)', border: '1px solid var(--border)' }}>
            {(['CLIENTE', 'PROFISSIONAL'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTipo(t)}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all"
                style={{
                  background: tipo === t ? 'linear-gradient(135deg, var(--orange), var(--orange2))' : 'transparent',
                  color: tipo === t ? '#fff' : 'var(--text3)',
                  boxShadow: tipo === t ? '0 2px 8px rgba(232,103,26,0.35)' : 'none',
                }}
              >
                {t === 'CLIENTE' ? 'Sou cliente' : 'Sou profissional'}
              </button>
            ))}
          </div>

          <p className="text-xs mb-4" style={{ color: 'var(--text3)' }}>
            Já tem uma conta como {tipo === 'CLIENTE' ? 'profissional' : 'cliente'}? Use o mesmo e-mail e senha para
            adicionar o perfil de {tipo === 'CLIENTE' ? 'cliente' : 'profissional'} à sua conta.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="label">Nome completo</label>
              <input className="input" value={form.nome} onChange={e => update('nome', e.target.value)} placeholder="Seu nome completo" required />
            </div>
            <div>
              <label className="label">{tipo === 'CLIENTE' ? 'CPF ou CNPJ' : 'CPF'}</label>
              <input className="input" value={form.cpf} onChange={e => update('cpf', e.target.value)} placeholder="000.000.000-00" required />
            </div>
            <div>
              <label className="label">E-mail</label>
              <input className="input" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="seu@email.com" required />
            </div>
            <div>
              <label className="label">Telefone (WhatsApp)</label>
              <input className="input" value={form.telefone} onChange={e => update('telefone', e.target.value)} placeholder="(83) 99999-0000" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Estado</label>
                <select className="input" value={form.estado} onChange={e => update('estado', e.target.value)}>
                  <option value="PB">Paraíba</option>
                  <option value="PE">Pernambuco</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="CE">Ceará</option>
                </select>
              </div>
              <div>
                <label className="label">Cidade</label>
                <input className="input" value={form.cidade} onChange={e => update('cidade', e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showSenha ? 'text' : 'password'}
                  value={form.senha}
                  onChange={e => update('senha', e.target.value)}
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

            <label className="flex items-start gap-2 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={aceito}
                onChange={e => setAceito(e.target.checked)}
                className="mt-0.5 shrink-0"
                style={{ accentColor: 'var(--orange)' }}
              />
              <span className="text-xs" style={{ color: 'var(--text3)' }}>
                Li e concordo com os{' '}
                <Link href="/termos" className="font-semibold hover:underline" style={{ color: 'var(--orange)' }}>Termos de Uso</Link>
                {' '}e a{' '}
                <Link href="/privacidade" className="font-semibold hover:underline" style={{ color: 'var(--orange)' }}>Política de Privacidade</Link>.
              </span>
            </label>

            {error && (
              <div className="px-3 py-2.5 rounded-xl text-sm" style={{ background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.25)', color: 'var(--red)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading || !aceito} className="btn btn-primary w-full btn-lg mt-1">
              {loading ? 'Criando conta…' : 'Criar minha conta'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text3)' }}>
            Já tem conta?{' '}
            <Link href="/auth/login" className="font-semibold hover:underline" style={{ color: 'var(--orange)' }}>
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
