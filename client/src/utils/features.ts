import { Flight } from "@websocket-demo/shared";
import { Feature } from "ol";
import Icon from "ol/style/Icon";
import Style from "ol/style/Style";
import plane from "/plane.png";
import { Point } from "ol/geom";
import { transform } from "ol/proj";

export function toFeatures(flights: Flight[], zoom: number): Feature[] {
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
