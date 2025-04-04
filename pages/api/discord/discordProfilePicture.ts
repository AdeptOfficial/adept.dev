import { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '@/lib/redis';
import profilePicCache from '@/lib/cache/profilePicCache';

const DISCORD_USER_ID = process.env.DISCORD_USER_ID!;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const isDev = process.env.NODE_ENV !== 'production';
const RATE_LIMIT_MAX = isDev ? 50 : 5;
const RATE_LIMIT_WINDOW = 60; // seconds

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

  // Rate limit check
  if (await isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  const userId = DISCORD_USER_ID;
  const cacheKey = `discord_avatar:${userId}`;
  const hashKey = `discord_avatar_hash:${userId}`;

  try {
    // Check local cache first
    const localCache = profilePicCache.get(userId);
    if (localCache) {
      return res.status(200).json({ profilePicUrl: localCache });
    }

    // Check Redis cache for avatar URL
    const cached = await redis.get<string>(cacheKey);
    if (cached) {
      return res.status(200).json({ profilePicUrl: cached });
    }

    // Check Redis cache for avatar hash
    const cachedHash = await redis.get<string>(hashKey);

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
    const newHash = data.avatar;
    const profilePicUrl = `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}?size=2048`;

    // If the avatar hash has changed, update the cache
    if (cachedHash !== newHash) {
      await redis.set(cacheKey, profilePicUrl, { ex: 3600 });
      await redis.set(hashKey, newHash, { ex: 3600 });
      profilePicCache.set(userId, profilePicUrl); // Cache in local cache
    }

    return res.status(200).json({ profilePicUrl });
  } catch (error: unknown) {
    console.error('Error fetching Discord avatar:', error);
    return res.status(500).json({
      error: 'Failed to fetch Discord avatar',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
