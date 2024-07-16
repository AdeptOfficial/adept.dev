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
        console.log('Fetched data:', data);
        setProfilePicUrl(data.profilePicUrl);
      } catch (error: any) {
        console.error('Error fetching profile picture:', error);
        setError(error.message);
      }
    };

    getProfilePic();
  }, []);

  if (error) {
    return <div className='text-white'>Error: {error}</div>;
  }

  return (
    <div>
      {profilePicUrl ? (
        <Image src={profilePicUrl} alt="Discord Profile" width={500} height={500} />
      ) : (
        <p className='text-white'>Loading profile picture...</p>
      )}
    </div>
  );
};

export default DiscordProfile;
