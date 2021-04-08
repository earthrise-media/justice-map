import Head from "next/head";
import Map from "@/components/map";

export default function Home() {
  return (
    <div className="min-h-screen bg-green-200">
      <Head>
        <title>EJScreen</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Map />
      <div className="bg-white rounded-md absolute left-5 top-5 bottom-10 w-64 md:w-80 ring-1 ring-gray-200 shadow-lg flex-col">
        <div className="p-4 font-bold">Justice 40</div>
        <div className="flex-auto overflow-y-auto"></div>
      </div>
    </div>
  );
}
