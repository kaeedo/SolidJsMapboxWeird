import { createSignal } from "solid-js";
import { render } from "solid-js/web";
import MapGL, { Viewport, Source, Image, Layer } from "solid-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { FeatureCollection, GeoJsonProperties, Geometry } from "geojson";
import { stores } from "./stores";

export function StoreMap(props: {
  geoJson: FeatureCollection<Geometry, GeoJsonProperties>;
}) {
  const defaultViewport = {
    bounds: new mapboxgl.LngLatBounds(
      [6.02260949059, 45.7769477403],
      [10.4427014502, 47.8308275417]
    ),
    zoom: 11,
  } as Viewport;
  const [viewport, setViewport] = createSignal(defaultViewport);

  const geoJson = () => props.geoJson;

  return (
    <>
      <MapGL
        style={{ width: "100%", height: "100%" }}
        options={{
          style: "mapbox://styles/mapbox/streets-v12",
          accessToken: "INSERT TOKEN HERE",
        }}
        viewport={viewport()}
        onViewportChange={(evt: Viewport) => setViewport(evt)}
      >
        <Image
          id={"myPin"}
          source={"https://static.valoraapis.dev/dist/images/avec-marker.png"}
        />
        <Source
          source={{
            type: "geojson",
            data: geoJson(),
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 35,
          }}
        >
          <Layer
            style={{
              type: "circle",
              paint: {
                "circle-color": "#172E48",
                "circle-radius": 15,
                "circle-pitch-scale": "viewport",
              },
            }}
            filter={["has", "point_count"]}
          />

          <Layer
            filter={["!", ["has", "point_count"]]}
            style={{
              type: "symbol",
              layout: {
                "icon-image": ["get", "marker"],
                "icon-size": 0.4,
                "icon-anchor": "bottom",
              },
            }}
          />
          <Layer
            style={{
              type: "symbol",
              layout: {
                "text-field": ["get", "point_count_abbreviated"],
                "text-font": ["Inter Bold", "Arial Unicode MS Regular"],
                "text-size": 12,
                "text-anchor": "center",
                "text-offset": [0, 0.08],
              },
              paint: {
                "text-color": "#ffffff",
              },
            }}
            filter={["has", "point_count"]}
          />
        </Source>
      </MapGL>
    </>
  );
}

const map = () => {
  const geoJson: FeatureCollection = {
    type: "FeatureCollection",
    features: stores.map((store) => {
      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [
            +store.coordinates.longitude,
            +store.coordinates.latitude,
          ],
        },
        properties: {
          marker: "myPin",
        },
      };
    }),
  };

  render(
    () => <StoreMap geoJson={geoJson} />,
    document.getElementById("myMap")!
  );
};

map();
