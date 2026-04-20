import { io, type Socket } from 'socket.io-client'
import { apiBaseUrl } from '@/app/store/api'

let socket: Socket | null = null

const getBackendUrl = (): string => {
  try {
    const url = new URL(apiBaseUrl)
    // Обрезаем /api, socket.io подключается к корню сервера
    return `${url.protocol}//${url.host}`
  } catch {
    return 'http://localhost:5000'
  }
}

export const connectSocket = (): Socket | null => {
  if (socket?.connected) return socket

  const token = localStorage.getItem('accessToken')
  if (!token) return null

  const backendUrl = getBackendUrl()

  socket = io(backendUrl, {
    withCredentials: true,
    auth: { token },
    // Polling первым — обязательно для Railway и других облачных прокси.
    // Socket.io автоматически попробует WebSocket upgrade после установки соединения.
    transports: ['polling', 'websocket'],
    // Переподключение при разрыве (например, sleep режим Railway бэкенда)
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 10_000,
    timeout: 20_000,
  })

  socket.on('connect', () => {
    console.log('🔌 Socket connected')
    // console.log('🔌 Socket connected:', socket?.id)
  })

  socket.on('disconnect', (reason) => {
    console.warn('🔌 Socket disconnected:', reason)
  })

  socket.on('connect_error', (err) => {
    console.error('🔌 Socket connect error:', err.message)
  })

  return socket
}

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const getSocket = (): Socket | null => socket
