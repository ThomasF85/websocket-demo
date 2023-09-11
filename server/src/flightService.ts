import { nanoid } from "nanoid";
import { Flight, Area } from "@websocket-demo/shared";

const SPEED_METERS_PER_SECOND = 250;

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

function nextPosition(flight: Flight, distanceMeters: number): Flight {
  const la1 = flight.position.latitude * (Math.PI / 180);
  const lo1 = flight.position.longitude * (Math.PI / 180);
  const angularDistance = distanceMeters / 6371000;
  const heading = flight.heading;
  const la2 = Math.asin(
    Math.sin(la1) * Math.cos(angularDistance) +
      Math.cos(la1) * Math.sin(angularDistance) * Math.cos(heading)
  );
  const lo2 =
    lo1 +
    Math.atan2(
      Math.sin(heading) * Math.sin(angularDistance) * Math.cos(la1),
      Math.cos(angularDistance) - Math.sin(la1) * Math.sin(la2)
    );
  return {
    ...flight,
    position: {
      latitude: la2 * (180 / Math.PI),
      longitude: lo2 * (180 / Math.PI),
    },
  };
}

function advance(snapshot: FlightsSnapshot): FlightsSnapshot {
  const now = Date.now();
  const timeDiffSeconds = (now - snapshot.snapShotTime) / 1000;
  const distance = SPEED_METERS_PER_SECOND * timeDiffSeconds;
  const flights = snapshot.flights.map((flight) => {
    return nextPosition(flight, distance);
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
