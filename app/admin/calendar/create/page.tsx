'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CreateCustomEventPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddEvent = async () => {
    if (!title || !start || !end) {
      return alert('❌ Fill out all fields');
    }
  
    const startDate = new Date(start);
    const endDate = new Date(end);
  
    if (endDate <= startDate) {
      return alert('❌ End time must be after start time');
    }
  
    setLoading(true);
  
    try {
      const startUTC = startDate.toISOString();
      const endUTC = endDate.toISOString();
  
      const { error } = await supabase.from('calendar').insert({
        title,
        start: startUTC,
        end: endUTC,
        all_day: allDay,
      });
  
      if (error) {
        alert('❌ Failed to add event');
        console.error(error);
      } else {
        alert('✅ Event added!');
        router.push('/admin/calendar');
      }
    } catch (err) {
      console.error('❌ Error adding event:', err);
      alert('❌ Failed to add event');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#121212] text-white p-6">
      <h1 className="text-3xl font-bold mb-4">➕ Create Custom Event</h1>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Event title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 rounded text-black"
        />

        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="w-full p-2 rounded text-black"
          />
          <input
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="w-full p-2 rounded text-black"
          />
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
          />
          All day
        </label>

        <button
          onClick={handleAddEvent}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          {loading ? 'Saving...' : '➕ Add Event'}
        </button>
      </div>
    </div>
  );
}
