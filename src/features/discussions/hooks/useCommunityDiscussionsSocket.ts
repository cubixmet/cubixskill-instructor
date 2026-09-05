import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getWebSocketUrl } from '../../../utils/ws.utils';

export type SocketConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

export interface DiscussionEventEnvelope {
  type: string;
  event_id?: string;
  academy_id?: string;
  occurred_at?: string;
  data: any;
}

export const useCommunityDiscussionsSocket = (enabled: boolean = true) => {
  const queryClient = useQueryClient();
  const [connectionState, setConnectionState] = useState<SocketConnectionState>('disconnected');
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectTimerRef = useRef<any>(null);
  const processedEventIdsRef = useRef<Set<string>>(new Set());
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
      const envelope: DiscussionEventEnvelope = JSON.parse(event.data);
      if (!envelope || !envelope.type) return;

      // Event deduplication check
      if (envelope.event_id) {
        if (processedEventIdsRef.current.has(envelope.event_id)) {
          return;
        }
        processedEventIdsRef.current.add(envelope.event_id);
        // Keep deduplication set bounded (max 500 items)
        if (processedEventIdsRef.current.size > 500) {
          const firstItem = processedEventIdsRef.current.values().next().value;
          if (firstItem) processedEventIdsRef.current.delete(firstItem);
        }
      }

      // Handle real-time cache updates
      switch (envelope.type) {
        case 'discussion.created':
        case 'discussion.updated':
        case 'discussion.deleted':
        case 'discussion.pinned':
        case 'discussion.unpinned':
        case 'discussion.locked':
        case 'discussion.unlocked':
        case 'discussion.answer_accepted':
        case 'reply.created':
        case 'reply.updated':
        case 'reply.deleted':
          // Invalidate community discussions REST queries to cleanly merge new server state
          queryClient.invalidateQueries({ queryKey: ['community-discussions'] });
          queryClient.invalidateQueries({ queryKey: ['discussion-replies'] });
          break;
        default:
          break;
      }
    } catch {
      // Safely ignore malformed socket frames
    }
  }, [queryClient]);

  const connect = useCallback(() => {
    if (!enabled) return;

    // Avoid duplicate connection if already active or connecting
    if (socketRef.current && (socketRef.current.readyState === WebSocket.CONNECTING || socketRef.current.readyState === WebSocket.OPEN)) {
      return;
    }

    isIntentionalCloseRef.current = false;
    setConnectionState(reconnectAttemptsRef.current > 0 ? 'reconnecting' : 'connecting');

    try {
      const wsUrl = getWebSocketUrl('/ws/discussions/community/?portal=instructor');
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setConnectionState('connected');

        // On reconnection after actual connection loss, perform controlled REST reconciliation
        if (hasConnectedOnceRef.current && reconnectAttemptsRef.current > 0) {
          queryClient.invalidateQueries({ queryKey: ['community-discussions'] });
        }
        hasConnectedOnceRef.current = true;
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = handleMessage;

      ws.onerror = () => {
        // Handled in onclose
      };

      ws.onclose = (event) => {
        socketRef.current = null;

        // Code 4001 indicates authentication failure: do not endlessly reconnect
        if (event.code === 4001 || isIntentionalCloseRef.current) {
          setConnectionState('disconnected');
          return;
        }

        setConnectionState('disconnected');

        // Exponential backoff reconnection algorithm (1s, 2s, 4s, 8s... max 30s) + jitter
        reconnectAttemptsRef.current += 1;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current - 1), 30000) + Math.random() * 500;

        clearReconnectTimer();
        reconnectTimerRef.current = setTimeout(() => {
          connect();
        }, delay);
      };
    } catch {
      setConnectionState('disconnected');
    }
  }, [enabled, handleMessage, queryClient]);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      isIntentionalCloseRef.current = true;
      clearReconnectTimer();
      if (socketRef.current) {
        socketRef.current.close(1000, 'Component unmounted');
        socketRef.current = null;
      }
      setConnectionState('disconnected');
    };
  }, [enabled, connect]);

  return {
    connectionState,
    isConnected: connectionState === 'connected',
    reconnect: connect,
  };
};
