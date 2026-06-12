'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { tokenStorage, userStorage } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

export default function ConfiguracoesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [notifEmail, setNotifEmail] = useState(true)
  const [notifPush, setNotifPush] = useState(true)

  const handleCancelarConta = () => {
    if (confirmText !== 'CONFIRMAR') return
    // Soft delete — quando endpoint existir: DELETE /api/auth/cancelar-conta
    tokenStorage.clear()
    userStorage.clear()
    router.push('/?cancelado=1')
  }

  return (
    <Shell>
      <Topbar title="Configurações" />
      <main className="p-6 max-w-xl space-y-5">

        {/* Perfil */}
        <div className="card-solid">
          <p className="section-label">Minha conta</p>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg"
              style={{ background: 'linear-gradient(135deg, #E8671A, #FF8A3D)' }}>
              {user?.nome?.charAt(0) || '?'}
            </div>
            <div>
              <p className="font-semibold text-white">{user?.nome || '—'}</p>
              <p className="text-xs" style={{ color: 'var(--text3)' }}>{user?.email || '—'}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: 'var(--text3)' }}>Tipo de conta</span>
              <span className="text-white font-medium">{user?.tipo || '—'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span style={{ color: 'var(--text3)' }}>Telefone</span>
              <span className="text-white">{user?.telefone || 'Não informado'}</span>
            </div>
          </div>
        </div>

        {/* Notificações */}
        <div className="card-solid">
          <p className="section-label">Notificações</p>
          <div className="space-y-3">
            {[
              { label: 'E-mail', desc: 'Atualizações de demandas e pagamentos', val: notifEmail, set: setNotifEmail },
              { label: 'Push', desc: 'Alertas em tempo real no navegador', val: notifPush, set: setNotifPush },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs" style={{ color: 'var(--text3)' }}>{item.desc}</p>
                </div>
                <button
                  onClick={() => item.set(!item.val)}
                  className="w-11 h-6 rounded-full transition-colors relative"
                  style={{ background: item.val ? 'var(--orange)' : 'rgba(255,255,255,0.1)' }}
                >
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 transition-all"
                    style={{ left: item.val ? '24px' : '4px' }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* LGPD */}
        <div className="card-solid">
          <p className="section-label">Privacidade e dados (LGPD)</p>
          <div className="space-y-2 text-sm" style={{ color: 'var(--text3)' }}>
            <p>Seus dados são tratados conforme a Lei 13.709/2018 (LGPD).</p>
            <p>Direitos: acesso, correção, portabilidade e exclusão.</p>
            <div className="flex gap-2 pt-2">
              <button className="btn btn-secondary btn-sm">Exportar meus dados</button>
              <button className="btn btn-secondary btn-sm" onClick={() => router.push('/privacidade')}>
                Política de privacidade
              </button>
            </div>
          </div>
        </div>

        {/* Zona de perigo */}
        <div className="card" style={{ borderColor: 'rgba(255,77,109,0.3)', background: 'rgba(255,77,109,0.05)' }}>
          <p className="section-label" style={{ color: '#FF4D6D' }}>Zona de perigo</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text2)' }}>
            Ao cancelar sua conta, o acesso é encerrado imediatamente.
            Seus dados são mantidos por 60 dias conforme a LGPD (Art. 18).
            Esta ação é irreversível.
          </p>
          <button onClick={() => setShowCancelModal(true)} className="btn btn-danger btn-sm">
            Cancelar minha conta
          </button>
        </div>
      </main>

      {/* Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-sm p-6 rounded-2xl" style={{ background: 'var(--navy2)', border: '1px solid var(--border2)' }}>
            <h3 className="text-base font-bold text-white mb-2">Cancelar conta</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text2)' }}>
              Esta ação não pode ser desfeita. Digite <strong className="text-white">CONFIRMAR</strong> para prosseguir.
            </p>
            <input
              className="input mb-4"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="CONFIRMAR"
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowCancelModal(false); setConfirmText('') }}
                className="btn btn-secondary flex-1">Voltar</button>
              <button
                onClick={handleCancelarConta}
                disabled={confirmText !== 'CONFIRMAR'}
                className="btn btn-danger flex-1"
              >Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}
