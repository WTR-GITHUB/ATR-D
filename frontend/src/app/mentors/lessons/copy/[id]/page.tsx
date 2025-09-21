// frontend/src/app/mentors/lessons/copy/[id]/page.tsx

// Pamokos kopijavimo puslapis mentoriams
// Leidžia mentoriams kopijuoti esamą pamoką su nauju pavadinimu
// Naudoja edit puslapio logiką duomenų užkrovimui, bet išvalo pavadinimo lauką
// CHANGE: Sukurtas naujas puslapis pamokų kopijavimui su Files ikona

'use client';

import React, { useState, useEffect } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import MultiSelect from '@/components/ui/MultiSelect';
import DynamicList from '@/components/ui/DynamicList';
import { ArrowLeft, Plus, X, Files } from 'lucide-react';
import Link from 'next/link';
import { 
  lessonsAPI, 
  virtuesAPI, 
  levelsAPI, 
  skillsAPI, 
  competenciesAPI, 
  competencyAtcheveAPI 
} from '@/lib/api';
import api from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';

// TypeScript interfaces for proper typing
interface Subject {
  id: number;
  subject_name: string;
}

interface Skill {
  id: number;
  subject: number;
  subject_name?: string;
  code: string;
  name: string;
  description?: string;
}

interface Competency {
  id: number;
  name: string;
}

interface Virtue {
  id: number;
  name: string;
}

interface Level {
  id: number;
  name: string;
}

interface CompetencyAtcheve {
  id: number;
  subject?: number;
  subject_name?: string;
  competency: number;
  competency_name: string;
  virtues: number[];
  virtues_names?: string[];
  todos: string;
}

interface Lesson {
  id: number;
  title: string;
  content: string;
  subject: number | { id: number };
  topic: string;
  objectives_list: string[];
  components_list: string[];
  skills: number[];
  competency_atcheves: number[];
  virtues: number[];
  levels: number[];
  focus_list: string[];
  slenkstinis: string;
  bazinis: string;
  pagrindinis: string;
  aukstesnysis: string;
}

