import { nanoid } from "nanoid";
import {
  Flight,
  Area,
  Coordinate,
  ProximityWarning,
} from "@websocket-demo/shared";
import {
  advancePosition,
  getAxis,
  getDistance,
  getNormalizedDirection,
} from "./utils/utils";

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

const TO_DEGREES = 180 / Math.PI;
const METERS_PER_LATITUDE = 6371000;
const MIN_METERS_PER_LONGITUDE = Math.abs(
  1 / getAxis(area.latitude.min, 0).pitch.longitude
);

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

  let flightsSnapshot: FlightsSnapshot = {
    flights: createFlights(numberOfPlanes, area),
    warnings: [],
    snapShotTime: Date.now(),
    area,
  };

  const interval = setInterval(() => {
    flightsSnapshot = advance(flightsSnapshot);
    Object.values(callbacks).forEach((callback) =>
      callback(
        transformFlights(flightsSnapshot.flights),
        transformWarnings(flightsSnapshot.warnings)
      )
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
          const encounter = getEncounter(flight1, flight2);
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
        (position2.latitude - position1.latitude) * METERS_PER_LATITUDE,
        2
      ) +
        Math.pow(
          (position2.longitude - position1.longitude) *
            MIN_METERS_PER_LONGITUDE,
          2
        )
    )
  );
}

function advance(snapshot: FlightsSnapshot): FlightsSnapshot {
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

type FlightsSnapshot = {
  flights: Flight[];
  warnings: ProximityWarning[];
  snapShotTime: number;
  area: Area;
};

export function getEncounter(
  flight1: Flight,
  flight2: Flight
): {
  timeToEncounter: number;
  position1: { now: Coordinate; encounter: Coordinate };
  position2: { now: Coordinate; encounter: Coordinate };
  distance: number;
} | null {
  const longitudeToMeters =
    1 / getNormalizedDirection(Math.PI / 2, 50).longitude;
  const a =
    METERS_PER_LATITUDE *
    (flight2.position.latitude - flight1.position.latitude);
  const b =
    METERS_PER_LATITUDE *
    (flight2.axis.roll.latitude * flight2.velocity -
      flight1.axis.roll.latitude * flight1.velocity);
  const c =
    longitudeToMeters *
    (flight2.position.longitude - flight1.position.longitude);
  const d =
    longitudeToMeters *
    (flight2.axis.roll.longitude * flight2.velocity -
      flight1.axis.roll.longitude * flight1.velocity);
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
          timeOfClosestEncounter * flight1.velocity
        ).position,
      },
      position2: {
        now: flight2.position,
        encounter: advancePosition(
          flight2.position,
          flight2.heading,
          timeOfClosestEncounter * flight2.velocity
        ).position,
      },
      timeToEncounter: timeOfClosestEncounter,
    };
  }
}
