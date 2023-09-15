import {
  Area,
  Flight,
  ProximityWarning,
  TO_DEGREES,
} from "@websocket-demo/shared";
import { nanoid } from "nanoid";
import { move } from "./flight";
import { findProximityWarnings } from "./proximityWarning";
import { getAxis } from "./utils";

export type FlightsSnapshot = {
  flights: Flight[];
  warnings: ProximityWarning[];
  snapShotTime: number;
  area: Area;
};

export function createFlightsSnapshot(count: number, area: Area) {
  return {
    flights: createFlights(count, area),
    warnings: [],
    snapShotTime: Date.now(),
    area,
  };
}

export function advance(snapshot: FlightsSnapshot): FlightsSnapshot {
  const now = Date.now();
  const timeDiffSeconds = (now - snapshot.snapShotTime) / 1000;
  const flights = snapshot.flights.map((flight) => {
    return move(flight, flight.velocity * timeDiffSeconds);
  });
  const warnings = findProximityWarnings(flights);
  return {
    flights,
    warnings,
    snapShotTime: now,
    area: snapshot.area,
  };
}

function createFlights(count: number, area: Area): Flight[] {
  const flights: Flight[] = [];
  for (let i = 0; i < count; i++) {
    const longitude =
      (area.longitude.min +
        Math.random() * (area.longitude.max - area.longitude.min)) /
      TO_DEGREES;
    const latitude =
      (area.latitude.min +
        Math.random() * (area.latitude.max - area.latitude.min)) /
      TO_DEGREES;
    const heading = Math.random() * 2 * Math.PI;
    flights.push({
      id: nanoid(),
      flightNumber: `SIM${Math.floor(Math.random() * 100000)}`,
      position: {
        longitude,
        latitude,
      },
      heading,
      velocity: 150 + Math.random() * 200,
      axis: getAxis(latitude, heading),
    });
  }
  return flights;
}
