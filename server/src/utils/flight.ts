import { Flight, RADIUS_EARTH } from "@websocket-demo/shared";
import { getAxis } from "./utils";

export function move(flight: Flight, meters: number): Flight {
  const newPosition = futurePosition(flight, meters);
  const newHeading = getNewBearing(
    flight.position.latitude,
    newPosition.latitude,
    flight.position.longitude,
    newPosition.longitude
  );
  return {
    ...flight,
    position: newPosition,
    heading: newHeading,
    axis: getAxis(newPosition.latitude, newHeading),
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

export function futurePosition(flight: Flight, meters: number) {
  const la1 = flight.position.latitude;
  const lo1 = flight.position.longitude;
  const angularDistance = meters / RADIUS_EARTH;
  const la2 = Math.asin(
    Math.sin(la1) * Math.cos(angularDistance) +
      Math.cos(la1) * Math.sin(angularDistance) * Math.cos(flight.heading)
  );
  const lo2 =
    lo1 +
    Math.atan2(
      Math.sin(flight.heading) * Math.sin(angularDistance) * Math.cos(la1),
      Math.cos(angularDistance) - Math.sin(la1) * Math.sin(la2)
    );
  return {
    latitude: la2,
    longitude: lo2,
  };
}
