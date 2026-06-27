// lib/api.ts — SUEDFLOW Web Frontend
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://suedflow-backend-production.up.railway.app'

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
interface Opts {
  method?: Method
  body?: any
  formData?: FormData
  auth?: boolean
}

export class ApiError extends Error {
  status: number; data: any
  constructor(msg: string, status: number, data: any) { super(msg); this.status = status; this.data = data }
}

async function request<T = any>(path: string, opts: Opts = {}): Promise<T> {
  const { method = 'GET', body, formData, auth = true } = opts
  const headers: Record<string, string> = {}
  if (!formData) headers['Content-Type'] = 'application/json'
  if (auth && typeof window !== 'undefined') {
    const t = localStorage.getItem('suedflow_token')
    if (t) headers['Authorization'] = `Bearer ${t}`
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method, headers,
    body: formData ?? (body ? JSON.stringify(body) : undefined),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401 && auth && typeof window !== 'undefined') {
      tokenStorage.clear()
      userStorage.clear()
      if (!window.location.pathname.startsWith('/auth/')) {
        window.location.href = '/auth/login'
      }
    }
    throw new ApiError(data.error || `HTTP ${res.status}`, res.status, data)
  }
  return data as T
}

export const auth = {
  registrar: (data: any) => request('/api/auth/register', { method: 'POST', body: data, auth: false }),
  login: (email: string, senha: string) =>
    request<{ token: string; usuario: any }>('/api/auth/login', { method: 'POST', body: { email, senha }, auth: false }),
  me: () => request<any>('/api/auth/me'),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  recuperarSenha: (email: string) => request('/api/auth/recuperar-senha', { method: 'POST', body: { email }, auth: false }),
  alterarSenha: (senha_atual: string, nova_senha: string) =>
    request<{ ok: boolean; msg: string }>('/api/auth/alterar-senha', { method: 'PUT', body: { senha_atual, nova_senha } }),
  atualizarPerfil: (data: {
    nome?: string
    username?: string | null
    telefone?: string
    exibir_selo_publico?: boolean
    compartilhar_dados_anonimos?: boolean
  }) => request<{ ok: boolean; usuario: any }>('/api/auth/perfil', { method: 'PUT', body: data }),
  uploadFotoPerfil: (foto: File) => {
    const fd = new FormData()
    fd.append('foto', foto)
    return request<{ ok: boolean; foto_url: string }>('/api/auth/foto-perfil', { method: 'POST', formData: fd })
  },
  verificarCadastro: (userId: string, otp: string) =>
    request<{ token: string; usuario: any }>('/api/auth/verificar-cadastro', { method: 'POST', body: { userId, otp }, auth: false }),
  reenviarOtpCadastro: (userId: string) =>
    request<{ ok: boolean; msg: string }>('/api/auth/reenviar-otp-cadastro', { method: 'POST', body: { userId }, auth: false }),
  verificarOtp: (email: string, otp: string, nova_senha: string) =>
    request<{ ok: boolean; msg: string }>('/api/auth/verificar-otp', { method: 'POST', body: { email, otp, nova_senha }, auth: false }),
}

export const svc = {
  listar: () => request<any[]>('/api/servicos', { auth: false }),
  buscar: (codigo: string) => request<any>(`/api/servicos/${codigo}`, { auth: false }),
  depoimentos: () => request<{ depoimentos: any[]; total: number }>('/api/servicos/depoimentos/recentes', { auth: false }),
}

export const sue = {
  buscarSvc: (descricao: string) => request<any>('/api/busca-svc', { method: 'POST', body: { descricao }, auth: false }),
  chat: (mensagem: string, demandaId?: string) =>
    request<{ resposta: string; trigger: string | null; tokens: number }>(
      '/api/sue/mensagem', { method: 'POST', body: { mensagem, demandaId } }
    ),
  historico: (demandaId?: string) =>
    request<{ mensagens: Array<{ role: 'user' | 'assistant'; conteudo: string; trigger: string | null; created_at: string }> }>(
      `/api/sue/historico${demandaId ? `?demandaId=${demandaId}` : ''}`
    ),
}

