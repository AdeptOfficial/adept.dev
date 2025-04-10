// app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Simulate basic auth check
    const isAdmin = localStorage.getItem("isAdmin");
    if (isAdmin === "true") {
      setAuthorized(true);
    } else {
      router.push("/"); // redirect non-admins to home
    }
  }, [router]);

  if (!authorized) return null; // or loading spinner

  return (
    <div className="min-h-screen bg-[#121212] text-white p-8">
      <h1 className="text-4xl font-bold mb-4">Admin Panel</h1>
      <p className="text-lg text-[#ADB7BE]">Welcome, Admin. You have full access here.</p>
      {/* Add admin tools/components below */}
    </div>
  );
}
