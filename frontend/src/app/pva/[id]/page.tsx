// frontend/src/app/pva/[id]/page.tsx

// Server component for Student Details page
// Provides server-side week data to eliminate hydration mismatches
// CHANGE: Converted to server component with WeekInfo context provider

import React from 'react';
import { WeekInfoProvider } from '@/contexts/WeekInfoContext';
import { getWeekInfo } from '@/lib/services/weekInfoService';
import StudentDetailsPageClient from './StudentDetailsPageClient';
import ClientAuthGuard from '@/components/auth/ClientAuthGuard';

// Server component for Student Details page
// Provides server-side week data to eliminate hydration mismatches
export default async function StudentDetailsPage() {
  // Get server-side week information
  const weekInfo = await getWeekInfo();
  
  return (
    <ClientAuthGuard requireAuth={true} allowedRoles={['curator', 'manager', 'mentor']}>
      <WeekInfoProvider initialData={weekInfo}>
        <StudentDetailsPageClient />
      </WeekInfoProvider>
    </ClientAuthGuard>
  );
}