export const orders = {
  calcularPreco: (data: any) => request<any>('/api/orders/calcular-preco', { method: 'POST', body: data, auth: false }),
  criar: (data: any) => request<any>('/api/orders', { method: 'POST', body: data }),
  listarMinhas: (contexto?: 'cliente' | 'profissional') =>
    request<any[]>(`/api/orders${contexto ? `?contexto=${contexto}` : ''}`),
  buscar: (id: string) => request<any>(`/api/orders/${id}`),
  feed: () => request<{ demandas: any[] }>('/api/orders/feed'),
  aceitar: (id: string, ajuste_pct: number) =>
    request(`/api/orders/${id}/aceitar`, { method: 'POST', body: { ajuste_pct } }),
  pagarPix: (id: string) => request<{
    pix_code: string; pix_qr: string | null; valor: number
    expira_em: string; mock?: boolean; msg?: string
  }>(`/api/orders/${id}/pagar/pix`, { method: 'POST' }),
  pagarBoleto: (id: string) => request<{
    boleto_url: string; boleto_codigo: string; valor: number; vencimento: string
  }>(`/api/orders/${id}/pagar/boleto`, { method: 'POST' }),
  justificarVtc: (id: string, justificativa: string) =>
    request<{ ok: boolean }>(`/api/orders/${id}/vtc/justificar`, { method: 'POST', body: { justificativa } }),
  mockConfirmarPagamento: (id: string) =>
    request<any>(`/api/orders/${id}/mock-confirmar-pagamento`, { method: 'POST' }),
  confirmarEntrega: (id: string) =>
    request(`/api/orders/${id}/confirmar-entrega`, { method: 'POST' }),
  avaliar: (id: string, dados: {
    nota_geral: number; qualidade_tecnica: number; pontualidade: number
    comunicacao: number; completude: number; comentario?: string
  }) => request(`/api/orders/${id}/avaliar`, { method: 'POST', body: dados }),
  abrirDisputa: (id: string, motivo: string) =>
    request(`/api/orders/${id}/disputa`, { method: 'POST', body: { motivo } }),
  cancelar: (id: string, motivo: string) =>
    request(`/api/orders/${id}/cancelar`, { method: 'POST', body: { motivo } }),
  checkin: (id: string, lat: number, lng: number, selfie?: File) => {
    if (selfie) {
      const fd = new FormData()
      fd.append('lat', String(lat))
      fd.append('lng', String(lng))
      fd.append('selfie', selfie)
      return request<any>(`/api/orders/${id}/checkin`, { method: 'POST', formData: fd })
    }
    return request<any>(`/api/orders/${id}/checkin`, { method: 'POST', body: { lat, lng } })
  },
  registrarMarco: (id: string, tipo: string, obs?: string) => {
    const fd = new FormData()
    fd.append('tipo', tipo)
    if (obs) fd.append('obs', obs)
    return request<any>(`/api/orders/${id}/marco`, { method: 'POST', formData: fd })
  },
  submeterEntregavel: (id: string, arquivo: File) => {
    const fd = new FormData()
    fd.append('entregavel', arquivo)
    return request<any>(`/api/orders/${id}/submeter-qa`, { method: 'POST', formData: fd })
  },
  vtc: (id: string) => request<any>(`/api/orders/${id}/vtc`),
  qaResultado: (id: string) => request<any>(`/api/orders/${id}/qa-resultado`),
  listarDocumentos: (id: string) => request<{ documentos: any[] }>(`/api/orders/${id}/documentos`),
  uploadDocumento: (id: string, arquivo: File, tipo: string, descricao?: string) => {
    const fd = new FormData()
    fd.append('arquivo', arquivo)
    fd.append('tipo', tipo)
    if (descricao?.trim()) fd.append('descricao', descricao.trim())
    return request<{ ok: boolean; documento: any }>(`/api/orders/${id}/documentos`, { method: 'POST', formData: fd })
  },
  deleteDocumento: (id: string, docId: string) => request<{ ok: boolean }>(`/api/orders/${id}/documentos/${docId}`, { method: 'DELETE' }),
}

