'use client';

import type { CompanyDetails } from '@/types';

interface Props { details: CompanyDetails }

export default function CompanyDetailsTab({ details }: Props): React.JSX.Element {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Overview</h3>
        <p className="text-gray-700 leading-relaxed">{details.overview}</p>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {details.founded_year && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-0.5">Founded</p>
            <p className="text-sm text-gray-900 font-medium">{details.founded_year}</p>
          </div>
        )}
        {details.founder && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-0.5">Founder</p>
            <p className="text-sm text-gray-900 font-medium">{details.founder}</p>
          </div>
        )}
        {details.ceo && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-0.5">CEO</p>
            <p className="text-sm text-gray-900 font-medium">{details.ceo}</p>
          </div>
        )}
        {details.headquarters && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-0.5">HQ</p>
            <p className="text-sm text-gray-900 font-medium">{details.headquarters}</p>
          </div>
        )}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-0.5">Industry</p>
          <p className="text-sm text-gray-900 font-medium">{details.industry}</p>
        </div>
        {details.size && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-0.5">Size</p>
            <p className="text-sm text-gray-900 font-medium">{details.size}</p>
          </div>
        )}
        {details.website && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-0.5">Website</p>
            <a href={details.website} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline truncate block">
              Visit →
            </a>
          </div>
        )}
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">What They Do</h3>
        <p className="text-gray-700 leading-relaxed">{details.what_they_do}</p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Focus</h3>
        <p className="text-gray-700 leading-relaxed">{details.current_focus}</p>
      </section>

      {details.key_products.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Products & Services</h3>
          <div className="flex flex-wrap gap-2">
            {details.key_products.map((p, i) => (
              <span key={i} className="text-sm bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-md">
                {p}
              </span>
            ))}
          </div>
        </section>
      )}

      {details.notable_clients.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Notable Clients</h3>
          <div className="flex flex-wrap gap-2">
            {details.notable_clients.map((c, i) => (
              <span key={i} className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded-md">
                {c}
              </span>
            ))}
          </div>
        </section>
      )}

      {details.competitors.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Competitors</h3>
          <div className="flex flex-wrap gap-2">
            {details.competitors.map((c, i) => (
              <span key={i} className="text-sm bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 rounded-md">
                {c}
              </span>
            ))}
          </div>
        </section>
      )}

      {details.culture_and_values.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Culture & Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {details.culture_and_values.map((v, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-3 bg-gray-50/50">
                <h4 className="font-medium text-gray-900 text-sm mb-1">{v.name}</h4>
                <p className="text-xs text-gray-600">{v.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {details.recent_news.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent News</h3>
          <div className="space-y-2">
            {details.recent_news.map((n, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-3 bg-gray-50/50">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 text-sm">{n.title}</h4>
                  {n.date && <span className="text-xs text-gray-500 flex-shrink-0">{n.date}</span>}
                </div>
                <p className="text-sm text-gray-700">{n.summary}</p>
                {n.url && (
                  <a href={n.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                    Read more →
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {details.interesting_facts.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Interesting Facts</h3>
          <ul className="space-y-1.5">
            {details.interesting_facts.map((f, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                <span className="text-yellow-600">✨</span> {f}
              </li>
            ))}
          </ul>
        </section>
      )}

      {details.why_work_here.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Why Work Here</h3>
          <ul className="space-y-1.5">
            {details.why_work_here.map((w, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                <span className="text-green-600">✓</span> {w}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}