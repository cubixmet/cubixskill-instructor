import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth.store';
import { getWebSocketUrl } from '../utils/ws.utils';
import { CREDIT_SUMMARY_QUERY_KEY } from './useCreditSummary';

export function useAcademyEventsSocket() {
  const queryClient = useQueryClient();
  const { isAuthenticated: isAuth, authStatus, isInitializing } = useAuthStore();
  const isAuthenticated =
    isAuth === true &&
    authStatus === 'authenticated' &&
    isInitializing === false;

  const socketRef = useRef<WebSocket | null>(null);
  const disposedRef = useRef<boolean>(false);
  const intentionalCloseRef = useRef<boolean>(false);
  const reconnectTimerRef = useRef<any>(null);
  const retryCountRef = useRef<number>(0);

  useEffect(() => {
    disposedRef.current = false;
    intentionalCloseRef.current = false;

    if (!isAuthenticated) {
      if (socketRef.current) {
        intentionalCloseRef.current = true;
        socketRef.current.onopen = null;
        socketRef.current.onmessage = null;
        socketRef.current.onerror = null;
        const s = socketRef.current;
        socketRef.current = null;
        if (s.readyState === WebSocket.OPEN) {
          s.close();
        } else if (s.readyState === WebSocket.CONNECTING) {
          s.onopen = () => {
            try { s.close(); } catch (_err) { /* ignore */ }
          };
        }
      }
      return;
    }

    const connect = () => {
      if (disposedRef.current || intentionalCloseRef.current) return;

      if (
        socketRef.current &&
        (socketRef.current.readyState === WebSocket.CONNECTING ||
          socketRef.current.readyState === WebSocket.OPEN)
      ) {
        return;
      }

      const token =
        localStorage.getItem('instructor_access_token') ||
        sessionStorage.getItem('instructor_access_token') ||
        '';
      const tokenParam = token ? `&token=${encodeURIComponent(token)}` : '';
      const wsUrl = getWebSocketUrl(`/ws/academy-events/?portal=instructor${tokenParam}`);
      try {
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
          if (disposedRef.current || intentionalCloseRef.current || socketRef.current !== socket) {
            return;
          }
          retryCountRef.current = 0;
          if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current as any);
            reconnectTimerRef.current = null;
          }
        };

        socket.onmessage = (event) => {
          if (disposedRef.current || socketRef.current !== socket) return;
          try {
            const payload = JSON.parse(event.data);
            if (payload?.type === 'academy.credit_balance.updated' || payload?.type === 'credit_balance_updated') {
              if (payload?.balance !== undefined && payload?.balance !== null) {
                const newBalStr = String(payload.balance);
                queryClient.setQueryData<any>(CREDIT_SUMMARY_QUERY_KEY, (old: any) => {
                  if (!old) return old;
                  return {
                    ...old,
                    balance: newBalStr,
                  };
                });
              }
              queryClient.invalidateQueries({ queryKey: CREDIT_SUMMARY_QUERY_KEY });
              if (payload?.reason === 'STORAGE_SETTLEMENT') {
                queryClient.invalidateQueries({ queryKey: ['storage-summary'] });
                queryClient.invalidateQueries({ queryKey: ['storage-settlements'] });
                queryClient.invalidateQueries({ queryKey: ['storage-meter-logs'] });
              }
            }
          } catch (err) {
            console.warn('[AcademyEvents] Failed to parse websocket event:', err);
          }
        };

        socket.onerror = (_error) => {
          // Silent catch for WebSocket connection state changes
        };

        socket.onclose = () => {
          if (disposedRef.current || intentionalCloseRef.current || socketRef.current !== socket) {
            return;
          }

          socketRef.current = null;
          if (!reconnectTimerRef.current) {
            const delay = Math.min(30000, Math.max(1000, 1000 * Math.pow(2, retryCountRef.current)));
            retryCountRef.current += 1;
            reconnectTimerRef.current = setTimeout(() => {
              reconnectTimerRef.current = null;
              connect();
            }, delay);
          }
        };
      } catch (_e) {
        // WebSocket initialization fallback
      }
    };

    connect();

    return () => {
      disposedRef.current = true;
      intentionalCloseRef.current = true;

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current as any);
        reconnectTimerRef.current = null;
      }

      if (socketRef.current) {
        const sock = socketRef.current;
        socketRef.current = null;
        sock.onopen = null;
        sock.onmessage = null;
        sock.onerror = null;
        sock.onclose = null;
        if (sock.readyState === WebSocket.OPEN) {
          sock.close();
        } else if (sock.readyState === WebSocket.CONNECTING) {
          sock.onopen = () => {
            try {
              sock.close();
            } catch (_e) {
              // ignore safe close
            }
          };
        }
      }
    };
  }, [isAuthenticated, queryClient]);
}
