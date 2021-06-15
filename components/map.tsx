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
  targetLayer,
  populationLayer,
  layers,
  PMapHandlers,
  LayerScopedEvent,
} from "@/lib/pmap";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

function pmTooltip(feature: mapboxgl.MapboxGeoJSONFeature) {
  const properties = feature.properties;
  return `<div class='flex flex-col items-center w-32'>
    <div class="text-2xl font-bold text-gray-800">${Math.floor(
      properties.D_PM25_2
    ).toLocaleString()}</div>
    <div class="text-purple-400 text-md font-bold pt-1">PM<sub>2.5</sub> index</div>
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
  let layerRef = useRef<string>(null);

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

    if (feature.properties.D_PM25_2 !== undefined) {
      map.getCanvas().style.cursor = "pointer";

      if (!hoverPopup.current) {
        hoverPopup.current = new mapboxgl.Popup({
          closeOnClick: false,
          closeButton: false,
          offset: [0, -2],
        });
      }

      const content = pmTooltip(feature);

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

    let pm25features = map.queryRenderedFeatures(undefined, {
      layers: [targetLayer],
    });
    let pm25 = pm25features
      .map(function (feature): number {
        return feature.properties["D_PM25_2"];
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
      pm25,
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
      mapRef.current.map.setFilter("block-highlights", [
        "all",
        [">=", ["to-number", ["get", "D_PM25_2"]], filter[0]],
        ["<=", ["to-number", ["get", "D_PM25_2"]], filter[1]],
      ]);
    } catch (e) {
      // pass
    }
  }, [mapRef, filter, layer]);

  useEffect(() => {
    if (layer == layerRef.current) return;
    if (!mapRef.current.map.isStyleLoaded()) return;

    layerRef.current = layer;

    if (mapRef.current.map.getSource("highzoom")) {
      mapRef.current.map.removeLayer("highzoom-layer");
      mapRef.current.map.removeSource("highzoom");
    }
    if (mapRef.current.map.getSource("lowzoom")) {
      mapRef.current.map.removeLayer("lowzoom-layer");
      mapRef.current.map.removeSource("lowzoom");
    }

    if (!(layer in layers)) return;

    let layer_config = layers[layer]["highzoom"];

    mapRef.current.map.addSource("highzoom", {
      type: "vector",
      url: layer_config["source"],
      minzoom: 9,
      maxzoom: 22,
    });
    mapRef.current.map.addLayer(
      {
        id: "highzoom-layer",
        type: "fill",
        source: "highzoom",
        "source-layer": layer_config["source_layer"],
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["zoom"],
            9,
            [
              "interpolate",
              ["linear"],
              ["get", layer_config["field"]],
              layer_config["minramp"],
              "hsla(" + layer_config["mincolor"] + ", 0)",
              layer_config["maxramp"],
              "hsla(" + layer_config["maxcolor"] + ", 0)",
            ],
            11,
            [
              "interpolate",
              ["linear"],
              ["get", layer_config["field"]],
              layer_config["minramp"],
              "hsla(" + layer_config["mincolor"] + ", 0.5)",
              layer_config["maxramp"],
              "hsla(" + layer_config["maxcolor"] + ", 0.5)",
            ],
            22,
            [
              "interpolate",
              ["linear"],
              ["get", layer_config["field"]],
              layer_config["minramp"],
              "hsla(" + layer_config["mincolor"] + ", 0.5)",
              layer_config["maxramp"],
              "hsla(" + layer_config["maxcolor"] + ", 0.5)",
            ],
          ],
        },
      },
      "block-highlights"
    );

    layer_config = layers[layer]["lowzoom"];

    mapRef.current.map.addSource("lowzoom", {
      type: "vector",
      url: layer_config["source"],
      minzoom: 0,
      maxzoom: 11,
    });
    mapRef.current.map.addLayer(
      {
        id: "lowzoom-layer",
        type: "fill",
        source: "lowzoom",
        "source-layer": layer_config["source_layer"],
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            [
              "interpolate",
              ["linear"],
              ["get", layer_config["field"]],
              layer_config["minramp"],
              "hsla(" + layer_config["mincolor"] + ", 0.5)",
              layer_config["maxramp"],
              "hsla(" + layer_config["maxcolor"] + ", 0.5)",
            ],
            9,
            [
              "interpolate",
              ["linear"],
              ["get", layer_config["field"]],
              layer_config["minramp"],
              "hsla(" + layer_config["mincolor"] + ", 0.5)",
              layer_config["maxramp"],
              "hsla(" + layer_config["maxcolor"] + ", 0.5)",
            ],
            11,
            [
              "interpolate",
              ["linear"],
              ["get", layer_config["field"]],
              layer_config["minramp"],
              "hsla(" + layer_config["mincolor"] + ", 0)",
              layer_config["maxramp"],
              "hsla(" + layer_config["maxcolor"] + ", 0)",
            ],
          ],
        },
      },
      "block-highlights"
    );
  }, [mapRef, layer]);

  return <div ref={mapDivRef} className="flex-auto bg-gray-200"></div>;
}

export default forwardRef(MapComponent);
