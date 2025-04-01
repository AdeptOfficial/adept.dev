'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

const DiscordProfile: React.FC = () => {
    const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getProfilePic = async () => {
      try {
        const res = await fetch('/api/discord/discordProfilePicture');
        if (!res.ok) {
          throw new Error('Failed to fetch profile picture');
        }
        const data = await res.json();
        setProfilePicUrl(data.profilePicUrl);
      } catch (error: any) {
        console.error('Error fetching profile picture:', error);
        setError(error.message);
      }
    };

    getProfilePic();
  }, []);

  if (error) {
    return <div className="text-white">Error: {error}</div>;
  }

  return (
    <div className="flex justify-center items-center">
      {profilePicUrl ? (
        <div className="relative rounded-full overflow-hidden bg-[#181818] w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 shadow-lg">
          <Image
            src={profilePicUrl}
            alt="Discord Profile"
            className="object-cover"
            fill
          />
        </div>
      ) : (
        <p className="text-white">Loading profile picture...</p>
      )}
    </div>
  );
};

export default DiscordProfile;
