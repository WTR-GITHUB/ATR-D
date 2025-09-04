// frontend/src/app/auth/login/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { getDashboardUrlByRoles } from '@/lib/roleUtils';
import { authAPI } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(formData);
      // Nukreipimas pagal aukščiausią rolę
      const user = await authAPI.me();
      
      // CHANGE: Pridėti console.log rolių informacijai patikrinti
      console.log('🔍 USER DATA AFTER LOGIN:', user.data);
      console.log('👤 USER ROLES:', user.data.roles);
      console.log('🎯 DEFAULT ROLE:', user.data.default_role);
      
      // PRIORITY: Use default_role if it exists AND is valid, otherwise use first role
      let roleToUse;
      if (user.data.default_role && user.data.roles.includes(user.data.default_role)) {
        roleToUse = user.data.default_role;
        console.log('✅ Using DEFAULT ROLE:', roleToUse);
      } else {
        roleToUse = user.data.roles[0];
        console.log('⚠️ Using FIRST ROLE (no valid default):', roleToUse);
      }
      const roleToPath = {
        manager: 'managers',
        curator: 'curators', 
        mentor: 'mentors',
        parent: 'parents',
        student: 'students'
      };
      const dashboardUrl = `/${roleToPath[roleToUse] || roleToUse}`;
      console.log('🚀 ROLE TO USE:', roleToUse);
      console.log('🚀 DASHBOARD URL:', dashboardUrl);
      
      router.push(dashboardUrl);
    } catch (error) {
      // Error is handled by useAuth hook
      console.error('❌ LOGIN ERROR:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Prisijungti</h1>
          <p className="mt-2 text-sm text-gray-600">
            Prisijunkite prie A-DIENYNAS sistemos
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Prisijungimo duomenys</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Input
                label="El. paštas"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                leftIcon={<Mail className="w-4 h-4" />}
                placeholder="ivestis@pvz.lt"
              />

              <div className="relative">
                <Input
                  label="Slaptažodis"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  leftIcon={<Lock className="w-4 h-4" />}
                  placeholder="Įveskite slaptažodį"
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
                disabled={isLoading}
              >
                Prisijungti
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Susisiekite su administratoriumi, kad gautumėte paskyrą
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 