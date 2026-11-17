import { useEffect, useRef, useState, useCallback } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { ApiClient } from "@/lib/api";

export interface LiveBoardEvent {
  type: string;
  room_id?: number;
  room_number?: string;
  status?: string;
  booking_reference?: string;
  guest_name?: string;
  timestamp?: string;
  [key: string]: unknown;
}

interface UseLiveBoardSocketOptions {
  onMessage?: (event: LiveBoardEvent) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

export function useLiveBoardSocket(options: UseLiveBoardSocketOptions = {}) {
  const { onMessage, autoReconnect = true, reconnectInterval = 3000 } = options;
  const { isAuthenticated } = useAuthStore();
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<LiveBoardEvent | null>(null);

  const connect = useCallback(() => {
    const token = ApiClient.getAccessToken();
    if (!isAuthenticated || !token) return;

    // Clean up any pending reconnect
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.close();
    }

    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
    const wsUrlBase = apiUrl
      .replace(/^http:\/\//, "ws://")
      .replace(/^https:\/\//, "wss://")
      .replace(/\/api\/v1\/?$/, "");

    const wsUrl = `${wsUrlBase}/ws/reception/live-board/?token=${encodeURIComponent(token)}`;

    try {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data) as LiveBoardEvent;
          setLastMessage(parsedData);
          if (onMessage) {
            onMessage(parsedData);
          }
        } catch {
          // Non-JSON ping/pong or heartbeat
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        if (autoReconnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      socket.onerror = () => {
        socket.close();
      };
    } catch (err) {
      console.warn("LiveBoard WebSocket connection attempt failed:", err);
      if (autoReconnect) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, reconnectInterval);
      }
    }
  }, [isAuthenticated, autoReconnect, reconnectInterval, onMessage]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  const send = useCallback((data: Record<string, unknown>) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    }
  }, []);

  return {
    isConnected,
    lastMessage,
    send,
  };
}
