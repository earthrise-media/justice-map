import mapboxgl from "mapbox-gl";
import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { sum } from "lodash";
import { ViewportData } from "../types";
import PMap, {
  defaultStyle,
  populationLayer,
  layers,
  PMapHandlers,
  LayerScopedEvent,
} from "@/lib/pmap";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

function pmTooltip(val: number, label: string) {
  return `<div class='flex flex-col items-center w-32'>
    <div class="text-2xl font-bold text-gray-800">${Math.floor(
      val
    ).toLocaleString()}</div>
    <div class="text-purple-400 text-md font-bold pt-1">${label}</div>
  </div>`;
}

type MapProps = {
  setViewportData: (data: ViewportData) => void;
  filter: [number, number];
  layer: string;
};

function MapComponent(
  { setViewportData, filter, layer }: MapProps,
  ref: React.Ref<unknown>
) {
  const hoverPopup = useRef<mapboxgl.Popup | null>(null);
  const mapRef = useRef<PMap>(null);
  const mapDivRef = useRef<HTMLDivElement>(null);

  function fitBounds(coord: [number, number, number, number]) {
    mapRef.current.map.fitBounds(coord, {
      padding: 200,
      animate: false,
    });
  }

  function onMouseMove(e: LayerScopedEvent) {
    const map = e.target;
    if (e.features.length == 0) return;
    const feature = e.features[0];

    const layerConfig = layers.filter((l) => l.id == feature.layer.id)[0];
    if (feature.properties[layerConfig.field] !== undefined) {
      map.getCanvas().style.cursor = "pointer";

      if (!hoverPopup.current) {
        hoverPopup.current = new mapboxgl.Popup({
          closeOnClick: false,
          closeButton: false,
          offset: [0, -2],
        });
      }

      const content = pmTooltip(
        feature.properties[layerConfig.field],
        layerConfig.label
      );

      hoverPopup.current.setLngLat(e.lngLat).setHTML(content).addTo(map);
    } else {
      map.getCanvas().style.cursor = "default";
      if (hoverPopup.current) {
        hoverPopup.current.remove();
      }
    }
  }

  function onMouseLeave(e: LayerScopedEvent) {
    const map = e.target;
    map.getCanvas().style.cursor = "default";
    if (hoverPopup.current) {
      hoverPopup.current.remove();
    }
  }

  function setCenter(coord: mapboxgl.LngLatLike) {
    mapRef.current.map.setCenter(coord);
    mapRef.current.map.zoomTo(15);
  }

  useImperativeHandle(ref, () => ({
    setCenter,
    fitBounds,
  }));

  function onClick(e: mapboxgl.MapboxEvent<MouseEvent>) {
    e.originalEvent.stopPropagation();
  }

  function countMapFeatures(map: mapboxgl.Map) {
    if (map.getZoom() < 9) return;
    const populationFeatures = map.queryRenderedFeatures(undefined, {
      layers: [populationLayer],
    });

    let populationCounts = new Map<number, number>();
    for (let feature of populationFeatures) {
      if ("POP10" in feature.properties) {
        populationCounts.set(feature.id as number, feature.properties.POP10);
      }
    }
    const totalPopulation = sum(Array.from(populationCounts.values()));

    const layerConfig = layers.filter(
      (l) =>
        l.id.endsWith("-high") &&
        map.getLayoutProperty(l.id, "visibility") == "visible"
    )[0];

    let indicatorFeatures = map.queryRenderedFeatures(undefined, {
      layers: [layerConfig["id"]],
    });
    let indicator = indicatorFeatures
      .map(function (feature): number {
        return feature.properties[layerConfig["field"]];
      })
      .filter(function (val) {
        return val !== undefined;
      })
      .sort(function (a, b) {
        return a - b;
      });

    setViewportData({
      totalPopulation,
      numberOfBlockgroups: populationCounts.size,
      indicator,
    });
  }

  function onMoveEnd(e: mapboxgl.MapMouseEvent) {
    const map = e.target; //typescript complains about how queryRenderedFeatures called here
    if (map.getZoom() < 9) {
      setViewportData(null);
      map.setFilter("block-highlights", null);
      return;
    }
    map.on("idle", () => countMapFeatures(map));
  }

  const mapHandlers = useRef<PMapHandlers>();

  mapHandlers.current = {
    onClick,
    onMouseMove,
    onMouseLeave,
    onMoveEnd,
  };

  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new PMap(
      {
        container: mapDivRef.current,
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
      mapHandlers
    );

    return () => {
      mapRef.current.remove();
      mapRef.current = null;
    };
  }, [mapRef, mapDivRef]);

  useEffect(() => {
    try {
      const layerConfig = layers.filter(
        (l) =>
          l.id.endsWith("-high") &&
          mapRef.current.map.getLayoutProperty(l.id, "visibility") == "visible"
      )[0];

      mapRef.current.map.setFilter("block-highlights", [
        "all",
        [">=", ["to-number", ["get", layerConfig["field"]]], filter[0]],
        ["<=", ["to-number", ["get", layerConfig["field"]]], filter[1]],
      ]);
    } catch (e) {
      // pass
    }
  }, [mapRef, filter, layer]);

  useEffect(() => {
    try {
      for (let l of layers) {
        mapRef.current.map.setLayoutProperty(
          l.id,
          "visibility",
          l.id.startsWith(layer) ? "visible" : "none"
        );
      }
    } catch (e) {
      // Doing this sort of update with GL JS is pretty
      // awful, just ignore the error here.
    }
  }, [mapRef, layer]);

  return <div ref={mapDivRef} className="flex-auto bg-gray-200"></div>;
}

export default forwardRef(MapComponent);
