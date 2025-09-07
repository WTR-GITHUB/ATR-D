'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Users, BookOpen, TrendingUp, Calendar, Award, MessageSquare, GraduationCap, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function MentorDashboardPage() {
  const { user } = useAuth();

  const mentorStats = [
    {
      title: 'Aktyvūs studentai',
      value: '24',
      change: '+3',
      changeType: 'positive' as const,
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: 'Šios savaitės pamokos',
      value: '18',
      change: '+2',
      changeType: 'positive' as const,
      icon: <BookOpen className="w-6 h-6" />,
    },
    {
      title: 'Vidutinis lankomumas',
      value: '87%',
      change: '+5%',
      changeType: 'positive' as const,
      icon: <TrendingUp className="w-6 h-6" />,
    },
    {
      title: 'Ugdymo planai',
      value: '12',
      change: '+1',
      changeType: 'positive' as const,
      icon: <Award className="w-6 h-6" />,
    },
  ];

  const recentLessons = [
    {
      subject: 'Matematika',
      class: '10A klasė',
      time: '09:00',
      status: 'completed',
      attendance: '22/24',
    },
    {
      subject: 'Fizika',
      class: '11B klasė', 
      time: '10:45',
      status: 'in_progress',
      attendance: '18/20',
    },
    {
      subject: 'Chemija',
      class: '10A klasė',
      time: '14:00',
      status: 'upcoming',
      attendance: '-',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg shadow p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Sveiki, {user?.first_name} {user?.last_name}!
            </h1>
            <p className="text-purple-100 mt-2 text-lg">
              📚 MENTORIAUS VALDYMO CENTRAS
            </p>
            <p className="text-purple-200 text-sm mt-1">
              {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}
            </p>
          </div>
          <div className="text-right">
            <div className="bg-white/20 rounded-lg p-3">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <p className="text-xs text-purple-200 mt-1">Mentor</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mentorStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change} nuo praėjusios savaitės
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Lessons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Šiandienos pamokos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLessons.map((lesson, index) => (
                <div key={index} className={`border rounded-lg p-4 ${
                  lesson.status === 'completed' ? 'border-green-200 bg-green-50' :
                  lesson.status === 'in_progress' ? 'border-blue-200 bg-blue-50' :
                  'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{lesson.subject}</h3>
                      <p className="text-sm text-gray-600">{lesson.class}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{lesson.time}</p>
                      <p className="text-xs text-gray-500">{lesson.attendance}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      lesson.status === 'completed' ? 'bg-green-100 text-green-800' :
                      lesson.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {lesson.status === 'completed' ? 'Įvykdyta' :
                       lesson.status === 'in_progress' ? 'Vyksta' : 'Planuojama'}
                    </span>
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
              <Link href="/mentors/violations" className="block">
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium">Skolų valdymas</span>
                  </div>
                </button>
              </Link>
              
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium">Peržiūrėti veiklas</span>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Ugdymo planai</span>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Studentų sąrašas</span>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium">Tvarkaraštis</span>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}