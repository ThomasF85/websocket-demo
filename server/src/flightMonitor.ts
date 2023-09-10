import { nanoid } from "nanoid";
import { Plane } from "@websocket-demo/shared";

type Vector = {
  x: number;
  y: number;
};

const planes: Plane[] = [
  {
    id: "plane1",
    position: {
      longitude: 8,
      latitude: 50,
    },
  },
  {
    id: "plane2",
    position: {
      longitude: 9,
      latitude: 51,
    },
  },
];

const velocities: Record<string, Vector> = {
  plane1: {
    x: 1,
    y: 1,
  },
  plane2: {
    x: 2,
    y: 0,
  },
};

const callbacks: Record<string, (planes: Plane[]) => void> = {};

setInterval(() => {
  planes.forEach((plane) => {
    const velocity = velocities[plane.id];
    plane.position.longitude += velocity.x * 0.1;
    plane.position.latitude += velocity.y * 0.1;
  });
  Object.values(callbacks).forEach((callback) => callback(planes));
}, 50);

export function subscribe(callback: (planes: Plane[]) => void): string {
  const id = nanoid();
  callbacks[id] = callback;
  console.log("new client connected", id);
  return id;
}

export function unsubscribe(id: string): void {
  delete callbacks[id];
  console.log("client disconnected", id);
}
