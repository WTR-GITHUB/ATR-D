// frontend/src/app/dashboard/mentors/activities/components/StudentsList.tsx

// Mokinių sąrašo komponentas
// Atsako už mokinių sąrašo rodymą, filtravimą ir papildomo mokinio pridėjimą
// Integruoja StudentRow komponentus ir valdoma bendrus sąrašo veiksmus
// CHANGE: Sukurtas atskiras StudentsList komponentas mokinių sąrašo valdymui su search ir filter funkcionalumu

'use client';

import React, { useState } from 'react';
import { Plus, Search, User, Filter } from 'lucide-react';
import StudentRow from './StudentRow';
import { Student, AttendanceStatus, SortBy, FilterBy } from '../types';

interface StudentsListProps {
  students: Student[];
  onAttendanceChange: (studentId: number, status: AttendanceStatus) => void;
  onAddStudent?: () => void;
  showAddButton?: boolean;
}

// Mokinių sąrašo komponentas
// Pagrindinis komponentas mokinių sąrašo valdymui su filtravimo ir paieškos galimybėmis
const StudentsList: React.FC<StudentsListProps> = ({
  students,
  onAttendanceChange,
  onAddStudent,
  showAddButton = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Paieškos ir filtravimo logika
  const filteredAndSortedStudents = React.useMemo(() => {
    let filtered = students;

    // Paieška pagal vardą ir pavardę
    if (searchTerm) {
      filtered = filtered.filter(student =>
        `${student.firstName} ${student.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    // Filtravimas pagal lankomumo būseną
    if (filterBy !== 'all') {
      filtered = filtered.filter(student => student.status === filterBy);
    }

    // Rūšiavimas
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'attendance':
          const aPercent = (a.attendance.present / a.attendance.total) * 100;
          const bPercent = (b.attendance.present / b.attendance.total) * 100;
          return bPercent - aPercent; // Aukštesnis lankomumas pirmas
        case 'recent':
          // Prioritetas: hasRecentFeedback, tada pagal vardą
          if (a.hasRecentFeedback && !b.hasRecentFeedback) return -1;
          if (!a.hasRecentFeedback && b.hasRecentFeedback) return 1;
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        default:
          return 0;
      }
    });

    return sorted;
  }, [students, searchTerm, sortBy, filterBy]);

  // Statistikų skaičiavimas
  const stats = React.useMemo(() => {
    const total = students.length;
    const present = students.filter(s => s.status === 'present').length;
    const absent = students.filter(s => s.status === 'absent').length;
    const late = students.filter(s => s.status === 'late').length;
    const excused = students.filter(s => s.status === 'excused').length;
    
    return { total, present, absent, late, excused };
  }, [students]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Antraštė su statistikomis ir veiksmais */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Mokinių sąrašas
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
              <span>Iš viso: {stats.total}</span>
              <span className="text-green-600">Dalyvavo: {stats.present}</span>
              <span className="text-red-600">Nedalyvavo: {stats.absent}</span>
              {stats.late > 0 && <span className="text-yellow-600">Vėlavo: {stats.late}</span>}
              {stats.excused > 0 && <span className="text-blue-600">Pateisinta: {stats.excused}</span>}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Paieškos laukas */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Ieškoti mokinio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
              />
            </div>

            {/* Filtrų mygtukas */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-3 py-2 border rounded-md text-sm transition-colors ${
                showFilters
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter size={16} />
              <span>Filtrai</span>
            </button>

            {/* Pridėti mokinio mygtukas */}
            {showAddButton && onAddStudent && (
              <button
                onClick={onAddStudent}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                <span>Pridėti mokinį</span>
              </button>
            )}
          </div>
        </div>

        {/* Filtrų sekcija */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Rūšiavimo pasirinkimas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rūšiuoti pagal
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">Vardą ir pavardę</option>
                  <option value="attendance">Lankumą</option>
                  <option value="recent">Naują grįžtamąjį ryšį</option>
                </select>
              </div>

              {/* Filtravimo pasirinkimas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rodyti
                </label>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as FilterBy)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Visus mokinius</option>
                  <option value="present">Tik dalyvavusius</option>
                  <option value="absent">Tik nedalyvavusius</option>
                  <option value="late">Tik vėlavusius</option>
                  <option value="excused">Tik pateisintas</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mokinių sąrašas */}
      <div className="p-6">
        {filteredAndSortedStudents.length > 0 ? (
          <div className="space-y-2">
            {filteredAndSortedStudents.map(student => (
              <StudentRow
                key={student.id}
                student={student}
                onAttendanceChange={onAttendanceChange}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <User size={48} className="mx-auto mb-2 text-gray-300" />
            {searchTerm || filterBy !== 'all' ? (
              <div>
                <p>Pagal nurodytus kriterijus mokinių nerasta</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterBy('all');
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm mt-1"
                >
                  Išvalyti filtrus
                </button>
              </div>
            ) : (
              <p>Šiai pamokai nėra priskirtų mokinių</p>
            )}
          </div>
        )}
      </div>


    </div>
  );
};

export default StudentsList;
