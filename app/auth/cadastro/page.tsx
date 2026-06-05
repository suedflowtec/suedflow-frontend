import { Suspense } from 'react'
import CadastroClient from './CadastroClient'

export default function CadastroPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white/50">Carregando...</div>}>
      <CadastroClient />
    </Suspense>
  )
}
