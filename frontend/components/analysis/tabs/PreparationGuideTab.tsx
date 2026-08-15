'use client';

import type { PreparationGuide } from '@/types';

const RESOURCE_ICONS: Record<string, string> = {
  documentation: '📖',
  video: '🎥',
  course: '🎓',
  practice: '💻',
  article: '📝',
  book: '📚',
};

interface Props { guide: PreparationGuide }

export default function PreparationGuideTab({ guide }: Props): React.JSX.Element {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Strategy</h3>
        <p className="text-gray-700 leading-relaxed">{guide.overall_strategy}</p>
        <p className="text-sm text-gray-600 mt-2">
          <span className="font-medium">Estimated prep time:</span> {guide.estimated_total_prep_time}
        </p>
      </section>

      {guide.weekly_plan_summary.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">📅 Weekly Plan Summary</h3>
          <div className="space-y-2">
            {guide.weekly_plan_summary.map((w, i) => (
              <div key={i} className="flex gap-3 border-l-2 border-blue-300 pl-4 py-1">
                <span className="text-sm text-gray-700">{w}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {guide.steps.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Detailed Steps</h3>
          <div className="space-y-4">
            {guide.steps.map((s) => (
              <div key={s.step_number} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 bg-blue-600 text-white rounded-lg flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    {s.step_number}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-gray-900">{s.title}</h4>
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                        {s.duration}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        s.priority === 'high' ? 'bg-red-100 text-red-700'
                        : s.priority === 'medium' ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-700'
                      }`}>
                        {s.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{s.description}</p>
                  </div>
                </div>

                {s.topics.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Topics</p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.topics.map((t, i) => (
                        <span key={i} className="text-xs bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {s.resources.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Resources</p>
                    <div className="space-y-1">
                      {s.resources.map((r, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span>{RESOURCE_ICONS[r.type] ?? '🔗'}</span>
                          {r.url ? (
                            <a href={r.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                              {r.title}
                            </a>
                          ) : (
                            <span className="text-gray-700">{r.title}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {s.practice_tasks.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Practice Tasks</p>
                    <ul className="space-y-0.5">
                      {s.practice_tasks.map((t, i) => (
                        <li key={i} className="text-sm text-gray-700 flex gap-2">
                          <span className="text-blue-600">▸</span> {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {s.success_metrics.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Success Metrics</p>
                    <ul className="space-y-0.5">
                      {s.success_metrics.map((m, i) => (
                        <li key={i} className="text-sm text-gray-700 flex gap-2">
                          <span className="text-green-600">✓</span> {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guide.daily_practice_tips.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Daily Practice Tips</h3>
            <ul className="space-y-1.5">
              {guide.daily_practice_tips.map((t, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-blue-600">•</span> {t}
                </li>
              ))}
            </ul>
          </section>
        )}

        {guide.common_mistakes_to_avoid.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">⚠ Common Mistakes to Avoid</h3>
            <ul className="space-y-1.5">
              {guide.common_mistakes_to_avoid.map((m, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-red-600">✗</span> {m}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {guide.final_week_checklist.length > 0 && (
        <section className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">🏁 Final Week Checklist</h3>
          <ul className="space-y-1.5">
            {guide.final_week_checklist.map((c, i) => (
              <li key={i} className="text-sm text-gray-800 flex gap-2">
                <span className="text-blue-600">☐</span> {c}
              </li>
            ))}
          </ul>
        </section>
      )}

      {guide.mindset_and_motivation.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">🧠 Mindset & Motivation</h3>
          <ul className="space-y-1.5">
            {guide.mindset_and_motivation.map((m, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                <span className="text-purple-600">✨</span> {m}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}