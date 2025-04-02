import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REFRESH_TOKEN,
  } = process.env

  // Check if essential environment variables are missing
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
    return res.status(500).json({ error: 'Missing Spotify credentials in environment variables' })
  }

  try {
    // Make the request to Spotify API to refresh the access token
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: SPOTIFY_REFRESH_TOKEN,
      }),
      {
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    const { access_token, expires_in } = response.data

    // Return the refreshed access token and expiration time
    return res.status(200).json({ access_token, expires_in })
  } catch (error: any) {
    console.error('Access token refresh failed:', error.response?.data || error.message)

    // Provide a more detailed error response in case of failure
    return res.status(500).json({
      error: 'Failed to refresh access token',
      details: error.response?.data || error.message,
    })
  }
}
