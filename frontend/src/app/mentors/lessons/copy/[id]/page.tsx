// frontend/src/app/mentors/lessons/copy/[id]/page.tsx
'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import LessonForm from '@/components/forms/LessonForm';

import ClientAuthGuard from '@/components/auth/ClientAuthGuard';

export default function CopyLessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = parseInt(params.id as string);

  const handleSuccess = (newLessonId: number) => {
    // Redirect to edit page of the newly created lesson
    router.push(`/mentors/lessons/edit/${newLessonId}`);
  };

  const handleCancel = () => {
    // Redirect back to lessons list
    router.push('/mentors/lessons');
  };

  return (
    <ClientAuthGuard requireAuth={true} allowedRoles={['mentor']}>
      <LessonForm
        mode="copy"
        lessonId={lessonId}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </ClientAuthGuard>
  );
}
