'use client';

import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  icon?: string;
}

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  icon,
}: ConfirmModalProps): React.JSX.Element {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async (): Promise<void> => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const iconStyles = variant === 'danger'
    ? 'bg-red-100 text-red-600'
    : 'bg-blue-100 text-blue-600';

  const defaultIcon = variant === 'danger' ? '⚠️' : 'ℹ️';

  return (
    <Modal open={open} onClose={onClose} size="sm" showClose={false} closeOnOverlay={!loading}>
      <div className="p-6">
        <div className={`w-12 h-12 rounded-full ${iconStyles} flex items-center justify-center text-2xl mx-auto mb-4`}>
          {icon ?? defaultIcon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">{title}</h3>
        <p className="text-sm text-gray-600 text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            fullWidth
            loading={loading}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}