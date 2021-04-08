import mapboxgl from "mapbox-gl";
import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { FeatureCollection } from "geojson";
import PMap, { PMapHandlers, LayerScopedEvent, planetLayers } from "@/lib/pmap";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

type ClickEvent = mapboxgl.MapMouseEvent & mapboxgl.EventData;

let hoveredId: number;

function onMouseEnter(e: LayerScopedEvent) {
  const map = e.target;
  map.setFeatureState(
    {
      source: "features",
      id: e.features[0].id,
    },
    {
      state: "hover",
    }
  );
  hoveredId = e.features[0].id as number;
  map.getCanvas().style.cursor = "pointer";
}

function onMouseLeave(e: LayerScopedEvent) {
  const map = e.target;
  if (hoveredId !== null) {
    map.removeFeatureState({
      source: "features",
      id: hoveredId,
    });
    hoveredId = null;
  }
  map.getCanvas().style.cursor = "default";
}

function Map(props: any, ref: React.Ref<unknown>) {
  const mapRef = useRef<PMap>(null);
  const mapDivRef = useRef<HTMLDivElement>(null);

  function fitBounds(coord: [number, number, number, number]) {
    mapRef.current.map.fitBounds(coord, {
      padding: 200,
      animate: false,
    });
  }

  function setCenter(coord: mapboxgl.LngLatLike) {
    mapRef.current.map.setCenter(coord);
    mapRef.current.map.zoomTo(15);
  }

  useImperativeHandle(ref, () => ({
    setCenter,
    fitBounds,
  }));

  function onClick(e: ClickEvent) {
    const map = e.target;
    e.originalEvent.stopPropagation();
  }

  const mapHandlers = useRef<PMapHandlers>();

  mapHandlers.current = {
    onClick,
    onMouseEnter,
    onMouseLeave,
  };

  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new PMap(
      {
        container: mapDivRef.current,
        style: "mapbox://styles/tmcw/ckkpwot3j10mt17p1y4ecfvgx",
        boxZoom: false,
        bounds: [-129.375, 18.646245142670608, -62.9296875, 53.54030739150022],
        minZoom: 4,
        maxZoom: 17,
        dragRotate: false,
        attributionControl: false,
      },
      mapHandlers
    );

    return () => {
      mapRef.current.remove();
      mapRef.current = null;
    };
  }, [mapRef, mapDivRef]);

  return (
    <>
      <div
        ref={mapDivRef}
        style={{
          position: "absolute",
        }}
        className="bg-gray-200 inset-0"
      ></div>
    </>
  );
}

export default forwardRef(Map);
