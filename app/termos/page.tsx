'use client'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'

export default function TermosPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF7', color: '#0E2A3D' }}>
      <header style={{ borderBottom: '1px solid #EBEDEF', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link href="/"><Logo height={32} /></Link>
        <span style={{ color: '#5A7184', fontSize: 14 }}>Termos de Uso e Política de Privacidade</span>
      </header>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 32px 80px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Termos de Uso — SUEDFLOW</h1>
        <p style={{ color: '#5A7184', fontSize: 13, marginBottom: 40 }}>Versão 1.0 · Vigência: 01/06/2026 · João Pessoa, PB</p>

        <Section title="1. Aceitação dos Termos">
          <p>Ao criar uma conta na plataforma SUEDFLOW, você (doravante "Usuário") concorda integralmente com estes Termos de Uso. Caso não concorde, não utilize a plataforma. O uso continuado após alterações nos termos implica aceitação das novas versões.</p>
        </Section>

        <Section title="2. Descrição do Serviço">
          <p>A SUEDFLOW é uma plataforma de intermediação de serviços técnicos de engenharia e arquitetura. A plataforma conecta Clientes (pessoas físicas ou jurídicas com imóveis) a Profissionais técnicos habilitados (engenheiros e arquitetos com registro ativo no CREA ou CAU), facilitando a contratação, execução e pagamento de serviços técnicos imobiliários.</p>
          <p style={{ marginTop: 12 }}>A SUEDFLOW não executa serviços de engenharia — atua exclusivamente como intermediadora tecnológica.</p>
        </Section>

        <Section title="3. Cadastro e Habilitação">
          <p><b>3.1 Cliente:</b> Pessoa física ou jurídica que solicita serviços técnicos para imóveis de sua propriedade ou sob sua responsabilidade. Deve fornecer dados verdadeiros e manter as informações atualizadas.</p>
          <p style={{ marginTop: 8 }}><b>3.2 Profissional:</b> Engenheiro ou arquiteto com registro ativo no CREA ou CAU, previamente aprovado pelo processo de KYC (Know Your Customer) da plataforma. O profissional é o único responsável pelos conteúdos técnicos dos entregáveis, pelas ARTs/RRTs vinculadas e pela conformidade com as normas técnicas aplicáveis.</p>
          <p style={{ marginTop: 8 }}><b>3.3 Verificação:</b> A SUEDFLOW pode solicitar documentos adicionais a qualquer momento para validação do cadastro. Contas com dados inconsistentes podem ser suspensas.</p>
        </Section>

        <Section title="4. Responsabilidade Técnica">
          <p>O profissional habilitado é o único responsável civil e técnico pelos serviços prestados, pelos laudos, projetos e demais entregáveis, e pela emissão das ARTs/RRTs perante os conselhos profissionais. A SUEDFLOW não valida o conteúdo técnico dos entregáveis — o processo de QA avalia conformidade formal com o escopo contratado, não a correção técnica do trabalho.</p>
        </Section>

        <Section title="5. Pagamentos e Escrow">
          <p>Os pagamentos são processados via Pagar.me v5. O valor pago pelo Cliente fica retido em custódia (escrow) pela SUEDFLOW até a confirmação de entrega pelo Cliente. A liberação ao Profissional ocorre após aprovação do entregável. Em caso de disputa, um Curador Sênior da plataforma atuará como árbitro.</p>
          <p style={{ marginTop: 8 }}>Comissões variam conforme o nível SQP do profissional (de 22% a 15%) e o plano contratado.</p>
        </Section>

        <Section title="6. Política de Cancelamento">
          <p>Demandas no status AGUARDANDO (antes do pagamento) podem ser canceladas sem custo. Após o pagamento, o cancelamento está sujeito às regras de disputa e pode implicar retenção parcial do valor para cobrir custos já incorridos pelo profissional.</p>
        </Section>

        <Section title="7. Propriedade Intelectual dos Entregáveis">
          <p>Os laudos, projetos e documentos técnicos gerados pertencem ao Cliente após a liberação do pagamento. O Profissional mantém o direito de autoria técnica, conforme legislação de propriedade intelectual e normas dos conselhos profissionais. A SUEDFLOW não reivindica propriedade sobre os entregáveis técnicos.</p>
        </Section>

        <Section title="8. Score de Qualificação Profissional (SQP)">
          <p>O SQP é calculado automaticamente pela plataforma com base em métricas de desempenho dos últimos 90 dias (prazo, qualidade técnica, QA, avaliação do cliente e taxa de resposta). O nível SQP determina a comissão aplicada e pode restringir o acesso a determinados serviços. A metodologia de cálculo é de propriedade da SUEDFLOW.</p>
        </Section>

        <Section title="9. Privacidade e LGPD">
          <p>A SUEDFLOW coleta e processa dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018). Os dados são utilizados exclusivamente para operação da plataforma, comunicações relacionadas aos serviços e cumprimento de obrigações legais. Não vendemos nem compartilhamos dados com terceiros para fins comerciais.</p>
          <p style={{ marginTop: 8 }}>Para exercer seus direitos (acesso, correção, exclusão, portabilidade), entre em contato: <b>privacidade@suedflow.com.br</b></p>
        </Section>

        <Section title="10. Foro e Lei Aplicável">
          <p>Estes termos são regidos pelas leis brasileiras. Eventuais litígios serão submetidos ao foro da Comarca de João Pessoa, Estado da Paraíba, com renúncia expressa a qualquer outro, por mais privilegiado que seja.</p>
        </Section>

        <div style={{ marginTop: 40, padding: '20px 24px', background: '#EAF1F6', borderRadius: 12, fontSize: 13, color: '#5A7184' }}>
          Dúvidas? Entre em contato: <b>suporte@suedflow.com.br</b>
        </div>

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <Link href="/auth/cadastro?tipo=CLIENTE" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#E8671A,#FF8A3D)', color: '#fff', fontWeight: 700, padding: '12px 28px', borderRadius: 12, textDecoration: 'none', fontSize: 15 }}>
            Concordo — Criar minha conta
          </Link>
        </div>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#0E2A3D' }}>{title}</h2>
      <div style={{ fontSize: 14.5, lineHeight: 1.7, color: '#3A5060' }}>{children}</div>
    </section>
  )
}
