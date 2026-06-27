// lib/socket.ts — conexão Socket.io compartilhada
import { io, Socket } from 'socket.io-client'
import { tokenStorage } from './api'

const SOCKET_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://suedflow-backend-production.up.railway.app'

let socket: Socket | null = null

export function getSocket(): Socket {
  const token = tokenStorage.get()
  if (!socket) {
    socket = io(SOCKET_BASE, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })
    // Reinjetar token atual em cada reconexão (ex: token rotacionado)
    socket.on('connect_error', (err) => {
      if (err.message === 'Socket: token inválido' || err.message === 'Socket: token ausente') {
        const fresh = tokenStorage.get()
        if (fresh && socket) (socket as any).auth = { token: fresh }
      }
    })
  }
  return socket
}

// Chamar no logout para desconectar e limpar o singleton.
// Sem isso, o socket fica ativo com o token do usuário anterior após logout + login.
export function destroySocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
