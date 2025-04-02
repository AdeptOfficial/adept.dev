import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = req.query.code as string

  if (!code) {
    return res.status(400).send('Missing code')
  }

  try {
    const authOptions = {
      method: 'POST',
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/spotify/callback`,
      }),
    }

    const response = await axios(authOptions)
    const { refresh_token, access_token } = response.data

    console.log('🎉 REFRESH TOKEN:', refresh_token)

    return res.status(200).json({
      message: 'Copy your refresh token below:',
      refresh_token,
    })
  } catch (error: any) {
    console.error('Spotify token exchange error:', error.response?.data || error.message)
    return res.status(500).json({
      error: 'Token exchange failed',
      details: error.response?.data || error.message,
    })
  }
}
