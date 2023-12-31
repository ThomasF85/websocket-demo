import { Coordinate } from "./Vector";

export type ProximityWarning = {
  flights: { id1: string; id2: string };
  encounter: {
    timeToEncounter: number;
    position1: { now: Coordinate; encounter: Coordinate };
    position2: { now: Coordinate; encounter: Coordinate };
    distance: number;
  };
};
