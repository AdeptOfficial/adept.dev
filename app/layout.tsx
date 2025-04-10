import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

import Navbar from "./components/Navbar"; // Import Navbar

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AdepT.dev",
  description: "PERSONAL WEBSITE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-[#121212] text-white min-h-screen antialiased`}
      >
        {/* Global Navbar */}
        <Navbar />
        {/* Add padding-top to ensure content doesn't get hidden behind the navbar */}
        <div className="pt-20 pb-6">
          {/* Main content */}
          {children}
        </div>
        {/* Analytics */}
        <Analytics />
      </body>
    </html>
  );
}
