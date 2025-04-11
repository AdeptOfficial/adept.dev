import AdminClientPage from '@/components/admin/AdminClientPage';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    redirect('/');
  }

  return <AdminClientPage />;
}
