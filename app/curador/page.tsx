// app/curador/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { curador as curadorApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

const TIPO_LABEL: Record<string, string> = {
  QA_REPROVADO:     'QA reprovado',
  DISPUTA:          'Disputa',
  DEMANDA_ESPECIAL: 'Demanda especial',
}

export default function CuradorPainelPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()

  const [casos, setCasos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    curadorApi.fila()
      .then(({ casos }) => setCasos(casos))
      .catch(() => toast('Erro ao carregar fila de casos', 'error'))
      .finally(() => setLoading(false))
  }, [user, authLoading, router, toast])

  if (authLoading || !user) return null

  const porTipo = (tipo: string) => casos.filter(c => c.tipo === tipo).length
  const urgentes = casos.filter(c => c.prazo_horas <= 4).length

  return (
    <Shell>
      <Topbar title="Painel do Curador" subtitle={`Bem-vindo, ${user.nome?.split(' ')[0] || ''}`} />

      <main className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="kpi-card">
            <p className="kpi-value">{loading ? '—' : casos.length}</p>
            <p className="kpi-label">Casos na fila</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-value">{loading ? '—' : porTipo('QA_REPROVADO')}</p>
            <p className="kpi-label">QA reprovado</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-value">{loading ? '—' : porTipo('DISPUTA')}</p>
            <p className="kpi-label">Disputas</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-value" style={{ color: urgentes > 0 ? 'var(--red)' : 'var(--text)' }}>
              {loading ? '—' : urgentes}
            </p>
            <p className="kpi-label">Prazo ≤ 4h</p>
          </div>
        </div>

        {user.tipo === 'CURADOR_SENIOR' || user.tipo === 'ADMIN' ? (
          <div className="card-solid">
            <p className="section-label mb-2">Demandas especiais</p>
            <p className="text-sm" style={{ color: 'var(--text2)' }}>
              {loading ? '—' : porTipo('DEMANDA_ESPECIAL')} caso(s) aguardando precificação manual
              (Art. 8.5 — exclusivo do Curador Sênior).
            </p>
          </div>
        ) : null}

        <div className="card-solid">
          <p className="section-label mb-2">Próximos passos</p>
          <p className="text-sm" style={{ color: 'var(--text2)' }}>
            Acesse a <span style={{ color: 'var(--orange)' }}>Fila de casos</span> no menu lateral
            para analisar QA reprovado, disputas e demandas especiais.
          </p>
        </div>
      </main>
    </Shell>
  )
}
