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
        <div className="relative rounded-full overflow-hidden bg-[#181818] mt-5 mx-auto w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] xl:w-[700px] xl:h-[700px]">
          <Image 
            src={profilePicUrl}
            alt="Discord Profile"
            className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
            width={1024}
            height={1024}
          />
        </div>
      ) : (
        <p className='text-white'>Loading profile picture...</p>
      )}
    </div>
  );
};

export default DiscordProfile;