export default function CopyLessonPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLesson, setIsLoadingLesson] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [competencyAtcheves, setCompetencyAtcheves] = useState<CompetencyAtcheve[]>([]);
  const [virtues, setVirtues] = useState<Virtue[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  
  // Modal states
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isCompetencyAtcheveModalOpen, setIsCompetencyAtcheveModalOpen] = useState(false);
  
  // Modal form data
  const [skillFormData, setSkillFormData] = useState({
    subject: '',
    code: '',
    name: '',
    description: ''
  });
  
  const [competencyAtcheveFormData, setCompetencyAtcheveFormData] = useState({
    subject: '',
    competency: '',
    virtues: [] as string[],
    todos: [] as string[]
  });
  
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    subject: string;
    topic: string;
    objectives: string[];
    components: string[];
    slenkstinis: string;
    bazinis: string;
    pagrindinis: string;
    aukstesnysis: string;
    skills: string[];
    competency_atcheve: string[];
    virtues: string[];
    levels: string[];
    focus: string[];
  }>({
    title: '',
    content: '',
    subject: '',
    topic: '',
    objectives: [],
    components: [],
    slenkstinis: '',
    bazinis: '',
    pagrindinis: '',
    aukstesnysis: '',
    skills: [],
    competency_atcheve: [],
    virtues: [],
    levels: [],
    focus: []
  });

  // Load lesson data and dropdown data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingLesson(true);
        
        // Load all data in parallel
        const [
          subjectsRes, 
          skillsRes, 
          competenciesRes, 
          competencyAtchevesRes, 
          virtuesRes, 
          levelsRes, 
          lessonRes
        ] = await Promise.all([
          api.get('/crm/mentor-subjects/my_subjects/'),
          skillsAPI.getAll(),
          competenciesAPI.getAll(),
          competencyAtcheveAPI.getAll(),
          virtuesAPI.getAll(),
          levelsAPI.getAll(),
          lessonsAPI.getById(parseInt(lessonId))
        ]);
        
        setSubjects(subjectsRes.data);
        setSkills(skillsRes.data);
        setCompetencies(competenciesRes.data);
        setCompetencyAtcheves(competencyAtchevesRes.data);
        setVirtues(virtuesRes.data);
        setLevels(levelsRes.data);
        
        // Load lesson data and populate form
        const lesson = lessonRes.data as Lesson;
        
        // Ensure all fields are properly handled (same as edit page)
        const formDataToSet = {
          title: '', // CHANGE: Išvalytas pavadinimas kopijavimui
          content: lesson.content || '',
          subject: typeof lesson.subject === 'object' ? lesson.subject.id.toString() : lesson.subject.toString(),
          topic: lesson.topic || '',
          objectives: lesson.objectives_list || [],
          components: lesson.components_list || [],
          slenkstinis: lesson.slenkstinis || '',
          bazinis: lesson.bazinis || '',
          pagrindinis: lesson.pagrindinis || '',
          aukstesnysis: lesson.aukstesnysis || '',
          skills: lesson.skills?.map((id: number) => String(id)) || [],
          competency_atcheve: lesson.competency_atcheves?.map((id: number) => String(id)) || [],
          virtues: lesson.virtues?.map((id: number) => String(id)) || [],
          levels: lesson.levels?.map((id: number) => String(id)) || [],
          focus: lesson.focus_list || []
        };
        
        setFormData(formDataToSet);
        
      } catch (error) {
        console.error('Error loading data:', error);
        alert('Nepavyko užkrauti duomenų');
      } finally {
        setIsLoadingLesson(false);
      }
    };

    if (lessonId) {
      loadData();
    }
  }, [lessonId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSkillFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateSkill = async () => {
    try {
      const dataToSend = {
        ...skillFormData,
        subject: skillFormData.subject ? parseInt(skillFormData.subject) : null
      };
      
      await skillsAPI.create(dataToSend);
      
      // Refresh skills list
      const skillsRes = await skillsAPI.getAll();
      setSkills(skillsRes.data);
      
      // Close modal and reset form
      setIsSkillModalOpen(false);
      setSkillFormData({
        code: '',
        name: '',
        description: '',
        subject: ''
      });
    } catch (error) {
      console.error('Error creating skill:', error);
    }
  };

  const handleCompetencyAtcheveInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCompetencyAtcheveFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateCompetencyAtcheve = async () => {
    try {
      const dataToSend = {
        ...competencyAtcheveFormData,
        todos: JSON.stringify(competencyAtcheveFormData.todos),
        subject: competencyAtcheveFormData.subject || null
      };
      
      await competencyAtcheveAPI.create(dataToSend);
      
      // Refresh competencyAtcheves list
      const competencyAtchevesRes = await competencyAtcheveAPI.getAll();
      setCompetencyAtcheves(competencyAtchevesRes.data);
      
      // Close modal and reset form
      setIsCompetencyAtcheveModalOpen(false);
      setCompetencyAtcheveFormData({
        subject: '',
        competency: '',
        virtues: [],
        todos: []
      });
    } catch (error) {
      console.error('Error creating competencyAtcheve:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title) {
      alert('Prašome įvesti pamokos pavadinimą');
      return;
    }
    
    if (!formData.subject) {
      alert('Prašome pasirinkti dalyką');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Prepare lesson data for creation (not update)
      const lessonData = {
        title: formData.title,
        content: formData.content,
        subject: formData.subject,
        topic: formData.topic || '',
        objectives: JSON.stringify(formData.objectives),
        components: JSON.stringify(formData.components),
        skills: formData.skills.map(skill => parseInt(skill)),
        competency_atcheves: formData.competency_atcheve.map(comp => parseInt(comp)),
        virtues: formData.virtues.map(virtue => parseInt(virtue)),
        levels: formData.levels.map(level => parseInt(level)),
        focus: JSON.stringify(formData.focus),
        slenkstinis: formData.slenkstinis,
        bazinis: formData.bazinis,
        pagrindinis: formData.pagrindinis,
        aukstesnysis: formData.aukstesnysis
      };
      
      await lessonsAPI.create(lessonData);
      
      // Redirect to lessons list
      router.push('/mentors/lessons');
    } catch (error: unknown) {
      console.error('Error creating lesson copy:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown; status?: number } };
        console.error('Error response:', axiosError.response?.data);
        console.error('Error status:', axiosError.response?.status);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingLesson) {
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
      <div className="flex items-center justify-between">
        <div>
          <Link 
            href="/mentors/lessons"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Grįžti į pamokų sąrašą
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Kopijuoti pamoką
          </h1>
          <p className="text-gray-600 mt-2">
            Sukurkite pamokos kopiją su nauju pavadinimu
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Files className="w-6 h-6 text-green-600" />
            <CardTitle>Pamokos kopija</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Dalykas *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full h-12 px-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Pasirinkite dalyką *</option>
                  {subjects.map((subject: Subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.subject_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Pamokos pavadinimas *
                </label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Įveskite naują pamokos pavadinimą"
                  required
                  className="w-full h-12 px-6"
                />
              </div>

              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                  Tema
                </label>
                <Input
                  id="topic"
                  name="topic"
                  type="text"
                  value={formData.topic}
                  onChange={handleInputChange}
                  placeholder="Įveskite pamokos temą"
                  className="w-full h-12 px-6"
                />
              </div>
            </div>

            <div>
              <DynamicList
                label="Komponentai"
                values={formData.components}
                onChange={(values) => setFormData(prev => ({ ...prev, components: values }))}
                placeholder="Įveskite komponentą"
              />
            </div>

            <div>
              <DynamicList
                label="Pamokos tikslai"
                values={formData.objectives}
                onChange={(values) => setFormData(prev => ({ ...prev, objectives: values }))}
                placeholder="Įveskite tikslą. Ką turi įsisavinti mokiniai?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pasiekimo lygiai
              </label>
              <div className="border border-gray-300 rounded-md p-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="slenkstinis" className="block text-sm font-medium text-gray-700 mb-2">
                      S: Slenkstinis
                    </label>
                    <Input
                      id="slenkstinis"
                      name="slenkstinis"
                      type="text"
                      value={formData.slenkstinis}
                      onChange={handleInputChange}
                      placeholder="Įveskite slenkstinio lygio reikalavimus"
                      className="w-full h-12 px-6"
                    />
                  </div>

                  <div>
                    <label htmlFor="bazinis" className="block text-sm font-medium text-gray-700 mb-2">
                      B: Bazinis
                    </label>
                    <Input
                      id="bazinis"
                      name="bazinis"
                      type="text"
                      value={formData.bazinis}
                      onChange={handleInputChange}
                      placeholder="Įveskite bazinio lygio reikalavimus"
                      className="w-full h-12 px-6"
                    />
                  </div>

                  <div>
                    <label htmlFor="pagrindinis" className="block text-sm font-medium text-gray-700 mb-2">
                      P: Pagrindinis
                    </label>
                    <Input
                      id="pagrindinis"
                      name="pagrindinis"
                      type="text"
                      value={formData.pagrindinis}
                      onChange={handleInputChange}
                      placeholder="Įveskite pagrindinio lygio reikalavimus"
                      className="w-full h-12 px-6"
                    />
                  </div>

                  <div>
                    <label htmlFor="aukstesnysis" className="block text-sm font-medium text-gray-700 mb-2">
                      A: Aukštesnysis
                    </label>
                    <Input
                      id="aukstesnysis"
                      name="aukstesnysis"
                      type="text"
                      value={formData.aukstesnysis}
                      onChange={handleInputChange}
                      placeholder="Įveskite aukštesniojo lygio reikalavimus"
                      className="w-full h-12 px-6"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gebėjimai
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <MultiSelect
                      options={skills
                        .filter((skill: Skill) => !formData.subject || skill.subject === parseInt(formData.subject))
                        .map((skill: Skill) => ({
                          id: skill.id,
                          name: `${skill.code} - ${skill.name}`
                        }))}
                      selectedValues={formData.skills}
                      onChange={(values) => setFormData(prev => ({ ...prev, skills: values }))}
                      placeholder="Pasirinkite gebėjimus..."
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSkillModalOpen(true)}
                    className="flex items-center space-x-1 whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Modifikuoti</span>
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  BUP Kompetencijos
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <MultiSelect
                      options={competencyAtcheves
                        .filter((atcheve: CompetencyAtcheve) => !formData.subject || atcheve.subject === parseInt(formData.subject))
                        .map((atcheve: CompetencyAtcheve) => ({
                          id: atcheve.id,
                          name: `${atcheve.competency_name} - ${(atcheve.virtues_names || []).join(', ')}`
                        }))}
                      selectedValues={formData.competency_atcheve}
                      onChange={(values) => setFormData(prev => ({ 
                        ...prev, 
                        competency_atcheve: values 
                      }))}
                      placeholder="Pasirinkite kompetencijos pasiekimą..."
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCompetencyAtcheveModalOpen(true)}
                    className="flex items-center space-x-1 whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Modifikuoti</span>
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <DynamicList
                label="Fokusas veiksmai"
                values={formData.focus}
                onChange={(values) => setFormData(prev => ({ ...prev, focus: values }))}
                placeholder="Įveskite fokusą"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <MultiSelect
                  label="Mokymo lygiai"
                  options={levels.map((level: Level) => ({ id: level.id, name: level.name }))}
                  selectedValues={formData.levels}
                  onChange={(values) => setFormData(prev => ({ ...prev, levels: values }))}
                  placeholder="Pasirinkite mokymo lygius..."
                />
              </div>

              <div>
                <MultiSelect
                  label="Dorybės"
                  options={virtues.map((virtue: Virtue) => ({ id: virtue.id, name: virtue.name }))}
                  selectedValues={formData.virtues}
                  onChange={(values) => setFormData(prev => ({ ...prev, virtues: values }))}
                  placeholder="Pasirinkite dorybes..."
                />
              </div>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Mokomoji medžiaga
              </label>
              <textarea
                id="content"
                name="content"
                rows={6}
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Įveskite mokomąją medžiagą..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Link href="/mentors/lessons">
                <Button variant="outline" type="button">
                  Atšaukti
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Kuriama...
                  </>
                ) : (
                  <>
                    <Files className="w-4 h-4 mr-2" />
                    Sukurti kopiją
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Skill Creation Modal - Same as edit page */}
      {isSkillModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">Gebėjimų sąrašas</h3>
              <button
                onClick={() => setIsSkillModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="skill-subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Dalykas *
                  </label>
                  <select
                    id="skill-subject"
                    name="subject"
                    value={skillFormData.subject}
                    onChange={handleSkillInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Pasirinkite dalyką</option>
                    {subjects.map((subject: Subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.subject_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="skill-code" className="block text-sm font-medium text-gray-700 mb-2">
                    Sutrumpintas kodas *
                  </label>
                  <Input
                    id="skill-code"
                    name="code"
                    type="text"
                    value={skillFormData.code}
                    onChange={handleSkillInputChange}
                    placeholder="Įveskite sutrumpintą kodą"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="skill-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Gebėjimo pavadinimas *
                  </label>
                  <Input
                    id="skill-name"
                    name="name"
                    type="text"
                    value={skillFormData.name}
                    onChange={handleSkillInputChange}
                    placeholder="Įveskite gebėjimo pavadinimą"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="skill-description" className="block text-sm font-medium text-gray-700 mb-2">
                    Aprašymas
                  </label>
                  <textarea
                    id="skill-description"
                    name="description"
                    rows={3}
                    value={skillFormData.description}
                    onChange={handleSkillInputChange}
                    placeholder="Aprašykite gebėjimą..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsSkillModalOpen(false)}
                  >
                    Atšaukti
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCreateSkill}
                    disabled={!skillFormData.subject || !skillFormData.code || !skillFormData.name}
                  >
                    Sukurti gebėjimą
                  </Button>
                </div>

                {/* Skills Table */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Gebėjimų sąrašas</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 rounded-md">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            Dalykas
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            Kodas
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            Pavadinimas
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            Veiksmai
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {skills
                          .filter((skill: Skill) => !skillFormData.subject || skill.subject === parseInt(skillFormData.subject))
                          .map((skill: Skill) => (
                          <tr key={skill.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                              {skill.subject_name || 'Nenurodyta'}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                              {skill.code}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                              {skill.name}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  if (confirm('Ar tikrai norite ištrinti šį gebėjimą?')) {
                                    try {
                                      await skillsAPI.delete(Number(skill.id));
                                      const skillsRes = await skillsAPI.getAll();
                                      setSkills(skillsRes.data);
                                    } catch (error) {
                                      console.error('Error deleting skill:', error);
                                    }
                                  }
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                Ištrinti
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CompetencyAtcheve Creation Modal - Same as edit page */}
      {isCompetencyAtcheveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">Kompetencijų pasiekimų sąrašas</h3>
              <button
                onClick={() => setIsCompetencyAtcheveModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="competency-atcheve-subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Dalykas
                  </label>
                  <select
                    id="competency-atcheve-subject"
                    name="subject"
                    value={competencyAtcheveFormData.subject}
                    onChange={handleCompetencyAtcheveInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Pasirinkite dalyką...</option>
                    {subjects.map((subject: Subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.subject_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="competency-atcheve-competency" className="block text-sm font-medium text-gray-700 mb-2">
                    Kompetencija *
                  </label>
                  <select
                    id="competency-atcheve-competency"
                    name="competency"
                    value={competencyAtcheveFormData.competency}
                    onChange={handleCompetencyAtcheveInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Pasirinkite kompetenciją</option>
                    {competencies.map((competency: Competency) => (
                      <option key={competency.id} value={competency.id}>
                        {competency.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dorybės *
                  </label>
                  <MultiSelect
                    options={virtues.map((virtue: Virtue) => ({ id: virtue.id, name: virtue.name }))}
                    selectedValues={competencyAtcheveFormData.virtues}
                    onChange={(values) => setCompetencyAtcheveFormData(prev => ({ ...prev, virtues: values }))}
                    placeholder="Pasirinkite dorybes..."
                  />
                </div>

                <div>
                  <DynamicList
                    label="Konkrečių veiksmų sąrašas"
                    values={competencyAtcheveFormData.todos}
                    onChange={(values) => setCompetencyAtcheveFormData(prev => ({ ...prev, todos: values }))}
                    placeholder="Įveskite veiksmą"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCompetencyAtcheveModalOpen(false)}
                  >
                    Atšaukti
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCreateCompetencyAtcheve}
                    disabled={!competencyAtcheveFormData.competency || competencyAtcheveFormData.virtues.length === 0}
                  >
                    Sukurti BUP kompetenciją
                  </Button>
                </div>

                {/* CompetencyAtcheve Table */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Kompetencijų pasiekimų sąrašas</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 rounded-md">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            Dalykas
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            Kompetencija
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            Dorybės
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            Konkrečių veiksmų sąrašas
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            Veiksmai
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {competencyAtcheves
                          .filter((atcheve: CompetencyAtcheve) => {
                            if (!competencyAtcheveFormData.subject) return true;
                            return atcheve.subject === parseInt(competencyAtcheveFormData.subject);
                          })
                          .map((atcheve: CompetencyAtcheve) => (
                          <tr key={atcheve.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                              {atcheve.subject_name || 'Nenurodyta'}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                              {atcheve.competency_name}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                              {(atcheve.virtues_names || []).join(', ')}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                              {(() => {
                                try {
                                  const todosArray = JSON.parse(atcheve.todos || '[]');
                                  return Array.isArray(todosArray) ? todosArray.join(', ') : atcheve.todos || '-';
                                } catch {
                                  return atcheve.todos || '-';
                                }
                              })()}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 border-b">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  if (confirm('Ar tikrai norite ištrinti šį kompetencijos pasiekimą?')) {
                                    try {
                                      await competencyAtcheveAPI.delete(Number(atcheve.id));
                                      const competencyAtchevesRes = await competencyAtcheveAPI.getAll();
                                      setCompetencyAtcheves(competencyAtchevesRes.data);
                                    } catch (error) {
                                      console.error('Error deleting competencyAtcheve:', error);
                                    }
                                  }
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                Ištrinti
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
