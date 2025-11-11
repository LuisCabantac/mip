import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();

    return cookieStore.get("auth-token")?.value || null;
  } catch {
    return null;
  }
}

export async function getUserData(): Promise<{
  id: string;
  email: string;
} | null> {
  try {
    const cookieStore = await cookies();
    const userData = cookieStore.get("user-data")?.value;

    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();

  return !!token;
}

export async function signOut(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete("auth-token");
  cookieStore.delete("user-data");

  redirect("/login");
}
