// frontend/src/app/mentors/plans/imuplan-assigned/page.tsx

// Page for viewing assigned individual student education plans (IMU plans)
// Displays a table with 7 columns: Data, Pamoka (time), Dalykas, Lygis, Vardas, Pavardė, Pamoka (title)
// CHANGE: Created new page to replace the old "Koreguoti priskirtą ugdymo planą" functionality

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ReactDataTable } from '@/components/DataTable';
import Button from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { GraduationCap, BookOpen, Calendar, Users, ArrowLeft, Filter } from 'lucide-react';
import api from '@/lib/api';

// Interface for IMU plan data
interface IMUPlan {
  id: number;
  student_name: string;
  lesson_title: string;
  lesson_subject: string;
  global_schedule_date: string;
  global_schedule_period_name: string;
  global_schedule_level: string;
  attendance_status: string;
  created_at: string;
}

// Interface for subject data
interface Subject {
  id: number;
  name: string;
  description: string;
}

export default function IMUPlanAssignedPage() {
  const { user } = useAuth();
  
  const [plans, setPlans] = useState<IMUPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<IMUPlan[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch subjects from API
  useEffect(() => {
    async function fetchSubjects() {
      try {
        const response = await api.get('/crm/mentor-subjects/my_subjects/');
        setSubjects(response.data);
      } catch (error: any) {
        console.error('Klaida gaunant dalykus:', error);
      }
    }

    fetchSubjects();
  }, []);

  // Fetch IMU plans from API
  useEffect(() => {
    async function fetchIMUPlans() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get('/plans/imu-plans/');
        setPlans(response.data);
        setFilteredPlans(response.data);
      } catch (error: any) {
        console.error('Klaida gaunant IMU planus:', error);
        setError('Įvyko klaida gaunant priskirtus ugdymo planus');
      } finally {
        setIsLoading(false);
      }
    }

    fetchIMUPlans();
  }, []);

  // Filter plans when subject changes
  useEffect(() => {
    if (selectedSubject && selectedSubject !== 'all') {
      const filtered = plans.filter(plan => plan.lesson_subject === selectedSubject);
      setFilteredPlans(filtered);
    } else {
      setFilteredPlans(plans);
    }
  }, [selectedSubject, plans]);

  // Format date function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('lt-LT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Split full name into first and last name
  const splitName = (fullName: string) => {
    const nameParts = fullName.split(' ');
    return {
      firstName: nameParts[0] || '-',
      lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : '-'
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <GraduationCap className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Klaida</h3>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header su atgal mygtuku */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = '/mentors/plans'}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Atgal</span>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Ugdymo planai</h1>
      </div>

      {/* Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Iš viso planų</p>
              <p className="text-2xl font-bold text-gray-900">{plans.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unikalūs dalykai</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(plans.map(p => p.lesson_subject)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <GraduationCap className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unikalūs mokiniai</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(plans.map(p => p.student_name)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unikalūs periodai</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(plans.map(p => p.global_schedule_period_name)).size}
              </p>
            </div>
          </div>
        </div>
      </div>





      {/* IMU Plans table */}
      {filteredPlans.length === 0 ? (
        <div className="text-center py-8">
          <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Priskirtų ugdymo planų nėra
          </h3>
          <p className="text-gray-600">
            Kol kas nėra priskirtų individualių mokinių ugdymo planų.
          </p>
        </div>
      ) : (
        <ReactDataTable
          data={filteredPlans.map(plan => {
            const { firstName, lastName } = splitName(plan.student_name);
            return {
              ...plan,
              data_formatted: formatDate(plan.global_schedule_date),
              period_name: plan.global_schedule_period_name || '-',
              lesson_title: plan.lesson_title || '-',
              lesson_subject: plan.lesson_subject || '-',
              level_name: plan.global_schedule_level || '-',
              first_name: firstName,
              last_name: lastName
            };
          })}
          columns={[
            { title: 'Data', data: 'data_formatted' },
            { title: 'Pamoka', data: 'period_name' },
            { title: 'Dalykas', data: 'lesson_subject' },
            { title: 'Lygis', data: 'level_name' },
            { title: 'Vardas', data: 'first_name' },
            { title: 'Pavardė', data: 'last_name' },
            { title: 'Pavadinimas', data: 'lesson_title' }
          ]}
          title=""
          itemsPerPage={100}
          showFilters={true}
          filterableColumns={['data_formatted', 'period_name', 'level_name', 'first_name', 'last_name', 'lesson_title']}
          customHeader={
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Priskirtų ugdymo planų sąrašas
              </h2>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Visi dalykai" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Visi dalykai</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.name}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          }
        />
      )}
    </div>
  );
}
