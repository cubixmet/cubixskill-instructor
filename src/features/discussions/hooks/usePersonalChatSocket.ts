import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getWebSocketUrl } from '../../../utils/ws.utils';

export type PersonalSocketConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

export interface ChatMessageEvent {
  type: string;
  data?: any;
  user_id?: string;
  user_name?: string;
}

export const usePersonalChatSocket = (
  roomId: string | null | undefined,
  onNewMessage?: (msg: any) => void
) => {
  const queryClient = useQueryClient();
  const [connectionState, setConnectionState] = useState<PersonalSocketConnectionState>('disconnected');
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const processedMessageIdsRef = useRef<Set<string>>(new Set());
  const isIntentionalCloseRef = useRef<boolean>(false);
  const hasConnectedOnceRef = useRef<boolean>(false);

  const clearReconnectTimer = () => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  };

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const payload: ChatMessageEvent = JSON.parse(event.data);
      if (!payload || !payload.type) return;

      if (payload.type === 'message.created' && payload.data) {
        const msg = payload.data;
        const msgId = String(msg.id || msg.message_id || '');

        if (msgId) {
          if (processedMessageIdsRef.current.has(msgId)) {
            return;
          }
          processedMessageIdsRef.current.add(msgId);
          if (processedMessageIdsRef.current.size > 500) {
            const firstItem = processedMessageIdsRef.current.values().next().value;
            if (firstItem) processedMessageIdsRef.current.delete(firstItem);
          }
        }

        if (onNewMessage) {
          onNewMessage(msg);
        }
      }
    } catch {
      // Ignore malformed socket frames safely
    }
  }, [onNewMessage]);

  const connect = useCallback(() => {
    if (!roomId) return;

    if (socketRef.current && (socketRef.current.readyState === WebSocket.CONNECTING || socketRef.current.readyState === WebSocket.OPEN)) {
      return;
    }

    isIntentionalCloseRef.current = false;
    setConnectionState(reconnectAttemptsRef.current > 0 ? 'reconnecting' : 'connecting');

    try {
      const wsUrl = getWebSocketUrl(`/ws/chat/${roomId}/`);
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setConnectionState('connected');
        if (hasConnectedOnceRef.current && reconnectAttemptsRef.current > 0) {
          queryClient.invalidateQueries({ queryKey: ['personal-chat-messages', roomId] });
        }
        hasConnectedOnceRef.current = true;
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = handleMessage;

      ws.onerror = () => {
        // Handle error gracefully
      };

      ws.onclose = () => {
        socketRef.current = null;
        if (isIntentionalCloseRef.current) {
          setConnectionState('disconnected');
          return;
        }

        setConnectionState('reconnecting');
        const attempts = reconnectAttemptsRef.current + 1;
        reconnectAttemptsRef.current = attempts;

        // Exponential backoff capped at 16s
        const delay = Math.min(1000 * Math.pow(2, attempts - 1), 16000);
        clearReconnectTimer();
        reconnectTimerRef.current = setTimeout(() => {
          connect();
        }, delay);
      };
    } catch {
      setConnectionState('disconnected');
    }
  }, [roomId, handleMessage, queryClient]);

  useEffect(() => {
    if (roomId) {
      reconnectAttemptsRef.current = 0;
      hasConnectedOnceRef.current = false;
      processedMessageIdsRef.current.clear();
      connect();
    } else {
      isIntentionalCloseRef.current = true;
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setConnectionState('disconnected');
    }

    return () => {
      isIntentionalCloseRef.current = true;
      clearReconnectTimer();
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [roomId, connect]);

  const sendMessage = useCallback(
    (
      content: string,
      messageType: string = 'TEXT',
      replyToId?: string,
      mediaFileIds: string[] = [],
      clientRequestId?: string
    ) => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: 'message.send',
            client_request_id: clientRequestId || String(Date.now()),
            content,
            message_type: messageType,
            reply_to_id: replyToId || null,
            media_file_ids: mediaFileIds,
          })
        );
        return true;
      }
      return false;
    },
    []
  );

  const markRead = useCallback((lastReadMessageId?: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'messages.read',
        last_read_message_id: lastReadMessageId || null,
      }));
      return true;
    }
    return false;
  }, []);

  return { connectionState, sendMessage, markRead, socketRef };
};
