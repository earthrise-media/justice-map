import { useState } from "react";
import Head from "next/head";
import Map from "@/components/map";
import Chart from "@/components/chart";
import { ViewportData } from "../types";

type Indicator = {
  long: React.ReactNode;
  short: string;
  color: string;
  layer: string;
};

const indicators: Indicator[] = [
  {
    short: "PM2.5",
    long: (
      <>
        PM<sub>2.5</sub> describes fine inhalable particles, with diameters that
        are generally 2.5 micrometers and smaller. Under the Clean Air Act, EPA
        sets and reviews national air quality standards for PM. /{" "}
        <a
          className="text-blue-500 underline"
          href="https://www.epa.gov/air-trends/particulate-matter-pm25-trends"
        >
          {" "}
          Source: EPA.gov
        </a>
      </>
    ),
    color: "text-blue-600",
    layer: "pm2.5",
  },
  {
    short: "Respiratory hazard",
    long: "Air toxics respiratory hazard index",
    color: "text-purple-600",
    layer: "resp",
  },
  {
    short: "Ozone",
    long: "Ozone level in air",
    color: "text-green-600",
    layer: "ozone",
  },
  {
    short: "FloodFactor",
    long: "FloodFactor",
    color: "text-yellow-600",
    layer: "floodfactor",
  },
];

export default function Home() {
  const [viewportData, setViewportData] = useState<ViewportData>(null);
  const [filter, setFilter] = useState<[number, number]>([-1500, 1500]);
  const [indicatorsMenu, setIndicatorsMenu] = useState<boolean>(false);
  const [indicator, setIndicator] = useState<Indicator>(indicators[0]);

  return (
    <div className="min-h-screen bg-gray-200 flex items-stretch">
      <Head>
        <title>Justice 40 explorations by Earthrise</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex-col w-64 bg-white shadow-lg md:w-96 ring-1 ring-gray-200">
        <div className="flex items-center justify-between p-4 font-bold bg-gray-100 text-md">
          <div className="font-bold text-md">Justice 40 explorations</div>
          <div className="text-sm font-thin p-3">an open collaboration to experiment with data and technology organized by <a href="https://earthrise.media/">Earthrise</a></div>
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
                      setIndicator(indicator);
                      setIndicatorsMenu(false);
                    }}
                    className={`text-lg py-1 font-bold block ${indicator.color}`}
                  >
                    {indicator.short}
                  </button>
                ))}
              </div>
            ) : (
              <>
                <div className={"flex pt-3 items-center " + indicator.color}>
                  <div className="text-4xl font-bold">{indicator.short}</div>
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
                <div className="pt-3 text-md">{indicator.long}</div>
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
                      <Chart
                        data={viewportData.indicator}
                        width={300}
                        setFilter={setFilter}
                        extent={viewportData.extent}
                      />
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
      <Map
        filter={filter}
        setViewportData={setViewportData}
        layer={indicator.layer}
      />
    </div>
  );
}
