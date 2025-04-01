import { NextApiRequest, NextApiResponse } from 'next';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
const GITHUB_GRAPHQL_TOKEN = process.env.GITHUB_AUTH_TOKEN;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!GITHUB_GRAPHQL_TOKEN) {
        return res.status(500).json({ error: 'GitHub GraphQL token is not set' });
    }

    const graphqlQuery = `
        query {
            user(login: "adeptofficial") {
                repositories(first: 10, orderBy: { field: CREATED_AT, direction: DESC }) {
                    nodes {
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
            return res.status(500).json({ error: 'GraphQL query failed', details: errors || data });
        }

        const repositories = data.user.repositories.nodes;

        // Now fetch GitHub Pages info using the REST API
        const withPages = await Promise.all(repositories.map(async (repo: any) => {
            const pagesResponse = await fetch(`https://api.github.com/repos/adeptofficial/${repo.name}/pages`, {
                headers: {
                    Authorization: `Bearer ${GITHUB_GRAPHQL_TOKEN}`,
                    'Accept': 'application/vnd.github+json',
                },
            });

            if (pagesResponse.status === 200) {
                const pagesData = await pagesResponse.json();
                return {
                    ...repo,
                    pages: {
                        status: 'BUILT',
                        url: pagesData.html_url || `https://adeptofficial.github.io/${repo.name}/`,
                    },
                };
            } else {
                return { ...repo, pages: null };
            }
        }));

        res.status(200).json(withPages);
    } catch (error: any) {
        console.error('Error fetching GitHub repositories:', error.message);
        res.status(500).json({ error: 'Failed to fetch repositories' });
    }
}
