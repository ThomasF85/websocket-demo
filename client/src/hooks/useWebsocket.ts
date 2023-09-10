import { Flight } from "@websocket-demo/shared";
import { useEffect, useRef, useState } from "react";
const WEB_SOCKET_URL = "ws://localhost:3042";

const reconnectDelays = [200, 1000, 2000, 5000, 10000];

export function useWebsocket(callback: (flights: Flight[]) => void) {
  const websocket = useRef<WebSocket | null>(null);
  const reconnectDelayIndex = useRef<number>(-1);
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    function connect() {
      const ws = new WebSocket(WEB_SOCKET_URL);
      ws.onopen = () => {
        setConnected(true);
        reconnectDelayIndex.current = -1;
      };
      ws.onmessage = (evt: { data: string }) => {
        callback(JSON.parse(evt.data));
      };
      ws.onclose = () => {
        console.log("websocket closed");
        setConnected(false);
        if (reconnectDelayIndex.current < reconnectDelays.length - 1) {
          reconnectDelayIndex.current++;
        }
        setTimeout(connect, reconnectDelays[reconnectDelayIndex.current]);
      };
      websocket.current = ws;
    }
    if (!websocket.current) {
      connect();
    }

    return () => {
      if (websocket.current) {
        websocket.current.close();
      }
    };
  }, []);

  return { connected };
}
