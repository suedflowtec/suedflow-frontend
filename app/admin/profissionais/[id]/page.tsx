// app/admin/profissionais/[id]/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { admin } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'

const DOC_LABELS: Record<string, string> = {
  RG_FRENTE:        'RG / CNH — frente',
  RG_VERSO:         'RG / CNH — verso',
  SELFIE:           'Selfie segurando o documento',
  COMP_RESIDENCIA:  'Comprovante de residência',
  COMPROVANTE_CREA: 'Anuidade CREA/CAU vigente',
}

const STATUS_BADGE: Record<string, { text: string; variant: any }> = {
  PENDENTE: { text: 'Pendente', variant: 'gold' },
  APROVADO: { text: 'Aprovado', variant: 'green' },
  REPROVADO: { text: 'Reprovado', variant: 'red' },
}

function isImagem(url: string) {
  // Extensão explícita de imagem
  if (/\.(jpe?g|png|gif|webp|heic|avif)(\?|$)/i.test(url)) return true
  // URL Cloudinary /image/upload/ sem extensão de documento → assume imagem
  if (url.includes('cloudinary.com') && url.includes('/image/upload/') &&
      !url.match(/\.(pdf|doc|docx|zip|dwg|xls|xlsx|ppt)(\?|$)/i)) return true
  return false
}

