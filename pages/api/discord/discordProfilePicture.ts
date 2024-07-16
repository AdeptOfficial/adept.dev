// pages/api/discordProfilePicture.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const discordToken = process.env.DISCORD_BOT_TOKEN; // Example of using a server-side env variable
  const discord_user_id = process.env.DISCORD_USER_ID;
  if (!discordToken) {
    return res.status(500).json({ error: 'Server-side environment variable not set' });
  }

  try {
    const response = await fetch(`https://discord.com/api/v10/users/${discord_user_id}`, {
      headers: {
        Authorization: `Bot ${discordToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile picture');
    }

    const data = await response.json();
    console.log('API Response Data:', data); // Log the API response for debugging
    const profilePicUrl = `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`;

    res.status(200).json({ profilePicUrl });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};
