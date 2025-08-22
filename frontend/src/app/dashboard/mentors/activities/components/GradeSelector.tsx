// frontend/src/app/dashboard/mentors/activities/components/GradeSelector.tsx

// Pasiekimų lygių valdymo komponentas StudentRow komponente
// CHANGE: Pritaikytas iš EXAMPLES/grades su API integracija ir real-time išsaugojimu

'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader2, Save } from 'lucide-react';
import api from '@/lib/api';

interface AchievementLevel {
  id: number;
  code: string;
  name: string;
  min_percentage: number;
  max_percentage: number;
  color: string;
  description: string;
}

interface Grade {
  id?: number;
  student: number;
  lesson: number;
  mentor: number;
  achievement_level: AchievementLevel;
  percentage: number;
  imu_plan?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface GradeSelectorProps {
  currentGrade: Grade | null;
  onGradeChange: (grade: Grade) => void;
  studentId: number;
  lessonId: number;
  imuPlanId?: number;
  mentorId: number;
}

export default function GradeSelector({
  currentGrade,
  onGradeChange,
  studentId,
  lessonId,
  imuPlanId,
  mentorId
}: GradeSelectorProps) {
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [percentage, setPercentage] = useState<string>('');
  const [achievementLevels, setAchievementLevels] = useState<AchievementLevel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Nustatome default procentus pagal frontend logiką
  const defaultPercents = {
    'S': 54,
    'B': 69,
    'P': 84,
    'A': 100
  };

  // Gauname pasiekimų lygius iš API
  useEffect(() => {
    const fetchAchievementLevels = async () => {
      try {
        const response = await api.get('/grades/achievement-levels/');
        setAchievementLevels(response.data);
      } catch (error) {
        console.error('Klaida gaunant pasiekimų lygius:', error);
        setError('Nepavyko gauti pasiekimų lygių');
      }
    };

    fetchAchievementLevels();
  }, []);

  // CHANGE: Pašalintas nereikalingas useEffect, nes duomenys gaunami iš backend'o

  // Apskaičiuojame pasiekimų lygį pagal procentus
  const getGradeByPercent = (percent: number): string | null => {
    if (percent >= 40 && percent <= 54) return 'S';
    if (percent >= 55 && percent <= 69) return 'B';
    if (percent >= 70 && percent <= 84) return 'P';
    if (percent >= 85 && percent <= 100) return 'A';
    return null;
  };



  // Procentų validacija
  const handlePercentageBlur = () => {
    const percent = parseInt(percentage);
    if (percent < 0 || percent > 100 || isNaN(percent)) {
      setPercentage('');
      setSelectedGrade('');
      setError('Procentai turi būti tarp 0 ir 100');
    }
  };

  // Pasiekimų lygio pasirinkimas (be automatinio išsaugojimo)
  const handleGradeSelect = (grade: string) => {
    setSelectedGrade(grade);
    const percent = defaultPercents[grade as keyof typeof defaultPercents];
    setPercentage(percent.toString());
    setError(null);
  };

  // Procentų keitimo valdymas (be automatinio išsaugojimo)
  const handlePercentageChange = (value: string) => {
    setPercentage(value);
    const grade = getGradeByPercent(parseInt(value) || 0);
    setSelectedGrade(grade || '');
    setError(null);
  };

  // CHANGE: Duomenų gavimas iš backend'o su automatinis state'ų atsinaujinimu
  useEffect(() => {
    const fetchExistingGrade = async () => {
      if (studentId && lessonId) {
        try {
          const params = new URLSearchParams({
            student: studentId.toString(),
            lesson: lessonId.toString(),
            ...(imuPlanId && { imu_plan: imuPlanId.toString() })
          });
          
          const response = await api.get(`/grades/grades/?${params}`);
          if (response.data.results && response.data.results.length > 0) {
            const existingGrade = response.data.results[0];
            // CHANGE: Automatiškai atsinaujiname UI pagal backend'o duomenis
            setSelectedGrade(existingGrade.achievement_level?.code || '');
            setPercentage(existingGrade.percentage.toString());
            console.log('Rastas esamas vertinimas:', existingGrade);
          } else {
            // CHANGE: Jei nėra esamo vertinimo, išvalome state'us
            setSelectedGrade('');
            setPercentage('');
            console.log('Nėra esamo vertinimo');
          }
        } catch (error) {
          console.log('Klaida gaunant esamą vertinimą:', error);
          // CHANGE: Klaidos atveju išvalome state'us
          setSelectedGrade('');
          setPercentage('');
        }
      }
    };

    fetchExistingGrade();
  }, [studentId, lessonId, imuPlanId]);

  // CHANGE: Save mygtuko funkcionalumas
  const handleSave = async () => {
    if (!selectedGrade || !percentage) {
      setError('Pasirinkite pasiekimų lygį ir įveskite procentus');
      return;
    }
    
    const percent = parseInt(percentage);
    if (percent < 0 || percent > 100 || isNaN(percent)) {
      setError('Procentai turi būti tarp 0 ir 100');
      return;
    }
    
    console.log('Išsaugant vertinimą:', { selectedGrade, percentage: percent, studentId, lessonId, imuPlanId });
    await saveGrade(percent);
  };

  // CHANGE: Vertinimo išsaugojimas su teisingu esamų įrašų tvarkymu
  const saveGrade = async (percent: number) => {
    if (!selectedGrade || percent < 0 || percent > 100 || isNaN(percent)) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const gradeData = {
        student: studentId,
        lesson: lessonId,
        mentor: mentorId,
        percentage: percent,
        imu_plan: imuPlanId || null,
        notes: ''
      };

      let response;
      
      // CHANGE: Patikriname ar egzistuoja įrašas su tais pačiais parametrais
      if (currentGrade?.id) {
        // Atnaujiname esamą vertinimą
        response = await api.put(`/grades/grades/${currentGrade.id}/`, gradeData);
        console.log('Atnaujintas esamas vertinimas:', response.data);
      } else {
        // Sukuriame naują vertinimą
        response = await api.post('/grades/grades/', gradeData);
        console.log('Sukurtas naujas vertinimas:', response.data);
      }

      // Informuojame parent komponentą apie atnaujintą/sukurtą vertinimą
      onGradeChange(response.data);
      setError(null);
    } catch (error: any) {
      console.error('Klaida išsaugant vertinimą:', error);
      
      // CHANGE: Detalesnis klaidos pranešimas
      if (error.response?.status === 400) {
        setError('Vertinimas jau egzistuoja arba neteisingi duomenys');
      } else {
        setError(error.response?.data?.error || 'Nepavyko išsaugoti vertinimo');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Mygtuko stiliaus nustatymas
  const getButtonStyle = (gradeId: string) => {
    const baseStyle = "w-12 h-9 rounded-xl border-2 font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg";
    
    if (selectedGrade === gradeId) {
      const colors: { [key: string]: string } = {
        'S': 'bg-green-500 text-white border-transparent shadow-lg',
        'B': 'bg-blue-500 text-white border-transparent shadow-lg',
        'P': 'bg-orange-500 text-white border-transparent shadow-lg',
        'A': 'bg-red-500 text-white border-transparent shadow-lg'
      };
      return `${baseStyle} ${colors[gradeId]}`;
    }
    
    return `${baseStyle} bg-white text-gray-500 border-gray-200 hover:border-gray-300`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
        <span className="ml-2 text-gray-600">Kraunama...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* CHANGE: Esama pasiekimų lygio kortelė */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          Pasiekimų lygis
        </h3>
        
        <div className="flex items-start gap-6">
          {/* Pasiekimų lygių mygtukai */}
          <div className="flex flex-col gap-3 flex-1">
            {achievementLevels.map((level) => (
              <button
                key={level.code}
                onClick={() => handleGradeSelect(level.code)}
                className={getButtonStyle(level.code)}
                title={`${level.name} (${level.min_percentage}-${level.max_percentage}%)`}
              >
                {selectedGrade === level.code ? '✓' : level.code}
              </button>
            ))}
          </div>
          
        {/* Atskyrimo linija */}
        <div className="w-0.5 h-48 bg-gradient-to-b from-gray-200 to-gray-400 rounded-full mt-2"></div>
        
        {/* CHANGE: Apvyniotas div'u */}
        <div>
          
          {/* Procentų įvedimo sekcija */}
          <div className="flex flex-col items-center min-w-28 mt-8">
                        <input
              type="number"
              value={currentGrade?.percentage || percentage || ''}
              onChange={(e) => handlePercentageChange(e.target.value)}
              onBlur={handlePercentageBlur}
              min="0"
              max="100"
              placeholder={currentGrade?.percentage ? currentGrade.percentage.toString() : '-'}
              className="w-20 h-12 border-2 border-gray-200 rounded-lg text-center text-lg font-bold text-gray-700 bg-white transition-all duration-300 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:ring-4 focus:ring-blue-200"
            />
              
              {/* Procentų intervalų informacija */}
              <div className="text-xs text-gray-500 font-medium mt-3 text-center leading-relaxed">
                <div>S: 40-54%</div>
                <div>B: 55-69%</div>
                <div>P: 70-84%</div>
                <div>A: 85-100%</div>
              </div>

              {/* CHANGE: Save mygtukas */}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="mt-4 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                title="Išsaugoti vertinimą"
              >
                <Save className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Klaidos pranešimas */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Sėkmės pranešimas */}
        {currentGrade && !error && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              ✓ Vertinimas išsaugotas: {currentGrade.achievement_level.name} ({currentGrade.percentage}%)
            </p>
          </div>
        )}      
      </div>

      {/* CHANGE: 2 papildomos tuščios kortelės */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <div className="w-5 h-5 bg-gray-200 rounded-full mr-2"></div>
          Papildoma kortelė 1
        </h3>
        <div className="text-gray-500 text-sm">
          <p>Tusčia kortelė ateičiai</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <div className="w-5 h-5 bg-gray-200 rounded-full mr-2"></div>
          Papildoma kortelė 2
        </h3>
        <div className="text-gray-500 text-sm">
          <p>Tusčia kortelė ateičiai</p>
        </div>
      </div>
    </div>
  );
}
