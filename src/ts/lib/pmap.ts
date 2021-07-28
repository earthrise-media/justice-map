import * as mapboxgl from 'mapbox-gl';
import { FeatureCollection } from 'geojson';
import { Handler } from '../Handler';
import { MapCanvas } from '../components/MapCanvas';
import { Tooltip } from '../components/Tooltip';

export class PmapEvents {
  public static CLICK = 'clickPmap';
  public static ZOOM = 'zoomPmap';
  public static MOUSEMOVE = 'mousemovePmap';
  public static MOUSELEAVE = 'mousemovePmap';
  public static MOUSEEND = 'mousemovePmap';
}

// export const defaultStyle = 'mapbox://styles/mikelmaron/ckpxhtbgo1bcc17o643bds946';
export const defaultStyle = 'mapbox://styles/huncwoty/ckr4usfxp0tqs18jzs7xok2tf';
// export const defaultStyle = 'mapbox://styles/mapbox/satellite-v9';

type ClickEvent = mapboxgl.MapMouseEvent & mapboxgl.EventData;

export const populationLayer = 'tabblock2010-06-pophu-blockgr-biqw81';

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
  const mincolor = '222,37%,14%';
  const maxcolor = '355,99%,55%';
  return {
    'fill-color': [
      'interpolate',
      ['linear'],
      ['zoom'],
      high ? 9 : 0,
      [
        'interpolate',
        ['linear'],
        ['get', field],
        minramp,
        `hsla(${mincolor}, ${high ? 0 : 0.5 })`,
        maxramp,
        `hsla(${maxcolor}, ${high ? 0 : 0.5 })`,
      ],
      high ? 11 : 9,
      [
        'interpolate',
        ['linear'],
        ['get', field],
        minramp,
        `hsla(${mincolor}, ${high ? 0.5 : 0.5 })`,
        maxramp,
        `hsla(${maxcolor}, ${high ? 0.5 : 0.5 })`,
      ],
      high ? 22 : 11,
      [
        'interpolate',
        ['linear'],
        ['get', field],
        minramp,
        `hsla(${mincolor}, ${high ? 0.5 : 0 })`,
        maxramp,
        `hsla(${maxcolor}, ${high ? 0.5 : 0 })`,
      ],
    ],
  };
}
type FillLayerDetails = mapboxgl.FillLayer & { field: string; label: string; minchart: number; maxchart: number };
type LineLayerDetails = mapboxgl.LineLayer & { field: string; label: string; minchart: number; maxchart: number };

export const fillLayers: FillLayerDetails[] = [
  {
    id: 'pm2.5-low',
    source: 'mapbox://mikelmaron.baqnetv7',
    'source-layer': 'EJSCREEN_2020_CA_D_PM25_2_dissolve',
    type: 'fill',
    field: 'D_PM25_2',
    label: 'PM<sub>2.5</sub> index',
    minchart: -18064,
    maxchart: 61374,
    paint: makePaint({
      field: 'D_PM25_2',
      minramp: 0,
      maxramp: 12512,
      high: false,
    }),
  },
  {
    id: 'pm2.5-high',
    source: 'mapbox://mikelmaron.7euwrrvj',
    'source-layer': 'cali-projected-6z3k79',
    type: 'fill',
    field: 'D_PM25_2',
    label: 'PM<sub>2.5</sub> index',
    minchart: -18064,
    maxchart: 61374,
    paint: makePaint({
      field: 'D_PM25_2',
      minramp: 0,
      maxramp: 12512,
      high: true,
    }),
  },
  {
    id: 'resp-low',
    source: 'mapbox://mikelmaron.0xhwv3w2',
    'source-layer': 'D_RESP_2_bucketgeojson',
    type: 'fill',
    field: 'D_RESP_2',
    label: 'Respiratory Hazard index',
    minchart: -1036,
    maxchart: 3152,
    paint: makePaint({
      field: 'D_RESP_2',
      minramp: 0,
      maxramp: 1000,
      high: false,
    }),
  },
  {
    id: 'resp-high',
    source: 'mapbox://mikelmaron.1lin9onj',
    'source-layer': 'D_RESP_2geojson',
    type: 'fill',
    field: 'D_RESP_2',
    label: 'Respiratory Hazard index',
    minchart: -1036,
    maxchart: 3152,
    paint: makePaint({
      field: 'D_RESP_2',
      minramp: 0,
      maxramp: 1000,
      high: true,
    }),
  },
  {
    id: 'ozone-low',
    source: 'mapbox://mikelmaron.84z3vp5j',
    'source-layer': 'D_OZONE_2_bucketgeojson',
    type: 'fill',
    field: 'D_OZONE_2',
    label: 'Ozone index',
    minchart: -95200,
    maxchart: 282000,
    paint: makePaint({
      field: 'D_OZONE_2',
      minramp: 0,
      maxramp: 50000,
      high: false,
    }),
  },
  {
    id: 'ozone-high',
    source: 'mapbox://mikelmaron.dctdmrue',
    'source-layer': 'D_OZONE_2geojson',
    type: 'fill',
    field: 'D_OZONE_2',
    label: 'Ozone index',
    minchart: -95200,
    maxchart: 282000,
    paint: makePaint({
      field: 'D_OZONE_2',
      minramp: 0,
      maxramp: 50000,
      high: true,
    }),
  },
  {
    id: 'floodfactor-low',
    source: 'mapbox://mikelmaron.528get74',
    'source-layer': 'flood_factor_bucketgeojson',
    type: 'fill',
    field: 'avg_risk_score_all',
    label: 'FloodFactor Risk Score',
    minchart: 1,
    maxchart: 10,
    paint: makePaint({
      field: 'avg_risk_score_all',
      minramp: 1,
      maxramp: 10,
      high: false,
    }),
  },
  {
    id: 'floodfactor-high',
    source: 'mapbox://mikelmaron.06ifzhs7',
    'source-layer': 'flood_factorgeojson',
    type: 'fill',
    field: 'avg_risk_score_all',
    label: 'FloodFactor Risk Score',
    minchart: 1,
    maxchart: 10,
    paint: makePaint({
      field: 'avg_risk_score_all',
      minramp: 1,
      maxramp: 10,
      high: true,
    }),
  },
];

