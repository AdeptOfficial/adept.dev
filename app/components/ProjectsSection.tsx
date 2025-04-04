import React from 'react';
import RepoCard from './RepoCard';

interface ProjectsSectionProps {
    repos: {
        id: string;
        name: string;
        description: string;
        url: string;
        homepageUrl: string | null;
        primaryLanguage: { name: string } | null;
        languages: { nodes: { name: string }[] };
        isActiveDevelopment: boolean;
        pages?: {
            status: string;
            url: string;
        } | null;
    }[];
    loading: boolean;
    error: string | null;
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ repos, loading, error }) => {

   // console.log('ProjectsSection - Repositories:', repos); // Debugging line
    return (
        <div className="w-full bg-gray-800 rounded-lg p-6 shadow-md">
            <details>
                <summary className="text-white text-2xl cursor-pointer">
                    {repos.some(repo => repo.isActiveDevelopment) ? 'Active Development' : 'Paused Development'}
                </summary>
                <div className="mt-4">
                    {loading && <p className="text-gray-400">Loading...</p>}
                    {error && <p className="text-red-500">Error: {error}</p>}
                    {!loading && !error && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {repos.map((repo) => (
                                <RepoCard key={`${repo.id}-${repo.name}`} repo={repo} />
                            ))}
                        </div>
                    )}
                </div>
            </details>
        </div>
    );
};

export default ProjectsSection;