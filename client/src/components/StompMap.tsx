import { toFeatures } from "../utils/features";
import MapWrapper from "./Map";
import { useRef } from "react";
import { useStomp } from "../hooks/useStomp";

export default function StompMap({ interval }: { interval: number }) {
  const { connected, flights } = useStomp(interval);
  const zoomRef = useRef<number | undefined>();

  return (
    <>
      <div>WebSocket is connected: {connected.toString()}</div>
      <MapWrapper
        onZoomChange={(zoom?: number) => {
          zoomRef.current = zoom;
        }}
        features={toFeatures(flights, zoomRef.current || 9)}
      />
    </>
  );
}
