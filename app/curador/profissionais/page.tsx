'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { curador as curadorApi, admin as adminApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { formatDate } from '@/lib/utils'
import { UserCheck, XCircle, FileText } from 'lucide-react'

const DOC_LABELS: Record<string, string> = {
  RG_FRENTE:      'RG / CNH — frente',
  RG_VERSO:       'RG / CNH — verso',
  SELFIE:         'Selfie com documento',
  COMP_RESIDENCIA:'Comprovante de residência',
}

function isImg(url: string) {
  return /\.(jpe?g|png|gif|webp)/i.test(url)
}

export default function CuradorKycPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()

  const [profissionais, setProfissionais] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [decidindo, setDecidindo] = useState<string | null>(null)
  const [motivo, setMotivo] = useState('')
  const [expandido, setExpandido] = useState<string | null>(null)
  const [docMotivo, setDocMotivo] = useState<Record<string, string>>({})
  const [docDecidindo, setDocDecidindo] = useState<string | null>(null)

  const carregar = () => {
    curadorApi.profissionaisKyc?.()
      .then(r => setProfissionais(r.profissionais || []))
      .catch(() => toast('Erro ao carregar profissionais', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (!['CURADOR_SUPORTE', 'CURADOR_SENIOR', 'ADMIN'].includes(user.tipo)) {
      router.push('/cliente'); return
    }
    carregar()
  }, [user, authLoading, router])

  if (authLoading || !user) return null

  const decidir = async (id: string, aprovado: boolean) => {
    if (!aprovado && motivo.trim().length < 5) {
      toast('Informe o motivo da reprovação (mínimo 5 caracteres)', 'error')
      return
    }
    setDecidindo(id)
    try {
      await curadorApi.aprovarKycCurador(id, aprovado, motivo.trim() || undefined)
      toast(aprovado ? 'KYC aprovado' : 'KYC reprovado', 'success')
      setMotivo('')
      setExpandido(null)
      carregar()
    } catch (err: any) {
      toast(err.message || 'Erro ao registrar decisão', 'error')
    } finally {
      setDecidindo(null)
    }
  }

  const decidirDoc = async (docId: string, aprovado: boolean) => {
    const motivoDoc = docMotivo[docId] || ''
    if (!aprovado && motivoDoc.trim().length < 5) {
      toast('Informe o motivo da reprovação do documento (mínimo 5 caracteres)', 'error')
      return
    }
    setDocDecidindo(docId)
    try {
      await adminApi.aprovarKycDoc(docId, aprovado, motivoDoc.trim() || undefined)
      toast(aprovado ? 'Documento aprovado' : 'Documento reprovado', 'success')
      setDocMotivo(prev => ({ ...prev, [docId]: '' }))
      carregar()
    } catch (err: any) {
      toast(err.message || 'Erro ao decidir documento', 'error')
    } finally {
      setDocDecidindo(null)
    }
  }

  const pendentes  = profissionais.filter(p => p.kyc_status === 'PENDENTE')
  const reprovados = profissionais.filter(p => p.kyc_status === 'REPROVADO')

  return (
    <Shell>
      <Topbar
        title="KYC — Análise de Profissionais"
        subtitle={`${pendentes.length} pendente${pendentes.length !== 1 ? 's' : ''} · ${reprovados.length} reprovado${reprovados.length !== 1 ? 's' : ''}`}
      />

      <main className="p-6 max-w-4xl space-y-4">
        {loading ? (
          <p className="text-sm py-10 text-center" style={{ color: 'var(--text3)' }}>Carregando...</p>
        ) : profissionais.length === 0 ? (
          <div className="card-solid text-center py-12 space-y-2">
            <UserCheck size={32} className="mx-auto" style={{ color: 'var(--green)', opacity: 0.5 }} />
            <p className="text-sm font-semibold text-white">Nenhum KYC pendente</p>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>Todos os profissionais foram analisados.</p>
          </div>
        ) : (
          profissionais.map(prof => (
            <div key={prof.id} className="card-solid space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-white">{prof.usuario?.nome || prof.usuario?.email || '—'}</p>
                    <span className={`badge ${prof.kyc_status === 'PENDENTE' ? 'badge-gold' : 'badge-red'}`}>
                      {prof.kyc_status}
                    </span>
                  </div>
                  <p className="text-xs font-mono" style={{ color: 'var(--text3)' }}>
                    {prof.usuario?.email} · {prof.conselho}-{prof.uf_conselho} {prof.numero_conselho}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>
                    Registrado em {formatDate(prof.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => setExpandido(expandido === prof.id ? null : prof.id)}
                  className="btn btn-ghost btn-sm"
                >
                  {expandido === prof.id ? 'Fechar' : 'Analisar'}
                </button>
              </div>

              {/* Documentos expandidos */}
              {expandido === prof.id && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {(prof.documentos_kyc || []).map((doc: any) => {
                      const docStatusColor = doc.status === 'APROVADO' ? 'var(--green)' : doc.status === 'REPROVADO' ? 'var(--red)' : 'var(--gold)'
                      return (
                        <div key={doc.id} className="rounded-xl p-3 space-y-2" style={{ background: 'var(--glass)' }}>
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold" style={{ color: 'var(--text3)' }}>
                              {DOC_LABELS[doc.tipo] || doc.tipo}
                            </p>
                            <span className="text-2xs font-bold" style={{ color: docStatusColor }}>{doc.status}</span>
                          </div>
                          {isImg(doc.url_arquivo) ? (
                            <a href={doc.url_arquivo} target="_blank" rel="noreferrer">
                              <img src={doc.url_arquivo} alt={doc.tipo}
                                className="w-full rounded-lg object-cover" style={{ maxHeight: 140 }} />
                            </a>
                          ) : (
                            <a href={`/api/ver?url=${encodeURIComponent(doc.url_arquivo)}`} target="_blank" rel="noreferrer"
                              className="flex items-center gap-2 text-sm font-semibold"
                              style={{ color: 'var(--orange)' }}>
                              <FileText size={14} /> Abrir documento ↗
                            </a>
                          )}
                          {doc.motivo && <p className="text-2xs" style={{ color: 'var(--red)' }}>{doc.motivo}</p>}
                          {/* Aprovação individual */}
                          {doc.status !== 'APROVADO' && (
                            <div className="space-y-1 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                              <input
                                type="text"
                                className="input text-xs py-1"
                                placeholder="Motivo (obrigatório para reprovar)"
                                value={docMotivo[doc.id] || ''}
                                onChange={e => setDocMotivo(prev => ({ ...prev, [doc.id]: e.target.value }))}
                              />
                              <div className="flex gap-1">
                                <button
                                  onClick={() => decidirDoc(doc.id, true)}
                                  disabled={docDecidindo === doc.id}
                                  className="btn btn-sm flex-1 text-xs"
                                  style={{ background: 'rgba(0,214,143,0.15)', color: 'var(--green)', border: '1px solid rgba(0,214,143,0.3)' }}
                                >
                                  ✓ Aprovar
                                </button>
                                <button
                                  onClick={() => decidirDoc(doc.id, false)}
                                  disabled={docDecidindo === doc.id}
                                  className="btn btn-sm flex-1 text-xs"
                                  style={{ background: 'rgba(255,77,109,0.12)', color: 'var(--red)', border: '1px solid rgba(255,77,109,0.3)' }}
                                >
                                  ✗ Reprovar
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <div className="space-y-2">
                    <textarea
                      className="input text-sm"
                      rows={2}
                      placeholder="Motivo (obrigatório para reprovar)"
                      value={motivo}
                      onChange={e => setMotivo(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => decidir(prof.id, true)}
                        disabled={!!decidindo}
                        className="btn flex-1 flex items-center justify-center gap-1"
                        style={{ background: 'rgba(0,214,143,0.15)', color: 'var(--green)', border: '1px solid rgba(0,214,143,0.35)' }}
                      >
                        <UserCheck size={14} /> Aprovar KYC
                      </button>
                      <button
                        onClick={() => decidir(prof.id, false)}
                        disabled={!!decidindo}
                        className="btn flex-1 flex items-center justify-center gap-1"
                        style={{ background: 'rgba(255,77,109,0.12)', color: 'var(--red)', border: '1px solid rgba(255,77,109,0.35)' }}
                      >
                        <XCircle size={14} /> Reprovar KYC
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </main>
    </Shell>
  )
}
