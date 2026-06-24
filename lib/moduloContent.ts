// lib/moduloContent.ts
// Conteúdo rico dos módulos SUEDPrepara — guia prático por SVC

export interface Secao {
  titulo: string
  itens: string[]
}

export interface ModuloConteudoRico {
  // Teoria base (já existia)
  objetivos: string[]
  topicos: { titulo: string; itens: string[] }[]
  svcsHabilitados: string[]
  nota?: string
  // Novo: conteúdo prático
  passo_a_passo: { titulo: string; etapas: string[] }[]
  pode_nao_pode: { pode: string[]; nao_pode: string[] }
  autoconfianca: { titulo: string; dicas: string[] }[]
  erros_comuns: { erro: string; por_que_acontece: string; como_evitar: string }[]
  templates: { nome: string; descricao: string; tipo: 'checklist' | 'modelo' | 'referencia' }[]
}

export const MODULO_RICO: Record<string, ModuloConteudoRico> = {

  // ── M1: Fundamentos SUEDFLOW ─────────────────────────────────
  m1: {
    objetivos: [
      'Entender o fluxo completo de uma demanda — do aceite à entrega — sem surpresas',
      'Saber o que comunicar ao cliente em cada etapa e como fazer isso',
      'Conhecer o sistema SQP e usá-lo a favor da sua carreira na plataforma',
      'Evitar os erros que fazem profissionais perderem pontos SQP nos primeiros meses',
    ],
    topicos: [
      {
        titulo: 'O fluxo de uma demanda na prática',
        itens: [
          'AGUARDANDO → você aparece no feed e pode aceitar',
          'ACEITA → você aceitou e propôs desconto (0% a 15%); cliente tem 48h para pagar',
          'PAGA → dinheiro em escrow; você pode começar; faça check-in ao chegar no local',
          'EM_EXECUCAO → execute, registre marcos, comunique ao cliente',
          'AGUARDANDO_QA → você enviou o entregável; curador revisa antes do cliente ver',
          'AGUARDANDO_CONFIRMACAO → curador aprovou; cliente tem 48h para confirmar ou disputar',
          'CONCLUIDA → pagamento liberado para seu saldo; avaliação registrada no SQP',
        ],
      },
      {
        titulo: 'O que é o SQP e por que importa',
        itens: [
          'SQP é seu score de 0 a 1000, recalculado toda noite às 02h',
          'Sobe com: entregas no prazo (+), avaliação alta do cliente (+), QA aprovado de primeira (+)',
          'Cai com: atraso, QA reprovado (−40 pts), cancelamento por conveniência (−30 pts)',
          'Níveis: CANDIDATO (0–199) → JUNIOR → PLENO → SENIOR → ELITE (800+)',
          'Cada nível reduz sua comissão — ELITE no plano ELITE paga 15% (mínimo absoluto)',
        ],
      },
    ],
    svcsHabilitados: ['Todas as demandas do marketplace (pré-requisito)'],
    nota: 'M1 é o único módulo obrigatório antes de aceitar qualquer demanda. Os demais habilitam SVCs específicos.',
    passo_a_passo: [
      {
        titulo: 'Primeiras 24h após aceitar uma demanda',
        etapas: [
          'Confirme no chat que recebeu a demanda e que entrará em contato para agendar a visita',
          'Verifique o prazo de entrega (campo "prazo_entrega") e calcule se é viável',
          'Acesse o endereço no Google Maps para estimar deslocamento e acesso',
          'Contate o cliente para confirmar disponibilidade de acesso ao imóvel',
          'Se houver qualquer impedimento (acesso negado, prazo curto), comunique ANTES de aceitar o escopo',
        ],
      },
      {
        titulo: 'No dia da visita ao imóvel',
        etapas: [
          'Chegue no horário combinado — atraso sem comunicação prévia é penalizado no SQP',
          'Ao chegar, registre o check-in GPS com selfie na plataforma (obrigatório para EM_EXECUCAO)',
          'Fotografe o imóvel ANTES de entrar — estado da fachada, portão, área externa',
          'Percorra todos os ambientes sistematicamente — nunca aleatoriamente',
          'Fotografe cada ambiente pelo menos uma vez, patologias com closeup e referência de escala',
          'Ao sair, registre o marco CHECK_OUT com foto pós-execução',
        ],
      },
      {
        titulo: 'Submissão do entregável',
        etapas: [
          'Organize o laudo em PDF — máximo 20MB, em Portuguese técnico mas acessível',
          'Inclua: cabeçalho com seus dados + ART/RRT, identificação do imóvel, corpo técnico, conclusão',
          'Registre o marco ART_ATIVA com número do protocolo da sua ART antes de submeter',
          'Suba o PDF pelo botão "Enviar entregável" — o curador irá revisá-lo antes do cliente ver',
          'Aguarde o retorno do curador — se reprovar, você receberá feedback detalhado para corrigir',
        ],
      },
    ],
    pode_nao_pode: {
      pode: [
        'Oferecer desconto de 0% a 15% sobre o preço calculado ao aceitar',
        'Solicitar prorrogação de prazo ANTES do vencimento, via chat',
        'Pedir documentos adicionais ao cliente pelo chat da demanda',
        'Rejeitar uma demanda antes de aceitar (simplesmente não aceite)',
        'Comunicar paralisação se houver impedimento técnico real (ex: acesso negado)',
        'Contestar o resultado do AVC com justificativa técnica antes de reenviar',
      ],
      nao_pode: [
        'Solicitar pagamento, Pix ou transferência fora da plataforma — é motivo de banimento',
        'Cancelar após aceitar sem motivo técnico justificado — aplica −30 pts SQP',
        'Ampliar o escopo do serviço sem novo contrato — "já que estou aqui vou fazer mais" gera disputa',
        'Deixar de comunicar impedimentos e esperar o prazo vencer — piora o SQP mais',
        'Usar o chat para assuntos pessoais ou fora do contexto da demanda',
        'Compartilhar dados do cliente (endereço, documentos) com terceiros',
      ],
    },
    autoconfianca: [
      {
        titulo: 'Como se apresentar ao cliente no primeiro contato',
        dicas: [
          'Use sempre o chat da plataforma — nunca WhatsApp pessoal. Isso protege você juridicamente.',
          'Seja direto: "Olá, sou [seu nome], engenheiro responsável pela sua demanda SF-XXXX. Podemos confirmar o acesso ao imóvel para [data]?"',
          'Não explique o preço nem justifique sua formação neste momento — o contrato já está fechado',
          'Se o cliente fizer perguntas técnicas complexas no chat, responda: "Vou incluir isso no laudo com a devida fundamentação técnica"',
          'Tom: profissional e objetivo. Nem informal demais, nem distante demais.',
        ],
      },
      {
        titulo: 'Como lidar com clientes que questionam seu laudo',
        dicas: [
          'Agradeça a leitura e pergunte qual ponto específico gerou dúvida',
          'Cite a norma que fundamenta sua conclusão: "Conforme a ABNT NBR [X], a classificação correta é [Y]"',
          'Nunca mude uma conclusão técnica por pressão — mude só se encontrar erro factual',
          'Se o cliente insistir após sua resposta técnica, oriente a abrir disputa — não ceda',
          'Documente toda a comunicação no chat. Isso é sua defesa em caso de disputa.',
        ],
      },
    ],
    erros_comuns: [
      {
        erro: 'Aceitar a demanda sem ler o prazo e a área',
        por_que_acontece: 'Ansiedade de pegar a demanda rápido antes de outro profissional',
        como_evitar: 'Leia sempre: SVC, área_m2, urgência, prazo_entrega e cidade. 30 segundos salvam uma reprovação.',
      },
      {
        erro: 'Não fazer check-in GPS ao chegar no imóvel',
        por_que_acontece: 'Esquecer no início da visita, lembrar só no final',
        como_evitar: 'Check-in é o PRIMEIRO ato ao chegar. Antes de tirar qualquer foto, já registre.',
      },
      {
        erro: 'Entregar o laudo sem ART registrada',
        por_que_acontece: 'Profissional emite a ART depois de fazer o trabalho',
        como_evitar: 'Registre o marco ART_ATIVA com o protocolo ANTES de submeter o entregável.',
      },
      {
        erro: 'Comunicar problemas só quando o prazo já passou',
        por_que_acontece: 'Esperança de resolver sem precisar comunicar',
        como_evitar: 'Comunicação preventiva no chat quando aparecer qualquer impedimento. Peça prorrogação ANTES.',
      },
    ],
    templates: [
      { nome: 'Checklist pré-visita', descricao: 'O que levar e verificar antes de ir ao imóvel', tipo: 'checklist' },
      { nome: 'Roteiro de comunicação com cliente', descricao: 'Mensagens padrão para cada etapa da demanda', tipo: 'modelo' },
      { nome: 'Guia de fotos obrigatórias por SVC', descricao: 'Referência visual do que fotografar em cada serviço', tipo: 'referencia' },
    ],
  },

  // ── M2: Avaliação Mercadológica NBR 14653 ────────────────────
  m2: {
    objetivos: [
      'Realizar uma avaliação mercadológica correta e defensável usando a NBR 14653',
      'Coletar e tratar amostras de forma rigorosa (Grau II mínimo exigido na plataforma)',
      'Estruturar o PTAM conforme o padrão de entrega do SUEDFLOW',
      'Comunicar o resultado da avaliação ao cliente com clareza e segurança',
    ],
    topicos: [
      {
        titulo: 'Hierarquia de métodos — quando usar cada um',
        itens: [
          'Método Comparativo Direto (obrigatório para imóveis urbanos residenciais e comerciais)',
          'Método Evolutivo: quando não há comparativos suficientes no mercado (áreas muito específicas)',
          'Método da Renda: apenas para imóveis de base locativa (prédios comerciais, galpões alugados)',
          'Na prática da plataforma: 90% dos casos usarão o Comparativo Direto',
        ],
      },
      {
        titulo: 'O que define Grau I, II e III',
        itens: [
          'Grau I: mínimo 3 amostras, sem tratamento estatístico rigoroso — NÃO aceito na plataforma',
          'Grau II (mínimo exigido): 5+ amostras, homogeneização com fatores explícitos, campo de arbítrio ±15%',
          'Grau III: 8+ amostras, tratamento estatístico (inferência), para laudos de maior valor e complexidade',
          'O Grau é declarado no laudo e conferido pelo curador — erro de grau = reprovação no QA',
        ],
      },
    ],
    svcsHabilitados: ['SVC002 — Avaliação Mercadológica NBR 14653 (piso R$ 1.080)'],
    passo_a_passo: [
      {
        titulo: 'Antes de ir ao imóvel',
        etapas: [
          'Pesquise o bairro no VivaReal, OLX Imóveis e Imovelweb — identifique o nível de oferta',
          'Anote 8 a 10 anúncios de comparativos antes de visitar (filtre por: mesma zona, tipo similar, área ±30%)',
          'Verifique o IPTU e a matrícula se o cliente enviar — identificam área oficial e restrições',
          'Consulte a planta de zoneamento do município para entender potencial construtivo',
          'Monte um roteiro fotográfico: fachada, frente, fundos, sala, quartos, cozinha, banheiro, área externa',
        ],
      },
      {
        titulo: 'Na vistoria do imóvel avaliando',
        etapas: [
          'Meça as áreas presencialmente se não houver planta — área construída é critério de homogeneização',
          'Fotografe 15+ fotos: mínimo 1 por ambiente e 3 da fachada (frente, lateral, fundo se possível)',
          'Anote padrão de acabamento (baixo/normal/alto) e estado de conservação (péssimo a ótimo)',
          'Registre características especiais: piscina, área gourmet, garagem, andar, vista',
          'Se o imóvel tiver patologias relevantes, fotografe e anote — influenciam o fator de conservação',
        ],
      },
      {
        titulo: 'Montagem do PTAM',
        etapas: [
          'Use uma planilha ou template com: endereço, área, valor, valor unitário (R$/m²) para cada amostra',
          'Aplique fatores de homogeneização: localização (Fator Pedestre/Bairro), área (Fator Área), padrão, conservação',
          'Calcule valor médio e desvio padrão das amostras homogeneizadas — aplique campo de arbítrio se necessário',
          'Declare o Grau de Fundamentação no laudo e justifique a escolha de cada fator',
          'Conclusão: valor unitário (R$/m²) × área real = valor total conclusivo com data-base',
        ],
      },
    ],
    pode_nao_pode: {
      pode: [
        'Usar anúncios de portais como comparativos, desde que identifique fonte e data da pesquisa',
        'Aplicar campo de arbítrio de até ±15% sobre o valor calculado, com justificativa',
        'Solicitar documentação ao cliente via chat (matrícula, IPTU, planta) antes da vistoria',
        'Recomendar avaliação de Grau III se o imóvel for muito atípico ou de alto valor',
        'Alertar o cliente se identificar divergência entre área real e área no IPTU',
      ],
      nao_pode: [
        'Usar amostras sem identificar fonte, endereço e data — curador vai reprovar',
        'Apresentar valor sem declarar Grau de Fundamentação e campo de arbítrio utilizado',
        'Basear a avaliação em uma única amostra, independente da justificativa',
        'Emitir laudo sem ART/RRT registrada no CREA/CAU',
        'Incluir opinião sobre se o cliente deve ou não comprar — você avalia, não aconselha financeiramente',
        'Usar amostras de mais de 12 meses sem atualização monetária justificada',
      ],
    },
    autoconfianca: [
      {
        titulo: 'Como explicar o valor do laudo para um cliente que esperava mais (ou menos)',
        dicas: [
          'Nunca se desculpe pelo valor — você aplicou metodologia técnica rigorosa',
          '"O valor de R$ X foi calculado com base em [N] comparativos reais do mercado de [bairro], utilizando a metodologia ABNT NBR 14653."',
          'Se o cliente esperava mais: "O mercado atual da região mostra essa faixa — posso detalhar qualquer amostra se desejar."',
          'Se o cliente pedir para "ajustar" o valor para cima: NÃO FAÇA. Explique que laudo com valor adulterado invalida sua ART e gera processo criminal.',
          'Ofereça revisar apenas se encontrar erro factual — não por pressão.',
        ],
      },
      {
        titulo: 'Como se posicionar quando o cliente compara com outro laudo',
        dicas: [
          'Peça para ver o outro laudo — na maioria das vezes ele não tem Grau de Fundamentação declarado',
          'Compare as amostras utilizadas — muitas vezes o outro laudo usa dados desatualizados ou sem homogeneização',
          'Explique que diferenças de até 15% entre avaliadores são normais e técnicamente aceitáveis',
          'Jamais critique o trabalho do colega diretamente — cite as normas que embasam seu método',
        ],
      },
    ],
    erros_comuns: [
      {
        erro: 'Usar amostras de bairros diferentes sem fator de localização',
        por_que_acontece: 'Dificuldade de encontrar comparativos no mesmo bairro',
        como_evitar: 'Use fator de localização (pedestre) para corrigir. Documente e justifique no laudo.',
      },
      {
        erro: 'Usar campo de arbítrio sem justificar',
        por_que_acontece: 'Profissional quer ajustar o valor mas não explica o porquê',
        como_evitar: 'O campo de arbítrio precisa de justificativa técnica: "aplicado ±X% em razão de [característica específica do avaliando]".',
      },
      {
        erro: 'Não declarar a data-base da avaliação',
        por_que_acontece: 'Esquecimento ou desconhecimento da importância',
        como_evitar: 'A data-base é o dia da vistoria ou da pesquisa de mercado. Sempre declare. Sem ela, o laudo pode ser contestado.',
      },
      {
        erro: 'Enviar laudo sem Declaração de ART/RRT',
        por_que_acontece: 'Falta de hábito ou ART emitida depois da entrega',
        como_evitar: 'ART é emitida ANTES da execução. Registre o número no marco ART_ATIVA antes de submeter.',
      },
    ],
    templates: [
      { nome: 'Planilha de homogeneização (modelo)', descricao: 'Tabela de amostras com fatores e cálculo de valor médio', tipo: 'modelo' },
      { nome: 'Estrutura do PTAM SUEDFLOW', descricao: 'Seções obrigatórias e ordem de apresentação', tipo: 'checklist' },
      { nome: 'Fatores de homogeneização NBR 14653', descricao: 'Referência rápida de fatores mais usados', tipo: 'referencia' },
    ],
  },

  // ── M3: Inspeção Predial NBR 16.747 ──────────────────────────
  m3: {
    objetivos: [
      'Executar uma inspeção predial sistemática com cobertura completa da edificação',
      'Identificar, fotografar e classificar anomalias pelo grau de risco correto',
      'Estruturar o relatório de inspeção conforme padrão SUEDFLOW e NBR 16.747',
      'Comunicar achados críticos ao cliente com objetividade — sem criar pânico nem minimizar',
    ],
    topicos: [
      {
        titulo: 'Rota de inspeção sistemática',
        itens: [
          'Comece SEMPRE pela cobertura e siga descendo — infiltrações se manifestam de cima para baixo',
          'Fachada: percorra todo o perímetro externo, observando fissuras, manchas, desplacamentos',
          'Estrutura: pilares, vigas, lajes — observe exposição de ferragem, fissuras em diagonal (cisalhamento)',
          'Instalações: quadro elétrico (disjuntores, aterramento), caixas d\'água (limpeza, tampas), ETE',
          'Áreas comuns: piso, revestimento, iluminação de emergência, SPDA, PPCI (extintores, mangueiras)',
          'Subsolo/pilotis: umidade ascendente, eflorescências, recalque de piso',
        ],
      },
      {
        titulo: 'Classificação de risco na prática',
        itens: [
          'Risco CRÍTICO: qualquer risco iminente de colapso, incêndio ou acidente grave → intervenção imediata',
          'Risco MODERADO: risco à segurança ou saúde dos usuários, mas não imediato → até 30 ou 90 dias',
          'Risco MÍNIMO: problemas estéticos ou funcionais que não afetam segurança → manutenção anual',
          'Dúvida entre crítico e moderado? Classifique como crítico. O curador pode reclassificar para baixo, mas você nunca subestime.',
          'Risco crítico obriga você a comunicar o cliente imediatamente — não espere o laudo estar pronto',
        ],
      },
    ],
    svcsHabilitados: ['SVC003 — Inspeção Predial NBR 16.747 (piso R$ 1.350)'],
    passo_a_passo: [
      {
        titulo: 'Preparação para a inspeção',
        etapas: [
          'Solicite ao cliente projetos existentes (arquitetônico, instalações, SPDA, PPCI) — melhoram muito a qualidade',
          'Leve: capacete, lanterna, trena a laser, câmera com boa qualidade em baixa luz, prancheta',
          'Verifique se terá acesso à cobertura, barrilete, telhado e subestação — bloqueios precisam ser registrados',
          'Saiba antes o uso do imóvel: residencial, comercial, misto — isso muda a criticidade de algumas anomalias',
          'Confirme quem será seu acompanhante no imóvel — síndico, zelador, proprietário',
        ],
      },
      {
        titulo: 'Durante a inspeção',
        etapas: [
          'Fotografe cada anomalia com: visão geral (contexto) + closeup (detalhe) + referência de escala',
          'Numere as anomalias sequencialmente (01, 02, 03…) — o mesmo número aparece na tabela e nas fotos',
          'Para fissuras: fotografe com uma régua milimetrada encostada — abertura importa na classificação',
          'Para umidade: registre se há mofo visível, descascamento ou salitre — cada um indica origem diferente',
          'Anote o sistema afetado para cada anomalia: estrutural, fachada, cobertura, elétrico, hidráulico, etc.',
          'Se encontrar risco crítico: informe o cliente (ou síndico) imediatamente no local, antes de sair',
        ],
      },
      {
        titulo: 'Estrutura do relatório',
        etapas: [
          'Cabeçalho: dados do imóvel, data da inspeção, finalidade, profissional responsável + ART',
          'Escopo: o que foi e o que NÃO foi inspecionado (ex: "subestação sem acesso")',
          'Tabela-resumo: nº ref | sistema | local | anomalia | grau de risco | recomendação | prazo',
          'Cronograma: organize as recomendações em: imediato / 30 dias / 90 dias / manutenção anual',
          'Fotos: uma seção por sistema, com número de referência correspondente à tabela',
          'Conclusão: nível geral de conservação do imóvel (ótimo / bom / regular / precário / crítico)',
        ],
      },
    ],
    pode_nao_pode: {
      pode: [
        'Alertar o cliente sobre risco crítico no local, verbalmente, antes de sair',
        'Incluir recomendação de ensaios adicionais (esclerometria, GPR) se necessário',
        'Registrar no laudo os sistemas aos quais não teve acesso',
        'Clasificar uma anomalia funcional como moderada se ela afetar habitabilidade',
        'Recomendar laudos complementares de especialistas (SPDA, PPCI, estruturas especiais)',
      ],
      nao_pode: [
        'Emitir laudo de inspeção predial sem ter feito a vistoria presencial',
        'Omitir anomalias que o síndico pediu para "não colocar" — você responde tecnicamente',
        'Classificar como mínimo um problema que tem potencial de risco a usuários',
        'Calcular o custo dos reparos — inspeção predial não é orçamento de obra',
        'Assumir responsabilidade pela execução das manutenções recomendadas',
        'Inspecionar sem ART específica para inspeção predial (categoria diferente da de projeto)',
      ],
    },
    autoconfianca: [
      {
        titulo: 'Como comunicar risco crítico ao cliente sem criar pânico',
        dicas: [
          '"Encontrei uma situação que requer atenção imediata. Não é uma emergência para desocupar agora, mas precisa ser avaliada por um engenheiro estrutural em até X dias."',
          'Seja específico: "A fissura diagonal no pilar P-3 próximo à escada tem abertura de 3mm e sugere esforço de cisalhamento."',
          'Sempre diga o que fazer, não apenas o que está errado: "Recomendo contato com engenheiro estrutural para avaliação detalhada e emissão de laudo estrutural."',
          'Documente que comunicou no chat — isso protege você se o cliente não tomar providências',
          'Nunca use linguagem de apocalipse: "vai cair" ou "está condenado" sem laudo estrutural que confirme',
        ],
      },
      {
        titulo: 'Como lidar com síndico ou proprietário que tenta minimizar os achados',
        dicas: [
          'Explique que sua responsabilidade técnica (ART) obriga a registrar o que você viu',
          '"Entendo sua preocupação, mas como responsável técnico por este laudo, preciso registrar tudo que identificar. O laudo também protege o condomínio juridicamente."',
          'Se o cliente pedir para remover anomalias do laudo: recuse com firmeza e gentileza',
          'Registre no chat da demanda que houve solicitação de omissão — proteção jurídica sua',
        ],
      },
    ],
    erros_comuns: [
      {
        erro: 'Não inspecionar a cobertura "porque não tinha acesso"',
        por_que_acontece: 'Síndico não abriu a sala de máquinas ou telhado inacessível',
        como_evitar: 'Registre no laudo: "Cobertura não acessada por [motivo]. Recomenda-se acesso posterior para inspeção complementar."',
      },
      {
        erro: 'Fotos sem número de referência ou sem contexto',
        por_que_acontece: 'Fotografia em excesso sem organização',
        como_evitar: 'Para cada anomalia: foto geral (câmera atrás) + closeup (câmera perto). Ambas com o número de referência no nome do arquivo.',
      },
      {
        erro: 'Não fazer cronograma de intervenção',
        por_que_acontece: 'Achado que relacionar só grau de risco já é suficiente',
        como_evitar: 'O cronograma é o que o cliente vai usar para agir. Sem cronograma, o laudo fica incompleto no QA.',
      },
    ],
    templates: [
      { nome: 'Tabela-resumo de anomalias', descricao: 'Formato padrão para o relatório de inspeção predial', tipo: 'modelo' },
      { nome: 'Cronograma de intervenção', descricao: 'Modelo de cronograma: imediato / 30d / 90d / anual', tipo: 'modelo' },
      { nome: 'Checklist de sistemas a inspecionar', descricao: 'Lista completa de itens por sistema predial', tipo: 'checklist' },
    ],
  },

  // ── M4: Projetos de Engenharia ───────────────────────────────
  m4: {
    objetivos: [
      'Elaborar projetos técnicos compatíveis com as normas ABNT aplicáveis e com as exigências municipais',
      'Estruturar a entrega de projetos no padrão SUEDFLOW (PDF + DWG + ART)',
      'Gerenciar revisões do cliente sem perder tempo nem comprometer a qualidade',
      'Entender os limites de cada SVC de projeto — o que está e o que não está no escopo',
    ],
    topicos: [
      {
        titulo: 'O que o cliente precisa fornecer antes de você começar',
        itens: [
          'Levantamento topográfico ou planta do terreno (para SVC004 Projeto Arquitetônico)',
          'Programa de necessidades: o que o cliente quer no imóvel (cômodos, usos, fluxos)',
          'Restrições legais do lote: recuos, taxa de ocupação, gabarito (obtenha na prefeitura se não tiver)',
          'Para SVC005: projeto arquitetônico aprovado/finalizado — você não faz a arquitetura',
          'Para SVC006/007: planta arquitetônica atualizada com pontos elétricos/hidráulicos desejados',
        ],
      },
      {
        titulo: 'Compatibilização entre projetos',
        itens: [
          'Nunca entregue projeto elétrico ou hidráulico sem verificar conflito com a estrutura',
          'Shafts, passagens de tubulação e dutos devem estar na planta arquitetônica atualizada',
          'Um erro de compatibilização descoberto na obra custa 10x mais do que no projeto',
          'Se não tiver o projeto de outra disciplina, registre no memorial: "Compatibilização pendente com [disciplina]"',
        ],
      },
    ],
    svcsHabilitados: [
      'SVC004 — Projeto Arquitetônico (piso R$ 1.530)',
      'SVC005 — Projeto Estrutural (piso R$ 1.530)',
      'SVC006 — Projeto Elétrico (piso R$ 935)',
      'SVC007 — Projeto Hidrossanitário (piso R$ 935)',
      'SVC008 — Regularização de Imóvel (piso R$ 830)',
    ],
    passo_a_passo: [
      {
        titulo: 'Do briefing ao projeto inicial',
        etapas: [
          'Faça uma reunião de briefing (pode ser via chat) — entenda o objetivo do cliente, orçamento previsto, prazo de início de obra',
          'Visite o terreno/imóvel se possível — a visita presencial evita surpresas de medição',
          'Verifique na prefeitura: zoneamento, taxa de ocupação, coeficiente de aproveitamento, recuos mínimos',
          'Defina um partido arquitetônico ou conceito estrutural antes de detalhar — cliente aprova a direção antes do todo',
          'Apresente um esboço ou layout inicial para aprovação antes de desenvolver o projeto completo',
        ],
      },
      {
        titulo: 'Desenvolvimento e entrega',
        etapas: [
          'Desenvolva plantas, cortes e fachadas em CAD — mínimo 1:50 para residências, 1:100 para maiores',
          'Cote todos os ambientes e aberturas — dimensões sem cota geram revisões',
          'Monte o memorial descritivo com especificação de materiais, sistemas e acabamentos',
          'Emita a ART ANTES de entregar o projeto ao cliente — a ART formaliza o vínculo técnico',
          'Exporte PDF com toda a prancha + arquivo DWG editável — ambos são obrigatórios no SUEDFLOW',
          'Submeta pelo botão "Enviar entregável" — o curador revisará a qualidade antes do cliente receber',
        ],
      },
      {
        titulo: 'Gerenciando revisões',
        etapas: [
          'Revisões de escopo (cliente quer mudar o que foi combinado) não são gratuitas — registre no chat',
          'Revisões técnicas (erro seu) são de sua responsabilidade sem custo adicional',
          'Limite as revisões incluídas no contrato: "O escopo inclui até 2 ciclos de revisão de layout"',
          'Sempre confirme a aprovação via chat antes de partir para o detalhamento final',
          'Se o cliente aprovar e depois querer reverter, o chat serve como prova do aceite',
        ],
      },
    ],
    pode_nao_pode: {
      pode: [
        'Solicitar elementos adicionais ao cliente antes de começar (topografia, memorial do terreno)',
        'Propor alternativas de projeto se a primeira proposta for tecnicamente inviável',
        'Alertar o cliente sobre impossibilidades legais antes de começar (ex: recuo insuficiente)',
        'Cobrar revisão adicional se o cliente alterar o escopo aprovado',
        'Registrar no laudo/memorial incompatibilidades com projetos de outras disciplinas que não teve acesso',
      ],
      nao_pode: [
        'Começar a desenvolver o projeto sem ter as informações mínimas do cliente',
        'Alterar o programa de necessidades aprovado sem comunicação e aprovação pelo chat',
        'Entregar projeto sem ART — a responsabilidade técnica é obrigatória',
        'Entregar apenas PDF sem DWG — o cliente precisa do arquivo editável',
        'Fazer projeto de uma especialidade que não é sua formação (engenheiro elétrico não faz estrutural)',
        'Omitir restrições legais que tornam o projeto inviável — documentar e alertar é parte do serviço',
      ],
    },
    autoconfianca: [
      {
        titulo: 'Como conduzir a aprovação do cliente em cada fase',
        dicas: [
          'Divida em fases claras: Estudo Preliminar → Anteprojeto → Projeto Executivo. Aprove cada fase antes de avançar.',
          'Use linguagem visual: "Aqui está o esboço do layout. O que você acha desta solução para a circulação?"',
          'Quando o cliente não entender uma decisão técnica: "Coloquei a viga aqui pois não podemos abrir vão maior nesta direção pela estrutura existente."',
          'Evite jargão técnico excessivo com clientes leigos — use analogias e referências visuais',
          'Registre aprovações no chat: "Confirmo que você aprovou o layout da planta baixa conforme enviado em [data]"',
        ],
      },
    ],
    erros_comuns: [
      {
        erro: 'Entregar projeto sem cotas',
        por_que_acontece: 'Pressa na entrega ou hábito de projetos internos',
        como_evitar: 'Toda planta entregue ao cliente precisa ter cotas de todos os ambientes, paredes e aberturas. Sem cotas, o pedreiro não executa.',
      },
      {
        erro: 'Não verificar o zoneamento antes de projetar',
        por_que_acontece: 'Confia no cliente que disse que "pode construir"',
        como_evitar: 'Consulte o mapa de zoneamento da prefeitura ou o site da Secretaria de Urbanismo. Um projeto reprovado na prefeitura gera QA reprovado.',
      },
      {
        erro: 'Emitir ART depois de entregar o projeto',
        por_que_acontece: 'Deixa para o último momento ou aguarda o pagamento para emitir',
        como_evitar: 'A ART deve ser emitida antes da entrega. É o registro de responsabilidade que antecede o serviço, não que o confirma.',
      },
    ],
    templates: [
      { nome: 'Checklist de entrega de projeto', descricao: 'Itens obrigatórios por tipo de projeto antes de submeter', tipo: 'checklist' },
      { nome: 'Memorial descritivo padrão', descricao: 'Estrutura de memorial para projetos arquitetônicos', tipo: 'modelo' },
      { nome: 'Quadro de áreas NBR 12721', descricao: 'Modelo de quadro de áreas para projetos residenciais', tipo: 'modelo' },
    ],
  },

  // ── M5: Gerenciamento de Obras e SINAPI ──────────────────────
  m5: {
    objetivos: [
      'Planejar e controlar obras usando referências SINAPI com rigor e rastreabilidade',
      'Elaborar relatórios de progresso que efetivamente protejam o cliente e o responsável técnico',
      'Identificar e comunicar desvios de prazo e custo sem criar conflito desnecessário',
      'Entender os limites da sua responsabilidade como gerenciador — e o que é da construtora',
    ],
    topicos: [
      {
        titulo: 'O que é gerenciar x o que é executar',
        itens: [
          'Gerenciador: planeja, controla, mede, reporta, aponta desvios — mas NÃO executa',
          'Construtora/empreiteira: executa a obra e é responsável pelo que foi feito',
          'Você assina ART de gerenciamento, não de execução — são categorias diferentes no CREA',
          'Se você identificar irregularidade, registra e comunica — não conserta você mesmo',
          'Sua responsabilidade técnica: o relatório foi fiel ao que viu? O SINAPI está correto? O cronograma é real?',
        ],
      },
      {
        titulo: 'Como usar o SINAPI na prática',
        itens: [
          'Acesse: caixa.gov.br/SINAPI — tabela do seu estado (PB, PE, CE…) do mês atual',
          'Use sempre: tabela NÃO-DESONERADA para obras privadas (desonerada é para obras públicas com regime tributário específico)',
          'Identifique o código correto: SINAPI tem composições de serviço e insumos separados — use composições',
          'Para itens sem composição SINAPI: apresente 3 cotações com fornecedor identificado, data e valor',
          'SINAPI não inclui BDI — declare separadamente (geralmente 20-25% para obras privadas, com justificativa)',
        ],
      },
    ],
    svcsHabilitados: ['SVC009 — Gerenciamento de Obras / SINAPI (piso R$ 1.020)'],
    passo_a_passo: [
      {
        titulo: 'Antes de iniciar o gerenciamento',
        etapas: [
          'Obtenha o projeto executivo completo e o contrato de obra — compare escopo com o que está sendo executado',
          'Faça uma visita inicial de reconhecimento: fotografe o estado atual (antes de qualquer intervenção)',
          'Solicite o cronograma físico-financeiro da construtora — se não existir, elabore um junto com ela',
          'Verifique se há ART de execução da construtora — sem ela, você não pode gerenciar algo que não tem responsável técnico',
          'Defina junto ao cliente a frequência de visitas e relatórios: semanal, quinzenal ou mensal',
        ],
      },
      {
        titulo: 'Durante as visitas de obra',
        etapas: [
          'Leve prancheta com checklist de serviços previstos para o período — compare previsto × executado',
          'Fotografe cada serviço medido: foto geral + medição visível (fita, marcação)',
          'Registre no Diário de Obra: data, efetivo (quantos trabalhadores), serviços executados, ocorrências',
          'Para cada desvio de prazo ou custo: registre, quantifique e comunique ao cliente no relatório',
          'Se identificar irregularidade técnica (concreto com vazios, armadura exposta sem cobrimento): registre e notifique imediatamente',
        ],
      },
      {
        titulo: 'Relatório de medição',
        etapas: [
          'Planilha com: serviço | unidade | quantidade prevista | quantidade medida | % executado | valor medição',
          'Fotos de referência para cada serviço medido — curador e cliente precisam ver o que você mediu',
          'Comparativo: previsto no cronograma × executado no período. Se atrasado, explique o motivo',
          'Assinatura do relatório com ART de gerenciamento vinculada',
          'Envio ao cliente pelo chat da demanda — não por e-mail externo',
        ],
      },
    ],
    pode_nao_pode: {
      pode: [
        'Alertar o cliente sobre riscos de prazo ou custo antes que virem problema',
        'Recusar medição de serviço que não foi executado corretamente — com registro',
        'Solicitar substituição de material especificado em projeto por similar — com justificativa documentada',
        'Recomendar paralisação temporária se houver risco à segurança ou à qualidade',
        'Incluir no relatório serviços executados além do previsto se o cliente autorizou por escrito',
      ],
      nao_pode: [
        'Medir e aprovar serviços que não foram executados — crime de falsa declaração',
        'Assinar relatório sem ter visitado a obra no período coberto',
        'Assumir responsabilidade técnica pelos serviços executados pela construtora',
        'Alterar o cronograma físico-financeiro sem aprovação do cliente',
        'Negociar com construtora em nome do cliente valores fora do contrato',
        'Liberar parcelas do contrato sem medição formalizada',
      ],
    },
    autoconfianca: [
      {
        titulo: 'Como comunicar atraso ao cliente sem criar conflito',
        dicas: [
          'Seja direto: "O cronograma mostra um atraso de X dias nos serviços de [item]. A causa identificada foi [motivo]. Recomendo [ação]."',
          'Nunca minimize atrasos para não "preocupar" o cliente — transparência é o seu diferencial',
          'Sempre sugira a solução ou mitigação junto ao problema: "Para recuperar o prazo, sugiro [alternativa]"',
          'Se a construtora resistir ao apontamento: documente a resistência e reporte ao cliente. Não negocie o laudo.',
        ],
      },
      {
        titulo: 'Como lidar com construtora que questiona sua medição',
        dicas: [
          'Sua medição é baseada em projeto e SINAPI — apresente os fundamentos',
          '"A medição de [serviço] segue a composição SINAPI [código] e o critério de medição [critério da norma ou memorial]"',
          'Discordâncias são normais — resolva com o contrato de obra na mão',
          'Se não houver acordo: registre a divergência no relatório e informe o cliente para decidir',
        ],
      },
    ],
    erros_comuns: [
      {
        erro: 'Fazer relatório sem foto de cada serviço medido',
        por_que_acontece: 'Subestima a importância do registro fotográfico',
        como_evitar: 'Cada linha de medição precisa de pelo menos uma foto que prove que o serviço foi executado naquele período.',
      },
      {
        erro: 'Usar tabela SINAPI desonerada para obra privada',
        por_que_acontece: 'Confusão entre tabelas',
        como_evitar: 'Para obras privadas: sempre tabela NÃO-DESONERADA. Verifique no cabeçalho da planilha qual você está usando.',
      },
      {
        erro: 'Assinar ART de gerenciamento sem ter visitado a obra',
        por_que_acontece: 'Cliente pede urgência e profissional assina por pressão',
        como_evitar: 'Você só pode gerenciar o que visita. ART sem visita é responsabilidade sem conhecimento do objeto.',
      },
    ],
    templates: [
      { nome: 'Planilha de medição SINAPI', descricao: 'Modelo de medição com código SINAPI, quantidade e valor', tipo: 'modelo' },
      { nome: 'Cronograma físico-financeiro', descricao: 'Template de cronograma em barras (Gantt simplificado)', tipo: 'modelo' },
      { nome: 'Diário de Obra', descricao: 'Modelo de registro diário de atividades de obra', tipo: 'modelo' },
    ],
  },

  // ── M6: Perícia Judicial e Due Diligence ─────────────────────
  m6: {
    objetivos: [
      'Elaborar laudos periciais que resistam a questionamentos das partes e do juízo',
      'Conduzir due diligence técnica que entregue real valor a decisões de investimento',
      'Entender os limites do papel do perito — o que pode e o que nunca pode fazer',
      'Comunicar achados técnicos complexos em linguagem acessível para não-técnicos',
    ],
    topicos: [
      {
        titulo: 'Perito x Assistente Técnico — papéis distintos',
        itens: [
          'Perito judicial: nomeado pelo juiz, imparcial, responde a TODAS as partes',
          'Assistente técnico: contratado por uma das partes, pode ter posição — mas baseada em fatos',
          'Você nunca pode ser perito E assistente técnico na mesma ação',
          'Perito recebe honorários fixados pelo juízo; AT recebe da parte que o contratou',
          'A imparcialidade do perito é estrutural — qualquer deslize pode nulificar o laudo e gerar ação contra você',
        ],
      },
      {
        titulo: 'Estrutura de um laudo pericial',
        itens: [
          '1. Identificação: quem nomeou, objeto da perícia, partes do processo, número do processo',
          '2. Histórico: contexto do litígio em linguagem técnica neutra',
          '3. Diligências: o que você visitou, examinou e coletou',
          '4. Metodologia: normas e métodos aplicados',
          '5. Quesitos: responda cada quesito de forma numerada e objetiva — sem omitir nenhum',
          '6. Conclusão: síntese técnica com sua posição fundamentada',
          '7. Assinatura + ART específica de perícia judicial',
        ],
      },
    ],
    svcsHabilitados: [
      'SVC010 — Perícia Judicial (piso R$ 1.800 · SENIOR+ obrigatório + Plano PRO)',
      'SVC011 — Due Diligence Técnica (piso R$ 5.000 · ELITE obrigatório + Plano ELITE)',
    ],
    nota: 'SVC010 e SVC011 exigem nível SQP mínimo SENIOR e ELITE respectivamente. Concluir M6 habilita o módulo; o acesso ao feed depende também do nível SQP e plano.',
    passo_a_passo: [
      {
        titulo: 'Ao receber a nomeação judicial',
        etapas: [
          'Leia o despacho integralmente — identifique prazo, quesitos preliminares e honorários arbitrados',
          'Verifique se o prazo é viável — se não for, solicite prorrogação ANTES do vencimento, com justificativa',
          'Analise se existe impedimento legal para atuar (ex: conhece uma das partes, trabalhou para o réu)',
          'Solicite os autos ou o trecho relevante ao advogado indicado no despacho',
          'Agende a vistoria do objeto com antecedência — aguardar muito pode comprometer o prazo',
        ],
      },
      {
        titulo: 'Executando a perícia',
        etapas: [
          'Realize a diligência com o máximo de rigor documental — cada observação com foto e data',
          'Se houver assistentes técnicos das partes presentes, permita que acompanhem — é direito deles',
          'Colete amostras, documentos ou medições que suportem cada resposta técnica',
          'Não discuta conclusões durante a vistoria — suas conclusões ficam no laudo',
          'Se precisar de especialista de outra área (geotecnia, acústica), informe o juiz antes de contratar',
        ],
      },
      {
        titulo: 'Due Diligence — SVC011',
        etapas: [
          'Análise documental primeiro: matrícula, habite-se, IPTU, AVCB, outorgas, licenças ambientais',
          'Identifique passivos legais: autos de infração, embargos, irregularidades registradas',
          'Vistoria técnica: estrutura, instalações, cobertura, fachada — registe tudo fotograficamente',
          'Avaliação sumária de mercado: estimar valor de referência para comparar com o preço oferecido',
          'Relatório executivo: tabela de riscos (baixo/médio/alto) + estimativa de CAPEX para adequação',
          'Não emita recomendação de compra ou não-compra — você avalia o risco técnico, não a decisão financeira',
        ],
      },
    ],
    pode_nao_pode: {
      pode: [
        'Solicitar prorrogação de prazo ao juiz ANTES do vencimento com motivo técnico fundamentado',
        'Pedir ao juiz autorização para contratar especialistas de outras áreas (laudos complementares)',
        'Responder os quesitos dos assistentes técnicos de forma objetiva e técnica',
        'Incluir observações que o juiz não quesitou, se tecnicamente relevantes para a solução da lide',
        'Recusar quesito manifestamente impertinente — com justificativa técnica clara',
      ],
      nao_pode: [
        'Advogar pela parte que entende ter razão — sua posição é técnica, nunca jurídica',
        'Ser perito e assistente técnico na mesma ação — impedimento legal expresso no CPC',
        'Realizar a perícia sem comunicar ao juízo e às partes a data e local — nulidade do laudo',
        'Emitir laudo sem ter realizado a diligência presencial quando ela for necessária',
        'Reter informações que prejudicam uma das partes — imparcialidade é total',
        'Apresentar laudo fora do prazo sem prorrogação prévia — penalidade por descumprimento de prazo judicial',
      ],
    },
    autoconfianca: [
      {
        titulo: 'Como responder quesitos difíceis com firmeza técnica',
        dicas: [
          'Cada resposta começa com "Sim", "Não" ou "Parcialmente", seguida da fundamentação técnica',
          'Se o quesito pede algo fora da sua competência: "O quesito está fora do objeto periciado / da minha especialidade. Recomendo manifestação de [especialidade]."',
          'Se o quesito é tendencioso (induz resposta): responda tecnicamente, não ceda à formulação',
          '"Com base na análise realizada, a resposta ao quesito [N] é [resposta]. Fundamento: [norma/evidência]."',
          'Nunca responda com "talvez", "provavelmente" sem dados — incerteza técnica deve ser quantificada ou declarada',
        ],
      },
      {
        titulo: 'Como apresentar conclusões de due diligence para um investidor',
        dicas: [
          'Use uma matriz de riscos visual: risco (baixo/médio/alto) × impacto (baixo/médio/alto)',
          'Quantifique em R$ quando possível: "Custo estimado de adequação da subestação: R$ 80.000 a R$ 120.000"',
          '"O imóvel apresenta risco MÉDIO na área de instalações elétricas, que requerem adequação à NR-10 antes da operação."',
          'Separe claramente: o que você viu (fato) × o que você estima (projeção técnica) × o que é incerto (recomendação de ensaios adicionais)',
          'Nunca opine sobre se o negócio é "bom" — isso é do analista financeiro. Você emite risco técnico.',
        ],
      },
    ],
    erros_comuns: [
      {
        erro: 'Deixar quesito sem resposta',
        por_que_acontece: 'Profissional não entende o quesito ou não sabe responder',
        como_evitar: 'Todo quesito precisa de resposta — mesmo que seja "O quesito está fora do objeto desta perícia" ou "Não é possível responder sem [exame adicional]".',
      },
      {
        erro: 'Emitir laudo pericial sem ART de perícia judicial',
        por_que_acontece: 'Confunde com ART de projeto ou de obra',
        como_evitar: 'Perícia judicial tem categoria específica na ART. A finalidade no formulário deve ser "Perícia Judicial — [especialidade]". Verifique no CREA-PB.',
      },
      {
        erro: 'Na due diligence, analisar só a parte documental sem ir ao imóvel',
        por_que_acontece: 'Cliente envia documentos e profissional acha que é suficiente',
        como_evitar: 'Due diligence técnica SEMPRE inclui vistoria presencial. Documentos descrevem o que deveria ser — você verifica o que é.',
      },
    ],
    templates: [
      { nome: 'Estrutura do laudo pericial (CPC/2015)', descricao: 'Modelo de laudo conforme Art. 473 do CPC', tipo: 'modelo' },
      { nome: 'Matriz de riscos — Due Diligence', descricao: 'Tabela de riscos técnicos classificados por probabilidade e impacto', tipo: 'modelo' },
      { nome: 'Checklist de documentos — Due Diligence', descricao: 'Lista de documentos a solicitar antes da vistoria', tipo: 'checklist' },
    ],
  },
}
