'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Users, BookOpen, TrendingUp, Calendar, Award, MessageSquare } from 'lucide-react';

export default function MentorsDashboardPage() {
  const { user } = useAuth();

  const mentorStats = [
    {
      title: 'Studentai',
      value: '25',
      change: '+3',
      changeType: 'positive' as const,
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: 'Dalykai',
      value: '4',
      change: '+1',
      changeType: 'positive' as const,
      icon: <BookOpen className="w-6 h-6" />,
    },
    {
      title: 'Vidutinis studento pažymys',
      value: '8.1',
      change: '+0.3',
      changeType: 'positive' as const,
      icon: <Award className="w-6 h-6" />,
    },
    {
      title: 'Pamokų valandos',
      value: '48',
      change: '+6',
      changeType: 'positive' as const,
      icon: <Calendar className="w-6 h-6" />,
    },
  ];

  const subjects = [
    {
      name: 'Matematika',
      students: 8,
      averageGrade: 8.5,
      nextLesson: '2024-01-15 14:00',
      progress: 85,
    },
    {
      name: 'Fizika',
      students: 6,
      averageGrade: 7.8,
      nextLesson: '2024-01-16 10:00',
      progress: 72,
    },
    {
      name: 'Chemija',
      students: 5,
      averageGrade: 8.2,
      nextLesson: '2024-01-17 16:00',
      progress: 68,
    },
    {
      name: 'Biologija',
      students: 6,
      averageGrade: 7.9,
      nextLesson: '2024-01-18 12:00',
      progress: 91,
    },
  ];

  const recentGrades = [
    {
      student: 'Jonas Jonaitis',
      subject: 'Matematika',
      grade: 9,
      date: '2024-01-14',
      type: 'test',
    },
    {
      student: 'Marija Marijaitė',
      subject: 'Fizika',
      grade: 8,
      date: '2024-01-13',
      type: 'homework',
    },
    {
      student: 'Petras Petraitis',
      subject: 'Chemija',
      grade: 7,
      date: '2024-01-12',
      type: 'quiz',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Sveiki, {user?.first_name} {user?.last_name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Jūsų mentoriaus dashboard - {new Date().toLocaleDateString('lt-LT')}
        </p>
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

      {/* Subjects Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dalykų sąrašas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjects.map((subject, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                      <p className="text-sm text-gray-600">{subject.students} studentų</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{subject.averageGrade}</p>
                      <p className="text-xs text-gray-500">Vidutinis pažymys</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progresas</span>
                      <span className="font-medium">{subject.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${subject.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Kita pamoka: {subject.nextLesson}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Naujausi pažymiai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentGrades.map((grade, index) => (
                <div key={index} className="p-3 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{grade.student}</p>
                      <p className="text-sm text-gray-600">{grade.subject}</p>
                      <p className="text-xs text-gray-500">
                        {grade.type === 'test' ? 'Testas' :
                         grade.type === 'homework' ? 'Namų darbai' : 'Kontrolinis'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{grade.grade}</p>
                      <span className="text-xs text-gray-500">{grade.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Greitos veiklos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <button className="text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Pridėti pažymį</span>
              </div>
            </button>
            
            <button className="text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Pamokų tvarkaraštis</span>
              </div>
            </button>
            
            <button className="text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Susisiekti su kuratoriumi</span>
              </div>
            </button>
            
            <button className="text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Award className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium">Ataskaitos</span>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 