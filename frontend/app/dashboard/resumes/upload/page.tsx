'use client';

import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/ui/Navbar';
import UploadCard from '@/components/resume/UploadCard';

export default function UploadResumePage(): React.JSX.Element {
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

          <div className="text-center mb-10 mt-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Upload Your Resume
            </h1>
            <p className="text-slate-600 max-w-xl mx-auto">
              PDF or DOCX format. We&apos;ll analyze it for ATS compatibility, extract
              skills, and provide improvement suggestions.
            </p>
          </div>

          <UploadCard />
        </main>
      </div>
    </ProtectedRoute>
  );
}