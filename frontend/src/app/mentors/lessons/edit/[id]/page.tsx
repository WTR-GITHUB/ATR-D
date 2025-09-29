// frontend/src/app/mentors/lessons/edit/[id]/page.tsx
'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import LessonForm from '@/components/forms/LessonForm';

import ClientAuthGuard from '@/components/auth/ClientAuthGuard';

export default function EditLessonPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = parseInt(params.id as string);

  const handleSuccess = () => {
    // Redirect to lessons list
    router.push('/mentors/lessons');
  };

  const handleCancel = () => {
    // Redirect back to lessons list
      router.push('/mentors/lessons');
  };

  return (
    <ClientAuthGuard requireAuth={true} allowedRoles={['mentor']}>
      <LessonForm
        mode="edit"
        lessonId={lessonId}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </ClientAuthGuard>
  );
}
