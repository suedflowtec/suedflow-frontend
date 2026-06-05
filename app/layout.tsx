import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/hooks/useToast'
import { QuickActions } from '@/components/layout/QuickActions'

export const metadata: Metadata = {
  title: 'SUEDFLOW · De quem sabe para quem precisa',
  description: 'Plataforma de intermediação técnica de engenharia e arquitetura',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ToastProvider>
          <QuickActions />
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
