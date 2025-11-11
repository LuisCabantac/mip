import { Metadata } from "next";

import HomePage from "@/components/HomePage";
import { createHistory } from "@/lib/services/history";
import { GeolocationData } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to mIP.",
};

export default function Home() {
  async function handleCreateHistory(geolocationData: GeolocationData) {
    "use server";

    await createHistory(geolocationData);
    return;
  }
  return <HomePage onCreateHistory={handleCreateHistory} />;
}
