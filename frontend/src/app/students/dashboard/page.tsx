// /home/master/DIENYNAS/frontend/src/app/students/dashboard/page.tsx
// Studentų dashboard puslapis su savaitės tvarkaraščiu (server komponentas)
// CHANGE: Konvertuota į server component; pridėtas WeekInfoProvider su server-side weekInfo

import React from 'react';
import { WeekInfoProvider } from '@/contexts/WeekInfoContext';
import { getWeekInfo } from '@/lib/services/weekInfoService';
import StudentsDashboardClient from './StudentsDashboardClient';

export default async function StudentsDashboardPage() {
  const weekInfo = await getWeekInfo();

  return (
    <WeekInfoProvider initialData={weekInfo}>
      <StudentsDashboardClient />
    </WeekInfoProvider>
  );
}