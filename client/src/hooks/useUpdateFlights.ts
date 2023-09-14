import { useCallback, useEffect, useRef, useState } from "react";
import { Flight, ProximityWarning } from "@websocket-demo/shared";

// This websocket hook will only update the state once every intervalMilliseconds milliseconds,
// while still keeping track of messages internally.

export function useUpdateFlights(intervalMilliseconds: number) {
  const flightsAndWarningsRef = useRef<{
    flights: Flight[];
    warnings: ProximityWarning[];
  }>({ flights: [], warnings: [] });
  const [flights, setFlights] = useState<Flight[]>([]);
  const [warnings, setWarnings] = useState<ProximityWarning[]>([]);
  const update = useCallback(
    (data: { flights: Flight[]; warnings: ProximityWarning[] }) => {
      flightsAndWarningsRef.current = data;
    },
    []
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setFlights(flightsAndWarningsRef.current.flights);
      setWarnings(flightsAndWarningsRef.current.warnings);
    }, intervalMilliseconds);

    return () => {
      clearInterval(interval);
    };
  }, [intervalMilliseconds]);

  return { update, flights, warnings };
}
