import { toFeatures } from "../utils/features";
import MapWrapper from "./Map";
import { useWebsocket } from "../hooks/useWebsocket";
import { useRef } from "react";

export default function WebsocketMap({ interval }: { interval: number }) {
  const { connected, flights } = useWebsocket(interval);
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
