'use client';

import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const handleGitHubLogin = () => {
    signIn('github', { callbackUrl: '/post-auth' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] text-white">
      <button
        onClick={handleGitHubLogin}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
      >
        Login with GitHub
      </button>
    </div>
  );
}
