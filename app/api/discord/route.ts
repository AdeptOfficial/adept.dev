// app/api/discord/route.ts

import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import profilePicCache from '@/lib/cache/profilePicCache';

const DISCORD_USER_ID = process.env.DISCORD_USER_ID!;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const isDev = process.env.NODE_ENV !== 'production';
const RATE_LIMIT_MAX = isDev ? 50 : 5;
const RATE_LIMIT_WINDOW = 60; // seconds

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  return forwardedFor?.split(',')[0] ?? 'unknown';
}

async function isRateLimited(ip: string): Promise<boolean> {
  const key = `rate_limit:${ip}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, RATE_LIMIT_WINDOW);
  }
  return count > RATE_LIMIT_MAX;
}

export async function GET(request: Request) {
  console.log('Fetching Discord avatar...');
  const ip = getClientIp(request);

  if (await isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  const userId = DISCORD_USER_ID;
  const cacheKey = `discord_avatar:${userId}`;
  const hashKey = `discord_avatar_hash:${userId}`;

  try {
    // Check local cache first
    const localCache = profilePicCache.get(userId);
    if (localCache) {
      return NextResponse.json({ profilePicUrl: localCache });
    }

    // Check Redis cache
    const cached = await redis.get<string>(cacheKey);
    if (cached) {
      return NextResponse.json({ profilePicUrl: cached });
    }

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

    if (cachedHash !== newHash) {
      await redis.set(cacheKey, profilePicUrl, { ex: 3600 });
      await redis.set(hashKey, newHash, { ex: 3600 });
      profilePicCache.set(userId, profilePicUrl); // Update local cache
    }

    return NextResponse.json({ profilePicUrl });
  } catch (error: unknown) {
    console.error('Error fetching Discord avatar:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch Discord avatar',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
