// components/layout/QuickActions.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/useToast'
import { tokenStorage, userStorage } from '@/lib/api'

export function QuickActions() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('suedflow_theme')) as 'dark' | 'light' | null
    if (saved) {
      setTheme(saved)
      document.documentElement.setAttribute('data-theme', saved)
    } else {
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('suedflow_theme', next)
  }

  return (
    <>
      <div className="quick-actions">
        <button
          className="quick-btn"
          onClick={toggleTheme}
          title="Alternar tema"
          aria-label="Tema"
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
        <button
          className="quick-btn settings"
          onClick={() => setSettingsOpen(true)}
          title="Configurações"
          aria-label="Configurações"
        >
          ⚙️
        </button>
      </div>
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} theme={theme} onToggleTheme={toggleTheme} />}
    </>
  )
}

function SettingsModal({ onClose, theme, onToggleTheme }: { onClose: () => void; theme: 'dark' | 'light'; onToggleTheme: () => void }) {
  const router = useRouter()
  const { toast } = useToast()
  const [notifEmail, setNotifEmail] = useState(true)
  const [notifPush, setNotifPush] = useState(true)
  const [notifSms, setNotifSms] = useState(false)
  const [seloPublico, setSeloPublico] = useState(true)
  const [bancoEstrategico, setBancoEstrategico] = useState(true)

  const sair = () => {
    tokenStorage.clear()
    userStorage.clear()
    onClose()
    toast('Sessão encerrada', 'info')
    router.push('/auth/login')
  }

  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center backdrop-blur-md"
      style={{ background: 'rgba(0,0,0,0.65)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="glass-card max-w-md w-[90%] max-h-[85vh] overflow-y-auto" style={{ background: 'var(--navy2)' }}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-extrabold">Configurações</h3>
            <p className="text-xs text-white/60">Ajustes da plataforma SUEDFLOW</p>
          </div>
          <button onClick={onClose} className="text-2xl text-white/60 hover:text-white px-2">×</button>
        </div>

        <Section title="Aparência">
          <Row
            label="Tema"
            desc={theme === 'dark' ? 'Modo escuro · padrão' : 'Modo claro · papel marfim'}
            on={theme === 'light'}
            onToggle={onToggleTheme}
          />
        </Section>

        <Section title="Notificações">
          <Row label="E-mail" desc="Atualizações de demandas, pagamentos, QA" on={notifEmail} onToggle={() => { setNotifEmail(!notifEmail); toast('Preferência salva', 'success') }} />
          <Row label="Push" desc="Navegador e app móvel" on={notifPush} onToggle={() => { setNotifPush(!notifPush); toast('Preferência salva', 'success') }} />
          <Row label="SMS de urgência" desc="Apenas demandas com SLA crítico" on={notifSms} onToggle={() => { setNotifSms(!notifSms); toast('Preferência salva', 'success') }} />
        </Section>

        <Section title="Privacidade · LGPD">
          <Row label="Aparecer no Selo Público" desc="Nome anonimizado · CREA mascarado" on={seloPublico} onToggle={() => { setSeloPublico(!seloPublico); toast('Preferência LGPD salva', 'success') }} />
          <Row label="Compartilhar dados anônimos" desc="Banco estratégico · Art. 10 LGPD" on={bancoEstrategico} onToggle={() => { setBancoEstrategico(!bancoEstrategico); toast('Preferência LGPD salva', 'success') }} />
        </Section>

        <Section title="Conta">
          <div className="flex justify-between items-center py-2">
            <div>
              <div className="text-sm font-semibold">Alterar senha</div>
              <div className="text-[11px] text-white/60">Atualizar credenciais</div>
            </div>
            <button className="btn-ghost btn-sm" onClick={() => toast('Link enviado por e-mail', 'info')}>Alterar</button>
          </div>
          <div className="flex justify-between items-center py-2">
            <div>
              <div className="text-sm font-semibold text-red">Sair</div>
              <div className="text-[11px] text-white/60">Encerrar sessão atual</div>
            </div>
            <button onClick={sair} className="px-3 py-1.5 rounded-lg bg-red/15 text-red text-xs font-bold border border-red/30">Sair</button>
          </div>
        </Section>

        <p className="text-[10px] text-white/40 text-center mt-3">SUEDFLOW v1.0 · Configurações</p>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-3 border-t border-white/10">
      <p className="text-[11px] uppercase tracking-wider font-bold text-white/60 mb-2">{title}</p>
      {children}
    </div>
  )
}

function Row({ label, desc, on, onToggle }: { label: string; desc: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex justify-between items-center py-2">
      <div>
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-[11px] text-white/60">{desc}</div>
      </div>
      <button
        onClick={onToggle}
        className="relative w-[42px] h-6 rounded-full transition-colors"
        style={{ background: on ? 'var(--orange)' : 'rgba(255,255,255,0.15)' }}
        aria-label={`Toggle ${label}`}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow"
          style={{ transform: on ? 'translateX(20px)' : 'translateX(2px)' }}
        />
      </button>
    </div>
  )
}
