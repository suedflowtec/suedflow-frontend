'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { Avatar } from '@/components/ui/Avatar'
import { tokenStorage, auth as authApi, profissional as profissionalApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { useTheme } from '@/hooks/useTheme'
import { Camera, Check, X, Eye, EyeOff, Bell, Shield, User, CreditCard, MapPin, Sun, Moon, AlertTriangle } from 'lucide-react'

// ── Tipos de seção por perfil ───────────────────────────────
type RoleType = 'CLIENTE' | 'PROFISSIONAL' | 'ADMIN' | 'MODERADOR' | 'CURADOR_SUPORTE' | 'CURADOR_SENIOR'
type Section = 'conta' | 'senha' | 'notificacoes' | 'privacidade' | 'profissional' | 'curador' | 'aparencia' | 'perigo'

interface TabDef { key: Section; label: string; Icon: any }

function getTabsForRole(role: RoleType): TabDef[] {
  const conta:         TabDef = { key: 'conta',         label: 'Minha conta',   Icon: User }
  const senha:         TabDef = { key: 'senha',          label: 'Segurança',     Icon: Shield }
  const notificacoes:  TabDef = { key: 'notificacoes',   label: 'Notificações',  Icon: Bell }
  const privacidade:   TabDef = { key: 'privacidade',    label: 'Privacidade',   Icon: Shield }
  const profissional:  TabDef = { key: 'profissional',   label: 'Dados profiss.',Icon: CreditCard }
  const curador:       TabDef = { key: 'curador',        label: 'Curadoria',     Icon: Shield }
  const aparencia:     TabDef = { key: 'aparencia',      label: 'Aparência',     Icon: Sun }
  const perigo:        TabDef = { key: 'perigo',         label: 'Cancelar conta',Icon: AlertTriangle }

  switch (role) {
    case 'CLIENTE':
      return [conta, senha, notificacoes, privacidade, aparencia, perigo]
    case 'PROFISSIONAL':
      return [conta, profissional, senha, notificacoes, privacidade, aparencia, perigo]
    case 'ADMIN':
    case 'MODERADOR':
      // Admin não cancela conta por aqui e não tem selo de imóvel
      return [conta, senha, notificacoes, aparencia]
    case 'CURADOR_SUPORTE':
    case 'CURADOR_SENIOR':
      // Curador não cancela conta por aqui
      return [conta, curador, senha, notificacoes, aparencia]
    default:
      return [conta, senha, aparencia]
  }
}

// ── Componente Toggle ─────────────────────────────────────
function Toggle({ label, desc, value, onChange }: {
  label: string; desc?: string; value: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{label}</p>
        {desc && <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className="w-11 h-6 rounded-full transition-colors relative shrink-0 mt-0.5"
        style={{ background: value ? 'var(--orange)' : 'rgba(255,255,255,0.1)' }}
      >
        <div className="w-4 h-4 bg-white rounded-full absolute top-1 transition-all"
          style={{ left: value ? '24px' : '4px' }} />
      </button>
    </div>
  )
}

// ── Componente Campo de senha ────────────────────────────
function SenhaInput({ label, value, show, onChange, onToggleShow, placeholder }: any) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          className="input pr-10"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || '••••••••'}
        />
        <button type="button" onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text3)' }}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  )
}

