'use client';

import type { DriveProcess } from '@/types';

interface Props { process: DriveProcess }

export default function DriveProcessTab({ process }: Props): React.JSX.Element {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Overview</h3>
        <p className="text-gray-700 leading-relaxed">{process.overview}</p>
        {process.total_duration && (
          <p className="text-sm text-gray-600 mt-2">
            <span className="font-medium">Total Duration:</span> {process.total_duration}
          </p>
        )}
      </section>

      {process.drive_type === 'on_campus' && process.eligibility && (
        <section className="bg-purple-50/40 border border-purple-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>🎓</span> Eligibility Criteria
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {process.eligibility.cgpa_cutoff && (
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-500">CGPA / % Cutoff</p>
                <p className="text-gray-900 font-medium">{process.eligibility.cgpa_cutoff}</p>
              </div>
            )}
            {process.eligibility.backlog_policy && (
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-500">Backlog Policy</p>
                <p className="text-gray-900">{process.eligibility.backlog_policy}</p>
              </div>
            )}
            {process.eligibility.branches.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-3 md:col-span-2">
                <p className="text-xs text-gray-500 mb-1">Eligible Branches</p>
                <div className="flex flex-wrap gap-1.5">
                  {process.eligibility.branches.map((b, i) => (
                    <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{b}</span>
                  ))}
                </div>
              </div>
            )}
            {process.eligibility.batches.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-3 md:col-span-2">
                <p className="text-xs text-gray-500 mb-1">Eligible Batches</p>
                <div className="flex flex-wrap gap-1.5">
                  {process.eligibility.batches.map((b, i) => (
                    <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{b}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {process.drive_type === 'off_campus' && process.application_process && (
        <section className="bg-teal-50/40 border border-teal-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>💼</span> Application Process
          </h3>
          {process.application_process.channels.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Application Channels</p>
              <div className="flex flex-wrap gap-1.5">
                {process.application_process.channels.map((c, i) => (
                  <span key={i} className="text-sm bg-teal-100 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-md">{c}</span>
                ))}
              </div>
            </div>
          )}
          {process.application_process.referral_info && (
            <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3 text-sm">
              <p className="text-xs text-gray-500 mb-0.5">Referral Info</p>
              <p className="text-gray-700">{process.application_process.referral_info}</p>
            </div>
          )}
          {process.application_process.tips.length > 0 && (
            <ul className="space-y-1">
              {process.application_process.tips.map((t, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-teal-600">💡</span> {t}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Rounds */}
      {process.rounds.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Interview Rounds</h3>
          <div className="space-y-4">
            {process.rounds.map((r, i) => (
              <div key={i} className="border-l-2 border-blue-300 pl-5 relative">
                <div className="absolute -left-1.5 top-1 w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h4 className="font-semibold text-gray-900">
                    Round {r.round_number}: {r.name}
                  </h4>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{r.type}</span>
                  {r.duration && <span className="text-xs text-gray-500">• {r.duration}</span>}
                  {r.difficulty && <span className="text-xs text-gray-500">• {r.difficulty}</span>}
                </div>
                <p className="text-sm text-gray-700 mb-2">{r.description}</p>

                {r.what_to_expect.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">What to Expect</p>
                    <ul className="text-sm text-gray-700 space-y-0.5">
                      {r.what_to_expect.map((w, j) => (
                        <li key={j} className="flex gap-2"><span className="text-blue-600">•</span> {w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {r.topics_covered.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Topics</p>
                    <div className="flex flex-wrap gap-1.5">
                      {r.topics_covered.map((t, j) => (
                        <span key={j} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {r.tips.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Tips</p>
                    <ul className="text-sm text-gray-700 space-y-0.5">
                      {r.tips.map((t, j) => (
                        <li key={j} className="flex gap-2"><span className="text-amber-600">💡</span> {t}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {process.package_info && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-0.5">Package</p>
            <p className="text-sm text-gray-900 font-medium">{process.package_info}</p>
          </div>
        )}
        {process.bond_info && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-0.5">Bond</p>
            <p className="text-sm text-gray-900 font-medium">{process.bond_info}</p>
          </div>
        )}
        {process.timeline && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 md:col-span-2">
            <p className="text-xs text-gray-500 mb-0.5">Timeline</p>
            <p className="text-sm text-gray-900">{process.timeline}</p>
          </div>
        )}
      </section>

      {process.important_notes.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Important Notes</h3>
          <ul className="space-y-1.5">
            {process.important_notes.map((n, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                <span className="text-orange-600">⚠</span> {n}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}