import {
  Coordinate,
  Flight,
  ProximityWarning,
  Vector,
} from "@websocket-demo/shared";
import { Feature } from "ol";
import Style from "ol/style/Style";
import { Circle, LineString, Polygon } from "ol/geom";
import { transform } from "ol/proj";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";

export function toFeatures(
  flights: Flight[],
  warnings: ProximityWarning[],
  zoom: number
): Feature[] {
  const time = performance.now();
  const scale = zoom < 5 ? 31250 : 31250 / Math.pow(1.8, zoom - 5);
  const planeStyle = new Style({
    fill: new Fill({
      color: "rgb(0,0,145)",
    }),
  });
  const planeStyleWarning = new Style({
    fill: new Fill({
      color: "rgb(255,0,0)",
    }),
  });
  const pathStyle = new Style({
    stroke: new Stroke({
      color: "rgba(0,0,145,0.3)",
      width: 5,
    }),
  });
  const circleStyle = new Style({
    stroke: new Stroke({
      color: "rgb(255,0,0)",
      width: 2,
    }),
    fill: new Fill({
      color: "rgba(255,0,0,0.3)",
    }),
  });
  const features: Feature[] = [];
  flights.forEach((flight) => {
    const hasWarning = warnings.some(
      (warning) =>
        warning.flights.id1 === flight.id || warning.flights.id2 === flight.id
    );
    const planeFeature = new Feature({
      geometry: toPolygon(flight, planeShape, scale),
      name: flight.id,
    });
    planeFeature.setStyle(hasWarning ? planeStyleWarning : planeStyle);
    features.push(planeFeature);
  });
  warnings.forEach((warning) => {
    const path1 = new Feature({
      geometry: new LineString([
        toMapCoordinates(warning.encounter.position1.now),
        toMapCoordinates(warning.encounter.position1.encounter),
      ]),
    });
    path1.setStyle(pathStyle);
    features.push(path1);
    const path2 = new Feature({
      geometry: new LineString([
        toMapCoordinates(warning.encounter.position2.now),
        toMapCoordinates(warning.encounter.position2.encounter),
      ]),
    });
    path2.setStyle(pathStyle);
    features.push(path2);
    const circle = new Feature({
      geometry: new Circle(
        toMapCoordinates(
          middlePointApproximation(
            warning.encounter.position1.encounter,
            warning.encounter.position2.encounter
          )
        ),
        5000
      ),
    });
    circle.setStyle(circleStyle);
    features.push(circle);
  });

  console.log("toFeatures", performance.now() - time);
  return features;
}

const planeShape = [
  [1, 0],
  [0.8, 0.2],
  [0.3, 0.175],
  [-0.2, 1.1],
  [-0.4, 1.1],
  [-0.1, 0.155],
  [-0.7, 0.125],
  [-0.85, 0.4],
  [-1, 0.4],
  [-1, -0.4],
  [-0.85, -0.4],
  [-0.7, -0.125],
  [-0.1, -0.155],
  [-0.4, -1.1],
  [-0.2, -1.1],
  [0.3, -0.175],
  [0.8, -0.2],
  [1, 0],
];

function toPolygon(flight: Flight, shape: number[][], scale: number): Polygon {
  return new Polygon([
    shape.map(([x, y]) =>
      calc(flight.position, { x: x * scale, y: y * scale }, flight.axis)
    ),
  ]);
}

function calc(
  position: Coordinate,
  delta: Vector,
  axis: {
    roll: Coordinate;
    pitch: Coordinate;
  }
) {
  return transform(
    [
      position.longitude +
        delta.x * axis.roll.longitude +
        delta.y * axis.pitch.longitude,
      position.latitude +
        delta.y * axis.pitch.latitude +
        delta.x * axis.roll.latitude,
    ],
    "EPSG:4326",
    "EPSG:3857"
  );
}

function toMapCoordinates(position: Coordinate) {
  return transform(
    [position.longitude, position.latitude],
    "EPSG:4326",
    "EPSG:3857"
  );
}

export function middlePointApproximation(
  position1: Coordinate,
  position2: Coordinate
) {
  return {
    latitude: (position1.latitude + position2.latitude) / 2,
    longitude: (position1.longitude + position2.longitude) / 2,
  };
}
