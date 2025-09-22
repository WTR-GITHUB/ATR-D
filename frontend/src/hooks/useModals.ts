// frontend/src/hooks/useModals.ts

// Hook modal komponentų valdymui
// Suteikia lengvą būdą valdyti confirmation ir notification modalus
// CHANGE: Sukurtas naujas hook modal valdymui

'use client';

import { useState, useCallback } from 'react';

interface ConfirmationOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

interface NotificationOptions {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export const useModals = () => {
  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    options: ConfirmationOptions;
    onConfirm: (() => void) | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    options: { message: '' },
    onConfirm: null,
    isLoading: false
  });

  // Notification modal state
  const [notificationModal, setNotificationModal] = useState<{
    isOpen: boolean;
    options: NotificationOptions;
  }>({
    isOpen: false,
    options: { message: '' }
  });

  // Close confirmation modal
  const closeConfirmation = useCallback(() => {
    setConfirmationModal({
      isOpen: false,
      options: { message: '' },
      onConfirm: null,
      isLoading: false
    });
  }, []);

  // Show confirmation modal
  const showConfirmation = useCallback((
    options: ConfirmationOptions,
    onConfirm: () => void | Promise<void>
  ) => {
    setConfirmationModal({
      isOpen: true,
      options,
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, isLoading: true }));
        try {
          await onConfirm();
          // Close confirmation modal after successful execution
          setConfirmationModal({
            isOpen: false,
            options: { message: '' },
            onConfirm: null,
            isLoading: false
          });
        } catch (error) {
          // Keep modal open on error so user can see the error
          console.error('Confirmation action failed:', error);
        } finally {
          setConfirmationModal(prev => ({ ...prev, isLoading: false }));
        }
      },
      isLoading: false
    });
  }, []);

  // Show notification modal
  const showNotification = useCallback((options: NotificationOptions) => {
    setNotificationModal({
      isOpen: true,
      options
    });
  }, []);

  // Close notification modal
  const closeNotification = useCallback(() => {
    setNotificationModal({
      isOpen: false,
      options: { message: '' }
    });
  }, []);

  // Convenience methods for common notifications
  const showSuccess = useCallback((message: string, title?: string) => {
    showNotification({ message, title, type: 'success' });
  }, [showNotification]);

  const showError = useCallback((message: string, title?: string) => {
    showNotification({ message, title, type: 'error' });
  }, [showNotification]);

  const showWarning = useCallback((message: string, title?: string) => {
    showNotification({ message, title, type: 'warning' });
  }, [showNotification]);

  const showInfo = useCallback((message: string, title?: string) => {
    showNotification({ message, title, type: 'info' });
  }, [showNotification]);

  return {
    // Confirmation modal
    confirmationModal,
    showConfirmation,
    closeConfirmation,
    
    // Notification modal
    notificationModal,
    showNotification,
    closeNotification,
    
    // Convenience methods
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};
