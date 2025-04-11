import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dynamicImport from 'next/dynamic';

const AdminTableClient = dynamicImport(() => import('@/components/admin/tables/AdminTableClient'), {
  ssr: false,
});

export const dynamic = 'force-dynamic';

interface Props {
  params: { table: string };
}

export default async function AdminTablePage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    redirect('/');
  }
  return <AdminTableClient params={params} />;
}
