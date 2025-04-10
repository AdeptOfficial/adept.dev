'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Use the appropriate key
);

interface TableRow {
  table_name: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [dbTables, setDbTables] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/');
    } else {
      fetchTables();
    }
  }, [status, session, router]);

  const fetchTables = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.rpc('get_tables'); // Call the custom function

    if (error) {
      setError('Failed to fetch tables: ' + error.message);
      setLoading(false);
      return;
    }

    const tables = data?.map((row: { table_name: string }) => row.table_name);
    setDbTables(tables || []);
    setLoading(false);
  };

  if (status === 'loading' || session?.user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212] text-white">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white p-8 space-y-10">
      <h1 className="text-4xl font-bold mb-4">Admin Panel</h1>
      <p className="text-lg text-[#ADB7BE] mb-8">Welcome, Admin. You have full access here.</p>

      {/* Section 1: Database Tables */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">🗄️ Check Database</h2>

        {loading && <p className="text-lg text-gray-400">Loading tables...</p>}

        {error && <p className="text-sm text-red-500">{error}</p>}

        {dbTables.length > 0 && !loading ? (
          <ul className="list-disc list-inside text-[#D1D5DB]">
            {dbTables.map((table) => (
              <li key={table}>
                <Link
                  href={`/admin/${table}`}
                  className={table === 'admins' ? 'text-blue-400 underline' : 'underline'}
                >
                  {table}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          !loading && <p className="text-sm text-gray-400">No tables found or failed to fetch.</p>
        )}
      </section>
    </div>
  );
}