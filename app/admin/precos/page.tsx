// app/admin/precos/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { Shell, Topbar } from '@/components/layout/Shell'
import { Button } from '@/components/ui/Button'
import { SvcConfigTable } from '@/components/admin/SvcConfigTable'
import { admin } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { useRouter } from 'next/navigation'

export default function AdminPrecosPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()

  const [svcs, setSvcs] = useState<any[]>([])
  const [pnr, setPnr] = useState('')
  const [fe, setFe] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingParams, setSavingParams] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (!['ADMIN', 'MODERADOR'].includes(user.tipo)) { router.push('/curador'); return }
    Promise.all([admin.svcsConfig(), admin.paramsGlobais()]).then(([{ svcs }, params]) => {
        setSvcs(svcs)
        setPnr(String(params.pnr))
        setFe(String(params.fe))
      })
      .catch(() => toast('Erro ao carregar configuração de preços', 'error'))
      .finally(() => setLoading(false))
  }, [toast])

  const salvarParams = async () => {
    setSavingParams(true)
    try {
      await admin.atualizarParamsGlobais({ pnr: Number(pnr), fe: Number(fe) })
      toast('Parâmetros globais atualizados', 'success')
    } catch (err: any) {
      toast(err.message || 'Erro ao salvar parâmetros', 'error')
    } finally {
      setSavingParams(false)
    }
  }

  const onSvcSaved = (atualizado: any) => {
    setSvcs(prev => prev.map(s => s.codigo === atualizado.codigo ? atualizado : s))
  }

  if (loading) return (
    <Shell><Topbar title="Motor UTS" /><main className="p-6"><p style={{ color: 'var(--text3)' }}>Carregando...</p></main></Shell>
  )

  return (
    <Shell>
      <Topbar title="Motor UTS" subtitle="Parâmetros de precificação dos serviços (SVCs) e fatores globais" />

      <main className="p-6 space-y-6">
        {/* Parâmetros globais */}
        <div className="card-solid max-w-xl">
          <p className="section-label mb-3">Parâmetros globais</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs" style={{ color: 'var(--text3)' }}>PNR-UTS (R$ por UTS)</label>
              <input className="input mt-1" type="number" step="any" value={pnr} onChange={e => setPnr(e.target.value)} />
            </div>
            <div>
              <label className="text-xs" style={{ color: 'var(--text3)' }}>FE (fator de equilíbrio)</label>
              <input className="input mt-1" type="number" step="any" value={fe} onChange={e => setFe(e.target.value)} />
            </div>
          </div>
          <Button className="mt-4" disabled={savingParams} onClick={salvarParams}>
            {savingParams ? 'Salvando...' : 'Salvar parâmetros'}
          </Button>
        </div>

        {/* Tabela de SVCs */}
        <div className="card-solid">
          <p className="section-label mb-3">Serviços (SVCs)</p>
          <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
            Fórmula: ceil(UTS_base × FEA) × PNR-UTS × Complexidade × Urgência × Escassez × FE.
            UTS_base varia por tipo de imóvel (Res/Com/Ind). Clique no status para ativar/desativar um serviço.
          </p>
          <SvcConfigTable svcs={svcs} onSaved={onSvcSaved} />
        </div>
      </main>
    </Shell>
  )
}
