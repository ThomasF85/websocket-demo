import { nanoid } from "nanoid";
import { Flight, Area } from "@websocket-demo/shared";

export function createFlightService(numberOfPlanes: number) {
  const callbacks: Record<string, (planes: Flight[]) => void> = {};

  let flightsSnapshot: FlightsSnapshot = {
    flights: createFlights(numberOfPlanes, area),
    snapShotTime: Date.now(),
    area,
  };

  const interval = setInterval(() => {
    flightsSnapshot = advance(flightsSnapshot);
    Object.values(callbacks).forEach((callback) =>
      callback(flightsSnapshot.flights)
    );
  }, 50);

  return {
    subscribe(callback: (planes: Flight[]) => void): string {
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

function createFlights(count: number, area: Area): Flight[] {
  const flights: Flight[] = [];
  for (let i = 0; i < count; i++) {
    flights.push({
      id: nanoid(),
      flightNumber: `SIM${Math.floor(Math.random() * 100000)}`,
      airline: "SIM",
      arrival: "FRA",
      departure: "MUC",
      position: {
        longitude:
          area.longitude.min +
          Math.random() * (area.longitude.max - area.longitude.min),
        latitude:
          area.latitude.min +
          Math.random() * (area.latitude.max - area.latitude.min),
      },
      heading: Math.random() * 2 * Math.PI,
    });
  }
  return flights;
}

const correctionVectorCache: Record<
  string,
  { latitude: number; longitude: number }
> = {};

function calcCorrectionVector(latitude: number) {
  const cos = Math.cos((latitude * Math.PI) / 180);
  const correctionVector = {
    latitude: 1 / Math.sqrt(1 + cos * cos),
    longitude: cos / Math.sqrt(1 + cos * cos),
  };
  return correctionVector;
}

function getCorrectionVector(latitude: number) {
  const cacheKey = `${Math.round(latitude)}`;
  if (!correctionVectorCache[cacheKey]) {
    correctionVectorCache[cacheKey] = calcCorrectionVector(latitude);
  }
  return correctionVectorCache[cacheKey];
}

function advance(snapshot: FlightsSnapshot): FlightsSnapshot {
  const now = Date.now();
  const timeDiff = (now - snapshot.snapShotTime) / 1000;
  const flights = snapshot.flights.map((flight) => {
    const correctionVector = getCorrectionVector(flight.position.latitude);
    const longitude =
      flight.position.longitude +
      (Math.sin(flight.heading) / correctionVector.longitude) *
        0.002 *
        timeDiff;
    const latitude =
      flight.position.latitude +
      (Math.cos(flight.heading) / correctionVector.latitude) * 0.002 * timeDiff;
    return {
      ...flight,
      position: {
        longitude:
          longitude < area.longitude.min
            ? area.longitude.max
            : longitude > area.longitude.max
            ? area.longitude.min
            : longitude,
        latitude:
          latitude < area.latitude.min
            ? area.latitude.max
            : latitude > area.latitude.max
            ? area.latitude.min
            : latitude,
      },
    };
  });
  return {
    flights,
    snapShotTime: now,
    area: snapshot.area,
  };
}

type FlightsSnapshot = {
  flights: Flight[];
  snapShotTime: number;
  area: Area;
};
