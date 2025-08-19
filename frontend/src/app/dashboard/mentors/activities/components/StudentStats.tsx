// frontend/src/app/dashboard/mentors/activities/components/StudentStats.tsx

// Mokinių statistikos komponentas - rodo lankomumo ir veiklos rodiklius
// Komponentas rodomas virš mokinių sąrašo, pateikia bendrą statistikos apžvalgą
// CHANGE: Pridėtas props veiklos būsenai - "Dalyvavo" statusas tampa aktyvus kai veikla vyksta

import React from 'react';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Clock,
  CheckCircle,
  XCircle,
  Clock as ClockIcon
} from 'lucide-react';
import { AttendanceStats, PerformanceStats } from '../types';

interface StudentStatsProps {
  attendanceStats: AttendanceStats;
  performanceStats: PerformanceStats;
  isActivityActive?: boolean; // Ar veikla aktyvi (vyksta)
  activityStartTime?: Date | null; // Veiklos pradžios laikas
}

const StudentStats: React.FC<StudentStatsProps> = ({
  attendanceStats,
  performanceStats,
  isActivityActive = false,
  activityStartTime = null
}) => {
  // Apskaičiuojame aktyvų lankomumą (dalyvavo + vėlavo)
  const activeAttendance = attendanceStats.present + attendanceStats.late;
  
  // Nustatome "Dalyvavo" statuso spalvą pagal veiklos būseną
  const getParticipatedColor = () => {
    if (isActivityActive) {
      return 'text-green-600'; // Aktyvus žalias kai veikla vyksta
    }
    return 'text-gray-600'; // Pilkas kai veikla neaktyvi
  };

  // Nustatome "Dalyvavo" ikoną pagal veiklos būseną
  const getParticipatedIcon = () => {
    if (isActivityActive) {
      return <CheckCircle size={16} className="text-green-600" />; // Žalia varnelė
    }
    return <ClockIcon size={16} className="text-gray-600" />; // Pilkas laikrodis
  };

  return (
    <div className="space-y-6">
      {/* Bendras apžvalgos skydelis */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bendras apžvalga</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Iš viso mokinių */}
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{attendanceStats.total}</div>
            <div className="text-sm text-gray-600">Iš viso</div>
          </div>
          
          {/* Reikia dėmesio */}
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{performanceStats.needsAttention}</div>
            <div className="text-sm text-gray-600">Reikia dėmesio</div>
          </div>
          
          {/* Aukšti rezultatai */}
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{performanceStats.highPerformers}</div>
            <div className="text-sm text-gray-600">Aukšti rezultatai</div>
          </div>
          
          {/* Grįžtamasis ryšys */}
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{performanceStats.totalFeedback}</div>
            <div className="text-sm text-gray-600">Grįžtamasis ryšys</div>
          </div>
        </div>
      </div>

      {/* Lankomumo statistikos */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lankomumo analizė</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Dalyvavo - aktyvus kai veikla vyksta */}
          <div className="text-center">
            <div className={`text-2xl font-bold ${getParticipatedColor()}`}>
              {activeAttendance}
            </div>
            <div className={`text-sm ${getParticipatedColor()}`}>
              Dalyvavo
            </div>
            {/* Ikonos rodymas pagal veiklos būseną */}
            <div className="flex justify-center mt-1">
              {getParticipatedIcon()}
            </div>
          </div>
          
          {/* Vėlavo */}
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{attendanceStats.late}</div>
            <div className="text-sm text-gray-600">Vėlavo</div>
          </div>
          
          {/* Nedalyvavo */}
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{attendanceStats.absent}</div>
            <div className="text-sm text-gray-600">Nedalyvavo</div>
          </div>
          
          {/* Pateisinta */}
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{attendanceStats.excused}</div>
            <div className="text-sm text-gray-600">Pateisinta</div>
          </div>
        </div>

        {/* Vizualus lankomumo indikatorius */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Lankomumo paskirstymas</span>
            <span>{activeAttendance} iš {attendanceStats.total}</span>
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
