import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import NodeCache from 'node-cache';
import { getAccessToken } from '@/lib/spotify'; // Adjust the path as needed

const cache = new NodeCache({ stdTTL: 10 });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const cached = cache.get('now-playing');
    if (cached) return res.status(200).json(cached);

    // 🔐 Use internal token getter
    const access_token = await getAccessToken();

    if (!access_token) {
      return res.status(401).json({ error: 'Missing access token' });
    }

    const spotifyRes = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (spotifyRes.status === 204 || !spotifyRes.data || !spotifyRes.data.item) {
      return res.status(204).end();
    }

    const nowPlaying = spotifyRes.data;
    cache.set('now-playing', nowPlaying);

    return res.status(200).json(nowPlaying);
  } catch (error: any) {
    const errMsg = error.response?.data || error.message;
    console.error('🎧 Now Playing error:', errMsg);

    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Unauthorized — invalid or expired token' });
    }

    return res.status(500).json({ error: 'Failed to fetch now playing', details: errMsg });
  }
}
