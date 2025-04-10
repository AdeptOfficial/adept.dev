import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { serialize } from 'cookie';
import axios from 'axios';
import { redis } from '@/lib/redis'; // assumes your Redis helper lives here

// Logging helper
const secureLog = (message: string, data?: any, email?: any) => {
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

  // Ensure code is present
  if (!code) {
    secureLog('❌ Missing authorization code');
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
  }

  const expectedState = cookieStore.get('spotify_auth_state')?.value;

  // Check for CSRF attack by validating the state parameter
  if (!state || !expectedState || state !== expectedState) {
    secureLog('❌ Invalid or missing state param (CSRF)');
    return NextResponse.json({ error: 'Invalid or missing state param (CSRF)' }, { status: 403 });
  }

  try {
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
    const redirectURI = `${baseURL}/api/spotify/callback`;

    const authHeader = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    // Exchange the authorization code for an access token
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

    // Fetch user profile using the access token
    const profileRes = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const profile = profileRes.data;

    // Restrict access to specific user (for production environment)
    const ALLOWED_SPOTIFY_ID = process.env.ALLOWED_SPOTIFY_ID;
    const ALLOWED_EMAIL = process.env.ALLOWED_EMAIL;
    const isDev = process.env.VERCEL_ENV === 'development';
    const isOwner = profile.id === ALLOWED_SPOTIFY_ID || profile.email === ALLOWED_EMAIL;

    if (!isDev && !isOwner) {
      secureLog('🚫 Unauthorized auth attempt by:', profile.id, profile.email);
      return NextResponse.json(
        { error: 'Access denied: preview/production access is restricted to the owner.' },
        { status: 403 }
      );
    }

    // ✅ Store the tokens securely in Redis
    await redis.set(
      `spotify_tokens:${profile.id}`,
      JSON.stringify({ access_token, refresh_token }),
      { ex: 3600 } // 1 hour expiration
    );

    // 🧼 Clear the auth cookie
    const response = NextResponse.json({
      message: 'Authenticated and verified successfully',
      user: {
        id: profile.id,
        display_name: profile.display_name,
      },
    });

    response.headers.set('Set-Cookie', clearStateCookie()); // Clear cookie after successful auth
    secureLog('✅ Spotify auth success:', profile.display_name || profile.id);

    return response;
  } catch (error: any) {
    const status = error.response?.status || 500;
    secureLog('❌ Spotify auth callback error:', error.response?.data || error.message);

    // Provide specific error messages for different failure scenarios
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
