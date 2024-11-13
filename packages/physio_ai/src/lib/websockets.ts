import { useEffect, useRef, useState } from 'react';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor(url: string = 'ws://localhost:8000/ws') {
    this.url = url;
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('WebSocket Connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onclose = () => {
        console.log('WebSocket Disconnected');
        this.reconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };

      return this.ws;
    } catch (error) {
      console.error('WebSocket Connection Error:', error);
      return null;
    }
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
      setTimeout(() => this.connect(), 1000 * this.reconnectAttempts);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}

export function useWebSocket(url: string) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const wsService = useRef<WebSocketService | null>(null);

  useEffect(() => {
    wsService.current = new WebSocketService(url);
    const socket = wsService.current.connect();
    
    if (socket) {
      socket.onopen = () => {
        console.log('WebSocket Connected');
        setWs(socket);
      };
    }

    return () => {
      if (wsService.current) {
        wsService.current.disconnect();
      }
    };
  }, [url]);

  return ws;
}