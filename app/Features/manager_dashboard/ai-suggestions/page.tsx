'use client';

import { useState } from 'react';
import { apiFetch, apiPost } from '@/lib/api';

type Task = { task_id: string; task_title: string };

type Candidate = {
  company_member_id: string;
  full_name: string;
  employee_type: string | null;
  role: string;
  remaining_eligible_hours: number | null;
};

type TaskSuggestion = { task_id: string; task_title: string; candidates: Candidate[] };

export default function AiSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);

  const [applying, setApplying] = useState<string | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());

  async function generateSuggestions() {
    setLoading(true);
    setError('');
    try {
      const tasksResult = await apiFetch<{ tasks: Task[] }>('/api/manager/tasks?status=open');
      if (!tasksResult.success) {
        setError(tasksResult.message || 'Failed to load open tasks.');
        return;
      }

      const openTasks = tasksResult.tasks || [];

      const results = await Promise.all(
        openTasks.map(async (task) => {
          const result = await apiFetch<{ suggestions: Candidate[] }>(
            `/api/manager/tasks/${task.task_id}/suggestions`
          );
          return {
            task_id: task.task_id,
            task_title: task.task_title,
            candidates: result.success ? (result.suggestions || []).slice(0, 5) : [],
          };
        })
      );

      setSuggestions(results.filter((r) => r.candidates.length > 0));
      setGenerated(true);
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }

  async function applySuggestion(taskId: string, candidate: Candidate) {
    const key = `${taskId}-${candidate.company_member_id}`;
    setApplying(key);
    try {
      const result = await apiPost(`/api/manager/tasks/${taskId}/assign`, {
        assigned_to: candidate.company_member_id,
      });
      if (result.success) {
        setApplied((prev) => new Set([...prev, key]));
      } else {
        setError(result.message || 'Failed to apply suggestion.');
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setApplying(null);
    }
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
            <h2 className="text-xl font-bold text-slate-900">Allocation Suggestions</h2>
          </div>
          <p className="text-slate-500 text-sm max-w-lg">
            Find eligible staff for each open task based on skillset, availability, hours cap, and conflicts. Review and apply with one click.
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
          <p className="text-slate-500 font-medium">Click &quot;Generate Suggestions&quot; to find matches for open tasks.</p>
          <p className="text-slate-400 text-sm mt-1">Checks skillsets, availability, and hour caps.</p>
        </div>
      )}

      {generated && suggestions.length === 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 px-8 py-12 text-center text-slate-500">
          No suggestions available. All open tasks may lack an eligible staff member, or there are no open tasks.
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-4">
          {suggestions.map((taskSuggestion) => (
            <div key={taskSuggestion.task_id} className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
              <p className="text-sm font-bold text-slate-900 mb-3">{taskSuggestion.task_title}</p>
              <div className="space-y-2">
                {taskSuggestion.candidates.map((candidate) => {
                  const key = `${taskSuggestion.task_id}-${candidate.company_member_id}`;
                  const isApplied = applied.has(key);
                  return (
                    <div key={key} className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 ${isApplied ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200'}`}>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{candidate.full_name}</p>
                        <p className="text-xs text-slate-500 capitalize">
                          {candidate.role.replace(/_/g, ' ')}
                          {candidate.employee_type ? ` · ${candidate.employee_type.replace(/_/g, ' ')}` : ''}
                          {candidate.remaining_eligible_hours != null ? ` · ${candidate.remaining_eligible_hours}h remaining` : ''}
                        </p>
                      </div>
                      {isApplied ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-1 text-xs font-bold shrink-0">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          Applied
                        </span>
                      ) : (
                        <button
                          onClick={() => applySuggestion(taskSuggestion.task_id, candidate)}
                          disabled={applying === key}
                          className="flex-shrink-0 rounded-xl bg-slate-900 hover:bg-slate-700 text-white px-4 py-2 text-xs font-semibold shadow-sm transition-all disabled:opacity-60"
                        >
                          {applying === key ? 'Applying...' : 'Apply'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
