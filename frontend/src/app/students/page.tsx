// /home/master/DIENYNAS/frontend/src/app/students/page.tsx
// Studentų puslapis su WeekInfoProvider
// CHANGE: Pridėtas WeekInfoProvider, kad StudentWeeklyScheduleCalendar galėtų naudoti useWeekInfoContext

import React from 'react';
import { WeekInfoProvider } from '@/contexts/WeekInfoContext';
import { getWeekInfo } from '@/lib/services/weekInfoService';
import StudentsDashboard from './dashboard/page';
import ClientAuthGuard from '@/components/auth/ClientAuthGuard';

// Server component for Students page
// Provides server-side week data to eliminate hydration mismatches
export default async function StudentsPage() {
  // Get server-side week information
  const weekInfo = await getWeekInfo();
  
  return (
    <ClientAuthGuard requireAuth={true} allowedRoles={['student']}>
      <WeekInfoProvider initialData={weekInfo}>
        <StudentsDashboard />
      </WeekInfoProvider>
    </ClientAuthGuard>
  );
}