export const admin = {
  dashboard: () => request<any>('/api/admin/dashboard'),
  demandas: () => request<any>('/api/admin/demandas'),
  demanda: (id: string) => request<{ demanda: any }>(`/api/admin/demandas/${id}`),
  profissionais: () => request<{ profissionais: any[] }>('/api/admin/profissionais'),
  profissional: (id: string) => request<{ profissional: any }>(`/api/admin/profissionais/${id}`),
  aprovarKyc: (id: string, aprovado: boolean, motivo?: string) =>
    request(`/api/admin/profissionais/${id}/kyc`, { method: 'PATCH', body: { aprovado, motivo } }),
  intervirDemanda: (id: string, acao: string, motivo?: string) =>
    request(`/api/admin/demandas/${id}/intervir`, { method: 'PATCH', body: { acao, motivo } }),
  svcsConfig: () => request<{ svcs: any[] }>('/api/admin/svcs/config'),
  atualizarSvc: (codigo: string, data: any) =>
    request<{ ok: boolean; svc: any }>(`/api/admin/svcs/${codigo}`, { method: 'PATCH', body: data }),
  paramsGlobais: () => request<{ pnr: number; fe: number; params: Record<string, string> }>('/api/admin/params-globais'),
  atualizarParamsGlobais: (data: { pnr?: number; fe?: number }) =>
    request<{ ok: boolean }>('/api/admin/params-globais', { method: 'PATCH', body: data }),
  verificarSue: (demandaId: string) =>
    request<{ ok: boolean; demanda_id: string; vtc: any; latencia_ms: number }>(`/api/admin/teste/qa/verificar/${demandaId}`, { method: 'POST' }),
  simularEntregavel: (url_pdf: string, demanda_id?: string) =>
    request<{ ok: boolean; demanda_id: string; vtc: any }>('/api/admin/teste/qa/simular-entregavel', { method: 'POST', body: { url_pdf, demanda_id } }),
  teste: {
    criarProfissionalCompleto: (data: any) =>
      request<any>('/api/admin/teste/criar-profissional-completo', { method: 'POST', body: data }),
    profissionalPronto: (id: string, svcs?: string[]) =>
      request(`/api/admin/teste/profissional-pronto/${id}`, { method: 'POST', body: { svcs_habilitados: svcs } }),
    marcarPaga: (id: string) =>
      request(`/api/admin/teste/demanda/${id}/marcar-paga`, { method: 'POST' }),
    forcarStatus: (id: string, novo_status: string, motivo?: string) =>
      request(`/api/admin/teste/demanda/${id}/forcar-status`, { method: 'POST', body: { novo_status, motivo } }),
    loginAs: (email: string) =>
      request<{ token: string; usuario: any }>('/api/admin/teste/login-as', { method: 'POST', body: { email } }),
  },
}

export const notificacoes = {
  listar: (params?: { categoria?: string; nao_lida?: boolean; limit?: number }) => {
    const qs = new URLSearchParams()
    if (params?.categoria) qs.set('categoria', params.categoria)
    if (params?.nao_lida)  qs.set('nao_lida', 'true')
    if (params?.limit)     qs.set('limit', String(params.limit))
    return request<{ notificacoes: any[]; total: number; nao_lidas: number }>(`/api/notificacoes${qs.toString() ? `?${qs}` : ''}`)
  },
  marcarLidas: () => request<{ ok: boolean; atualizadas: number }>('/api/notificacoes/marcar-lidas', { method: 'PATCH' }),
}