export const highlightLayers: LineLayerDetails[] = [
  {
    id: 'pm2.5-highlights',
    source: 'mapbox://mikelmaron.7euwrrvj',
    'source-layer': 'cali-projected-6z3k79',
    type: 'line',
    field: 'D_PM25_2',
    label: 'PM<sub>2.5</sub> index',
    minchart: -18064,
    maxchart: 61374,
    paint: {
      'line-width': 1,
      'line-color': '#CB1717',
    },
  },
  {
    id: 'resp-highlights',
    source: 'mapbox://mikelmaron.1lin9onj',
    'source-layer': 'D_RESP_2geojson',
    type: 'line',
    field: 'D_RESP_2',
    label: 'Respiratory Hazard index',
    minchart: -1036,
    maxchart: 3152,
    paint: {
      'line-width': 1,
      'line-color': '#CB1717',
    },
  },
  {
    id: 'ozone-highlights',
    source: 'mapbox://mikelmaron.dctdmrue',
    'source-layer': 'D_OZONE_2geojson',
    type: 'line',
    field: 'D_OZONE_2',
    label: 'Ozone index',
    minchart: -95200,
    maxchart: 282000,
    paint: {
      'line-width': 1,
      'line-color': '#CB1717',
    },
  },
  {
    id: 'floodfactor-highlights',
    source: 'mapbox://mikelmaron.06ifzhs7',
    'source-layer': 'flood_factorgeojson',
    type: 'line',
    field: 'avg_risk_score_all',
    label: 'FloodFactor Risk Score',
    minchart: 1,
    maxchart: 10,
    paint: {
      'line-width': 1,
      'line-color': '#CB1717',
    },
  },
];

// export const populationLayer: mapboxgl.SymbolLayer = {
//   id: 'tabblock2010-06-pophu-blockgr-biqw81',
//   minzoom: 8,
//   source: 'mapbox://mikelmaron.atjg5hx9',
//   'source-layer': 'tabblock2010_06_pophu_blockgr-biqw81',
//   type: 'symbol',
// };

// const accessToken = 'pk.eyJ1IjoibWlrZWxtYXJvbiIsImEiOiJjaWZlY25lZGQ2cTJjc2trbmdiZDdjYjllIn0.Wx1n0X7aeCQyDTnK6_mrGw';
const accessToken = 'pk.eyJ1IjoiaHVuY3dvdHkiLCJhIjoiY2lwcW04em50MDA1OWkxbnBldXVoMXFrdCJ9.kQro-nPHRoqP_XKLLsR3gA';


