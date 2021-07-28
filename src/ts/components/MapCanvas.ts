import { Component } from './Component';
import * as mapboxgl from 'mapbox-gl';
import { sum } from 'lodash';
import PMap, {
    defaultStyle,
    populationLayer,
    highlightLayers,
    fillLayers,
    LayerScopedEvent,
    PmapEvents,
} from '../lib/pmap';
import { lat2tile, lon2tile, pmTooltip } from '../Utils';
import { Chart } from './Chart';
import { Form } from './Form';
import { Tooltip } from './Tooltip';
import { About } from '../About';

export interface IViewportData {
    totalPopulation: number;
    numberOfBlockgroups: number;
    indicator: number[];
    extent: number[];
}

interface IMapSettings {
    lat?: number;
    lng?: number;
    zoom?: number;
    style?: mapboxgl.Style | string;
    bounds?: [number, number, number, number];
    dataURL?: string;
    dataVersion?: string;
    clusterRadius?: number;
    clusterMaxZoom?: number;
    markers?: number[][];
    scroll?: boolean;
    maxFitZoom?: number;
    token?: string;
}

export class MapCanvas extends Component {

    public static instance: MapCanvas;
    public hoverPopup: mapboxgl.Popup;
    public mapComp: PMap;
    public lastPopupData: number;
    public isLayersShown = false;
    private settings: IMapSettings;
    private charts: Chart[];

    constructor(protected view: HTMLElement, protected options?: string) {
        super(view, options);
        MapCanvas.instance = this;
        this.settings = {
            token: 'pk.eyJ1IjoibWlrZWxtYXJvbiIsImEiOiJjaWZlY25lZGQ2cTJjc2trbmdiZDdjYjllIn0.Wx1n0X7aeCQyDTnK6_mrGw',
        };

        this.init();

    }

    public resize = (wdt: number, hgt: number): void => {
        if (!!this.mapComp.map) {
            this.mapComp.map.resize();
        }
    };


    public countMapFeatures(map: mapboxgl.Map): void {

        const populationFeatures = map.queryRenderedFeatures(undefined, {
            layers: [populationLayer],
        });
        // console.log('countMapFeatures', populationFeatures);
        // console.log(populationFeatures);


        let populationCounts = new Map<number, number>();
        for (let feature of populationFeatures) {
            if ('POP10' in feature.properties) {
                populationCounts.set(feature.id as number, feature.properties.POP10);
            }
        }
        const totalPopulation = sum(Array.from(populationCounts.values()));

        const layerConfig = fillLayers.filter(
            (l) =>
                l.id.endsWith('-high') &&
                map.getLayoutProperty(l.id, 'visibility') === 'visible'
        )[0];

        let indicatorFeatures = map.queryRenderedFeatures(undefined, {
            layers: [layerConfig['id']],
        });
        let indicator = indicatorFeatures
            .map(function (feature): number {
                return feature.properties[layerConfig['field']];
            })
            .filter(function (val) {
                return val !== undefined;
            })
            .sort(function (a, b) {
                return a - b;
            });

        let extent = [layerConfig['minchart'], layerConfig['maxchart']];
        // console.log(totalPopulation, populationCounts.size, indicator, extent);

        Tooltip.instance.updateInfo(populationCounts.size, totalPopulation);
        this.charts[Form.instance.currentIndex].generateChart(indicator, extent);
    }



    public onUpdateFilter(from: number, to: number): void {
        if (this.mapComp.map.getZoom() < 9) { return; }
        try {
            const layerConfig = highlightLayers.filter(
                (l) =>
                    l.id.endsWith('-highlights') &&
                    this.mapComp.map.getLayoutProperty(l.id, 'visibility') === 'visible'
            )[0];

            this.mapComp.map.setFilter(layerConfig['id'], [
                'all',
                ['>=', ['to-number', ['get', layerConfig['field']]], from],
                ['<=', ['to-number', ['get', layerConfig['field']]], to],
            ]);
        } catch (e) {
            // pass
        }
    }



    public onUpdateVisibleLayer(layer: string): void {
        this.isLayersShown = true;
        try {
            for (let l of fillLayers) {
                this.mapComp.map.setLayoutProperty(
                    l.id,
                    'visibility',
                    l.id.startsWith(layer) ? 'visible' : 'none',
                );
            }
            for (let l of highlightLayers) {
                this.mapComp.map.setLayoutProperty(
                    l.id,
                    'visibility',
                    l.id.startsWith(layer) ? 'visible' : 'none',
                );
            }
            // delay because layers not loaded
            setTimeout(() => {
                this.updateTooltipData();
            }, 500);
        } catch (e) {
            console.error(e);

            // Doing this sort of update with GL JS is pretty
            // awful, just ignore the error here.
        }
    }


