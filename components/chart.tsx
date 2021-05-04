import * as d3 from "d3";
import { Axis, Orient } from "d3-axis-for-react";

type Data = number[];

export default function Chart({ data, width }: { data: Data; width: number }) {
  const height = 60;
  const margin = { top: 10, left: 20, bottom: 20, right: 20 };

  const bins = d3.bin().thresholds(30)(data);

  const xScale = d3
    .scaleLinear()
    .domain([-15000, 15000])
    .range([margin.left, width - margin.right])
    .nice();
  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(bins, (d) => d.length)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
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
  );
}
