import HeroSection from "./components/HeroSection";
import React from 'react';

export default function Home() {
  return (
    <main className = "flex min-h-screen min-w-full flex-col bg-[#121212] container mx-auto px-12 py-4">
      {/* TODO: Add nav */}
      <HeroSection/>
      {/* TODO: Add footer */}
    </main>
  )
}