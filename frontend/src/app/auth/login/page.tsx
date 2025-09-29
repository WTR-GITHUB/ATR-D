// frontend/src/app/auth/login/page.tsx
// SEC-001: Login page with simple authentication
'use client';

import React, { useState } from 'react';
// import { useRouter } from 'next/navigation'; // Not used
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import ClientAuthGuard from '@/components/auth/ClientAuthGuard';

export default function LoginPage() {
  const { login, isLoading, error, redirectToDashboard, user, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  // Auto-redirect when user data is loaded after login
  React.  useEffect(() => {
    if (justLoggedIn && user && isAuthenticated) {
      redirectToDashboard();
      setJustLoggedIn(false);
    }
  }, [justLoggedIn, user, isAuthenticated, redirectToDashboard]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const success = await login(formData);

      if (success) {
        // Mark that we just logged in - useEffect will handle redirect when user data loads
        setJustLoggedIn(true);
      }
    } catch (error) {
      console.error('🔐 LOGIN_PAGE: Login failed', error);
      // Error is already handled by useAuth hook and displayed
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <ClientAuthGuard requireAuth={false}>
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
    </ClientAuthGuard>
  );
} 