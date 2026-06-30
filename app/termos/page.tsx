'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { termos as termosApi } from '@/lib/api'

type Termo = { id: string; codigo: string; tipo: string; titulo: string; vigencia: string; conteudo: string }

const ABAS = [
  { key: 'CLIENTE',          label: 'Termos — Cliente' },
  { key: 'PROFISSIONAL',     label: 'Termos — Profissional' },
  { key: 'PRIVACIDADE_DADOS', label: 'Privacidade (LGPD)' },
] as const

export default function TermosPage() {
  const [aba, setAba] = useState<'CLIENTE' | 'PROFISSIONAL' | 'PRIVACIDADE_DADOS'>('CLIENTE')
  const [termos, setTermos] = useState<Termo[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tipo = params.get('tipo')
      if (tipo === 'PROFISSIONAL' || tipo === 'PRIVACIDADE_DADOS') setAba(tipo)
    }
  }, [])

  useEffect(() => {
    const tipo = aba === 'PRIVACIDADE_DADOS' ? 'CLIENTE' : aba
    setCarregando(true)
    termosApi.listar(tipo as 'CLIENTE' | 'PROFISSIONAL')
      .then(r => setTermos(r.termos))
      .catch(() => setTermos([]))
      .finally(() => setCarregando(false))
  }, [aba])

  const termo = termos.find(t => t.tipo === aba)

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF7', color: '#0E2A3D' }}>
      <header style={{ borderBottom: '1px solid #EBEDEF', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link href="/"><Logo height={32} /></Link>
        <span style={{ color: '#5A7184', fontSize: 14 }}>Termos de Uso e Política de Privacidade</span>
      </header>

      <main style={{ maxWidth: 820, margin: '0 auto', padding: '40px 32px 80px' }}>
        {/* Abas */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 32, borderBottom: '2px solid #EBEDEF' }}>
          {ABAS.map(a => (
            <button
              key={a.key}
              onClick={() => setAba(a.key)}
              style={{
                padding: '10px 20px',
                fontSize: 13,
                fontWeight: aba === a.key ? 700 : 400,
                color: aba === a.key ? '#E8671A' : '#5A7184',
                background: 'none',
                border: 'none',
                borderBottom: aba === a.key ? '2px solid #E8671A' : '2px solid transparent',
                cursor: 'pointer',
                marginBottom: -2,
              }}
            >
              {a.label}
            </button>
          ))}
        </div>

        {carregando && (
          <p style={{ color: '#5A7184', fontSize: 14 }}>Carregando...</p>
        )}

        {!carregando && !termo && (
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Documento não disponível</h1>
            <p style={{ color: '#5A7184', fontSize: 14 }}>
              Os termos ainda não foram publicados. Execute <code>npm run db:seed-termos</code> no backend para carregá-los.
            </p>
          </div>
        )}

        {!carregando && termo && (
          <>
            <p style={{ color: '#5A7184', fontSize: 12, marginBottom: 32 }}>
              Versão {termo.codigo} · Vigência: {new Date(termo.vigencia).toLocaleDateString('pt-BR')}
            </p>
            <div
              style={{ fontSize: 14, lineHeight: 1.75, color: '#1A3347' }}
              dangerouslySetInnerHTML={{ __html: termo.conteudo }}
            />
          </>
        )}

        <div style={{ marginTop: 56, paddingTop: 24, borderTop: '1px solid #EBEDEF', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link
            href="/auth/cadastro?tipo=CLIENTE"
            style={{ background: '#E8671A', color: '#fff', padding: '12px 28px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}
          >
            Concordo — Criar conta como Cliente
          </Link>
          <Link
            href="/auth/cadastro?tipo=PROFISSIONAL"
            style={{ background: '#061828', color: '#fff', padding: '12px 28px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}
          >
            Concordo — Criar conta como Profissional
          </Link>
        </div>
      </main>
    </div>
  )
}
