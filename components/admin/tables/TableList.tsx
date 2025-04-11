'use client';

import Link from 'next/link';

interface TableListProps {
  tables: string[];
  loading: boolean;
  error: string | null;
}

export default function TableList({ tables, loading, error }: TableListProps) {
  if (loading) {
    return <p className="text-gray-400">Loading tables...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <ul className="list-disc list-inside text-[#D1D5DB] space-y-2">
      {tables.map((table) => (
        <li key={table}>
          <Link
            href={`/admin/tables/${table}`}
            className="text-blue-400 hover:underline hover:text-blue-300 transition"
          >
            {table}
          </Link>
        </li>
      ))}
    </ul>
  );
}
