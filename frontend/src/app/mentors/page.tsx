import MentorsDashboard from './dashboard/page';
import ClientAuthGuard from '@/components/auth/ClientAuthGuard';

export default function MentorsPage() {
  return (
    <ClientAuthGuard requireAuth={true} allowedRoles={['mentor']}>
      <MentorsDashboard />
    </ClientAuthGuard>
  );
} 