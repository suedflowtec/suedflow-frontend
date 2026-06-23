// app/profissional/prepara/[modulo]/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Shell, Topbar } from '@/components/layout/Shell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { profissional as profissionalApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { CheckCircle2, ArrowLeft, BookOpen } from 'lucide-react'

const MODULOS_CONTEUDO: Record<string, {
  titulo: string
  subtitulo: string
  objetivos: string[]
  topicos: { titulo: string; itens: string[] }[]
  svcsHabilitados: string[]
  nota?: string
}> = {
  m1: {
    titulo: 'Fundamentos SUEDFLOW',
    subtitulo: 'Pré-requisito obrigatório para todas as demandas',
    objetivos: [
      'Compreender o fluxo completo de uma demanda (AGUARDANDO → ACEITA → PAGA → EM_EXECUCAO → QA → CONCLUIDA)',
      'Conhecer os padrões de comunicação com clientes na plataforma',
      'Entender o sistema de pontuação SQP e como ele afeta sua comissão e visibilidade',
      'Saber como preencher checklists de QA corretamente',
      'Conhecer os critérios de reprovação de QA e como evitá-los',
    ],
    topicos: [
      {
        titulo: 'Fluxo de demandas',
        itens: [
          'O profissional aceita a demanda antes do pagamento do cliente (anti-subordinação)',
          'Ao aceitar, você pode aplicar desconto de 0% a 15% sobre o preço calculado pelo Motor UTS',
          'Após o pagamento do cliente, a demanda entra em EM_EXECUCAO',
          'Você realiza o serviço e submete a entrega para QA (fotos, relatórios, checklist)',
          'O Curador analisa a entrega e aprova ou reprava com feedback',
        ],
      },
      {
        titulo: 'Padrões de qualidade SUEDFLOW',
        itens: [
          'Toda entrega deve incluir fotos catalogadas (mínimo 1 por ambiente/item avaliado)',
          'Laudos e relatórios devem estar em PDF, com ART/RRT anexada quando exigida',
          'Prazo de entrega é contado a partir da confirmação do pagamento do cliente',
          'Atrasos reduzem o SQP; entregas pontuais aumentam',
          'QA reprovado aplica -40 pontos SQP e retorna a demanda para retrabalho sem remuneração adicional',
        ],
      },
      {
        titulo: 'Sistema SQP e comissões',
        itens: [
          'Você começa como CANDIDATO (22% de comissão no plano GRÁTIS)',
          'SQP sobe com demandas concluídas com qualidade, pontualidade e boa avaliação do cliente',
          'Níveis: CANDIDATO → JUNIOR → PLENO → SENIOR → ELITE',
          'Plano PRO reduz 2% em todos os níveis; Plano ELITE reduz até 4%',
          'Piso de comissão: 15% (ELITE SQP + Plano ELITE)',
        ],
      },
      {
        titulo: 'Comunicação com clientes',
        itens: [
          'Use o chat da demanda para todas as comunicações — nunca por fora da plataforma',
          'Confirme sempre o recebimento das chaves ou acesso ao imóvel via chat',
          'Comunique qualquer imprevisto técnico antes de pedir prorrogação',
          'Proibido solicitar pagamentos extras fora da plataforma',
        ],
      },
    ],
    svcsHabilitados: ['Todas as demandas do marketplace'],
    nota: 'Este módulo é pré-requisito obrigatório. Sem M1 concluído, você não pode aceitar nenhuma demanda, independentemente do SVC.',
  },
  m2: {
    titulo: 'Avaliação Mercadológica NBR 14653',
    subtitulo: 'Habilitação para SVC002 — Avaliação Mercadológica NBR 14653',
    objetivos: [
      'Aplicar a metodologia ABNT NBR 14653 para avaliação de imóveis urbanos',
      'Elaborar PTAM (Parecer Técnico de Avaliação Mercadológica) conforme padrão SUEDFLOW',
      'Selecionar e tratar amostras comparativas (grau 1, 2 e 3 de fundamentação)',
      'Calcular o valor de mercado com homogeneização de dados',
      'Documentar o laudo conforme checklist QA da plataforma',
    ],
    topicos: [
      {
        titulo: 'Metodologia NBR 14653',
        itens: [
          'Método comparativo direto de dados de mercado — obrigatório para imóveis urbanos residenciais e comerciais',
          'Grau de fundamentação I, II ou III — SUEDFLOW exige mínimo Grau II',
          'Mínimo de 3 amostras válidas (Grau I), 5 amostras (Grau II), 8 amostras (Grau III)',
          'Fatores de homogeneização: localização, área, padrão construtivo, estado de conservação',
          'Campo de arbítrio: ±15% sobre o valor calculado pelo tratamento estatístico',
        ],
      },
      {
        titulo: 'Estrutura do PTAM SUEDFLOW',
        itens: [
          'Identificação do solicitante e finalidade da avaliação',
          'Caracterização do imóvel avaliando (fotos, planta baixa esquemática se disponível)',
          'Pesquisa de mercado: mínimo 5 amostras comparativas com fonte e data',
          'Tratamento de dados: tabela de homogeneização com fatores explícitos',
          'Resultado e conclusão: valor unitário e total em R$, data-base, campo de arbítrio aplicado',
          'ART/RRT do engenheiro/arquiteto responsável (obrigatória)',
        ],
      },
      {
        titulo: 'Checklist QA — SVC002',
        itens: [
          '5+ amostras comparativas com endereço, área, valor e fonte (anúncio/transação)',
          'Fatores de homogeneização calculados e justificados',
          'Fotos do imóvel avaliando (mínimo 5: frente, fundos, interior, detalhe estrutural)',
          'Planta esquemática ou croqui de situação (pode ser manuscrita)',
          'ART/RRT escaneada ou em PDF com QR Code válido',
          'Relatório em PDF single-file (máx. 20 MB)',
        ],
      },
    ],
    svcsHabilitados: ['SVC002 — Avaliação Mercadológica NBR 14653 (piso R$1.080)'],
  },
  m3: {
    titulo: 'Inspeção Predial NBR 16.747',
    subtitulo: 'Habilitação para SVC003 — Inspeção Predial',
    objetivos: [
      'Aplicar a metodologia ABNT NBR 16.747 e normas IBAPE para inspeção predial',
      'Identificar, classificar e documentar patologias por risco e urgência',
      'Elaborar relatório de inspeção predial completo conforme padrão SUEDFLOW',
      'Recomendar ações corretivas e preventivas com prazo sugerido',
    ],
    topicos: [
      {
        titulo: 'Metodologia de inspeção',
        itens: [
          'Inspeção visual sistemática: fachadas, cobertura, estrutura, instalações, áreas comuns',
          'Classificação de anomalias: endógenas (projeto/execução), exógenas (uso/exposição), funcionais (idade)',
          'Grau de risco: crítico (iminente), moderado (segurança/saúde), mínimo (estética/funcionalidade)',
          'Classificação do estado de conservação do imóvel: ótimo, bom, regular, precário, crítico',
          'Prioridade de intervenção derivada do grau de risco',
        ],
      },
      {
        titulo: 'Documentação obrigatória',
        itens: [
          'Fotos de cada patologia com identificação do local e dimensão aproximada',
          'Planta de localização das patologias (croqui numerado aceitável)',
          'Tabela-resumo: nº de referência | Local | Anomalia | Grau de risco | Recomendação',
          'Cronograma de intervenção recomendado (imediato / 30 dias / 90 dias / anual)',
          'ART/RRT do responsável técnico pela inspeção',
        ],
      },
    ],
    svcsHabilitados: ['SVC003 — Inspeção Predial NBR 16.747 (piso R$1.350)'],
  },
  m4: {
    titulo: 'Projetos de Engenharia',
    subtitulo: 'Habilitação para SVC004 a SVC008',
    objetivos: [
      'Elaborar projetos técnicos conforme normas ABNT aplicáveis',
      'Documentar e entregar projetos no padrão de qualidade SUEDFLOW',
      'Registrar ART/RRT corretamente para cada tipo de projeto',
      'Conduzir processo de regularização de imóvel junto a órgãos competentes',
    ],
    topicos: [
      {
        titulo: 'Projetos Arquitetônicos (SVC004)',
        itens: [
          'Plantas baixas, cortes e fachadas em CAD ou PDF vetorial (escala legível)',
          'Memorial descritivo com materiais e especificações',
          'Aprovação na prefeitura: alvará de construção ou reforma exigido pelo cliente',
          'ART do arquiteto ou engenheiro civil responsável',
        ],
      },
      {
        titulo: 'Projetos Estruturais (SVC005 — NBR 6118)',
        itens: [
          'Memorial de cálculo estrutural com cargas, coeficientes e verificações',
          'Plantas de forma e armação (concreto armado) ou detalhamento (aço/madeira)',
          'Compatibilização com projeto arquitetônico',
          'ART do engenheiro estrutural',
        ],
      },
      {
        titulo: 'Projetos Elétricos (SVC006 — NBR 5410)',
        itens: [
          'Diagrama unifilar e quadros de cargas',
          'Plantas de pontos elétricos por pavimento',
          'Memorial descritivo com especificação de condutores, disjuntores e proteções',
          'ART do engenheiro elétrico',
        ],
      },
      {
        titulo: 'Projetos Hidrossanitários (SVC007)',
        itens: [
          'Plantas de água fria, água quente, esgoto e águas pluviais',
          'Memorial de cálculo hidráulico',
          'Detalhes de instalações especiais se aplicável (spinkler, reúso)',
          'ART do engenheiro civil ou sanitarista',
        ],
      },
      {
        titulo: 'Regularização de Imóvel (SVC008)',
        itens: [
          'Levantamento planialtimétrico e cadastral',
          'Projeto de regularização com anotação de responsabilidade técnica',
          'Acompanhamento do processo junto ao cartório e prefeitura (orientação)',
          'Entrega do Habite-se ou Certidão de Regularização ao cliente',
        ],
      },
    ],
    svcsHabilitados: [
      'SVC004 — Projeto Arquitetônico (piso R$1.530)',
      'SVC005 — Projeto Estrutural (piso R$1.530)',
      'SVC006 — Projeto Elétrico (piso R$935)',
      'SVC007 — Projeto Hidrossanitário (piso R$935)',
      'SVC008 — Regularização de Imóvel (piso R$830)',
    ],
  },
  m5: {
    titulo: 'Gerenciamento de Obras e SINAPI',
    subtitulo: 'Habilitação para SVC009 — Gerenciamento de Obras',
    objetivos: [
      'Planejar e controlar obras usando referências SINAPI',
      'Elaborar cronograma físico-financeiro e relatórios de medição',
      'Identificar e comunicar desvios de prazo e custo ao cliente',
      'Documentar o andamento da obra com fotos e medições semanais/quinzenais',
    ],
    topicos: [
      {
        titulo: 'Uso do SINAPI',
        itens: [
          'SINAPI = Sistema Nacional de Pesquisa de Custos e Índices da Construção Civil (CEF/IBGE)',
          'Composições: custos unitários desonerados e não-desonerados por estado',
          'Use a tabela do estado do imóvel e o mês corrente como referência',
          'Itens sem referência SINAPI devem ter 3 cotações de mercado documentadas',
        ],
      },
      {
        titulo: 'Documentação de obra',
        itens: [
          'Diário de obra: registro diário de atividades, efetivo, equipamentos e ocorrências',
          'Relatório quinzenal: fotos com legenda, % executado por serviço vs. planejado',
          'Medição: planilha comparativa previsto × executado com justificativas de desvio',
          'Relatório de conclusão: fotos antes/depois de cada ambiente + termo de entrega',
          'ART de execução (não só de projeto) quando obra exige responsável técnico',
        ],
      },
    ],
    svcsHabilitados: ['SVC009 — Gerenciamento de Obras / SINAPI (piso R$1.020)'],
  },
  m6: {
    titulo: 'Perícia Judicial e Due Diligence',
    subtitulo: 'Habilitação para SVC010 e SVC011 (nível SENIOR+ com plano PRO/ELITE)',
    objetivos: [
      'Elaborar laudos periciais técnicos em conformidade com o CPC (arts. 156-480)',
      'Conduzir due diligence técnica completa para transações imobiliárias',
      'Identificar passivos técnicos e riscos ocultos em imóveis comerciais e industriais',
      'Comunicar achados com linguagem clara para não-técnicos (juízes, compradores, investidores)',
    ],
    topicos: [
      {
        titulo: 'Perícia Judicial (SVC010 — CPC 156-480)',
        itens: [
          'Perito nomeado pelo juiz (expert witness): papel imparcial, vedada advocacia de parte',
          'Laudo pericial: identificação, objeto, quesitos das partes, metodologia, respostas, conclusão',
          'Prazo: definido pelo juízo; prorrogação deve ser solicitada antes do vencimento',
          'Assistentes técnicos das partes: você responde os quesitos deles no laudo',
          'ART de perícia judicial (modalidade específica no CREA/CAU)',
        ],
      },
      {
        titulo: 'Due Diligence Técnica (SVC011)',
        itens: [
          'Análise documental: matrícula, habite-se, IPTU, outorga, licenças ambientais, AVCB',
          'Vistoria técnica: estrutura, instalações, cobertura, fachada, fundações (visual)',
          'Avaliação mercadológica sumária (valor de mercado estimado)',
          'Identificação de passivos: autos de infração, embargos, pendências de regularização',
          'Relatório executivo para investidor: resumo de riscos (baixo/médio/alto) e estimativa de CAPEX para adequação',
        ],
      },
    ],
    svcsHabilitados: [
      'SVC010 — Perícia Judicial (piso R$1.800 · requer nível SENIOR+ e Plano PRO)',
      'SVC011 — Due Diligence Técnica (piso R$5.000 · requer nível ELITE e Plano ELITE)',
    ],
    nota: 'SVC010 e SVC011 exigem nível SQP mínimo SENIOR e ELITE respectivamente, além do plano de assinatura correspondente. Concluir M6 habilita o módulo; o acesso às demandas também depende dos requisitos de nível e plano.',
  },
}

