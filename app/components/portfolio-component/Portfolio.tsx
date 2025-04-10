'use client';

import React, { useEffect, useState } from 'react';
import ProjectsSection from './ProjectsSection';

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
    isActiveDevelopment: boolean;
    pages?: {
        status: string;
        url: string;
      } | null;
}

const Portfolio: React.FC = () => {
    const [repos, setRepos] = useState<Repo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRepos = async () => {
            try {
                const response = await fetch('/api/github');
                if (!response.ok) {
                    throw new Error(`Failed to fetch repositories: ${response.status}`);
                }
                const data = await response.json();

                // remove unwanted repositories
                const filteredRepos = data.filter((repo: Repo) => {
                    const unwantedNames = ['AdeptOfficial', 'HomeControl'];
                    return !unwantedNames.includes(repo.name);
                });

                // Add active development status manually
                const reposWithStatus = filteredRepos.map((repo: Repo) => ({
                    ...repo,
                    isActiveDevelopment: ['adept.dev', 'DevHub', 'Syna'].includes(repo.name),
                }));

                // Sort by active development status first, then by name
                const sortedRepos = [...reposWithStatus].sort((a: Repo, b: Repo) => {
                    if (a.isActiveDevelopment === b.isActiveDevelopment) {
                        return a.name.localeCompare(b.name);
                    }
                    return a.isActiveDevelopment ? -1 : 1;
                });

                setRepos(sortedRepos);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRepos();
    }, []);

    // Separate repositories into active and paused development
    const activeRepos = repos.filter((repo) => repo.isActiveDevelopment);
    const pausedRepos = repos.filter((repo) => !repo.isActiveDevelopment);

    return (
        <div className="flex flex-col h-full w-full p-4 gap-6">
            {/* About Section */}
            <div className="w-full bg-gray-800 rounded-lg p-6 shadow-md">
                <details>
                    <summary className="text-white text-2xl cursor-pointer">
                    Introduction
                    </summary>
                    <p className="text-gray-400 mt-4">
                        Hey, I&apos;m AdepT — 
                        A motivated computer science student driven by the belief
                        that there&apos;s always a challenge greater than the one you&apos;re currently facing,
                        so why be afraid now?
                    </p>
                </details>
            </div>

            {/* Projects Section */}
            <div className="w-full bg-gray-800 rounded-lg p-6 shadow-md">
                <h2 className="text-white text-2xl mb-4">My Projects</h2>

                {/* Active Projects */}
                <ProjectsSection repos={activeRepos} loading={loading} error={error} />

                {/* Inactive Projects */}
                <ProjectsSection repos={pausedRepos} loading={loading} error={error} />
            </div>
        </div>
    );
};

export default Portfolio;
