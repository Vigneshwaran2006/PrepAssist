'use client';

import type { ResumeSuggestions } from '@/types';

interface Props { suggestions: ResumeSuggestions }

const priorityStyle = (p: string): string =>
  p === 'critical' ? 'bg-red-100 text-red-700 border-red-200'
  : p === 'high' ? 'bg-orange-100 text-orange-700 border-orange-200'
  : p === 'medium' ? 'bg-amber-100 text-amber-700 border-amber-200'
  : 'bg-gray-100 text-gray-700 border-gray-200';

export default function ResumeSuggestionsTab({ suggestions }: Props): React.JSX.Element {
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-600 mb-1">ATS Score</p>
          <p className="text-3xl font-bold text-blue-700">{suggestions.overall_ats_score}%</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-600 mb-1">Company Fit</p>
          <p className="text-3xl font-bold text-indigo-700">{suggestions.company_fit_score}%</p>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
        <p className="text-gray-700 leading-relaxed">{suggestions.summary}</p>
      </section>

      {suggestions.keywords_to_add.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Keywords to Add</h3>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.keywords_to_add.map((k, i) => (
              <span key={i} className="text-sm bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-md">
                + {k}
              </span>
            ))}
          </div>
        </section>
      )}

      {suggestions.keywords_to_remove.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Keywords to Remove</h3>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.keywords_to_remove.map((k, i) => (
              <span key={i} className="text-sm bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-md">
                − {k}
              </span>
            ))}
          </div>
        </section>
      )}

      {suggestions.sections_to_add.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Sections to Add</h3>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.sections_to_add.map((s, i) => (
              <span key={i} className="text-sm bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-md">
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {suggestions.suggestions.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Detailed Suggestions</h3>
          <div className="space-y-3">
            {suggestions.suggestions.map((s, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${priorityStyle(s.priority)}`}>
                    {s.priority.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-600 font-medium">{s.section}</span>
                </div>
                <p className="text-sm text-gray-700 mb-1.5">
                  <span className="font-medium text-gray-900">Current:</span> {s.current_state}
                </p>
                <p className="text-sm text-gray-700 mb-1.5">
                  <span className="font-medium text-gray-900">Suggested:</span> {s.suggested_change}
                </p>
                <p className="text-xs text-gray-600 mb-2">
                  <span className="font-medium">Why:</span> {s.reason}
                </p>
                {s.example && (
                  <div className="bg-white border border-gray-200 rounded p-2 mt-2">
                    <p className="text-xs text-gray-500 mb-0.5">Example</p>
                    <p className="text-xs text-gray-800 font-mono">{s.example}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {suggestions.sample_bullet_improvements.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Bullet Point Improvements</h3>
          <div className="space-y-3">
            {suggestions.sample_bullet_improvements.map((b, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs text-red-700 font-medium mb-1">Before</p>
                  <p className="text-sm text-gray-800">{b.original}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-700 font-medium mb-1">After</p>
                  <p className="text-sm text-gray-800">{b.improved}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {suggestions.formatting_tips.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Formatting Tips</h3>
          <ul className="space-y-1.5">
            {suggestions.formatting_tips.map((t, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                <span className="text-blue-600">•</span> {t}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}