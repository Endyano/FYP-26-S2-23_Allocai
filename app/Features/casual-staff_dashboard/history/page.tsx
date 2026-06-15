'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Task = {
  id: number;
  task_name: string;
  task_date: string;
  start_time: string;
  end_time: string;
  status: string;
  department_name_label: string | null;
};

function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function calcHours(start: string, end: string) {
  if (!start || !end) return '—';
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff < 0) diff += 24 * 60;
  return (diff / 60).toFixed(1);
}

export default function HistoryPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeDispute, setActiveDispute] = useState<Task | null>(null);
  const [correctHours, setCorrectHours] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [disputeError, setDisputeError] = useState('');
  const [disputedIds, setDisputedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch(`${API_URL}/api/casual_staff/tasks`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const completed = (data.tasks || []).filter((t: Task) => t.status === 'Completed');
          setTasks(completed);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function openDispute(task: Task) {
    setActiveDispute(task);
    setCorrectHours('');
    setDisputeReason('');
    setDisputeError('');
  }

  async function submitDispute() {
    if (!activeDispute) return;
    if (!disputeReason.trim()) {
      setDisputeError('Please enter a reason for the dispute.');
      return;
    }
    setSubmitting(true);
    setDisputeError('');
    try {
      const res = await fetch(`${API_URL}/api/casual_staff/tasks/${activeDispute.id}/dispute`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: disputeReason.trim(),
          claimed_hours: correctHours ? parseFloat(correctHours) : null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDisputedIds(prev => new Set([...prev, activeDispute.id]));
        setActiveDispute(null);
        setCorrectHours('');
        setDisputeReason('');
      } else {
        setDisputeError(data.message || 'Failed to submit dispute.');
      }
    } catch {
      setDisputeError('Could not reach the server.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Task</th>
                <th className="px-6 py-4 font-semibold">Department</th>
                <th className="px-6 py-4 font-semibold">Hours</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400 animate-pulse">Loading history...</td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">No completed tasks yet.</td>
                </tr>
              ) : tasks.map(task => (
                <tr key={task.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-500">{formatDate(task.task_date)}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{task.task_name}</td>
                  <td className="px-6 py-4 text-slate-600">{task.department_name_label || '—'}</td>
                  <td className="px-6 py-4 text-slate-600">{calcHours(task.start_time, task.end_time)} h</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Completed
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {disputedIds.has(task.id) ? (
                      <span className="text-xs font-semibold text-amber-600">Disputed</span>
                    ) : (
                      <button
                        onClick={() => openDispute(task)}
                        className="rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-200 shadow-sm transition-all"
                      >
                        File Dispute
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activeDispute && (
        <div className="rounded-2xl bg-white p-8 shadow-md border border-slate-200 animate-[fadeIn_0.2s_ease-out] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />

          <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Hour Dispute Request</h3>
              <p className="text-sm text-slate-500 mt-1">
                Disputing record for <span className="font-semibold text-slate-700">{activeDispute.task_name}</span> ({formatDate(activeDispute.task_date)})
              </p>
            </div>
            <button
              onClick={() => setActiveDispute(null)}
              className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 max-w-xl">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Correct Hours <span className="text-slate-400 font-normal">(optional — recorded: {calcHours(activeDispute.start_time, activeDispute.end_time)}h)</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={correctHours}
                onChange={e => setCorrectHours(e.target.value)}
                placeholder="e.g. 5.0"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Reason for Dispute <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={disputeReason}
                onChange={e => setDisputeReason(e.target.value)}
                placeholder="Explain why the tracked hours are incorrect..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all resize-none"
              />
            </div>

            {disputeError && (
              <p className="text-sm text-rose-600 font-medium">{disputeError}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={submitDispute}
                disabled={submitting}
                className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 shadow-md shadow-slate-900/10 active:scale-95 disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit Dispute'}
              </button>
              <button
                onClick={() => setActiveDispute(null)}
                disabled={submitting}
                className="rounded-xl bg-white border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
