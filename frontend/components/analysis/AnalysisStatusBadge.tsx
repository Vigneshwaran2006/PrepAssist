'use client';

import type { AnalysisStatus } from '@/types';

interface Props { status: AnalysisStatus }

export default function AnalysisStatusBadge({ status }: Props): React.JSX.Element {
  const styles: Record<AnalysisStatus, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    validating: 'bg-blue-100 text-blue-700 border-blue-200',
    processing: 'bg-blue-100 text-blue-700 border-blue-200',
    completed: 'bg-green-100 text-green-700 border-green-200',
    failed: 'bg-red-100 text-red-700 border-red-200',
  };
  const labels: Record<AnalysisStatus, string> = {
    pending: 'Pending',
    validating: 'Validating',
    processing: 'Analyzing',
    completed: 'Ready',
    failed: 'Failed',
  };
  const isBusy = status === 'pending' || status === 'validating' || status === 'processing';
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${styles[status]}`}>
      {isBusy && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />}
      {labels[status]}
    </span>
  );
}