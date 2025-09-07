// frontend/src/app/dashboard/manager/page.tsx
// Manager dashboard puslapis - sistemos valdytojo valdymo sąsaja
// CHANGE: Perkeltas iš /manager į /dashboard/manager pagal naują rolių struktūrą
'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Users, BookOpen, TrendingUp, Calendar, Award, Settings, Shield, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function ManagerDashboardPage() {
  const { user } = useAuth();

  const adminStats = [
    {
      title: 'Viso vartotojų',
      value: '156',
      change: '+12',
      changeType: 'positive' as const,
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: 'Studentų',
      value: '89',
      change: '+8',
      changeType: 'positive' as const,
      icon: <BookOpen className="w-6 h-6" />,
    },
    {
      title: 'Tėvų',
      value: '45',
      change: '+5',
      changeType: 'positive' as const,
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: 'Kuratorių',
      value: '12',
      change: '+2',
      changeType: 'positive' as const,
      icon: <Award className="w-6 h-6" />,
    },
    {
      title: 'Mentorių',
      value: '10',
      change: '+1',
      changeType: 'positive' as const,
      icon: <TrendingUp className="w-6 h-6" />,
    },
    {
      title: 'Aktyvūs dalykai',
      value: '24',
      change: '+3',
      changeType: 'positive' as const,
      icon: <Calendar className="w-6 h-6" />,
    },
  ];

  const systemStatus = [
    {
      name: 'Duomenų bazė',
      status: 'online',
      lastCheck: '2024-01-14 15:30',
    },
    {
      name: 'API serveris',
      status: 'online',
      lastCheck: '2024-01-14 15:30',
    },
    {
      name: 'Autentifikacija',
      status: 'online',
      lastCheck: '2024-01-14 15:30',
    },
    {
      name: 'Backup sistema',
      status: 'online',
      lastCheck: '2024-01-14 15:30',
    },
  ];

  const recentActivities = [
    {
      user: 'Petras Petraitis',
      action: 'Pridėjo naują studentą',
      time: '2 valandos atgal',
      type: 'create',
    },
    {
      user: 'Marija Marijaitė',
      action: 'Atnaujino kuratoriaus informaciją',
      time: '4 valandos atgal',
      type: 'update',
    },
    {
      user: 'Jonas Jonaitis',
      action: 'Sukūrė naują dalyką',
      time: '6 valandų atgal',
      type: 'create',
    },
    {
      user: 'Antanas Antanaitis',
      action: 'Ištrino neaktyvų vartotoją',
      time: '8 valandų atgal',
      type: 'delete',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Sveiki, {user?.first_name} {user?.last_name}!
            </h1>
            <p className="text-blue-100 mt-2 text-lg">
              📊 SISTEMOS VALDYTOJO VALDYMO CENTRAS
            </p>
            <p className="text-blue-200 text-sm mt-1">
              {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}
            </p>
          </div>
          <div className="text-right">
            <div className="bg-white/20 rounded-lg p-3">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <p className="text-xs text-blue-200 mt-1">Manager</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminStats.map((stat, index) => (
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

      {/* System Status and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sistemos būsena</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemStatus.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      service.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{service.name}</p>
                      <p className="text-xs text-gray-500">Paskutinis patikrinimas: {service.lastCheck}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    service.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {service.status === 'online' ? 'Veikia' : 'Nepasiekiama'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Naujausi veiksmai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  activity.type === 'create' ? 'border-green-200 bg-green-50' :
                  activity.type === 'update' ? 'border-blue-200 bg-blue-50' :
                  'border-red-200 bg-red-50'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.user}</p>
                      <p className="text-sm text-gray-600">{activity.action}</p>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
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
          <CardTitle>Sistemos valdymo veiklos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link href="/managers/violations" className="block">
              <button className="text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors w-full">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium">Skolų valdymas</span>
                </div>
              </button>
            </Link>
            
            <button className="text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Vartotojų valdymas</span>
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
                <Settings className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Sistemos nustatymai</span>
              </div>
            </button>
            
            <button className="text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium">Saugumo valdymas</span>
            </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
