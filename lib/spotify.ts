import axios from 'axios';

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
}

interface CachedSpotifyToken {
  access_token: string;
  expires_at: number;
}

// 👇 Required to make `declare global` work in a module
export {};

declare global {
  var cachedSpotifyToken: CachedSpotifyToken | undefined;
}

export async function getAccessToken(): Promise<string> {
  const {
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REFRESH_TOKEN,
    NODE_ENV,
  } = process.env;

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
    throw new Error('Missing Spotify credentials in environment variables');
  }

  const now = Date.now();

  if (global.cachedSpotifyToken && global.cachedSpotifyToken.expires_at > now) {
    if (NODE_ENV === 'development') {
      console.log('♻️ Reusing cached Spotify access token');
    }
    return global.cachedSpotifyToken.access_token;
  }

  try {
    const response = await axios.post<SpotifyTokenResponse>(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: SPOTIFY_REFRESH_TOKEN,
      }),
      {
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, expires_in } = response.data;

    if (!access_token) {
      throw new Error('Spotify returned no access_token');
    }

    global.cachedSpotifyToken = {
      access_token,
      expires_at: now + (expires_in - 60) * 1000,
    };

    if (NODE_ENV === 'development') {
      console.log(`✅ Refreshed Spotify access token (valid for ${expires_in}s)`);
    }

    return access_token;
  } catch (error: any) {
    const errDetails = error.response?.data || error.message;
    console.error('❌ Failed to refresh Spotify access token:', errDetails);
    throw new Error('Spotify token refresh failed');
  }
}
