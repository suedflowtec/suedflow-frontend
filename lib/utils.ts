// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}
export function formatDate(d: string | Date | null | undefined): string {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('pt-BR')
}

export function statusLabel(status: string): { text: string; variant: string } {
  const map: Record<string, { text: string; variant: string }> = {
    AGUARDANDO_PAGAMENTO:    { text: 'Aguardando pagamento', variant: 'gold' },
    AGUARDANDO:              { text: 'Aguardando profissional', variant: 'orange' },
    ACEITA:                  { text: 'Aceita · aguardando você pagar', variant: 'blue' },
    PAGA:                    { text: 'Paga · execução em breve', variant: 'green' },
    EM_EXECUCAO:             { text: 'Em execução', variant: 'orange' },
    AGUARDANDO_QA:           { text: 'Em revisão SUE', variant: 'purple' },
    AGUARDANDO_CONFIRMACAO:  { text: 'Aguardando sua confirmação', variant: 'gold' },
    CONCLUIDA:               { text: 'Concluída', variant: 'green' },
    CANCELADA:               { text: 'Cancelada', variant: 'glass' },
    PARALISADA_PROF:         { text: 'Paralisada', variant: 'glass' },
    PARALISADA_CLIENTE:      { text: 'Paralisada', variant: 'glass' },
    QA_REPROVADO:            { text: 'QA reprovado', variant: 'red' },
    DEMANDA_ESPECIAL:        { text: 'Proposta especial', variant: 'purple' },
    EM_DISPUTA:              { text: 'Em disputa', variant: 'red' },
  }
  return map[status] || { text: status, variant: 'glass' }
}
