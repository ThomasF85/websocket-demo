import { useState, useEffect, useRef } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import XYZ from "ol/source/XYZ";
import { transform } from "ol/proj";
import { Coordinate, toStringXY } from "ol/coordinate";
import { Geometry } from "ol/geom";
import { Feature, MapBrowserEvent } from "ol";
import "./Map.css";

export default function MapWrapper({
  features,
  onZoomChange,
}: {
  features: Feature<Geometry>[];
  onZoomChange: (zoom?: number) => void;
}) {
  const featuresLayer = useRef<VectorLayer<VectorSource<Geometry>>>();
  const mapElement = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map>();

  const [selectedCoord, setSelectedCoord] = useState<Coordinate>();

  useEffect(() => {
    if (mapRef.current) return;

    featuresLayer.current = new VectorLayer({
      source: new VectorSource(),
    });

    mapRef.current = new Map({
      target: mapElement.current!,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: "http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}",
          }),
        }),

        featuresLayer.current,
      ],
      view: new View({
        projection: "EPSG:3857",
        center: transform([8.6, 50.1], "EPSG:4326", "EPSG:3857"),
        zoom: 9,
      }),
      controls: [],
    });
    mapRef.current.on("moveend", () => {
      onZoomChange(mapRef.current!.getView().getZoom());
    });
    mapRef.current.on("click", handleMapClick);
  }, []);

  useEffect(() => {
    if (features.length && featuresLayer.current && mapRef.current) {
      featuresLayer.current.setSource(
        new VectorSource({
          features,
        })
      );
    }
  }, [features]);

  const handleMapClick = (event: MapBrowserEvent<any>) => {
    const clickedCoord = mapRef.current!.getCoordinateFromPixel(event.pixel);

    const transformedCoord = transform(clickedCoord, "EPSG:3857", "EPSG:4326");

    setSelectedCoord(transformedCoord);
  };

  return (
    <>
      <div ref={mapElement} className="map-container"></div>

      <div className="clicked-coord-label">
        <p>{selectedCoord ? toStringXY(selectedCoord, 5) : ""}</p>
      </div>
    </>
  );
}
