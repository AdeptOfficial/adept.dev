import { Inter } from "next/font/google";
import { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "./components/Navbar"; // Import Navbar
import "./globals.css";

// Load Inter font
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AdepT.dev",
  description: "PERSONAL WEBSITE",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* No need for inline style tag, since Tailwind handles the font globally */}
      </head>
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