export const imovel = {
  listar: (params?: { cidade?: string; estado?: string; tipo?: string; contexto?: string }) => {
    const qs = params ? new URLSearchParams(params as Record<string, string>).toString() : ''
    return request<{ imoveis: any[]; total: number; page: number; pages: number }>(`/api/imovel${qs ? `?${qs}` : ''}`)
  },
  buscar: (id: string) => request<any>(`/api/imovel/${id}`),
  atualizar: (id: string, data: { logradouro?: string; numero?: string; complemento?: string; bairro?: string; cidade?: string; estado?: string; cep?: string; area_total_m2?: number; ponto_referencia?: string }) =>
    request<{ ok: boolean; imovel: any }>(`/api/imovel/${id}`, { method: 'PATCH', body: data }),
  historico: (id: string) => request<{ imovel_id: string; demandas: any[]; achados: any[] }>(`/api/imovel/historico/${id}`),
}

export const suePublica = {
  chat: (mensagem: string, historico: { role: string; content: string }[] = []) =>
    request<{ resposta: string }>('/api/sue/publica', {
      method: 'POST',
      body: { mensagem, historico },
      auth: false,
    }),
}

export const selo = {
  meu: (imovelId: string) => request<{ selo: any; proximoNivel: any; nivel_config: any }>(`/api/selo/imovel/${imovelId}`),
  progresso: (imovelId: string) => request<{ progresso: any }>(`/api/selo/${imovelId}/progresso`),
  publico: (imovelId: string) => request<any>(`/api/selo/${imovelId}`, { auth: false }),
}

export const profissional = {
  perfil: () => request<any>('/api/profissional/perfil'),
  perfilPublico: (id: string) => request<any>(`/api/profissional/publico/${id}`, { auth: false }),
  atualizarPerfil: (data: { cidade?: string; estado?: string; raio_km?: number }) =>
    request<{ ok: boolean }>('/api/profissional/perfil', { method: 'PUT', body: data }),
  kycStatus: () => request<{ kyc_aprovado: boolean; kyc_status: string; crea_ativo: boolean; documentos: any[] }>('/api/profissional/kyc-status'),
  enviarDocumentoKyc: (tipo: string, arquivo: File) => {
    const fd = new FormData()
    fd.append('tipo', tipo)
    fd.append('arquivo', arquivo)
    return request<{ ok: boolean; tipo: string; url: string }>('/api/profissional/kyc/documento', { method: 'POST', formData: fd })
  },
  onboarding: (data: { conselho: string; numero_conselho: string; uf_conselho: string; svcs_habilitados: string[]; aceita_termos: boolean }) =>
    request<{ ok: boolean; msg: string }>('/api/profissional/onboarding', { method: 'POST', body: data }),
  meuScore: () => request<{
    score: number; nivel: string
    metricas: Record<string, number>
    penalidades_acumuladas: number
    total_demandas: number; total_concluidas: number
    penalidades_recentes: any[]
    saude: { status: 'SAUDAVEL' | 'ATENCAO' | 'CRITICO'; score: number; nivel: string }
  }>('/api/profissional/meu-score'),
  financeiro: () => request<{
    disponivel: number; em_custodia: number
    faturado_mes: number; comissao_mes: number; liquido_mes: number
    total_demandas_mes: number
  }>('/api/profissional/financeiro'),
  carga: () => request<{ svcs: Record<string, { ativas: number; cap: number | null; pontos: number; cap_pontos: number }> }>('/api/profissional/carga'),
  prepara: () => request<any>('/api/profissional/perfil'),
  demos: (modulo: string) => request<{ demos: any[]; modulo: string }>(`/api/profissional/demos/${modulo}`),
  demoDetalhe: (modulo: string, numero: number) => request<{ demo: any; historico: any[] }>(`/api/profissional/demos/${modulo}/${numero}`),
  demoSubmeter: (modulo: string, numero: number, data: { art_numero: string; patologias: string; classificacao: string; analise: string; conclusao: string; cronograma: string }) =>
    request<{ ok: boolean; demo_id: string; tentativa: number; msg: string }>(`/api/profissional/demos/${modulo}/${numero}/submeter`, { method: 'POST', body: data }),
  demoResultado: (modulo: string, numero: number) => request<{ resultado: any }>(`/api/profissional/demos/${modulo}/${numero}/resultado`),
  concluirPrepara: (modulo: string) =>
    request<{ ok: boolean; prepara: Record<string, boolean> }>(
      `/api/profissional/prepara/${modulo}/concluir`, { method: 'POST' }
    ),
}

