'use client'
import Link from 'next/link'

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--navy)' }}>
      <header className="border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="font-black text-white text-xl tracking-tight">
            SUED<span style={{ color: 'var(--orange)' }}>FLOW</span>
          </Link>
          <Link href="/" className="btn btn-secondary btn-sm">Voltar</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-6" style={{ color: 'var(--text2)' }}>
        <h1 className="text-2xl font-bold text-white">Política de Privacidade</h1>
        <p className="text-sm" style={{ color: 'var(--text3)' }}>
          Última atualização: 11 de junho de 2026
        </p>

        <div className="card space-y-4 text-sm leading-relaxed">
          <section>
            <h2 className="font-semibold text-white mb-2">1. Dados coletados</h2>
            <p>
              A SUEDFLOW Tecnologia Ltda. coleta dados de cadastro (nome, e-mail, CPF/CNPJ,
              telefone, endereço), dados de uso da plataforma e documentos enviados para
              verificação (KYC) de profissionais.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-white mb-2">2. Finalidade do tratamento</h2>
            <p>
              Os dados são utilizados para viabilizar a contratação de serviços de engenharia,
              processar pagamentos via Pagar.me, emitir notas fiscais (NFS-e) e calcular o
              Score de Qualificação Profissional (SQP).
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-white mb-2">3. Compartilhamento</h2>
            <p>
              Dados podem ser compartilhados com parceiros de pagamento, armazenamento de
              arquivos (Cloudinary) e órgãos públicos, quando exigido por lei.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-white mb-2">4. Direitos do usuário (LGPD)</h2>
            <p>
              Você pode solicitar acesso, correção, exportação ou exclusão dos seus dados
              pessoais a qualquer momento em{' '}
              <Link href="/configuracoes" className="font-semibold hover:underline" style={{ color: 'var(--orange)' }}>
                Configurações
              </Link>.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-white mb-2">5. Contato</h2>
            <p>
              Em caso de dúvidas sobre esta política, contate{' '}
              <a href="mailto:privacidade@suedflow.com.br" className="font-semibold hover:underline" style={{ color: 'var(--orange)' }}>
                privacidade@suedflow.com.br
              </a>.
            </p>
          </section>
        </div>

        <p className="text-xs" style={{ color: 'var(--text3)' }}>
          SUEDFLOW Tecnologia Ltda. · João Pessoa/PB · 2026
        </p>
      </main>
    </div>
  )
}
