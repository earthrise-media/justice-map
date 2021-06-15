import { useState } from "react";
import Head from "next/head";
import Map from "@/components/map";
import Chart from "@/components/chart";
import { ViewportData } from "../types";
import useDimensions from "react-cool-dimensions";

type Indicator = {
  long: string;
  short: string;
  color: string;
  layer: string;
};

const indicators: Indicator[] = [
  //  {
  //    short: "Pre-1960s Housing",
  //    long: "% pre-1960 housing (lead paint indicator)",
  //    color: "yellow",
  //  },
  //  {
  //    short: "Diesel particulate matter",
  //    long: "Diesel particulate matter level in air",
  //    color: "red",
  //  },
  //  {
  //    short: "Air toxics cancer risk",
  //    long: "Air toxics cancer risk",
  //    color: "purple",
  //  },
  {
    short: "Respiratory hazard",
    long: "Air toxics respiratory hazard index",
    color: "purple",
    layer: "resp",
  },
  //  { short: "Traffic", long: "Traffic proximity and volume", color: "blue" },
  //  {
  //    short: "Water pollution",
  //    long: "Indicator for major direct dischargers to water",
  //    color: "blue",
  //  },
  //  {
  //    short: "National Priorities List",
  //    long: "Proximity to National Priorities List (NPL) sites",
  //    color: "yellow",
  //  },
  //  {
  //    short: "Risk Management Plan",
  //    long: "Proximity to Risk Management Plan (RMP) facilities",
  //    color: "yellow",
  //  },
  //  {
  //    short: "Treatment Storage and Disposal",
  //    long: "Proximity to Treatment Storage and Disposal (TSDF) facilities",
  //    color: "pink",
  //  },
  //  { short: "Ozone", long: "Ozone level in air", color: "blue", layer: 'ozone' },
  { short: "PM2.5", long: "PM2.5 level in air", color: "blue", layer: "pm2.5" },
];

export default function Home() {
  const [viewportData, setViewportData] = useState<ViewportData>(null);
  const [filter, setFilter] = useState<[number, number]>([-1500, 1500]);
  const [indicatorsMenu, setIndicatorsMenu] = useState<boolean>(false);
  const { observe, width } = useDimensions();
  const [indicator, setIndicator] = useState<string>("PM2.5");
  const [color, setColor] = useState<string>("blue");
  const [layer, setLayer] = useState<string>("pm2.5");

  return (
    <div className="min-h-screen bg-gray-200 flex items-stretch">
      <Head>
        <title>EJScreen</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex-col w-64 bg-white shadow-lg md:w-96 ring-1 ring-gray-200">
        <div className="flex items-center justify-between p-4 font-bold bg-gray-100 text-md">
          <div className="font-bold text-md">EJSCREEN</div>
          <div className="text-sm font-thin">Climate Justice</div>
        </div>
        <div className="flex-auto overflow-y-auto">
          <div className="px-5 pt-5">
            <button
              onClick={() => setIndicatorsMenu((val) => !val)}
              className="border border-gray-400 rounded-md px-2 py-0.5 flex items-center"
            >
              Indicators
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3 h-3 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {indicatorsMenu ? (
              <div className="pt-3">
                {indicators.map((indicator) => (
                  <button
                    key={indicator.short}
                    onClick={() => {
                      setIndicator(indicator.short);
                      setColor(indicator.color);
                      setLayer(indicator.layer);
                      setIndicatorsMenu(false);
                    }}
                    className={`text-lg py-1 font-bold block text-${indicator.color}-600`}
                  >
                    {indicator.short}
                  </button>
                ))}
              </div>
            ) : (
              <>
                <div
                  className={"flex pt-3 items-center text-" + color + "-600"}
                >
                  <div className="text-4xl font-bold">{indicator}</div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-8 h-8 ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                    />
                  </svg>
                </div>
                <div className="pt-3 text-md">
                  PM<sub>2.5</sub> describes fine inhalable particles, with
                  diameters that are generally 2.5 micrometers and smaller.
                  Under the Clean Air Act, EPA sets and reviews national air
                  quality standards for PM.{" / "}
                  <a
                    className="text-blue-500 underline"
                    href="https://www.epa.gov/air-trends/particulate-matter-pm25-trends"
                  >
                    Source: EPA.gov
                  </a>
                </div>
                {viewportData ? (
                  <div className="pt-4">
                    <div className="pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2">
                        <div>
                          <div className="text-2xl font-bold">
                            {viewportData.totalPopulation.toLocaleString()}
                          </div>
                          <div className="text-sm">Population</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">
                            {viewportData.numberOfBlockgroups.toLocaleString()}
                          </div>
                          <div className="text-sm">Blockgroups</div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-8">
                      <div ref={observe} />
                      <div className="pt-4 pb-4 text-sm font-bold border-t border-gray-200">
                        PM2.5 indexes
                      </div>
                      <Chart
                        data={viewportData.pm25}
                        width={width}
                        setFilter={setFilter}
                      />
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
      <Map filter={filter} setViewportData={setViewportData} layer={layer} />
    </div>
  );
}
