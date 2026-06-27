// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }

/**
 * Retorna URL para abrir arquivo inline no navegador (sem forçar download).
 *
 * Usa proxy interno /api/ver?url=... para garantir Content-Disposition: inline.
 * O Cloudinary não suporta fl_inline no plano atual — o proxy resolve isso.
 *
 * Arquivos binários (DWG, ZIP, DOCX, etc.) que o browser não exibe são
 * retornados sem modificação → o botão de olho não deve aparecer para eles.
 */
export function getInlineUrl(url: string): string {
  if (!url) return url

  // Arquivos binários → browser não consegue exibir, não usar inline
  const isBin = /\.(dwg|zip|rar|docx?|xlsx?|pptx?)($|\?)/i.test(url)
  if (isBin) return url

  // Para arquivos Cloudinary do projeto → proxy via rota Next.js interna
  if (url.includes('cloudinary.com') && url.includes('/suedflow/')) {
    return `/api/ver?url=${encodeURIComponent(url)}`
  }

  return url
}

/**
 * Detecta se a URL aponta para um arquivo que o browser consegue exibir inline.
 * Binários específicos (DWG, ZIP, DOC) precisam ser baixados.
 */
export function podeAbrirInline(url: string): boolean {
  if (!url) return false
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || ''
  const naoAbrem = ['dwg', 'zip', 'rar', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'dxf']
  return !naoAbrem.includes(ext)
}

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
