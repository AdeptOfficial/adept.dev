// app/api/admin/calendar-create/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { title, start, end, all_day } = await req.json();

  // Convert local datetime strings to UTC ISO strings
  const toUTC = (dt: string) => new Date(dt).toISOString();

  const { error } = await supabase.from('calendar').insert([
    {
      title,
      start: toUTC(start),
      end: toUTC(end),
      all_day,
    },
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
