import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function fetchTables(): Promise<string[]> {
  const { data, error } = await supabase.rpc('get_tables');

  if (error) {
    throw new Error('Failed to fetch tables: ' + error.message);
  }

  return data?.map((row: { table_name: string }) => row.table_name) || [];
}
