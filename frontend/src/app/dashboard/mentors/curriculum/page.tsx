'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { GraduationCap, BookOpen, Calendar, Target } from 'lucide-react';

export default function MentorCurriculumPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Greitos veiklos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Sukurti naują ugdymo planą</span>
              </div>
            </button>
            
            <button className="text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Dalykų sąrašas</span>
              </div>
            </button>
            
            <button className="text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Tikslų valdymas</span>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      <Card>
        <CardHeader>
          <CardTitle>Ugdymo planų sąrašas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Ugdymo planų nėra</h3>
            <p className="mt-1 text-sm text-gray-500">
              Kol kas ugdymo planų sąrašas tuščias. Ugdymo planai bus rodomi čia.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 