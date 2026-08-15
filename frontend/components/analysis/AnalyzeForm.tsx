'use client';

import { useState, useRef, useEffect, type FormEvent, type ChangeEvent, type DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import { resumeApi } from '@/lib/api/resume';
import { analysisApi } from '@/lib/api/analysis';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import type { Resume, DriveType } from '@/types';

const MAX_SIZE = 10 * 1024 * 1024;

export default function AnalyzeForm(): React.JSX.Element {
  const router = useRouter();
  const toast = useToast();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);

  const [resumeMode, setResumeMode] = useState<'existing' | 'new'>('existing');
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [newResumeFile, setNewResumeFile] = useState<File | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [showJD, setShowJD] = useState(false);
  const [driveType, setDriveType] = useState<DriveType>('off_campus');

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    resumeApi
      .list()
      .then((r) => {
        const list = (r.data.data?.resumes ?? []).filter((x) => x.status === 'completed');
        setResumes(list);
        const primary = list.find((x) => x.is_primary);
        if (primary) setSelectedResumeId(primary.id);
        else if (list[0]) setSelectedResumeId(list[0].id);
        if (list.length === 0) setResumeMode('new');
      })
      .finally(() => setLoadingResumes(false));
  }, []);

  const handleFileSelect = (f: File): void => {
    const ext = f.name.toLowerCase().slice(f.name.lastIndexOf('.'));
    if (!['.pdf', '.docx', '.doc'].includes(ext)) {
      toast.error('Only PDF and DOCX files are allowed');
      return;
    }
    if (f.size > MAX_SIZE) {
      toast.error('File size must be under 10 MB');
      return;
    }
    setNewResumeFile(f);
  };

  const submit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    if (!companyName.trim()) {
      toast.warning('Please enter a company name');
      return;
    }
    if (!role.trim() && !jobDescription.trim()) {
      toast.warning('Please provide either a role or a job description');
      return;
    }

    setSubmitting(true);

    try {
      let resumeIdToUse = selectedResumeId;
      if (resumeMode === 'new') {
        if (!newResumeFile) {
          toast.warning('Please select a resume file');
          setSubmitting(false);
          return;
        }
        setUploadingResume(true);
        toast.info('Uploading resume...');
        const uploadRes = await resumeApi.upload(newResumeFile);
        const uploaded = uploadRes.data.data?.resume;
        if (!uploaded) throw new Error('Resume upload failed');
        resumeIdToUse = uploaded.id;

        toast.info('Analyzing resume...');
        let attempts = 0;
        while (attempts < 30) {
          await new Promise((r) => setTimeout(r, 3000));
          const check = await resumeApi.getById(uploaded.id);
          const st = check.data.data?.resume.status;
          if (st === 'completed') break;
          if (st === 'failed') {
            throw new Error('Resume processing failed. Please try a different file.');
          }
          attempts++;
        }
        setUploadingResume(false);
      }

      if (!resumeIdToUse) {
        toast.error('No resume selected');
        setSubmitting(false);
        return;
      }

      toast.info('Starting analysis...');
      const res = await analysisApi.create({
        resume_id: resumeIdToUse,
        company_name: companyName.trim(),
        role: role.trim() || undefined,
        job_description: jobDescription.trim() || undefined,
        drive_type: driveType,
      });

      const analysisId = res.data.data?.analysis.id;
      if (analysisId) {
        router.push(`/dashboard/analyses/${analysisId}`);
      }
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        (err as Error).message ??
        'Failed';
      toast.error(msg);
      setSubmitting(false);
      setUploadingResume(false);
    }
  };

  const buttonText = uploadingResume
    ? 'Processing resume...'
    : submitting
    ? 'Starting analysis...'
    : 'Analyze';

  return (
    <form onSubmit={submit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
      {/* Resume */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Resume <span className="text-red-500">*</span>
        </label>

        {loadingResumes ? (
          <div className="text-sm text-gray-500 py-2 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            Loading resumes...
          </div>
        ) : (
          <>
            {resumes.length > 0 && (
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setResumeMode('existing')}
                  disabled={submitting}
                  className={`text-sm px-3 py-1.5 rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    resumeMode === 'existing'
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Use Existing
                </button>
                <button
                  type="button"
                  onClick={() => setResumeMode('new')}
                  disabled={submitting}
                  className={`text-sm px-3 py-1.5 rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    resumeMode === 'new'
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Upload New
                </button>
              </div>
            )}

            {resumeMode === 'existing' && resumes.length > 0 ? (
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                disabled={submitting}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}{r.is_primary ? ' (Primary)' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div
                onDragOver={(e: DragEvent<HTMLDivElement>) => {
                  if (submitting) return;
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e: DragEvent<HTMLDivElement>) => {
                  if (submitting) return;
                  e.preventDefault();
                  setIsDragging(false);
                  const f = e.dataTransfer.files[0];
                  if (f) handleFileSelect(f);
                }}
                onClick={() => !submitting && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                  submitting
                    ? 'cursor-not-allowed opacity-60 border-gray-200'
                    : isDragging
                    ? 'border-blue-500 bg-blue-50 cursor-pointer'
                    : 'border-gray-300 hover:border-gray-400 bg-white cursor-pointer'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelect(f);
                  }}
                  className="hidden"
                  disabled={submitting}
                />
                {newResumeFile ? (
                  <div>
                    <p className="text-gray-900 font-medium">📄 {newResumeFile.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{(newResumeFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-700 font-medium">Drop resume or click to browse</p>
                    <p className="text-xs text-gray-500 mt-1">PDF or DOCX • Max 10 MB</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Company */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Company Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="e.g. Amazon, Google, TCS"
          disabled={submitting}
          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      {/* Role */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Job Role <span className="text-xs text-gray-500 font-normal">(or provide JD below)</span>
        </label>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. SDE, Frontend Engineer, Data Scientist"
          disabled={submitting}
          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      {/* JD */}
      <div>
        <button
          type="button"
          onClick={() => setShowJD(!showJD)}
          disabled={submitting}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span>{showJD ? '▼' : '▶'}</span>
          {role.trim() ? 'Add Job Description (optional)' : 'Add Job Description (required if no role)'}
        </button>

        {showJD && (
          <div className="mt-3">
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the complete job description here..."
              rows={8}
              disabled={submitting}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 resize-y text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">{jobDescription.length} characters</p>
          </div>
        )}
      </div>

      {/* Drive Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Drive Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setDriveType('on_campus')}
            disabled={submitting}
            className={`p-4 rounded-lg border-2 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
              driveType === 'on_campus' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🎓</span>
              <span className="font-semibold text-gray-900">On-Campus</span>
            </div>
            <p className="text-xs text-gray-600">College placement, CGPA cutoffs, batch hiring</p>
          </button>
          <button
            type="button"
            onClick={() => setDriveType('off_campus')}
            disabled={submitting}
            className={`p-4 rounded-lg border-2 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
              driveType === 'off_campus' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">💼</span>
              <span className="font-semibold text-gray-900">Off-Campus</span>
            </div>
            <p className="text-xs text-gray-600">Direct application, referrals, careers page</p>
          </button>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        fullWidth
        loading={submitting || uploadingResume}
        disabled={loadingResumes}
        icon={!submitting && !uploadingResume ? '🚀' : undefined}
      >
        {buttonText}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Full analysis takes 30–60 seconds. We&apos;ll verify the company, research it, and produce all 5 sections.
      </p>
    </form>
  );
}