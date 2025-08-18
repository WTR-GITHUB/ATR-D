// frontend/src/app/dashboard/mentors/plans/create/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { ArrowLeft, Plus, Trash2, GripVertical, Save } from 'lucide-react';

interface Lesson {
  id: number;
  title: string;
  subject: string;
  levels: string;
  topic: string;
  created_at: string;
}

interface LessonSequenceItem {
  id: number;
  title: string;
  subject: string;
  levels: string;
  topic: string;
  position: number;
}

interface Subject {
  id: number;
  name: string;
  description: string;
}

interface Level {
  id: number;
  name: string;
  description: string;
}

// API funkcijos
import api from '@/lib/api';

async function fetchMentorLessons(subjectId?: string, levelId?: string): Promise<Lesson[]> {
  let url = '/plans/sequences/mentor_lessons/';
  const params = new URLSearchParams();
  
  if (subjectId) {
    params.append('subject', subjectId);
  }
  if (levelId) {
    params.append('level', levelId);
  }
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  const response = await api.get(url);
  return response.data;
}

async function fetchSubjects(): Promise<Subject[]> {
  const response = await api.get('/crm/mentor-subjects/my_subjects/');
  return response.data;
}

async function fetchLevels(): Promise<Level[]> {
  const response = await api.get('/plans/sequences/levels/');
  return response.data;
}

