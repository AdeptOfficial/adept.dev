import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 10 }); // Cache for 10 seconds

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const cached = cache.get('now-playing');
    if (cached) return res.status(200).json(cached);

    // 🔁 Dynamically build baseURL from request
    const protocol = req.headers.host?.startsWith('localhost') ? 'http' : 'https';
    const baseURL = `${protocol}://${req.headers.host}`;
    const tokenUrl = `${baseURL}/api/spotify/access-token`;

    console.log(`[NOW PLAYING] Fetching access token from: ${tokenUrl}`);

    const tokenRes = await fetch(tokenUrl);

    // 🔐 Catch and log HTML error pages
    const raw = await tokenRes.text();
    let tokenJson: any;

    try {
      tokenJson = JSON.parse(raw);
    } catch (err) {
      console.error('❌ Access token API returned invalid JSON:', raw.slice(0, 200));
      return res.status(500).json({
        error: 'Failed to parse access token response',
        details: raw.slice(0, 200),
      });
    }

    const access_token = tokenJson.access_token;
    if (!access_token) {
      console.warn('⚠️ No access token found in token response:', tokenJson);
      return res.status(401).json({ error: 'Missing access token' });
    }

    // 🎧 Request currently playing track from Spotify
    const spotifyRes = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (spotifyRes.status === 204 || !spotifyRes.data || !spotifyRes.data.item) {
      return res.status(204).end(); // Nothing is playing
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
