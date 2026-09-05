import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth.store';
import { getWebSocketUrl } from '../utils/ws.utils';
import { CREDIT_SUMMARY_QUERY_KEY } from './useCreditSummary';

export function useAcademyEventsSocket() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      return;
    }

    const wsUrl = getWebSocketUrl('/ws/academy-events/?portal=instructor');
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      // Connected to real-time events WebSocket
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.type === 'academy.credit_balance.updated' && payload?.reason === 'STORAGE_SETTLEMENT') {
          // 1. Invalidate Navbar credit balance query (triggers instant balance update without reload)
          queryClient.invalidateQueries({ queryKey: CREDIT_SUMMARY_QUERY_KEY });

          // 2. Invalidate Storage Summary & Settlement queries
          queryClient.invalidateQueries({ queryKey: ['storage-summary'] });
          queryClient.invalidateQueries({ queryKey: ['storage-settlements'] });
          queryClient.invalidateQueries({ queryKey: ['storage-meter-logs'] });
        }
      } catch (err) {
        console.warn('[AcademyEvents] Failed to parse websocket event:', err);
      }
    };

    socket.onerror = (error) => {
      console.warn('[AcademyEvents] WebSocket error:', error);
    };

    socket.onclose = () => {
      // WebSocket closed
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
      socketRef.current = null;
    };
  }, [isAuthenticated, queryClient]);
}
