import mapboxgl from "mapbox-gl";
import { FeatureCollection } from "geojson";

const defaultStyle = "mapbox://styles/mikelmaron/ckmxwzmzq19pp17pr9j778ik8";

type ClickEvent = mapboxgl.MapMouseEvent & mapboxgl.EventData;

const dissolveLayer = "ejscreen-2020-ca-d-pm25-2-dissolve copy";
export const populationLayer = "tabblock2010-06-pophu-blockgr-biqw81";
export const targetLayer = "cali-projected-6z3k79 copy";

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

  return style;
}

export type LayerScopedEvent = mapboxgl.MapMouseEvent & {
  features?: mapboxgl.MapboxGeoJSONFeature[];
} & mapboxgl.EventData;

export type PMapHandlers = {
  onClick: (e: ClickEvent) => void;
  onMouseMove: (e: LayerScopedEvent) => void;
  onMouseLeave: (e: LayerScopedEvent) => void;
  onMoveEnd: (e: mapboxgl.MapMouseEvent) => void;
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
    map.on("mousemove", dissolveLayer, this.onMouseMove);
    map.on("mouseleave", dissolveLayer, this.onMouseLeave);
    map.on("mousemove", targetLayer, this.onMouseMove);
    map.on("mouseleave", targetLayer, this.onMouseLeave);
    map.on("moveend", this.onMoveEnd);

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

  onMoveEnd = (e: mapboxgl.MapMouseEvent) => {
    this.handlers.current.onMoveEnd(e);
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
