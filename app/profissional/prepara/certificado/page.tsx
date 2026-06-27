'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { profissional as profissionalApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { Printer, ArrowLeft, Award } from 'lucide-react'

const MODULOS_NOMES: Record<string, string> = {
  m1: 'M1 · Fundamentos SUEDFLOW',
  m2: 'M2 · Avaliação Mercadológica NBR 14653',
  m3: 'M3 · Inspeção Predial NBR 16.747',
  m4: 'M4 · Projetos de Engenharia',
  m5: 'M5 · Gerenciamento de Obras e SINAPI',
  m6: 'M6 · Perícia Judicial e Due Diligence',
}

export default function CertificadoPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()

  const [prof, setProf] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (!user.profissional) { router.push('/cliente'); return }

    profissionalApi.perfil()
      .then(setProf)
      .catch(() => toast('Erro ao carregar perfil', 'error'))
      .finally(() => setLoading(false))
  }, [user, authLoading, router, toast])

  if (authLoading || !user || loading) return null

  const modulosConcluidos = ['m1','m2','m3','m4','m5','m6'].filter(m => prof?.[`prepara_${m}`])
  const total = 6
  const tudo = modulosConcluidos.length === total

  const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  // Número único: ano + primeiros 8 chars do UUID profissional (sem hífens)
  const certNum = `SUED-${new Date().getFullYear()}-${String(user.profissional?.id || '').replace(/-/g,'').slice(0, 8).toUpperCase()}`

  return (
    <Shell>
      <Topbar
        title="Certificado SUEDPrepara"
        subtitle={tudo ? 'Habilitação completa' : `${modulosConcluidos.length} de ${total} módulos concluídos`}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/profissional/prepara')}
              className="btn btn-ghost btn-sm flex items-center gap-1"
            >
              <ArrowLeft size={13} /> Voltar
            </button>
            {tudo && (
              <button
                onClick={() => window.print()}
                className="btn btn-primary btn-sm flex items-center gap-1"
              >
                <Printer size={13} /> Imprimir / Salvar PDF
              </button>
            )}
          </div>
        }
      />

      <main className="p-6 max-w-3xl">
        {!tudo ? (
          <div className="card-solid text-center py-12 space-y-4">
            <Award size={40} className="mx-auto" style={{ color: 'var(--text3)' }} />
            <p className="text-lg font-semibold text-white">
              Certificado disponível ao concluir todos os 6 módulos
            </p>
            <p className="text-sm" style={{ color: 'var(--text3)' }}>
              Você concluiu {modulosConcluidos.length} de {total} módulos.
              Complete os módulos restantes para desbloquear seu certificado.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {['m1','m2','m3','m4','m5','m6'].map(m => (
                <span key={m} className="text-xs px-3 py-1.5 rounded-full font-semibold"
                  style={{
                    background: modulosConcluidos.includes(m) ? 'rgba(0,214,143,0.12)' : 'rgba(255,255,255,0.06)',
                    color:      modulosConcluidos.includes(m) ? 'var(--green)' : 'var(--text3)',
                    border:     `1px solid ${modulosConcluidos.includes(m) ? 'rgba(0,214,143,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  }}>
                  {modulosConcluidos.includes(m) ? '✓' : '○'} {m.toUpperCase()}
                </span>
              ))}
            </div>
            <button onClick={() => router.push('/profissional/prepara')} className="btn btn-primary mx-auto">
              Continuar os módulos →
            </button>
          </div>
        ) : (
          <>
            {/* Dica de impressão (não aparece no print) */}
            <div className="mb-6 rounded-xl p-3 flex items-center gap-3 no-print text-xs"
              style={{ background: 'rgba(0,214,143,0.08)', border: '1px solid rgba(0,214,143,0.2)' }}>
              <Printer size={14} style={{ color: 'var(--green)' }} />
              <span style={{ color: 'var(--text2)' }}>
                Para salvar como PDF: clique em "Imprimir / Salvar PDF" e escolha "Salvar como PDF" na impressora.
              </span>
            </div>

            {/* ── O Certificado ── */}
            <div
              id="certificado"
              className="rounded-2xl p-10 text-center space-y-6"
              style={{
                background:  'linear-gradient(145deg, #0A2238 0%, #061828 60%, #0F2D47 100%)',
                border:      '2px solid rgba(232,103,26,0.4)',
                boxShadow:   '0 0 60px rgba(232,103,26,0.08)',
              }}
            >
              {/* Logo/Título */}
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--orange)' }}>
                  SUEDFLOW TECNOLOGIA INOVA SIMPLES (I.S.)
                </p>
                <p className="text-3xl font-black text-white">SUEDPrepara</p>
                <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text3)' }}>
                  Certificado de Habilitação Profissional
                </p>
              </div>

              {/* Linha decorativa */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(232,103,26,0.5))' }} />
                <Award size={24} style={{ color: 'var(--gold)' }} />
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(232,103,26,0.5))' }} />
              </div>

              {/* Destinatário */}
              <div className="space-y-1">
                <p className="text-sm" style={{ color: 'var(--text3)' }}>Certificamos que</p>
                <p className="text-2xl font-bold text-white">{user.nome || 'Profissional'}</p>
                {prof?.conselho && (
                  <p className="text-sm font-mono" style={{ color: 'var(--text3)' }}>
                    {prof.conselho}-{prof.uf_conselho} {prof.numero_conselho}
                  </p>
                )}
              </div>

              <p className="text-sm leading-relaxed max-w-lg mx-auto" style={{ color: 'var(--text2)' }}>
                concluiu com aprovação todos os módulos do programa <strong className="text-white">SUEDPrepara</strong>,
                demonstrando domínio dos fundamentos técnicos, normativos e operacionais exigidos pela
                plataforma SUEDFLOW para a prestação de serviços de engenharia imobiliária com qualidade e responsabilidade técnica.
              </p>

              {/* Módulos */}
              <div className="grid grid-cols-2 gap-2 text-left max-w-md mx-auto">
                {Object.entries(MODULOS_NOMES).map(([id, nome]) => (
                  <div key={id} className="flex items-center gap-2 text-xs">
                    <span style={{ color: 'var(--green)' }}>✓</span>
                    <span style={{ color: 'var(--text2)' }}>{nome}</span>
                  </div>
                ))}
              </div>

              {/* Linha decorativa */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(232,103,26,0.3))' }} />
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(232,103,26,0.3))' }} />
              </div>

              {/* Rodapé do certificado */}
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <p style={{ color: 'var(--text3)' }}>Emitido em</p>
                  <p className="font-semibold text-white">{hoje}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--text3)' }}>Número</p>
                  <p className="font-mono font-semibold text-white">{certNum}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--text3)' }}>Validade</p>
                  <p className="font-semibold text-white">Permanente</p>
                </div>
              </div>

              <p className="text-2xs" style={{ color: 'var(--text3)' }}>
                Este certificado é emitido pela plataforma SUEDFLOW e atesta a conclusão do programa de habilitação.
                Não substitui registro em conselho de classe (CREA/CAU).
                Verificação: suedflow.com.br/verificar/{certNum}
              </p>
            </div>

            {/* CSS de impressão embutido */}
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                body { background: white !important; }
                .no-print { display: none !important; }
                header, nav, aside, footer { display: none !important; }
                #certificado {
                  border: 2px solid #E8671A !important;
                  print-color-adjust: exact;
                  -webkit-print-color-adjust: exact;
                  page-break-inside: avoid;
                }
              }
            `}} />
          </>
        )}
      </main>
    </Shell>
  )
}
