import React from 'react'
import HeroSection from './components/HeroSection'

export default function Home() {
  return (
    <main className = "flex min-h-screen flex-col bg-[#121212] container mx-auto px-12 py-4">
      {/* <h1 className="text-white">Welcome to AdepT.dev</h1> */}
      <HeroSection/>
    </main>
  )
}