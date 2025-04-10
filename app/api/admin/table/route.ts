import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with the Service Role Key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use the Service Role Key
);

export async function POST(req: Request) {
  try {
    const { table } = await req.json();

    if (!table) {
      return NextResponse.json({ error: 'Table name is required' }, { status: 400 });
    }

    // Fetch data from the specified table
    const { data, error } = await supabase.from(table).select('*');

    if (error) {
      console.error('Error fetching data:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('Error processing request:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}