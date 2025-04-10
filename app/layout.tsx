'use client'; // Make this a client component

import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const paddingPages = ["/", "/contact"]; // Add any route you want to pad (e.g., homepage)

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const shouldPad = pathname ? paddingPages.includes(pathname) : false;

  return (
    <html lang="en" className="h-full">
      <head />
      <body className={`${inter.className} h-full antialiased`}>
        <div className="flex flex-col min-h-screen bg-[#121212] text-white">
          <Navbar />

          <main className="flex-grow">
            <div className={shouldPad ? "pt-[64px] pb-6 px-4" : ""}>
              {children}
            </div>
          </main>

          <Footer />
        </div>

        <Analytics />
      </body>
    </html>
  );
}
