import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import NodeCache from 'node-cache';

// Cache result for 10 seconds to avoid rate limiting and spam
const cache = new NodeCache({ stdTTL: 10 }); // 10 seconds for responsiveness

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check cache for "now-playing" data
    const cached = cache.get('now-playing');
    if (cached) {
      res.status(200).json(cached); // Send cached response
      return; // Ensure the handler does not return a value
    }

    // STEP 1: Get fresh access token from your token API
    const tokenRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/spotify/access-token`);
    const tokenJson = await tokenRes.json();

    const access_token = tokenJson.access_token;
    if (!access_token) {
      res.status(401).json({ error: 'Missing access token' });
      return; // Ensure the handler does not return a value
    }

    // STEP 2: Call Spotify's Now Playing endpoint
    const spotifyRes = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    // STEP 3: Handle "nothing playing"
    if (
      spotifyRes.status === 204 || // Nothing is playing
      !spotifyRes.data ||
      spotifyRes.data === '' ||
      spotifyRes.data.item == null
    ) {
      res.status(204).end(); // Send "No Content" response
      return; // Ensure the handler does not return a value
    }

    // STEP 4: Cache and return the data
    const data = spotifyRes.data;
    cache.set('now-playing', data); // Cache the response for 10 seconds
    res.status(200).json(data); // Send the response
  } catch (error: any) {
    const errMsg = error.response?.data || error.message;
    console.error('Now Playing error:', errMsg);

    if (error.response?.status === 401) {
      res.status(401).json({ error: 'Unauthorized - invalid or expired token' });
      return; // Ensure the handler does not return a value
    }

    res.status(500).json({ error: 'Failed to fetch now playing', details: errMsg });
  }
}
