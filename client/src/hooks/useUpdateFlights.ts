import { useCallback, useEffect, useRef, useState } from "react";
import { Flight } from "@websocket-demo/shared";

// This websocket hook will only update the state once every intervalMilliseconds milliseconds,
// while still keeping track of messages internally.

export function useUpdateFlights(intervalMilliseconds: number) {
  const flightsRef = useRef<Flight[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const update = useCallback((flights: Flight[]) => {
    flightsRef.current = flights;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFlights(flightsRef.current);
    }, intervalMilliseconds);

    return () => {
      clearInterval(interval);
    };
  }, [intervalMilliseconds]);

  return { update, flights };
}
