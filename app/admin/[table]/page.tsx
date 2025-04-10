'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TablePage({ params }: { params: { table: string } }) {
  const { table } = params;

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTableData();
  }, [table]);

  const fetchTableData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching data for table:', table);

      const res = await fetch('/api/admin/table', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ table }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch data');
      }

      const { data } = await res.json();

      if (!data || data.length === 0) {
        console.log('No data found in this table.');
      } else {
        console.log('Data fetched:', data);
      }

      setData(data || []);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212] text-white">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212] text-white">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white p-8 space-y-10">
      <h1 className="text-4xl font-bold mb-4">Table: {table}</h1>

      {data.length > 0 ? (
        <table className="w-full border-collapse border border-gray-700">
          <thead>
            <tr>
              {Object.keys(data[0]).map((key) => (
                <th key={key} className="border border-gray-700 px-4 py-2 text-left">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((value, i) => (
                  <td key={i} className="border border-gray-700 px-4 py-2">
                    {value !== null && value !== undefined ? value.toString() : 'NULL'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-lg text-gray-400">No data found in this table.</p>
      )}
    </div>
  );
}