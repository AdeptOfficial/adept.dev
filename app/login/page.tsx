'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/post-auth');
    }
  }, [status, router]);

  const handleGitHubLogin = () => {
    setLoading(true);
    signIn('github', { callbackUrl: '/post-auth' });
  };

  if (status === 'authenticated') {
    return null; // prevent flashing the login page
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] text-white">
      <button
        onClick={handleGitHubLogin}
        disabled={loading}
        className={`px-6 py-2 rounded-md text-white transition ${
          loading
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Redirecting…' : 'Login with GitHub'}
      </button>
    </div>
  );
}
