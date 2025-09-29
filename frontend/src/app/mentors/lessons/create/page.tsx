// frontend/src/app/mentors/lessons/create/page.tsx
'use client';

import React from 'react';
import LessonForm from '@/components/forms/LessonForm';

import ClientAuthGuard from '@/components/auth/ClientAuthGuard';

export default function CreateLessonPage() {
  return (
    <ClientAuthGuard requireAuth={true} allowedRoles={['mentor']}>
      <LessonForm mode="create" />
    </ClientAuthGuard>
  );
}
