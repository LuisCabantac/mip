import type { Metadata } from "next";
import { Jost } from "next/font/google";

import "./globals.css";

import Header from "@/components/Header";
import Provider from "@/components/Provider";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jost.variable} antialiased`}>
        <Provider>
          <Header />
          {children}
        </Provider>
      </body>
    </html>
  );
}
