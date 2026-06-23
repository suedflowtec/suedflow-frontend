// app/profissional/perfil/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { profissional as profissionalApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

const KYC_BADGE: Record<string, { text: string; variant: any }> = {
  PENDENTE:  { text: 'KYC pendente', variant: 'gold' },
  APROVADO:  { text: 'KYC aprovado', variant: 'green' },
  REPROVADO: { text: 'KYC reprovado', variant: 'red' },
}

export default function ProfissionalPerfilPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()

  const [perfil, setPerfil] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [raioKm, setRaioKm] = useState('50')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    profissionalApi.perfil()
      .then(p => {
        setPerfil(p)
        setCidade(p.cidade || '')
        setEstado(p.estado || '')
        setRaioKm(String(p.raio_km ?? 50))
      })
      .catch(() => toast('Erro ao carregar perfil', 'error'))
      .finally(() => setLoading(false))
  }, [user, authLoading, router, toast])

  if (authLoading || !user) return null
  if (loading) return (
    <Shell><Topbar title="Meu perfil" /><main className="p-6"><p style={{ color: 'var(--text3)' }}>Carregando...</p></main></Shell>
  )

  const salvar = async () => {
    setSalvando(true)
    try {
      await profissionalApi.atualizarPerfil({ cidade, estado, raio_km: Number(raioKm) || 50 })
      toast('Perfil atualizado', 'success')
    } catch (err: any) {
      toast(err.message || 'Erro ao salvar perfil', 'error')
    } finally {
      setSalvando(false)
    }
  }

  const kyc = KYC_BADGE[perfil?.kyc_status] || KYC_BADGE.PENDENTE

  return (
    <Shell>
      <Topbar
        title="Meu perfil"
        subtitle={perfil?.usuario?.nome}
        actions={<Badge variant={kyc.variant}>{kyc.text}</Badge>}
      />

      <main className="p-6 max-w-3xl space-y-4">
        {/* Dados profissionais */}
        <div className="card-solid">
          <p className="section-label mb-3">Dados profissionais</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-xs" style={{ color: 'var(--text3)' }}>Nome</span>
              <span style={{ color: 'var(--text)' }}>{perfil?.usuario?.nome}</span>
            </div>
            <div>
              <span className="block text-xs" style={{ color: 'var(--text3)' }}>Conselho</span>
              <span className="font-mono" style={{ color: 'var(--text)' }}>
                {perfil?.conselho || 'CREA'}-{perfil?.uf_conselho || '—'} {perfil?.numero_conselho || '—'}
              </span>
            </div>
            <div>
              <span className="block text-xs" style={{ color: 'var(--text3)' }}>Nível SQP</span>
              <Badge variant="orange">{perfil?.nivel || 'CANDIDATO'}</Badge>
            </div>
            <div>
              <span className="block text-xs" style={{ color: 'var(--text3)' }}>Plano</span>
              <span style={{ color: 'var(--text)' }}>{perfil?.plano || 'GRATIS'}</span>
            </div>
          </div>

          {!perfil?.kyc_aprovado && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm mb-2" style={{ color: 'var(--text2)' }}>
                Seu cadastro ainda não foi aprovado. Complete o onboarding e envie os documentos de KYC.
              </p>
              <Button variant="ghost" onClick={() => router.push('/profissional/onboarding')}>
                Completar onboarding / KYC
              </Button>
            </div>
          )}
        </div>

        {/* SVCs habilitados */}
        <div className="card-solid">
          <p className="section-label mb-3">Serviços habilitados</p>
          {(perfil?.svcs_habilitados || []).length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text3)' }}>Nenhum serviço habilitado ainda.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {perfil.svcs_habilitados.map((s: any) => (
                <Badge key={s.codigo_svc} variant="glass">{s.codigo_svc}</Badge>
              ))}
            </div>
          )}
          <Button variant="ghost" className="mt-3" onClick={() => router.push('/profissional/onboarding')}>
            Editar serviços habilitados
          </Button>
        </div>

        {/* Área de atuação */}
        <div className="card-solid space-y-3">
          <p className="section-label">Área de atuação</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs" style={{ color: 'var(--text3)' }}>Cidade</label>
              <input className="input mt-1" value={cidade} onChange={e => setCidade(e.target.value)} />
            </div>
            <div>
              <label className="text-xs" style={{ color: 'var(--text3)' }}>Estado (UF)</label>
              <input className="input mt-1" maxLength={2} value={estado} onChange={e => setEstado(e.target.value.toUpperCase())} />
            </div>
            <div>
              <label className="text-xs" style={{ color: 'var(--text3)' }}>Raio de atuação (km)</label>
              <input className="input mt-1" type="number" value={raioKm} onChange={e => setRaioKm(e.target.value)} />
            </div>
          </div>
          <Button disabled={salvando} onClick={salvar}>
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      </main>
    </Shell>
  )
}
