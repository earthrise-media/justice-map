import { useState } from "react";
import Head from "next/head";
import Map from "@/components/map";

type Indicator = {
  long: string;
  short: string;
  color: string;
};

const indicators = [
  {
    short: "Pre-1960s Housing",
    long: "% pre-1960 housing (lead paint indicator)",
    color: "yellow",
  },
  {
    short: "Diesel particulate matter",
    long: "Diesel particulate matter level in air",
    color: "red",
  },
  {
    short: "Air toxics cancer risk",
    long: "Air toxics cancer risk",
    color: "purple",
  },
  {
    short: "Respiratory hazard",
    long: "Air toxics respiratory hazard index",
    color: "purple",
  },
  { short: "Traffic", long: "Traffic proximity and volume", color: "blue" },
  {
    short: "Water pollution",
    long: "Indicator for major direct dischargers to water",
    color: "blue",
  },
  {
    short: "National Priorities List",
    long: "Proximity to National Priorities List (NPL) sites",
    color: "yellow",
  },
  {
    short: "Risk Management Plan",
    long: "Proximity to Risk Management Plan (RMP) facilities",
    color: "yellow",
  },
  {
    short: "Treatment Storage and Disposal",
    long: "Proximity to Treatment Storage and Disposal (TSDF) facilities",
    color: "pink",
  },
  { short: "Ozone", long: "Ozone level in air", color: "blue" },
  { short: "PM2.5", long: "PM2.5 level in air", color: "blue" },
];

function IndicatorSelection({ onClose }: { onClose: () => void }) {
  return (
    <div className="pt-3">
      {indicators.map((indicator) => (
        <button
          onClick={() => onClose()}
          className={`text-lg py-1 font-bold block text-${indicator.color}-600`}
        >
          {indicator.short}
        </button>
      ))}
    </div>
  );
}

export default function Home() {
  const [indicatorsMenu, setIndicatorsMenu] = useState<boolean>(false);
  return (
    <div className="min-h-screen bg-gray-200 flex items-stretch">
      <Head>
        <title>EJScreen</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-white w-64 md:w-80 ring-1 ring-gray-200 shadow-lg flex-col">
        <div className="p-4 text-md font-bold bg-gray-100 flex items-center justify-between">
          <div className="text-md font-bold">EJSCREEN</div>
          <div className="text-sm font-thin">Climate Justice</div>
        </div>
        <div className="flex-auto overflow-y-auto">
          <div className="pt-5 px-5">
            <button
              onClick={() => setIndicatorsMenu((val) => !val)}
              className="border border-gray-400 rounded-md px-2 py-0.5 flex items-center"
            >
              Indicators
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="ml-2 h-3 w-3"
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
              <IndicatorSelection onClose={() => setIndicatorsMenu(false)} />
            ) : (
              <>
                <div className="flex pt-3 items-center text-purple-600">
                  <div className="font-bold text-4xl">PM2.5</div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 h-8 w-8"
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
                    className="underline text-blue-500"
                    href="https://www.epa.gov/air-trends/particulate-matter-pm25-trends"
                  >
                    Source: EPA.gov
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Map />
    </div>
  );
}
