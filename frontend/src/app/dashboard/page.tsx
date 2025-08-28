// frontend/src/app/dashboard/page.tsx
'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Users, BookOpen, GraduationCap, UserCheck, TrendingUp, Calendar } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Viso vartotojų',
      value: '156',
      change: '+12%',
      changeType: 'positive' as const,
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: 'Studentų',
      value: '89',
      change: '+8%',
      changeType: 'positive' as const,
      icon: <GraduationCap className="w-6 h-6" />,
    },
    {
      title: 'Tėvų',
      value: '45',
      change: '+5%',
      changeType: 'positive' as const,
      icon: <UserCheck className="w-6 h-6" />,
    },
    {
      title: 'Kuratorių',
      value: '12',
      change: '+2%',
      changeType: 'positive' as const,
      icon: <BookOpen className="w-6 h-6" />,
    },
    {
      title: 'Mentorių',
      value: '10',
      change: '+1%',
      changeType: 'positive' as const,
      icon: <TrendingUp className="w-6 h-6" />,
    },
    {
      title: 'Aktyvūs dalykai',
      value: '24',
      change: '+3%',
      changeType: 'positive' as const,
      icon: <Calendar className="w-6 h-6" />,
    },
  ];

  const recentActivity = [
    {
      id: 1,
      user: 'Jonas Jonaitis',
      action: 'Pridėjo naują dalyką',
      subject: 'Matematika',
      time: '2 valandos atgal',
    },
    {
      id: 2,
      user: 'Petras Petraitis',
      action: 'Atnaujino studento informaciją',
      subject: 'Fizika',
      time: '4 valandos atgal',
    },
    {
      id: 3,
      user: 'Marija Marijaitė',
      action: 'Pridėjo naują tėvą',
      subject: 'Chemija',
      time: '6 valandų atgal',
    },
    {
      id: 4,
      user: 'Antanas Antanaitis',
      action: 'Sukūrė naują kuratorių',
      subject: 'Biologija',
      time: '8 valandų atgal',
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
          Šiandien yra {new Date().toLocaleDateString('lt-LT')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Naujausi veiksmai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.user}
                    </p>
                    <p className="text-sm text-gray-600">
                      {activity.action} - {activity.subject}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
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
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Pridėti naują studentą</span>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Sukurti naują dalyką</span>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <UserCheck className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium">Pridėti tėvą</span>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <GraduationCap className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium">Priskirti kuratorių</span>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 