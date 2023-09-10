import { Vector } from "./Vector";

export type Flight = {
  id: string;
  flightNumber: string;
  airline: string;
  arrival: string;
  departure: string;
  position: Vector;
};
