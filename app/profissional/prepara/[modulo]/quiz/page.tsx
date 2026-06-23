'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { profissional as profissionalApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { ArrowLeft, Trophy, XCircle } from 'lucide-react'

type Opcao = { texto: string; correto: boolean }
type Pergunta = { enunciado: string; opcoes: Opcao[]; explicacao: string }

const QUIZ_DATA: Record<string, { perguntas: Pergunta[] }> = {
  m1: {
    perguntas: [
      {
        enunciado: 'Qual é a ordem correta do fluxo de estados (FSM) de uma demanda no SUEDFLOW?',
        opcoes: [
          { texto: 'AGUARDANDO → PAGA → ACEITA → EM_EXECUCAO', correto: false },
          { texto: 'AGUARDANDO → ACEITA → PAGA → EM_EXECUCAO', correto: true },
          { texto: 'ACEITA → AGUARDANDO → PAGA → EM_EXECUCAO', correto: false },
          { texto: 'AGUARDANDO → EM_EXECUCAO → PAGA → CONCLUIDA', correto: false },
        ],
        explicacao: 'O profissional aceita primeiro (AGUARDANDO→ACEITA), negociando o preço antes do pagamento do cliente (ACEITA→PAGA). Isso garante autonomia e protege contra caracterização de vínculo empregatício.',
      },
      {
        enunciado: 'Ao aceitar uma demanda, qual o limite de desconto que o profissional pode oferecer ao cliente?',
        opcoes: [
          { texto: '0% a 30% sobre o valor UTS', correto: false },
          { texto: '5% a 20% sobre o valor UTS', correto: false },
          { texto: '0% a 15% sobre o valor UTS', correto: true },
          { texto: 'Nenhum desconto é permitido', correto: false },
        ],
        explicacao: 'O desconto máximo é 15%, nunca acréscimo. Isso permite competitividade ao profissional sem comprometer a precificação base do Motor UTS.',
      },
      {
        enunciado: 'Após o aceite, quanto tempo o cliente tem para pagar antes da demanda retornar a AGUARDANDO automaticamente?',
        opcoes: [
          { texto: '12 horas', correto: false },
          { texto: '24 horas', correto: false },
          { texto: '48 horas', correto: true },
          { texto: '7 dias corridos', correto: false },
        ],
        explicacao: 'O prazo padrão é 48 horas (configurável). Após esse prazo sem pagamento, a demanda retorna ao feed e o profissional é liberado para aceitar outras demandas.',
      },
      {
        enunciado: 'Quando o curador reprova o QA de uma entrega, o que acontece com a demanda?',
        opcoes: [
          { texto: 'É cancelada automaticamente', correto: false },
          { texto: 'Retorna a AGUARDANDO para novo aceite de outro profissional', correto: false },
          { texto: 'Vai para QA_REPROVADO e retorna a EM_EXECUCAO para retrabalho', correto: true },
          { texto: 'Vai para EM_DISPUTA automaticamente', correto: false },
        ],
        explicacao: 'QA_REPROVADO aplica -40 pontos SQP e retorna a demanda para EM_EXECUCAO. O profissional corrige e resubmete a entrega — sem remuneração adicional pelo retrabalho.',
      },
      {
        enunciado: 'Qual é a comissão de um profissional nível CANDIDATO no plano GRÁTIS?',
        opcoes: [
          { texto: '15%', correto: false },
          { texto: '18%', correto: false },
          { texto: '20%', correto: false },
          { texto: '22%', correto: true },
        ],
        explicacao: 'CANDIDATO no plano GRÁTIS paga 22%. A comissão cai conforme o nível SQP sobe e conforme o plano de assinatura, com piso absoluto de 15%.',
      },
    ],
  },
  m2: {
    perguntas: [
      {
        enunciado: 'Qual o grau mínimo de fundamentação exigido pelo SUEDFLOW para avaliações NBR 14653?',
        opcoes: [
          { texto: 'Grau I — mínimo 3 amostras', correto: false },
          { texto: 'Grau II — mínimo 5 amostras', correto: true },
          { texto: 'Grau III — mínimo 8 amostras', correto: false },
          { texto: 'Não há grau mínimo definido', correto: false },
        ],
        explicacao: 'O SUEDFLOW exige mínimo Grau II. São necessárias pelo menos 5 amostras comparativas válidas e documentadas no PTAM.',
      },
      {
        enunciado: 'O campo de arbítrio na NBR 14653 permite adotar um valor final dentro de:',
        opcoes: [
          { texto: '±5% sobre o valor do tratamento estatístico', correto: false },
          { texto: '±10% sobre o valor do tratamento estatístico', correto: false },
          { texto: '±15% sobre o valor do tratamento estatístico', correto: true },
          { texto: '±20% sobre o valor do tratamento estatístico', correto: false },
        ],
        explicacao: 'O campo de arbítrio padrão é ±15%. O avaliador deve justificar no laudo qualquer aplicação desse campo.',
      },
      {
        enunciado: 'Qual documento é obrigatório em qualquer avaliação entregue no SUEDFLOW?',
        opcoes: [
          { texto: 'Levantamento topográfico completo do imóvel', correto: false },
          { texto: 'ART ou RRT do responsável técnico', correto: true },
          { texto: 'Certidão de matrícula atualizada', correto: false },
          { texto: 'Autorização da prefeitura para realizar a avaliação', correto: false },
        ],
        explicacao: 'A ART (CREA) ou RRT (CAU) é obrigatória em toda avaliação. Entrega sem esse documento resulta em QA reprovado.',
      },
      {
        enunciado: 'Para imóveis urbanos residenciais e comerciais, qual método é exigido pela NBR 14653?',
        opcoes: [
          { texto: 'Método Evolutivo (custo de reprodução + terreno)', correto: false },
          { texto: 'Método da Capitalização de Renda', correto: false },
          { texto: 'Método Comparativo Direto de Dados de Mercado', correto: true },
          { texto: 'Qualquer método, a critério do avaliador', correto: false },
        ],
        explicacao: 'Para imóveis urbanos residenciais e comerciais, o Método Comparativo é o método primário exigido pela norma.',
      },
      {
        enunciado: 'O relatório de avaliação entregue no SUEDFLOW deve estar em qual formato?',
        opcoes: [
          { texto: 'Formato Word (.docx) editável para revisão do cliente', correto: false },
          { texto: 'Planilha Excel com cálculos e gráficos', correto: false },
          { texto: 'PDF único (single-file), máximo 20 MB', correto: true },
          { texto: 'Qualquer formato digital aceito', correto: false },
        ],
        explicacao: 'O checklist QA do SVC002 exige PDF único de até 20 MB, garantindo integridade e compatibilidade do documento entregue.',
      },
    ],
  },
  m3: {
    perguntas: [
      {
        enunciado: 'Na classificação da NBR 16747, anomalias "endógenas" são aquelas originadas:',
        opcoes: [
          { texto: 'Por agentes externos como chuva, vento e insolação', correto: false },
          { texto: 'Por falhas no projeto ou na execução da construção', correto: true },
          { texto: 'Pelo envelhecimento natural dos materiais ao longo do tempo', correto: false },
          { texto: 'Por uso inadequado dos espaços pelos ocupantes', correto: false },
        ],
        explicacao: 'Endógenas = origem interna ao processo construtivo (projeto ou execução). Exógenas = agentes externos. Funcionais = desgaste natural por uso/tempo.',
      },
      {
        enunciado: 'O grau de risco CRÍTICO em inspeção predial indica:',
        opcoes: [
          { texto: 'Necessidade de manutenção no próximo ciclo anual programado', correto: false },
          { texto: 'Problema apenas estético, sem risco à segurança', correto: false },
          { texto: 'Risco iminente à segurança dos usuários ou de terceiros', correto: true },
          { texto: 'Anomalia que afeta somente o conforto dos ocupantes', correto: false },
        ],
        explicacao: 'Risco crítico exige intervenção imediata. Representa perigo real de colapso, incêndio ou acidente grave. Deve ser comunicado ao cliente com urgência.',
      },
      {
        enunciado: 'No SUEDFLOW, o check-in fotográfico deve ser realizado:',
        opcoes: [
          { texto: 'Após a conclusão do serviço, para registro do estado final', correto: false },
          { texto: 'Ao chegar no local, antes de iniciar qualquer atividade', correto: true },
          { texto: 'Apenas se o cliente solicitar via chat', correto: false },
          { texto: 'Somente em demandas com valor acima de R$ 2.000', correto: false },
        ],
        explicacao: 'O check-in fotográfico é obrigatório logo na chegada. Documenta o estado pré-serviço e protege o profissional de disputas sobre pré-existências.',
      },
      {
        enunciado: 'A tabela-resumo obrigatória no laudo de inspeção predial deve conter:',
        opcoes: [
          { texto: 'Apenas fotos das patologias com legendas descritivas', correto: false },
          { texto: 'Número de referência, local, anomalia, grau de risco e recomendação', correto: true },
          { texto: 'Somente o custo estimado das intervenções corretivas', correto: false },
          { texto: 'Lista de materiais necessários para os reparos', correto: false },
        ],
        explicacao: 'A tabela-resumo padronizada do SUEDFLOW enumera cada anomalia com todos esses campos, facilitando leitura pelo cliente e revisão pelo curador.',
      },
      {
        enunciado: 'O cronograma de intervenção recomendado na inspeção predial categoriza ações em:',
        opcoes: [
          { texto: 'Urgente, planejada e postergável', correto: false },
          { texto: 'Imediato, até 30 dias, até 90 dias e manutenção anual', correto: true },
          { texto: 'Curto prazo (até 1 ano) e longo prazo (acima de 1 ano)', correto: false },
          { texto: 'Sem prazo específico — a critério do proprietário', correto: false },
        ],
        explicacao: 'O SUEDFLOW adota quatro categorias de prazo: imediato (risco crítico), até 30 dias, até 90 dias e manutenção anual programada.',
      },
    ],
  },
  m4: {
    perguntas: [
      {
        enunciado: 'A ART (Anotação de Responsabilidade Técnica) é emitida por profissionais registrados no:',
        opcoes: [
          { texto: 'CAU — Conselho de Arquitetura e Urbanismo', correto: false },
          { texto: 'CREA — Conselho Regional de Engenharia e Agronomia', correto: true },
          { texto: 'Prefeitura municipal do imóvel', correto: false },
          { texto: 'Ministério da Infraestrutura', correto: false },
        ],
        explicacao: 'ART é do CREA (engenheiros e agrônomos); RRT é do CAU (arquitetos). No SUEDFLOW, o documento exigido depende da formação do responsável técnico.',
      },
      {
        enunciado: 'Os projetos entregues no SUEDFLOW devem estar no formato:',
        opcoes: [
          { texto: 'Apenas DWG (arquivo CAD original editável)', correto: false },
          { texto: 'PDF + DWG — ambos obrigatórios', correto: true },
          { texto: 'Apenas JPG em alta resolução (300 dpi)', correto: false },
          { texto: 'Qualquer formato digital, sem restrição', correto: false },
        ],
        explicacao: 'O checklist QA exige PDF (legível em qualquer dispositivo) + DWG (editável pelo cliente). Os dois formatos são obrigatórios.',
      },
      {
        enunciado: 'O SVC008 — Regularização de Imóvel — engloba até a entrega de:',
        opcoes: [
          { texto: 'Apenas o levantamento planialtimétrico e o projeto técnico', correto: false },
          { texto: 'Habite-se ou Certidão de Regularização ao cliente', correto: true },
          { texto: 'Escritura pública definitiva do imóvel', correto: false },
          { texto: 'Somente orientação verbal ao cliente sobre o processo', correto: false },
        ],
        explicacao: 'O SVC008 cobre o processo completo: levantamento, projeto, ART e acompanhamento até a emissão do documento de regularização pelo órgão competente.',
      },
      {
        enunciado: 'O projeto estrutural (SVC005) entregue no SUEDFLOW deve incluir obrigatoriamente:',
        opcoes: [
          { texto: 'Apenas plantas de armação em PDF', correto: false },
          { texto: 'Memorial de cálculo, plantas de forma/armação e ART do engenheiro estrutural', correto: true },
          { texto: 'Somente a ART, sem necessidade de apresentar cálculos', correto: false },
          { texto: 'Aprovação prévia da prefeitura antes da entrega ao cliente', correto: false },
        ],
        explicacao: 'O conjunto completo (memorial + plantas + ART) é necessário para o curador verificar a consistência técnica. Entrega parcial resulta em QA reprovado.',
      },
      {
        enunciado: 'O módulo M4 habilita quais serviços (SVCs) no marketplace?',
        opcoes: [
          { texto: 'SVC001 a SVC003', correto: false },
          { texto: 'SVC004 a SVC008', correto: true },
          { texto: 'SVC009 a SVC011', correto: false },
          { texto: 'Apenas SVC004 (Projeto Arquitetônico)', correto: false },
        ],
        explicacao: 'M4 cobre projetos: arquitetônico (004), estrutural (005), elétrico (006), hidrossanitário (007) e regularização de imóvel (008).',
      },
    ],
  },
  m5: {
    perguntas: [
      {
        enunciado: 'O SINAPI é o sistema de custos da construção civil mantido por:',
        opcoes: [
          { texto: 'CREA e CAU em conjunto', correto: false },
          { texto: 'Ministério das Cidades e ABNT', correto: false },
          { texto: 'Caixa Econômica Federal (CEF) e IBGE', correto: true },
          { texto: 'Banco Central do Brasil', correto: false },
        ],
        explicacao: 'O SINAPI é uma parceria: CEF (gestão, publicação e divulgação) + IBGE (metodologia e pesquisa de preços). Use a tabela do estado do imóvel e o mês corrente.',
      },
      {
        enunciado: 'Com qual frequência a tabela SINAPI é atualizada?',
        opcoes: [
          { texto: 'Anualmente, com reajuste INCC', correto: false },
          { texto: 'Trimestralmente', correto: false },
          { texto: 'Mensalmente', correto: true },
          { texto: 'Semanalmente conforme variação de mercado', correto: false },
        ],
        explicacao: 'O SINAPI é atualizado todo mês por estado. Use sempre o mês corrente correspondente ao local do imóvel avaliado.',
      },
      {
        enunciado: 'O Diário de Obra é:',
        opcoes: [
          { texto: 'Documento opcional, elaborado apenas a pedido do cliente', correto: false },
          { texto: 'Registro obrigatório das atividades diárias de obra', correto: true },
          { texto: 'Documento emitido pelo fiscal de obras da prefeitura', correto: false },
          { texto: 'Relatório financeiro mensal da construtora', correto: false },
        ],
        explicacao: 'O Diário de Obra é responsabilidade do responsável técnico. Deve registrar diariamente: efetivo, equipamentos, serviços executados e ocorrências.',
      },
      {
        enunciado: 'Para itens de obra sem composição SINAPI disponível, o profissional deve:',
        opcoes: [
          { texto: 'Estimar o custo por experiência pessoal sem documentar', correto: false },
          { texto: 'Ignorar o item e alertar o cliente verbalmente', correto: false },
          { texto: 'Apresentar mínimo 3 cotações de mercado com fornecedores identificados', correto: true },
          { texto: 'Usar a tabela SINAPI do estado mais próximo', correto: false },
        ],
        explicacao: 'Sem referência SINAPI, são necessárias pelo menos 3 cotações com fornecedores identificados, datas e valores documentados.',
      },
      {
        enunciado: 'O relatório de conclusão de obra exigido no SUEDFLOW deve incluir obrigatoriamente:',
        opcoes: [
          { texto: 'Apenas o termo de entrega assinado pelo cliente', correto: false },
          { texto: 'Fotos antes/depois de cada ambiente + termo de entrega', correto: true },
          { texto: 'Somente a ART de execução registrada no CREA', correto: false },
          { texto: 'Planilha financeira com todos os pagamentos da obra', correto: false },
        ],
        explicacao: 'O padrão SUEDFLOW exige fotos comparativas (antes/depois) de cada ambiente, além do termo formal de conclusão e entrega.',
      },
    ],
  },
  m6: {
    perguntas: [
      {
        enunciado: 'Qual é o papel do perito nomeado pelo juiz em um processo judicial?',
        opcoes: [
          { texto: 'Defender os interesses da parte que o indicou', correto: false },
          { texto: 'Representar tecnicamente o autor da ação', correto: false },
          { texto: 'Atuar com imparcialidade, sendo vedada a advocacia de parte', correto: true },
          { texto: 'Substituir o advogado nas questões técnicas do processo', correto: false },
        ],
        explicacao: 'O perito judicial é um expert imparcial do juízo. Qualquer parcialidade pode nulificar o laudo e gerar responsabilidade civil e penal para o perito.',
      },
      {
        enunciado: 'Na due diligence técnica (SVC011), a análise da matrícula do imóvel verifica:',
        opcoes: [
          { texto: 'O valor venal do imóvel para fins de IPTU', correto: false },
          { texto: 'O estado de conservação dos acabamentos', correto: false },
          { texto: 'A conformidade documental e histórico de propriedade', correto: true },
          { texto: 'O potencial construtivo e índices urbanísticos do terreno', correto: false },
        ],
        explicacao: 'A matrícula registra a cadeia dominial completa: proprietários anteriores, ônus, hipotecas, penhoras e restrições. É a primeira análise de qualquer due diligence.',
      },
      {
        enunciado: 'O laudo pericial deve responder aos quesitos de:',
        opcoes: [
          { texto: 'Apenas do juiz que nomeou o perito', correto: false },
          { texto: 'Somente da parte contratante', correto: false },
          { texto: 'Do juízo, do autor e do réu (todas as partes)', correto: true },
          { texto: 'Apenas do que o perito julgar tecnicamente relevante', correto: false },
        ],
        explicacao: 'O perito responde aos quesitos de todas as partes. Os assistentes técnicos podem apresentar laudos divergentes (pareceres técnicos), mas não substituem o laudo pericial.',
      },
      {
        enunciado: 'O relatório executivo de due diligence entregue ao investidor deve conter:',
        opcoes: [
          { texto: 'Apenas o valor de mercado atual do imóvel', correto: false },
          { texto: 'Somente os documentos coletados, sem análise interpretativa', correto: false },
          { texto: 'Resumo de riscos (baixo/médio/alto) e estimativa de CAPEX para adequação', correto: true },
          { texto: 'Recomendação explícita de compra ou não-compra do imóvel', correto: false },
        ],
        explicacao: 'O relatório SVC011 é voltado para tomadores de decisão não-técnicos. Traduz achados técnicos em categorias de risco e custo estimado de adequação.',
      },
      {
        enunciado: 'A prorrogação do prazo de entrega do laudo pericial deve ser solicitada ao juiz:',
        opcoes: [
          { texto: 'Após o vencimento do prazo original, com justificativa técnica', correto: false },
          { texto: 'Antes do vencimento do prazo fixado no despacho', correto: true },
          { texto: 'A qualquer momento durante o processo, sem restrição de prazo', correto: false },
          { texto: 'Somente após a nomeação do assistente técnico da parte contrária', correto: false },
        ],
        explicacao: 'Prorrogação solicitada após o vencimento pode ser indeferida e caracterizar descumprimento de prazo judicial, com consequências para o perito.',
      },
    ],
  },
}

