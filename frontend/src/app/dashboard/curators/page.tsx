'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Users, BookOpen, TrendingUp, Calendar, Award, MessageSquare } from 'lucide-react';

export default function CuratorsDashboardPage() {
  const { user } = useAuth();

  const curatorStats = [
    {
      title: 'Studentai',
      value: '15',
      change: '+2',
      changeType: 'positive' as const,
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: 'Vidutinis studento pažymys',
      value: '7.8',
      change: '+0.5',
      changeType: 'positive' as const,
      icon: <Award className="w-6 h-6" />,
    },
    {
      title: 'Aktyvūs dalykai',
      value: '12',
      change: '+1',
      changeType: 'positive' as const,
      icon: <BookOpen className="w-6 h-6" />,
    },
    {
      title: 'Nauji pranešimai',
      value: '5',
      change: '+2',
      changeType: 'positive' as const,
      icon: <MessageSquare className="w-6 h-6" />,
    },
  ];

  const students = [
    {
      name: 'Jonas Jonaitis',
      grade: '10 klasė',
      averageGrade: 8.5,
      attendance: 95,
      status: 'excellent',
      lastContact: '2024-01-14',
    },
    {
      name: 'Marija Marijaitė',
      grade: '9 klasė',
      averageGrade: 7.2,
      attendance: 88,
      status: 'good',
      lastContact: '2024-01-13',
    },
    {
      name: 'Petras Petraitis',
      grade: '11 klasė',
      averageGrade: 6.8,
      attendance: 75,
      status: 'needs_attention',
      lastContact: '2024-01-12',
    },
  ];

  const recentActivities = [
    {
      student: 'Jonas Jonaitis',
      action: 'Puikiai atliko matematikos testą',
      subject: 'Matematika',
      date: '2024-01-14',
      type: 'positive',
    },
    {
      student: 'Marija Marijaitė',
      action: 'Reikia papildomos pagalbos fizikoje',
      subject: 'Fizika',
      date: '2024-01-13',
      type: 'warning',
    },
    {
      student: 'Petras Petraitis',
      action: 'Praleido kelias pamokas',
      subject: 'Bendra',
      date: '2024-01-12',
      type: 'negative',
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
          Jūsų kuratoriaus dashboard - {new Date().toLocaleDateString('lt-LT')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {curatorStats.map((stat, index) => (
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

      {/* Students Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Studentų sąrašas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students.map((student, index) => (
                <div key={index} className={`border rounded-lg p-4 ${
                  student.status === 'excellent' ? 'border-green-200 bg-green-50' :
                  student.status === 'good' ? 'border-blue-200 bg-blue-50' :
                  'border-yellow-200 bg-yellow-50'
                }`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-600">{student.grade}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{student.averageGrade}</p>
                      <p className="text-xs text-gray-500">Vidutinis pažymys</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Lankomumas</p>
                      <p className="font-medium">{student.attendance}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Paskutinis kontaktas</p>
                      <p className="font-medium">{student.lastContact}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      student.status === 'excellent' ? 'bg-green-100 text-green-800' :
                      student.status === 'good' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {student.status === 'excellent' ? 'Puikiai' :
                       student.status === 'good' ? 'Gerai' : 'Reikia dėmesio'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Naujausi įvykiai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  activity.type === 'positive' ? 'border-green-200 bg-green-50' :
                  activity.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                  'border-red-200 bg-red-50'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.student}</p>
                      <p className="text-sm text-gray-600">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.subject}</p>
                    </div>
                    <span className="text-xs text-gray-500">{activity.date}</span>
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
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Studentų sąrašas</span>
              </div>
            </button>
            
            <button className="text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Dalykų valdymas</span>
              </div>
            </button>
            
            <button className="text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Susisiekti su tėvais</span>
              </div>
            </button>
            
            <button className="text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium">Susirinkimai</span>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 