export async function getUserIPInfo() {
  try {
    const response = await fetch("https://ipinfo.io/geo", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch ip data: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

export async function getGeoInfoByIP(ipAdress: string) {
  try {
    const response = await fetch(
      `https://api.ipinfo.io/lite/${ipAdress}?token=${process.env.NEXT_PUBLIC_IPINFO_TOKEN}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
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
