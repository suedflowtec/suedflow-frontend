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
  if (!res.ok) throw new ApiError(data.error || `HTTP ${res.status}`, res.status, data)
  return data as T
}

export const auth = {
  registrar: (data: any) => request('/api/auth/register', { method: 'POST', body: data, auth: false }),
  login: (email: string, senha: string) =>
    request<{ token: string; usuario: any }>('/api/auth/login', { method: 'POST', body: { email, senha }, auth: false }),
  me: () => request<any>('/api/auth/me'),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  recuperarSenha: (email: string) => request('/api/auth/recuperar-senha', { method: 'POST', body: { email }, auth: false }),
}

export const svc = {
  listar: () => request<any[]>('/api/servicos', { auth: false }),
  buscar: (codigo: string) => request<any>(`/api/servicos/${codigo}`, { auth: false }),
}

export const sue = {
  buscarSvc: (descricao: string) => request<any>('/api/busca-svc', { method: 'POST', body: { descricao }, auth: false }),
}

export const orders = {
  calcularPreco: (data: any) => request<any>('/api/orders/calcular-preco', { method: 'POST', body: data, auth: false }),
  criar: (data: any) => request<any>('/api/orders', { method: 'POST', body: data }),
  listarMinhas: () => request<any[]>('/api/orders'),
  buscar: (id: string) => request<any>(`/api/orders/${id}`),
  feed: () => request<{ demandas: any[] }>('/api/orders/feed'),
  aceitar: (id: string, preco_negociado: number) =>
    request(`/api/orders/${id}/aceitar`, { method: 'POST', body: { preco_negociado } }),
  pagarPix: (id: string) => request<any>(`/api/orders/${id}/pagar/pix`, { method: 'POST' }),
  confirmarEntrega: (id: string, estrelas: number, comentario?: string) =>
    request(`/api/orders/${id}/confirmar-entrega`, { method: 'POST', body: { avaliacao_estrelas: estrelas, avaliacao_comentario: comentario } }),
  cancelar: (id: string, motivo: string) =>
    request(`/api/orders/${id}/cancelar`, { method: 'POST', body: { motivo } }),
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
  avc: (id: string) => request<any>(`/api/orders/${id}/avc`),
}

export const admin = {
  dashboard: () => request<any>('/api/admin/dashboard'),
  demandas: () => request<any>('/api/admin/demandas'),
  profissionais: () => request<any>('/api/admin/profissionais'),
  aprovarKyc: (id: string, aprovado: boolean) =>
    request(`/api/admin/profissionais/${id}/kyc`, { method: 'PATCH', body: { aprovado } }),
  intervirDemanda: (id: string, acao: string, motivo?: string) =>
    request(`/api/admin/demandas/${id}/intervir`, { method: 'PATCH', body: { acao, motivo } }),
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
  listar: () => request<any>('/api/notificacoes'),
}

export const chat = {
  listar: (demandaId: string) => request<{ mensagens: any[] }>(`/api/chat/${demandaId}`),
  enviar: (demandaId: string, conteudo: string) =>
    request<any>(`/api/chat/${demandaId}`, { method: 'POST', body: { conteudo } }),
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
