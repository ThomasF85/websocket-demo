import { nanoid } from "nanoid";
import {
  Flight,
  Area,
  getAxis,
  advancePosition,
  getDistance,
  Coordinate,
  getNormalizedDirection,
  ProximityWarning,
} from "@websocket-demo/shared";

const SPEED_METERS_PER_SECOND = 250;
const DISTANCE_FOR_PROXIMITY_CHECK = 50000;
const DISTANCE_FOR_PROXIMITY_WARNING = 5000;

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

const MAX_LATITUDE_PER_METER = 0.000009;
const MAX_LONGITUDE_PER_METER = getAxis(area.latitude.max, 0).pitch.longitude;

const LATITUDE_TO_METERS = 111139;

export function createFlightService(numberOfPlanes: number) {
  const callbacks: Record<
    string,
    (flights: Flight[], warnings: ProximityWarning[]) => void
  > = {};

  let flightsSnapshot: FlightsSnapshot = {
    flights: createFlights(numberOfPlanes, area),
    warnings: [],
    snapShotTime: Date.now(),
    area,
  };

  const interval = setInterval(() => {
    flightsSnapshot = advance(flightsSnapshot);
    Object.values(callbacks).forEach((callback) =>
      callback(flightsSnapshot.flights, flightsSnapshot.warnings)
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

function createFlights(count: number, area: Area): Flight[] {
  const flights: Flight[] = [];
  for (let i = 0; i < count; i++) {
    const longitude =
      area.longitude.min +
      Math.random() * (area.longitude.max - area.longitude.min);
    const latitude =
      area.latitude.min +
      Math.random() * (area.latitude.max - area.latitude.min);
    const heading = Math.random() * 2 * Math.PI;
    flights.push({
      id: nanoid(),
      flightNumber: `SIM${Math.floor(Math.random() * 100000)}`,
      position: {
        longitude,
        latitude,
      },
      heading,
      axis: getAxis(latitude, heading),
    });
  }
  return flights;
}

function move(flight: Flight, distanceMeters: number): Flight {
  const { position, heading } = advancePosition(
    flight.position,
    flight.heading,
    distanceMeters
  );
  return {
    ...flight,
    position,
    heading,
    axis: getAxis(position.latitude, flight.heading),
  };
}

function findProximityWarnings(flights: Flight[]) {
  let warnings: ProximityWarning[] = [];
  for (let i = 0; i < flights.length; i++) {
    const flight1 = flights[i];
    for (let j = i + 1; j < flights.length; j++) {
      const flight2 = flights[j];
      if (
        getDistanceLowerBoundary(flight1.position, flight2.position) <
        DISTANCE_FOR_PROXIMITY_CHECK
      ) {
        const distance = getDistance(flight1.position, flight2.position);
        if (distance < DISTANCE_FOR_PROXIMITY_CHECK) {
          const encounter = getEncounter(
            flight1,
            flight2,
            SPEED_METERS_PER_SECOND
          );
          if (encounter) {
            warnings.push({
              flights: { id1: flight1.id, id2: flight2.id },
              encounter,
            });
          }
        }
      }
    }
  }
  return warnings;
}

function getDistanceLowerBoundary(
  position1: Coordinate,
  position2: Coordinate
) {
  return (
    0.95 *
    Math.sqrt(
      Math.pow(
        (position2.latitude - position1.latitude) / MAX_LATITUDE_PER_METER,
        2
      ) +
        Math.pow(
          (position2.longitude - position1.longitude) / MAX_LONGITUDE_PER_METER,
          2
        )
    )
  );
}

function advance(snapshot: FlightsSnapshot): FlightsSnapshot {
  const now = Date.now();
  const timeDiffSeconds = (now - snapshot.snapShotTime) / 1000;
  const distance = SPEED_METERS_PER_SECOND * timeDiffSeconds;
  const flights = snapshot.flights.map((flight) => {
    return move(flight, distance);
  });
  const warnings = findProximityWarnings(flights);
  return {
    flights,
    warnings,
    snapShotTime: now,
    area: snapshot.area,
  };
}

type FlightsSnapshot = {
  flights: Flight[];
  warnings: ProximityWarning[];
  snapShotTime: number;
  area: Area;
};

export function getEncounter(
  flight1: Flight,
  flight2: Flight,
  velocity: number
): {
  timeToEncounter: number;
  position1: { now: Coordinate; encounter: Coordinate; future: Coordinate };
  position2: { now: Coordinate; encounter: Coordinate; future: Coordinate };
  distance: number;
} | null {
  const longitudeToMeters =
    1 / getNormalizedDirection(Math.PI / 2, 50).longitude;
  const a =
    LATITUDE_TO_METERS *
    (flight2.position.latitude - flight1.position.latitude);
  const b =
    velocity *
    LATITUDE_TO_METERS *
    (flight2.axis.roll.latitude - flight1.axis.roll.latitude);
  const c =
    longitudeToMeters *
    (flight2.position.longitude - flight1.position.longitude);
  const d =
    velocity *
    longitudeToMeters *
    (flight2.axis.roll.longitude - flight1.axis.roll.longitude);
  const divisor = d * d + b * b;
  if (divisor < 0.00000000001) {
    return null;
  }
  const timeOfClosestEncounter = -(c * d + a * b) / (d * d + b * b);
  if (timeOfClosestEncounter < 0 || timeOfClosestEncounter > 600) {
    return null;
  }
  const minDistance = Math.sqrt(
    Math.pow(a + timeOfClosestEncounter * b, 2) +
      Math.pow(c + timeOfClosestEncounter * d, 2)
  );
  if (minDistance < DISTANCE_FOR_PROXIMITY_WARNING) {
    return {
      distance: minDistance,
      position1: {
        now: flight1.position,
        encounter: advancePosition(
          flight1.position,
          flight1.heading,
          timeOfClosestEncounter * velocity
        ).position,
        future: advancePosition(
          flight1.position,
          flight1.heading,
          (timeOfClosestEncounter + 30) * velocity
        ).position,
      },
      position2: {
        now: flight2.position,
        encounter: advancePosition(
          flight2.position,
          flight2.heading,
          timeOfClosestEncounter * velocity
        ).position,
        future: advancePosition(
          flight2.position,
          flight2.heading,
          (timeOfClosestEncounter + 30) * velocity
        ).position,
      },
      timeToEncounter: timeOfClosestEncounter,
    };
  }
}
