// Settings puslapis - vartotojo nustatymai ir slaptažodžio keitimas
// Rodo vartotojo informaciją (vardas, pavardė, el. paštas) tik skaitymui
// Leidžia keisti slaptažodį su seno, naujo ir patvirtinimo laukais
// CHANGE: Sukurtas naujas Settings puslapis su vartotojo informacija ir slaptažodžio keitimo forma

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import useSettings from '@/hooks/useSettings';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { User, Lock, Eye, EyeOff, UserCheck } from 'lucide-react';

export default function SettingsPage() {
  const { user, token } = useAuth();
  const { changePassword, isLoading, error, clearError } = useSettings();
  
  // Slaptažodžio keitimo būsenos
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Formos duomenys
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Lokalūs pranešimai
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Numatytosios rolės pasirinkimo būsena
  const [selectedDefaultRole, setSelectedDefaultRole] = useState<string | null>(null);
  const [roleMessage, setRoleMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Inicijuoti selectedDefaultRole su dabartine vartotojo default role
  React.useEffect(() => {
    if (user?.default_role) {
      setSelectedDefaultRole(user.default_role);
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Išvalyti pranešimą, kai vartotojas pradeda rašyti
    if (message) setMessage(null);
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validacija
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Naujas slaptažodis ir patvirtinimas nesutampa' });
      return;
    }
    
    if (formData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Naujas slaptažodis turi būti bent 8 simbolių ilgio' });
      return;
    }

    setMessage(null);

    try {
      const response = await changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      });
      
      if (response.success) {
        setMessage({ type: 'success', text: response.message });
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMessage({ type: 'error', text: response.message });
      }
    } catch {
      setMessage({ type: 'error', text: 'Klaida keičiant slaptažodį. Patikrinkite seną slaptažodį.' });
    }
  };

  // Rolių pavadinimų objektas
  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      manager: 'Administratorius',
      curator: 'Kuratorius', 
      mentor: 'Mentorius',
      student: 'Studentas',
      parent: 'Tėvai/Globėjai'
    };
    return roleNames[role] || role;
  };

  // Numatytosios rolės išsaugojimas
  const handleDefaultRoleSubmit = async () => {
    if (!selectedDefaultRole) return;
    
    try {
      const response = await fetch('/api/users/settings/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          default_role: selectedDefaultRole 
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setRoleMessage({ 
          type: 'success', 
          text: data.message || `Numatytoji rolė "${getRoleDisplayName(selectedDefaultRole)}" sėkmingai išsaugota!` 
        });
        
        setTimeout(() => setRoleMessage(null), 3000);
      } else {
        setRoleMessage({ 
          type: 'error', 
          text: data.message || 'Klaida išsaugojant numatytąją rolę' 
        });
      }
    } catch (error) {
      console.error('Error saving default role:', error);
      setRoleMessage({ 
        type: 'error', 
        text: 'Klaida išsaugojant numatytąją rolę' 
      });
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Prašome prisijungti</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Puslapio antraštė */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Nustatymai</h1>
        <p className="text-gray-600 mt-2">Valdykite savo paskyros nustatymus</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Vartotojo informacija */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Vartotojo informacija</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vardas
              </label>
              <Input
                value={user.first_name || ''}
                disabled
                className="bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pavardė
              </label>
              <Input
                value={user.last_name || ''}
                disabled
                className="bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                El. paštas
              </label>
              <Input
                value={user.email || ''}
                disabled
                className="bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rolės
              </label>
              <Input
                value={user.roles?.join(', ') || ''}
                disabled
                className="bg-gray-50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Slaptažodžio keitimas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="w-5 h-5" />
              <span>Slaptažodžio keitimas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Senas slaptažodis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senas slaptažodis
                </label>
                <div className="relative">
                  <Input
                    type={showOldPassword ? 'text' : 'password'}
                    value={formData.oldPassword}
                    onChange={(e) => handleInputChange('oldPassword', e.target.value)}
                    required
                    placeholder="Įveskite seną slaptažodį"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showOldPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Naujas slaptažodis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Naujas slaptažodis
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    required
                    placeholder="Įveskite naują slaptažodį (min. 8 simboliai)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Patvirtinti naują slaptažodį */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patvirtinti naują slaptažodį
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                    placeholder="Pakartokite naują slaptažodį"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Pranešimai */}
              {(message || error) && (
                <div className={`p-3 rounded-md text-sm ${
                  (message?.type === 'success' || !error) 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {message?.text || error}
                </div>
              )}

              {/* Pateikimo mygtukas */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white"
              >
                {isLoading ? 'Keičiama...' : 'Keisti slaptažodį'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Rolių pasirinkimo kortelė */}
        {user.roles && user.roles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5" />
                <span>Numatytoji rolė prisijungimo metu</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  {user.roles.length > 1 
                    ? 'Pasirinkite su kuria role norite prisijungti pagal nutylėjimą:' 
                    : 'Jūsų dabartinė rolė:'}
                </p>
                
                <div className="space-y-2">
                  {user.roles.map((role) => (
                    <div 
                      key={role}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        selectedDefaultRole === role
                          ? 'border-gray-500 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setSelectedDefaultRole(role);
                        setRoleMessage(null);
                      }}
                    >
                      <div className="flex items-center">
                        <div className={`w-5 h-5 border-2 rounded-full mr-3 flex items-center justify-center ${
                          selectedDefaultRole === role
                            ? 'border-gray-500 bg-gray-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedDefaultRole === role && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="text-gray-900 font-medium">
                          {getRoleDisplayName(role)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Rolės pranešimas */}
                {roleMessage && (
                  <div className={`p-3 rounded-md text-sm ${
                    roleMessage.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {roleMessage.text}
                  </div>
                )}

                {user.roles.length > 1 && (
                  <Button
                    onClick={handleDefaultRoleSubmit}
                    disabled={!selectedDefaultRole}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    Patvirtinti pasirinkimą
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
