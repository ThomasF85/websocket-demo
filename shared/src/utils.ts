import { Coordinate } from "./Vector";

export function getAxis(
  latitude: number,
  heading: number
): {
  roll: Coordinate;
  pitch: Coordinate;
} {
  return {
    roll: getNormalizedDirection(heading, latitude),
    pitch: getNormalizedDirection(heading + Math.PI / 2, latitude),
  };
}

const RADIUS_EARTH = 6371000;
const ANGULAR_DISTANCE_1METER = 1 / RADIUS_EARTH;
const TO_RADIANS = Math.PI / 180;
const TO_DEGREES = 180 / Math.PI;

export function getNormalizedDirection(heading: number, latitude: number) {
  const la1 = latitude * TO_RADIANS;
  const la2 = Math.asin(
    Math.sin(la1) * Math.cos(ANGULAR_DISTANCE_1METER) +
      Math.cos(la1) * Math.sin(ANGULAR_DISTANCE_1METER) * Math.cos(heading)
  );
  const lo2 = Math.atan2(
    Math.sin(heading) * Math.sin(ANGULAR_DISTANCE_1METER) * Math.cos(la1),
    Math.cos(ANGULAR_DISTANCE_1METER) - Math.sin(la1) * Math.sin(la2)
  );
  return {
    latitude: (la2 - la1) * TO_DEGREES,
    longitude: lo2 * TO_DEGREES,
  };
}

export function advancePosition(
  position: Coordinate,
  heading: number,
  meters: number
) {
  const la1 = position.latitude * TO_RADIANS;
  const lo1 = position.longitude * TO_RADIANS;
  const angularDistance = meters / RADIUS_EARTH;
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
  const newHeading = getNewBearing(la1, la2, lo1, lo2);
  return {
    position: {
      latitude: la2 * TO_DEGREES,
      longitude: lo2 * TO_DEGREES,
    },
    heading: newHeading,
  };
}

function getNewBearing(p1La: number, p2La: number, p1Lo: number, p2Lo: number) {
  const la2 = p1La;
  const la1 = p2La;
  const deltaLo = p1Lo - p2Lo;

  const y = Math.sin(deltaLo) * Math.cos(la2);
  const x =
    Math.cos(la1) * Math.sin(la2) -
    Math.sin(la1) * Math.cos(la2) * Math.cos(deltaLo);
  const newHeading = Math.atan2(y, x);

  return newHeading > 0 ? newHeading - Math.PI : newHeading + Math.PI;
}

export function getDistance(position1: Coordinate, position2: Coordinate) {
  const la1 = position1.latitude * TO_RADIANS;
  const la2 = position2.latitude * TO_RADIANS;
  const deltaLa = la2 - la1;
  const deltaLo = (position2.longitude - position1.longitude) * TO_RADIANS;

  const a =
    Math.sin(deltaLa / 2) * Math.sin(deltaLa / 2) +
    Math.cos(la1) *
      Math.cos(la2) *
      Math.sin(deltaLo / 2) *
      Math.sin(deltaLo / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return RADIUS_EARTH * c;
}
