'use client';

import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <head />
      <body className={`${inter.className} h-full antialiased`}>
        <SessionProvider>
          <div className="flex flex-col min-h-screen bg-[#121212] text-white">
            <Navbar />

            <main className="flex-grow">
              <div className="pt-[64px] pb-6 px-4">
                {children}
              </div>
            </main>

            <Footer />
          </div>
          <Analytics />
        </SessionProvider>
      </body>
    </html>
  );
}
