'use client';

import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { useState, useEffect } from 'react';
import { enUS } from 'date-fns/locale';
import { createClient } from '@supabase/supabase-js';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminCalendarPage() {
  const [view, setView] = useState<View>('week');
  const [date, setDate] = useState<Date>(new Date('2024-04-12'));
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase.from('calendar').select('*');
      if (error) {
        console.error('❌ Error fetching events:', error.message);
        return;
      }

      console.log('📦 Raw Supabase data:', data);

      const formatted = data.map((event) => ({
        title: event.title,
        start: new Date(event.start),
        end: new Date(event.end),
        allDay: Boolean(event.all_day),
      }));

      console.log('📅 Formatted events:', formatted);
      console.log('🕒 Current time:', new Date());

      setEvents(formatted);
    };

    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4 sm:p-6">
      <h1 className="text-3xl font-bold mb-6">📅 MyCalendar</h1>
      <div className="bg-white rounded-lg p-2 sm:p-4 shadow text-black w-full h-[85vh]">
        <Calendar
          localizer={localizer}
          events={events.length > 0 ? events : [
            {
              title: '🧪 Test Event',
              start: new Date(),
              end: new Date(Date.now() + 3600000),
              allDay: false,
            },
          ]}
          startAccessor="start"
          endAccessor="end"
          className="h-full"
          views={['week', 'day']}
          defaultView={view}
          view={view}
          date={date}
          onView={(v) => setView(v)}
          onNavigate={(newDate) => setDate(newDate)}
          min={new Date(1970, 1, 1, 7, 0)}
          max={new Date(1970, 1, 1, 22, 0)}
        />
      </div>
    </div>
  );
}
