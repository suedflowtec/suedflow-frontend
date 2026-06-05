// app/admin/profissionais/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell, StatusBar } from '@/components/layout/AppShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { admin } from '@/lib/api'
import { useToast } from '@/hooks/useToast'

export default function AdminProfissionais() {
  const router = useRouter()
  const { toast } = useToast()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    admin.profissionais()
      .then(setData)
      .catch(() => toast('Erro ao carregar', 'error'))
      .finally(() => setLoading(false))
  }, [toast])

  const aprovar = async (id: string) => {
    try {
      await admin.aprovarKyc(id, true)
      toast('KYC aprovado', 'success')
      const fresh = await admin.profissionais()
      setData(fresh)
    } catch (e: any) { toast(e.message || 'Erro', 'error') }
  }

  const lista: any[] = Array.isArray(data) ? data : (data?.profissionais || [])

  return (
    <AppShell>
      <StatusBar />
      <div className="px-5 pt-4 pb-12">
        <button onClick={() => router.back()} className="back-btn mb-3">←</button>
        <h1 className="text-xl font-extrabold mb-4">Profissionais</h1>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="glass-card !p-3 text-center"><p className="text-lg font-black">{lista.length}</p><p className="text-[10px] text-white/60">Total</p></div>
          <div className="glass-card !p-3 text-center"><p className="text-lg font-black text-gold">{lista.filter(p => !p.kyc_aprovado).length}</p><p className="text-[10px] text-white/60">KYC pend.</p></div>
          <div className="glass-card !p-3 text-center"><p className="text-lg font-black text-green">{lista.filter(p => p.kyc_aprovado).length}</p><p className="text-[10px] text-white/60">Ativos</p></div>
        </div>

        {loading ? (
          <p className="text-center text-white/50 py-8">Carregando...</p>
        ) : lista.length === 0 ? (
          <p className="text-center text-white/50 py-8">Nenhum profissional cadastrado</p>
        ) : (
          <div className="space-y-2">
            {lista.map(p => (
              <div key={p.id} className="glass-card">
                <div className="flex gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-black" style={{ background: 'rgba(232,103,26,0.15)', color: '#FF7A2E' }}>
                    {(p.nome || 'P').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{p.nome || p.email}</p>
                    <p className="text-[11px] text-white/50 font-mono">{p.conselho || 'CREA'}-{p.uf_conselho || 'PB'} {p.numero_conselho}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      <Badge variant={p.nivel === 'ELITE' ? 'gold' : p.nivel === 'SENIOR' ? 'purple' : 'orange'}>{p.nivel || 'CANDIDATO'}</Badge>
                      <Badge variant={p.kyc_aprovado ? 'green' : 'gold'}>
                        {p.kyc_aprovado ? '✓ KYC' : 'KYC pend.'}
                      </Badge>
                    </div>
                  </div>
                </div>
                {!p.kyc_aprovado && (
                  <Button onClick={() => aprovar(p.id)} size="sm" className="w-full mt-2">Aprovar KYC</Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
