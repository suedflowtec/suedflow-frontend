// app/page.tsx — Splash / Landing
'use client'
import Link from 'next/link'
import { AppShell, StatusBar } from '@/components/layout/AppShell'
import { Badge } from '@/components/ui/Badge'

export default function SplashPage() {
  return (
    <AppShell>
      <StatusBar />
      <div className="relative overflow-hidden min-h-[calc(100vh-40px)]">
        {/* Orb decorativo */}
        <div
          className="absolute -top-20 -right-10 w-60 h-60 rounded-full opacity-30 blur-3xl"
          style={{ background: 'var(--orange)' }}
        />
        <div
          className="absolute bottom-20 -left-10 w-40 h-40 rounded-full opacity-20 blur-3xl"
          style={{ background: '#9B6DFF' }}
        />

        <div className="relative z-10 flex flex-col items-center justify-center px-6 pt-20 pb-12">
          {/* Logo SUEDFLOW estilizada */}
          <div className="mb-6">
            <div
              className="w-32 h-32 rounded-2xl flex items-center justify-center mb-3"
              style={{
                background: 'linear-gradient(135deg, rgba(232,103,26,0.15), rgba(255,122,46,0.05))',
                border: '2px solid rgba(232,103,26,0.4)',
              }}
            >
              <div className="text-center">
                <div className="text-5xl font-black tracking-tight" style={{ background: 'linear-gradient(135deg, #E8671A, #FF7A2E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  S
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-black text-center tracking-tight">SUEDFLOW</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-center text-white/60 mt-1">
              Transformando negócios
            </p>
          </div>

          <p className="text-center text-base italic mb-4 text-white/85 max-w-xs">
            "De quem sabe para quem precisa."
          </p>

          <div className="flex gap-2 mb-10 flex-wrap justify-center">
            <Badge variant="green">🔒 Escrow protegido</Badge>
            <Badge variant="orange">🛡 ART garantida</Badge>
            <Badge variant="gold">★ 4.9/5</Badge>
          </div>

          <div className="w-full max-w-xs space-y-3">
            <Link href="/auth/login" className="btn-orange w-full block text-center">
              Entrar na plataforma
            </Link>
            <Link href="/auth/cadastro" className="btn-ghost w-full block text-center">
              Criar conta grátis
            </Link>
            <p className="text-center text-xs text-white/60 mt-4">
              Sou profissional de engenharia →{' '}
              <Link href="/auth/cadastro?tipo=PROFISSIONAL" className="text-orange font-semibold">
                Cadastrar como profissional
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
