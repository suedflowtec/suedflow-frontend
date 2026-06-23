'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { Avatar } from '@/components/ui/Avatar'
import { tokenStorage, auth as authApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { Camera, Check, X, Eye, EyeOff } from 'lucide-react'

type Section = 'conta' | 'senha' | 'privacidade' | 'perigo'

export default function ConfiguracoesPage() {
  const router = useRouter()
  const { user, loading: authLoading, updateUser } = useAuth()
  const { toast } = useToast()
  const [section, setSection] = useState<Section>('conta')

  // ── conta ──
  const [nomeCompleto, setNomeCompleto] = useState('')
  const [username, setUsername]   = useState('')
  const [telefone, setTelefone]   = useState('')
  const [savingPerfil, setSavingPerfil] = useState(false)

  // ── foto ──
  const fileRef = useRef<HTMLInputElement>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [uploadingFoto, setUploadingFoto] = useState(false)

  // ── senha ──
  const [senhaAtual, setSenhaAtual]   = useState('')
  const [novaSenha, setNovaSenha]     = useState('')
  const [confirmar, setConfirmar]     = useState('')
  const [showAtual, setShowAtual]     = useState(false)
  const [showNova, setShowNova]       = useState(false)
  const [savingSenha, setSavingSenha] = useState(false)

  // ── privacidade ──
  const [seloPublico, setSeloPublico]         = useState(true)
  const [dadosAnonimos, setDadosAnonimos]     = useState(false)
  const [savingPriv, setSavingPriv]           = useState(false)

  // ── cancelar conta (3 etapas) ──
  const [cancelStep, setCancelStep]   = useState<0 | 1 | 2 | 3>(0) // 0=fechado 1=aviso 2=motivo 3=confirmar
  const [cancelMotivo, setCancelMotivo] = useState('')
  const [cancelMotivoPct, setCancelMotivoPct] = useState('')  // motivo de churn
  const [confirmText, setConfirmText]  = useState('')
  const MOTIVOS_CHURN = [
    'Não encontrei profissional disponível',
    'Preço acima do esperado',
    'Prefiro contratar diretamente',
    'Plataforma difícil de usar',
    'Já conclui o que precisava',
    'Privacidade e segurança de dados',
    'Outro motivo',
  ]

  // Inicializa os campos a partir do user uma única vez (quando user carrega do storage)
  const [initialized, setInitialized] = useState(false)
  useEffect(() => {
    if (!user || initialized) return
    setNomeCompleto(user.nome ?? '')
    setUsername(user.username ?? '')
    setTelefone(user.telefone ?? '')
    setSeloPublico(user.exibir_selo_publico ?? true)
    setDadosAnonimos(user.compartilhar_dados_anonimos ?? false)
    setFotoPreview(user.foto_perfil ?? null)
    setInitialized(true)
  }, [user, initialized])

  if (authLoading || !user) return null

  // ── handlers ──

  async function handleSalvarPerfil() {
    if (nomeCompleto.trim().length < 2) {
      toast('Nome completo deve ter ao menos 2 caracteres.', 'error'); return
    }
    setSavingPerfil(true)
    try {
      const res = await authApi.atualizarPerfil({
        nome: nomeCompleto.trim(),
        username: username.trim() || null,
        telefone: telefone.trim(),
      })
      updateUser(res.usuario)
      toast('Perfil atualizado.', 'success')
    } catch (e: any) {
      toast(e.message || 'Erro ao salvar.', 'error')
    } finally {
      setSavingPerfil(false)
    }
  }

  async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Mostra preview local imediatamente
    const blobUrl = URL.createObjectURL(file)
    setFotoPreview(blobUrl)
    setUploadingFoto(true)
    try {
      const res = await authApi.uploadFotoPerfil(file)
      updateUser({ foto_perfil: res.foto_url })
      setFotoPreview(res.foto_url)
      toast('Foto atualizada.', 'success')
    } catch (e: any) {
      // Mantém o blob preview local; mostra erro com código HTTP para diagnóstico
      const msg = e.status ? `Erro ${e.status}: ${e.message || 'falha no upload'}` : (e.message || 'Erro ao enviar foto.')
      toast(msg, 'error')
    } finally {
      setUploadingFoto(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleAlterarSenha() {
    if (novaSenha !== confirmar) { toast('As senhas não coincidem.', 'error'); return }
    if (novaSenha.length < 6)   { toast('Nova senha precisa ter ao menos 6 caracteres.', 'error'); return }
    setSavingSenha(true)
    try {
      await authApi.alterarSenha(senhaAtual, novaSenha)
      setSenhaAtual(''); setNovaSenha(''); setConfirmar('')
      toast('Senha alterada com sucesso.', 'success')
    } catch (e: any) {
      toast(e.message || 'Erro ao alterar senha.', 'error')
    } finally {
      setSavingSenha(false)
    }
  }

  async function handleSalvarPrivacidade() {
    setSavingPriv(true)
    try {
      const res = await authApi.atualizarPerfil({
        exibir_selo_publico: seloPublico,
        compartilhar_dados_anonimos: dadosAnonimos,
      })
      updateUser(res.usuario)
      toast('Preferências salvas.', 'success')
    } catch (e: any) {
      toast(e.message || 'Erro ao salvar.', 'error')
    } finally {
      setSavingPriv(false)
    }
  }

  function fecharCancelModal() {
    setCancelStep(0)
    setCancelMotivoPct('')
    setCancelMotivo('')
    setConfirmText('')
  }

  function handleCancelarConta() {
    if (confirmText !== 'CANCELAR MINHA CONTA') return
    tokenStorage.clear()
    router.push('/?cancelado=1')
  }

  const TABS: { key: Section; label: string }[] = [
    { key: 'conta',      label: 'Minha conta' },
    { key: 'senha',      label: 'Alterar senha' },
    { key: 'privacidade',label: 'Privacidade (LGPD)' },
    { key: 'perigo',     label: 'Cancelar conta' },
  ]

  return (
    <Shell>
      <Topbar title="Configurações" />
      <main className="p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">

          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'var(--glass)', border: '1px solid var(--border)' }}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setSection(tab.key)}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: section === tab.key ? (tab.key === 'perigo' ? 'rgba(255,77,109,0.15)' : 'var(--navy2)') : 'transparent',
                  color: section === tab.key
                    ? (tab.key === 'perigo' ? 'var(--red)' : 'var(--text)')
                    : 'var(--text3)',
                  boxShadow: section === tab.key ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── CONTA ── */}
          {section === 'conta' && (
            <div className="card-solid space-y-6">
              <p className="section-label">Minha conta</p>

              {/* Avatar + upload */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar nome={user.nome} fotoUrl={fotoPreview} size={64} />
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadingFoto}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors"
                    style={{ background: 'var(--orange)', borderColor: 'var(--navy2)' }}
                    title="Alterar foto"
                  >
                    <Camera size={13} color="white" />
                  </button>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFoto} />
                </div>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text)' }}>{user.nome}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{user.email}</p>
                  {uploadingFoto && <p className="text-xs mt-1" style={{ color: 'var(--orange)' }}>Enviando foto…</p>}
                </div>
              </div>

              {/* Nome completo */}
              <div>
                <label className="label">Nome completo</label>
                <input
                  className="input"
                  value={nomeCompleto}
                  onChange={e => setNomeCompleto(e.target.value)}
                  placeholder="Seu nome completo"
                  maxLength={120}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                  Aparece no seu perfil público e nas demandas que você realiza
                </p>
              </div>

              {/* Username */}
              <div>
                <label className="label">Nome de usuário</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: 'var(--text3)' }}>@</span>
                  <input
                    className="input pl-7"
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="seu_username"
                    maxLength={30}
                  />
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                  3–30 caracteres · letras minúsculas, números e _ · aparece no lugar do e-mail na sidebar
                </p>
              </div>

              {/* Telefone */}
              <div>
                <label className="label">Telefone</label>
                <input
                  className="input"
                  value={telefone}
                  onChange={e => setTelefone(e.target.value)}
                  placeholder="(83) 9 0000-0000"
                />
              </div>

              {/* Info somente leitura */}
              <div className="space-y-2 text-sm" style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <div className="flex justify-between py-1.5">
                  <span style={{ color: 'var(--text3)' }}>E-mail</span>
                  <span style={{ color: 'var(--text2)' }}>{user.email}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span style={{ color: 'var(--text3)' }}>Tipo de conta</span>
                  <span style={{ color: 'var(--text2)' }}>{user.tipo}</span>
                </div>
              </div>

              <button
                onClick={handleSalvarPerfil}
                disabled={savingPerfil}
                className="btn btn-primary w-full"
              >
                {savingPerfil ? 'Salvando…' : 'Salvar alterações'}
              </button>
            </div>
          )}

          {/* ── SENHA ── */}
          {section === 'senha' && (
            <div className="card-solid space-y-5">
              <p className="section-label">Alterar senha</p>

              <div>
                <label className="label">Senha atual</label>
                <div className="relative">
                  <input
                    type={showAtual ? 'text' : 'password'}
                    className="input pr-10"
                    value={senhaAtual}
                    onChange={e => setSenhaAtual(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAtual(!showAtual)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text3)' }}
                  >
                    {showAtual ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Nova senha</label>
                <div className="relative">
                  <input
                    type={showNova ? 'text' : 'password'}
                    className="input pr-10"
                    value={novaSenha}
                    onChange={e => setNovaSenha(e.target.value)}
                    placeholder="mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNova(!showNova)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text3)' }}
                  >
                    {showNova ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Confirmar nova senha</label>
                <div className="relative">
                  <input
                    type="password"
                    className="input pr-8"
                    value={confirmar}
                    onChange={e => setConfirmar(e.target.value)}
                    placeholder="repita a nova senha"
                    style={{ borderColor: confirmar && novaSenha && confirmar !== novaSenha ? 'var(--red)' : undefined }}
                  />
                  {confirmar && novaSenha && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      {confirmar === novaSenha
                        ? <Check size={16} color="var(--green)" />
                        : <X size={16} color="var(--red)" />
                      }
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleAlterarSenha}
                disabled={savingSenha || !senhaAtual || !novaSenha || novaSenha !== confirmar}
                className="btn btn-primary w-full"
              >
                {savingSenha ? 'Alterando…' : 'Alterar senha'}
              </button>
            </div>
          )}

          {/* ── PRIVACIDADE ── */}
          {section === 'privacidade' && (
            <div className="card-solid space-y-5">
              <p className="section-label">Privacidade e dados (LGPD)</p>
              <p className="text-sm" style={{ color: 'var(--text3)' }}>
                Seus dados são tratados conforme a Lei 13.709/2018 (LGPD). Você tem direito a acesso, correção, portabilidade e exclusão.
              </p>

              <div className="space-y-4" style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <Toggle
                  label="Exibir selo público do imóvel"
                  desc="Permite que o Selo SUEDFLOW apareça publicamente na página do imóvel."
                  value={seloPublico}
                  onChange={setSeloPublico}
                />
                <Toggle
                  label="Compartilhar dados anônimos"
                  desc="Contribui com métricas de uso para melhorar a plataforma. Nenhum dado pessoal é compartilhado."
                  value={dadosAnonimos}
                  onChange={setDadosAnonimos}
                />
              </div>

              <button
                onClick={handleSalvarPrivacidade}
                disabled={savingPriv}
                className="btn btn-primary w-full"
              >
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

          {/* ── PERIGO ── */}
          {section === 'perigo' && (
            <div className="card" style={{ borderColor: 'rgba(255,77,109,0.3)', background: 'rgba(255,77,109,0.05)' }}>
              <p className="section-label" style={{ color: 'var(--red)' }}>Zona de perigo</p>
              <p className="text-sm mb-5" style={{ color: 'var(--text2)' }}>
                Ao cancelar sua conta, o acesso é encerrado imediatamente.
                Seus dados são mantidos por 60 dias conforme a LGPD (Art. 18).
                Esta ação é irreversível.
              </p>
              <button onClick={() => setCancelStep(1)} className="btn btn-danger btn-sm">
                Cancelar minha conta
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modal cancelar conta — 3 etapas */}
      {cancelStep > 0 && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md p-6 rounded-2xl" style={{ background: 'var(--navy2)', border: '1px solid rgba(255,77,109,0.3)' }}>

            {/* Etapa 1 — aviso */}
            {cancelStep === 1 && (
              <>
                <div className="text-center mb-4">
                  <p className="text-3xl mb-2">⚠️</p>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--red)' }}>Você quer cancelar sua conta?</h3>
                </div>
                <div className="rounded-xl p-4 mb-5 space-y-2 text-sm" style={{ background: 'rgba(255,77,109,0.06)', border: '1px solid rgba(255,77,109,0.2)' }}>
                  <p style={{ color: 'var(--text2)' }}>• Seu acesso será encerrado imediatamente</p>
                  <p style={{ color: 'var(--text2)' }}>• Demandas em andamento serão afetadas</p>
                  <p style={{ color: 'var(--text2)' }}>• Dados mantidos por 60 dias (LGPD Art. 18) e então removidos permanentemente</p>
                  <p style={{ color: 'var(--text2)' }}>• <strong style={{ color: 'var(--red)' }}>Essa ação é irreversível</strong></p>
                </div>
                <div className="flex gap-3">
                  <button onClick={fecharCancelModal} className="btn btn-secondary flex-1">Não, manter conta</button>
                  <button onClick={() => setCancelStep(2)} className="btn btn-danger flex-1">Continuar</button>
                </div>
              </>
            )}

            {/* Etapa 2 — motivo de churn */}
            {cancelStep === 2 && (
              <>
                <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text)' }}>Por que está saindo?</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text3)' }}>Sua resposta nos ajuda a melhorar a plataforma para futuros usuários.</p>
                <div className="space-y-2 mb-4">
                  {MOTIVOS_CHURN.map(m => (
                    <button
                      key={m}
                      onClick={() => setCancelMotivoPct(m)}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors"
                      style={{
                        background: cancelMotivoPct === m ? 'rgba(255,77,109,0.15)' : 'var(--glass)',
                        border: `1px solid ${cancelMotivoPct === m ? 'rgba(255,77,109,0.4)' : 'var(--border)'}`,
                        color: cancelMotivoPct === m ? '#FF4D6D' : 'var(--text2)',
                      }}
                    >
                      {cancelMotivoPct === m ? '● ' : '○ '}{m}
                    </button>
                  ))}
                </div>
                {cancelMotivoPct === 'Outro motivo' && (
                  <textarea
                    className="input mb-3"
                    rows={2}
                    placeholder="Conte-nos mais..."
                    value={cancelMotivo}
                    onChange={e => setCancelMotivo(e.target.value)}
                  />
                )}
                <div className="flex gap-3">
                  <button onClick={() => setCancelStep(1)} className="btn btn-secondary flex-1">← Voltar</button>
                  <button
                    onClick={() => setCancelStep(3)}
                    disabled={!cancelMotivoPct}
                    className="btn btn-danger flex-1"
                  >Continuar</button>
                </div>
              </>
            )}

            {/* Etapa 3 — confirmação digitando texto */}
            {cancelStep === 3 && (
              <>
                <h3 className="text-base font-bold mb-2" style={{ color: 'var(--red)' }}>Confirmação final</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text2)' }}>
                  Para confirmar o cancelamento, digite exatamente:<br />
                  <strong style={{ color: 'var(--text)', letterSpacing: '0.05em' }}>CANCELAR MINHA CONTA</strong>
                </p>
                <input
                  className="input mb-4"
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  placeholder="CANCELAR MINHA CONTA"
                  autoComplete="off"
                />
                <div className="flex gap-3">
                  <button onClick={() => setCancelStep(2)} className="btn btn-secondary flex-1">← Voltar</button>
                  <button
                    onClick={handleCancelarConta}
                    disabled={confirmText !== 'CANCELAR MINHA CONTA'}
                    className="btn btn-danger flex-1"
                  >Cancelar conta definitivamente</button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </Shell>
  )
}

function Toggle({ label, desc, value, onChange }: {
  label: string; desc: string; value: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{desc}</p>
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
