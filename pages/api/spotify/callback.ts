import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { serialize } from 'cookie';

// Helper function to log securely (avoid logging sensitive information in production)
const secureLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, data); // Detailed logs in development
  } else {
    console.log(message); // Minimal logs in production
  }
};

secureLog('✅ Spotify auth success'); // Log only a success message in production


// Helper function to clear cookies
const clearStateCookie = (res: NextApiResponse) => {
  res.setHeader('Set-Cookie', serialize('spotify_auth_state', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
    sameSite: 'lax', // Mitigate CSRF
    maxAge: 0, // Expire immediately
    path: '/',
  }));
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = req.query.code as string;
  const state = req.query.state as string;

  // Step 1: Validate the authorization code
  if (!code) {
    console.warn('❌ Missing authorization code:', req.query);
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  // Step 2: Check CSRF state
  const expectedState = req.cookies?.spotify_auth_state;
  if (!state || !expectedState || state !== expectedState) {
    console.warn('⚠️ Invalid state param:', { received: state, expected: expectedState });
    return res.status(403).json({ error: 'Invalid or missing state param (possible CSRF)' });
  }

  try {
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
    const redirectURI = `${baseURL}/api/spotify/callback`;

    const authHeader = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    // Step 3: Exchange authorization code for access token
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
        },
      }
    );

    const { access_token, refresh_token } = tokenRes.data;

    // Step 4: Get the user's Spotify profile using the access token
    const profileRes = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const profile = profileRes.data;

    // Step 5: Validate that only the owner can authenticate in production/preview environments
    const ALLOWED_SPOTIFY_ID = process.env.ALLOWED_SPOTIFY_ID;
    const ALLOWED_EMAIL = process.env.ALLOWED_EMAIL;
    const isDev = process.env.VERCEL_ENV === 'development';
    const isOwner = profile.id === ALLOWED_SPOTIFY_ID || profile.email === ALLOWED_EMAIL;

    if (!isDev && !isOwner) {
      console.warn('🚫 Unauthorized auth attempt by:', profile.id, profile.email);
      return res.status(403).json({
        error: 'Access denied: preview/production access is restricted to the owner.',
      });
    }

    // Step 6: Log success (sensitive data is not logged in production)
    secureLog('✅ Spotify auth success:', profile.display_name || profile.id);

    // Step 7: Clear the auth state cookie
    clearStateCookie(res);

    // Step 8: Respond with the access token, refresh token, and user profile (ensure sensitive data is not exposed in production)
    return res.status(200).json({
      message: 'Authenticated and verified successfully',
      access_token,
      refresh_token,
      user: {
        id: profile.id,
        display_name: profile.display_name,
      },
    });
  } catch (error: any) {
    // Step 9: Handle errors gracefully
    const status = error.response?.status || 500;
    console.error('❌ Spotify auth callback error:', error.response?.data || error.message);

    return res.status(status).json({
      error:
        status === 400
          ? 'Invalid authorization code or redirect URI'
          : 'Token exchange or user validation failed',
      details: process.env.NODE_ENV === 'production' ? 'Internal error' : error.message, // Do not expose sensitive error details in production
    });
  }
}
