// app/auth/cadastro/CadastroClient.tsx
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AppShell, StatusBar } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'
import { Input, Field } from '@/components/ui/Input'
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
  const [aceito, setAceito] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const t = searchParams?.get('tipo')
    if (t === 'PROFISSIONAL') setTipo('PROFISSIONAL')
  }, [searchParams])

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!aceito) { setError('Aceite os termos para continuar'); return }
    setError(null); setLoading(true)
    try {
      await authApi.registrar({ ...form, tipo })
      const data = await authApi.login(form.email, form.senha)
      tokenStorage.set(data.token)
      userStorage.set(data.usuario)
      toast('Conta criada com sucesso!', 'success')
      router.push(tipo === 'PROFISSIONAL' ? '/profissional/onboarding' : '/cliente')
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell>
      <StatusBar />
      <div className="px-6 pt-6 pb-12">
        <Link href="/" className="back-btn mb-4 inline-flex">←</Link>

        <h1 className="text-2xl font-black mb-1">Criar conta</h1>
        <p className="text-sm text-white/65 mb-6">Cadastro gratuito · Sem mensalidade</p>

        <div className="flex gap-2 mb-5 p-1 rounded-xl" style={{ background: 'var(--glass)', border: '1px solid var(--border)' }}>
          <button
            type="button"
            onClick={() => setTipo('CLIENTE')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${tipo === 'CLIENTE' ? 'text-white shadow-lg' : 'text-white/60'}`}
            style={tipo === 'CLIENTE' ? { background: 'linear-gradient(135deg, #E8671A, #FF7A2E)' } : {}}
          >
            🏠 Sou cliente
          </button>
          <button
            type="button"
            onClick={() => setTipo('PROFISSIONAL')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${tipo === 'PROFISSIONAL' ? 'text-white shadow-lg' : 'text-white/60'}`}
            style={tipo === 'PROFISSIONAL' ? { background: 'linear-gradient(135deg, #E8671A, #FF7A2E)' } : {}}
          >
            👷 Sou profissional
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          <Field label="Nome completo" required>
            <Input value={form.nome} onChange={e => update('nome', e.target.value)} placeholder="Seu nome" required />
          </Field>
          <Field label={tipo === 'CLIENTE' ? 'CPF ou CNPJ' : 'CPF'} required>
            <Input value={form.cpf_cnpj} onChange={e => update('cpf_cnpj', e.target.value)} placeholder="000.000.000-00" required />
          </Field>
          <Field label="E-mail" required>
            <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="seu@email.com" required />
          </Field>
          <Field label="Telefone (WhatsApp)" required>
            <Input value={form.telefone} onChange={e => update('telefone', e.target.value)} placeholder="(83) 99999-0000" required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Estado" required>
              <select className="input-field" value={form.estado} onChange={e => update('estado', e.target.value)}>
                <option value="PB">Paraíba</option>
                <option value="PE">Pernambuco</option>
                <option value="RN">Rio Grande do Norte</option>
                <option value="CE">Ceará</option>
              </select>
            </Field>
            <Field label="Cidade" required>
              <Input value={form.cidade} onChange={e => update('cidade', e.target.value)} required />
            </Field>
          </div>
          <Field label="Senha" required hint="Mínimo 8 caracteres">
            <Input type="password" value={form.senha} onChange={e => update('senha', e.target.value)} placeholder="••••••••" required minLength={8} />
          </Field>

          <label className="flex items-start gap-2 my-4 cursor-pointer">
            <input type="checkbox" checked={aceito} onChange={e => setAceito(e.target.checked)} className="mt-1 accent-orange" />
            <span className="text-xs text-white/65">
              Concordo com os <Link href="/termos" className="text-orange font-semibold">Termos</Link> e a{' '}
              <Link href="/privacidade" className="text-orange font-semibold">Política LGPD</Link>.
            </span>
          </label>

          {error && (
            <div className="px-4 py-3 rounded-xl border border-red/30 bg-red/10 text-red text-sm">{error}</div>
          )}

          <Button type="submit" loading={loading} className="w-full btn-lg">
            Criar minha conta
          </Button>
        </form>

        <p className="text-center text-sm text-white/65 mt-6">
          Já tem conta? <Link href="/auth/login" className="text-orange font-bold">Fazer login →</Link>
        </p>
      </div>
    </AppShell>
  )
}
