import CuratorsDashboard from './dashboard/page';
import ClientAuthGuard from '@/components/auth/ClientAuthGuard';

export default function CuratorsPage() {
  return (
    <ClientAuthGuard requireAuth={true} allowedRoles={['curator']}>
      <CuratorsDashboard />
    </ClientAuthGuard>
  );
}