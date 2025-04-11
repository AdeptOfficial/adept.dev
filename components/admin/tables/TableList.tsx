'use client';

import Link from 'next/link';

interface TableListProps {
  tables: string[];
  loading: boolean;
  error: string | null;
}

export default function TableList({ tables, loading, error }: TableListProps) {
  if (loading) {
    return <p className="text-lg text-gray-400">Loading tables...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  if (tables.length === 0) {
    return <p className="text-sm text-gray-400">No tables found or failed to fetch.</p>;
  }

  return (
    <ul className="list-disc list-inside text-[#D1D5DB]">
      {tables.map((table) => (
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
  );
}