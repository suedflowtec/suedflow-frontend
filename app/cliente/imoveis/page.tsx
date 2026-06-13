// app/cliente/imoveis/page.tsx
'use client'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'

export default function ImoveisPage() {
  const router = useRouter()

  return (
    <Shell>
      <Topbar title="Meus Imóveis" />

      <main className="p-6">
        <div className="card-accent text-center py-10 max-w-md mx-auto">
          <p className="text-sm" style={{ color: 'var(--text2)' }}>
            Funcionalidade disponível em breve. Aqui você poderá acompanhar o
            histórico técnico dos seus imóveis.
          </p>
          <button
            className="btn btn-primary mt-4"
            onClick={() => router.push('/cliente/nova-demanda')}
          >
            Nova demanda
          </button>
        </div>
      </main>
    </Shell>
  )
}
