// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }

/**
 * Transforma URL do Cloudinary para forçar abertura inline no navegador (não download).
 * Adiciona `fl_inline` para image/upload (PDFs) ou `fl_attachment:false` para raw/upload.
 * Imagens e outros arquivos que o browser abre nativamente são retornados sem alteração.
 */
export function getInlineUrl(url: string): string {
  if (!url || !url.includes('cloudinary.com')) return url

  const isPdf  = /\.pdf($|\?)/i.test(url) || url.includes('/raw/')
  const isBin  = /\.(dwg|zip|docx?|xlsx?|pptx?)($|\?)/i.test(url)

  // Arquivos binários (DWG, ZIP, etc.) → deixa baixar normalmente
  if (isBin) return url

  // PDF em raw/upload → fl_attachment:false
  if (url.includes('/raw/upload/')) {
    return url.replace('/raw/upload/', '/raw/upload/fl_attachment:false/')
  }

  // PDF em image/upload → fl_inline
  if (isPdf && url.includes('/image/upload/')) {
    return url.replace('/image/upload/', '/image/upload/fl_inline/')
  }

  // Imagens → browser abre nativamente, sem transformação necessária
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
