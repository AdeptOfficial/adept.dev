import React from 'react';

interface RepoCardProps {
  repo: {
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
  };
}

const RepoCard: React.FC<RepoCardProps> = ({ repo }) => {
  // Prioritize GitHub Pages URL (repo.pages?.url) over homepageUrl
  const githubPagesUrl = repo.pages?.url || repo.homepageUrl;
  return (
    <div
      key={`${repo.id}-${repo.name}`}
      className="bg-gray-700 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
    >
      {/* Parent link for the repository */}
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
            ? repo.languages.nodes
                .filter((lang) => lang.name !== repo.primaryLanguage?.name)
                .map((lang) => lang.name)
                .join(', ') || 'None'
            : 'None'}
        </p>
      </a>

      {/* Display Web Release only if there is a valid URL */}
      {githubPagesUrl ? (
        <p className="text-gray-400 text-sm mt-2">
          🌐 Web Release:{' '}
          <a
            href={githubPagesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline break-all"
          >
            {githubPagesUrl}
          </a>
        </p>
      ) : (
        <p className="text-gray-400 text-sm mt-2">🌐 No Web Release Available</p> // Fallback message
      )}

      {/* Display Active Development Status */}
      {/* <p
        className={`text-sm mt-2 ${
          repo.isActiveDevelopment ? 'text-green-400' : 'text-red-400'
        }`}
      >
        {repo.isActiveDevelopment ? 'Active Development' : 'Development Paused'}
      </p> */}
    </div>
  );
};

export default RepoCard;
