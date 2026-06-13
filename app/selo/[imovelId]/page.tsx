// app/selo/[imovelId]/page.tsx — página pública do Selo SUEDFLOW (sem autenticação)
'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { selo as seloApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'

const TIPO_LABEL: Record<string, string> = {
  RESIDENCIAL: 'Residencial',
  COMERCIAL: 'Comercial',
  INDUSTRIAL: 'Industrial',
}

const NIVEL_VARIANT: Record<string, any> = {
  BASE: 'blue',
  QUALIFICADO: 'green',
  PREMIUM: 'gold',
}

const EVENTO_LABEL: Record<string, string> = {
  EMITIDO: 'Selo emitido',
  PROMOVIDO: 'Selo promovido',
  REBAIXADO: 'Selo rebaixado',
  REVOGADO: 'Selo revogado',
  RESTAURADO: 'Selo restaurado',
}

export default function SeloPublicoPage() {
  const params = useParams()
  const imovelId = params?.imovelId as string

  const [data, setData] = useState<any>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!imovelId) return
    seloApi.publico(imovelId)
      .then(setData)
      .catch((err: any) => setErro(err.message || 'Selo não encontrado'))
      .finally(() => setLoading(false))
  }, [imovelId])

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-2xl space-y-4">
        <div className="text-center mb-2">
          <p className="text-xl font-bold" style={{ color: 'var(--orange)' }}>SUEDFLOW</p>
          <p className="text-sm" style={{ color: 'var(--text3)' }}>Selo de Histórico Técnico</p>
        </div>

        {loading ? (
          <p className="text-center text-sm" style={{ color: 'var(--text3)' }}>Carregando...</p>
        ) : erro || !data ? (
          <div className="card-solid text-center">
            <p className="text-sm" style={{ color: 'var(--text2)' }}>{erro || 'Selo não encontrado para este imóvel.'}</p>
          </div>
        ) : (
          <>
            <div className="card-accent text-center space-y-2">
              <Badge variant={NIVEL_VARIANT[data.nivel] || 'glass'}>{data.nivel_label}</Badge>
              {!data.valido && (
                <p className="text-xs" style={{ color: 'var(--red)' }}>⚠ Selo atualmente inválido/revogado</p>
              )}
              <p className="text-sm" style={{ color: 'var(--text2)' }}>
                {TIPO_LABEL[data.imovel?.tipo] || data.imovel?.tipo}
                {data.imovel?.area_m2 ? ` · ${data.imovel.area_m2}m²` : ''}
              </p>
              <p className="text-sm" style={{ color: 'var(--text3)' }}>
                {[data.imovel?.bairro, data.imovel?.cidade, data.imovel?.estado].filter(Boolean).join(' · ')}
              </p>
              <p className="text-2xs" style={{ color: 'var(--text3)' }}>
                Emitido em {formatDate(data.emitido_em)} · atualizado em {formatDate(data.atualizado_em)}
              </p>
            </div>

            {/* Resumo */}
            <div className="card-solid">
              <p className="section-label mb-3">Resumo do histórico técnico</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="kpi-card">
                  <p className="kpi-value">{data.resumo?.total_servicos ?? 0}</p>
                  <p className="kpi-label">Serviços</p>
                </div>
                <div className="kpi-card">
                  <p className="kpi-value">{data.resumo?.meses_historico ?? 0}</p>
                  <p className="kpi-label">Meses</p>
                </div>
                <div className="kpi-card">
                  <p className="kpi-value" style={{ color: (data.resumo?.inconformidades_abertas ?? 0) > 0 ? 'var(--red)' : 'var(--text)' }}>
                    {data.resumo?.inconformidades_abertas ?? 0}
                  </p>
                  <p className="kpi-label">Inconformidades</p>
                </div>
                <div className="kpi-card">
                  <p className="kpi-value">{data.resumo?.ciclos_fechados ?? 0}</p>
                  <p className="kpi-label">Ciclos fechados</p>
                </div>
              </div>
            </div>

            {/* Serviços realizados */}
            {(data.servicos || []).length > 0 && (
              <div className="card-solid">
                <p className="section-label mb-3">Serviços realizados</p>
                <ul className="space-y-2">
                  {data.servicos.map((s: any, i: number) => (
                    <li key={i} className="flex justify-between text-sm">
                      <div>
                        <span className="font-mono" style={{ color: 'var(--text)' }}>{s.svc}</span>
                        {s.profissional && (
                          <span style={{ color: 'var(--text3)' }}> · {s.profissional.nome_publico} ({s.profissional.conselho})</span>
                        )}
                      </div>
                      <span style={{ color: 'var(--text3)' }}>{formatDate(s.data)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Histórico do selo */}
            {(data.historico || []).length > 0 && (
              <div className="card-solid">
                <p className="section-label mb-3">Histórico do selo</p>
                <ul className="space-y-2">
                  {data.historico.map((h: any, i: number) => (
                    <li key={i} className="flex justify-between text-sm">
                      <span style={{ color: 'var(--text)' }}>
                        {EVENTO_LABEL[h.evento] || h.evento}
                        {h.nivel_de && h.nivel_para ? ` · ${h.nivel_de} → ${h.nivel_para}` : ''}
                      </span>
                      <span style={{ color: 'var(--text3)' }}>{formatDate(h.data)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-center text-2xs pt-2" style={{ color: 'var(--text3)' }}>
              Dados verificados pela plataforma SUEDFLOW · suedflow.com.br
            </p>
          </>
        )}
      </div>
    </div>
  )
}
