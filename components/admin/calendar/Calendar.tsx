'use client';

import { Calendar, dateFnsLocalizer, View, SlotInfo } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { useState, useEffect } from 'react';
import { enUS } from 'date-fns/locale';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };

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
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);

  const fetchEvents = async () => {
    const { data, error } = await supabase.from('calendar').select('*');
    if (error) {
      console.error('❌ Error fetching events:', error.message);
      return;
    }

    const formatted = data.map((event) => {
      if (event.start) {
        const eventStart = new Date(event.start);
        const startHour = eventStart.getHours();
        const dayOfWeek = eventStart.getDay(); // 0 = Sunday, 6 = Saturday
        if (startHour >= 12 && startHour < 15 && dayOfWeek !== 0 && dayOfWeek !== 6) {
          event.title += ' - WFH';
        } else if (startHour >= 17 && startHour < 23 && dayOfWeek !== 0 && dayOfWeek !== 6) {
          event.title += ' - Leave HQ Early at 3pm';
        }
      }

      return {
        id: event.id,
        title: event.title,
        start: new Date(event.start),
        end: new Date(event.end),
        allDay: Boolean(event.all_day),
      };
    });

    setEvents(formatted);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const handleResponsiveView = () => {
      setView(window.innerWidth < 768 ? 'day' : 'week');
      setDate(new Date());
    };

    handleResponsiveView();
    window.addEventListener('resize', handleResponsiveView);
    return () => window.removeEventListener('resize', handleResponsiveView);
  }, []);

  const handleSelectSlot = async (slotInfo: SlotInfo) => {
    const title = prompt('Event title?');
    if (!title) return;

    const newEvent = {
      title,
      start: slotInfo.start.toISOString(),
      end: slotInfo.end.toISOString(),
      all_day: slotInfo.action === 'select' && slotInfo.start.getHours() === 0 && slotInfo.end.getHours() === 0,
    };

    const { error } = await supabase.from('calendar').insert(newEvent);
    if (error) {
      alert('❌ Failed to create event');
    } else {
      await fetchEvents();
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/admin/cubs-sync');
      const json = await res.json();
      alert(`✅ Synced ${json.inserted ?? 0} Cubs home games`);
      await fetchEvents();
    } catch (err) {
      console.error('❌ Sync failed:', err);
      alert('❌ Failed to sync Cubs games');
    } finally {
      setSyncing(false);
    }
  };

  const handleEventClick = async (event: any) => {
    const confirmed = confirm(`Delete event: "${event.title}"?`);
    if (!confirmed) return;

    try {
      const { error } = await supabase.from('calendar').delete().eq('id', event.id);
      if (error) throw new Error(error.message);
      alert('🗑️ Event deleted');
      await fetchEvents();
    } catch (err) {
      console.error('❌ Error deleting event:', err);
      alert('❌ Failed to delete event');
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4 sm:p-6">
      <h1 className="text-3xl font-bold mb-6">📅 MyCalendar</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
        >
          {syncing ? '🔄 Syncing...' : '🔄 Sync Cubs Games'}
        </button>

        <Link
          href="/admin/calendar/create"
          className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded inline-flex items-center"
        >
          ➕ Create Event
        </Link>
      </div>

      <div className="bg-white rounded-lg p-2 sm:p-4 shadow text-black w-full h-[85vh]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={['week', 'day']}
          date={date}
          view={view}
          onView={setView}
          onNavigate={setDate}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleEventClick}
          selectable
          className="h-full"
          min={new Date(1970, 1, 1, 7, 0)}
          max={new Date(1970, 1, 1, 22, 0)}
        />
      </div>
    </div>
  );
}