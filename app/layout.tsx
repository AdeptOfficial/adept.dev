import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react"; // ✅ Correct import path for App Router
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AdepT.dev",
  description: "PERSONAL WEBSITE", // fixed typo
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Analytics /> {/* ✅ Add this here to enable tracking */}
      </body>
    </html>
  );
}
