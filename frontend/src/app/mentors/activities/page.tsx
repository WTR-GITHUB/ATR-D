// frontend/src/app/mentors/activities/page.tsx

// Server component for Veiklos (Activities) page
// Provides server-side week data to eliminate hydration mismatches
// CHANGE: Converted to server component with WeekInfo context provider
// CHANGE: Extracted client logic to VeiklosPageClient component

import React from 'react';
import { WeekInfoProvider } from '@/contexts/WeekInfoContext';
import { getWeekInfo } from '@/lib/services/weekInfoService';
import VeiklosPageClient from './VeiklosPageClient';
import ClientAuthGuard from '@/components/auth/ClientAuthGuard';

// Server component for Veiklos page
// Provides server-side week data to eliminate hydration mismatches
export default async function VeiklosPage() {
  // Get server-side week information
  const weekInfo = await getWeekInfo();
  
  return (
    <ClientAuthGuard requireAuth={true} allowedRoles={['mentor']}>
      <WeekInfoProvider initialData={weekInfo}>
        <VeiklosPageClient />
      </WeekInfoProvider>
    </ClientAuthGuard>
  );
}
