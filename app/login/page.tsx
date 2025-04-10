'use client';

import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    // Simulate login (in prod: real auth here)
    localStorage.setItem("isAdmin", "true");
    router.push("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] text-white">
      <button
        onClick={handleLogin}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
      >
        Login as Admin
      </button>
    </div>
  );
}
