import ManagersDashboard from './dashboard/page';
import ClientAuthGuard from '@/components/auth/ClientAuthGuard';

export default function ManagersPage() {
  return (
    <ClientAuthGuard requireAuth={true} allowedRoles={['manager']}>
      <ManagersDashboard />
    </ClientAuthGuard>
  );
}