import axios from 'axios';
import NodeCache from 'node-cache';

// Define an in-memory cache for Spotify tokens (you can replace this with Redis in production)
const tokenCache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

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

// Secure logging function to avoid exposing sensitive data
const secureLog = (message: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message);
  }
};

export async function getAccessToken(): Promise<string> {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN, NODE_ENV } = process.env;

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
    throw new Error('Missing Spotify credentials in environment variables');
  }

  const now = Date.now();

  // First, check if the token is already cached and valid
  const cachedToken = tokenCache.get<CachedSpotifyToken>('spotify_access_token');
  if (cachedToken && cachedToken.expires_at > now) {
    secureLog('♻️ Reusing cached Spotify access token');
    return cachedToken.access_token;
  }

  try {
    // Request a new token from Spotify
    const response = await axios.post<SpotifyTokenResponse>(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: SPOTIFY_REFRESH_TOKEN,
      }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, expires_in } = response.data;

    if (!access_token) {
      throw new Error('Spotify returned no access_token');
    }

    const expires_at = now + (expires_in - 60) * 1000; // 60 seconds buffer before expiration

    // Cache the access token for future use
    tokenCache.set('spotify_access_token', {
      access_token,
      expires_at,
    });

    secureLog(`✅ Refreshed Spotify access token (valid for ${expires_in}s)`);

    return access_token;
  } catch (error: any) {
    // Handle errors gracefully and avoid exposing sensitive data
    const errorMessage = process.env.NODE_ENV === 'production' ? 'Spotify token refresh failed' : error.message;
    console.error('❌ Failed to refresh Spotify access token:', errorMessage);
    throw new Error('Spotify token refresh failed');
  }
}
