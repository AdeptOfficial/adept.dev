import { NextResponse } from 'next/server';
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

export async function GET() {
  try {
    // Step 1: Clear any old cache data before fetching new data
    cache.del('now-playing');  // Ensure cache is cleaned before fetching new data
    
    // Step 2: Check if data is cached (after cleanup)
    const cached = cache.get('now-playing');
    if (cached) {
      secureLog('🎵 Returning cached Now Playing');
      return NextResponse.json(cached);  // Returning the cached data
    }

    // Step 3: Get the access token (handles token expiration and refresh)
    const access_token = await getAccessToken();

    if (!access_token) {
      console.warn('⚠️ No access token from getAccessToken');
      return NextResponse.json({ error: 'Missing access token' }, { status: 401 });
    }

    // Step 4: Fetch the current playing track from Spotify
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

      // Handle 401 Unauthorized (e.g., expired token)
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

    // Step 5: If no track is playing, log the message and return 204 No Content
    if (spotifyRes.status === 204 || !spotifyRes.data?.item) {
      secureLog('🎧 No songs are being played');  // Log message
      return new NextResponse(null, { status: 204 });  // No content
    }

    const nowPlaying = spotifyRes.data;

    // Step 6: Cache the valid track data
    cache.set('now-playing', nowPlaying);  // Cache new track data

    // Step 7: Log track info in development (no sensitive data in production)
    secureLog('🎧 Now playing:', {
      track: nowPlaying.item?.name,
      artist: nowPlaying.item?.artists?.map((a: any) => a.name).join(', '),
    });

    // Step 8: Return the same raw response format
    console.log('🎧 Now Playing response:', nowPlaying);  // Log the response for debugging
    return NextResponse.json(nowPlaying);  // Return the actual data

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
      },
      { status: 500 }
    );
  }
}
