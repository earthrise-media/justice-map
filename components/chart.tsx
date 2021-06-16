import * as d3 from "d3";
import { useRef, useMemo } from "react";
import { Axis, Orient } from "d3-axis-for-react";
import { useSliderState } from "@react-stately/slider";
import { useSlider, useSliderThumb } from "@react-aria/slider";
import { useFocusRing } from "@react-aria/focus";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { mergeProps } from "@react-aria/utils";
import { useNumberFormatter } from "@react-aria/i18n";

type Data = number[];

function Thumb(props: any) {
  let { state, trackRef, index, height, marginTop } = props;
  let inputRef = useRef(null);
  let { thumbProps, inputProps } = useSliderThumb(
    {
      index,
      trackRef,
      inputRef,
    },
    state
  );

  let { focusProps, isFocusVisible } = useFocusRing();
  return (
    <div
      style={{
        position: "absolute",
        cursor: "pointer",
        transform: `translate(-50%, ${marginTop + height / 4}px)`,
        left: `${state.getThumbPercent(index) * 100}%`,
      }}
    >
      <div
        {...thumbProps}
        style={{
          width: 5,
          height: height / 2,
          borderRadius: 2,
          backgroundColor: isFocusVisible
            ? "orange"
            : state.isThumbDragging(index)
            ? "#000"
            : "#555",
        }}
      >
        <VisuallyHidden>
          <input ref={inputRef} {...mergeProps(inputProps, focusProps)} />
        </VisuallyHidden>
      </div>
    </div>
  );
}

export default function Chart({
  data,
  width,
  setFilter,
}: {
  data: Data;
  width: number;
  setFilter: (arg0: [number, number]) => void;
}) {
  let trackRef = useRef(null);

  const height = 100;
  const margin = { top: 10, left: 10, bottom: 20, right: 10 };

  const bins = useMemo(() => d3.bin().thresholds(30)(data), [data]);
  const domain = d3.extent(data);

  const xScale = d3
    .scaleLinear()
    .domain(domain)
    .range([margin.left, width - margin.right])
    .nice();
  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(bins, (d) => d.length)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  let numberFormatter = useNumberFormatter();
  let state = useSliderState({
    numberFormatter: numberFormatter,
    maxValue: domain[1],
    minValue: domain[0],
    defaultValue: domain,
    step: 1,
    onChange(value) {
      setFilter(value as [number, number]);
    },
  });

  let { trackProps } = useSlider(
    {
      "aria-label": "Range",
    },
    state,
    trackRef
  );

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
      className="relative"
    >
      <svg
        className="absolute top-0 left-0"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        {bins.map((d, i) => {
          return (
            <rect
              key={i}
              fill="#B91C1C"
              x={xScale(d.x0) + 1}
              width={Math.max(0, xScale(d.x1) - xScale(d.x0) - 1)}
              y={yScale(d.length)}
              height={yScale(0) - yScale(d.length)}
            />
          );
        })}
        <g transform={`translate(0, ${height - margin.bottom})`}>
          <Axis
            orient={Orient.bottom}
            scale={xScale}
            ticks={[null, "s"]}
            tickSizeInner={2}
            domainPathProps={{
              stroke: "#ccc",
            }}
            tickLineProps={{
              stroke: "#ccc",
            }}
          />
        </g>
      </svg>
      <div
        style={{
          paddingLeft: `${margin.left}px`,
          paddingRight: `${margin.right}px`,
        }}
      >
        <div
          {...trackProps}
          ref={trackRef}
          style={{
            position: "relative",
            background: "transparent",
            height: height,
            width: " 100%",
          }}
        >
          <div
            style={{
              position: "absolute",
              background: "rgba(0, 0, 0, 0.1)",
              right: `${(1 - state.getThumbPercent(0)) * 100}%`,
              left: 0,
              top: margin.top,
              bottom: margin.bottom,
            }}
          />
          <div
            style={{
              position: "absolute",
              background: "rgba(0, 0, 0, 0.1)",
              left: `${state.getThumbPercent(1) * 100}%`,
              right: 0,
              top: margin.top,
              bottom: margin.bottom,
            }}
          />
          <Thumb
            index={0}
            state={state}
            trackRef={trackRef}
            marginTop={margin.top}
            height={height - margin.bottom - margin.top}
          />
          <Thumb
            index={1}
            state={state}
            trackRef={trackRef}
            marginTop={margin.top}
            height={height - margin.bottom - margin.top}
          />
        </div>
      </div>
    </div>
  );
}
