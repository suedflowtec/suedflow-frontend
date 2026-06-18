'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { termos as termosApi } from '@/lib/api'

export default function PrivacidadePage() {
  const [conteudo, setConteudo] = useState('')
  const [vigencia, setVigencia] = useState('')
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    termosApi.listar('CLIENTE').then(r => {
      const pol = r.termos.find((t: { tipo: string }) => t.tipo === 'PRIVACIDADE_DADOS')
      if (pol) {
        setConteudo(pol.conteudo)
        setVigencia(new Date(pol.vigencia).toLocaleDateString('pt-BR'))
      }
    }).catch(() => {}).finally(() => setCarregando(false))
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF7', color: '#0E2A3D' }}>
      <header style={{ borderBottom: '1px solid #EBEDEF', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link href="/"><Logo height={32} /></Link>
        <span style={{ color: '#5A7184', fontSize: 14 }}>Política de Privacidade e Proteção de Dados</span>
      </header>

      <main style={{ maxWidth: 820, margin: '0 auto', padding: '40px 32px 80px' }}>
        {carregando && <p style={{ color: '#5A7184', fontSize: 14 }}>Carregando...</p>}

        {!carregando && !conteudo && (
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Política de Privacidade</h1>
            <p style={{ color: '#5A7184', fontSize: 14 }}>
              Documento não disponível. Execute <code>npm run db:seed-termos</code> no backend para carregá-lo.
            </p>
          </div>
        )}

        {!carregando && conteudo && (
          <>
            <p style={{ color: '#5A7184', fontSize: 12, marginBottom: 32 }}>
              POLITICA-PRIVACIDADE-v1.0 · Vigência: {vigencia}
            </p>
            <div
              style={{ fontSize: 14, lineHeight: 1.75, color: '#1A3347' }}
              dangerouslySetInnerHTML={{ __html: conteudo }}
            />
          </>
        )}

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #EBEDEF' }}>
          <Link href="/termos" style={{ color: '#E8671A', fontSize: 14, fontWeight: 600 }}>
            ← Ver Termos de Uso
          </Link>
        </div>
      </main>
    </div>
  )
}
