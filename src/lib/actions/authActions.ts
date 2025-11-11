"use server";

import { cookies } from "next/headers";

import { Credentials } from "@/lib/schema";

export async function signIn({ email, password }: Credentials) {
  try {
    const requestBody = {
      email,
      password,
    };

    const response = await fetch(`${process.env.API_URL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      return { error: response.status, message: "Sign in failed" };
    }

    const data = await response.json();

    if (!data?.data?.token || !data?.data?.user) {
      return {
        error: 401,
        message: "Invalid credentials or missing authentication data",
      };
    }

    const cookieStore = await cookies();

    cookieStore.set("auth-token", data.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    cookieStore.set("user-data", JSON.stringify(data.data.user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return { success: true, message: "Sign in successful" };
  } catch {
    return { error: 500, message: "An error occurred during authentication" };
  }
}
