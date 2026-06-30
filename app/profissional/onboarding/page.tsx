// app/profissional/onboarding/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { profissional as profissionalApi, svc as svcApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const KYC_DOCS: { tipo: string; label: string; hint?: string }[] = [
  { tipo: 'RG_FRENTE',        label: 'RG / CNH — frente' },
  { tipo: 'RG_VERSO',         label: 'RG / CNH — verso' },
  { tipo: 'SELFIE',           label: 'Selfie segurando o documento' },
  { tipo: 'COMP_RESIDENCIA',  label: 'Comprovante de residência' },
  { tipo: 'COMPROVANTE_CREA', label: 'Comprovante de anuidade CREA/CAU vigente', hint: 'Comprova que sua inscrição no conselho está ativa e em dia. Aceito: PDF ou imagem da certidão de situação regular.' },
]

export default function ProfissionalOnboardingPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [svcs, setSvcs] = useState<any[]>([])

  // step 1 — conselho
  const [conselho, setConselho] = useState('CREA')
  const [numeroConselho, setNumeroConselho] = useState('')
  const [ufConselho, setUfConselho] = useState('SP')

  // step 2 — svcs habilitados
  const [svcsSelecionados, setSvcsSelecionados] = useState<string[]>([])

  // step 3 — documentos KYC
  const [docsEnviados, setDocsEnviados] = useState<Record<string, boolean>>({})
  const [enviandoDoc, setEnviandoDoc] = useState<string | null>(null)

  // step 4 — PIX e termos
  const [pixKeyPadrao, setPixKeyPadrao] = useState('')
  const [aceitaTermos, setAceitaTermos] = useState(false)

  const [step, setStep] = useState(1)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }

    Promise.all([
      svcApi.listar().catch(() => []),
      profissionalApi.perfil().catch(() => null),
      profissionalApi.kycStatus().catch(() => null),
    ]).then(([svcsData, perfil, kyc]) => {
      const lista = Array.isArray(svcsData) ? svcsData : ((svcsData as any)?.servicos || [])
      setSvcs(lista)

      if (perfil) {
        if (perfil.conselho) setConselho(perfil.conselho)
        if (perfil.numero_conselho) setNumeroConselho(perfil.numero_conselho)
        if (perfil.uf_conselho) setUfConselho(perfil.uf_conselho)
        if (Array.isArray(perfil.svcs_habilitados)) {
          setSvcsSelecionados(perfil.svcs_habilitados.map((s: any) => s.codigo_svc))
        }
      }

      if (kyc?.documentos) {
        const enviados: Record<string, boolean> = {}
        for (const d of kyc.documentos) enviados[d.tipo] = true
        setDocsEnviados(enviados)
      }
    }).finally(() => setLoading(false))
  }, [user, authLoading, router])

  if (authLoading || !user) return null
  if (loading) return (
    <Shell><Topbar title="Onboarding profissional" /><main className="p-6"><p style={{ color: 'var(--text3)' }}>Carregando...</p></main></Shell>
  )

  const toggleSvc = (codigo: string) => {
    setSvcsSelecionados(prev =>
      prev.includes(codigo) ? prev.filter(c => c !== codigo) : [...prev, codigo]
    )
  }

  const enviarDoc = async (tipo: string, file: File) => {
    setEnviandoDoc(tipo)
    try {
      await profissionalApi.enviarDocumentoKyc(tipo, file)
      setDocsEnviados(prev => ({ ...prev, [tipo]: true }))
      toast('Documento enviado', 'success')
    } catch (err: any) {
      toast(err.message || 'Erro ao enviar documento', 'error')
    } finally {
      setEnviandoDoc(null)
    }
  }

  const finalizar = async () => {
    if (!numeroConselho.trim()) {
      toast('Informe o número do conselho profissional', 'error')
      return
    }
    if (svcsSelecionados.length === 0) {
      toast('Selecione pelo menos um serviço que você executa', 'error')
      return
    }
    const todosDocsEnviados = KYC_DOCS.every(d => docsEnviados[d.tipo])
    if (!todosDocsEnviados) {
      toast('Envie todos os documentos de verificação (KYC) antes de concluir', 'error')
      setStep(3)
      return
    }
    if (!aceitaTermos) {
      toast('É necessário aceitar os termos para concluir', 'error')
      return
    }
    setSalvando(true)
    try {
      await profissionalApi.onboarding({
        conselho,
        numero_conselho: numeroConselho.trim(),
        uf_conselho: ufConselho,
        svcs_habilitados: svcsSelecionados,
        aceita_termos: aceitaTermos,
        pix_key_padrao: pixKeyPadrao.trim() || undefined,
      })
      toast('Onboarding concluído. Seus documentos serão analisados pela curadoria.', 'success')
      router.push('/profissional/perfil')
    } catch (err: any) {
      toast(err.message || 'Erro ao concluir onboarding', 'error')
    } finally {
      setSalvando(false)
    }
  }

  const STEPS = [
    { n: 1, label: 'Conselho' },
    { n: 2, label: 'Serviços' },
    { n: 3, label: 'Documentos KYC' },
    { n: 4, label: 'Termos' },
  ]

  return (
    <Shell>
      <Topbar title="Onboarding profissional" subtitle="Complete seu cadastro para começar a receber demandas" />

      <main className="p-6 max-w-3xl space-y-4">
        {/* Step indicator */}
        <div className="flex gap-2">
          {STEPS.map(s => (
            <button
              key={s.n}
              onClick={() => setStep(s.n)}
              className="flex-1 text-center py-2 rounded-xl text-sm"
              style={{
                background: step === s.n ? 'var(--glass2)' : 'var(--glass)',
                color: step === s.n ? 'var(--orange)' : 'var(--text3)',
                border: step === s.n ? '1px solid var(--orange)' : '1px solid transparent',
              }}
            >
              {s.n}. {s.label}
            </button>
          ))}
        </div>

        {/* Step 1 — conselho */}
        {step === 1 && (
          <div className="card-solid space-y-3">
            <p className="section-label">Registro profissional</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs" style={{ color: 'var(--text3)' }}>Conselho</label>
                <select className="input mt-1" value={conselho} onChange={e => setConselho(e.target.value)}>
                  <option value="CREA">CREA</option>
                  <option value="CAU">CAU</option>
                  <option value="CFT">CFT</option>
                </select>
              </div>
              <div>
                <label className="text-xs" style={{ color: 'var(--text3)' }}>Número de registro</label>
                <input className="input mt-1" value={numeroConselho} onChange={e => setNumeroConselho(e.target.value)} placeholder="Ex: 123456789" />
              </div>
              <div>
                <label className="text-xs" style={{ color: 'var(--text3)' }}>UF do registro</label>
                <select className="input mt-1" value={ufConselho} onChange={e => setUfConselho(e.target.value)}>
                  {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </div>
            </div>
            <Button onClick={() => setStep(2)}>Avançar</Button>
          </div>
        )}

        {/* Step 2 — svcs */}
        {step === 2 && (
          <div className="card-solid space-y-3">
            <p className="section-label">Serviços que você executa</p>
            <p className="text-sm" style={{ color: 'var(--text2)' }}>
              Selecione os serviços para os quais você quer receber demandas. Você pode alterar isso depois no seu perfil.
            </p>
            <div className="flex flex-wrap gap-2">
              {svcs.map((s: any) => {
                const ativo = svcsSelecionados.includes(s.codigo)
                return (
                  <button key={s.codigo} onClick={() => toggleSvc(s.codigo)}>
                    <Badge variant={ativo ? 'orange' : 'glass'}>
                      {s.codigo} — {s.nome}
                    </Badge>
                  </button>
                )
              })}
              {svcs.length === 0 && (
                <p className="text-sm" style={{ color: 'var(--text3)' }}>Nenhum serviço disponível no catálogo.</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep(1)}>Voltar</Button>
              <Button onClick={() => setStep(3)}>Avançar</Button>
            </div>
          </div>
        )}

        {/* Step 3 — KYC */}
        {step === 3 && (
          <div className="card-solid space-y-3">
            <p className="section-label">Documentos de verificação (KYC)</p>
            <p className="text-sm" style={{ color: 'var(--text2)' }}>
              Envie os documentos abaixo para que a curadoria possa validar sua identidade.
            </p>
            <div className="space-y-3">
              {KYC_DOCS.map(doc => (
                <div key={doc.tipo} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--glass)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: 'var(--text)' }}>{doc.label}</span>
                    {docsEnviados[doc.tipo] && <Badge variant="green">Enviado</Badge>}
                  </div>
                  <label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      disabled={enviandoDoc === doc.tipo}
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) enviarDoc(doc.tipo, file)
                      }}
                    />
                    <span className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
                      {enviandoDoc === doc.tipo ? 'Enviando...' : docsEnviados[doc.tipo] ? 'Reenviar' : 'Selecionar arquivo'}
                    </span>
                  </label>
                </div>
              ))}
            </div>
            {KYC_DOCS.some(d => !docsEnviados[d.tipo]) && (
              <p className="text-xs" style={{ color: 'var(--gold)' }}>
                ⚠ Envie todos os documentos para avançar ({Object.keys(docsEnviados).length}/{KYC_DOCS.length} enviados)
              </p>
            )}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep(2)}>Voltar</Button>
              <Button
                onClick={() => {
                  const todos = KYC_DOCS.every(d => docsEnviados[d.tipo])
                  if (!todos) { toast('Envie todos os 5 documentos antes de avançar', 'error'); return }
                  setStep(4)
                }}
              >Avançar</Button>
            </div>
          </div>
        )}

        {/* Step 4 — termos */}
        {step === 4 && (
          <div className="card-solid space-y-3">
            <p className="section-label">Revisão e termos</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text3)' }}>Conselho</span>
                <span className="font-mono" style={{ color: 'var(--text)' }}>{conselho}-{ufConselho} {numeroConselho || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text3)' }}>Serviços selecionados</span>
                <span style={{ color: 'var(--text)' }}>{svcsSelecionados.length}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text3)' }}>Documentos enviados</span>
                <span style={{ color: 'var(--text)' }}>{Object.keys(docsEnviados).length} / {KYC_DOCS.length}</span>
              </div>
            </div>
            {/* Chave PIX para saques */}
            <div className="space-y-1">
              <label className="label">Chave PIX para receber pagamentos</label>
              <input
                className="input"
                placeholder="CPF, e-mail, telefone ou chave aleatória"
                value={pixKeyPadrao}
                onChange={e => setPixKeyPadrao(e.target.value)}
              />
              <p className="text-2xs" style={{ color: 'var(--text3)' }}>
                Usada para transferências dos seus serviços concluídos. Pode ser alterada depois no Financeiro.
              </p>
            </div>

            <label className="flex items-start gap-2 text-sm" style={{ color: 'var(--text2)' }}>
              <input type="checkbox" checked={aceitaTermos} onChange={e => setAceitaTermos(e.target.checked)} className="mt-1" />
              <span>
                Declaro que as informações fornecidas são verdadeiras e aceito os termos de uso da plataforma
                SUEDFLOW para profissionais.
              </span>
            </label>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep(3)}>Voltar</Button>
              <Button disabled={salvando} onClick={finalizar}>
                {salvando ? 'Enviando...' : 'Concluir onboarding'}
              </Button>
            </div>
          </div>
        )}
      </main>
    </Shell>
  )
}
