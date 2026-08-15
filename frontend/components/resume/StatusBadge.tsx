'use client';

import type { ResumeStatus } from '@/types';

interface StatusBadgeProps {
  status: ResumeStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps): React.JSX.Element {
  const styles: Record<ResumeStatus, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    processing: 'bg-blue-100 text-blue-700 border-blue-200',
    completed: 'bg-green-100 text-green-700 border-green-200',
    failed: 'bg-red-100 text-red-700 border-red-200',
  };

  const labels: Record<ResumeStatus, string> = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Analyzed',
    failed: 'Failed',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${styles[status]}`}
    >
      {status === 'processing' && (
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
      )}
      {labels[status]}
    </span>
  );
}