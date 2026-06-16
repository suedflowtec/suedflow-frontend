import type { Metadata } from 'next'
import './globals.css'
import './landing.css'
import { ToastProvider } from '@/hooks/useToast'

export const metadata: Metadata = {
  title: 'SUEDFLOW · Plataforma de Engenharia',
  description: 'Plataforma de intermediação técnica de engenharia e arquitetura',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Anti-FOUC: aplica o tema salvo antes do React hidratar */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem('suedflow_theme');
              if (t === 'light') document.documentElement.setAttribute('data-theme','light');
            } catch(e){}
          })();
        `}} />
      </head>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
