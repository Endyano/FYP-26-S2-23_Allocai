'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type Task = {
  allocation_id: string;
  task_title: string;
  task_description: string | null;
  task_date: string;
  start_time: string;
  end_time: string;
  priority_level: string;
  allocation_status: string;
  department_name: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
  accepted:  'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20',
  completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
  declined:  'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20',
  cancelled: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20',
};
const STATUS_DOTS: Record<string, string> = {
  pending: 'bg-amber-500', accepted: 'bg-indigo-500', completed: 'bg-emerald-500',
  declined: 'bg-rose-500', cancelled: 'bg-rose-500',
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
function calcHours(start: string, end: string) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff < 0) diff += 24 * 60;
  return (diff / 60).toFixed(1);
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [confirmCancel, setConfirmCancel] = useState<Task | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  async function loadTasks() {
    setLoading(true);
    const result = await apiFetch<{ schedule?: Task[]; success: boolean; message?: string }>('/api/part-time-staff/schedule');
    if (result.success) {
      setTasks(result.schedule ?? []);
      setError('');
    } else {
      setError(result.message || 'Failed to load tasks.');
    }
    setLoading(false);
  }

  useEffect(() => { loadTasks(); }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) { loadTasks(); return; }
    setLoading(true);
    const result = await apiFetch<{ tasks?: Task[]; success: boolean; message?: string }>(
      `/api/part-time-staff/tasks/search?search=${encodeURIComponent(searchQuery.trim())}`
    );
    if (result.success) {
      setTasks(result.tasks ?? []);
      setError('');
    } else {
      setError(result.message || 'Search failed.');
    }
    setLoading(false);
  }

  async function respond(allocationId: string, action: 'accepted' | 'declined') {
    setProcessingId(allocationId);
    const result = await apiFetch<{ success: boolean; message?: string }>(
      `/api/part-time-staff/allocations/${allocationId}/respond`,
      { method: 'PATCH', body: JSON.stringify({ action }) }
    );
    if (result.success) {
      loadTasks();
    } else {
      setError(result.message || 'Action failed.');
    }
    setProcessingId(null);
  }

  async function completeTask(allocationId: string) {
    setProcessingId(allocationId);
    const result = await apiFetch<{ success: boolean; message?: string }>(
      `/api/part-time-staff/allocations/${allocationId}/complete`,
      { method: 'PATCH' }
    );
    if (result.success) {
      loadTasks();
    } else {
      setError(result.message || 'Action failed.');
    }
    setProcessingId(null);
  }

  async function submitCancellation() {
    if (!confirmCancel) return;
    if (!cancelReason.trim()) { setCancelError('Please provide a reason for cancelling.'); return; }
    setCancelSubmitting(true); setCancelError('');
    const result = await apiFetch<{ success: boolean; message?: string }>(
      `/api/part-time-staff/allocations/${confirmCancel.allocation_id}/cancellation-request`,
      { method: 'POST', body: JSON.stringify({ reason: cancelReason.trim() }) }
    );
    if (result.success) {
      setConfirmCancel(null);
      setCancelReason('');
      loadTasks();
    } else {
      setCancelError(result.message || 'Failed to submit cancellation request.');
    }
    setCancelSubmitting(false);
  }

  const statuses = ['All', 'pending', 'accepted', 'completed', 'declined', 'cancelled'];
  const filtered = tasks.filter(t => activeFilter === 'All' || t.allocation_status === activeFilter);
  const counts = statuses.reduce((acc, s) => {
    acc[s] = s === 'All' ? tasks.length : tasks.filter(t => t.allocation_status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">

      {/* Search + filter bar */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-1 items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm border border-slate-200">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>
        <button type="submit" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors shadow-sm">Search</button>
        {searchQuery && (
          <button type="button" onClick={() => { setSearchQuery(''); loadTasks(); }} className="rounded-2xl bg-white border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Clear</button>
        )}
      </form>

      <div className="flex gap-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 flex-wrap w-fit">
        {statuses.map(s => (
          <button key={s} onClick={() => setActiveFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${activeFilter === s ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            {s} <span className="opacity-60">({counts[s]})</span>
          </button>
        ))}
      </div>

      {error && <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium">{error}</div>}

      {/* Tasks table */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Task</th>
                <th className="px-6 py-4 font-semibold">Department</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Time</th>
                <th className="px-6 py-4 font-semibold">Hrs</th>
                <th className="px-6 py-4 font-semibold">Priority</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-slate-400 animate-pulse">Loading tasks...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-slate-500">{searchQuery ? `No tasks matching "${searchQuery}"` : 'No tasks found.'}</td></tr>
              ) : filtered.map(task => (
                <tr key={task.allocation_id} className="transition-colors hover:bg-slate-50 group">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{task.task_title}</p>
                    {task.task_description && <p className="text-xs text-slate-400 mt-0.5 max-w-[160px] truncate">{task.task_description}</p>}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{task.department_name || '—'}</td>
                  <td className="px-6 py-4 text-slate-600">{formatDate(task.task_date)}</td>
                  <td className="px-6 py-4 text-slate-600">{formatTime(task.start_time)} – {formatTime(task.end_time)}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{calcHours(task.start_time, task.end_time)}h</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      task.priority_level === 'high' ? 'bg-rose-50 text-rose-700' :
                      task.priority_level === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                    }`}>{task.priority_level || '—'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[task.allocation_status] || 'bg-slate-100 text-slate-600'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOTS[task.allocation_status] || 'bg-slate-400'}`} />
                      {task.allocation_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {task.allocation_status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => respond(task.allocation_id, 'accepted')}
                          disabled={processingId === task.allocation_id}
                          className="rounded-md bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-600 px-3 py-1.5 text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                        >Accept</button>
                        <button
                          onClick={() => respond(task.allocation_id, 'declined')}
                          disabled={processingId === task.allocation_id}
                          className="rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all disabled:opacity-50"
                        >Decline</button>
                      </div>
                    )}
                    {task.allocation_status === 'accepted' && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => completeTask(task.allocation_id)}
                          disabled={processingId === task.allocation_id}
                          className="rounded-md bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                        >Complete</button>
                        <button
                          onClick={() => { setConfirmCancel(task); setCancelReason(''); setCancelError(''); }}
                          disabled={processingId === task.allocation_id}
                          className="rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-200 shadow-sm transition-all disabled:opacity-50"
                        >Cancel</button>
                      </div>
                    )}
                    {(task.allocation_status === 'completed' || task.allocation_status === 'declined' || task.allocation_status === 'cancelled') && (
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel confirmation modal */}
      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white px-8 py-8 rounded-3xl shadow-2xl w-full max-w-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 mb-4">
              <svg className="w-7 h-7 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1 text-center">Request Cancellation</h3>
            <p className="text-center text-sm font-semibold text-slate-700 mb-1">{confirmCancel.task_title}</p>
            <p className="text-center text-xs text-slate-500 mb-4">Your request will be sent to your manager for approval.</p>
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={e => { setCancelReason(e.target.value); setCancelError(''); }}
                placeholder="Please explain why you are cancelling this task..."
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 resize-none"
              />
              {cancelError && <p className="mt-1.5 text-xs font-medium text-rose-600">{cancelError}</p>}
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={submitCancellation}
                disabled={cancelSubmitting}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
              >
                {cancelSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
              <button
                onClick={() => { setConfirmCancel(null); setCancelReason(''); setCancelError(''); }}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold py-3 rounded-xl transition-colors"
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