// tslint:disable-next-line: no-any
async function loadAndAugmentStyle(styleId: string): Promise<any> {
  // TODO: cheap way of doing this. instead, we may want to
  // vendor this bit of gl-js instead.
  const url =
    styleId.replace('mapbox://styles/', 'https://api.mapbox.com/styles/v1/') +
    '?optimize=true&access_token=' +
    accessToken;

  const style = (await (await fetch(url)).json()) as mapboxgl.Style;

  for (let layer of fillLayers) {
    const url = layer['source'] as string;
    style.sources[url] = {
      type: 'vector',
      url,
      ...(layer.id.endsWith('low')
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

  for (let layer of highlightLayers) {
    const url = layer['source'] as string;
    style.sources[url] = {
      type: 'vector',
      url,
      ...(layer.id.endsWith('low')
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


  for (let layer of highlightLayers) {
    layer.layout = {
      visibility: 'none',
    };
    style.layers.splice(style.layers.length, 0, layer);
  }

  for (let layer of fillLayers) {
    layer.layout = {
      visibility: 'none',
    };
    style.layers.splice(style.layers.length, 0, layer);
  }


  return style;
}

export type LayerScopedEvent = mapboxgl.MapMouseEvent & {
  features?: mapboxgl.MapboxGeoJSONFeature[];
} & mapboxgl.EventData;


export default class PMap extends Handler {

  public map: mapboxgl.Map;
  public featuresSource: mapboxgl.GeoJSONSource;

  public lastSelection: Selection;
  public lastGeoJSON: FeatureCollection;
  public lastStyle: string;

  constructor( options: mapboxgl.MapboxOptions ) {
    super();

    mapboxgl.accessToken = accessToken;
    const map = <mapboxgl.Map>new mapboxgl.Map(options);

    map.getCanvas().style.cursor = 'default';
    map.on('click', this.onClick);
    map.on('zoomstart', this.onZoomStart);

    for (let layer of fillLayers) {
      map.on('mousemove', layer['id'], this.onMouseMove);
      map.on('mouseleave', layer['id'], function(e): void {
        const map = e.target;
        map.getCanvas().style.cursor = 'default';
        if (MapCanvas.instance.hoverPopup) {
          // console.log('remove popup');
          MapCanvas.instance.hoverPopup.remove();
          MapCanvas.instance.lastPopupData = null;
        }
      });
    }
    map.on('moveend', function(e): void {
      // console.log('end');
      const map = e.target;
      const isZoomed = map.getZoom() > 9;

      if (!MapCanvas.instance.isLayersShown) { return; }

      Tooltip.instance.toggleExtraData(isZoomed);
      if (!isZoomed) {
        // this.setViewportData(null);
        const layerConfig = highlightLayers.filter(
          (l) =>
            l.id.endsWith('-highlights') &&
            MapCanvas.instance.mapComp.map.getLayoutProperty(l.id, 'visibility') === 'visible'
        )[0];
        map.setFilter(layerConfig['id'], null);
        return;
      }

      MapCanvas.instance.countMapFeatures(map);
    });

    map.addControl(
      new mapboxgl.NavigationControl({
        showCompass: false,
      }),
    );

    this.setStyle(defaultStyle);

    this.map = map;
  }

  public onClick = (e: ClickEvent) => {
      this.trigger(PmapEvents.CLICK, e);
  };

  public onZoomStart = (e: ClickEvent) => {
    this.trigger(PmapEvents.ZOOM, e);
};

  public onMouseMove = (e: LayerScopedEvent) => {
    this.trigger(PmapEvents.MOUSEMOVE, e);
  };

  public onMouseLeave = (e: LayerScopedEvent) => {
    this.trigger(PmapEvents.MOUSELEAVE, e);
  };

  public onMoveEnd = (e: mapboxgl.MapMouseEvent) => {
    this.trigger(PmapEvents.MOUSEEND, e);
  };

  public async setData(geojson: FeatureCollection): Promise<void> {
    if (geojson === this.lastGeoJSON) { return; }
    if (!this.featuresSource) { return; }
    this.featuresSource.setData(geojson);

    this.lastGeoJSON = geojson;
  }

  public async setStyle(styleId: string): Promise<void> {
    if (styleId === this.lastStyle) { return; }
    this.lastStyle = styleId;
    const style = await loadAndAugmentStyle(styleId);

    this.map.setStyle(style, { diff: false });

    await this.map.once('style.load');
  }

  public remove(): void {
    this.map.remove();
  }
}
