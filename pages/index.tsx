import Head from "next/head";
import Map from "@/components/map";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-200 flex items-stretch">
      <Head>
        <title>EJScreen</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-white w-64 md:w-80 ring-1 ring-gray-200 shadow-lg flex-col">
        <div className="p-4 text-2xl font-bold">Justice 40</div>
        <div className="flex-auto overflow-y-auto"></div>
      </div>
      <Map />
    </div>
  );
}
