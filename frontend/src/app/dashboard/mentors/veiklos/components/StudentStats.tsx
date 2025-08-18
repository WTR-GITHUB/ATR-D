// frontend/src/app/dashboard/mentors/veiklos/components/StudentStats.tsx

// Studentų statistikos komponentas
// Rodo pamokos statistikas: dalyvavimo rodiklius, bendrą progresą ir tendencijas
// Apskaičiuoja ir vizualizuoja pagrindinius mokymo proceso metrikus
// CHANGE: Sukurtas StudentStats komponentas pamokos statistikų vizualizavimui su grafine reprezentacija

'use client';

import React from 'react';
import { TrendingUp, Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Student, Subject, Lesson, AttendanceStats, PerformanceStats } from '../types';

interface StudentStatsProps {
  students: Student[];
  selectedDate?: string;
  selectedSubject?: Subject | null;
  selectedLesson?: Lesson | null;
}

// Studentų statistikos komponentas
// Apskaičiuoja ir rodo detalizuotas pamokos statistikas
const StudentStats: React.FC<StudentStatsProps> = ({
  students,
  selectedDate,
  selectedSubject,
  selectedLesson
}) => {
  // Lankomumo statistikų skaičiavimas
  const attendanceStats: AttendanceStats = React.useMemo(() => {
    const total = students.length;
    const present = students.filter(s => s.status === 'present').length;
    const absent = students.filter(s => s.status === 'absent').length;
    const late = students.filter(s => s.status === 'late').length;
    const excused = students.filter(s => s.status === 'excused').length;
    const attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    return { total, present, absent, late, excused, attendanceRate };
  }, [students]);

  // Veiklos statistikų skaičiavimas
  const performanceStats: PerformanceStats = React.useMemo(() => {
    const highPerformers = students.filter(s => {
      const attendancePercent = (s.attendance.present / s.attendance.total) * 100;
      return attendancePercent >= 90;
    }).length;

    const needsAttention = students.filter(s => {
      const attendancePercent = (s.attendance.present / s.attendance.total) * 100;
      return attendancePercent < 75 || s.status === 'absent';
    }).length;

    const averageAttendance = students.length > 0 
      ? Math.round(students.reduce((sum, s) => sum + (s.attendance.present / s.attendance.total) * 100, 0) / students.length)
      : 0;

    const totalFeedback = students.filter(s => s.hasRecentFeedback).length;

    return { highPerformers, needsAttention, averageAttendance, totalFeedback };
  }, [students]);

  // Spalvos pagal lankomumo rodiklius
  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (rate >= 75) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-6">
      {/* Pamokos informacijos kortelė */}
      {selectedLesson && selectedSubject && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-blue-900">
                {selectedLesson.title}
              </h2>
              <p className="text-blue-700">
                {selectedSubject.name} ({selectedSubject.level}) • {selectedLesson.time}
              </p>
              {selectedDate && (
                <p className="text-blue-600 text-sm mt-1">
                  {new Date(selectedDate).toLocaleDateString('lt-LT', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">
                {attendanceStats.attendanceRate}%
              </div>
              <div className="text-sm text-blue-600">
                Dalyvavimas
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagrindinės statistikos kortelės */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bendras mokinių skaičius */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mokinių iš viso</p>
              <p className="text-2xl font-bold text-gray-900">{attendanceStats.total}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Users size={16} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Dalyvavimo rodiklis */}
        <div className={`rounded-lg border p-4 ${getAttendanceColor(attendanceStats.attendanceRate)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Dalyvavimo rodiklis</p>
              <p className="text-2xl font-bold">{attendanceStats.attendanceRate}%</p>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white bg-opacity-50">
              <CheckCircle size={16} />
            </div>
          </div>
        </div>

        {/* Aukšti pasiekimai */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aukšti pasiekimai</p>
              <p className="text-2xl font-bold text-green-600">{performanceStats.highPerformers}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp size={16} className="text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">≥90% lankomumas</p>
        </div>

        {/* Reikia dėmesio */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Reikia dėmesio</p>
              <p className="text-2xl font-bold text-red-600">{performanceStats.needsAttention}</p>
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle size={16} className="text-red-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">&lt;75% lankomumas</p>
        </div>
      </div>

      {/* Detalizuotos lankomumo statistikos */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lankomumo analizė</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{attendanceStats.present}</div>
            <div className="text-sm text-gray-600">Dalyvavo</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{attendanceStats.late}</div>
            <div className="text-sm text-gray-600">Vėlavo</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{attendanceStats.absent}</div>
            <div className="text-sm text-gray-600">Nedalyvavo</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{attendanceStats.excused}</div>
            <div className="text-sm text-gray-600">Pateisinta</div>
          </div>
        </div>

        {/* Vizualus lankomumo indikatorius */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Lankomumo paskirstymas</span>
            <span>{attendanceStats.present + attendanceStats.late} iš {attendanceStats.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="flex h-2 rounded-full overflow-hidden">
              <div 
                className="bg-green-500" 
                style={{ width: `${(attendanceStats.present / attendanceStats.total) * 100}%` }}
              />
              <div 
                className="bg-yellow-500" 
                style={{ width: `${(attendanceStats.late / attendanceStats.total) * 100}%` }}
              />
              <div 
                className="bg-blue-500" 
                style={{ width: `${(attendanceStats.excused / attendanceStats.total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Papildoma statistika */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bendras lankomumas */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bendras lankomumas</h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {performanceStats.averageAttendance}%
              </div>
              <div className="text-sm text-gray-600">Vidutinis klasės rodiklis</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Grįžtamasis ryšys */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Grįžtamasis ryšys</h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-purple-600">
                {performanceStats.totalFeedback}
              </div>
              <div className="text-sm text-gray-600">Gautas grįžtamasis ryšys</div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Clock size={20} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentStats;
