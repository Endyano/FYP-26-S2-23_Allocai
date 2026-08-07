'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type HistoryEntry = {
  allocation_id: string;
  allocation_status: string;
  completed_at: string | null;
  task_id: string;
  task_title: string;
  task_date: string;
  start_time: string;
  end_time: string;
  department_name: string | null;
};

type WorkingHourRecord = {
  working_hour_id: string;
  task_id: string;
  hours_worked: number;
  record_status: string;
};

function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatTime(t: string) {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

export default function FTHistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHourRecord[]>([]);
  const [disputedTaskIds, setDisputedTaskIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [monthFilter, setMonthFilter] = useState('');

  const [activeDispute, setActiveDispute] = useState<HistoryEntry | null>(null);
  const [correctHours, setCorrectHours] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [disputeError, setDisputeError] = useState('');

  useEffect(() => {
    async function loadHistory() {
      const [historyResult, hoursResult, disputesResult] = await Promise.all([
        apiFetch<{ history?: HistoryEntry[]; success: boolean; message?: string }>('/api/full-time-staff/tasks/history'),
        apiFetch<{ working_hours?: WorkingHourRecord[] }>('/api/full-time-staff/working-hours'),
        apiFetch<{ disputes?: { task_id: string }[] }>('/api/full-time-staff/disputes'),
      ]);
      if (historyResult.success) {
        setHistory(historyResult.history ?? []);
      } else {
        setError(historyResult.message || 'Failed to load history.');
      }
      setWorkingHours(hoursResult.working_hours ?? []);
      setDisputedTaskIds(new Set((disputesResult.disputes ?? []).map(d => d.task_id)));
      setLoading(false);
    }
    loadHistory();
  }, []);

  function workingHourFor(taskId: string) {
    return workingHours.find(w => w.task_id === taskId) || null;
  }

  function openDispute(entry: HistoryEntry) {
    setActiveDispute(entry);
    setCorrectHours('');
    setDisputeReason('');
    setDisputeError('');
  }

  async function submitDispute() {
    if (!activeDispute) return;
    const record = workingHourFor(activeDispute.task_id);
    if (!record) return;
    if (!disputeReason.trim()) {
      setDisputeError('Please enter a reason for the dispute.');
      return;
    }
    setSubmitting(true);
    setDisputeError('');
    const result = await apiFetch<{ success: boolean; message?: string }>(
      `/api/full-time-staff/working-hours/${record.working_hour_id}/disputes`,
      {
        method: 'POST',
        body: JSON.stringify({
          reason: disputeReason.trim(),
          requested_hours: correctHours ? parseFloat(correctHours) : record.hours_worked,
        }),
      }
    );
    if (result.success) {
      setDisputedTaskIds(prev => new Set([...prev, activeDispute.task_id]));
      setActiveDispute(null);
      setCorrectHours('');
      setDisputeReason('');
    } else {
      setDisputeError(result.message || 'Failed to submit dispute.');
    }
    setSubmitting(false);
  }

  const months = Array.from(new Set(history.map(h => h.task_date?.slice(0, 7)).filter(Boolean))).sort().reverse();

  const filtered = monthFilter
    ? history.filter(h => h.task_date?.startsWith(monthFilter))
    : history;

  const completedCount = filtered.filter(h => h.allocation_status === 'completed').length;
  const cancelledCount = filtered.filter(h => h.allocation_status === 'cancelled' || h.allocation_status === 'declined').length;

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Records', value: filtered.length, accent: 'border-t-slate-400' },
          { label: 'Completed', value: completedCount, accent: 'border-t-emerald-500' },
          { label: 'Declined / Cancelled', value: cancelledCount, accent: 'border-t-rose-500' },
        ].map(card => (
          <div key={card.label} className={`rounded-2xl bg-white p-5 shadow-sm border border-slate-200 border-t-4 ${card.accent}`}>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
            <p className="text-3xl font-black text-slate-900 mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold text-slate-600">Filter by month:</label>
        <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 outline-none focus:border-emerald-400 shadow-sm"
        >
          <option value="">All months</option>
          {months.map(m => {
            const [y, mo] = m.split('-');
            const label = new Date(Number(y), Number(mo) - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' });
            return <option key={m} value={m}>{label}</option>;
          })}
        </select>
      </div>

      {error && <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium">{error}</div>}

      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Task</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Time</th>
                <th className="px-6 py-4 font-semibold">Department</th>
                <th className="px-6 py-4 font-semibold">Recorded Hours</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400 animate-pulse">Loading history...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">No working history yet.</td></tr>
              ) : filtered.map(entry => {
                const record = workingHourFor(entry.task_id);
                const disputed = disputedTaskIds.has(entry.task_id);
                return (
                  <tr key={entry.allocation_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{entry.task_title}</td>
                    <td className="px-6 py-4 text-slate-600">{formatDate(entry.task_date)}</td>
                    <td className="px-6 py-4 text-slate-600">{formatTime(entry.start_time)} – {formatTime(entry.end_time)}</td>
                    <td className="px-6 py-4 text-slate-600">{entry.department_name || '—'}</td>
                    <td className="px-6 py-4 text-slate-600">{record ? `${record.hours_worked}h` : '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                        entry.allocation_status === 'completed' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' :
                        entry.allocation_status === 'cancelled' || entry.allocation_status === 'declined' ? 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20' :
                        'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20'
                      }`}>{entry.allocation_status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {entry.allocation_status !== 'completed' ? (
                        <span className="text-xs text-slate-400">—</span>
                      ) : disputed ? (
                        <span className="text-xs font-semibold text-amber-600">Disputed</span>
                      ) : !record ? (
                        <span className="text-xs text-slate-400 italic">Hours not yet recorded</span>
                      ) : (
                        <button
                          onClick={() => openDispute(entry)}
                          className="rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-200 shadow-sm transition-all"
                        >
                          File Dispute
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {activeDispute && (() => {
        const record = workingHourFor(activeDispute.task_id);
        return (
          <div className="rounded-2xl bg-white p-8 shadow-md border border-slate-200 animate-[fadeIn_0.2s_ease-out] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />

            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Hour Dispute Request</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Disputing record for <span className="font-semibold text-slate-700">{activeDispute.task_title}</span> ({formatDate(activeDispute.task_date)})
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
                  Correct Hours <span className="text-slate-400 font-normal">(optional — recorded: {record?.hours_worked ?? '—'}h)</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={correctHours}
                  onChange={e => setCorrectHours(e.target.value)}
                  placeholder="e.g. 8.0"
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
                  placeholder="Explain why the tracked hours are incorrect (e.g. unrecorded overtime)..."
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
        );
      })()}
    </div>
  );
}
