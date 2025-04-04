import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import NodeCache from 'node-cache';
import { getAccessToken } from '@/lib/spotify';

// Cache valid responses for 10s (can be adjusted based on use case)
const cache = new NodeCache({ stdTTL: 10 });

const secureLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, data); // Only log sensitive data in development
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Step 1: Implement rate limiting for backend requests (example: 10 requests per minute)
  if (req.method === 'GET') {
    try {
      const cached = cache.get('now-playing');
      if (cached) {
        secureLog('🎵 Returning cached Now Playing');
        return res.status(200).json(cached);
      }

      // Step 2: Get the access token (handles token expiration and refresh)
      const access_token = await getAccessToken();

      if (!access_token) {
        console.warn('⚠️ No access token from getAccessToken');
        return res.status(401).json({ error: 'Missing access token' });
      }

      let spotifyRes;
      try {
        // Step 3: Fetch the current playing track from Spotify
        spotifyRes = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });
      } catch (err: any) {
        const data = err.response?.data;
        const code = err.response?.status || 500;
        console.error('❌ Spotify API fetch failed:', data || err.message);

        // Handle 401 Unauthorized (e.g., expired token)
        if (code === 401) {
          return res.status(401).json({ error: 'Access token expired or unauthorized', details: data });
        }

        // Return the error from Spotify API
        return res.status(code).json({
          error: 'Spotify API call failed',
          details: data || err.message,
        });
      }

      // Step 4: If no track is playing, return 204 No Content
      if (spotifyRes.status === 204 || !spotifyRes.data || !spotifyRes.data.item) {
        secureLog('⏸ Nothing is currently playing');
        return res.status(204).end(); // No content
      }

      const nowPlaying = spotifyRes.data;

      // Step 5: Cache the valid track data
      cache.set('now-playing', nowPlaying);

      // Step 6: Log track info in development (no sensitive data in production)
      secureLog('🎧 Now playing:', {
        track: nowPlaying.item?.name,
        artist: nowPlaying.item?.artists?.map((a: any) => a.name).join(', '),
      });

      return res.status(200).json(nowPlaying);

    } catch (error: any) {
      // Step 7: Handle general errors
      const errMsg = process.env.NODE_ENV === 'production' ? 'Unexpected failure while fetching now playing' : error.message;
      console.error('🎧 Now Playing general error:', errMsg);

      return res.status(500).json({
        error: 'Unexpected failure while fetching now playing',
        details: errMsg,
      });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' }); // Only GET method is allowed
  }
}
