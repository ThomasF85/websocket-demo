import {
  Coordinate,
  Flight,
  METERS_PER_LATITUDE,
  ProximityWarning,
  RADIUS_EARTH,
} from "@websocket-demo/shared";
import { getDistance } from "./utils";
import { futurePosition, move } from "./flight";

const DISTANCE_FOR_PROXIMITY_CHECK = 50000;
const DISTANCE_FOR_PROXIMITY_WARNING = 5000;

export function findProximityWarnings(flights: Flight[]) {
  let warnings: ProximityWarning[] = [];
  for (let i = 0; i < flights.length; i++) {
    const flight1 = flights[i];
    for (let j = i + 1; j < flights.length; j++) {
      const flight2 = flights[j];
      if (
        getDistanceLowerBoundary(flight1.position, flight2.position) <
        DISTANCE_FOR_PROXIMITY_CHECK
      ) {
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
  return warnings;
}

function getDistanceLowerBoundary(
  position1: Coordinate,
  position2: Coordinate
) {
  const metersPerLongitude = RADIUS_EARTH * Math.cos(position1.latitude);
  return (
    0.95 *
    Math.sqrt(
      Math.pow(
        (position2.latitude - position1.latitude) * METERS_PER_LATITUDE,
        2
      ) +
        Math.pow(
          (position2.longitude - position1.longitude) * metersPerLongitude,
          2
        )
    )
  );
}

export function getEncounter(
  flight1: Flight,
  flight2: Flight
): {
  timeToEncounter: number;
  position1: { now: Coordinate; encounter: Coordinate };
  position2: { now: Coordinate; encounter: Coordinate };
  distance: number;
} | null {
  const timeAndDistance = approximateClosestEncounter(flight1, flight2);
  if (!timeAndDistance) {
    return null;
  }
  let { time, distance } = timeAndDistance;
  if (time < 0 || time > 600) {
    return null;
  }
  if (distance > DISTANCE_FOR_PROXIMITY_WARNING) {
    return null;
  }
  let advancedTimeAndDistance = approximateClosestEncounter(
    move(flight1, time * flight1.velocity),
    move(flight2, time * flight2.velocity)
  );
  if (!advancedTimeAndDistance) {
    return null;
  }
  time += advancedTimeAndDistance.time;
  let i = 0;
  while (Math.abs(advancedTimeAndDistance.time) > 0.01) {
    advancedTimeAndDistance = approximateClosestEncounter(
      move(flight1, time * flight1.velocity),
      move(flight2, time * flight2.velocity)
    );
    if (!advancedTimeAndDistance) {
      return null;
    }
    time += advancedTimeAndDistance.time;
    i++;
  }

  return {
    distance: advancedTimeAndDistance.distance,
    position1: {
      now: flight1.position,
      encounter: futurePosition(flight1, time * flight1.velocity),
    },
    position2: {
      now: flight2.position,
      encounter: futurePosition(flight2, time * flight2.velocity),
    },
    timeToEncounter: time,
  };
}

function approximateClosestEncounter(
  flight1: Flight,
  flight2: Flight
): { time: number; distance: number } | null {
  const metersPerLongitude =
    RADIUS_EARTH *
    Math.cos(0.5 * (flight1.position.latitude + flight2.position.latitude));
  const a =
    METERS_PER_LATITUDE *
    (flight2.position.latitude - flight1.position.latitude);
  const b =
    METERS_PER_LATITUDE *
    (flight2.axis.roll.latitude * flight2.velocity -
      flight1.axis.roll.latitude * flight1.velocity);
  const c =
    metersPerLongitude *
    (flight2.position.longitude - flight1.position.longitude);
  const d =
    metersPerLongitude *
    (flight2.axis.roll.longitude * flight2.velocity -
      flight1.axis.roll.longitude * flight1.velocity);
  const divisor = d * d + b * b;
  if (divisor < 0.00000000001) {
    return null;
  }
  const time = -(c * d + a * b) / (d * d + b * b);
  const distance = Math.sqrt(
    Math.pow(a + time * b, 2) + Math.pow(c + time * d, 2)
  );
  return { time, distance };
}
