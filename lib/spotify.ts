import axios from 'axios';

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

  try {
    const response = await axios.post(
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

    if (NODE_ENV === 'development') {
      console.log('✅ Refreshed Spotify access token (expires in', expires_in, 'seconds)');
    }

    if (!access_token) {
      throw new Error('Spotify returned no access_token');
    }

    return access_token;
  } catch (error: any) {
    const errDetails = error.response?.data || error.message;
    console.error('❌ Failed to refresh Spotify access token:', errDetails);

    throw new Error('Spotify token refresh failed');
  }
}
