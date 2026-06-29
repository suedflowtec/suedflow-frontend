// app/configuracoes/page.tsx
// Configurações gerais — usado por ADMIN e CURADOR.
// Para contas duais (cliente + profissional), usar:
//   /profissional/configuracoes  ou  /cliente/configuracoes
// Esses caminhos mantêm o nav correto para cada modo.
'use client'
import ConfiguracoesCore from '@/components/configuracoes/ConfiguracoesCore'
export default function ConfiguracoesPage() {
  return <ConfiguracoesCore />
}
