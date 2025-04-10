// app/api/spotify/callback/route.ts

import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { serialize } from 'cookie';
import axios from 'axios';
import { redis } from '@/lib/redis'; // assumes your Redis helper lives here

// Logging helper
const secureLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, data);
  } else {
    console.log(message);
  }
};

// Clear `spotify_auth_state` cookie
function clearStateCookie() {
  const serialized = serialize('spotify_auth_state', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return serialized;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieStore = cookies();
  const cookieHeader = headers().get('cookie');

  if (!code) {
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
  }

  const expectedState = cookieStore.get('spotify_auth_state')?.value;
  if (!state || !expectedState || state !== expectedState) {
    return NextResponse.json({ error: 'Invalid or missing state param (CSRF)' }, { status: 403 });
  }

  try {
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
    const redirectURI = `${baseURL}/api/spotify/callback`;

    const authHeader = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    const tokenRes = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectURI,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${authHeader}`,
          Cookie: cookieHeader || '',
        },
      }
    );

    const { access_token, refresh_token } = tokenRes.data;

    const profileRes = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const profile = profileRes.data;

    // Restrict to specific user
    const ALLOWED_SPOTIFY_ID = process.env.ALLOWED_SPOTIFY_ID;
    const ALLOWED_EMAIL = process.env.ALLOWED_EMAIL;
    const isDev = process.env.VERCEL_ENV === 'development';
    const isOwner = profile.id === ALLOWED_SPOTIFY_ID || profile.email === ALLOWED_EMAIL;

    if (!isDev && !isOwner) {
      console.warn('🚫 Unauthorized auth attempt by:', profile.id, profile.email);
      return NextResponse.json(
        { error: 'Access denied: preview/production access is restricted to the owner.' },
        { status: 403 }
      );
    }

    // ✅ Store tokens securely in Redis
    await redis.set(
      `spotify_tokens:${profile.id}`,
      JSON.stringify({ access_token, refresh_token }),
      { ex: 3600 } // 1 hour expiration
    );

    // 🧼 Clear auth cookie
    const response = NextResponse.json({
      message: 'Authenticated and verified successfully',
      user: {
        id: profile.id,
        display_name: profile.display_name,
      },
    });

    response.headers.set('Set-Cookie', clearStateCookie());
    secureLog('✅ Spotify auth success:', profile.display_name || profile.id);
    return response;
  } catch (error: any) {
    const status = error.response?.status || 500;
    console.error('❌ Spotify auth callback error:', error.response?.data || error.message);

    return NextResponse.json(
      {
        error:
          status === 400
            ? 'Invalid authorization code or redirect URI'
            : 'Token exchange or user validation failed',
        details: process.env.NODE_ENV === 'production' ? 'Internal error' : error.message,
      },
      { status }
    );
  }
}
