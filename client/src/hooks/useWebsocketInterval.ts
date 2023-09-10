import { useEffect, useRef, useState } from "react";
import { useWebsocket } from "./useWebsocket";
import { Flight } from "@websocket-demo/shared";

// This websocket hook will only update the state once every intervalMilliseconds milliseconds,
// while still keeping track of messages internally.

export function useWebSocketInterval(intervalMilliseconds: number) {
  const planesRef = useRef<Flight[]>([]);
  const [planes, setPlanes] = useState<Flight[]>([]);
  const onPlanes = (flights: Flight[]) => {
    planesRef.current = flights;
  };
  const { connected } = useWebsocket(onPlanes);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlanes(planesRef.current);
    }, intervalMilliseconds);

    return () => {
      clearInterval(interval);
    };
  }, [intervalMilliseconds]);

  return { connected, planes };
}
