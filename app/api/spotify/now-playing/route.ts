import { NextResponse } from 'next/server';
import axios from 'axios';
import NodeCache from 'node-cache';
import { getAccessToken } from '@/lib/spotify';

const cache = new NodeCache({ stdTTL: 10 }); // 10s cache

const secureLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, data);
  }
};

export async function GET() {
  try {
    // ✅ 1. Check cache first
    const cached = cache.get('now-playing');
    if (cached) {
      secureLog('🎵 Returning cached Now Playing');
      return NextResponse.json(cached);
    }

    // ✅ 2. Get access token (secured server-side)
    const access_token = await getAccessToken();

    if (!access_token) {
      console.warn('⚠️ Missing or invalid Spotify token');
      return NextResponse.json({ error: 'Missing access token' }, { status: 401 });
    }

    // ✅ 3. Call Spotify API for current track
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
        return NextResponse.json(
          { error: 'Access token expired or unauthorized', details: data },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: 'Spotify API call failed', details: data || err.message },
        { status: code }
      );
    }

    // ✅ 4. Handle "no track playing"
    if (spotifyRes.status === 204 || !spotifyRes.data?.item) {
      secureLog('⏸ Nothing is currently playing');
      return new NextResponse(null, { status: 204 });
    }

    const nowPlaying = spotifyRes.data;

    // ✅ 5. Cache the response
    cache.set('now-playing', nowPlaying);

    // ✅ 6. Safe logging
    secureLog('🎧 Now playing:', {
      track: nowPlaying.item?.name,
      artist: nowPlaying.item?.artists?.map((a: any) => a.name).join(', '),
    });

    return NextResponse.json(nowPlaying);
  } catch (error: any) {
    const message =
      process.env.NODE_ENV === 'production' ? 'Unexpected failure while fetching now playing' : error.message;
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
