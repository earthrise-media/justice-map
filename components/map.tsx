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
    <div class="text-2xl font-bold text-gray-800">${Math.floor(properties.D_PM25_2).toLocaleString()}</div>
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

  function onClick(e: ClickEvent) {
    const map = e.target;
    e.originalEvent.stopPropagation();
  }

  function onMoveEnd(e: DragEvent) {
    const map = e.target;
    if (map.getZoom() < 9) {
      document.getElementById('stat').style.display = 'none';
      map.setFilter('block-highlights',
        ['in',
         ['get','D_PM25_2'],
         ['literal',[]]
       ]
      );
      return;
    }

    document.getElementById('stat').style.display = "block";

    const popLayer = "tabblock2010-06-pophu-blockgr-biqw81";
    const pop = map.queryRenderedFeatures({layers: [popLayer]});
    let ids = {};
    let popTotal = 0;

    pop.forEach(function (feature) {
      if (! (feature.id in ids) && 'POP10' in feature.properties) {
        ids[feature.id] = true;
        popTotal += feature.properties['POP10'];
      }
    });
    document.getElementById('pop').innerHTML = popTotal;

    const pm25Layer = "cali-projected-6z3k79 copy";
    let pm25 = map.queryRenderedFeatures({layers:[pm25Layer]});
    pm25 = pm25.map(function (feature) { return feature.properties['D_PM25_2']})
               .filter(function (val) { return val !== undefined})
               .sort(function(a, b) { return a - b });
    document.getElementById('blocks').innerHTML = pm25.length;

    if (pm25.length > 10) {
      pm25 = pm25.slice(pm25.length-10);
    }

    map.setFilter('block-highlights',
      ['in',
       ['get','D_PM25_2'],
       ['literal',pm25]
    ]);
  }

  const mapHandlers = useRef<PMapHandlers>();

  mapHandlers.current = {
    onClick,
    onMouseMove,
    onMouseLeave,
    onMoveEnd
  };

  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new PMap(
      {
        container: mapDivRef.current,
        style: "mapbox://styles/mikelmaron/ckmxwzmzq19pp17pr9j778ik8",
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

  return <div ref={mapDivRef} className="flex-auto bg-gray-200"></div>;
}

export default forwardRef(Map);
