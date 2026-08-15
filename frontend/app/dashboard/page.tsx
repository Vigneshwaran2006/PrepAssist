'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/ui/Navbar';
import AnalyzeForm from '@/components/analysis/AnalyzeForm';
import AnalysisStatusBadge from '@/components/analysis/AnalysisStatusBadge';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmProvider';
import { analysisApi } from '@/lib/api/analysis';
import { useAuthStore } from '@/stores/authStore';
import type { AnalysisSummary } from '@/types';

export default function DashboardPage(): React.JSX.Element {
  const { user } = useAuthStore();
  const toast = useToast();
  const { confirm } = useConfirm();
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAnalyses = async (): Promise<void> => {
    try {
      const res = await analysisApi.list();
      setAnalyses(res.data.data?.analyses ?? []);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  useEffect(() => {
    const busy = analyses.some(
      (a) => a.status === 'pending' || a.status === 'validating' || a.status === 'processing'
    );
    if (!busy) return;
    const t = setInterval(fetchAnalyses, 4000);
    return () => clearInterval(t);
  }, [analyses]);

  const handleDelete = async (id: string, name: string): Promise<void> => {
    const ok = await confirm({
      title: 'Delete Analysis?',
      message: `The analysis for "${name}" will be permanently deleted. This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      icon: '🗑️',
    });
    if (!ok) return;

    setDeletingId(id);
    try {
      await analysisApi.delete(id);
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      toast.success('Analysis deleted');
    } catch {
      toast.error('Failed to delete analysis');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-6xl mx-auto px-6 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-600">
              Analyze your resume against any company and role in one shot.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">New Analysis</h2>
                <p className="text-sm text-gray-600">Fill in the details to get a complete placement preparation report.</p>
              </div>
              <AnalyzeForm />
            </div>

            {/* Past Analyses */}
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Past Analyses</h2>
                <p className="text-sm text-gray-600">{analyses.length} total</p>
              </div>

              {loading ? (
                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : analyses.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-sm text-gray-500">
                  Your analyses will appear here.
                </div>
              ) : (
                <div className="space-y-3">
                  {analyses.map((a) => (
                    <div key={a.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{a.company_name}</h3>
                          <p className="text-xs text-gray-600 truncate">
                            {a.resolved_role ?? a.role ?? '—'}
                          </p>
                        </div>
                        <AnalysisStatusBadge status={a.status} />
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          a.drive_type === 'on_campus' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-teal-50 text-teal-700 border border-teal-200'
                        }`}>
                          {a.drive_type === 'on_campus' ? '🎓 On-Campus' : '💼 Off-Campus'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/analyses/${a.id}`}
                          className="flex-1 text-center text-xs bg-gray-900 hover:bg-gray-800 text-white px-3 py-1.5 rounded-md transition-colors"
                        >
                          Open
                        </Link>
                        <Button
                          size="sm"
                          variant="secondary"
                          loading={deletingId === a.id}
                          onClick={() => handleDelete(a.id, a.company_name)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}