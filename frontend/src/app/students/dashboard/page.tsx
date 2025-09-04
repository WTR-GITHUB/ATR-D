// frontend/src/app/dashboard/students/page.tsx
'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BookOpen, Users, TrendingUp, Calendar, Award } from 'lucide-react';

export default function StudentsDashboardPage() {
  const { user } = useAuth();

  const studentStats = [
    {
      title: 'Mokomi dalykai',
      value: '8',
      change: '+2',
      changeType: 'positive' as const,
      icon: <BookOpen className="w-6 h-6" />,
    },
    {
      title: 'Vidutinis pažymys',
      value: '8.5',
      change: '+0.3',
      changeType: 'positive' as const,
      icon: <Award className="w-6 h-6" />,
    },
    {
      title: 'Užbaigti testai',
      value: '24',
      change: '+5',
      changeType: 'positive' as const,
      icon: <TrendingUp className="w-6 h-6" />,
    },
    {
      title: 'Mokymosi valandos',
      value: '156',
      change: '+12',
      changeType: 'positive' as const,
      icon: <Calendar className="w-6 h-6" />,
    },
  ];

  const recentSubjects = [
    {
      name: 'Matematika',
      progress: 85,
      nextLesson: '2024-01-15 14:00',
      teacher: 'Petras Petraitis',
    },
    {
      name: 'Fizika',
      progress: 72,
      nextLesson: '2024-01-16 10:00',
      teacher: 'Marija Marijaitė',
    },
    {
      name: 'Chemija',
      progress: 68,
      nextLesson: '2024-01-17 16:00',
      teacher: 'Jonas Jonaitis',
    },
    {
      name: 'Biologija',
      progress: 91,
      nextLesson: '2024-01-18 12:00',
      teacher: 'Antanas Antanaitis',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-800 rounded-lg shadow p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Sveiki, {user?.first_name} {user?.last_name}!
            </h1>
            <p className="text-orange-100 mt-2 text-lg">
              🎒 STUDENTO VALDYMO CENTRAS
            </p>
            <p className="text-orange-200 text-sm mt-1">
              {new Date().toLocaleDateString('lt-LT')}
            </p>
          </div>
          <div className="text-right">
            <div className="bg-white/20 rounded-lg p-3">
              <Users className="w-8 h-8 text-white" />
            </div>
            <p className="text-xs text-orange-200 mt-1">Student</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {studentStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change} nuo praėjusio mėnesio
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subjects Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dalykų progresas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSubjects.map((subject, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{subject.name}</span>
                    <span className="text-sm text-gray-600">{subject.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${subject.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Dėstytojas: {subject.teacher}</span>
                    <span>Kita pamoka: {subject.nextLesson}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Greitos veiklos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Peržiūrėti namų darbus</span>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Pamokų tvarkaraštis</span>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium">Mano pažymiai</span>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium">Susisiekti su kuratoriumi</span>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 