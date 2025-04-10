import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

import Navbar from "./components/Navbar"; // ← Import it here

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
        <Navbar /> {/* 👈 Add it globally */}
        <div className="pt-20"> {/* Padding to offset the fixed navbar */}
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  );
}
