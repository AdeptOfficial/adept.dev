// app/admin/calendar/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dynamicImport from 'next/dynamic';

const Calendar = dynamicImport(() => import('@/components/admin/calendar/Calendar'), {
  ssr: false,
});

export const dynamic = 'force-dynamic';

export default async function AdminCalendarRoute() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    redirect('/');
  }

  return <Calendar />;
}
