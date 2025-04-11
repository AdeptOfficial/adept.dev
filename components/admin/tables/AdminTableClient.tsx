'use client';

import { useEffect, useState } from 'react';

interface Props {
  params: {
    table: string;
  };
}

export default function AdminTableClient({ params }: Props) {
  const { table } = params;

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTableData = async () => {
      setLoading(true);
      setError(null);

      try {
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
        setData(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTableData();
  }, [table]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212] text-white">
        <p className="text-lg">Loading {table}...</p>
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
    <div className="min-h-screen bg-[#121212] text-white p-8 space-y-10 overflow-x-auto">
      <h1 className="text-4xl font-bold mb-4">Table: {table}</h1>

      {data.length > 0 && data[0] ? (
        <table className="w-full border-collapse border border-gray-700 text-sm">
          <thead>
            <tr>
              {Object.keys(data[0]).map((key) => (
                <th
                  key={key}
                  className="border border-gray-700 px-4 py-2 text-left bg-gray-800 text-gray-200"
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-800/60">
                {Object.values(row).map((value, colIndex) => (
                  <td key={colIndex} className="border border-gray-700 px-4 py-2 text-gray-300">
                    {value !== null && value !== undefined ? value.toString() : (
                      <span className="text-gray-500 italic">NULL</span>
                    )}
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
