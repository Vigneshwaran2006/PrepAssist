'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/lib/api/auth';

export default function HomePage(): React.JSX.Element {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const features = [
    { icon: '📄', title: 'Resume Analysis', desc: 'ATS score & AI-powered feedback' },
    { icon: '🏢', title: 'Company Research', desc: 'Current hiring processes & rounds' },
    { icon: '📊', title: 'Skill Gap Analysis', desc: 'Know exactly what to learn' },
    { icon: '📚', title: 'Learning Roadmap', desc: 'Personalized week-by-week plan' },
    { icon: '💻', title: 'Mock Assessments', desc: 'Company-specific OA practice' },
    { icon: '🎤', title: 'AI Mock Interviews', desc: 'Realistic interview simulations' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Nav */}
      <nav className="border-b border-slate-200 bg-white/70 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold">P</span>
            </div>
            <span className="font-semibold text-lg text-slate-900">PrepAssist</span>
          </div>
          <button
            onClick={() => authApi.loginWithGoogle()}
            className="text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 px-4 py-2 rounded-md transition-colors"
          >
            Sign in
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
          AI-Powered Placement Preparation
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
          Land your dream tech job with{' '}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            confidence
          </span>
        </h1>

        <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Analyze your resume, research target companies, close skill gaps, practice
          assessments, and ace interviews — all in one platform.
        </p>

        <button
          onClick={() => authApi.loginWithGoogle()}
          className="inline-flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white font-medium px-7 py-3.5 rounded-lg transition-all shadow-md hover:shadow-lg"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <p className="text-xs text-slate-500 mt-5">
          Free to get started • No credit card required
        </p>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-slate-900 font-semibold mb-1.5">{f.title}</h3>
              <p className="text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} PrepAssist. Built for aspiring engineers.
        </div>
      </footer>
    </main>
  );
}