// frontend/app/auth/cadastro/CadastroClient.tsx
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth as authApi, tokenStorage, userStorage } from '@/lib/api'
import { useToast } from '@/hooks/useToast'

export default function CadastroClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [tipo, setTipo] = useState<'CLIENTE' | 'PROFISSIONAL'>('CLIENTE')
  const [form, setForm] = useState({
    nome: '', email: '', senha: '', cpf_cnpj: '', telefone: '',
    estado: 'PB', cidade: 'João Pessoa',
  })
  const [showSenha, setShowSenha] = useState(false)
  const [aceito, setAceito] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams?.get('tipo') === 'PROFISSIONAL') setTipo('PROFISSIONAL')
  }, [searchParams])

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!aceito) { setError('Aceite os termos para continuar.'); return }
    setError(null); setLoading(true)
    try {
      await authApi.registrar({ ...form, tipo })
      const data = await authApi.login(form.email, form.senha)
      tokenStorage.set(data.token)
      userStorage.set(data.usuario)
      toast('Conta criada com sucesso!', 'success')
      router.push(tipo === 'PROFISSIONAL' ? '/profissional/onboarding' : '/cliente')
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta.')
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
          <p className="text-white/50 text-sm mb-3 uppercase tracking-widest font-semibold">Cadastro gratuito</p>
          <h2 className="text-3xl font-black text-white leading-snug mb-4">
            Comece a usar<br />
            <span className="text-orange">em menos de 2 minutos.</span>
          </h2>
          <ul className="space-y-2 text-white/60 text-sm">
            <li>✓ Sem mensalidade para começar</li>
            <li>✓ ART/RRT embutida em cada serviço</li>
            <li>✓ Pagamento protegido em escrow</li>
          </ul>
        </div>
        <p className="text-white/25 text-xs">SUEDFLOW Tecnologia Ltda. · João Pessoa/PB</p>
      </div>

      {/* Formulário */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-6">
            <Link href="/" className="font-black text-navy text-xl tracking-tight">
              SUED<span className="text-orange">FLOW</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-navy mb-1">Criar conta</h1>
          <p className="text-sm text-ink-muted mb-6">Cadastro gratuito · Sem mensalidade inicial</p>

          {/* Toggle tipo */}
          <div className="flex border border-surface-border rounded overflow-hidden mb-6">
            {(['CLIENTE', 'PROFISSIONAL'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTipo(t)}
                className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                  tipo === t
                    ? 'bg-navy text-white'
                    : 'bg-white text-ink-secondary hover:bg-surface-hover'
                }`}
              >
                {t === 'CLIENTE' ? '🏠 Sou cliente' : '🔧 Sou profissional'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="label">Nome completo</label>
              <input className="input" value={form.nome} onChange={e => update('nome', e.target.value)} placeholder="Seu nome completo" required />
            </div>
            <div>
              <label className="label">{tipo === 'CLIENTE' ? 'CPF ou CNPJ' : 'CPF'}</label>
              <input className="input" value={form.cpf_cnpj} onChange={e => update('cpf_cnpj', e.target.value)} placeholder="000.000.000-00" required />
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
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                  required
                />
                <button type="button" onClick={() => setShowSenha(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-secondary" tabIndex={-1}>
                  {showSenha ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-2 pt-2 cursor-pointer">
              <input type="checkbox" checked={aceito} onChange={e => setAceito(e.target.checked)}
                className="mt-0.5 accent-orange shrink-0" />
              <span className="text-xs text-ink-muted">
                Li e concordo com os{' '}
                <Link href="/termos" className="text-orange font-semibold hover:underline">Termos de Uso</Link>
                {' '}e a{' '}
                <Link href="/privacidade" className="text-orange font-semibold hover:underline">Política de Privacidade</Link>.
              </span>
            </label>

            {error && (
              <div className="px-3 py-2.5 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
            )}

            <button type="submit" disabled={loading || !aceito} className="btn btn-primary w-full btn-lg mt-1">
              {loading ? 'Criando conta...' : 'Criar minha conta'}
            </button>
          </form>

          <p className="text-center text-sm text-ink-muted mt-6">
            Já tem conta?{' '}
            <Link href="/auth/login" className="text-orange font-semibold hover:underline">Fazer login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
