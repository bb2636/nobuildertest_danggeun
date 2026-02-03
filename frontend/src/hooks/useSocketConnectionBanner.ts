import { useEffect, useRef, useState } from 'react'
import { getChatSocket, addSocketConnectionListener, type SocketConnectionStatus } from '../lib/socket'

const RECONNECT_MESSAGE_DURATION_MS = 3000

/**
 * 채팅 소켓 연결 상태에 따른 안내 메시지.
 * token이 있을 때만 소켓을 생성하고 구독한다.
 */
export function useSocketConnectionBanner(token: string | null) {
  const [disconnectMessage, setDisconnectMessage] = useState<string | null>(null)
  const [reconnectMessage, setReconnectMessage] = useState(false)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!token) {
      setDisconnectMessage(null)
      setReconnectMessage(false)
      return
    }
    getChatSocket(token)
    const unsubscribe = addSocketConnectionListener((status: SocketConnectionStatus) => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
      if (status === 'connected') {
        setDisconnectMessage(null)
        setReconnectMessage(true)
        reconnectTimerRef.current = setTimeout(
          () => setReconnectMessage(false),
          RECONNECT_MESSAGE_DURATION_MS
        )
      }
      if (status === 'disconnected' || status === 'error') {
        setDisconnectMessage('연결이 끊겼습니다. 잠시 후 자동으로 재연결됩니다.')
        setReconnectMessage(false)
      }
    })
    return () => {
      unsubscribe()
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
    }
  }, [token])

  return { disconnectMessage, reconnectMessage }
}
