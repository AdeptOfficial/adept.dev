'use client';

import { useEffect, useState } from 'react';

const SpotifyAuth = () => {
  const [authUrl, setAuthUrl] = useState<string | null>(null);

  useEffect(() => {
    const buildUrl = () => {
      const isDev = process.env.NODE_ENV === 'development';
      const baseUrl = isDev
        ? 'http://localhost:3000'
        : process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || 'https://adept.dev';

      const redirectUri = `${baseUrl}/api/spotify/callback`;

      const url = new URL('https://accounts.spotify.com/authorize');
      url.searchParams.set('client_id', process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!);
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('redirect_uri', redirectUri);
      url.searchParams.set(
        'scope',
        [
          'user-read-currently-playing',
          'user-read-playback-state',
          'user-read-recently-played',
          'user-top-read',
          'user-read-email',
        ].join(' ')
      );

      setAuthUrl(url.toString());
    };

    buildUrl();
  }, []);

  return (
    <div className="p-10 text-center space-y-4">
      <h1 className="text-2xl font-bold">Spotify Auth</h1>
      {authUrl ? (
        <a
          href={authUrl}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Connect Spotify
        </a>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default SpotifyAuth;
