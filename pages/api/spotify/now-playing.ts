import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import NodeCache from 'node-cache';
import { getAccessToken } from '@/lib/spotify';

const cache = new NodeCache({ stdTTL: 10 }); // Cache for 10 seconds

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const cached = cache.get('now-playing');
    if (cached) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🎵 Returning cached Now Playing');
      }
      return res.status(200).json(cached);
    }

    const access_token = await getAccessToken();

    if (!access_token) {
      console.warn('⚠️ Access token is missing after getAccessToken');
      return res.status(401).json({ error: 'Missing access token' });
    }

    let spotifyRes;
    try {
      spotifyRes = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
    } catch (err: any) {
      const data = err.response?.data;
      const code = err.response?.status || 500;
      console.error('❌ Spotify API fetch failed:', data || err.message);

      if (code === 401) {
        return res.status(401).json({ error: 'Access token expired or unauthorized', details: data });
      }

      return res.status(code).json({
        error: 'Spotify API call failed',
        details: data || err.message,
      });
    }

    if (spotifyRes.status === 204 || !spotifyRes.data || !spotifyRes.data.item) {
      return res.status(204).end(); // Nothing is playing
    }

    const nowPlaying = spotifyRes.data;
    cache.set('now-playing', nowPlaying);

    if (process.env.NODE_ENV === 'development') {
      const track = nowPlaying.item?.name;
      const artist = nowPlaying.item?.artists?.map((a: any) => a.name).join(', ');
      console.log(`🎧 Now playing: ${track} — ${artist}`);
    }

    return res.status(200).json(nowPlaying);
  } catch (error: any) {
    const errMsg = error.response?.data || error.message;
    console.error('🎧 Now Playing general error:', errMsg);

    return res.status(500).json({
      error: 'Unexpected failure while fetching now playing',
      details: errMsg,
    });
  }
}
