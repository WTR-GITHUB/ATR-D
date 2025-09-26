// frontend/src/app/mentors/schedule/page.tsx

// Server component for Schedule page
// Provides server-side week data to eliminate hydration mismatches
// CHANGE: Converted to server component with WeekInfo context provider

import React from 'react';
import { WeekInfoProvider } from '@/contexts/WeekInfoContext';
import { getWeekInfo } from '@/lib/services/weekInfoService';
import SchedulePageClient from './SchedulePageClient';
import ClientAuthGuard from '@/components/auth/ClientAuthGuard';

// Server component for Schedule page
// Provides server-side week data to eliminate hydration mismatches
export default async function SchedulePage() {
  // Get server-side week information
  const weekInfo = await getWeekInfo();
  
  return (
    <ClientAuthGuard requireAuth={true} allowedRoles={['mentor']}>

    <WeekInfoProvider initialData={weekInfo}>
      <SchedulePageClient />
    </WeekInfoProvider>
    </ClientAuthGuard>
  );
} 