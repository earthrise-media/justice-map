import mapboxgl from "mapbox-gl";
import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import PMap, { PMapHandlers, LayerScopedEvent } from "@/lib/pmap";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

type ClickEvent = mapboxgl.MapMouseEvent & mapboxgl.EventData;

function pmTooltip(feature: mapboxgl.MapboxGeoJSONFeature) {
  const properties = feature.properties;
  return `<div class='flex flex-col items-center w-32'>
    <div class="text-2xl font-bold text-gray-800">${properties.D_PM25_2.toLocaleString()}</div>
    <div class="text-purple-400 text-md font-bold pt-1">PM<sub>2.5</sub> index</div>
  </div>`;
}

type MapProps = {};

function Map(props: MapProps, ref: React.Ref<unknown>) {
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

    if (feature.properties.D_PM25_2 > 0) {
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

  function onClick(e: ClickEvent) {
    const map = e.target;
    e.originalEvent.stopPropagation();
  }

  const mapHandlers = useRef<PMapHandlers>();

  mapHandlers.current = {
    onClick,
    onMouseMove,
    onMouseLeave,
  };

  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new PMap(
      {
        container: mapDivRef.current,
        style: "mapbox://styles/tmcw/ckkpwot3j10mt17p1y4ecfvgx",
        boxZoom: false,
        bounds: [
          -127.17773437499999,
          31.052933985705163,
          -111.62109375,
          43.13306116240612,
        ],
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

  return <div ref={mapDivRef} className="flex-auto bg-gray-200"></div>;
}

export default forwardRef(Map);
