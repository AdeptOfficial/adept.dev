import { Inter } from "next/font/google";
import { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AdepT.dev",
  description: "PERSONAL WEBSITE",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <head />
      <body className={`${inter.className} h-full antialiased`}>
        <div className="flex flex-col min-h-screen bg-[#121212] text-white">
          {/* Fixed Navbar (assumed height ~64px) */}
          <Navbar />

          {/* Main content area fills the space */}
          <main className="flex-grow">
            <div className="pt-[64px] pb-6 px-4">
              {children}
            </div>
          </main>

          {/* Always visible at bottom */}
          <Footer />
        </div>

        <Analytics />
      </body>
    </html>
  );
}
