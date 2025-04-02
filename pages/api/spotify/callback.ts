import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = req.query.code as string;

  if (!code) {
    console.warn('Missing authorization code:', req.query);
    return res.status(400).json({ error: 'Missing authorization code' });
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
        },
      }
    );

    const { access_token, refresh_token } = tokenRes.data;

    // 🔍 Fetch the user's Spotify profile
    const profileRes = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const profile = profileRes.data;

    // ✅ Restrict access
    const ALLOWED_SPOTIFY_ID = process.env.ALLOWED_SPOTIFY_ID;
    const ALLOWED_EMAIL = process.env.ALLOWED_EMAIL;
    const isDev = process.env.VERCEL_ENV === 'development';
    const isPreview = process.env.VERCEL_ENV === 'preview';

    // 🚫 Restrict preview/production access to owner only
    const isOwner = profile.id === ALLOWED_SPOTIFY_ID || profile.email === ALLOWED_EMAIL;

    if (!isDev && !isOwner) {
      console.warn('❌ Unauthorized attempt from:', profile.id, profile.email);
      return res.status(403).json({ error: 'Access denied: preview/production use is restricted.' });
    }

    console.log('✅ Authorized Spotify user:', profile.display_name || profile.id);

    return res.status(200).json({
      message: 'Successfully authenticated and verified',
      access_token,
      refresh_token,
      user: {
        id: profile.id,
        email: profile.email,
        display_name: profile.display_name,
      },
    });
  } catch (error: any) {
    console.error('Spotify callback error:', error.response?.data || error.message);

    const status = error.response?.status || 500;

    return res.status(status).json({
      error: status === 400
        ? 'Invalid authorization code or redirect URI'
        : 'Token exchange or user validation failed',
      details: error.response?.data || error.message,
    });
  }
}
