'use client'
// Disclaimer obrigatório em toda saída da SUE — responsabilidade técnica é do profissional

import { AlertTriangle } from 'lucide-react'

interface SueDisclaimerProps {
  compact?: boolean    // versão reduzida para espaços menores
  className?: string
}

export function SueDisclaimer({ compact = false, className = '' }: SueDisclaimerProps) {
  if (compact) {
    return (
      <p className={`text-2xs flex items-center gap-1.5 ${className}`} style={{ color: 'var(--text3)' }}>
        <AlertTriangle size={10} style={{ flexShrink: 0 }} />
        A SUE é uma assistente de IA e pode cometer erros. A responsabilidade técnica é exclusiva do profissional detentor da ART/RRT.
      </p>
    )
  }

  return (
    <div
      className={`flex items-start gap-3 rounded-xl p-3 text-xs leading-relaxed ${className}`}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border:     '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <AlertTriangle size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--text3)' }} />
      <p style={{ color: 'var(--text3)' }}>
        <strong style={{ color: 'var(--text2)' }}>A SUE é uma assistente de IA e pode cometer erros.</strong>{' '}
        Este relatório é informativo e não substitui o julgamento técnico do profissional responsável.
        A responsabilidade técnica sobre os entregáveis é exclusiva do profissional detentor da ART/RRT.
        Sempre confira os documentos antes de prosseguir.
      </p>
    </div>
  )
}