    public hideLayers(): void {
        this.isLayersShown = false;
        try {
            for (let l of fillLayers) {
                this.mapComp.map.setLayoutProperty(
                    l.id,
                    'visibility',
                    'none',
                );
            }
            for (let l of highlightLayers) {
                this.mapComp.map.setLayoutProperty(
                    l.id,
                    'visibility',
                    'none',
                );
            }
        } catch (e) {
            console.error(e);

            // Doing this sort of update with GL JS is pretty
            // awful, just ignore the error here.
        }
    }



    private init(): void {
        this.charts = [...document.querySelectorAll('.js-chart-item')].map(el => new Chart(<HTMLElement>el));

        // mapboxgl.accessToken = this.settings.token;
        this.lastPopupData = 0;
        this.mapComp = new PMap(
            {
                container: this.view,
                style: defaultStyle,
                boxZoom: false,
                bounds: [
                    -127.17773437499999,
                    31.052933985705163,
                    -111.62109375,
                    43.13306116240612,
                ],
                maxPitch: 0,
                minZoom: 4,
                maxZoom: 17,
                dragRotate: false,
            },
        );
        this.onUpdateFilter(-1500, 1500);
        // from const indicators: Indicator[] = []
        // this.onUpdateVisibleLayer('pm2.5');
        this.mapComp.on(PmapEvents.CLICK, this.onClick);
        this.mapComp.on(PmapEvents.MOUSEMOVE, this.onMouseMove);
        this.mapComp.on(PmapEvents.ZOOM, this.onZoomStart);
        // this.mapComp.on(PmapEvents.MOUSELEAVE, this.onMouseLeave);
        // this.mapComp.on(PmapEvents.MOUSEEND, this.onMoveEnd);
    }



    private onMouseMove = (e: LayerScopedEvent): void => {
        const map = e.target;
        if (!e.features) { return; }
        if (e.features.length === 0) { return; }
        const feature = e.features[0];


        let layerConfig;
        if (map.getZoom() < 9) {
            layerConfig = fillLayers.filter((l) => l.id === feature.layer.id)[0];
        } else {
            layerConfig = fillLayers.filter((l) => l.id === feature.layer.id && l.id.endsWith('-high'))[0];
        }
        if (!layerConfig) { return; }
        if (feature.properties[layerConfig.field] !== undefined) {
            // map.getCanvas().style.cursor = 'pointer';

            if (!!this.hoverPopup) {
                this.hoverPopup.setLngLat(e.lngLat);
            }

            if (feature.properties[layerConfig.field] !== this.lastPopupData) {
                // console.log('add popup', this.lastPopupData);

                if (!this.hoverPopup) {
                    this.hoverPopup = new mapboxgl.Popup({
                        closeOnClick: false,
                        closeButton: false,
                        offset: [0, -15],
                        maxWidth: '400px',
                    });
                }
                const zoom = Math.min(Math.floor(map.getZoom()), 10);
                const center = map.getCenter();

                const x = lon2tile(center.lng, zoom);
                const y = lat2tile(center.lat, zoom);
                const content = pmTooltip(
                    feature.properties[layerConfig.field],
                    layerConfig.label,
                    zoom,
                    x,
                    y,
                );
                this.hoverPopup.setLngLat(e.lngLat).setHTML(content).addTo(map);
                this.lastPopupData = feature.properties[layerConfig.field];
            }

        } else {
            map.getCanvas().style.cursor = 'default';
            if (this.hoverPopup) {
                // console.log('remove popup', this.lastPopupData);
                this.hoverPopup.remove();
                this.lastPopupData = null;
            }
        }
    }



    private onClick(e: mapboxgl.MapboxEvent<MouseEvent>): void {
        e.originalEvent.stopPropagation();
        // const map = e.target;
        // console.log(map.getZoom());
        // console.log(lon2tile(e.lngLat.lng, 13));
        // console.log(lat2tile(e.lngLat.lat, 13));

    }




    private onZoomStart = (): void => {
        if (!!this.hoverPopup) {
            this.hoverPopup.remove();
            this.lastPopupData = null;
        }

        About.instance.hide();
    }



    private updateTooltipData(): void {
        const map = this.mapComp.map;
        const isZoomed = map.getZoom() > 9;

        if (!MapCanvas.instance.isLayersShown) { return; }

        Tooltip.instance.toggleExtraData(isZoomed);
        if (!isZoomed) {
            const layerConfig = highlightLayers.filter(
            (l) =>
                l.id.endsWith('-highlights') &&
                MapCanvas.instance.mapComp.map.getLayoutProperty(l.id, 'visibility') === 'visible'
            )[0];
            map.setFilter(layerConfig['id'], null);
            return;
        }

        MapCanvas.instance.countMapFeatures(map);
    }
}
