'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Suggestion = {
  staff_id: string;
  staff_name: string;
  task_id: string;
  task_name: string;
  match_score: number;
  matched_skills: string[];
  available_hours: number;
  reason: string;
};

export default function AiSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);

  const [applying, setApplying] = useState<string | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());

  async function generateSuggestions() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/manager/ai-suggestions`, {
        method: 'POST', credentials: 'include',
      });
      const d = await res.json();
      if (d.success) {
        setSuggestions(d.suggestions || []);
        setGenerated(true);
      } else {
        setError(d.message || 'Failed to generate suggestions.');
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }

  async function applySuggestion(suggestion: Suggestion) {
    const key = `${suggestion.task_id}-${suggestion.staff_id}`;
    setApplying(key);
    try {
      const res = await fetch(`${API_URL}/api/manager/tasks/${suggestion.task_id}/assign`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff_id: suggestion.staff_id }),
      });
      const d = await res.json();
      if (d.success) {
        setApplied(prev => new Set([...prev, key]));
      } else {
        setError(d.message || 'Failed to apply suggestion.');
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setApplying(null);
    }
  }

  function scoreColor(score: number) {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 ring-emerald-600/20';
    if (score >= 60) return 'text-amber-700 bg-amber-50 ring-amber-600/20';
    return 'text-rose-700 bg-rose-50 ring-rose-600/20';
  }

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">

      {/* Header card */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900">AI Allocation Suggestions</h2>
          </div>
          <p className="text-slate-500 text-sm max-w-lg">
            Let AI analyse task requirements and staff skillsets to suggest the best allocation matches. Review and apply suggestions with one click.
          </p>
        </div>
        <button
          onClick={generateSuggestions}
          disabled={loading}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-90 transition-opacity disabled:opacity-60 whitespace-nowrap"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
              Analysing...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 2v4"/><circle cx="18" cy="6" r="3"/></svg>
              Generate Suggestions
            </>
          )}
        </button>
      </div>

      {error && <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium">{error}</div>}

      {/* Results */}
      {!generated && !loading && (
        <div className="rounded-2xl bg-white border border-dashed border-slate-300 px-8 py-16 text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
          </div>
          <p className="text-slate-500 font-medium">Click &quot;Generate Suggestions&quot; to analyse task-staff matches.</p>
          <p className="text-slate-400 text-sm mt-1">The AI will check skillsets, availability, and workload.</p>
        </div>
      )}

      {generated && suggestions.length === 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 px-8 py-12 text-center text-slate-500">
          No suggestions generated. All tasks may already be assigned, or there are no available staff.
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">{suggestions.length} Suggestions</h3>
            <span className="text-xs text-slate-400">{applied.size} applied</span>
          </div>
          {suggestions.map(s => {
            const key = `${s.task_id}-${s.staff_id}`;
            const isApplied = applied.has(key);
            return (
              <div key={key} className={`rounded-2xl bg-white border shadow-sm p-6 transition-all ${isApplied ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${scoreColor(s.match_score)}`}>
                        {s.match_score}% match
                      </span>
                      {isApplied && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-1 text-xs font-bold">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          Applied
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      Assign <span className="text-rose-600">{s.staff_name}</span> to <span className="text-slate-700">{s.task_name}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{s.reason}</p>
                    {s.matched_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {s.matched_skills.map(sk => (
                          <span key={sk} className="rounded-full bg-indigo-50 text-indigo-700 px-2 py-0.5 text-xs font-medium">{sk}</span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-slate-400 mt-2">{s.available_hours}h available this week</p>
                  </div>
                  {!isApplied && (
                    <button
                      onClick={() => applySuggestion(s)}
                      disabled={applying === key}
                      className="flex-shrink-0 rounded-xl bg-slate-900 hover:bg-slate-700 text-white px-4 py-2 text-xs font-semibold shadow-sm transition-all disabled:opacity-60"
                    >
                      {applying === key ? 'Applying...' : 'Apply'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
