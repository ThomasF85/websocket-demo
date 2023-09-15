import { Coordinate } from "./Vector";

export type Flight = {
  id: string;
  flightNumber: string;
  position: Coordinate;
  heading: number;
  velocity: number;
  axis: {
    roll: Coordinate;
    pitch: Coordinate;
  };
};
