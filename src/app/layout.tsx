import type { Metadata } from "next";
import { Jost } from "next/font/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./globals.css";

import Header from "@/components/Header";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
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

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jost.variable} antialiased`}>
        <Header />
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
