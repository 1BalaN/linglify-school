import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store'
import { connectSocket, disconnectSocket } from './socket'

interface SocketProviderProps {
  children: React.ReactNode
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)

  useEffect(() => {
    if (isAuthenticated) {
      connectSocket()
    } else {
      disconnectSocket()
    }

    return () => {
      disconnectSocket()
    }
  }, [isAuthenticated])

  return children
}