export default function SuedPreparaModuloPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()

  const modulo = (params?.modulo as string || '').toLowerCase()
  const conteudo = MODULOS_CONTEUDO[modulo]

  const [jaConcluido, setJaConcluido] = useState(false)
  const [concluindo, setConcluindo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [confirmou, setConfirmou] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (!user.profissional) { router.push('/cliente'); return }
    if (!conteudo) { router.push('/profissional/prepara'); return }

    profissionalApi.perfil()
      .then((prof: any) => {
        setJaConcluido(prof[`prepara_${modulo}`] ?? false)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, authLoading, router, modulo, conteudo])

  if (authLoading || !user || loading) return null
  if (!conteudo) return null

  const handleConcluir = async () => {
    if (!confirmou) {
      toast('Marque a confirmação de leitura antes de concluir.', 'error')
      return
    }
    setConcluindo(true)
    try {
      await profissionalApi.concluirPrepara(modulo)
      setJaConcluido(true)
      toast(`Módulo ${modulo.toUpperCase()} concluído! Serviços habilitados.`, 'success')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao registrar conclusão.'
      toast(msg, 'error')
    } finally {
      setConcluindo(false)
    }
  }

  return (
    <Shell>
      <Topbar
        title={conteudo.titulo}
        subtitle={conteudo.subtitulo}
        actions={
          jaConcluido ? <Badge variant="green">Concluído</Badge> : undefined
        }
      />

      <main className="p-6 max-w-3xl space-y-6">

        {/* Voltar */}
        <button
          onClick={() => router.push('/profissional/prepara')}
          className="flex items-center gap-1.5 text-sm font-medium hover:opacity-80 transition-opacity"
          style={{ color: 'var(--text3)' }}
        >
          <ArrowLeft size={15} /> Voltar ao SUEDPrepara
        </button>

        {/* Status */}
        {jaConcluido && (
          <div className="flex items-center gap-3 card-solid" style={{ borderColor: 'rgba(34,197,94,0.3)' }}>
            <CheckCircle2 size={20} style={{ color: 'var(--green)' }} className="shrink-0" />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--green)' }}>Módulo concluído</p>
              <p className="text-xs" style={{ color: 'var(--text3)' }}>
                Os serviços abaixo estão habilitados no seu perfil.
              </p>
            </div>
          </div>
        )}

        {/* Objetivos */}
        <div className="card-solid">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={16} style={{ color: 'var(--orange)' }} />
            <p className="section-label">O que você vai aprender</p>
          </div>
          <ul className="space-y-2">
            {conteudo.objetivos.map((obj, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="shrink-0 text-xs font-mono font-bold mt-0.5" style={{ color: 'var(--orange)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ color: 'var(--text2)' }}>{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tópicos */}
        {conteudo.topicos.map((topico, ti) => (
          <div key={ti} className="card-solid">
            <p className="section-label mb-3">{topico.titulo}</p>
            <ul className="space-y-2">
              {topico.itens.map((item, ii) => (
                <li key={ii} className="flex items-start gap-2 text-sm">
                  <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--orange)' }} />
                  <span style={{ color: 'var(--text2)' }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Serviços habilitados */}
        <div className="card-solid">
          <p className="section-label mb-3">Serviços habilitados ao concluir este módulo</p>
          <ul className="space-y-1.5">
            {conteudo.svcsHabilitados.map((svc, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle2 size={14} style={{ color: jaConcluido ? 'var(--green)' : 'var(--text3)' }} className="shrink-0" />
                <span style={{ color: jaConcluido ? 'var(--text)' : 'var(--text2)' }}>{svc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Nota especial */}
        {conteudo.nota && (
          <div className="rounded-xl p-4 text-xs" style={{ background: 'rgba(232,103,26,0.08)', color: 'var(--text3)', borderLeft: '3px solid var(--orange)' }}>
            <p className="font-semibold text-white mb-1">Atenção</p>
            <p>{conteudo.nota}</p>
          </div>
        )}

        {/* Confirmação e botão */}
        {!jaConcluido && (
          <div className="card-solid space-y-4">
            <p className="section-label">Confirmar conclusão</p>

            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={confirmou}
                  onChange={e => setConfirmou(e.target.checked)}
                />
                <div
                  className="w-4 h-4 rounded border flex items-center justify-center transition-colors"
                  style={{
                    background: confirmou ? 'var(--orange)' : 'transparent',
                    borderColor: confirmou ? 'var(--orange)' : 'var(--border)',
                  }}
                >
                  {confirmou && <span className="text-white text-xs">✓</span>}
                </div>
              </div>
              <p className="text-sm" style={{ color: 'var(--text2)' }}>
                Li e compreendi o conteúdo deste módulo. Declaro estar apto a executar os serviços
                habilitados conforme os padrões de qualidade SUEDFLOW.
              </p>
            </label>

            <Button
              onClick={handleConcluir}
              loading={concluindo}
              disabled={!confirmou || concluindo}
              className="w-full"
            >
              <CheckCircle2 size={16} />
              Concluir módulo {modulo.toUpperCase()}
            </Button>
          </div>
        )}

        {jaConcluido && (
          <Button
            variant="ghost"
            onClick={() => router.push('/profissional/prepara')}
            className="w-full"
          >
            ← Ver todos os módulos
          </Button>
        )}
      </main>
    </Shell>
  )
}
