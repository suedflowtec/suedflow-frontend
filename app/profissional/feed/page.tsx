'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { orders } from '@/lib/api'
import { formatBRL } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

export default function ProfissionalFeed() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [demandas, setDemandas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [aceitando, setAceitando] = useState<string | null>(null)

  const carregar = () => {
    setLoading(true)
    orders.feed()
      .then(d => setDemandas(d?.demandas || []))
      .catch(err => {
        if (err.status === 403) toast(err.message || 'KYC ou módulo pendente', 'error')
        else toast('Erro ao carregar feed', 'error')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    carregar()
  }, [user, authLoading, router])

  const aceitar = async (id: string) => {
    setAceitando(id)
    try {
      await orders.aceitar(id, 0) // ajuste 0% = sem alteração
      toast('Demanda aceita! Aguardando pagamento do cliente.', 'success')
      carregar()
    } catch (err: any) {
      toast(err.message || 'Erro ao aceitar demanda', 'error')
    } finally {
      setAceitando(null)
    }
  }

  if (authLoading || !user) return null

  const URGENCIA_LABEL: Record<string, string> = {
    NORMAL: 'Normal', PRIORITARIO: '+30%', URGENTE: '+60%'
  }
  const TIPO_LABEL: Record<string, string> = {
    RESIDENCIAL: '🏠 Residencial', COMERCIAL: '🏢 Comercial', INDUSTRIAL: '🏭 Industrial'
  }

  return (
    <Shell>
      <Topbar
        title="Feed de demandas"
        subtitle={`${demandas.length} demanda${demandas.length !== 1 ? 's' : ''} disponível${demandas.length !== 1 ? 'is' : ''}`}
        actions={
          <button onClick={carregar} className="btn btn-secondary btn-sm">
            ↻ Atualizar
          </button>
        }
      />
      <main className="p-6">
        {loading ? (
          <div className="text-center py-16" style={{ color: 'var(--text3)' }}>Carregando feed...</div>
        ) : demandas.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-3 opacity-50">◉</div>
            <p className="font-semibold text-white mb-1">Nenhuma demanda disponível agora</p>
            <p className="text-sm" style={{ color: 'var(--text3)' }}>
              Novas demandas aparecem assim que clientes as criam.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {demandas.map(d => (
              <div key={d.id} className="card-solid" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono" style={{ color: 'var(--text3)' }}>{d.svc_codigo}</span>
                      <span className="text-white font-semibold">{d.svc_nome || d.svc_codigo}</span>
                      {d.urgencia !== 'NORMAL' && (
                        <span className="badge badge-orange">{URGENCIA_LABEL[d.urgencia]}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--text3)' }}>
                      <span>{TIPO_LABEL[d.tipo_imovel] || d.tipo_imovel}</span>
                      <span>📐 {d.area_m2}m²</span>
                      <span>📍 {d.cidade}/{d.estado}</span>
                      <span>⏱ SLA {d.sla_dias || 5} dias</span>
                    </div>
                    {d.descricao && (
                      <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--text2)' }}>{d.descricao}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold font-mono" style={{ color: 'var(--green)' }}>
                      {formatBRL(d.liquido_estimado || d.preco_servico || 0)}
                    </p>
                    <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>líquido estimado</p>
                    <button
                      onClick={() => aceitar(d.id)}
                      disabled={aceitando === d.id}
                      className="btn btn-primary btn-sm"
                    >
                      {aceitando === d.id ? 'Aceitando...' : 'Aceitar demanda'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </Shell>
  )
}
