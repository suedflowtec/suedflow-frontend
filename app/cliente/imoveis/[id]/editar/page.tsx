'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { imovel as imovelApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

const UF_LIST = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']

export default function EditarImovelPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const id = String(params?.id || '')

  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState({
    logradouro: '', numero: '', complemento: '', bairro: '',
    cidade: '', estado: '', cep: '', area_total_m2: '', ponto_referencia: '',
  })

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    imovelApi.buscar(id)
      .then(im => setForm({
        logradouro:      im.logradouro || '',
        numero:          im.numero || '',
        complemento:     im.complemento || '',
        bairro:          im.bairro || '',
        cidade:          im.cidade || '',
        estado:          im.estado || '',
        cep:             im.cep ? String(im.cep) : '',
        area_total_m2:   im.area_total_m2 != null ? String(im.area_total_m2) : '',
        ponto_referencia: im.ponto_referencia || '',
      }))
      .catch(() => { toast('Imóvel não encontrado', 'error'); router.push('/cliente/imoveis') })
      .finally(() => setLoading(false))
  }, [user, authLoading, id, router, toast])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const salvar = async () => {
    if (!form.logradouro || !form.cidade || !form.estado) {
      toast('Preencha logradouro, cidade e estado', 'error')
      return
    }
    setSalvando(true)
    try {
      await imovelApi.atualizar(id, {
        ...form,
        area_total_m2: form.area_total_m2 ? Number(form.area_total_m2) : undefined,
      })
      toast('Imóvel atualizado', 'success')
      router.push(`/cliente/imoveis/${id}`)
    } catch (err: any) {
      toast(err.message || 'Erro ao salvar', 'error')
    } finally {
      setSalvando(false)
    }
  }

  if (authLoading || !user) return null

  return (
    <Shell>
      <Topbar
        title="Editar imóvel"
        subtitle="Atualize os dados cadastrais do imóvel"
        actions={
          <button onClick={() => router.push(`/cliente/imoveis/${id}`)} className="btn btn-ghost btn-sm">
            ← Voltar
          </button>
        }
      />

      <main className="p-6 max-w-2xl">
        {loading ? (
          <p className="text-sm py-10 text-center" style={{ color: 'var(--text3)' }}>Carregando...</p>
        ) : (
          <div className="card-solid space-y-5">

            {/* Endereço */}
            <div>
              <p className="section-label mb-3">Endereço</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="label">Logradouro</label>
                  <input className="input" value={form.logradouro} onChange={set('logradouro')} placeholder="Rua, Avenida..." />
                </div>
                <div>
                  <label className="label">Número</label>
                  <input className="input" value={form.numero} onChange={set('numero')} placeholder="123" />
                </div>
                <div>
                  <label className="label">Complemento</label>
                  <input className="input" value={form.complemento} onChange={set('complemento')} placeholder="Apto, Bloco..." />
                </div>
                <div>
                  <label className="label">Bairro</label>
                  <input className="input" value={form.bairro} onChange={set('bairro')} />
                </div>
                <div>
                  <label className="label">CEP</label>
                  <input className="input" value={form.cep} onChange={set('cep')} placeholder="58000-000" maxLength={9} />
                </div>
                <div className="col-span-2">
                  <label className="label">Cidade</label>
                  <input className="input" value={form.cidade} onChange={set('cidade')} />
                </div>
                <div>
                  <label className="label">Estado</label>
                  <select className="input" value={form.estado} onChange={set('estado')}>
                    <option value="">UF</option>
                    {UF_LIST.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Dados complementares */}
            <div>
              <p className="section-label mb-3">Dados complementares</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Área total (m²)</label>
                  <input className="input" type="number" step="any" min="1" value={form.area_total_m2} onChange={set('area_total_m2')} placeholder="120" />
                </div>
                <div>
                  <label className="label">Ponto de referência</label>
                  <input className="input" value={form.ponto_referencia} onChange={set('ponto_referencia')} placeholder="Próximo ao mercado..." />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={salvar} disabled={salvando} className="btn btn-primary flex-1">
                {salvando ? 'Salvando...' : 'Salvar alterações'}
              </button>
              <button onClick={() => router.push(`/cliente/imoveis/${id}`)} className="btn btn-ghost">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </main>
    </Shell>
  )
}
