'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function PostAuthPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (session?.user?.role === 'admin') {
      router.replace('/admin');
    } else {
      router.replace('/');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#121212]">
        <p className="text-lg font-medium">Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center text-white bg-[#121212]">
      <p className="text-lg font-medium">Redirecting...</p>
    </div>
  );
}
