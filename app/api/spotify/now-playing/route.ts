export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import axios from 'axios';
import { getAccessToken } from '@/lib/spotify';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 5 }); // ⏱ cache for 5 seconds

const secureLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, data);
  }
};

export async function GET() {
  try {
    // ✅ Check cache first
    const cached = cache.get('now-playing');
    if (cached) {
      secureLog('🧠 Returning cached now-playing data');
      return NextResponse.json(cached, {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      });
    }

    const access_token = await getAccessToken();

    if (!access_token) {
      console.warn('⚠️ No access token found');
      return NextResponse.json(
        { error: 'Unauthorized', is_playing: false, item: null },
        {
          status: 401,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    let spotifyRes;
    try {
      spotifyRes = await axios.get(
        'https://api.spotify.com/v1/me/player/currently-playing',
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
    } catch (err: any) {
      const data = err.response?.data;
      const code = err.response?.status || 500;
      console.error('❌ Spotify API fetch failed:', data || err.message);

      return NextResponse.json(
        {
          error: 'Spotify API call failed',
          details: data || err.message,
          is_playing: false,
          item: null,
        },
        {
          status: code,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    if (spotifyRes.status === 204 || !spotifyRes.data?.item) {
      secureLog('🎧 No songs are being played');
      const responseData = {
        is_playing: false,
        item: null,
        timestamp: Date.now(),
      };
      cache.set('now-playing', responseData);
      return NextResponse.json(responseData, {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      });
    }

    const nowPlaying = spotifyRes.data;
    const responseData = {
      is_playing: nowPlaying.is_playing,
      item: nowPlaying.item,
      progress_ms: nowPlaying.progress_ms,
      timestamp: Date.now(),
    };

    cache.set('now-playing', responseData);

    secureLog('🎧 Now playing:', {
      track: nowPlaying.item?.name,
      artist: nowPlaying.item?.artists?.map((a: any) => a.name).join(', '),
    });

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    const errMsg =
      process.env.NODE_ENV === 'production'
        ? 'Unexpected failure while fetching now playing'
        : error.message;

    console.error('🎧 Now Playing general error:', errMsg);

    return NextResponse.json(
      {
        error: 'Unexpected failure while fetching now playing',
        details: errMsg,
        is_playing: false,
        item: null,
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}
