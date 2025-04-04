import { NextApiRequest, NextApiResponse } from 'next';
import githubCache from '@/lib/cache/githubCache';
import { redis } from '@/lib/redis';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
const GITHUB_GRAPHQL_TOKEN = process.env.GITHUB_AUTH_TOKEN;

const RATE_LIMIT_KEY = 'github_rate_limit';
const RATE_LIMIT_WINDOW = 60; // seconds
const RATE_LIMIT_MAX = 5; // Max requests per window (adjustable)

// Function to check if the rate limit is exceeded
async function isRateLimited(req: NextApiRequest): Promise<boolean> {
  // Skip rate limiting in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('Rate limit check skipped in development');
    return false;
  }

  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const key = `${RATE_LIMIT_KEY}:${clientIp}`;

  // Get current request count from Redis
  const currentCount = await redis.get(key);
  console.log(`Current request count for IP ${clientIp}:`, currentCount); // Log for debugging

  if (currentCount && parseInt(currentCount.toString()) >= RATE_LIMIT_MAX) {
    console.log(`Rate limit exceeded for IP: ${clientIp}`);
    return true; // Exceeded rate limit
  }

  // Increment the request count and set expiration for rate-limiting
  await redis.incr(key);
  await redis.expire(key, RATE_LIMIT_WINDOW); // Expire after 60 seconds

  return false; // Rate limit not exceeded
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!GITHUB_GRAPHQL_TOKEN) {
    return res.status(500).json({ error: 'GitHub GraphQL token is not set' });
  }

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
    // Rate limit check
    if (await isRateLimited(req)) {
      // If rate limit exceeded, check if data is available in cache
      const cachedData = await redis.get('repositories');
      if (cachedData) {
        console.log('Returning cached data due to rate limit');
        return res.status(200).json(JSON.parse(cachedData as string)); // Return cached data
      } else {
        return res.status(429).json({ error: 'Too many requests. Please try again later.' }); // Return rate limit error
      }
    }

    // Clear the existing cache before making a fresh request to GitHub API
    githubCache.delete('repositories');
    await redis.del('repositories'); // Clear the repository cache in Redis

    // Fetch from GitHub GraphQL API
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
      console.error('GraphQL Errors:', errors || data);
      return res.status(500).json({ error: 'GraphQL query failed' });
    }

    const repositories = data.user.repositories.nodes;

    // Cache the fetched data in memory and Redis with expiration time (1 hour)
    githubCache.set('repositories', repositories); // Cache for 1 hour
    await redis.set('repositories', JSON.stringify(repositories), { ex: 3600 });

    // Filter sensitive data before returning to client
    const filteredRepos = repositories.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      url: repo.url,
      homepageUrl: repo.homepageUrl,
      primaryLanguage: repo.primaryLanguage?.name,
      languages: repo.languages,
    }));

    // Fetch GitHub Pages info using the REST API
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
          pagesStatus = 'BUILT'; // GitHub Pages is built
        } else if (repo.homepageUrl && repo.homepageUrl !== "") {
          pageUrl = repo.homepageUrl;
          pagesStatus = 'CUSTOM'; // Custom homepage URL
        }

        // Update the repository with pages data
        const updatedRepo = {
          ...repo,
          homepageUrl: pageUrl,
          pages: pageUrl ? { status: pagesStatus, url: pageUrl } : null,
        };

        // Cache the repository with pages info (in both local and redis caches)
        githubCache.set(`repo-${repo.id}`, updatedRepo); // Cache individual repo
        await redis.set(`repo-${repo.id}`, JSON.stringify(updatedRepo), { ex: 3600 });

        return updatedRepo;
      })
    );

    return res.status(200).json(withPages);
  } catch (error: unknown) {
    const errorMessage =
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error instanceof Error
        ? error.message
        : 'Unknown error';
    console.error('Error fetching GitHub repositories:', errorMessage);

    // In production, hide sensitive error information
    return res.status(500).json({ error: errorMessage });
  }
}
