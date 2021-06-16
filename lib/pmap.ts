import mapboxgl from "mapbox-gl";
import { FeatureCollection } from "geojson";

export const defaultStyle =
  "mapbox://styles/mikelmaron/ckpxhtbgo1bcc17o643bds946";

type ClickEvent = mapboxgl.MapMouseEvent & mapboxgl.EventData;

const dissolveLayer = "ejscreen-2020-ca-d-pm25-2-dissolve copy";
export const populationLayer = "tabblock2010-06-pophu-blockgr-biqw81";
export const targetLayer = "cali-projected-6z3k79 copy";

function makePaint({
  field,
  minramp,
  maxramp,
  high,
}: {
  field: string;
  minramp: number;
  maxramp: number;
  high: boolean;
}): mapboxgl.FillPaint {
  const mincolor = "232, 88%, 100%";
  const maxcolor = "0, 98%, 56%";
  return {
    "fill-color": [
      "interpolate",
      ["linear"],
      ["zoom"],
      high ? 9 : 0,
      [
        "interpolate",
        ["linear"],
        ["get", field],
        minramp,
        `hsla(${mincolor}, 0)`,
        maxramp,
        `hsla(${maxcolor}, 0)`,
      ],
      high ? 11 : 9,
      [
        "interpolate",
        ["linear"],
        ["get", field],
        minramp,
        `hsla(${mincolor}, 0.5)`,
        maxramp,
        `hsla(${maxcolor}, 0.5)`,
      ],
      high ? 22 : 11,
      [
        "interpolate",
        ["linear"],
        ["get", field],
        minramp,
        `hsla(${mincolor}, 0.5)`,
        maxramp,
        `hsla(${maxcolor}, 0.5)`,
      ],
    ],
  };
}
type FillLayerDetails = mapboxgl.FillLayer & {field: string, label: string}

export const layers: FillLayerDetails[] = [
  {
    id: "pm2.5-high",
    source: "mapbox://mikelmaron.7euwrrvj",
    "source-layer": "cali-projected-6z3k79",
    type: "fill",
    field: "D_PM25_2",
    label: "PM<sub>2.5</sub> index",
    paint: makePaint({
      field: "D_PM25_2",
      minramp: -3228,
      maxramp: 12512,
      high: true,
    }),
  },
  {
    id: "pm2.5-low",
    source: "mapbox://mikelmaron.baqnetv7",
    "source-layer": "EJSCREEN_2020_CA_D_PM25_2_dissolve",
    type: "fill",
    field: "D_PM25_2",
    label: "PM<sub>2.5</sub> index",
    paint: makePaint({
      field: "D_PM25_2",
      minramp: -3228,
      maxramp: 12512,
      high: false,
    }),
  },
  {
    id: "resp-high",
    source: "mapbox://mikelmaron.1lin9onj",
    "source-layer": "D_RESP_2geojson",
    type: "fill",
    field: "D_RESP_2",
    label: "Respiratory Hazard index",
    paint: makePaint({
      field: "D_RESP_2",
      minramp: -1036,
      maxramp: 3152,
      high: true,
    }),
  },
  {
    id: "resp-low",
    source: "mapbox://mikelmaron.0xhwv3w2",
    "source-layer": "D_RESP_2_bucketgeojson",
    type: "fill",
    field: "D_RESP_2",
    label: "Respiratory Hazard index",
    paint: makePaint({
      field: "D_RESP_2",
      minramp: -1036,
      maxramp: 3152,
      high: false,
    }),
  },
];

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

  for (let layer of layers) {
    const url = layer["source"] as string;
    style.sources[url] = {
      type: "vector",
      url,
      ...(layer.id.endsWith("high")
        ? {
            minzoom: 9,
            maxzoom: 22,
          }
        : {
            minzoom: 0,
            maxzoom: 11,
          }),
    };
  }

  const highlightsIdx = style.layers.findIndex(
    (layer) => layer.id === "block-highlights"
  );

  for (let layer of layers) {
    layer.layout = {
      visibility: layer.id.startsWith("pm") ? "visible" : "none",
    };
    style.layers.splice(highlightsIdx, 0, layer);
  }

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

    for (let layer of layers) {
      map.on("mousemove", layer['id'], this.onMouseMove);
      map.on("mouseleave", layer['id'], this.onMouseLeave);
    }
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
