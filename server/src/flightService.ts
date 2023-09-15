import { nanoid } from "nanoid";
import {
  Flight,
  Area,
  ProximityWarning,
  TO_DEGREES,
} from "@websocket-demo/shared";
import {
  FlightsSnapshot,
  advance,
  createFlightsSnapshot,
} from "./utils/flightsSnapshot";

const area: Area = {
  longitude: {
    min: 5.5,
    max: 15,
  },
  latitude: {
    min: 47.5,
    max: 54,
  },
};

function transformFlights(flights: Flight[]): Flight[] {
  return flights.map((flight) => {
    return {
      ...flight,
      position: {
        longitude: flight.position.longitude * TO_DEGREES,
        latitude: flight.position.latitude * TO_DEGREES,
      },
      axis: {
        roll: {
          longitude: flight.axis.roll.longitude * TO_DEGREES,
          latitude: flight.axis.roll.latitude * TO_DEGREES,
        },
        pitch: {
          longitude: flight.axis.pitch.longitude * TO_DEGREES,
          latitude: flight.axis.pitch.latitude * TO_DEGREES,
        },
      },
    };
  });
}

function transformWarnings(warnings: ProximityWarning[]): ProximityWarning[] {
  return warnings.map((warning) => {
    return {
      ...warning,
      encounter: {
        timeToEncounter: warning.encounter.timeToEncounter,
        position1: {
          now: {
            longitude: warning.encounter.position1.now.longitude * TO_DEGREES,
            latitude: warning.encounter.position1.now.latitude * TO_DEGREES,
          },
          encounter: {
            longitude:
              warning.encounter.position1.encounter.longitude * TO_DEGREES,
            latitude:
              warning.encounter.position1.encounter.latitude * TO_DEGREES,
          },
        },
        position2: {
          ...warning.encounter.position2,
          now: {
            longitude: warning.encounter.position2.now.longitude * TO_DEGREES,
            latitude: warning.encounter.position2.now.latitude * TO_DEGREES,
          },
          encounter: {
            longitude:
              warning.encounter.position2.encounter.longitude * TO_DEGREES,
            latitude:
              warning.encounter.position2.encounter.latitude * TO_DEGREES,
          },
        },
        distance: warning.encounter.distance,
      },
    };
  });
}

export function createFlightService(numberOfPlanes: number) {
  const callbacks: Record<
    string,
    (flights: Flight[], warnings: ProximityWarning[]) => void
  > = {};

  let flightsSnapshot: FlightsSnapshot = createFlightsSnapshot(
    numberOfPlanes,
    area
  );

  const interval = setInterval(() => {
    flightsSnapshot = advance(flightsSnapshot);
    const transformedFlights = transformFlights(flightsSnapshot.flights);
    const transformedWarnings = transformWarnings(flightsSnapshot.warnings);
    Object.values(callbacks).forEach((callback) =>
      callback(transformedFlights, transformedWarnings)
    );
  }, 50);

  return {
    subscribe(
      callback: (planes: Flight[], warnings: ProximityWarning[]) => void
    ): string {
      const id = nanoid();
      callbacks[id] = callback;
      console.log("new client connected", id);
      return id;
    },
    unsubscribe(id: string): void {
      delete callbacks[id];
      console.log("client disconnected", id);
    },
    stop() {
      clearInterval(interval);
    },
  };
}
