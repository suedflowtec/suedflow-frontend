// app/admin/qa/page.tsx — Fila QA Centralizada (Admin)
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shell, Topbar } from '@/components/layout/Shell'
import { admin, orders } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { statusLabel } from '@/lib/utils'
import { RefreshCw, CheckCircle2, XCircle, Activity, Clock } from 'lucide-react'

const STATUS_QA = [
  { key: 'AGUARDANDO_QA',  label: 'Aguardando revisão SUE',  cor: 'var(--gold)',   badge: 'badge-yellow' },
  { key: 'QA_REPROVADO',   label: 'Reprovado (retrabalho)',  cor: 'var(--red)',    badge: 'badge-red' },
  { key: 'AGUARDANDO_CONFIRMACAO', label: 'Aguardando confirmação cliente', cor: 'var(--blue)', badge: 'badge-blue' },
]

export default function AdminQAPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [demandas, setDemandas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<string>('TODOS')

  const carregar = () => {
    setLoading(true)
    // Buscar demandas em estados de QA
    Promise.all(
      STATUS_QA.map(s => (admin as any).demandas({ status: s.key, limit: 50 })
        .then((r: any) => (r.demandas || []))
        .catch(() => [])
      )
    ).then(resultados => {
      const todas = resultados.flat().sort((a: any, b: any) =>
        new Date(a.updated_at || a.created_at).getTime() - new Date(b.updated_at || b.created_at).getTime()
      )
      setDemandas(todas)
    }).finally(() => setLoading(false))
  }

  const forcarVTC = async (demandaId: string) => {
    try {
      await admin.verificarSue(demandaId)
      toast('Verificação SUE disparada!', 'success')
      carregar()
    } catch (err: any) { toast(err.message || 'Erro', 'error') }
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (!['ADMIN', 'MODERADOR'].includes(user.tipo)) { router.push('/curador'); return }
    carregar()
  }, [user, authLoading])

  if (authLoading || !user) return null

  const filtradas = filtro === 'TODOS' ? demandas : demandas.filter(d => d.status === filtro)

  const contadores = STATUS_QA.reduce((acc, s) => {
    acc[s.key] = demandas.filter(d => d.status === s.key).length
    return acc
  }, {} as Record<string, number>)

  return (
    <Shell>
      <Topbar
        title="Fila QA Centralizada"
        subtitle={`${demandas.length} demanda${demandas.length !== 1 ? 's' : ''} em estados de QA`}
        actions={
          <button onClick={carregar} className="btn btn-secondary btn-sm flex items-center gap-1">
            <RefreshCw size={12} />Atualizar
          </button>
        }
      />

      <main className="p-6 space-y-5 max-w-6xl">

        {/* Status cards */}
        <div className="grid grid-cols-3 gap-3">
          {STATUS_QA.map(s => (
            <button key={s.key}
              onClick={() => setFiltro(filtro === s.key ? 'TODOS' : s.key)}
              className="rounded-xl p-4 text-left transition-all"
              style={{
                background: filtro === s.key ? `${s.cor}15` : 'var(--glass)',
                border: `1px solid ${filtro === s.key ? `${s.cor}50` : 'var(--border)'}`,
                borderLeft: `3px solid ${s.cor}`,
              }}
            >
              <p className="text-2xl font-black font-mono" style={{ color: s.cor }}>{contadores[s.key] || 0}</p>
              <p className="text-xs font-semibold mt-1" style={{ color: 'var(--text2)' }}>{s.label}</p>
            </button>
          ))}
        </div>

        {/* Filtros de status */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFiltro('TODOS')} className={filtro === 'TODOS' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}>
            Todos ({demandas.length})
          </button>
          {STATUS_QA.map(s => (
            <button key={s.key} onClick={() => setFiltro(filtro === s.key ? 'TODOS' : s.key)}
              className={filtro === s.key ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}>
              {s.label.split(' ')[0]} ({contadores[s.key] || 0})
            </button>
          ))}
        </div>

        {/* Tabela */}
        <div className="card-solid">
          {loading ? (
            <p className="text-sm text-center py-10" style={{ color: 'var(--text3)' }}>Carregando fila QA...</p>
          ) : filtradas.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <CheckCircle2 size={32} style={{ color: 'var(--green)', margin: '0 auto' }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--text2)' }}>Fila QA limpa</p>
              <p className="text-xs" style={{ color: 'var(--text3)' }}>Nenhuma demanda aguardando revisão de qualidade.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead><tr>
                <th>OS</th><th>Serviço</th><th>Profissional</th>
                <th>Status QA</th><th>Aguardando</th><th>VTC</th><th>Ações</th>
              </tr></thead>
              <tbody>
                {filtradas.map((d: any) => {
                  const s = statusLabel(d.status)
                  const horasAguardando = d.updated_at
                    ? Math.round((Date.now() - new Date(d.updated_at).getTime()) / 3600000)
                    : 0
                  const statusQA = STATUS_QA.find(sq => sq.key === d.status)
                  const temVTC = !!d.resultado_qa
                  return (
                    <tr key={d.id}>
                      <td className="mono">{d.numero || d.id?.slice(0,8)}</td>
                      <td className="bold">{d.servico?.nome || d.svc_codigo}</td>
                      <td style={{ color: 'var(--text3)' }}>{d.profissional?.usuario?.nome || '—'}</td>
                      <td>
                        <span className={`badge ${statusQA?.badge || 'badge-gray'}`}>
                          {s.text}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Clock size={11} style={{ color: horasAguardando > 24 ? 'var(--red)' : 'var(--text3)' }} />
                          <span className="text-xs font-mono" style={{ color: horasAguardando > 24 ? 'var(--red)' : 'var(--text3)' }}>
                            {horasAguardando > 24 ? `${Math.floor(horasAguardando/24)}d` : `${horasAguardando}h`}
                          </span>
                        </div>
                      </td>
                      <td>
                        {temVTC
                          ? <CheckCircle2 size={14} style={{ color: 'var(--green)' }} title="VTC emitida" />
                          : <XCircle size={14} style={{ color: 'var(--text3)' }} title="Sem VTC" />
                        }
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <Link href={`/admin/demandas/${d.id}`} className="btn btn-secondary btn-sm text-xs">Ver</Link>
                          {d.status === 'AGUARDANDO_QA' && !temVTC && (
                            <button onClick={() => forcarVTC(d.id)}
                              className="btn btn-sm text-xs"
                              style={{ background: 'rgba(232,103,26,0.15)', color: 'var(--orange)', border: '1px solid rgba(232,103,26,0.3)' }}>
                              Rodar SUE
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Info sobre o pipeline QA */}
        <div className="card text-xs space-y-1" style={{ color: 'var(--text3)' }}>
          <p className="font-semibold text-white">Como funciona o Pipeline QA</p>
          <p>1. Profissional submete entregável → status vai para AGUARDANDO_QA</p>
          <p>2. SUE (Verificação Técnica de Conformidade) roda automaticamente de forma assíncrona</p>
          <p>3. Curador revisa o resultado da SUE e aprova (→ AGUARDANDO_CONFIRMAÇÃO) ou reprova (→ QA_REPROVADO)</p>
          <p>4. Se aprovado, cliente confirma e demanda vai para CONCLUÍDA</p>
          <p className="text-2xs pt-1">Botão "Rodar SUE" força a verificação quando a VTC não foi emitida automaticamente.</p>
        </div>
      </main>
    </Shell>
  )
}
