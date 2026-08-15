'use client';

import type { GapAnalysis } from '@/types';

interface Props { gap: GapAnalysis }

const importanceStyle = (i: string): string =>
  i === 'critical' ? 'bg-red-100 text-red-700 border-red-200'
  : i === 'high' ? 'bg-orange-100 text-orange-700 border-orange-200'
  : i === 'medium' ? 'bg-amber-100 text-amber-700 border-amber-200'
  : 'bg-gray-100 text-gray-700 border-gray-200';

export default function GapAnalysisTab({ gap }: Props): React.JSX.Element {
  const scoreColor =
    gap.match_percentage >= 80 ? 'text-green-600'
    : gap.match_percentage >= 60 ? 'text-blue-600'
    : gap.match_percentage >= 40 ? 'text-amber-600'
    : 'text-red-600';

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-center">
          <p className="text-xs text-gray-600 mb-1">Match Percentage</p>
          <p className={`text-4xl font-bold ${scoreColor}`}>{gap.match_percentage}%</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-center">
          <p className="text-xs text-gray-600 mb-1">Readiness</p>
          <p className="text-xl font-bold text-gray-900 mt-2">{gap.readiness_level}</p>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
        <p className="text-gray-700 leading-relaxed">{gap.summary}</p>
      </section>

      {gap.matched_skills.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            ✅ Matched Skills ({gap.matched_skills.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {gap.matched_skills.map((s, i) => {
              const strengthColor =
                s.strength === 'strong' ? 'bg-green-50 border-green-200'
                : s.strength === 'moderate' ? 'bg-blue-50 border-blue-200'
                : 'bg-gray-50 border-gray-200';
              return (
                <div key={i} className={`border rounded-lg p-3 ${strengthColor}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 text-sm">{s.skill}</span>
                    <span className="text-xs text-gray-500 uppercase">{s.strength}</span>
                  </div>
                  <p className="text-xs text-gray-600">{s.category}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {gap.missing_skills.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            🎯 Missing Skills ({gap.missing_skills.length})
          </h3>
          <div className="space-y-3">
            {gap.missing_skills
              .sort((a, b) => a.priority - b.priority)
              .map((s, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h4 className="font-semibold text-gray-900">{s.skill}</h4>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${importanceStyle(s.importance)}`}>
                      {s.importance.toUpperCase()}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      Priority #{s.priority}
                    </span>
                    <span className="text-xs text-gray-500">⏱ {s.estimated_time}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1.5">
                    <span className="font-medium">Why needed:</span> {s.why_needed}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Quick tip:</span> {s.quick_learn_tip}
                  </p>
                </div>
              ))}
          </div>
        </section>
      )}

      {gap.partial_skills.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">⚡ Skills to Deepen</h3>
          <div className="space-y-3">
            {gap.partial_skills.map((s, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                <h4 className="font-medium text-gray-900 mb-2">{s.skill}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Your Current Level</p>
                    <p className="text-gray-800">{s.current_level}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Required Level</p>
                    <p className="text-gray-800">{s.required_level}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">How to upgrade:</span> {s.how_to_upgrade}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {gap.extra_advantages.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">⭐ Your Bonus Skills</h3>
          <div className="space-y-2">
            {gap.extra_advantages.map((s, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-3 bg-purple-50/30">
                <p className="font-medium text-gray-900 text-sm">{s.skill}</p>
                <p className="text-sm text-gray-700 mt-0.5">{s.how_to_leverage}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {gap.critical_gaps_summary && (
        <section className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Critical Gaps Summary</h3>
          <p className="text-sm text-red-700">{gap.critical_gaps_summary}</p>
        </section>
      )}
    </div>
  );
}