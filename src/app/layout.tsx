import type { Metadata } from "next";
import { Jost } from "next/font/google";

import "./globals.css";
import { isAuthenticated, signOut } from "@/lib/auth";

import Header from "@/components/Header";
import Provider from "@/components/Provider";
import { Toaster } from "@/components/ui/sonner";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { default: "mIP", template: "%s - mIP" },
  description: "mIP — a modern web app built with Next.js",
  openGraph: {
    title: "mIP",
    description: "mIP — a modern web app built with Next.js",
    url: "https://mip-web.vercel.app",
    siteName: "mIP",
    images: [{ url: "https://mip-web.vercel.app/app-logo.png" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authenticated = await isAuthenticated();

  return (
    <html lang="en">
      <body className={`${jost.variable} antialiased`}>
        <Provider>
          <Header isAuthenticated={authenticated} onSignOut={signOut} />
          {children}
        </Provider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
