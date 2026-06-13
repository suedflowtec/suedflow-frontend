// app/cliente/imoveis/[id]/selo/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { selo as seloApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'

const NIVEL_BADGE: Record<string, { text: string; variant: any }> = {
  BASE: { text: 'Selo Base', variant: 'blue' },
  QUALIFICADO: { text: 'Selo Qualificado', variant: 'green' },
  PREMIUM: { text: 'Selo Premium', variant: 'gold' },
}

const EVENTO_LABEL: Record<string, string> = {
  EMITIDO: 'Selo emitido',
  PROMOVIDO: 'Selo promovido',
  REBAIXADO: 'Selo rebaixado',
  REVOGADO: 'Selo revogado',
  RESTAURADO: 'Selo restaurado',
}

export default function SeloProgressoPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const id = params?.id as string

  const [data, setData] = useState<{ selo: any; proximoNivel: any } | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    seloApi.meu(id)
      .then(setData)
      .catch((err: any) => setErro(err.message || 'Erro ao carregar selo'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <Shell><Topbar title="Selo SUEDFLOW" /><main className="p-6"><p style={{ color: 'var(--text3)' }}>Carregando...</p></main></Shell>
  )
  if (erro || !data?.selo) return (
    <Shell>
      <Topbar title="Selo SUEDFLOW" />
      <main className="p-6 max-w-md">
        <div className="card-solid space-y-3">
          <p className="text-sm" style={{ color: 'var(--text2)' }}>
            {erro || 'Este imóvel ainda não possui Selo SUEDFLOW.'}
          </p>
          <Button variant="ghost" onClick={() => router.push(`/cliente/imoveis/${id}`)}>Voltar para o imóvel</Button>
        </div>
      </main>
    </Shell>
  )

  const { selo, proximoNivel } = data
  const nivel = NIVEL_BADGE[selo.nivel]

  return (
    <Shell>
      <Topbar
        title="Selo SUEDFLOW"
        subtitle={`Emitido em ${formatDate(selo.emitido_em)} · atualizado em ${formatDate(selo.atualizado_em)}`}
        actions={<Badge variant={nivel.variant}>{nivel.text}</Badge>}
      />

      <main className="p-6 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Estatísticas */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card-solid">
              <p className="section-label mb-3">Estatísticas do imóvel</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="kpi-card">
                  <p className="kpi-value">{selo.total_svcs}</p>
                  <p className="kpi-label">Serviços concluídos</p>
                </div>
                <div className="kpi-card">
                  <p className="kpi-value">{selo.svcs_distintos}</p>
                  <p className="kpi-label">SVCs distintos</p>
                </div>
                <div className="kpi-card">
                  <p className="kpi-value">{selo.meses_historico}</p>
                  <p className="kpi-label">Meses de histórico</p>
                </div>
                <div className="kpi-card">
                  <p className="kpi-value" style={{ color: selo.inconformidades > 0 ? 'var(--red)' : 'var(--text)' }}>
                    {selo.inconformidades}
                  </p>
                  <p className="kpi-label">Inconformidades abertas</p>
                </div>
                <div className="kpi-card">
                  <p className="kpi-value">{selo.ciclos_fechados}</p>
                  <p className="kpi-label">Ciclos fechados</p>
                </div>
              </div>
            </div>

            {/* Progresso para próximo nível */}
            <div className="card-solid">
              <p className="section-label mb-3">Progresso</p>
              {proximoNivel?.completo ? (
                <p className="text-sm" style={{ color: 'var(--green)' }}>
                  ✓ Este imóvel já atingiu o nível máximo do Selo SUEDFLOW (Premium).
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm" style={{ color: 'var(--text2)' }}>
                    Critérios para alcançar o {NIVEL_BADGE[proximoNivel?.nivel_alvo]?.text || proximoNivel?.nivel_alvo}:
                  </p>
                  <ul className="space-y-2">
                    {(proximoNivel?.criterios || []).map((c: any, i: number) => (
                      <li key={i} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2" style={{ color: 'var(--text)' }}>
                          <span style={{ color: c.ok ? 'var(--green)' : 'var(--text3)' }}>{c.ok ? '✓' : '○'}</span>
                          {c.descricao}
                        </span>
                        <span className="font-mono text-xs" style={{ color: 'var(--text3)' }}>{c.atual}/{c.meta}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Histórico do selo */}
            {(selo.historico || []).length > 0 && (
              <div className="card-solid">
                <p className="section-label mb-3">Histórico do selo</p>
                <ul className="space-y-2">
                  {selo.historico.map((h: any) => (
                    <li key={h.id} className="flex justify-between text-sm">
                      <span style={{ color: 'var(--text)' }}>
                        {EVENTO_LABEL[h.evento] || h.evento}
                        {h.nivel_de && h.nivel_para ? ` · ${h.nivel_de} → ${h.nivel_para}` : ''}
                      </span>
                      <span style={{ color: 'var(--text3)' }}>{formatDate(h.criado_em)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Versão pública */}
          <div className="space-y-4">
            <div className="card-solid space-y-3">
              <p className="section-label">Selo público</p>
              <p className="text-sm" style={{ color: 'var(--text2)' }}>
                Compartilhe a versão pública do Selo deste imóvel — sem dados pessoais,
                pronta para anexar em anúncios ou contratos.
              </p>
              <Button variant="ghost" className="w-full" onClick={() => router.push(`/selo/${id}`)}>
                Ver página pública
              </Button>
            </div>
            <Button variant="ghost" className="w-full" onClick={() => router.push(`/cliente/imoveis/${id}`)}>
              Voltar para o imóvel
            </Button>
          </div>
        </div>
      </main>
    </Shell>
  )
}
