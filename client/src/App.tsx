import { Feature } from "ol";
import "./App.css";
import MapWrapper from "./components/Map";
import { useWebSocketInterval } from "./hooks/useWebsocketInterval";
import { Point } from "ol/geom";
import { transform } from "ol/proj";
import { Flight } from "@websocket-demo/shared";
import { useRef, useState } from "react";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import plane from "/plane.png";

function toFeatures(flights: Flight[], zoom: number): Feature[] {
  const scale = zoom < 7.5 ? 0.6 : zoom < 8.5 ? 0.8 : 1;
  return flights.map((flight) => {
    const style = new Style({
      image: new Icon({
        src: plane,
        rotation: flight.heading,
        scale,
      }),
    });
    const feature = new Feature({
      geometry: new Point(
        transform(
          [flight.position.longitude, flight.position.latitude],
          "EPSG:4326",
          "EPSG:3857"
        )
      ),
      name: flight.id,
    });
    feature.setStyle(style);
    return feature;
  });
}

function App() {
  const [interval, setInterval] = useState(250);
  const zoomRef = useRef<number | undefined>();
  const { connected, flights } = useWebSocketInterval(interval);

  return (
    <>
      <header>
        <h1>Websocket demo</h1>
      </header>
      <main>
        <div className="subtitle">
          <p>Websocket is connected: {connected.toString()}</p>
          <label>
            Interval for State updates:{" "}
            <select
              name="interval"
              id="interval"
              value={interval}
              onChange={(e) => setInterval(parseInt(e.target.value))}
            >
              <option value={50}>50 ms</option>
              <option value={100}>100 ms</option>
              <option value={250}>250 ms</option>
              <option value={500}>500 ms</option>
              <option value={1000}>1000 ms</option>
            </select>
          </label>
        </div>
        <MapWrapper
          onZoomChange={(zoom?: number) => {
            zoomRef.current = zoom;
          }}
          features={toFeatures(flights, zoomRef.current || 9)}
        />
      </main>
    </>
  );
}

export default App;