export default function AdminProfissionalDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const id = params?.id as string

  const [profissional, setProfissional] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [motivo, setMotivo] = useState('')
  const [enviando, setEnviando] = useState(false)

  const carregar = () => {
    admin.profissional(id)
      .then(({ profissional }) => setProfissional(profissional))
      .catch((err: any) => toast(err.message || 'Erro ao carregar profissional', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!id) return
    carregar()
  }, [id])

  if (loading) return (
    <Shell><Topbar title="Profissional" /><main className="p-6"><p style={{ color: 'var(--text3)' }}>Carregando...</p></main></Shell>
  )
  if (!profissional) return (
    <Shell><Topbar title="Profissional" /><main className="p-6"><p style={{ color: 'var(--text3)' }}>Profissional não encontrado.</p></main></Shell>
  )

  const decidir = async (aprovado: boolean) => {
    if (!aprovado && motivo.trim().length < 5) {
      toast('Informe o motivo da reprovação (mínimo 5 caracteres)', 'error')
      return
    }
    setEnviando(true)
    try {
      await admin.aprovarKyc(id, aprovado, motivo.trim() || undefined)
      toast(aprovado ? 'KYC aprovado' : 'KYC reprovado', 'success')
      carregar()
      setMotivo('')
    } catch (err: any) {
      toast(err.message || 'Erro ao registrar decisão', 'error')
    } finally {
      setEnviando(false)
    }
  }

  const kycBadge = STATUS_BADGE[profissional.kyc_status] || STATUS_BADGE.PENDENTE

  return (
    <Shell>
      <Topbar
        title={profissional.usuario?.nome || profissional.usuario?.email}
        subtitle={profissional.usuario?.email}
        actions={<Badge variant={kycBadge.variant}>KYC {kycBadge.text}</Badge>}
      />

      <main className="p-6 max-w-4xl space-y-4">
        <Button variant="ghost" onClick={() => router.push('/admin/profissionais')}>← Voltar para a lista</Button>

        {/* ── Decisão de KYC — TOPO para visibilidade ── */}
        {profissional.kyc_status !== 'APROVADO' && (
          <div className="card-accent space-y-3">
            <p className="section-label" style={{ color: 'var(--orange)' }}>
              ⚠ KYC pendente de decisão
            </p>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>
              Revise os documentos abaixo e registre sua decisão. Ao aprovar, o profissional fica habilitado a receber demandas.
            </p>
            <textarea
              className="input"
              rows={2}
              placeholder="Motivo da reprovação (obrigatório só para reprovar)"
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
            />
            <div className="flex gap-2">
              <Button variant="green" className="flex-1" disabled={enviando} onClick={() => decidir(true)}>
                ✓ Aprovar KYC
              </Button>
              <Button variant="orange" className="flex-1" disabled={enviando} onClick={() => decidir(false)}>
                ✗ Reprovar KYC
              </Button>
            </div>
          </div>
        )}

        {profissional.kyc_status === 'APROVADO' && (
          <div className="rounded-xl px-4 py-3 flex items-center gap-2 text-sm" style={{ background: 'rgba(0,214,143,0.08)', border: '1px solid rgba(0,214,143,0.2)' }}>
            <span style={{ color: 'var(--green)' }}>✓ KYC aprovado</span>
            <span style={{ color: 'var(--text3)' }}>— profissional habilitado a receber demandas</span>
          </div>
        )}

        {/* Dados profissionais */}
        <div className="card-solid">
          <p className="section-label mb-3">Dados profissionais</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-xs" style={{ color: 'var(--text3)' }}>Conselho</span>
              <span className="font-mono" style={{ color: 'var(--text)' }}>
                {profissional.conselho || 'CREA'}-{profissional.uf_conselho || '—'} {profissional.numero_conselho || '—'}
              </span>
            </div>
            <div>
              <span className="block text-xs" style={{ color: 'var(--text3)' }}>Nível SQP</span>
              <Badge variant="orange">{profissional.nivel || 'CANDIDATO'}</Badge>
            </div>
            <div>
              <span className="block text-xs" style={{ color: 'var(--text3)' }}>Cidade/UF</span>
              <span style={{ color: 'var(--text)' }}>{profissional.cidade || '—'}{profissional.estado ? `/${profissional.estado}` : ''}</span>
            </div>
            <div>
              <span className="block text-xs" style={{ color: 'var(--text3)' }}>Raio de atuação</span>
              <span style={{ color: 'var(--text)' }}>{profissional.raio_km} km</span>
            </div>
          </div>
        </div>

        {/* SVCs habilitados */}
        <div className="card-solid">
          <p className="section-label mb-3">Serviços habilitados</p>
          {(profissional.svcs_habilitados || []).length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text3)' }}>Nenhum serviço habilitado.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profissional.svcs_habilitados.map((s: any) => (
                <Badge key={s.codigo_svc} variant="glass">{s.codigo_svc}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* Documentos KYC */}
        <div className="card-solid space-y-3">
          <p className="section-label">Documentos KYC</p>
          {(profissional.documentos_kyc || []).length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text3)' }}>Nenhum documento enviado ainda.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {profissional.documentos_kyc.map((doc: any) => {
                const status = STATUS_BADGE[doc.status] || STATUS_BADGE.PENDENTE
                const docUrl = admin.urlKycDoc(doc.id)
                return (
                  <div key={doc.id} className="p-3 rounded-xl" style={{ background: 'var(--glass)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{DOC_LABELS[doc.tipo] || doc.tipo}</span>
                      <Badge variant={status.variant}>{status.text}</Badge>
                    </div>
                    {isImagem(doc.url_arquivo) ? (
                      <a href={docUrl} target="_blank" rel="noreferrer">
                        <img
                          src={doc.url_arquivo}
                          alt={doc.tipo}
                          className="w-full rounded-lg"
                          style={{ maxHeight: 180, objectFit: 'cover' }}
                          onError={(e) => {
                            const el = e.currentTarget
                            const parent = el.parentElement
                            if (parent) {
                              parent.innerHTML = `<a href="${docUrl}" target="_blank" rel="noreferrer" style="color:var(--orange);font-size:13px;">Abrir documento ↗</a>`
                            }
                          }}
                        />
                      </a>
                    ) : (
                      <a href={docUrl} target="_blank" rel="noreferrer" className="text-sm" style={{ color: 'var(--orange)' }}>
                        Abrir no navegador ↗
                      </a>
                    )}
                    <p className="text-2xs mt-2" style={{ color: 'var(--text3)' }}>Enviado em {formatDate(doc.created_at)}</p>
                    {doc.motivo && <p className="text-2xs mt-1" style={{ color: 'var(--red)' }}>{doc.motivo}</p>}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Selo PIONEER — primeiros 100 profissionais aprovados */}
        <div className="card-solid space-y-3">
          <p className="section-label">🏅 Selo PIONEER</p>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>
            Concede o Selo PIONEER (primeiros 100 aprovados). Benefícios: badge permanente, comissão reduzida 90 dias, prioridade no feed por 1 ano.
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold" style={{ color: profissional.is_pioneer ? 'var(--gold)' : 'var(--text3)' }}>
                {profissional.is_pioneer ? '🏅 PIONEER ativo' : 'Sem selo PIONEER'}
              </p>
              {profissional.pioneer_desde && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>
                  Concedido em {new Date(profissional.pioneer_desde).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
            <Button
              variant={profissional.is_pioneer ? 'ghost' : 'orange'}
              size="sm"
              disabled={enviando}
              onClick={async () => {
                setEnviando(true)
                try {
                  await admin.concederPioneer(id, !profissional.is_pioneer)
                  toast(profissional.is_pioneer ? 'Selo revogado' : 'Selo PIONEER concedido!', 'success')
                  carregar()
                } catch (err: any) { toast(err.message || 'Erro', 'error') }
                finally { setEnviando(false) }
              }}
            >
              {profissional.is_pioneer ? 'Revogar PIONEER' : '+ Conceder PIONEER'}
            </Button>
          </div>
        </div>
      </main>
    </Shell>
  )
}
