// app/cliente/imoveis/[id]/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { imovel } from '@/lib/api'
import { formatDate, statusLabel } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'

const TIPO_LABEL: Record<string, string> = {
  RESIDENCIAL: 'Residencial',
  COMERCIAL: 'Comercial',
  INDUSTRIAL: 'Industrial',
}

const NIVEL_BADGE: Record<string, { text: string; variant: any }> = {
  BASE: { text: 'Selo Base', variant: 'blue' },
  QUALIFICADO: { text: 'Selo Qualificado', variant: 'green' },
  PREMIUM: { text: 'Selo Premium', variant: 'gold' },
}

const GRAVIDADE_BADGE: Record<string, { text: string; variant: any }> = {
  LEVE: { text: 'Leve', variant: 'glass' },
  MODERADA: { text: 'Moderada', variant: 'gold' },
  GRAVE: { text: 'Grave', variant: 'orange' },
  CRITICA: { text: 'Crítica', variant: 'red' },
}

const RESOLUCAO_BADGE: Record<string, { text: string; variant: any }> = {
  ABERTA: { text: 'Aberta', variant: 'red' },
  EM_REPARO: { text: 'Em reparo', variant: 'gold' },
  RESOLVIDA: { text: 'Resolvida', variant: 'green' },
  DESCARTADA: { text: 'Descartada', variant: 'glass' },
}

export default function ImovelDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const id = params?.id as string

  const [im, setIm] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    imovel.buscar(id)
      .then(setIm)
      .catch(() => toast('Erro ao carregar imóvel', 'error'))
      .finally(() => setLoading(false))
  }, [id, toast])

  if (loading) return (
    <Shell><Topbar title="Imóvel" /><main className="p-6"><p style={{ color: 'var(--text3)' }}>Carregando...</p></main></Shell>
  )
  if (!im) return (
    <Shell><Topbar title="Imóvel" /><main className="p-6"><p style={{ color: 'var(--text3)' }}>Imóvel não encontrado.</p></main></Shell>
  )

  const nivel = im.selo ? NIVEL_BADGE[im.selo.nivel] : null
  const endereco = im.logradouro
    ? `${im.logradouro}${im.numero ? `, ${im.numero}` : ''}${im.complemento ? ` - ${im.complemento}` : ''}`
    : (im.bairro || im.cidade)

  return (
    <Shell>
      <Topbar
        title={endereco}
        subtitle={[im.bairro, im.cidade, im.estado].filter(Boolean).join(' · ')}
        actions={nivel ? <Badge variant={nivel.variant}>{nivel.text}</Badge> : undefined}
      />

      <main className="p-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-4">

            {/* Histórico de demandas */}
            <div className="card-solid">
              <p className="section-label mb-3">Histórico de serviços</p>
              {(im.demandas || []).length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--text3)' }}>Nenhuma demanda registrada para este imóvel.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Número</th>
                      <th>Serviço</th>
                      <th>Status</th>
                      <th>Profissional</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {im.demandas.map((d: any) => {
                      const s = statusLabel(d.status)
                      return (
                        <tr key={d.id} onClick={() => router.push(`/cliente/demandas/${d.id}`)} className="cursor-pointer">
                          <td className="font-mono">{d.numero || d.id?.slice(0, 8)}</td>
                          <td style={{ color: 'var(--text)' }}>{d.servico?.nome || d.svc_codigo}</td>
                          <td><Badge variant={s.variant as any}>{s.text}</Badge></td>
                          <td style={{ color: 'var(--text2)' }}>{d.profissional?.usuario?.nome || '—'}</td>
                          <td style={{ color: 'var(--text3)' }}>{formatDate(d.created_at)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Achados técnicos */}
            <div className="card-solid">
              <p className="section-label mb-3">Achados técnicos</p>
              {(im.achados || []).length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--text3)' }}>Nenhuma patologia registrada até o momento.</p>
              ) : (
                <ul className="space-y-3">
                  {im.achados.map((a: any) => {
                    const g = GRAVIDADE_BADGE[a.gravidade] || GRAVIDADE_BADGE.MODERADA
                    const r = RESOLUCAO_BADGE[a.status_resolucao] || RESOLUCAO_BADGE.ABERTA
                    const nome = a.patologia_tipo?.nome || a.descricao_livre || 'Patologia não especificada'
                    return (
                      <li key={a.id} className="pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{nome}</p>
                            {a.localizacao_no_imovel && (
                              <p className="text-2xs" style={{ color: 'var(--text3)' }}>{a.localizacao_no_imovel}</p>
                            )}
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Badge variant={g.variant}>{g.text}</Badge>
                            <Badge variant={r.variant}>{r.text}</Badge>
                          </div>
                        </div>
                        {a.recomendacao && (
                          <p className="text-xs mt-1" style={{ color: 'var(--text2)' }}>{a.recomendacao}</p>
                        )}
                        <p className="text-2xs mt-1" style={{ color: 'var(--text3)' }}>{formatDate(a.created_at)}</p>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* Ciclos de revisão */}
            {(im.ciclos_revisao || []).length > 0 && (
              <div className="card-solid">
                <p className="section-label mb-3">Ciclos de revisão</p>
                <ul className="space-y-2">
                  {im.ciclos_revisao.map((c: any) => (
                    <li key={c.id} className="flex justify-between text-sm">
                      <span style={{ color: 'var(--text)' }}>{c.svc_codigo}</span>
                      <span style={{ color: 'var(--text3)' }}>
                        {formatDate(c.data_inicio)} {c.data_fim ? `→ ${formatDate(c.data_fim)}` : '· em andamento'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Coluna lateral */}
          <div className="space-y-4">
            <div className="card-solid">
              <p className="section-label mb-3">Dados do imóvel</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text3)' }}>Tipo</span>
                  <span style={{ color: 'var(--text)' }}>{TIPO_LABEL[im.tipo] || im.tipo}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text3)' }}>Área total</span>
                  <span style={{ color: 'var(--text)' }}>{im.area_total_m2 ? `${im.area_total_m2}m²` : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text3)' }}>Ano de construção</span>
                  <span style={{ color: 'var(--text)' }}>{im.ano_construcao || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text3)' }}>Pavimentos</span>
                  <span style={{ color: 'var(--text)' }}>{im.pavimentos || '—'}</span>
                </div>
                {im.construtora && (
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text3)' }}>Construtora</span>
                    <span style={{ color: 'var(--text)' }}>{im.construtora.nome_fantasia || im.construtora.razao_social}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Selo */}
            <div className="card-solid space-y-2">
              <p className="section-label">Selo SUEDFLOW</p>
              {im.selo ? (
                <>
                  <Badge variant={nivel!.variant}>{nivel!.text}</Badge>
                  <div className="text-sm space-y-1 pt-1">
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text3)' }}>Serviços concluídos</span>
                      <span style={{ color: 'var(--text)' }}>{im.selo.total_svcs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text3)' }}>Inconformidades abertas</span>
                      <span style={{ color: im.selo.inconformidades > 0 ? 'var(--red)' : 'var(--text)' }}>{im.selo.inconformidades}</span>
                    </div>
                  </div>
                  <Button variant="ghost" className="w-full mt-2" onClick={() => router.push(`/cliente/imoveis/${id}/selo`)}>
                    Ver progresso do Selo
                  </Button>
                </>
              ) : (
                <p className="text-sm" style={{ color: 'var(--text3)' }}>
                  Este imóvel ainda não possui Selo SUEDFLOW. O selo é emitido após a primeira demanda concluída com QA aprovado.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </Shell>
  )
}
