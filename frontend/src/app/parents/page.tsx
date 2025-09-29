import ParentsDashboard from './dashboard/page';
import ClientAuthGuard from '@/components/auth/ClientAuthGuard';

export default function ParentsPage() {
  return (
    <ClientAuthGuard requireAuth={true} allowedRoles={['parent']}>
      <ParentsDashboard />
    </ClientAuthGuard>
  );
}