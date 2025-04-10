import { NextResponse } from 'next/server';
import axios from 'axios';
import NodeCache from 'node-cache';
import { getAccessToken } from '@/lib/spotify';

const cache = new NodeCache({ stdTTL: 10 }); // Cache for 10 seconds

const secureLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, data);
  }
};

export async function GET() {
  try {
    // 1. Return from cache if available
    const cached = cache.get('now-playing');
    if (cached) {
      secureLog('🎵 Returning cached Now Playing');
      return NextResponse.json(cached);
    }

    // 2. Get server-side access token securely
    const access_token = await getAccessToken();
    if (!access_token) {
      console.warn('⚠️ Missing or invalid Spotify token');
      return NextResponse.json({ error: 'Missing access token' }, { status: 401 });
    }

    // 3. Query Spotify for current playing track
    let spotifyRes;
    try {
      spotifyRes = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        validateStatus: (status) => status >= 200 && status < 500, // prevent axios throwing on 204
      });
    } catch (err: any) {
      const data = err.response?.data;
      const code = err.response?.status || 500;
      console.error('❌ Spotify API fetch failed:', data || err.message);

      return NextResponse.json(
        {
          error: 'Spotify API call failed',
          details: data || err.message,
        },
        { status: code }
      );
    }

    // 4. Nothing playing: return a valid 200 with `{ playing: false }`
    if (spotifyRes.status === 204 || !spotifyRes.data || !spotifyRes.data.item) {
      secureLog('⏸ Nothing is currently playing');
      return NextResponse.json({ playing: false }, { status: 200 });
    }

    const nowPlaying = {
      playing: true,
      track: {
        name: spotifyRes.data.item.name,
        url: spotifyRes.data.item.external_urls.spotify,
        artists: spotifyRes.data.item.artists.map((a: any) => a.name),
        album: spotifyRes.data.item.album.name,
        image: spotifyRes.data.item.album.images?.[0]?.url || null,
      },
    };

    // 5. Cache structured nowPlaying object
    cache.set('now-playing', nowPlaying);

    // 6. Safe logging
    secureLog('🎧 Now playing:', nowPlaying.track);

    return NextResponse.json(nowPlaying);
  } catch (error: any) {
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Unexpected failure while fetching now playing'
        : error.message;

    console.error('🎧 Now Playing general error:', message);
    return NextResponse.json(
      {
        error: 'Unexpected failure while fetching now playing',
        details: message,
      },
      { status: 500 }
    );
  }
}
