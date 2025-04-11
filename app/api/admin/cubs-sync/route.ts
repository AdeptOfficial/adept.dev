import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.json();
  const { title, start, end, all_day } = body;

  try {
    const { error } = await supabase.from('calendar').insert({
      title,
      start, // ⛔ no toISOString()
      end,
      all_day: all_day || false,
    });

    if (error) {
      console.error('[Create Event] Supabase insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Create Event] Unexpected error:', err);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
