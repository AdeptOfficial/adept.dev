import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = req.query.code as string;
  const state = req.query.state as string;

  if (!code) {
    console.warn('❌ Missing authorization code:', req.query);
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  // ✅ Check CSRF state (optional: can be made more robust with cookies/session)
  const expectedState = req.cookies?.spotify_auth_state;
  if (!state || !expectedState || state !== expectedState) {
    console.warn('⚠️ Invalid state param:', { received: state, expected: expectedState });
    return res.status(403).json({ error: 'Invalid or missing state param (possible CSRF)' });
  }

  try {
    const baseURL =
      process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
    const redirectURI = `${baseURL}/api/spotify/callback`;

    const authHeader = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    // 🔄 Exchange code for token
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

    // 👤 Get user profile
    const profileRes = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const profile = profileRes.data;

    // 🔒 Allow only the owner to auth in preview/production
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

    console.log('✅ Spotify auth success:', profile.display_name || profile.id);

    // 🧼 Clear the auth state cookie
    res.setHeader('Set-Cookie', 'spotify_auth_state=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax');

    return res.status(200).json({
      message: 'Authenticated and verified successfully',
      access_token,
      refresh_token,
      user: {
        id: profile.id,
        email: profile.email,
        display_name: profile.display_name,
      },
    });
  } catch (error: any) {
    const status = error.response?.status || 500;
    console.error('❌ Spotify auth callback error:', error.response?.data || error.message);

    return res.status(status).json({
      error:
        status === 400
          ? 'Invalid authorization code or redirect URI'
          : 'Token exchange or user validation failed',
      details: error.response?.data || error.message,
    });
  }
}
