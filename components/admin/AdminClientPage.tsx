'use client';

import { useState, useEffect } from 'react';
import TableList from './tables/TableList';
import { fetchTables } from './tables/utils';
import Link from 'next/link';

export default function AdminClientPage() {
  const [dbTables, setDbTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getTables = async () => {
      setLoading(true);
      setError(null);

      try {
        const tables = await fetchTables();
        setDbTables(tables);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch tables');
      } finally {
        setLoading(false);
      }
    };

    getTables();
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-white p-8 space-y-10">
      <h1 className="text-4xl font-bold mb-4">Admin Panel</h1>
      <p className="text-lg text-[#ADB7BE] mb-8">Welcome, Admin. You have full access here.</p>

      <section>
        <h2 className="text-2xl font-semibold mb-2">🗄️ Check Database</h2>
        <TableList tables={dbTables} loading={loading} error={error} />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">📅 Calendar</h2>
        <Link href="/admin/calendar" className="underline text-blue-400 hover:text-blue-300">
          View Calendar
        </Link>
      </section>
    </div>
  );
}