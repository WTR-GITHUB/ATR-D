'use client';

import React from 'react';
import WeeklySchedule from '@/components/dashboard/WeeklySchedule';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/mentors/lessons" className="text-gray-600 hover:text-gray-800">
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
} 