import { io, type Socket } from 'socket.io-client'
import { apiBaseUrl } from '@/app/store/api'

let socket: Socket | null = null

const getBackendUrlFromApi = () => {
  try {
    const url = new URL(apiBaseUrl)
    // Обрезаем /api, чтобы подключаться к корню сервера
    return `${url.protocol}//${url.host}`
  } catch {
    return 'http://localhost:5000'
  }
}

export const connectSocket = () => {
  if (socket && socket.connected) return socket

  const token = localStorage.getItem('accessToken')
  if (!token) return null

  const backendUrl = getBackendUrlFromApi()

  socket = io(backendUrl, {
    withCredentials: true,
    auth: {
      token,
    },
  })

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const getSocket = () => socket