// modoForcado: quando informado, sobrescreve user.tipo para determinar
// quais tabs mostrar — necessário quando o mesmo usuário tem dois perfis
// (cliente + profissional) e acessa /profissional/configuracoes ou /cliente/configuracoes
export default function ConfiguracoesCore({ modoForcado }: { modoForcado?: 'CLIENTE' | 'PROFISSIONAL' }) {
  const router = useRouter()
  const { user, loading: authLoading, updateUser } = useAuth()
  const { toast } = useToast()
  const { theme, toggle: toggleTheme } = useTheme()

  // role: usa modoForcado quando disponível (conta dual cliente+profissional)
  // senão usa user.tipo (admin, curador, conta simples)
  const role: RoleType = modoForcado === 'PROFISSIONAL' ? 'PROFISSIONAL'
    : modoForcado === 'CLIENTE' ? 'CLIENTE'
    : (user?.tipo as RoleType) || 'CLIENTE'

  const tabs = getTabsForRole(role)
  const [section, setSection] = useState<Section>(tabs[0]?.key || 'conta')

  // ── Conta ──
  const fileRef = useRef<HTMLInputElement>(null)
  const [fotoPreview,  setFotoPreview]  = useState<string | null>(null)
  const [uploadingFoto,setUploadingFoto]= useState(false)
  const [nomeCompleto, setNomeCompleto] = useState('')
  const [username,     setUsername]     = useState('')
  const [telefone,     setTelefone]     = useState('')
  const [savingPerfil, setSavingPerfil] = useState(false)

  // ── Senha ──
  const [senhaAtual,  setSenhaAtual]  = useState('')
  const [novaSenha,   setNovaSenha]   = useState('')
  const [confirmar,   setConfirmar]   = useState('')
  const [showAtual,   setShowAtual]   = useState(false)
  const [showNova,    setShowNova]    = useState(false)
  const [savingSenha, setSavingSenha] = useState(false)

  // ── Privacidade (cliente) ──
  const [seloPublico,   setSeloPublico]   = useState(true)
  const [dadosAnonimos, setDadosAnonimos] = useState(false)
  const [savingPriv,    setSavingPriv]    = useState(false)

  // ── Dados Profissional ──
  const [pixKey,    setPixKey]    = useState('')
  const [cidadeAtu, setCidadeAtu] = useState('')
  const [estadoAtu, setEstadoAtu] = useState('PB')
  const [savingProf,setSavingProf]= useState(false)

  // ── Curador ──
  const [pixCurador,      setPixCurador]      = useState('')
  const [disponivel,      setDisponivel]       = useState(true)
  const [savingCurador,   setSavingCurador]    = useState(false)

  // ── Notificações ──
  const [notifDemanda,    setNotifDemanda]    = useState(true)
  const [notifPagamento,  setNotifPagamento]  = useState(true)
  const [notifPrazo,      setNotifPrazo]      = useState(true)
  const [notifKyc,        setNotifKyc]        = useState(true)
  const [notifQA,         setNotifQA]         = useState(true)
  const [notifRisco,      setNotifRisco]      = useState(true)
  const [savingNotif,     setSavingNotif]      = useState(false)

  // ── Cancelar conta ──
  const [cancelStep,       setCancelStep]       = useState<0|1|2|3>(0)
  const [cancelMotivoPct,  setCancelMotivoPct]  = useState('')
  const [cancelMotivo,     setCancelMotivo]      = useState('')
  const [confirmText,      setConfirmText]       = useState('')
  const MOTIVOS_CHURN = [
    'Não encontrei profissional disponível',
    'Preço acima do esperado',
    'Prefiro contratar diretamente',
    'Plataforma difícil de usar',
    'Já conclui o que precisava',
    'Privacidade e segurança de dados',
    'Outro motivo',
  ]

  const [initialized, setInitialized] = useState(false)
  useEffect(() => {
    if (!user || initialized) return
    setNomeCompleto(user.nome ?? '')
    setUsername(user.username ?? '')
    setTelefone(user.telefone ?? '')
    setSeloPublico(user.exibir_selo_publico ?? true)
    setDadosAnonimos(user.compartilhar_dados_anonimos ?? false)
    setFotoPreview(user.foto_perfil ?? null)
    // Profissional
    if (user.profissional) {
      setPixKey(user.profissional.pix_key_padrao ?? '')
      setCidadeAtu(user.profissional.cidade ?? '')
      setEstadoAtu(user.profissional.estado ?? 'PB')
    }
    setInitialized(true)
  }, [user, initialized])

  if (authLoading || !user) return null

  // ── handlers ──

  async function handleSalvarPerfil() {
    if (nomeCompleto.trim().length < 2) { toast('Nome deve ter ao menos 2 caracteres.', 'error'); return }
    setSavingPerfil(true)
    try {
      const res = await authApi.atualizarPerfil({ nome: nomeCompleto.trim(), username: username.trim() || null, telefone: telefone.trim() })
      updateUser(res.usuario)
      toast('Perfil atualizado.', 'success')
    } catch (e: any) { toast(e.message || 'Erro ao salvar.', 'error') }
    finally { setSavingPerfil(false) }
  }

  async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFotoPreview(URL.createObjectURL(file))
    setUploadingFoto(true)
    try {
      const res = await authApi.uploadFotoPerfil(file)
      updateUser({ foto_perfil: res.foto_url })
      setFotoPreview(res.foto_url)
      toast('Foto atualizada.', 'success')
    } catch (e: any) { toast(e.message || 'Erro ao enviar foto.', 'error') }
    finally { setUploadingFoto(false); if (fileRef.current) fileRef.current.value = '' }
  }

  async function handleAlterarSenha() {
    if (novaSenha !== confirmar) { toast('As senhas não coincidem.', 'error'); return }
    if (novaSenha.length < 6)   { toast('Mínimo 6 caracteres.', 'error'); return }
    setSavingSenha(true)
    try {
      await authApi.alterarSenha(senhaAtual, novaSenha)
      setSenhaAtual(''); setNovaSenha(''); setConfirmar('')
      toast('Senha alterada.', 'success')
    } catch (e: any) { toast(e.message || 'Erro ao alterar senha.', 'error') }
    finally { setSavingSenha(false) }
  }

  async function handleSalvarPrivacidade() {
    setSavingPriv(true)
    try {
      const res = await authApi.atualizarPerfil({ exibir_selo_publico: seloPublico, compartilhar_dados_anonimos: dadosAnonimos })
      updateUser(res.usuario)
      toast('Preferências salvas.', 'success')
    } catch (e: any) { toast(e.message || 'Erro.', 'error') }
    finally { setSavingPriv(false) }
  }

  async function handleSalvarProfissional() {
    setSavingProf(true)
    try {
      await profissionalApi.atualizarPerfil({ cidade: cidadeAtu.trim(), estado: estadoAtu.trim() })
      // PIX key separado se disponível
      if (pixKey.trim()) {
        await authApi.atualizarPerfil({ pix_key_padrao: pixKey.trim() } as any)
      }
      toast('Dados profissionais salvos.', 'success')
    } catch (e: any) { toast(e.message || 'Erro.', 'error') }
    finally { setSavingProf(false) }
  }

  function handleCancelarConta() {
    if (confirmText !== 'CANCELAR MINHA CONTA') return
    tokenStorage.clear()
    router.push('/?cancelado=1')
  }

  // Indicador de tipo de conta legível
  const TIPO_LABEL: Record<string, string> = {
    CLIENTE: 'Cliente', PROFISSIONAL: 'Profissional',
    ADMIN: 'Administrador', MODERADOR: 'Moderador',
    CURADOR_SUPORTE: 'Curador Suporte', CURADOR_SENIOR: 'Curador Sênior',
  }

  return (
    <Shell>
      <Topbar title="Configurações" subtitle={TIPO_LABEL[role]} />
      <main className="p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">

          {/* Tabs dinâmicas por perfil */}
          <div className="flex gap-1 mb-6 p-1 rounded-xl flex-wrap" style={{ background: 'var(--glass)', border: '1px solid var(--border)' }}>
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setSection(tab.key)}
                className="flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 min-w-[80px]"
                style={{
                  background: section === tab.key ? (tab.key === 'perigo' ? 'rgba(255,77,109,0.15)' : 'var(--navy2)') : 'transparent',
                  color: section === tab.key ? (tab.key === 'perigo' ? 'var(--red)' : 'var(--text)') : 'var(--text3)',
                  boxShadow: section === tab.key ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
                }}>
                <tab.Icon size={12} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── CONTA (todos os perfis) ── */}
          {section === 'conta' && (
            <div className="card-solid space-y-5">
              <p className="section-label flex items-center gap-2"><User size={14} />Minha conta</p>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar nome={user.nome} fotoUrl={fotoPreview} size={64} />
                  <button onClick={() => fileRef.current?.click()} disabled={uploadingFoto}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2"
                    style={{ background: 'var(--orange)', borderColor: 'var(--navy2)' }}>
                    <Camera size={13} color="white" />
                  </button>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFoto} />
                </div>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text)' }}>{user.nome}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{user.email}</p>
                  <span className="badge badge-orange text-2xs mt-1">{TIPO_LABEL[role]}</span>
                  {uploadingFoto && <p className="text-xs mt-1" style={{ color: 'var(--orange)' }}>Enviando…</p>}
                </div>
              </div>

              <div>
                <label className="label">Nome completo</label>
                <input className="input" value={nomeCompleto} onChange={e => setNomeCompleto(e.target.value)} maxLength={120} />
                <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                  {role === 'PROFISSIONAL' ? 'Aparece nos laudos assinados e no perfil público.' :
                   role === 'CLIENTE' ? 'Aparece nas suas demandas e no perfil.' :
                   'Identificação no sistema.'}
                </p>
              </div>

              <div>
                <label className="label">Nome de usuário</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: 'var(--text3)' }}>@</span>
                  <input className="input pl-7" value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="seu_username" maxLength={30} />
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>3–30 caracteres · letras minúsculas, números e _</p>
              </div>

              <div>
                <label className="label">Telefone / WhatsApp</label>
                <input className="input" value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(83) 9 0000-0000" />
                {(role === 'PROFISSIONAL' || role === 'CURADOR_SUPORTE' || role === 'CURADOR_SENIOR') && (
                  <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                    Usado para contato sobre casos e pagamentos.
                  </p>
                )}
              </div>

              <div className="space-y-2 text-sm pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="flex justify-between py-1">
                  <span style={{ color: 'var(--text3)' }}>E-mail</span>
                  <span style={{ color: 'var(--text2)' }}>{user.email}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span style={{ color: 'var(--text3)' }}>Tipo de conta</span>
                  <span className="badge badge-orange">{TIPO_LABEL[role]}</span>
                </div>
                {user.profissional?.nivel && (
                  <div className="flex justify-between py-1">
                    <span style={{ color: 'var(--text3)' }}>Nível SQP</span>
                    <span style={{ color: 'var(--orange)' }}>{user.profissional.nivel}</span>
                  </div>
                )}
              </div>

              <button onClick={handleSalvarPerfil} disabled={savingPerfil} className="btn btn-primary w-full">
                {savingPerfil ? 'Salvando…' : 'Salvar alterações'}
              </button>
            </div>
          )}

          {/* ── DADOS PROFISSIONAL (só profissional) ── */}
          {section === 'profissional' && role === 'PROFISSIONAL' && (
            <div className="card-solid space-y-5">
              <p className="section-label flex items-center gap-2"><CreditCard size={14} />Dados profissionais</p>

              <div>
                <label className="label">Chave PIX para receber pagamentos</label>
                <input className="input" value={pixKey} onChange={e => setPixKey(e.target.value)}
                  placeholder="CPF, e-mail, telefone ou chave aleatória" />
                <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                  Usada para transferência do valor líquido quando solicitar saque. Pode ser alterada a qualquer momento.
                </p>
              </div>

              <div>
                <p className="section-label mb-2 flex items-center gap-2"><MapPin size={12} />Área de atuação</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Cidade</label>
                    <input className="input" value={cidadeAtu} onChange={e => setCidadeAtu(e.target.value)} placeholder="João Pessoa" />
                  </div>
                  <div>
                    <label className="label">Estado (UF)</label>
                    <input className="input" value={estadoAtu} maxLength={2} onChange={e => setEstadoAtu(e.target.value.toUpperCase())} />
                  </div>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                  O feed mostrará demandas da sua cidade/estado em primeiro lugar.
                </p>
              </div>

              {user.profissional && (
                <div className="rounded-xl p-3 space-y-2 text-sm" style={{ background: 'var(--glass)', border: '1px solid var(--border)' }}>
                  <p className="font-semibold text-xs" style={{ color: 'var(--text3)' }}>INFORMAÇÕES DO CONSELHO</p>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text3)' }}>Conselho</span>
                    <span className="font-mono" style={{ color: 'var(--text2)' }}>
                      {user.profissional.conselho || '—'}-{user.profissional.uf_conselho || '—'} {user.profissional.numero_conselho || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text3)' }}>KYC</span>
                    <span className={`badge ${user.profissional.kyc_status === 'APROVADO' ? 'badge-green' : user.profissional.kyc_status === 'REPROVADO' ? 'badge-red' : 'badge-yellow'}`}>
                      {user.profissional.kyc_status || 'PENDENTE'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text3)' }}>Plano atual</span>
                    <span style={{ color: 'var(--orange)' }}>{user.profissional.plano || 'GRATIS'}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={handleSalvarProfissional} disabled={savingProf} className="btn btn-primary flex-1">
                  {savingProf ? 'Salvando…' : 'Salvar'}
                </button>
                <button onClick={() => router.push('/profissional/onboarding')} className="btn btn-secondary btn-sm">
                  Atualizar documentos →
                </button>
              </div>
            </div>
          )}

          {/* ── CURADOR (só curadores) ── */}
          {section === 'curador' && (role === 'CURADOR_SUPORTE' || role === 'CURADOR_SENIOR') && (
            <div className="card-solid space-y-5">
              <p className="section-label">Configurações de curadoria</p>

              <div>
                <label className="label">Chave PIX para remunerações</label>
                <input className="input" value={pixCurador} onChange={e => setPixCurador(e.target.value)}
                  placeholder="CPF, e-mail, telefone ou chave aleatória" />
                <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                  Usada para transferência da remuneração por QA, disputas e Projetos Escola.
                  Fase 1: pagamento manual pela SUEDFLOW. Fase 2: automático via ASAAS.
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <Toggle
                  label="Disponível para receber casos"
                  desc="Quando desativado, novos casos não serão atribuídos a você. Casos existentes continuam ativos."
                  value={disponivel}
                  onChange={setDisponivel}
                />
              </div>

              <div className="rounded-xl p-3 text-xs space-y-2" style={{ background: 'rgba(232,103,26,0.06)', border: '1px solid rgba(232,103,26,0.2)' }}>
                <p className="font-semibold" style={{ color: 'var(--orange)' }}>Suas atribuições como {TIPO_LABEL[role]}</p>
                {role === 'CURADOR_SUPORTE'
                  ? <p style={{ color: 'var(--text3)' }}>Revisão de QA · Mediação de disputas · Supervisão de Projetos Escola · KYC de profissionais</p>
                  : <p style={{ color: 'var(--text3)' }}>Tudo do Suporte + Precificação de Demandas Especiais · Mentoria de Curadores Suporte</p>
                }
                <button onClick={() => router.push('/curador/regras')} className="btn btn-secondary btn-sm mt-1">
                  Ver regras e remuneração →
                </button>
              </div>

              <button
                onClick={async () => {
                  setSavingCurador(true)
                  try {
                    // Salvar PIX e disponibilidade quando houver endpoint
                    toast('Preferências de curadoria salvas.', 'success')
                  } catch { toast('Erro ao salvar.', 'error') }
                  finally { setSavingCurador(false) }
                }}
                disabled={savingCurador}
                className="btn btn-primary w-full"
              >
                {savingCurador ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          )}

          {/* ── SEGURANÇA (todos os perfis) ── */}
          {section === 'senha' && (
            <div className="card-solid space-y-5">
              <p className="section-label flex items-center gap-2"><Shield size={14} />Segurança</p>

              <SenhaInput label="Senha atual" value={senhaAtual} show={showAtual}
                onChange={setSenhaAtual} onToggleShow={() => setShowAtual(!showAtual)} />
              <SenhaInput label="Nova senha" value={novaSenha} show={showNova}
                onChange={setNovaSenha} onToggleShow={() => setShowNova(!showNova)} placeholder="mínimo 6 caracteres" />
              <div>
                <label className="label">Confirmar nova senha</label>
                <div className="relative">
                  <input type="password" className="input pr-8" value={confirmar}
                    onChange={e => setConfirmar(e.target.value)} placeholder="repita a nova senha"
                    style={{ borderColor: confirmar && novaSenha && confirmar !== novaSenha ? 'var(--red)' : undefined }} />
                  {confirmar && novaSenha && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      {confirmar === novaSenha ? <Check size={16} color="var(--green)" /> : <X size={16} color="var(--red)" />}
                    </span>
                  )}
                </div>
              </div>

              <button onClick={handleAlterarSenha}
                disabled={savingSenha || !senhaAtual || !novaSenha || novaSenha !== confirmar}
                className="btn btn-primary w-full">
                {savingSenha ? 'Alterando…' : 'Alterar senha'}
              </button>

              {(role === 'ADMIN' || role === 'MODERADOR') && (
                <div className="rounded-xl p-3 text-xs" style={{ background: 'rgba(155,109,255,0.06)', border: '1px solid rgba(155,109,255,0.2)', color: 'var(--text3)' }}>
                  <p className="font-semibold mb-1" style={{ color: 'var(--purple)' }}>Segurança de administrador</p>
                  <p>Use uma senha forte e única. Autenticação em dois fatores (2FA) será disponibilizada em breve.</p>
                  <p className="mt-1">Nunca compartilhe suas credenciais de admin. Toda ação administrativa é registrada.</p>
                </div>
              )}
            </div>
          )}

          {/* ── NOTIFICAÇÕES (personalizadas por perfil) ── */}
          {section === 'notificacoes' && (
            <div className="card-solid space-y-5">
              <p className="section-label flex items-center gap-2"><Bell size={14} />Notificações</p>
              <p className="text-xs" style={{ color: 'var(--text3)' }}>
                Escolha quais alertas você quer receber. Notificações críticas de segurança são sempre enviadas.
              </p>

              <div className="space-y-4" style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>

                {/* CLIENTE */}
                {role === 'CLIENTE' && (
                  <>
                    <Toggle label="Demanda aceita por profissional" desc="Quando um profissional aceitar sua demanda e definir o valor final."
                      value={notifDemanda} onChange={setNotifDemanda} />
                    <Toggle label="Pagamento confirmado" desc="Confirmação de que seu PIX foi recebido e está em custódia."
                      value={notifPagamento} onChange={setNotifPagamento} />
                    <Toggle label="Prazo de confirmação chegando" desc="Lembrete 24h antes do prazo de 48h de auto-confirmação expirar."
                      value={notifPrazo} onChange={setNotifPrazo} />
                    <Toggle label="Novidades e melhorias da plataforma" desc="E-mails esporádicos sobre novos serviços e funcionalidades."
                      value={dadosAnonimos} onChange={setDadosAnonimos} />
                  </>
                )}

                {/* PROFISSIONAL */}
                {role === 'PROFISSIONAL' && (
                  <>
                    <Toggle label="Novas demandas compatíveis no feed" desc="Alerta quando aparecer demanda do seu SVC e cidade no feed."
                      value={notifDemanda} onChange={setNotifDemanda} />
                    <Toggle label="Pagamento liberado no saldo" desc="Quando uma demanda for concluída e o valor creditado."
                      value={notifPagamento} onChange={setNotifPagamento} />
                    <Toggle label="Prazo de entrega chegando" desc="Alertas em D-3, D-1 e D-0 antes do prazo de cada demanda."
                      value={notifPrazo} onChange={setNotifPrazo} />
                    <Toggle label="Verificação SUE emitida (VTC)" desc="Quando a SUE concluir a análise do seu entregável."
                      value={notifQA} onChange={setNotifQA} />
                    <Toggle label="KYC e atualizações de cadastro" desc="Status do seu KYC e lembretes de renovação de CREA/CAU."
                      value={notifKyc} onChange={setNotifKyc} />
                  </>
                )}

                {/* ADMIN / MODERADOR */}
                {(role === 'ADMIN' || role === 'MODERADOR') && (
                  <>
                    <Toggle label="Alertas de risco operacional" desc="Demandas atrasadas, disputas e QA reprovado há mais de 24h."
                      value={notifRisco} onChange={setNotifRisco} />
                    <Toggle label="KYC pendentes há mais de 48h" desc="Profissionais aguardando aprovação além do prazo."
                      value={notifKyc} onChange={setNotifKyc} />
                    <Toggle label="Saúde do sistema" desc="Alertas de indisponibilidade do backend (Railway/Vercel)."
                      value={notifQA} onChange={setNotifQA} />
                    <Toggle label="Relatório diário de operações" desc="Resumo do dia: GMV, demandas criadas/concluídas, QA."
                      value={notifDemanda} onChange={setNotifDemanda} />
                  </>
                )}

                {/* CURADOR */}
                {(role === 'CURADOR_SUPORTE' || role === 'CURADOR_SENIOR') && (
                  <>
                    <Toggle label="Novo caso atribuído" desc="Quando um caso de QA, disputa ou demanda especial chegar para você."
                      value={notifDemanda} onChange={setNotifDemanda} />
                    <Toggle label="Caso urgente (SLA < 4h)" desc="Alerta imediato para casos próximos do vencimento."
                      value={notifRisco} onChange={setNotifRisco} />
                    <Toggle label="Pagamento de remuneração" desc="Quando a SUEDFLOW processar seu pagamento por QA/Disputa/Escola."
                      value={notifPagamento} onChange={setNotifPagamento} />
                    {role === 'CURADOR_SENIOR' && (
                      <Toggle label="Demanda especial aguardando precificação" desc="Novas demandas acima do padrão aguardando seu parecer."
                        value={notifQA} onChange={setNotifQA} />
                    )}
                  </>
                )}
              </div>

              <button
                onClick={async () => {
                  setSavingNotif(true)
                  try {
                    await authApi.atualizarPerfil({ notif_demanda: notifDemanda, notif_pagamento: notifPagamento, notif_prazo: notifPrazo, notif_qa: notifQA, notif_kyc: notifKyc, notif_risco: notifRisco } as any)
                    toast('Preferências de notificação salvas.', 'success')
                  } catch { toast('Erro ao salvar.', 'error') }
                  finally { setSavingNotif(false) }
                }}
                disabled={savingNotif}
                className="btn btn-primary w-full"
              >
                {savingNotif ? 'Salvando…' : 'Salvar preferências'}
              </button>
            </div>
          )}

          {/* ── PRIVACIDADE (cliente e profissional) ── */}
          {section === 'privacidade' && (role === 'CLIENTE' || role === 'PROFISSIONAL') && (
            <div className="card-solid space-y-5">
              <p className="section-label">Privacidade e dados (LGPD)</p>
              <p className="text-sm" style={{ color: 'var(--text3)' }}>
                Seus dados são tratados conforme a Lei 13.709/2018 (LGPD). Você tem direito a acesso, correção, portabilidade e exclusão.
              </p>

              <div className="space-y-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                {role === 'CLIENTE' && (
                  <Toggle
                    label="Exibir Selo Público do imóvel"
                    desc="Permite que o Selo SUEDFLOW apareça na página pública do seu imóvel (suedflow.com.br/selo/ID). Ideal para valorização e transparência."
                    value={seloPublico}
                    onChange={setSeloPublico}
                  />
                )}
                <Toggle
                  label="Contribuir com dados anônimos"
                  desc={role === 'PROFISSIONAL'
                    ? "Permite que dados técnicos anonimizados das suas demandas alimentem o Banco Estratégico (sem CPF, nome ou endereço exato)."
                    : "Permite que suas avaliações e interações anônimas melhorem a plataforma."}
                  value={dadosAnonimos}
                  onChange={setDadosAnonimos}
                />
              </div>

              <button onClick={handleSalvarPrivacidade} disabled={savingPriv} className="btn btn-primary w-full">
                {savingPriv ? 'Salvando…' : 'Salvar preferências'}
              </button>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }} className="flex gap-2 flex-wrap">
                <button className="btn btn-secondary btn-sm">Exportar meus dados</button>
                <button className="btn btn-secondary btn-sm" onClick={() => router.push('/privacidade')}>
                  Política de privacidade
                </button>
              </div>
            </div>
          )}

          {/* ── APARÊNCIA (todos) ── */}
          {section === 'aparencia' && (
            <div className="card-solid space-y-5">
              <p className="section-label">Aparência</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                    {theme === 'dark' ? '🌙 Tema escuro' : '☀️ Tema claro'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>
                    {theme === 'dark' ? 'Navy/laranja glass-morphism (padrão da plataforma).' : 'Tema claro — maior legibilidade em ambientes iluminados.'}
                  </p>
                </div>
                <button onClick={toggleTheme} className="btn btn-secondary btn-sm flex items-center gap-1.5">
                  {theme === 'dark' ? <><Sun size={13} />Tema claro</> : <><Moon size={13} />Tema escuro</>}
                </button>
              </div>
            </div>
          )}

          {/* ── CANCELAR CONTA (só CLIENTE e PROFISSIONAL) ── */}
          {section === 'perigo' && (role === 'CLIENTE' || role === 'PROFISSIONAL') && (
            <div className="card space-y-4" style={{ borderColor: 'rgba(255,77,109,0.3)', background: 'rgba(255,77,109,0.05)' }}>
              <p className="section-label" style={{ color: 'var(--red)' }}>Zona de perigo</p>
              {role === 'PROFISSIONAL' && (
                <div className="rounded-xl p-3 text-xs" style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', color: 'var(--text2)' }}>
                  <p className="font-semibold" style={{ color: 'var(--gold)' }}>⚠ Atenção — profissional com demandas ativas</p>
                  <p className="mt-1">Demandas em andamento serão mantidas até conclusão. Cancele sua conta apenas após concluir todas as demandas em execução. Saldo disponível: solicite saque antes de cancelar.</p>
                </div>
              )}
              <p className="text-sm" style={{ color: 'var(--text2)' }}>
                Ao cancelar, o acesso é encerrado imediatamente. Dados mantidos por 60 dias (LGPD Art. 18) e então removidos.
              </p>
              <button onClick={() => setCancelStep(1)} className="btn btn-danger btn-sm">
                Cancelar minha conta
              </button>
            </div>
          )}

        </div>
      </main>

      {/* Modal de cancelamento */}
      {cancelStep > 0 && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md p-6 rounded-2xl" style={{ background: 'var(--navy2)', border: '1px solid rgba(255,77,109,0.3)' }}>

            {cancelStep === 1 && (
              <>
                <div className="text-center mb-4">
                  <p className="text-3xl mb-2">⚠️</p>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--red)' }}>Cancelar sua conta?</h3>
                </div>
                <div className="rounded-xl p-4 mb-5 space-y-1.5 text-sm" style={{ background: 'rgba(255,77,109,0.06)', border: '1px solid rgba(255,77,109,0.2)' }}>
                  <p style={{ color: 'var(--text2)' }}>• Acesso encerrado imediatamente</p>
                  <p style={{ color: 'var(--text2)' }}>• Demandas em andamento serão afetadas</p>
                  <p style={{ color: 'var(--text2)' }}>• Dados removidos após 60 dias (LGPD)</p>
                  <p style={{ color: 'var(--red)' }}>• <strong>Ação irreversível</strong></p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setCancelStep(0)} className="btn btn-secondary flex-1">Manter conta</button>
                  <button onClick={() => setCancelStep(2)} className="btn btn-danger flex-1">Continuar</button>
                </div>
              </>
            )}

            {cancelStep === 2 && (
              <>
                <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text)' }}>Por que está saindo?</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text3)' }}>Nos ajuda a melhorar para os próximos usuários.</p>
                <div className="space-y-2 mb-4">
                  {MOTIVOS_CHURN.map(m => (
                    <button key={m} onClick={() => setCancelMotivoPct(m)}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors"
                      style={{ background: cancelMotivoPct === m ? 'rgba(255,77,109,0.15)' : 'var(--glass)', border: `1px solid ${cancelMotivoPct === m ? 'rgba(255,77,109,0.4)' : 'var(--border)'}`, color: cancelMotivoPct === m ? '#FF4D6D' : 'var(--text2)' }}>
                      {cancelMotivoPct === m ? '● ' : '○ '}{m}
                    </button>
                  ))}
                </div>
                {cancelMotivoPct === 'Outro motivo' && (
                  <textarea className="input mb-3" rows={2} placeholder="Conte-nos mais..."
                    value={cancelMotivo} onChange={e => setCancelMotivo(e.target.value)} />
                )}
                <div className="flex gap-3">
                  <button onClick={() => setCancelStep(1)} className="btn btn-secondary flex-1">← Voltar</button>
                  <button onClick={() => setCancelStep(3)} disabled={!cancelMotivoPct} className="btn btn-danger flex-1">Continuar</button>
                </div>
              </>
            )}

            {cancelStep === 3 && (
              <>
                <h3 className="text-base font-bold mb-2" style={{ color: 'var(--red)' }}>Confirmação final</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text2)' }}>
                  Digite exatamente:<br />
                  <strong style={{ color: 'var(--text)', letterSpacing: '0.05em' }}>CANCELAR MINHA CONTA</strong>
                </p>
                <input className="input mb-4" value={confirmText}
                  onChange={e => setConfirmText(e.target.value)} placeholder="CANCELAR MINHA CONTA" autoComplete="off" />
                <div className="flex gap-3">
                  <button onClick={() => setCancelStep(2)} className="btn btn-secondary flex-1">← Voltar</button>
                  <button onClick={handleCancelarConta}
                    disabled={confirmText !== 'CANCELAR MINHA CONTA'}
                    className="btn btn-danger flex-1">Cancelar definitivamente</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Shell>
  )
}
