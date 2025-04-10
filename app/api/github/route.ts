// app/api/github/route.ts

import { NextResponse } from 'next/server';
import githubCache from '@/lib/cache/githubCache';
import { redis } from '@/lib/redis';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
const GITHUB_GRAPHQL_TOKEN = process.env.GITHUB_AUTH_TOKEN;

const RATE_LIMIT_KEY = 'github_rate_limit';
const RATE_LIMIT_WINDOW = 60;
const RATE_LIMIT_MAX = 5;

// Function to check if the rate limit is exceeded
async function isRateLimited(ip: string): Promise<boolean> {
  if (process.env.NODE_ENV === 'development') {
    console.log('Rate limit check skipped in development');
    return false;
  }

  const key = `${RATE_LIMIT_KEY}:${ip}`;
  const currentCount = await redis.get(key);

  if (currentCount && parseInt(currentCount.toString()) >= RATE_LIMIT_MAX) {
    console.log(`Rate limit exceeded for IP: ${ip}`);
    return true;
  }

  await redis.incr(key);
  await redis.expire(key, RATE_LIMIT_WINDOW);
  return false;
}

// IP extraction for App Router
function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  return forwardedFor?.split(',')[0] ?? 'unknown';
}

export async function GET(request: Request) {
  if (!GITHUB_GRAPHQL_TOKEN) {
    return NextResponse.json({ error: 'GitHub GraphQL token is not set' }, { status: 500 });
  }

  const ip = getClientIp(request);
  const graphqlQuery = `
    query {
      user(login: "adeptofficial") {
        repositories(first: 10, orderBy: { field: CREATED_AT, direction: DESC }) {
          nodes {
            id
            name
            description
            url
            homepageUrl
            primaryLanguage {
              name
            }
            languages(first: 5) {
              nodes {
                name
              }
            }
          }
        }
      }
    }
  `;

  try {
    if (await isRateLimited(ip)) {
      const cachedData = await redis.get('repositories');
      if (cachedData) {
        return NextResponse.json(JSON.parse(cachedData as string));
      }
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    githubCache.delete('repositories');
    await redis.del('repositories');

    const graphqlResponse = await fetch(GITHUB_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GITHUB_GRAPHQL_TOKEN}`,
      },
      body: JSON.stringify({ query: graphqlQuery }),
    });

    const { data, errors } = await graphqlResponse.json();

    if (errors || !data?.user) {
      return NextResponse.json({ error: 'GraphQL query failed' }, { status: 500 });
    }

    const repositories = data.user.repositories.nodes;

    githubCache.set('repositories', repositories);
    await redis.set('repositories', JSON.stringify(repositories), { ex: 3600 });

    const filteredRepos = repositories.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      url: repo.url,
      homepageUrl: repo.homepageUrl,
      primaryLanguage: repo.primaryLanguage?.name,
      languages: repo.languages,
    }));

    const withPages = await Promise.all(
      filteredRepos.map(async (repo: any) => {
        const pagesResponse = await fetch(
          `https://api.github.com/repos/adeptofficial/${repo.name}/pages`,
          {
            headers: {
              Authorization: `Bearer ${GITHUB_GRAPHQL_TOKEN}`,
              Accept: 'application/vnd.github+json',
            },
          }
        );

        let pageUrl = null;
        let pagesStatus = null;

        if (pagesResponse.status === 200) {
          const pagesData = await pagesResponse.json();
          pageUrl = pagesData.html_url || `https://adeptofficial.github.io/${repo.name}/`;
          pagesStatus = 'BUILT';
        } else if (repo.homepageUrl && repo.homepageUrl !== '') {
          pageUrl = repo.homepageUrl;
          pagesStatus = 'CUSTOM';
        }

        const updatedRepo = {
          ...repo,
          homepageUrl: pageUrl,
          pages: pageUrl ? { status: pagesStatus, url: pageUrl } : null,
        };

        githubCache.set(`repo-${repo.id}`, updatedRepo);
        await redis.set(`repo-${repo.id}`, JSON.stringify(updatedRepo), { ex: 3600 });

        return updatedRepo;
      })
    );

    return NextResponse.json(withPages);
  } catch (error: unknown) {
    const errorMessage =
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error instanceof Error
        ? error.message
        : 'Unknown error';

    console.error('Error fetching GitHub repositories:', errorMessage);

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
