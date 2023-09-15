import { Coordinate } from "@websocket-demo/shared";

const RADIUS_EARTH = 6371000;
const ANGULAR_DISTANCE_1METER = 1 / RADIUS_EARTH;

export function getNormalizedDirection(heading: number, la1: number) {
  const la2 = Math.asin(
    Math.sin(la1) * Math.cos(ANGULAR_DISTANCE_1METER) +
      Math.cos(la1) * Math.sin(ANGULAR_DISTANCE_1METER) * Math.cos(heading)
  );
  const lo2 = Math.atan2(
    Math.sin(heading) * Math.sin(ANGULAR_DISTANCE_1METER) * Math.cos(la1),
    Math.cos(ANGULAR_DISTANCE_1METER) - Math.sin(la1) * Math.sin(la2)
  );
  return {
    latitude: la2 - la1,
    longitude: lo2,
  };
}

export function getDistance(position1: Coordinate, position2: Coordinate) {
  const la1 = position1.latitude;
  const la2 = position2.latitude;
  const deltaLa = la2 - la1;
  const deltaLo = position2.longitude - position1.longitude;

  const a =
    Math.sin(deltaLa / 2) * Math.sin(deltaLa / 2) +
    Math.cos(la1) *
      Math.cos(la2) *
      Math.sin(deltaLo / 2) *
      Math.sin(deltaLo / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return RADIUS_EARTH * c;
}

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
