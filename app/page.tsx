import HeroSection from "./components/HeroSection";
import DiscordProfile from './components/DiscordProfile';
import React from 'react';

export default function Home() {
  return (
    <main className = "flex min-h-screen min-w-full flex-col bg-[#121212] container mx-auto px-12 py-4">
      {/* <h1 className="text-white">Welcome to AdepT.dev</h1> */}
      <HeroSection/>
      <DiscordProfile />
    </main>
  )
}