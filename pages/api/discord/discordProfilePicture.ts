// pages/api/discordProfilePicture.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '@/lib/redis';
import profilePicCache from '@/lib/cache/profilePicCache';

const DISCORD_USER_ID = process.env.DISCORD_USER_ID!;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const RATE_LIMIT_WINDOW = 60; // seconds
const RATE_LIMIT_MAX = 5;

function getClientIp(req: NextApiRequest): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

async function isRateLimited(ip: string): Promise<boolean> {
  const key = `rate_limit:${ip}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, RATE_LIMIT_WINDOW);
  }
  return count > RATE_LIMIT_MAX;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const ip = getClientIp(req);
  const userId = DISCORD_USER_ID;
  const cacheKey = `discord_avatar:${userId}`;

  try {
    // Debug logs
    console.log('Running on the server:', typeof window === 'undefined');

    // check local cache first
    const localCache = profilePicCache.get(userId);
    if (localCache) {
      console.log('Local cache hit:', localCache);
      return res.status(200).json({ profilePicUrl: localCache });
    }
    // Check rate limit
    if (await isRateLimited(ip)) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    // Check Redis cache
    const cached = await redis.get<string>(cacheKey);
    if (cached) {
      console.log('redis cache hit:', cached);
      return res.status(200).json({ profilePicUrl: cached });
    }

    // Fetch from Discord API
    const response = await fetch(`https://discord.com/api/v10/users/${userId}`, {
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }

    const data = await response.json();

    await redis.set(cacheKey, data.avatar, { ex: 60 });

    const profilePicUrl = `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}?size=2048`;

    // Cache the result in Redis for 60 seconds
    await redis.set(cacheKey, profilePicUrl, { ex: 60 });

    // Cache the result in local cache
    profilePicCache.set(userId, profilePicUrl);

    return res.status(200).json({ profilePicUrl });
  } catch (error: unknown) {
    console.error('Error fetching Discord avatar:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown server error',
    });
  }
}
