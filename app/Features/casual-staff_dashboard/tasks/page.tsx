'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Task = {
  id: number;
  task_name: string;
  description: string;
  task_date: string;
  start_time: string;
  end_time: string;
  priority: string;
  status: string;
  department_name_label: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  Approved:                 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20',
  Completed:                'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
  Cancelled:                'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20',
  Pending:                  'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
  'Cancellation Requested': 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20',
};

const DOT_STYLES: Record<string, string> = {
  Approved:                 'bg-indigo-500',
  Completed:                'bg-emerald-500',
  Cancelled:                'bg-rose-500',
  Pending:                  'bg-amber-500',
  'Cancellation Requested': 'bg-orange-500',
};

function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(t: string) {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
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
  const [activeFilter, setActiveFilter] = useState<'All' | 'Approved' | 'Completed' | 'Cancelled' | 'Cancellation Requested'>('All');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<Task | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');

  const [disputeTask, setDisputeTask] = useState<Task | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeHours, setDisputeHours] = useState('');
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);
  const [disputeError, setDisputeError] = useState('');
  const [disputeSuccess, setDisputeSuccess] = useState<number | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/casual_staff/tasks`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks || []);
      } else {
        setError(data.message || 'Could not load tasks.');
      }
    } catch {
      setError('Could not reach the server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  async function completeTask(taskId: number) {
    setProcessingId(taskId);
    try {
      const res = await fetch(`${API_URL}/api/casual_staff/tasks/${taskId}/complete`, {
        method: 'PATCH',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'Completed' } : t));
      }
    } catch {
      // silently fail
    } finally {
      setProcessingId(null);
    }
  }

  async function cancelTask(taskId: number) {
    if (!cancelReason.trim()) {
      setCancelError('Please provide a reason for cancelling.');
      return;
    }
    setProcessingId(taskId);
    setCancelError('');
    try {
      const res = await fetch(`${API_URL}/api/casual_staff/tasks/${taskId}/cancel`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'Cancellation Requested' } : t));
        setCancelReason('');
        setConfirmCancel(null);
      } else {
        setCancelError(data.message || 'Failed to cancel task.');
      }
    } catch {
      setCancelError('Could not reach the server.');
    } finally {
      setProcessingId(null);
    }
  }

  async function submitDispute() {
    if (!disputeTask) return;
    if (!disputeReason.trim()) {
      setDisputeError('Please enter a reason for the dispute.');
      return;
    }
    setDisputeSubmitting(true);
    setDisputeError('');
    try {
      const res = await fetch(`${API_URL}/api/casual_staff/tasks/${disputeTask.id}/dispute`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: disputeReason.trim(),
          claimed_hours: disputeHours ? parseFloat(disputeHours) : null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDisputeSuccess(disputeTask.id);
        setDisputeTask(null);
        setDisputeReason('');
        setDisputeHours('');
      } else {
        setDisputeError(data.message || 'Failed to submit dispute.');
      }
    } catch {
      setDisputeError('Could not reach the server.');
    } finally {
      setDisputeSubmitting(false);
    }
  }

  function openDisputeModal(task: Task) {
    setDisputeTask(task);
    setDisputeReason('');
    setDisputeHours('');
    setDisputeError('');
  }

  const filtered = tasks.filter(t => {
    const matchesSearch = t.task_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || t.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const counts = {
    All: tasks.length,
    Approved: tasks.filter(t => t.status === 'Approved').length,
    Completed: tasks.filter(t => t.status === 'Completed').length,
    Cancelled: tasks.filter(t => t.status === 'Cancelled').length,
    'Cancellation Requested': tasks.filter(t => t.status === 'Cancellation Requested').length,
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
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

        <div className="flex gap-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 flex-wrap">
          {(['All', 'Approved', 'Completed', 'Cancelled', 'Cancellation Requested'] as const).map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === f
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {f} <span className="opacity-60">({counts[f]})</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium">{error}</div>
      )}

      {disputeSuccess !== null && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 font-medium flex items-center justify-between">
          <span>Dispute submitted successfully. The manager will review it shortly.</span>
          <button onClick={() => setDisputeSuccess(null)} className="ml-4 text-emerald-500 hover:text-emerald-700">✕</button>
        </div>
      )}

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
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-slate-400 animate-pulse">Loading tasks...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-slate-500">
                    {searchQuery ? `No tasks matching "${searchQuery}"` : 'No tasks found.'}
                  </td>
                </tr>
              ) : (
                filtered.map(task => (
                  <tr key={task.id} className="transition-colors hover:bg-slate-50 group">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{task.task_name}</p>
                      {task.description && (
                        <p className="text-xs text-slate-400 mt-0.5 max-w-[160px] truncate">{task.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{task.department_name_label || '—'}</td>
                    <td className="px-6 py-4 text-slate-600">{formatDate(task.task_date)}</td>
                    <td className="px-6 py-4 text-slate-600">{formatTime(task.start_time)} – {formatTime(task.end_time)}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{calcHours(task.start_time, task.end_time)}h</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        task.priority === 'High'   ? 'bg-rose-50 text-rose-700' :
                        task.priority === 'Medium' ? 'bg-amber-50 text-amber-700' :
                                                     'bg-slate-100 text-slate-600'
                      }`}>{task.priority}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[task.status] || 'bg-slate-100 text-slate-600'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[task.status] || 'bg-slate-400'}`} />
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {task.status === 'Approved' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => completeTask(task.id)}
                            disabled={processingId === task.id}
                            className="rounded-md bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-600 px-3 py-1.5 text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                          >
                            {processingId === task.id ? '...' : 'Complete'}
                          </button>
                          <button
                            onClick={() => setConfirmCancel(task)}
                            disabled={processingId === task.id}
                            className="rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-200 shadow-sm transition-all disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      {task.status === 'Completed' && (
                        <div className="flex justify-end gap-2 items-center">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Done</span>
                          {disputeSuccess !== task.id && (
                            <button
                              onClick={() => openDisputeModal(task)}
                              className="rounded-md bg-white border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 shadow-sm transition-all"
                            >
                              Dispute
                            </button>
                          )}
                          {disputeSuccess === task.id && (
                            <span className="text-xs font-semibold text-emerald-600">Disputed</span>
                          )}
                        </div>
                      )}
                      {task.status === 'Cancellation Requested' && (
                        <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">Awaiting approval</span>
                      )}
                      {task.status === 'Cancelled' && (
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cancelled</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
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
            <p className="text-center text-sm font-semibold text-slate-700 mb-1">{confirmCancel.task_name}</p>
            <p className="text-center text-xs text-slate-500 mb-4">Your request will be sent to the department for approval.</p>
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
                onClick={() => cancelTask(confirmCancel.id)}
                disabled={processingId === confirmCancel.id}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
              >
                {processingId === confirmCancel.id ? 'Submitting...' : 'Submit Request'}
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

      {/* Dispute modal */}
      {disputeTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white px-8 py-8 rounded-3xl shadow-2xl w-full max-w-md">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 mb-5">
              <svg className="w-6 h-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1 text-center">Raise a Dispute</h3>
            <p className="text-center text-sm text-slate-500 mb-6">
              <span className="font-semibold text-slate-700">{disputeTask.task_name}</span>
              {' · '}{calcHours(disputeTask.start_time, disputeTask.end_time)}h recorded
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Reason for dispute <span className="text-rose-500">*</span></label>
                <textarea
                  value={disputeReason}
                  onChange={e => setDisputeReason(e.target.value)}
                  placeholder="Describe the issue with the recorded hours or task details..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Claimed hours <span className="text-slate-400 font-normal">(optional)</span></label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={disputeHours}
                  onChange={e => setDisputeHours(e.target.value)}
                  placeholder="e.g. 4.5"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                />
              </div>
            </div>

            {disputeError && (
              <p className="mt-4 text-sm text-rose-600 font-medium">{disputeError}</p>
            )}

            <div className="flex flex-col gap-3 mt-6">
              <button
                onClick={submitDispute}
                disabled={disputeSubmitting}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
              >
                {disputeSubmitting ? 'Submitting...' : 'Submit Dispute'}
              </button>
              <button
                onClick={() => setDisputeTask(null)}
                disabled={disputeSubmitting}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold py-3 rounded-xl transition-colors"
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
