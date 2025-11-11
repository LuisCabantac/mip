import { Metadata } from "next";

import HomePage from "@/components/HomePage";
import {
  createHistory,
  deleteMultipleHistory,
  getAllHistory,
} from "@/lib/services/history";
import { GeolocationData } from "@/lib/schema";
import { getUserData, isAuthenticated } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to mIP.",
};

export default async function Home() {
  const authenticated = await isAuthenticated();
  const userData = await getUserData();

  async function handleCreateHistory(geolocationData: GeolocationData) {
    "use server";

    await createHistory(geolocationData);
    return;
  }

  async function handleDeleteHistory(ids: string[]) {
    "use server";

    await deleteMultipleHistory(ids);
    return;
  }

  async function handleGetAllHistory() {
    "use server";

    const response = await getAllHistory();
    return response;
  }

  return (
    <HomePage
      onCreateHistory={handleCreateHistory}
      isAuthenticated={authenticated}
      userData={userData}
      onGetAllHistory={handleGetAllHistory}
      onDeleteHistory={handleDeleteHistory}
    />
  );
}
