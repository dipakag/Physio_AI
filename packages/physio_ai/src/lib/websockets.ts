import { useEffect, useRef } from 'react';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;

  constructor(url: string = 'ws://localhost:8000/ws') {
    this.url = url;
  }

  connect() {
    this.ws = new WebSocket(this.url);
    
    this.ws.onopen = () => {
      console.log('WebSocket Connected');
    };

    this.ws.onclose = () => {
      console.log('WebSocket Disconnected');
    };

    return this.ws;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}

export function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsService = new WebSocketService(url);
    wsRef.current = wsService.connect();

    return () => {
      wsService.disconnect();
    };
  }, [url]);

  return wsRef.current;
}