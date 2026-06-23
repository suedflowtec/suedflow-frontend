'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Shell, Topbar } from '@/components/layout/Shell'
import { imovel as imovelApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { formatBRL } from '@/lib/utils'
import { Building2, Calendar, ChevronRight, AlertTriangle, Star, Layers } from 'lucide-react'

const TIPO_LABEL: Record<string, string> = {
  RESIDENCIAL: 'Residencial',
  COMERCIAL: 'Comercial',
  INDUSTRIAL: 'Industrial',
}

const STATUS_CFG: Record<string, { label: string; badge: string }> = {
  AGUARDANDO:              { label: 'Aguardando pagamento', badge: 'badge-gray' },
  PAGA:                    { label: 'Paga',                 badge: 'badge-orange' },
  ACEITA:                  { label: 'Aceita',               badge: 'badge-teal' },
  EM_EXECUCAO:             { label: 'Em execução',          badge: 'badge-teal' },
  AGUARDANDO_QA:           { label: 'Em revisão QA',        badge: 'badge-orange' },
  QA_REPROVADO:            { label: 'QA reprovado',         badge: 'badge-red' },
  AGUARDANDO_CONFIRMACAO:  { label: 'Aguardando confirm.', badge: 'badge-orange' },
  CONCLUIDA:               { label: 'Concluída',            badge: 'badge-green' },
  EM_DISPUTA:              { label: 'Em disputa',           badge: 'badge-red' },
  PARALISADA_PROF:         { label: 'Paralisada (prof.)',   badge: 'badge-red' },
  PARALISADA_CLIENTE:      { label: 'Paralisada (cliente)', badge: 'badge-red' },
  DEMANDA_ESPECIAL:        { label: 'Demanda especial',     badge: 'badge-purple' },
}

const SEV_BADGE: Record<string, string> = {
  BAIXA:   'badge-gray',
  MEDIA:   'badge-orange',
  ALTA:    'badge-red',
  CRITICA: 'badge-red',
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function ImovelDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = String(params?.id || '')
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [im, setIm] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    imovelApi.buscar(id)
      .then(setIm)
      .catch(() => {
        toast('Imóvel não encontrado', 'error')
        router.push('/cliente/imoveis')
      })
      .finally(() => setLoading(false))
  }, [user, authLoading, id, router, toast])

  if (authLoading || !user) return null

  const endereco = im
    ? [im.logradouro, im.numero, im.complemento, im.bairro].filter(Boolean).join(', ')
    : ''
  const cidadeUF = im ? `${im.cidade}/${im.estado}` : ''
  const mapQuery = im?.lat && im?.lng
    ? `${im.lat},${im.lng}`
    : encodeURIComponent(`${endereco}, ${cidadeUF}`)
  const hasMap = im && (endereco || (im.lat && im.lng))

  return (
    <Shell>
      <Topbar
        title={loading ? 'Carregando...' : (endereco || cidadeUF || 'Imóvel')}
        subtitle="Histórico técnico do imóvel"
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/cliente/imoveis/${id}/editar`)}
              className="btn btn-sm btn-secondary"
            >
              Editar
            </button>
            <button
              onClick={() => router.push('/cliente/imoveis')}
              className="btn btn-sm"
              style={{ background: 'var(--glass)', color: 'var(--text2)', border: '1px solid var(--border)' }}
            >
              ← Meus imóveis
            </button>
          </div>
        }
      />

      <main className="p-6 max-w-4xl space-y-5 pb-24">
        {loading ? (
          <div className="card text-center py-12">
            <p className="text-sm" style={{ color: 'var(--text3)' }}>Carregando...</p>
          </div>
        ) : !im ? null : (
          <>
            {/* ── Cabeçalho ── */}
            <div className="card-solid">
              <div className="flex items-start gap-4">
                <Building2 size={36} style={{ color: 'var(--orange)', flexShrink: 0, marginTop: 2 }} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="badge badge-gray">{TIPO_LABEL[im.tipo] || im.tipo || '—'}</span>
                    {im.area_total_m2 && <span className="badge badge-gray">{im.area_total_m2}m²</span>}
                    {im.selo && (
                      <span className="badge badge-gold flex items-center gap-1">
                        <Star size={10} /> Selo {im.selo.nivel}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold" style={{ color: 'var(--text)' }}>
                    {endereco || 'Endereço não informado'}
                  </p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text3)' }}>
                    {cidadeUF}
                    {im.cep ? ` · CEP ${String(im.cep).replace(/^(\d{5})(\d{3})$/, '$1-$2')}` : ''}
                    {im.ponto_referencia ? ` · Ref.: ${im.ponto_referencia}` : ''}
                  </p>
                  {im.construtora && (
                    <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                      Construtora: {im.construtora.nome_fantasia || im.construtora.razao_social}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Mapa ── */}
            {hasMap && (
              <div className="card overflow-hidden" style={{ padding: 0 }}>
                <iframe
                  title="Localização do imóvel"
                  src={`https://maps.google.com/maps?q=${mapQuery}&output=embed&z=17`}
                  width="100%"
                  height="200"
                  style={{ border: 0, display: 'block' }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}

            {/* ── Histórico de demandas ── */}
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <p className="section-label flex items-center gap-1.5">
                  <Calendar size={13} /> Histórico de demandas
                </p>
                <Link
                  href={`/cliente/nova-demanda`}
                  className="btn btn-primary btn-sm"
                >
                  + Nova demanda
                </Link>
              </div>

              {!im.demandas || im.demandas.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: 'var(--text3)' }}>
                  Nenhuma demanda registrada para este imóvel.
                </p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Serviço</th>
                      <th>Status</th>
                      <th>Profissional</th>
                      <th className="text-right">Valor</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {im.demandas.map((d: any) => {
                      const st = STATUS_CFG[d.status] || { label: d.status, badge: 'badge-gray' }
                      const prof = d.profissional?.usuario?.nome || '—'
                      return (
                        <tr
                          key={d.id}
                          className="cursor-pointer"
                          onClick={() => router.push(`/cliente/demandas/${d.id}`)}
                        >
                          <td style={{ color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                            {fmt(d.created_at)}
                          </td>
                          <td>
                            <span className="badge badge-gray mr-1">{d.servico?.codigo}</span>
                            <span style={{ color: 'var(--text2)' }}>{d.servico?.nome}</span>
                          </td>
                          <td>
                            <span className={`badge ${st.badge}`}>{st.label}</span>
                          </td>
                          <td style={{ color: 'var(--text2)' }}>{prof}</td>
                          <td className="text-right font-mono" style={{ color: 'var(--text)' }}>
                            {d.valor_total ? formatBRL(d.valor_total) : '—'}
                          </td>
                          <td>
                            <ChevronRight size={14} style={{ color: 'var(--text3)' }} />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* ── Achados técnicos ── */}
            <div className="card">
              <p className="section-label flex items-center gap-1.5 mb-3">
                <AlertTriangle size={13} /> Achados técnicos
              </p>

              {!im.achados || im.achados.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text3)' }}>
                  Nenhum achado técnico registrado.
                </p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Categoria</th>
                      <th>Descrição</th>
                      <th>Severidade</th>
                      <th>Fotos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {im.achados.map((a: any) => {
                      const cat = a.patologia_tipo?.subcategoria?.categoria?.nome || '—'
                      const sub = a.patologia_tipo?.subcategoria?.nome || ''
                      const badge = SEV_BADGE[a.severidade] || 'badge-gray'
                      return (
                        <tr key={a.id}>
                          <td style={{ color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                            {fmt(a.created_at)}
                          </td>
                          <td>
                            <p style={{ color: 'var(--text)' }}>{cat}</p>
                            {sub && <p className="text-xs" style={{ color: 'var(--text3)' }}>{sub}</p>}
                          </td>
                          <td style={{ color: 'var(--text2)', maxWidth: 240 }}>
                            <p className="truncate">{a.descricao || a.observacao || '—'}</p>
                          </td>
                          <td>
                            <span className={`badge ${badge}`}>{a.severidade || '—'}</span>
                          </td>
                          <td style={{ color: 'var(--text3)' }}>
                            {a.fotos?.length ? `${a.fotos.length}×` : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* ── Ciclos de revisão ── */}
            {im.ciclos_revisao && im.ciclos_revisao.length > 0 && (
              <div className="card">
                <p className="section-label flex items-center gap-1.5 mb-3">
                  <Layers size={13} /> Ciclos de revisão
                </p>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Motivo</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {im.ciclos_revisao.map((c: any) => (
                      <tr key={c.id}>
                        <td style={{ color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                          {fmt(c.created_at)}
                        </td>
                        <td style={{ color: 'var(--text2)' }}>{c.motivo || '—'}</td>
                        <td>
                          <span className="badge badge-gray">{c.status || '—'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </Shell>
  )
}
