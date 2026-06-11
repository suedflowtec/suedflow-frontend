import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/hooks/useToast'

export const metadata: Metadata = {
  title: 'SUEDFLOW · Plataforma de Engenharia',
  description: 'Plataforma de intermediação técnica de engenharia e arquitetura',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
