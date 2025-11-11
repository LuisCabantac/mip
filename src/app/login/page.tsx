import { Metadata } from "next";

import LoginPage from "@/components/LoginPage";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to mIP.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return <LoginPage redirect={redirect} />;
}
