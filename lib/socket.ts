// lib/socket.ts — conexão Socket.io compartilhada
import { io, Socket } from 'socket.io-client'
import { tokenStorage } from './api'

const SOCKET_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://suedflow-backend-production.up.railway.app'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_BASE, {
      auth: { token: tokenStorage.get() },
      transports: ['websocket', 'polling'],
    })
  }
  return socket
}
