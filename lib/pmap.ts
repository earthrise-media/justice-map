import mapboxgl from "mapbox-gl";
import { FeatureCollection } from "geojson";

export const defaultStyle =
  "mapbox://styles/mikelmaron/ckpxhtbgo1bcc17o643bds946";

type ClickEvent = mapboxgl.MapMouseEvent & mapboxgl.EventData;

export const populationLayer = "tabblock2010-06-pophu-blockgr-biqw81";

function makePaint({
  field,
  minramp,
  maxramp,
  high,
  highlight
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
        `hsla(${mincolor}, ${high ? 0 : 0.5 })`,
        maxramp,
        `hsla(${maxcolor}, ${high ? 0 : 0.5 })`,
      ],
      high ? 11 : 9,
      [
        "interpolate",
        ["linear"],
        ["get", field],
        minramp,
        `hsla(${mincolor}, ${high ? 0.5 : 0.5 })`,
        maxramp,
        `hsla(${maxcolor}, ${high ? 0.5 : 0.5 })`,
      ],
      high ? 22 : 11,
      [
        "interpolate",
        ["linear"],
        ["get", field],
        minramp,
        `hsla(${mincolor}, ${high ? 0.5 : 0 })`,
        maxramp,
        `hsla(${maxcolor}, ${high ? 0.5 : 0 })`,
      ],
    ],
  };
}
type FillLayerDetails = mapboxgl.FillLayer & { field: string; label: string; minchart: number; maxchart: number };

export const layers: FillLayerDetails[] = [
  {
    id: "pm2.5-highlights",
    source: "mapbox://mikelmaron.7euwrrvj",
    "source-layer": "cali-projected-6z3k79",
    type: "line",
    field: "D_PM25_2",
    label: "PM<sub>2.5</sub> index",
    minchart: -18064,
    maxchart: 61374,
    paint: {
      "line-width": 1,
      "line-color": "#000000"
    }
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
      minramp: 0,
      maxramp: 12512,
      high: false
    }),
  },
  {
    id: "pm2.5-high",
    source: "mapbox://mikelmaron.7euwrrvj",
    "source-layer": "cali-projected-6z3k79",
    type: "fill",
    field: "D_PM25_2",
    label: "PM<sub>2.5</sub> index",
    minchart: -18064,
    maxchart: 61374,
    paint: makePaint({
      field: "D_PM25_2",
      minramp: 0,
      maxramp: 12512,
      high: true
    }),
  },
  {
    id: "resp-highlights",
    source: "mapbox://mikelmaron.1lin9onj",
    "source-layer": "D_RESP_2geojson",
    type: "line",
    field: "D_RESP_2",
    label: "Respiratory Hazard index",
    minchart: -1036,
    maxchart: 3152,
    paint: {
      "line-width": 1,
      "line-color": "#000000"
    }
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
      minramp: 0,
      maxramp: 1000,
      high: false
    }),
  },
  {
    id: "resp-high",
    source: "mapbox://mikelmaron.1lin9onj",
    "source-layer": "D_RESP_2geojson",
    type: "fill",
    field: "D_RESP_2",
    label: "Respiratory Hazard index",
    minchart: -1036,
    maxchart: 3152,
    paint: makePaint({
      field: "D_RESP_2",
      minramp: 0,
      maxramp: 1000,
      high: true
    }),
  },
  {
    id: "ozone-highlights",
    source: "mapbox://mikelmaron.dctdmrue",
    "source-layer": "D_OZONE_2geojson",
    type: "line",
    field: "D_OZONE_2",
    label: "Ozone index",
    minchart: -95200,
    maxchart: 282000,
    paint: {
      "line-width": 1,
      "line-color": "#000000"
    }
  },
  {
    id: "ozone-low",
    source: "mapbox://mikelmaron.84z3vp5j",
    "source-layer": "D_OZONE_2_bucketgeojson",
    type: "fill",
    field: "D_OZONE_2",
    label: "Ozone index",
    paint: makePaint({
      field: "D_OZONE_2",
      minramp: 0,
      maxramp: 50000,
      high: false
    }),
  },
  {
    id: "ozone-high",
    source: "mapbox://mikelmaron.dctdmrue",
    "source-layer": "D_OZONE_2geojson",
    type: "fill",
    field: "D_OZONE_2",
    label: "Ozone index",
    minchart: -95200,
    maxchart: 282000,
    paint: makePaint({
      field: "D_OZONE_2",
      minramp: 0,
      maxramp: 50000,
      high: true
    }),
  },
  {
    id: "floodfactor-highlights",
    source: "mapbox://mikelmaron.06ifzhs7",
    "source-layer": "flood_factorgeojson",
    type: "line",
    field: "avg_risk_score_all",
    label: "FloodFactor Risk Score",
    minchart: 1,
    maxchart: 10,
    paint: {
      "line-width": 1,
      "line-color": "#000000"
    }
  },
  {
    id: "floodfactor-low",
    source: "mapbox://mikelmaron.528get74",
    "source-layer": "flood_factor_bucketgeojson",
    type: "fill",
    field: "avg_risk_score_all",
    label: "FloodFactor Risk Score",
    paint: makePaint({
      field: "avg_risk_score_all",
      minramp: 1,
      maxramp: 10,
      high: false
    }),
  },
  {
    id: "floodfactor-high",
    source: "mapbox://mikelmaron.06ifzhs7",
    "source-layer": "flood_factorgeojson",
    type: "fill",
    field: "avg_risk_score_all",
    label: "FloodFactor Risk Score",
    minchart: 1,
    maxchart: 10,
    paint: makePaint({
      field: "avg_risk_score_all",
      minramp: 1,
      maxramp: 10,
      high: true
    }),
  }
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
      ...(layer.id.endsWith("low")
        ? {
            minzoom: 0,
            maxzoom: 11,
          }
        : {
            minzoom: 9,
            maxzoom: 22,
          }),
    };
  }

  const popIdx = style.layers.findIndex(
    (layer) => layer.id === populationLayer
  );

  for (let layer of layers) {
    layer.layout = {
      visibility: layer.id.startsWith("pm") ? "visible" : "none",
    };
    style.layers.splice(popIdx, 0, layer);
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
      map.on("mousemove", layer["id"], this.onMouseMove);
      map.on("mouseleave", layer["id"], this.onMouseLeave);
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
