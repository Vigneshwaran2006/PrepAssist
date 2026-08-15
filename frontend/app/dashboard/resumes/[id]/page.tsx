'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/ui/Navbar';
import { resumeApi } from '@/lib/api/resume';
import type { ResumeWithAnalysis } from '@/types';
import StatusBadge from '@/components/resume/StatusBadge';
import ScoreCircle from '@/components/resume/ScoreCircle';

export default function ResumeDetailPage(): React.JSX.Element {
  const params = useParams();
  const id = params?.['id'] as string;
  const [resume, setResume] = useState<ResumeWithAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResume = useCallback(async (): Promise<void> => {
    try {
      const res = await resumeApi.getById(id);
      setResume(res.data.data?.resume ?? null);
      setError(null);
    } catch {
      setError('Failed to load resume');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchResume();
  }, [id, fetchResume]);

  useEffect(() => {
    if (!resume) return;
    if (resume.status !== 'pending' && resume.status !== 'processing') return;
    const interval = setInterval(fetchResume, 3500);
    return () => clearInterval(interval);
  }, [resume, fetchResume]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !resume) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error ?? 'Resume not found'}</p>
            <Link href="/dashboard/resumes" className="text-blue-600 hover:underline">
              ← Back to Resumes
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const analysis = resume.analysis;
  const isProcessing =
    resume.status === 'pending' || resume.status === 'processing';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-6 py-10">
          <div className="mb-4">
            <Link
              href="/dashboard/resumes"
              className="text-sm text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
            >
              ← Back to Resumes
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl font-bold text-slate-900">{resume.title}</h1>
                <StatusBadge status={resume.status} />
              </div>
              <p className="text-slate-500 text-sm">{resume.file_name}</p>
            </div>
          </div>

          {/* Processing */}
          {isProcessing && (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Analyzing your resume...
              </h3>
              <p className="text-slate-600">
                This usually takes 10–30 seconds. The page will update automatically.
              </p>
            </div>
          )}

          {/* Failed */}
          {resume.status === 'failed' && (() => {
            const errorMsg = resume.error_message ?? '';
            const isBusy =
              errorMsg.includes('AI service is temporarily busy') ||
              errorMsg.includes('high demand') ||
              errorMsg.includes('503') ||
              errorMsg.includes('overloaded');

            if (isBusy) {
              return (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
                  <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⏳</span>
                  </div>
                  <h3 className="text-xl font-semibold text-amber-800 mb-2">Servers Are Busy</h3>
                  <p className="text-amber-700 text-sm mb-4 max-w-md mx-auto">
                    Google&apos;s AI servers are busy. Please re-upload your resume in a moment.
                  </p>
                  <p className="text-xs text-gray-500">
                    This usually clears up in 1-2 minutes.
                  </p>
                </div>
              );
            }

            return (
              <div className="bg-red-50 border border-red-200 rounded-xl p-8">
                <h3 className="text-xl font-semibold text-red-700 mb-2">Analysis Failed</h3>
                <p className="text-red-600 text-sm">{errorMsg || 'An unknown error occurred'}</p>
              </div>
            );
          })()}

          {/* Completed */}
          {resume.status === 'completed' && analysis && (
            <div className="space-y-6">
              {/* Scores */}
              <section className="bg-white border border-slate-200 rounded-xl p-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">
                  Resume Scores
                </h2>
                <div className="flex flex-wrap gap-10 justify-center md:justify-start">
                  <ScoreCircle score={analysis.ats_score ?? 0} label="ATS Score" />
                  <ScoreCircle
                    score={analysis.quality_score ?? 0}
                    label="Quality Score"
                  />
                </div>
              </section>

              {/* Personal Info */}
              {analysis.personal_info && (
                <section className="bg-white border border-slate-200 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {Object.entries(analysis.personal_info).map(
                      ([key, value]) =>
                        value && (
                          <div key={key}>
                            <p className="text-slate-500 capitalize text-xs mb-0.5">
                              {key.replace('_', ' ')}
                            </p>
                            <p className="text-slate-900 break-words">{value}</p>
                          </div>
                        )
                    )}
                  </div>
                </section>
              )}

              {/* Skills */}
              {analysis.skills && analysis.skills.length > 0 && (
                <section className="bg-white border border-slate-200 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">
                    Skills
                  </h2>
                  <div className="space-y-4">
                    {analysis.skills.map((cat, i) => (
                      <div key={i}>
                        <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                          {cat.category}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {cat.items.map((item, j) => (
                            <span
                              key={j}
                              className="text-sm bg-slate-100 text-slate-800 px-3 py-1 rounded-md"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Two-column layout for strengths and suggestions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Strengths */}
                {analysis.strengths && analysis.strengths.length > 0 && (
                  <section className="bg-white border border-slate-200 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 bg-green-100 text-green-700 rounded-lg flex items-center justify-center">
                        ✓
                      </span>
                      Strengths
                    </h2>
                    <ul className="space-y-2.5">
                      {analysis.strengths.map((s, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-slate-700"
                        >
                          <span className="text-green-600 mt-0.5 flex-shrink-0">
                            ●
                          </span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Missing Keywords */}
                {analysis.missing_keywords &&
                  analysis.missing_keywords.length > 0 && (
                    <section className="bg-white border border-slate-200 rounded-xl p-6">
                      <h2 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
                        <span className="w-8 h-8 bg-orange-100 text-orange-700 rounded-lg flex items-center justify-center">
                          🔍
                        </span>
                        Missing Keywords
                      </h2>
                      <p className="text-sm text-slate-500 mb-3">
                        Consider adding these to strengthen your resume
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.missing_keywords.map((k, i) => (
                          <span
                            key={i}
                            className="text-sm bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 rounded-md"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}
              </div>

              {/* Improvement Suggestions */}
              {analysis.improvement_suggestions &&
                analysis.improvement_suggestions.length > 0 && (
                  <section className="bg-white border border-slate-200 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center">
                        💡
                      </span>
                      Improvement Suggestions
                    </h2>
                    <div className="space-y-3">
                      {analysis.improvement_suggestions.map((sug, i) => {
                        const priorityStyle =
                          sug.priority === 'high'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : sug.priority === 'medium'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200';
                        return (
                          <div
                            key={i}
                            className="border border-slate-200 rounded-lg p-4 bg-slate-50/50"
                          >
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span
                                className={`text-xs font-medium px-2 py-0.5 rounded-full border ${priorityStyle}`}
                              >
                                {sug.priority.toUpperCase()}
                              </span>
                              <span className="text-sm text-slate-500">
                                {sug.section}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 mb-1.5">
                              <span className="font-medium text-slate-900">Issue:</span>{' '}
                              {sug.issue}
                            </p>
                            <p className="text-sm text-slate-700">
                              <span className="font-medium text-slate-900">
                                Suggestion:
                              </span>{' '}
                              {sug.suggestion}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

              {/* Weak Sections */}
              {analysis.weak_sections && analysis.weak_sections.length > 0 && (
                <section className="bg-white border border-slate-200 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center">
                      ⚠
                    </span>
                    Weak Sections
                  </h2>
                  <div className="space-y-3">
                    {analysis.weak_sections.map((w, i) => (
                      <div
                        key={i}
                        className="border border-slate-200 rounded-lg p-4 bg-slate-50/50"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <p className="text-slate-900 font-medium">{w.section}</p>
                          <span className="text-xs text-slate-500">
                            Impact: {w.impact}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{w.reason}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Experience */}
              {analysis.experience && analysis.experience.length > 0 && (
                <section className="bg-white border border-slate-200 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">
                    Experience
                  </h2>
                  <div className="space-y-6">
                    {analysis.experience.map((exp, i) => (
                      <div
                        key={i}
                        className="border-l-2 border-blue-200 pl-5 relative"
                      >
                        <div className="absolute -left-1.5 top-1 w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                        <h3 className="text-slate-900 font-semibold">{exp.role}</h3>
                        <p className="text-sm text-slate-600 mb-1">
                          {exp.company}
                          {exp.location && ` • ${exp.location}`}
                        </p>
                        <p className="text-xs text-slate-500 mb-2">
                          {exp.start_date} — {exp.end_date}
                        </p>
                        {exp.responsibilities.length > 0 && (
                          <ul className="list-disc list-outside ml-4 text-sm text-slate-700 space-y-1">
                            {exp.responsibilities.map((r, j) => (
                              <li key={j}>{r}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Projects */}
              {analysis.projects && analysis.projects.length > 0 && (
                <section className="bg-white border border-slate-200 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">
                    Projects
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.projects.map((p, i) => (
                      <div
                        key={i}
                        className="border border-slate-200 rounded-lg p-4 bg-slate-50/50"
                      >
                        <h3 className="text-slate-900 font-semibold mb-1.5">
                          {p.name}
                        </h3>
                        <p className="text-sm text-slate-700 mb-3">{p.description}</p>
                        {p.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {p.technologies.map((t, j) => (
                              <span
                                key={j}
                                className="text-xs bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Education */}
              {analysis.education && analysis.education.length > 0 && (
                <section className="bg-white border border-slate-200 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">
                    Education
                  </h2>
                  <div className="space-y-4">
                    {analysis.education.map((edu, i) => (
                      <div
                        key={i}
                        className="border-l-2 border-indigo-200 pl-5 relative"
                      >
                        <div className="absolute -left-1.5 top-1 w-2.5 h-2.5 bg-indigo-500 rounded-full"></div>
                        <h3 className="text-slate-900 font-semibold">
                          {edu.degree}
                          {edu.field && ` in ${edu.field}`}
                        </h3>
                        <p className="text-sm text-slate-600">{edu.institution}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {edu.start_date} — {edu.end_date}
                          {edu.gpa && ` • GPA: ${edu.gpa}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Certifications */}
              {analysis.certifications && analysis.certifications.length > 0 && (
                <section className="bg-white border border-slate-200 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">
                    Certifications
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysis.certifications.map((c, i) => (
                      <div
                        key={i}
                        className="border border-slate-200 rounded-lg p-4 bg-slate-50/50"
                      >
                        <h3 className="text-slate-900 font-medium">{c.name}</h3>
                        <p className="text-sm text-slate-600">{c.issuer}</p>
                        {c.date && (
                          <p className="text-xs text-slate-500 mt-1">{c.date}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}