// /frontend/src/app/mentors/schedule/SchedulePageClient.tsx

// Client component for Schedule page
// Handles all client-side interactivity while using server-side week data
// CHANGE: Extracted client logic from page.tsx to separate component

'use client';

import React from 'react';
import WeeklySchedule from '@/components/dashboard/WeeklySchedule';
// import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Client-side Schedule page component
// Handles all interactive functionality
const SchedulePageClient = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/mentors/lessons" className="text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tvarkaraštis</h1>
            <p className="text-gray-600">Savaitės pamokų tvarkaraštis</p>
          </div>
        </div>
      </div>

      {/* Weekly Schedule */}
      <WeeklySchedule />
    </div>
  );
};

export default SchedulePageClient;
