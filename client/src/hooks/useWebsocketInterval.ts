import { useEffect, useRef, useState } from "react";
import { useWebsocket } from "./useWebsocket";
import { Plane } from "@websocket-demo/shared";

// This websocket hook will only update the state once every intervalMilliseconds milliseconds,
// while still keeping track of messages internally.

export function useWebSocketInterval(intervalMilliseconds: number) {
  const planesRef = useRef<Plane[]>([]);
  const [planes, setPlanes] = useState<Plane[]>([]);
  const onPlanes = (planes: Plane[]) => {
    planesRef.current = planes;
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
