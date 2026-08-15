'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/ui/Navbar';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { analysisApi } from '@/lib/api/analysis';
import type { Analysis } from '@/types';
import AnalysisStatusBadge from '@/components/analysis/AnalysisStatusBadge';
import CompanyDetailsTab from '@/components/analysis/tabs/CompanyDetailsTab';
import DriveProcessTab from '@/components/analysis/tabs/DriveProcessTab';
import ResumeSuggestionsTab from '@/components/analysis/tabs/ResumeSuggestionsTab';
import GapAnalysisTab from '@/components/analysis/tabs/GapAnalysisTab';
import PreparationGuideTab from '@/components/analysis/tabs/PreparationGuideTab';

type TabKey = 'company' | 'drive' | 'resume' | 'gap' | 'prep';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'company', label: 'Company Details', icon: '🏢' },
  { key: 'drive', label: 'Drive Process', icon: '📋' },
  { key: 'resume', label: 'Resume Suggestions', icon: '📄' },
  { key: 'gap', label: 'Gap Analysis', icon: '📊' },
  { key: 'prep', label: 'Preparation Guide', icon: '📚' },
];

export default function AnalysisDetailPage(): React.JSX.Element {
  const params = useParams();
  const id = params?.['id'] as string;
  const toast = useToast();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('company');
  const [retrying, setRetrying] = useState(false);

  const fetchAnalysis = useCallback(async (): Promise<void> => {
    try {
      const res = await analysisApi.getById(id);
      setAnalysis(res.data.data?.analysis ?? null);
      setError(null);
    } catch {
      setError('Failed to load analysis');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchAnalysis();
  }, [id, fetchAnalysis]);

  useEffect(() => {
    if (!analysis) return;
    const busy =
      analysis.status === 'pending' ||
      analysis.status === 'validating' ||
      analysis.status === 'processing';
    if (!busy) return;
    const t = setInterval(fetchAnalysis, 4000);
    return () => clearInterval(t);
  }, [analysis, fetchAnalysis]);

  const handleRetry = async (): Promise<void> => {
    setRetrying(true);
    try {
      await analysisApi.retry(id);
      await fetchAnalysis();
      toast.info('Retry started. This may take 30-60 seconds.');
    } catch {
      toast.error('Retry failed');
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !analysis) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error ?? 'Not found'}</p>
            <Link href="/dashboard" className="text-blue-600 hover:underline">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const isProcessing =
    analysis.status === 'pending' ||
    analysis.status === 'validating' ||
    analysis.status === 'processing';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-4">
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
              ← Back to Dashboard
            </Link>
          </div>

          {/* Header */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  {analysis.company_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{analysis.company_name}</h1>
                  <p className="text-gray-600">{analysis.resolved_role ?? analysis.role ?? '—'}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <AnalysisStatusBadge status={analysis.status} />
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${
                      analysis.drive_type === 'on_campus'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-teal-50 text-teal-700 border-teal-200'
                    }`}>
                      {analysis.drive_type === 'on_campus' ? '🎓 On-Campus' : '💼 Off-Campus'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isProcessing && (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Analyzing {analysis.company_name}...
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Validating company, researching current info, and generating all 5 sections. This takes 30-60 seconds.
              </p>
            </div>
          )}

          {analysis.status === 'failed' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-semibold text-red-700 mb-2">Analysis Failed</h3>
              <p className="text-red-600 text-sm mb-6 max-w-md mx-auto">
                {analysis.error_message ?? 'Unknown error'}
              </p>
              <Button
                variant="danger"
                loading={retrying}
                onClick={handleRetry}
                icon="🔄"
              >
                Retry Analysis
              </Button>
            </div>
          )}

          {analysis.status === 'completed' && (
            <>
              {/* Tabs */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="border-b border-gray-200 overflow-x-auto">
                  <div className="flex min-w-max">
                    {TABS.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                          activeTab === tab.key
                            ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <span>{tab.icon}</span>
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6">
                  {activeTab === 'company' && analysis.company_details && (
                    <CompanyDetailsTab details={analysis.company_details} />
                  )}
                  {activeTab === 'drive' && analysis.drive_process && (
                    <DriveProcessTab process={analysis.drive_process} />
                  )}
                  {activeTab === 'resume' && analysis.resume_suggestions && (
                    <ResumeSuggestionsTab suggestions={analysis.resume_suggestions} />
                  )}
                  {activeTab === 'gap' && analysis.gap_analysis && (
                    <GapAnalysisTab gap={analysis.gap_analysis} />
                  )}
                  {activeTab === 'prep' && analysis.preparation_guide && (
                    <PreparationGuideTab guide={analysis.preparation_guide} />
                  )}
                </div>
              </div>

              {/* Sources */}
              {analysis.sources && analysis.sources.length > 0 && (
                <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Sources</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    {analysis.sources.slice(0, 12).map((s, i) => (
                      <a
                        key={i}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline truncate"
                      >
                        {s.title || s.url}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}