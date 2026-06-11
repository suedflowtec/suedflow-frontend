// app/admin/teste/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { Button } from '@/components/ui/Button'
import { Input, Field } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { admin, tokenStorage, userStorage } from '@/lib/api'
import { useToast } from '@/hooks/useToast'

export default function AdminTeste() {
  return (
    <Shell>
      <Topbar title="Ferramentas de Teste" />

      <main className="p-6 space-y-4 max-w-2xl">
        <p className="text-sm text-ink-muted">
          Endpoints administrativos do backend v4.4.5 para validar fluxos sem dependências externas.
        </p>

        <div className="card p-4 border-yellow-200 bg-yellow-50">
          <div className="flex gap-2 items-start">
            <span className="text-yellow-600 text-lg">⚠</span>
            <div>
              <p className="text-sm font-semibold text-yellow-700">Modo de teste · Fase de Validação</p>
              <p className="text-xs text-ink-secondary mt-1">
                Disponível apenas para admin. Cada ação é registrada no histórico para auditoria. Em produção real podem ser desativadas.
              </p>
            </div>
          </div>
        </div>

        <CriarProfissionalTeste />
        <LoginAs />
        <MarcarPaga />
        <ForcarStatus />
      </main>
    </Shell>
  )
}

function CriarProfissionalTeste() {
  const { toast } = useToast()
  const [nome, setNome] = useState('Profissional Teste 01')
  const [email, setEmail] = useState('prof.teste01@suedflow.com.br')
  const [senha] = useState('Teste@2026!')
  const [svcs, setSvcs] = useState<string[]>(['SVC001', 'SVC002', 'SVC003'])
  const [loading, setLoading] = useState(false)

  const toggle = (s: string) => {
    setSvcs(curr => curr.includes(s) ? curr.filter(x => x !== s) : [...curr, s])
  }

  const submit = async () => {
    setLoading(true)
    try {
      await admin.teste.criarProfissionalCompleto({ nome, email, senha, svcs_habilitados: svcs })
      toast(`Criado · senha: ${senha}`, 'success')
    } catch (e: any) {
      toast(e.message || 'Erro', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="card p-4">
      <div className="flex justify-between mb-3">
        <h3 className="text-sm font-semibold text-navy">Criar profissional teste</h3>
        <Badge variant="orange">v4.4.5</Badge>
      </div>
      <p className="text-xs text-ink-muted mb-3">Cria um novo profissional já com KYC, CREA, M1-M6 e SVCs habilitados.</p>
      <div className="space-y-2">
        <Field label="Nome"><Input value={nome} onChange={e => setNome(e.target.value)} /></Field>
        <Field label="E-mail"><Input value={email} onChange={e => setEmail(e.target.value)} /></Field>
        <div>
          <p className="label">SVCs habilitados</p>
          <div className="flex flex-wrap gap-2">
            {['SVC001', 'SVC002', 'SVC003', 'SVC005', 'SVC006', 'SVC007'].map(s => (
              <button
                key={s}
                onClick={() => toggle(s)}
                className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors ${
                  svcs.includes(s) ? 'bg-orange text-white border-orange' : 'bg-white text-ink-secondary border-surface-border hover:bg-surface-hover'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={submit} loading={loading} className="w-full mt-2">Criar profissional pronto</Button>
      </div>
    </div>
  )
}

function LoginAs() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!email) return
    setLoading(true)
    try {
      const r = await admin.teste.loginAs(email)
      tokenStorage.set(r.token)
      userStorage.set(r.usuario)
      toast(`Você é agora ${email}`, 'success')
      setTimeout(() => router.push(r.usuario.tipo === 'ADMIN' ? '/admin' : '/cliente'), 800)
    } catch (e: any) {
      toast(e.message || 'Erro', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="card p-4">
      <div className="flex justify-between mb-3">
        <h3 className="text-sm font-semibold text-navy">Login como outro usuário</h3>
        <Badge variant="orange">v4.4.5</Badge>
      </div>
      <p className="text-xs text-ink-muted mb-3">Gera token JWT de qualquer usuário sem precisar saber a senha. Útil para reproduzir bugs reportados.</p>
      <div className="space-y-2">
        <Field label="E-mail do usuário"><Input value={email} onChange={e => setEmail(e.target.value)} placeholder="cliente@email.com" /></Field>
        <Button onClick={submit} loading={loading} className="w-full">Assumir identidade</Button>
        <p className="text-2xs text-ink-muted mt-1">⚠ Ação registrada em auditoria.</p>
      </div>
    </div>
  )
}

function MarcarPaga() {
  const { toast } = useToast()
  const [demandaId, setDemandaId] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!demandaId) return
    setLoading(true)
    try {
      await admin.teste.marcarPaga(demandaId)
      toast('Pagamento simulado · demanda visível no feed', 'success')
    } catch (e: any) {
      toast(e.message || 'Erro', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="card p-4">
      <div className="flex justify-between mb-3">
        <h3 className="text-sm font-semibold text-navy">Simular pagamento</h3>
        <Badge variant="orange">v4.4.5</Badge>
      </div>
      <p className="text-xs text-ink-muted mb-3">Marca uma demanda como paga sem precisar do Pagar.me real.</p>
      <div className="space-y-2">
        <Field label="ID da demanda"><Input value={demandaId} onChange={e => setDemandaId(e.target.value)} placeholder="UUID ou OS-2026-0001" /></Field>
        <Button onClick={submit} loading={loading} className="w-full">Marcar como paga</Button>
      </div>
    </div>
  )
}

function ForcarStatus() {
  const { toast } = useToast()
  const [demandaId, setDemandaId] = useState('')
  const [status, setStatus] = useState('EM_EXECUCAO')
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!demandaId) return
    setLoading(true)
    try {
      await admin.teste.forcarStatus(demandaId, status, motivo)
      toast(`Status alterado para ${status}`, 'success')
    } catch (e: any) {
      toast(e.message || 'Erro', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="card p-4">
      <div className="flex justify-between mb-3">
        <h3 className="text-sm font-semibold text-navy">Forçar status</h3>
        <Badge variant="orange">v4.4.5</Badge>
      </div>
      <p className="text-xs text-ink-muted mb-3">Pula etapas do FSM. Útil para testar QA, conclusão sem passar pelos marcos.</p>
      <div className="space-y-2">
        <Field label="ID da demanda"><Input value={demandaId} onChange={e => setDemandaId(e.target.value)} placeholder="UUID" /></Field>
        <Field label="Novo status">
          <select className="input" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="EM_EXECUCAO">EM_EXECUCAO</option>
            <option value="AGUARDANDO_QA">AGUARDANDO_QA</option>
            <option value="AGUARDANDO_CONFIRMACAO">AGUARDANDO_CONFIRMACAO</option>
            <option value="CONCLUIDA">CONCLUIDA</option>
            <option value="CANCELADA">CANCELADA</option>
          </select>
        </Field>
        <Field label="Motivo (opcional)"><Input value={motivo} onChange={e => setMotivo(e.target.value)} /></Field>
        <Button onClick={submit} loading={loading} className="w-full">Forçar mudança</Button>
      </div>
    </div>
  )
}
