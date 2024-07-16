"use client"
import React from 'react'
import HeroSection from './components/HeroSection'
import UserProfile from './components/UserProfile'
import { useState, useEffect } from 'react';
import fetchDiscordUserProfile from './api/fetchDiscordUserProfile';



export default function Home() {
  const [avatarURL, setAvatarURL] = useState<string | null>(null);

  useEffect(() => {
    // Assume fetchAvatarURL is an async function that fetches the avatar URL
    const fetchAvatarURL = async () => {
      // Fetch or compute the avatar URL
      const url = await fetchDiscordUserProfile();
      setAvatarURL(url);
    };

    fetchAvatarURL();
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <main className = "flex min-h-screen min-w-full flex-col bg-[#121212] container mx-auto px-12 py-4">
      {/* <h1 className="text-white">Welcome to AdepT.dev</h1> */}
      <HeroSection/>
      <UserProfile avatarURL={avatarURL}/>
    </main>
  )
}