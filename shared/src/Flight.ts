import { Coordinate } from "./Vector";

export type Flight = {
  id: string;
  flightNumber: string;
  position: Coordinate;
  heading: number;
  axis: {
    roll: Coordinate;
    pitch: Coordinate;
  };
};
