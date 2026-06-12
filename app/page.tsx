'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { tokenStorage, userStorage } from '@/lib/api'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()

  useEffect(() => {
    const token = tokenStorage.get()
    const user = userStorage.get()
    if (token && user) {
      const map: Record<string, string> = {
        ADMIN: '/admin', MODERADOR: '/admin',
        PROFISSIONAL: '/profissional',
        CURADOR_SUPORTE: '/curador', CURADOR_SENIOR: '/curador',
        CLIENTE: '/cliente',
      }
      router.push(map[user.tipo] ?? '/cliente')
    }
  }, [router])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0A1F35' }}>
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange flex items-center justify-center">
            <span className="text-white font-black text-lg leading-none">S</span>
          </div>
          <span className="font-black text-white text-xl tracking-tight">
            SUED<span className="text-orange">FLOW</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login"
            className="text-sm text-white/70 hover:text-white transition-colors font-medium">
            Entrar
          </Link>
          <Link href="/auth/cadastro"
            className="px-4 py-2 rounded text-sm font-semibold text-white transition-colors"
            style={{ background: '#E8671A' }}>
            Criar conta grátis
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 text-center py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange/30 bg-orange/10 text-orange text-xs font-semibold mb-8 tracking-wide">
          ⚡ Fase de Validação · João Pessoa/PB
        </div>

        <h1 className="text-5xl font-black text-white leading-tight max-w-2xl mb-6 tracking-tight">
          De quem sabe<br />
          <span style={{ color: '#E8671A' }}>para quem precisa.</span>
        </h1>

        <p className="text-lg text-white/60 max-w-lg mb-10 leading-relaxed">
          Laudos, vistorias, inspeções e projetos técnicos com
          responsabilidade técnica (ART/RRT) garantida e
          pagamento em escrow protegido.
        </p>

        <div className="flex items-center gap-4 flex-wrap justify-center">
          <Link href="/auth/cadastro?tipo=CLIENTE"
            className="px-6 py-3 rounded font-semibold text-white text-base transition-opacity hover:opacity-90"
            style={{ background: '#E8671A' }}>
            Solicitar serviço técnico
          </Link>
          <Link href="/auth/cadastro?tipo=PROFISSIONAL"
            className="px-6 py-3 rounded font-semibold text-base border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition-colors">
            Sou engenheiro/arquiteto →
          </Link>
        </div>

        <div className="flex items-center gap-8 mt-16 text-white/35 text-xs flex-wrap justify-center">
          <span>🔒 Escrow Pagar.me</span>
          <span>📋 ART/RRT obrigatória</span>
          <span>🤖 Verificação SUE</span>
          <span>⚖ Conforme LGPD</span>
        </div>
      </main>

      {/* Footer mínimo */}
      <footer className="h-12 flex items-center justify-center border-t border-white/10">
        <p className="text-white/25 text-xs">
          SUEDFLOW Tecnologia Ltda. · João Pessoa/PB · 2026
        </p>
      </footer>
    </div>
  )
}
