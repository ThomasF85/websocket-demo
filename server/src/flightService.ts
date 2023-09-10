import { nanoid } from "nanoid";
import { Flight, Vector, Area } from "@websocket-demo/shared";

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
    max: 13,
  },
  latitude: {
    min: 47.5,
    max: 54,
  },
};

type FlightWithVelocity = Flight & {
  velocity: Vector;
};

function createFlights(count: number, area: Area): FlightWithVelocity[] {
  const flights: FlightWithVelocity[] = [];
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
      velocity: {
        longitude: 0.1 * (Math.random() * 2 - 1),
        latitude: 0.1 * (Math.random() * 2 - 1),
      },
    });
  }
  return flights;
}

function advance(snapshot: FlightsSnapshot): FlightsSnapshot {
  const now = Date.now();
  const timeDiff = (now - snapshot.snapShotTime) / 1000;
  const flights = snapshot.flights.map((flight) => {
    const velocity = flight.velocity;
    return {
      ...flight,
      position: {
        longitude: flight.position.longitude + velocity.longitude * timeDiff,
        latitude: flight.position.latitude + velocity.latitude * timeDiff,
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
  flights: FlightWithVelocity[];
  snapShotTime: number;
  area: Area;
};
