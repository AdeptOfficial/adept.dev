// app/api/spotify/now-playing/route.ts

import { NextResponse } from 'next/server';
import axios from 'axios';
import { getAccessToken } from '@/lib/spotify';
import NodeCache from 'node-cache';

// Cache valid responses for 10s (can be adjusted based on use case)
const cache = new NodeCache({ stdTTL: 10 });

const secureLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, data); // Only log sensitive data in development
  }
};

export async function GET() {
  try {
    // Step 1: Get the access token
    const access_token = await getAccessToken();

    if (!access_token) {
      console.warn('⚠️ No access token found');
      return new NextResponse(null, { status: 401 });
    }

    // Step 2: Fetch the current playing track from Spotify
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
        return new NextResponse(JSON.stringify({ error: 'Access token expired or unauthorized', details: data }), { status: 401 });
      }

      return new NextResponse(JSON.stringify({ error: 'Spotify API call failed', details: data || err.message }), { status: code });
    }

    // Step 3: If no track is playing, log the message and return custom status code (e.g., 418 I'm a teapot)
    if (spotifyRes.status === 204 || !spotifyRes.data?.item) {
      secureLog('🎧 No songs are being played');
      // Returning a custom status code (e.g., 418 or 200 with empty JSON)
      return new NextResponse(JSON.stringify({ message: 'No track playing' }), { status: 418 });
    }

    const nowPlaying = spotifyRes.data;

    // Step 4: Cache the valid track data
    cache.set('now-playing', nowPlaying);

    secureLog('🎧 Now playing:', {
      track: nowPlaying.item?.name,
      artist: nowPlaying.item?.artists?.map((a: any) => a.name).join(', '),
    });

    return new NextResponse(JSON.stringify(nowPlaying));
  } catch (error: any) {
    const errMsg = process.env.NODE_ENV === 'production' ? 'Unexpected failure while fetching now playing' : error.message;
    console.error('🎧 Now Playing general error:', errMsg);

    return new NextResponse(
      JSON.stringify({ error: 'Unexpected failure while fetching now playing', details: errMsg }),
      { status: 500 }
    );
  }
}
