import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = req.query.code as string;

  // Check if the authorization code is present
  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    // Dynamically build the redirect URI
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // Fallback to localhost if not set
    const redirectURI = `${baseURL}/api/spotify/callback`;

    // Set up the request to Spotify's token exchange endpoint
    const authOptions = {
      method: 'POST',
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectURI, // Ensure it matches the redirect URI registered on Spotify
      }),
    };

    // Request the access token from Spotify
    const response = await axios(authOptions);

    // Extract refresh_token and access_token from response
    const { refresh_token, access_token } = response.data;

    // Log the refresh token (for debugging purposes)
    console.log('🎉 REFRESH TOKEN:', refresh_token);

    // Return the refresh token to the client
    return res.status(200).json({
      message: 'Successfully obtained refresh token',
      refresh_token,
      access_token,
    });
  } catch (error: any) {
    console.error('Spotify token exchange error:', error.response?.data || error.message);

    // Handle specific error scenarios
    if (error.response?.status === 400) {
      return res.status(400).json({ error: 'Invalid authorization code or redirect URI' });
    }

    // General error handler
    return res.status(500).json({
      error: 'Token exchange failed',
      details: error.response?.data || error.message,
    });
  }
}
