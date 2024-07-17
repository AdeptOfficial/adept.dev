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
  // w-full sm:w-auto sm:mx-auto md:w-[500px] md:h-[500px] h-[500px] lg:w-[500px] lg:h-[400px]
  return (
    <div className="col-span-5">
      {profilePicUrl ? (
        <div className="relative rounded-full w-[500px] h-[500px] overflow-hidden bg-[#181818] sm:w-auto sm:mx-auto mt-5 md:w-[500px] md:h-[500px] h-[500px] lg:w-[700px] lg:h-[700px] lg:-translate-x-1/4">
          <Image src={profilePicUrl}
            alt="Discord Profile"
            className='absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2'
            width={1024}
            height={1024}
            //layout="fill" 
            //objectFit="cover"
          />
        </div>
      ) : (
        <p className='text-white'>Loading profile picture...</p>
      )}
    </div>
  );
};

export default DiscordProfile;
