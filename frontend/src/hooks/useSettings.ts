// Settings hook'as - vartotojo nustatymų valdymas
// Leidžia keisti slaptažodį ir gauti vartotojo duomenis
// CHANGE: Sukurtas naujas useSettings hook'as slaptažodžio keitimui ir vartotojo duomenų valdymui
// CHANGE: Pataisytas URL endpoint'as iš change-password į change_password pagal backend implementaciją
// CHANGE: Pašalinti debug console log'ai, pridėta user ID validacija

'use client';

import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

interface BackendChangePasswordData {
  old_password: string;
  new_password: string;
}

interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export default function useSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const changePassword = async (data: ChangePasswordData): Promise<ChangePasswordResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      // Konvertuojame frontend duomenų formatą į backend formatą
      const backendData: BackendChangePasswordData = {
        old_password: data.oldPassword,
        new_password: data.newPassword
      };

      // Sukuriame API request'ą su authentication header'iu
      const token = localStorage.getItem('access_token');
      
      // Patikriname, ar turime user ID
      if (!user?.id) {
        throw new Error('Vartotojo ID nerastas. Prašome prisijungti iš naujo.');
      }
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/users/users/${user.id}/change_password/`,
        backendData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
        }
      );
      
      return {
        success: true,
        message: response.data?.message || 'Slaptažodis sėkmingai pakeistas!'
      };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.detail || 
                          err.response?.data?.errors?.old_password?.[0] ||
                          err.response?.data?.errors?.new_password?.[0] ||
                          'Klaida keičiant slaptažodį';
      
      setError(errorMessage);
      
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    changePassword,
    isLoading,
    error,
    clearError
  };
}
