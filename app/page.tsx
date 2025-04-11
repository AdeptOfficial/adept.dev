export const dynamic = 'force-dynamic'; // 👈 Ensures this page is never statically cached

import HeroSection from "./components/HeroSection";
import React from "react";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-[#121212]">
      <HeroSection />
    </main>
  );
}
