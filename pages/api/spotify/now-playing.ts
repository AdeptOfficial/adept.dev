import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import NodeCache from 'node-cache';

// Cache result for 10 seconds to avoid rate limiting and spam
const cache = new NodeCache({ stdTTL: 10 }); // Cache expires in 10 seconds for responsiveness

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check cache for "now-playing" data
    const cached = cache.get('now-playing');
    if (cached) {
      return res.status(200).json(cached); // Return cached data if available
    }

    // STEP 1: Get fresh access token from your token API
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:3000`; // Default to localhost if missing
    const tokenRes = await fetch(`${baseURL}/api/spotify/access-token`);
    
    // Check if token request was successful
    if (!tokenRes.ok) {
      return res.status(tokenRes.status).json({ error: 'Failed to fetch access token' });
    }

    const tokenJson = await tokenRes.json();
    const access_token = tokenJson.access_token;

    if (!access_token) {
      return res.status(401).json({ error: 'Missing access token' });
    }

    // STEP 2: Call Spotify's Now Playing endpoint
    const spotifyRes = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    // STEP 3: Handle "nothing playing" case
    if (spotifyRes.status === 204 || !spotifyRes.data || !spotifyRes.data.item) {
      return res.status(204).end(); // Send "No Content" response if nothing is playing
    }

    // STEP 4: Cache and return the data
    const data = spotifyRes.data;
    cache.set('now-playing', data); // Cache the response for 10 seconds
    return res.status(200).json(data); // Send the response

  } catch (error: any) {
    // Handle errors with better logging and messages
    const errMsg = error.response?.data || error.message;
    console.error('Now Playing error:', errMsg);

    // Handle specific error cases
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Unauthorized - invalid or expired token' });
    }

    // General error handler
    return res.status(500).json({ error: 'Failed to fetch now playing', details: errMsg });
  }
}
