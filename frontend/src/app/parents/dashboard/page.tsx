// frontend/src/app/dashboard/parents/page.tsx
'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Users, BookOpen, TrendingUp, Calendar, Award, MessageSquare } from 'lucide-react';

export default function ParentsDashboardPage() {
  const { user } = useAuth();

  const parentStats = [
    {
      title: 'Vaikai',
      value: '2',
      change: '+0',
      changeType: 'positive' as const,
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: 'Vidutinis vaiko pažymys',
      value: '8.2',
      change: '+0.4',
      changeType: 'positive' as const,
      icon: <Award className="w-6 h-6" />,
    },
    {
      title: 'Mokymosi valandos',
      value: '312',
      change: '+24',
      changeType: 'positive' as const,
      icon: <Calendar className="w-6 h-6" />,
    },
    {
      title: 'Nauji pranešimai',
      value: '3',
      change: '+1',
      changeType: 'positive' as const,
      icon: <MessageSquare className="w-6 h-6" />,
    },
  ];

  const children = [
    {
      name: 'Jonas Jonaitis',
      grade: '10 klasė',
      averageGrade: 8.5,
      subjects: 8,
      attendance: 95,
      lastUpdate: '2024-01-14',
    },
    {
      name: 'Marija Jonaitė',
      grade: '8 klasė',
      averageGrade: 7.8,
      subjects: 6,
      attendance: 92,
      lastUpdate: '2024-01-13',
    },
  ];

  const recentMessages = [
    {
      from: 'Petras Petraitis (Matematikos mokytojas)',
      subject: 'Jonas puikiai atliko namų darbus',
      date: '2024-01-14',
      type: 'positive',
    },
    {
      from: 'Marija Marijaitė (Fizikos mokytoja)',
      subject: 'Marija turi atsiskaityti praleistą pamoką',
      date: '2024-01-13',
      type: 'warning',
    },
    {
      from: 'Antanas Antanaitis (Kuratorius)',
      subject: 'Mėnesinis progreso ataskaita',
      date: '2024-01-12',
      type: 'info',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-rose-600 to-rose-800 rounded-lg shadow p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Sveiki, {user?.first_name} {user?.last_name}!
            </h1>
            <p className="text-rose-100 mt-2 text-lg">
              👨‍👩‍👧‍👦 TĖVŲ VALDYMO CENTRAS
            </p>
            <p className="text-rose-200 text-sm mt-1">
              {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}
            </p>
          </div>
          <div className="text-right">
            <div className="bg-white/20 rounded-lg p-3">
              <Users className="w-8 h-8 text-white" />
            </div>
            <p className="text-xs text-rose-200 mt-1">Parent</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {parentStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm ${
                    stat.changeType === 'positive' ? 'text-green-600' : 
                    stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
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

      {/* Children Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vaikų progresas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {children.map((child, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{child.name}</h3>
                      <p className="text-sm text-gray-600">{child.grade}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{child.averageGrade}</p>
                      <p className="text-xs text-gray-500">Vidutinis pažymys</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Dalykai</p>
                      <p className="font-medium">{child.subjects}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Lankomumas</p>
                      <p className="font-medium">{child.attendance}%</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Atnaujinta: {child.lastUpdate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Naujausi pranešimai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMessages.map((message, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  message.type === 'positive' ? 'border-green-200 bg-green-50' :
                  message.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                  'border-blue-200 bg-blue-50'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{message.from}</p>
                      <p className="text-sm text-gray-600">{message.subject}</p>
                    </div>
                    <span className="text-xs text-gray-500">{message.date}</span>
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
                <span className="text-sm font-medium">Vaikų pažymiai</span>
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
                <span className="text-sm font-medium">Susisiekti su mokytojais</span>
              </div>
            </button>
            
            <button className="text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium">Tėvų susirinkimas</span>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 