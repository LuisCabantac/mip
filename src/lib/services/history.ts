import { cookies } from "next/headers";

import { GeolocationData } from "@/lib/schema";

export async function getAllHistory() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/history`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch geolocation data: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

export async function createHistory(geolocationData: GeolocationData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      throw new Error("No authentication token found");
    }

    const requestBody = {
      geolocationData,
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/history`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch geolocation data: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}
