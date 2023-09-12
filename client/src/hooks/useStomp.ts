import { Client } from "@stomp/stompjs";
import { useEffect, useRef, useState } from "react";
import { useUpdateFlights } from "./useUpdateFlights";

export function useStomp(intervalMilliseconds: number) {
  const client = useRef<Client>();
  const [connected, setConnected] = useState<boolean>(false);
  const { update, flights } = useUpdateFlights(intervalMilliseconds);

  useEffect(() => {
    if (!client.current) {
      console.log("creating stomp client");
      client.current = new Client({
        brokerURL: "ws://localhost:8080/gs-guide-websocket",
        onConnect: () => {
          console.log("Stomp connected");
          client.current!.subscribe("/topic/flights", (message) => {
            update(JSON.parse(message.body));
            setConnected(true);
          });
        },
        onStompError: (frame) => {
          console.log(`Broker reported error: ${frame.headers.message}`);
          console.log(`Additional details: ${frame.body}`);
        },
        onWebSocketClose: () => {
          console.log("Stomp disconnected");
          setConnected(false);
        },
      });
      client.current.activate();
    }
  }, []);

  return { connected, flights };
}