export default function CreateLessonSequencePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    level: ''
  });

  const [availableLessons, setAvailableLessons] = useState<Lesson[]>([]);
  const [selectedLessons, setSelectedLessons] = useState<LessonSequenceItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [draggedPosition, setDraggedPosition] = useState<number | null>(null);
  const [dropTargetPosition, setDropTargetPosition] = useState<number | null>(null);

  // Gauname duomenis iš API
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoadingData(true);
        const [lessonsData, subjectsData, levelsData] = await Promise.all([
          fetchMentorLessons(),
          fetchSubjects(),
          fetchLevels()
        ]);
        
        setAvailableLessons(lessonsData);
        setSubjects(subjectsData);
        setLevels(levelsData);
      } catch (error) {
        console.error('Klaida gaunant duomenis:', error);
        alert('Įvyko klaida gaunant duomenis');
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, []);

  // Filter lessons when subject or level changes
  useEffect(() => {
    async function filterLessons() {
      try {
        const filteredLessons = await fetchMentorLessons(formData.subject, formData.level);
        setAvailableLessons(filteredLessons);
      } catch (error) {
        console.error('Klaida filtruojant pamokas:', error);
      }
    }

    // Only filter if we have initial data loaded
    if (!isLoadingData) {
      filterLessons();
    }
  }, [formData.subject, formData.level, isLoadingData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addLessonToSequence = (lesson: Lesson) => {
    const newItem: LessonSequenceItem = {
      id: lesson.id,
      title: lesson.title,
      subject: lesson.subject,
      levels: lesson.levels,
      topic: lesson.topic,
      position: selectedLessons.length + 1
    };
    setSelectedLessons(prev => [...prev, newItem]);
  };

  const removeLessonFromSequence = (position: number) => {
    setSelectedLessons(prev => {
      const filtered = prev.filter(item => item.position !== position);
      // Atnaujinti pozicijas
      return filtered.map((item, index) => ({ ...item, position: index + 1 }));
    });
  };

  const moveLessonInSequence = (fromPosition: number, toPosition: number) => {
    if (fromPosition === toPosition) return;

    setSelectedLessons(prev => {
      const newList = [...prev];
      const [movedItem] = newList.splice(fromPosition - 1, 1);
      newList.splice(toPosition - 1, 0, movedItem);

      // Atnaujinti pozicijas
      return newList.map((item, index) => ({ ...item, position: index + 1 }));
    });
  };

  // Drag & Drop funkcionalumas
  const handleDragStart = (e: React.DragEvent, position: number) => {
    e.dataTransfer.setData('text/plain', position.toString());
    e.dataTransfer.effectAllowed = 'move';
    setDraggedPosition(position);
  };

  const handleDragOver = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetPosition(position);
  };

  const handleDrop = (e: React.DragEvent, targetPosition: number) => {
    e.preventDefault();
    const fromPosition = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (fromPosition !== targetPosition) {
      moveLessonInSequence(fromPosition, targetPosition);
    }
    setDraggedPosition(null);
    setDropTargetPosition(null);
  };

  const handleDragEnd = () => {
    setDraggedPosition(null);
    setDropTargetPosition(null);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.subject || !formData.level) {
      alert('Prašome užpildyti visus privalomus laukus');
      return;
    }

    if (selectedLessons.length === 0) {
      alert('Prašome pridėti bent vieną pamoką į seką');
      return;
    }

    setIsLoading(true);

    try {
      // Paruošiame duomenis API užklausai
      const sequenceData = {
        name: formData.name,
        description: formData.description,
        subject: parseInt(formData.subject),
        level: parseInt(formData.level),
        items: selectedLessons.map((lesson, index) => ({
          lesson: lesson.id,
          position: index + 1
        }))
      };

      console.log('Siunčiami duomenys:', sequenceData);

      // Siunčiame užklausą į backend'ą
      const response = await api.post('/plans/sequences/', sequenceData);

      if (response.status === 201) {
        alert('Pamokų seka sėkmingai sukurta!');
        router.push('/dashboard/mentors/plans');
      } else {
        throw new Error('Nepavyko sukurti pamokų sekos');
      }
    } catch (error: any) {
      console.error('Klaida kuriant pamokų seką:', error);
      
      let errorMessage = 'Įvyko klaida kuriant pamokų seką';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Kraunama...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Atgal</span>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Ugdymo planai</h1>
      </div>

      <form className="space-y-6">
        {/* Pagrindinė informacija */}
        <Card>
          <CardHeader>
            <CardTitle>Pagrindinė informacija</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pavadinimas *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Įveskite ugdymo plano pavadinimą"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dalykas *
                </label>
                <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pasirinkite dalyką" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lygis *
                </label>
                <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pasirinkite lygį" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level.id} value={level.id.toString()}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aprašymas
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Aprašykite ugdymo planą"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pamokų seka */}
        <Card>
          <CardHeader>
            <CardTitle>Pamokų seka</CardTitle>
            <p className="text-sm text-gray-600">
              Pridėkite pamokas į seką ir nustatykite jų eiliškumą
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Galimos pamokos */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Galimos pamokos</h3>
                {availableLessons.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Jūs neturite sukurtų pamokų</p>
                    <p className="text-sm">Pirmiausia sukurkite pamokas, kad galėtumėte jas pridėti į seką</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {availableLessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => addLessonToSequence(lesson)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                            <p className="text-sm text-gray-600">{lesson.subject} • {lesson.levels} • {lesson.topic}</p>
                          </div>
                          <Plus className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pasirinktos pamokos */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Pasirinktos pamokos</h3>
                {selectedLessons.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Pamokų nėra pridėta</p>
                    <p className="text-sm">Paspauskite ant pamokos kairėje, kad pridėtumėte</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedLessons.map((item) => (
                      <div
                        key={item.position}
                        className={`p-3 border rounded-lg flex items-center space-x-3 transition-all duration-200 ${
                          draggedPosition === item.position
                            ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                            : dropTargetPosition === item.position
                            ? 'border-blue-400 bg-blue-100'
                            : 'border-gray-200 bg-white'
                        }`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item.position)}
                        onDragOver={(e) => handleDragOver(e, item.position)}
                        onDrop={(e) => handleDrop(e, item.position)}
                        onDragEnd={handleDragEnd}
                      >
                        <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.title}</h4>
                          <p className="text-sm text-gray-600">{item.subject} • {item.levels} • {item.topic}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-500">#{item.position}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLessonFromSequence(item.position)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Veiksmai */}
        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            Atšaukti
          </Button>
          <Button
            disabled={isLoading}
            onClick={handleSubmit}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? 'Kuriama...' : 'Sukurti ugdymo planą'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
