// app/cliente/imoveis/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { Badge } from '@/components/ui/Badge'
import { imovel } from '@/lib/api'
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

export default function ImoveisPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [imoveis, setImoveis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    imovel.listar({ contexto: 'cliente' })
      .then(r => setImoveis(r.imoveis || []))
      .catch(() => toast('Erro ao carregar imóveis', 'error'))
      .finally(() => setLoading(false))
  }, [toast])

  return (
    <Shell>
      <Topbar title="Meus Imóveis" subtitle="Histórico técnico e Selo SUEDFLOW de cada imóvel" />

      <main className="p-6 max-w-6xl">
        {loading ? (
          <p style={{ color: 'var(--text3)' }}>Carregando...</p>
        ) : imoveis.length === 0 ? (
          <div className="card-accent text-center py-10 max-w-md">
            <p className="text-sm" style={{ color: 'var(--text2)' }}>
              Nenhum imóvel vinculado à sua conta ainda. Imóveis são cadastrados
              automaticamente quando você cria uma demanda informando o endereço.
            </p>
            <button className="btn btn-primary mt-4" onClick={() => router.push('/cliente/nova-demanda')}>
              Nova demanda
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {imoveis.map((im: any) => {
              const nivel = im.selo ? NIVEL_BADGE[im.selo.nivel] : null
              return (
                <div
                  key={im.id}
                  className="card-solid cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => router.push(`/cliente/imoveis/${im.id}`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="glass">{TIPO_LABEL[im.tipo] || im.tipo}</Badge>
                    {nivel && <Badge variant={nivel.variant}>{nivel.text}</Badge>}
                  </div>
                  <p className="font-semibold" style={{ color: 'var(--text)' }}>
                    {im.logradouro ? `${im.logradouro}${im.numero ? `, ${im.numero}` : ''}` : (im.bairro || im.cidade)}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text3)' }}>
                    {[im.bairro, im.cidade, im.estado].filter(Boolean).join(' · ')}
                  </p>
                  <div className="divider my-2" />
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--text3)' }}>{im.area_total_m2 ? `${im.area_total_m2}m²` : '—'}</span>
                    <span style={{ color: 'var(--text3)' }}>
                      {im._count?.demandas || 0} demanda{im._count?.demandas === 1 ? '' : 's'} ·{' '}
                      {im._count?.achados || 0} achado{im._count?.achados === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </Shell>
  )
}
