'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/ui/Navbar';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmProvider';
import { resumeApi } from '@/lib/api/resume';
import type { Resume } from '@/types';
import StatusBadge from '@/components/resume/StatusBadge';

export default function ResumesListPage(): React.JSX.Element {
  const toast = useToast();
  const { confirm } = useConfirm();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchResumes = async (): Promise<void> => {
    try {
      const res = await resumeApi.list();
      setResumes(res.data.data?.resumes ?? []);
      setError(null);
    } catch {
      setError('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  useEffect(() => {
    const hasProcessing = resumes.some(
      (r) => r.status === 'pending' || r.status === 'processing'
    );
    if (!hasProcessing) return;
    const interval = setInterval(fetchResumes, 4000);
    return () => clearInterval(interval);
  }, [resumes]);

  const handleDelete = async (id: string, name: string): Promise<void> => {
    const ok = await confirm({
      title: 'Delete Resume?',
      message: `"${name}" will be permanently deleted along with its analysis.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      icon: '🗑️',
    });
    if (!ok) return;

    setActioningId(id);
    try {
      await resumeApi.delete(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      toast.success('Resume deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setActioningId(null);
    }
  };

  const handleSetPrimary = async (id: string): Promise<void> => {
    setActioningId(id);
    try {
      await resumeApi.setPrimary(id);
      await fetchResumes();
      toast.success('Primary resume updated');
    } catch {
      toast.error('Failed to set primary');
    } finally {
      setActioningId(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Your Resumes</h1>
              <p className="text-gray-600">Manage your uploaded resumes and view analyses.</p>
            </div>
            <Link href="/dashboard/resumes/upload">
              <Button icon="+">Upload New Resume</Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-500">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">{error}</div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-20 bg-white border border-gray-200 rounded-xl">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📄</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No resumes yet</h3>
              <p className="text-gray-600 mb-6">Upload your first resume to get started</p>
              <Link href="/dashboard/resumes/upload">
                <Button>Upload Resume</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {resume.title}
                        </h3>
                        <StatusBadge status={resume.status} />
                        {resume.is_primary && (
                          <span className="text-xs bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-medium">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {resume.file_name} • {(resume.file_size / 1024).toFixed(1)} KB
                      </p>
                      {resume.status === 'failed' && resume.error_message && (
                        <p className="text-xs text-red-600 mt-2">
                          Error: {resume.error_message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {resume.status === 'completed' && (
                        <Link href={`/dashboard/resumes/${resume.id}`}>
                          <Button variant="primary" size="sm">View Analysis</Button>
                        </Link>
                      )}
                      {!resume.is_primary && resume.status === 'completed' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          loading={actioningId === resume.id}
                          onClick={() => handleSetPrimary(resume.id)}
                        >
                          Make Primary
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={actioningId === resume.id}
                        onClick={() => handleDelete(resume.id, resume.title)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}