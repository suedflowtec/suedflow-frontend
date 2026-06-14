// frontend/lib/svcDetalhes.ts
// Conteúdo descritivo (marketing/explicativo) dos 12 serviços do catálogo SUEDFLOW.
// Complementa os dados reais do backend (preço, SLA, ART) na tela de detalhe do SVC.
// v4.4.5.8 · item "Detalhe de SVC" do roadmap de integração.

export interface SvcDetalhe {
  icone: string
  o_que_e: string
  para_quem: string[]
  voce_precisa: string[]
  entregaveis: string[]
  nao_inclui: string[]
}

export const SVC_DETALHES: Record<string, SvcDetalhe> = {
  SVC000: {
    icone: '🧭',
    o_que_e: 'Conversa técnica com um engenheiro ou arquiteto para esclarecer dúvidas, avaliar viabilidade ou orientar os próximos passos do seu projeto, sem compromisso com um serviço maior.',
    para_quem: [
      'Quem tem dúvidas técnicas antes de contratar um serviço maior',
      'Quem precisa de uma segunda opinião sobre um projeto ou laudo existente',
      'Quem quer entender se um imóvel ou terreno é viável para o que pretende fazer',
    ],
    voce_precisa: [
      'Descrever sua dúvida ou objetivo com o máximo de detalhes',
      'Ter em mãos documentos ou fotos relacionados, se houver',
      'Definir o tempo estimado de consultoria necessário',
    ],
    entregaveis: [
      'Atendimento técnico no tempo contratado',
      'Orientações e recomendações por escrito ao final',
    ],
    nao_inclui: [
      'Elaboração de projetos, laudos ou plantas',
      'Visita presencial ao imóvel (salvo se contratado à parte)',
      'Registro de ART/RRT',
    ],
  },
  SVC001: {
    icone: '📋',
    o_que_e: 'Vistoria detalhada do imóvel com registro fotográfico de todos os ambientes e identificação das condições e patologias existentes no momento da visita.',
    para_quem: [
      'Quem vai entregar ou receber um imóvel alugado',
      'Quem precisa documentar o estado de um imóvel antes de uma obra vizinha',
      'Quem precisa de prova técnica para resolver disputas sobre danos',
    ],
    voce_precisa: [
      'Garantir acesso a todos os ambientes do imóvel',
      'Estar presente ou indicar alguém para acompanhar a vistoria',
      'Informar a finalidade do laudo (locação, disputa, seguro etc.)',
    ],
    entregaveis: [
      'Relatório fotográfico catalogado de todos os ambientes',
      'Identificação e classificação de risco das patologias encontradas',
      'Recomendações técnicas',
      'ART/RRT do responsável técnico',
    ],
    nao_inclui: [
      'Execução de reparos ou orçamentos de obra',
      'Ensaios laboratoriais (ex.: análise estrutural aprofundada)',
    ],
  },
  SVC002: {
    icone: '💰',
    o_que_e: 'Determinação do valor de mercado de um imóvel com base em metodologia técnica reconhecida (NBR 14653), útil para venda, financiamento, partilha ou garantia.',
    para_quem: [
      'Quem vai vender, comprar ou financiar um imóvel',
      'Quem precisa de laudo para inventário, partilha ou processo judicial',
      'Empresas que precisam avaliar imóveis para garantia bancária',
    ],
    voce_precisa: [
      'Documentação do imóvel (matrícula, IPTU)',
      'Acesso para vistoria do imóvel',
      'Informar a finalidade da avaliação',
    ],
    entregaveis: [
      'Laudo de avaliação conforme NBR 14653',
      'Pesquisa de mercado com no mínimo 3 comparativos',
      'Grau de fundamentação (I, II ou III)',
      'Valor conclusivo em R$ com ART/RRT',
    ],
    nao_inclui: [
      'Negociação ou intermediação da venda do imóvel',
      'Avaliação de bens móveis ou equipamentos',
    ],
  },
  SVC003: {
    icone: '🏢',
    o_que_e: 'Vistoria técnica completa da edificação — estrutura, fachada, cobertura, instalações hidráulicas, elétricas, SPDA e PPCI — com classificação de anomalias e plano de manutenção.',
    para_quem: [
      'Síndicos e condomínios que precisam de laudo periódico',
      'Compradores de imóveis usados que querem avaliar o estado do prédio',
      'Proprietários que querem planejar manutenções preventivas',
    ],
    voce_precisa: [
      'Liberar acesso às áreas comuns e técnicas (telhado, casa de máquinas etc.)',
      'Disponibilizar plantas ou projetos existentes, se houver',
      'Agendar o check-in presencial do profissional (GPS obrigatório)',
    ],
    entregaveis: [
      'Relatório de inspeção conforme NBR 16.747',
      'Classificação de anomalias por grau de risco (G1 a G4)',
      'Plano de manutenção corretiva e preventiva',
      'Fotos de cada anomalia identificada',
      'ART/RRT do responsável técnico',
    ],
    nao_inclui: [
      'Execução das manutenções/reparos recomendados',
      'Ensaios destrutivos ou laboratoriais',
    ],
  },
  SVC004: {
    icone: '📐',
    o_que_e: 'Elaboração do projeto arquitetônico de uma edificação nova ou de uma reforma, com plantas, cortes, elevações e memorial descritivo prontos para aprovação e execução.',
    para_quem: [
      'Quem vai construir ou reformar um imóvel',
      'Quem precisa de projeto para dar entrada em financiamento ou alvará',
      'Quem quer formalizar uma planta já existente (regularização)',
    ],
    voce_precisa: [
      'Definir o programa de necessidades (cômodos, áreas desejadas)',
      'Fornecer levantamento topográfico ou planta do terreno, se houver',
      'Informar restrições do lote (recuos, gabarito, zoneamento)',
    ],
    entregaveis: [
      'Planta baixa cotada de todos os ambientes',
      'Cortes longitudinal e transversal',
      'Elevações de todas as fachadas',
      'Memorial descritivo de materiais e acabamentos',
      'ART/RRT registrada no CAU/CREA',
    ],
    nao_inclui: [
      'Projetos complementares (estrutural, elétrico, hidráulico)',
      'Acompanhamento da execução da obra',
      'Taxas de aprovação na prefeitura',
    ],
  },
  SVC005: {
    icone: '🏗️',
    o_que_e: 'Dimensionamento e detalhamento da estrutura de concreto armado da edificação (fundações, pilares, vigas e lajes), conforme NBR 6118, compatibilizado com o projeto arquitetônico.',
    para_quem: [
      'Quem já tem o projeto arquitetônico definido e vai construir',
      'Construtoras e responsáveis técnicos que precisam do detalhamento estrutural',
      'Quem precisa avaliar a viabilidade estrutural de uma reforma/ampliação',
    ],
    voce_precisa: [
      'Fornecer o projeto arquitetônico aprovado/finalizado',
      'Informar dados do solo (sondagem), se disponíveis',
      'Indicar cargas especiais previstas (piscinas, equipamentos pesados etc.)',
    ],
    entregaveis: [
      'Plantas de formas e detalhamento de armaduras',
      'Memorial de cálculo estrutural conforme NBR 6118',
      'Especificação de materiais (resistência do concreto, aço)',
      'ART/RRT registrada',
    ],
    nao_inclui: [
      'Sondagem do solo (SPT) — pode ser contratada separadamente',
      'Execução da obra/concretagem',
      'Projeto arquitetônico',
    ],
  },
  SVC006: {
    icone: '💡',
    o_que_e: 'Projeto das instalações elétricas de baixa tensão da edificação — quadros, circuitos, dimensionamento de condutores e proteções — conforme NBR 5410.',
    para_quem: [
      'Quem está construindo ou reformando e precisa do projeto para a obra',
      'Quem precisa do projeto para dar entrada na concessionária de energia',
      'Quem quer adequar uma instalação elétrica antiga às normas atuais',
    ],
    voce_precisa: [
      'Fornecer a planta arquitetônica atualizada',
      'Informar a previsão de cargas especiais (ar-condicionado, carregador EV etc.)',
      'Indicar o padrão de entrada de energia existente ou desejado',
    ],
    entregaveis: [
      'Planta de distribuição de pontos elétricos',
      'Diagrama unifilar e quadro de cargas',
      'Dimensionamento de condutores e disjuntores',
      'ART/RRT registrada',
    ],
    nao_inclui: [
      'Execução da instalação elétrica',
      'Projeto de SPDA (para-raios) — pode ser solicitado junto à inspeção predial',
    ],
  },
  SVC007: {
    icone: '🚰',
    o_que_e: 'Projeto das instalações de água fria, água quente, esgoto e águas pluviais da edificação, dimensionado conforme normas técnicas (NBR 5626 e NBR 8160).',
    para_quem: [
      'Quem está construindo ou reformando e precisa do projeto para a obra',
      'Quem precisa regularizar instalações hidráulicas existentes',
      'Quem quer dimensionar reservatórios e sistema de reuso/captação de chuva',
    ],
    voce_precisa: [
      'Fornecer a planta arquitetônica atualizada',
      'Informar a localização de poços, cisternas ou rede pública disponível',
      'Indicar pontos hidráulicos desejados (banheiros, cozinha, área de serviço)',
    ],
    entregaveis: [
      'Planta de distribuição hidrossanitária (água fria, esgoto, pluvial)',
      'Isometria das prumadas',
      'Dimensionamento de tubulações e reservatórios',
      'ART/RRT registrada',
    ],
    nao_inclui: [
      'Execução da instalação hidráulica',
      'Projeto de aquecimento solar (sob consulta)',
    ],
  },
  SVC008: {
    icone: '📑',
    o_que_e: 'Levantamento e elaboração da documentação técnica necessária para regularizar uma construção junto à prefeitura (habite-se, certidões e plantas atualizadas).',
    para_quem: [
      'Quem construiu ou ampliou sem projeto aprovado',
      'Quem precisa de habite-se para financiar, vender ou escriturar o imóvel',
      'Quem comprou um imóvel com pendências de documentação',
    ],
    voce_precisa: [
      'Fornecer escritura/matrícula do imóvel',
      'Permitir levantamento métrico (medição) do imóvel construído',
      'Informar se há débitos de IPTU ou pendências municipais conhecidas',
    ],
    entregaveis: [
      'Levantamento métrico do imóvel "as built"',
      'Planta de regularização compatível com o construído',
      'Memorial e documentação técnica para protocolo na prefeitura',
      'ART/RRT registrada',
    ],
    nao_inclui: [
      'Pagamento de taxas, multas e emolumentos municipais',
      'Despachante para protocolo presencial (quando exigido pelo município)',
    ],
  },
  SVC009: {
    icone: '🧱',
    o_que_e: 'Acompanhamento técnico da execução de uma obra, com cronograma físico-financeiro, orçamento referenciado pela tabela SINAPI e relatórios periódicos de progresso.',
    para_quem: [
      'Quem está construindo/reformando e não tem tempo para acompanhar a obra de perto',
      'Investidores que precisam de relatórios independentes de progresso',
      'Quem quer auditar o orçamento e medições apresentados pela construtora',
    ],
    voce_precisa: [
      'Fornecer o projeto/escopo da obra',
      'Informar a construtora/equipe responsável pela execução',
      'Definir a periodicidade dos relatórios (semanal/quinzenal/mensal)',
    ],
    entregaveis: [
      'Cronograma físico-financeiro da obra',
      'Orçamento referenciado pela tabela SINAPI',
      'Relatórios fotográficos periódicos de progresso',
      'Apontamento de não conformidades identificadas',
    ],
    nao_inclui: [
      'Execução da obra ou mão de obra',
      'Compra de materiais',
      'Responsabilidade legal pela execução (permanece da construtora/empreiteira)',
    ],
  },
  SVC010: {
    icone: '⚖️',
    o_que_e: 'Elaboração de laudo técnico pericial para processos judiciais, respondendo aos quesitos do juízo e das partes com fundamentação normativa, conforme o CPC/2015.',
    para_quem: [
      'Advogados e partes em processos que envolvem questões de engenharia/construção',
      'Quem foi nomeado perito e precisa de apoio técnico especializado',
      'Quem precisa de assistente técnico em uma ação judicial',
    ],
    voce_precisa: [
      'Fornecer os autos/quesitos do processo (ou trecho relevante)',
      'Garantir acesso ao imóvel/objeto da perícia, quando aplicável',
      'Informar o prazo determinado pelo juízo',
    ],
    entregaveis: [
      'Laudo pericial respondendo aos quesitos das partes e do juízo',
      'Fundamentação técnica com referências normativas (NBR/ABNT)',
      'Fotos e croquis de suporte',
      'Assinatura digital ICP-Brasil + ART',
    ],
    nao_inclui: [
      'Representação jurídica ou aconselhamento legal',
      'Comparecimento em audiência (pode ser contratado separadamente)',
    ],
  },
  SVC011: {
    icone: '🔍',
    o_que_e: 'Auditoria técnica completa de um imóvel ou empreendimento antes de uma decisão de investimento — análise documental, vistoria e matriz de riscos.',
    para_quem: [
      'Investidores avaliando a compra de um imóvel ou empreendimento',
      'Empresas em processo de aquisição de ativos imobiliários',
      'Fundos imobiliários que precisam de laudo de risco antes do aporte',
    ],
    voce_precisa: [
      'Fornecer acesso à documentação do imóvel (matrícula, habite-se, AVCB, IPTU)',
      'Garantir acesso para vistoria de todos os sistemas da edificação',
      'Informar o contexto da operação (compra, locação, aporte)',
    ],
    entregaveis: [
      'Análise documental completa',
      'Vistoria técnica com registro fotográfico de todos os sistemas',
      'Matriz de riscos (probabilidade × impacto)',
      'Sumário executivo com recomendações para a decisão de investimento',
      'ART/RRT registrada',
    ],
    nao_inclui: [
      'Negociação dos termos da operação',
      'Avaliação financeira/contábil do negócio (foco técnico-construtivo)',
    ],
  },
}
