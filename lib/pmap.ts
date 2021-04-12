import mapboxgl from "mapbox-gl";
import { FeatureCollection } from "geojson";

const defaultStyle = "mapbox://styles/mikelmaron/ckmxwzmzq19pp17pr9j778ik8";

type ClickEvent = mapboxgl.MapMouseEvent & mapboxgl.EventData;

const targetLayer = "ejscreen-2020-ca-d-pm25-2-dissolve copy";

const accessToken =
  "pk.eyJ1IjoibWlrZWxtYXJvbiIsImEiOiJjaWZlY25lZGQ2cTJjc2trbmdiZDdjYjllIn0.Wx1n0X7aeCQyDTnK6_mrGw";

async function loadAndAugmentStyle(styleId: string) {
  // TODO: cheap way of doing this. instead, we may want to
  // vendor this bit of gl-js instead.
  const url =
    styleId.replace("mapbox://styles/", "https://api.mapbox.com/styles/v1/") +
    "?optimize=true&access_token=" +
    accessToken;

  const style = (await (await fetch(url)).json()) as mapboxgl.Style;

  // style.sources!["ej"] = {
  //   type: "vector",
  //   tiles: ["http://localhost:4000/{z}/{x}/{y}.pbf"],
  //   maxzoom: 10,
  //   minzoom: 4,
  // };

  // style.layers.push({
  //   id: "ej",
  //   source: "ej",
  //   "source-layer": "EJSCREEN_2020_USPRgeojsonl",
  //   type: "fill",
  //   paint: {
  //     "fill-antialias": false,
  //     "fill-color": [
  //       "interpolate",
  //       ["linear"],
  //       ["get", "CANCER"],
  //       0,
  //       "rgba(33,102,172,0)",
  //       100,
  //       "rgb(178,24,43)",
  //     ],
  //   },
  // });

  return style;
}

export type LayerScopedEvent = mapboxgl.MapMouseEvent & {
  features?: mapboxgl.MapboxGeoJSONFeature[];
} & mapboxgl.EventData;

export type PMapHandlers = {
  onClick: (e: ClickEvent) => void;
  onMouseMove: (e: LayerScopedEvent) => void;
  onMouseLeave: (e: LayerScopedEvent) => void;
};

export default class PMap {
  map: mapboxgl.Map;
  featuresSource: mapboxgl.GeoJSONSource;
  handlers: React.MutableRefObject<PMapHandlers>;

  lastSelection: Selection;
  lastGeoJSON: FeatureCollection;
  lastStyle: string;

  constructor(
    options: mapboxgl.MapboxOptions,
    handlers: React.MutableRefObject<PMapHandlers>
  ) {
    mapboxgl.accessToken = accessToken;
    const map = new mapboxgl.Map(options);
    map.getCanvas().style.cursor = "default";
    map.on("click", this.onClick);
    map.on("mousemove", targetLayer, this.onMouseMove);
    map.on("mouseleave", targetLayer, this.onMouseLeave);

    map.addControl(
      new mapboxgl.NavigationControl({
        showCompass: false,
      })
    );

    this.setStyle(defaultStyle).then(() => {
      // this.setData(defaultData);
    });

    this.map = map;
    this.handlers = handlers;
  }

  onClick = (e: ClickEvent) => {
    this.handlers.current.onClick(e);
  };

  onMouseMove = (e: LayerScopedEvent) => {
    this.handlers.current.onMouseMove(e);
  };

  onMouseLeave = (e: LayerScopedEvent) => {
    this.handlers.current.onMouseLeave(e);
  };

  async setData(geojson: FeatureCollection) {
    if (geojson === this.lastGeoJSON) {
      return;
    }
    if (!this.featuresSource) {
      return;
    }
    this.featuresSource.setData(geojson);
    this.lastGeoJSON = geojson;
  }

  async setStyle(styleId: string) {
    if (styleId === this.lastStyle) return;
    this.lastStyle = styleId;
    const style = await loadAndAugmentStyle(styleId);
    this.map.setStyle(style, { diff: false });
    await this.map.once("style.load");
  }

  remove() {
    this.map.remove();
  }
}
