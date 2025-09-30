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
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  // Auto-redirect when user data is loaded after login
  React.useEffect(() => {
    if (justLoggedIn && user && isAuthenticated) {
      redirectToDashboard();
      setJustLoggedIn(false);
    }
  }, [justLoggedIn, user, isAuthenticated, redirectToDashboard]);

  // Detect if password was auto-filled by browser
  React.useEffect(() => {
    const checkAutoFill = () => {
      const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;
      if (passwordInput && passwordInput.value && !formData.password) {
        setIsAutoFilled(true);
      }
    };

    // Check after component mounts
    const timer = setTimeout(checkAutoFill, 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-mask password after 5 seconds when shown
  React.useEffect(() => {
    if (showPassword && !isAutoFilled) {
      const timer = setTimeout(() => {
        setShowPassword(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showPassword, isAutoFilled]);

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

  // Google OAuth handler
  const handleGoogleLogin = () => {
    // Redirect to Django allauth Google login URL
    window.location.href = '/accounts/google/login/';
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
                      onClick={() => {
                        // Neleisti rodyti slaptažodžio, jei jis buvo automatiškai užpildytas
                        if (!isAutoFilled) {
                          setShowPassword(!showPassword);
                        }
                      }}
                      className={`${isAutoFilled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600'}`}
                      disabled={isAutoFilled}
                      title={isAutoFilled ? 'Slaptažodis automatiškai užpildytas - matomumas išjungtas saugumo sumetimais' : 'Perjungti slaptažodžio matomumą'}
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

              {/* Įspėjimas, kai slaptažodis matomas */}
              {showPassword && !isAutoFilled && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-700">
                    ℹ️ Slaptažodis matomas. Užtikrinkite, kad niekas jo nemato. Automatiškai užmaskuojamas po 5 sekundžių.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
                disabled={isLoading}
              >
                Prisijungti
              </Button>
            </form>

            {/* Divider */}
            <div className="mt-6 mb-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Arba</span>
                </div>
              </div>
            </div>

            {/* Google OAuth Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center space-x-2 border-gray-300 hover:bg-gray-50"
              onClick={handleGoogleLogin}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Prisijungti su Google</span>
            </Button>

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