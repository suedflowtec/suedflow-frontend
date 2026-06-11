// frontend/app/configuracoes/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { tokenStorage, userStorage } from '@/lib/api'

export default function ConfiguracoesPage() {
  const router = useRouter()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const handleCancelarConta = () => {
    if (confirmText !== 'CONFIRMAR') return
    // TODO: chamar DELETE /api/auth/cancelar-conta quando endpoint existir
    tokenStorage.clear()
    userStorage.clear()
    router.push('/auth/login')
  }

  return (
    <Shell>
      <Topbar title="Configurações" />

      <main className="p-6 max-w-2xl space-y-6">

        {/* Aparência */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-navy mb-4">Aparência</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-primary font-medium">Tema</p>
              <p className="text-xs text-ink-muted">Claro · o tema escuro estará disponível em breve</p>
            </div>
            <span className="badge badge-gray">Claro</span>
          </div>
        </div>

        {/* Conta */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-navy mb-4">Conta</h2>
          <div className="space-y-3 text-sm text-ink-secondary">
            <div className="flex justify-between">
              <span className="text-ink-muted">E-mail</span>
              <span className="font-medium text-navy">—</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Tipo</span>
              <span className="font-medium text-navy">—</span>
            </div>
          </div>
        </div>

        {/* Zona de perigo */}
        <div className="card p-5 border-red-200 bg-red-50/40">
          <h2 className="text-sm font-semibold text-red-700 mb-1">Zona de perigo</h2>
          <p className="text-xs text-red-600/80 mb-4">
            Ao cancelar sua conta, você perderá o acesso imediatamente.
            Seus dados são mantidos por 60 dias conforme a LGPD (Art. 18).
            Esta ação é irreversível.
          </p>
          <button
            onClick={() => setShowCancelModal(true)}
            className="btn btn-sm border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
          >
            Cancelar minha conta
          </button>
        </div>
      </main>

      {/* Modal de confirmação */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-base font-bold text-navy mb-2">Cancelar conta</h3>
            <p className="text-sm text-ink-secondary mb-4">
              Esta ação não pode ser desfeita. Digite <strong>CONFIRMAR</strong> para prosseguir.
            </p>
            <input
              className="input mb-4"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="Digite CONFIRMAR"
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowCancelModal(false); setConfirmText('') }}
                className="btn btn-secondary flex-1">
                Cancelar
              </button>
              <button
                onClick={handleCancelarConta}
                disabled={confirmText !== 'CONFIRMAR'}
                className="btn btn-danger flex-1"
              >
                Confirmar cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}
