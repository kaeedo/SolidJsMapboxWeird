import { FeatureCollection } from "geojson";
import mapboxgl, { GeoJSONSource } from "mapbox-gl";
import { stores } from "./stores";

const FIT_BOUNDS_OPTIONS = {
  padding: 50,
  easing: (t: number) => 1 - Math.pow(1 - t, 5),
};

const RESET_DURATION = 2000;

type Store = (typeof stores)[0];

export class StoreFinderMap {
  static #isInternalConstructing = false;

  #map: mapboxgl.Map;
  #layers: Set<string> = new Set();

  constructor(mountPoint: HTMLElement) {
    if (!StoreFinderMap.#isInternalConstructing) {
      throw new TypeError(
        "StoreFinderMap is not constructable. Use StoreFinderMap.create(mountPoint: ShadowRoot) instead."
      );
    }
    StoreFinderMap.#isInternalConstructing = false;
    mapboxgl.accessToken = "INSERT TOKEN HERE";

    this.#map = new mapboxgl.Map({
      container: mountPoint,
      // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
      style: "mapbox://styles/mapbox/streets-v12", // style URL
      bounds: new mapboxgl.LngLatBounds(
        [6.02260949059, 45.7769477403],
        [10.4427014502, 47.8308275417]
      ),
      fitBoundsOptions: FIT_BOUNDS_OPTIONS,
    });
  }

  static async create(mountPoint: HTMLElement) {
    StoreFinderMap.#isInternalConstructing = true;
    const instance = new StoreFinderMap(mountPoint);

    const loadedImages: Promise<void>[] = [];

    const marker = "https://static.valoraapis.dev/dist/images/avec-marker.png";

    const promise = new Promise<void>((resolve, reject) => {
      instance.#map.loadImage(marker, (error, image) => {
        if (error) {
          reject(error);
        }

        instance.#map.addImage("myPin", image as ImageBitmap);
        resolve();
      });
    });

    loadedImages.push(promise);

    await Promise.allSettled(loadedImages);

    return instance;
  }

  #renderLayers(stores: Store[]) {
    const allStoresSource = "all-stores";
    const clusterLayer = "cluster";
    const clusterCountLayer = "cluster-count";

    const storesGeoJson: FeatureCollection = {
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

    const render = () => {
      const storeLayerId = "store-layer";

      this.#map.addSource(allStoresSource, {
        type: "geojson",
        data: storesGeoJson,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 35,
      });

      this.#map.addLayer({
        id: storeLayerId,
        type: "symbol",
        source: allStoresSource,
        filter: ["!", ["has", "point_count"]],
        layout: {
          "icon-image": ["get", "marker"],
          "icon-size": 0.4,
          "icon-anchor": "bottom",
        },
      });

      this.#map.addLayer({
        id: clusterLayer,
        type: "circle",
        source: allStoresSource,
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#172E48",
          "circle-radius": 15,
        },
      });

      this.#map.addLayer({
        id: clusterCountLayer,
        type: "symbol",
        source: allStoresSource,
        filter: ["has", "point_count"],
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
      });

      this.#layers.add(storeLayerId).add(clusterLayer).add(clusterCountLayer);
    };

    this.#map.on("load", render);
  }

  renderMap(stores: Store[]) {
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

    (this.#map.getSource("all-stores") as GeoJSONSource)?.setData(geoJson);

    this.#renderLayers(stores);

    this.#map.fitBounds(
      new mapboxgl.LngLatBounds(
        [6.02260949059, 45.7769477403],
        [10.4427014502, 47.8308275417]
      ),
      {
        ...FIT_BOUNDS_OPTIONS,
        duration: RESET_DURATION,
      }
    );
  }
}

const storeFinderMap = async () => {
  const map = await StoreFinderMap.create(document.getElementById("myMap")!);
  map.renderMap(stores);
};

storeFinderMap();