export const saques = {
  criar: (data: { valor: number; pix_key: string }) =>
    request<{
      ok: boolean; saque_id: string; valor_bruto: number
      irrf: number; taxa_saque: number; valor_liquido: number
      status: string; msg: string
    }>('/api/saques', { method: 'POST', body: data }),
  listar: () => request<{ saques: any[] }>('/api/saques'),
}

export const curador = {
  fila: () => request<{ casos: any[] }>('/api/curador/fila'),
  caso: (id: string) => request<{ caso: any; checklist: any[]; analise_sue: any }>(`/api/curador/caso/${id}`),
  aprovarQa: (id: string, feedback?: string) =>
    request<{ ok: boolean }>(`/api/curador/qa/${id}/aprovar`, { method: 'POST', body: { feedback } }),
  reprovarQa: (id: string, feedback: string) =>
    request<{ ok: boolean }>(`/api/curador/qa/${id}/reprovar`, { method: 'POST', body: { feedback } }),
  especiais: () => request<{ demandas: any[] }>('/api/curador/especiais'),
  precificarEspecial: (demandaId: string, dados: { preco: number; sla: number; obs?: string }) =>
    request<{ ok: boolean }>(`/api/curador/especial/${demandaId}`, { method: 'POST', body: dados }),
  resolverDisputa: (casoId: string, dados: { acao: 'REEMBOLSAR_CLIENTE' | 'LIBERAR_PROFISSIONAL' | 'RETOMAR_EXECUCAO'; obs?: string }) =>
    request<{ ok: boolean }>(`/api/curador/disputa/${casoId}/resolver`, { method: 'POST', body: dados }),
  profissionaisKyc: () => request<{ profissionais: any[] }>('/api/curador/profissionais'),
  aprovarKycCurador: (id: string, aprovado: boolean, motivo?: string) =>
    request<{ ok: boolean }>(`/api/curador/profissionais/${id}/kyc`, { method: 'PATCH', body: { aprovado, motivo } }),
}

export const chat = {
  listar: (demandaId: string) => request<{ mensagens: any[] }>(`/api/chat/${demandaId}`),
  enviar: (demandaId: string, conteudo: string) =>
    request<any>(`/api/chat/${demandaId}`, { method: 'POST', body: { conteudo } }),
}

export const termos = {
  listar: (tipo: 'CLIENTE' | 'PROFISSIONAL') =>
    request<{ termos: { id: string; codigo: string; versao: string; tipo: string; titulo: string; vigencia: string; conteudo: string }[] }>(
      `/api/termos?tipo=${tipo}`, { auth: false }
    ),
  buscar: (codigo: string) => request<any>(`/api/termos/${codigo}`, { auth: false }),
  aceitar: (termo_ids: string[]) => request<any>('/api/termos/aceitar', { method: 'POST', body: { termo_ids } }),
  meusAceites: () => request<{ aceites: any[] }>('/api/termos/usuario/meus-aceites'),
}

export const health = () => request<{ status: string; version: string; ts: string }>('/health', { auth: false })

export const tokenStorage = {
  set: (t: string) => { if (typeof window !== 'undefined') localStorage.setItem('suedflow_token', t) },
  get: () => (typeof window !== 'undefined' ? localStorage.getItem('suedflow_token') : null),
  clear: () => { if (typeof window !== 'undefined') localStorage.removeItem('suedflow_token') },
}
export const userStorage = {
  set: (u: any) => { if (typeof window !== 'undefined') localStorage.setItem('suedflow_user', JSON.stringify(u)) },
  get: () => {
    if (typeof window === 'undefined') return null
    const u = localStorage.getItem('suedflow_user')
    return u ? JSON.parse(u) : null
  },
  clear: () => { if (typeof window !== 'undefined') localStorage.removeItem('suedflow_user') },
}
