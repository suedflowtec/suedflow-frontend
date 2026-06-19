'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shell, Topbar } from '@/components/layout/Shell'
import { imovel as imovelApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { Home, MapPin, ChevronRight } from 'lucide-react'

const TIPO_LABEL: Record<string, string> = {
  RESIDENCIAL: 'Residencial',
  COMERCIAL: 'Comercial',
  INDUSTRIAL: 'Industrial',
}

export default function MeusImoveisPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [imoveis, setImoveis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    imovelApi.listar({ contexto: 'cliente' })
      .then(r => setImoveis(r.imoveis || []))
      .catch(() => toast('Erro ao carregar imóveis', 'error'))
      .finally(() => setLoading(false))
  }, [user, authLoading, router, toast])

  if (authLoading || !user) return null

  const enderecoLabel = (im: any) => {
    const partes = [im.logradouro, im.numero, im.bairro].filter(Boolean)
    return partes.length ? partes.join(', ') : `${im.cidade}, ${im.estado}`
  }

  return (
    <Shell>
      <Topbar
        title="Meus imóveis"
        subtitle="Histórico técnico e demandas por imóvel"
        actions={
          <Link href="/cliente/nova-demanda" className="btn btn-primary btn-sm">
            + Nova demanda
          </Link>
        }
      />

      <main className="p-6 space-y-4">
        {loading ? (
          <div className="card text-center py-12">
            <p className="text-sm" style={{ color: 'var(--text3)' }}>Carregando...</p>
          </div>
        ) : imoveis.length === 0 ? (
          <div className="card text-center py-14 space-y-4">
            <Home size={40} style={{ color: 'var(--text3)', margin: '0 auto' }} />
            <div>
              <p className="font-semibold" style={{ color: 'var(--text2)' }}>Nenhum imóvel registrado</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
                Imóveis são criados automaticamente quando você cria uma demanda com CEP e endereço preenchidos.
              </p>
            </div>
            <Link href="/cliente/nova-demanda" className="btn btn-primary btn-sm inline-flex">
              Criar primeira demanda →
            </Link>
          </div>
        ) : (
          <div className="card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Endereço</th>
                  <th>Tipo</th>
                  <th>Área</th>
                  <th>Cidade / UF</th>
                  <th className="text-center">Demandas</th>
                  <th className="text-center">Achados técnicos</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {imoveis.map(im => (
                  <tr
                    key={im.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/cliente/imoveis/${im.id}`)}
                  >
                    <td>
                      <div className="flex items-start gap-1.5">
                        <MapPin size={13} className="mt-0.5 shrink-0" style={{ color: 'var(--orange)' }} />
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text)' }}>{enderecoLabel(im)}</p>
                          {im.complemento && (
                            <p className="text-xs" style={{ color: 'var(--text3)' }}>{im.complemento}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-gray">{TIPO_LABEL[im.tipo] || im.tipo}</span>
                    </td>
                    <td style={{ color: 'var(--text2)' }}>
                      {im.area_total_m2 ? `${im.area_total_m2}m²` : '—'}
                    </td>
                    <td style={{ color: 'var(--text2)' }}>{im.cidade}/{im.estado}</td>
                    <td className="text-center">
                      <span className="badge badge-orange">{im._count?.demandas ?? 0}</span>
                    </td>
                    <td className="text-center">
                      <span className={`badge ${(im._count?.achados ?? 0) > 0 ? 'badge-red' : 'badge-gray'}`}>
                        {im._count?.achados ?? 0}
                      </span>
                    </td>
                    <td>
                      <ChevronRight size={14} style={{ color: 'var(--text3)' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-center" style={{ color: 'var(--text3)' }}>
          Imóveis são registrados ao criar demandas com CEP e endereço preenchidos.
        </p>
      </main>
    </Shell>
  )
}
