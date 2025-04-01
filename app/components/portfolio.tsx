'use client';

import React, { useEffect, useState } from 'react';

interface Language {
    name: string;
}

interface Repo {
    id: string;
    name: string;
    description: string;
    url: string;
    homepageUrl: string | null;
    primaryLanguage: { name: string } | null;
    languages: { nodes: Language[] };
    pages?: { url: string }; // Optional fallback
}

const Portfolio: React.FC = () => {
    const [repos, setRepos] = useState<Repo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRepos = async () => {
            try {
                const response = await fetch('/api/github/githubAPIcall');
                if (!response.ok) {
                    throw new Error(`Failed to fetch repositories: ${response.status}`);
                }
                const data = await response.json();
                setRepos(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRepos();
    }, []);

    const filteredAndSortedRepos = repos
        .filter((repo) => !['AdeptOfficial', 'HomeControl'].includes(repo.name))
        .sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="flex flex-col h-full w-full p-4 gap-6">
            {/* About Section */}
            <div className="w-full bg-gray-800 rounded-lg p-6 shadow-md">
                <details>
                    <summary className="text-white text-2xl cursor-pointer">
                        Learn more about me
                    </summary>
                    <p className="text-gray-400 mt-4">
                        I specialize in building scalable web applications and have a passion for learning new technologies.
                    </p>
                </details>
            </div>

            {/* Projects Section */}
            <div className="w-full bg-gray-800 rounded-lg p-6 shadow-md">
                <details open>
                    <summary className="text-white text-2xl cursor-pointer">
                        Projects
                    </summary>
                    <div className="mt-4">
                        {loading && <p className="text-gray-400">Loading...</p>}
                        {error && <p className="text-red-500">Error: {error}</p>}
                        {!loading && !error && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredAndSortedRepos.map((repo) => {
                                    const githubPagesUrl = repo.homepageUrl || repo.pages?.url || null;

                                    return (
                                        <div
                                            key={repo.id}
                                            className="bg-gray-700 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
                                        >
                                            <a
                                                href={repo.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block text-white"
                                            >
                                                <h3 className="text-lg font-bold mb-2">{repo.name}</h3>
                                                <p className="text-gray-400 text-sm mb-2">
                                                    {repo.description || 'No description available.'}
                                                </p>
                                                <p className="text-gray-500 text-xs mb-2">
                                                    Primary Language: {repo.primaryLanguage?.name || 'None'}
                                                </p>
                                                <p className="text-gray-500 text-xs mb-2">
                                                    Other Languages: {repo.languages.nodes.length > 0
                                                        ? repo.languages.nodes.map((lang) => lang.name).join(', ')
                                                        : 'None'}
                                                </p>

                                                {githubPagesUrl && (
                                                    <p className="text-gray-400 text-sm mt-2">
                                                        🌐 GitHub Pages:{' '}
                                                        <a
                                                            href={githubPagesUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-400 hover:underline break-all"
                                                        >
                                                            {githubPagesUrl}
                                                        </a>
                                                    </p>
                                                )}
                                            </a>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </details>
            </div>
        </div>
    );
};

export default Portfolio;
    