type QuizStep = 'choosing' | 'revealed' | 'done'

const MINIMO_APROVACAO = 3

export default function SuedPreparaQuizPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()

  const modulo = (params?.modulo as string || '').toLowerCase()
  const quizData = QUIZ_DATA[modulo]
  const TOTAL = quizData?.perguntas.length ?? 0

  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [step, setStep] = useState<QuizStep>('choosing')
  const [results, setResults] = useState<boolean[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [jaConcluido, setJaConcluido] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (!user.profissional) { router.push('/cliente'); return }
    if (!quizData) { router.push('/profissional/prepara'); return }

    profissionalApi.perfil()
      .then((prof: Record<string, unknown>) => {
        setJaConcluido((prof[`prepara_${modulo}`] as boolean) ?? false)
      })
      .catch(() => {})
  }, [user, authLoading, router, modulo, quizData])

  if (authLoading || !user) return null
  if (!quizData) return null

  const pergunta = quizData.perguntas[current]
  const acertos = results.filter(Boolean).length
  const aprovado = step === 'done' && acertos >= MINIMO_APROVACAO

  const confirmar = () => {
    if (selected === null) return
    const correto = pergunta.opcoes[selected].correto
    setResults(r => [...r, correto])
    setStep('revealed')
  }

  const proxima = () => {
    if (current + 1 >= TOTAL) {
      setStep('done')
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
      setStep('choosing')
    }
  }

  const reiniciar = () => {
    setCurrent(0)
    setSelected(null)
    setStep('choosing')
    setResults([])
  }

  const concluir = async () => {
    if (jaConcluido) { router.push('/profissional/prepara'); return }
    setSubmitting(true)
    try {
      await profissionalApi.concluirPrepara(modulo)
      toast(`Módulo ${modulo.toUpperCase()} concluído! Serviços habilitados.`, 'success')
      router.push('/profissional/prepara')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao registrar conclusão.'
      toast(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Tela de resultado ────────────────────────────────────────
  if (step === 'done') {
    return (
      <Shell>
        <Topbar title={`Avaliação — ${modulo.toUpperCase()}`} subtitle={aprovado ? 'Aprovado' : 'Não aprovado'} />
        <main className="p-6 max-w-xl mx-auto">
          <div className="card-solid text-center py-10 space-y-4">
            {aprovado ? (
              <>
                <Trophy size={48} className="mx-auto" style={{ color: 'var(--gold)' }} />
                <p className="text-3xl font-bold font-mono text-white">{acertos}<span className="text-lg font-sans" style={{ color: 'var(--text3)' }}>/{TOTAL}</span></p>
                <p className="text-sm font-semibold" style={{ color: 'var(--green)' }}>Aprovado — mínimo de {MINIMO_APROVACAO} respostas corretas atingido.</p>
                <button
                  onClick={concluir}
                  disabled={submitting}
                  className="btn btn-primary w-full mt-4"
                >
                  {submitting ? 'Salvando...' : jaConcluido ? 'Voltar ao SUEDPrepara' : `Confirmar habilitação — ${modulo.toUpperCase()}`}
                </button>
              </>
            ) : (
              <>
                <XCircle size={48} className="mx-auto" style={{ color: 'var(--red)' }} />
                <p className="text-3xl font-bold font-mono text-white">{acertos}<span className="text-lg font-sans" style={{ color: 'var(--text3)' }}>/{TOTAL}</span></p>
                <p className="text-sm" style={{ color: 'var(--red)' }}>Mínimo de {MINIMO_APROVACAO} respostas corretas não atingido.</p>
                <div className="flex flex-col gap-2 mt-4">
                  <button onClick={reiniciar} className="btn btn-primary w-full">
                    Tentar novamente
                  </button>
                  <button
                    onClick={() => router.push(`/profissional/prepara/${modulo}`)}
                    className="btn btn-ghost w-full"
                  >
                    Rever o conteúdo
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </Shell>
    )
  }

  // ── Tela de pergunta ─────────────────────────────────────────
  const isRevealed = step === 'revealed'
  const acertou = isRevealed && selected !== null && pergunta.opcoes[selected].correto

  return (
    <Shell>
      <Topbar
        title={`Avaliação — ${modulo.toUpperCase()}`}
        subtitle={`Pergunta ${current + 1} de ${TOTAL}`}
      />
      <main className="p-6 max-w-xl mx-auto space-y-5">

        {/* Voltar */}
        <button
          onClick={() => router.push(`/profissional/prepara/${modulo}`)}
          className="flex items-center gap-1.5 text-sm font-medium hover:opacity-80 transition-opacity"
          style={{ color: 'var(--text3)' }}
        >
          <ArrowLeft size={15} /> Voltar ao conteúdo
        </button>

        {/* Trilho de progresso segmentado */}
        <div className="flex gap-1.5">
          {quizData.perguntas.map((_, i) => {
            const state =
              i < results.length ? (results[i] ? 'correct' : 'wrong') :
              i === current      ? 'active'                            : 'pending'
            return (
              <div
                key={i}
                className="h-1.5 flex-1 rounded-full transition-all duration-300"
                style={{
                  background:
                    state === 'correct' ? 'var(--green)'                :
                    state === 'wrong'   ? 'var(--red)'                  :
                    state === 'active'  ? 'var(--orange)'               :
                    'rgba(255,255,255,0.12)',
                }}
              />
            )
          })}
        </div>

        {/* Card da pergunta */}
        <div className="card-solid space-y-4">
          <p className="text-base font-semibold text-white leading-snug">{pergunta.enunciado}</p>

          <div className="space-y-2">
            {pergunta.opcoes.map((opc, i) => {
              const isSelected  = selected === i
              const showCorrect = isRevealed && opc.correto
              const showWrong   = isRevealed && isSelected && !opc.correto

              return (
                <button
                  key={i}
                  onClick={() => !isRevealed && setSelected(i)}
                  disabled={isRevealed}
                  className="w-full text-left rounded-xl p-3.5 border text-sm transition-all"
                  style={{
                    background:
                      showCorrect ? 'rgba(0,214,143,0.10)'  :
                      showWrong   ? 'rgba(255,77,109,0.10)' :
                      isSelected  ? 'rgba(232,103,26,0.12)' :
                      'rgba(255,255,255,0.04)',
                    borderColor:
                      showCorrect ? 'rgba(0,214,143,0.50)'  :
                      showWrong   ? 'rgba(255,77,109,0.50)' :
                      isSelected  ? 'rgba(232,103,26,0.60)' :
                      'rgba(255,255,255,0.08)',
                    color:
                      showCorrect ? 'var(--green)' :
                      showWrong   ? 'var(--red)'   :
                      'var(--text)',
                    cursor: isRevealed ? 'default' : 'pointer',
                  }}
                >
                  <span
                    className="font-mono text-xs mr-2.5 font-bold"
                    style={{
                      color: showCorrect ? 'var(--green)' :
                             showWrong   ? 'var(--red)'   :
                             'var(--text3)',
                    }}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opc.texto}
                </button>
              )
            })}
          </div>

          {/* Feedback após revelar */}
          {isRevealed && (
            <div
              className="rounded-lg p-3 text-xs leading-relaxed"
              style={{
                background:   acertou ? 'rgba(0,214,143,0.08)'  : 'rgba(255,77,109,0.08)',
                color:        acertou ? 'var(--green)'           : 'var(--red)',
                borderLeft:  `3px solid ${acertou ? 'var(--green)' : 'var(--red)'}`,
              }}
            >
              <span className="font-semibold">{acertou ? '✓ Correto! ' : '✗ Incorreto. '}</span>
              {pergunta.explicacao}
            </div>
          )}

          {/* Ações */}
          {!isRevealed ? (
            <button
              onClick={confirmar}
              disabled={selected === null}
              className="btn btn-primary w-full"
              style={{ opacity: selected === null ? 0.4 : 1, transition: 'opacity 0.2s' }}
            >
              Confirmar resposta
            </button>
          ) : (
            <button onClick={proxima} className="btn btn-primary w-full">
              {current + 1 < TOTAL ? 'Próxima pergunta →' : 'Ver resultado'}
            </button>
          )}
        </div>
      </main>
    </Shell>
  )
}
