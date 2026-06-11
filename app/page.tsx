// frontend/app/page.tsx
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-navy flex flex-col">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-white/10">
        <span className="font-black text-white text-xl tracking-tight">
          SUED<span className="text-orange">FLOW</span>
        </span>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-white/70 hover:text-white transition-colors font-medium">
            Entrar
          </Link>
          <Link href="/auth/cadastro" className="btn btn-primary btn-sm">
            Criar conta grátis
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 text-center py-24">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange/30 bg-orange/10 text-orange text-xs font-semibold mb-8">
          ⚡ Plataforma em fase de Validação · João Pessoa/PB
        </div>

        <h1 className="text-5xl font-black text-white leading-tight max-w-2xl mb-6">
          De quem sabe<br />
          <span className="text-orange">para quem precisa.</span>
        </h1>

        <p className="text-lg text-white/60 max-w-xl mb-10 leading-relaxed">
          Laudos, vistorias, inspeções e projetos técnicos com
          responsabilidade ART garantida, escrow protegido e
          verificação por IA.
        </p>

        <div className="flex items-center gap-4">
          <Link href="/auth/cadastro?tipo=CLIENTE" className="btn btn-primary btn-lg">
            Solicitar serviço técnico
          </Link>
          <Link href="/auth/cadastro?tipo=PROFISSIONAL" className="btn btn-secondary btn-lg" style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', color: 'white' }}>
            Sou engenheiro/arquiteto →
          </Link>
        </div>

        {/* Credenciais */}
        <div className="flex items-center gap-8 mt-16 text-white/40 text-xs">
          <span>🔒 Escrow Pagar.me</span>
          <span>📋 ART/RRT obrigatória</span>
          <span>🤖 Verificação SUE</span>
          <span>⚖ Conforme LGPD</span>
        </div>
      </main>
    </div>
  )
}
