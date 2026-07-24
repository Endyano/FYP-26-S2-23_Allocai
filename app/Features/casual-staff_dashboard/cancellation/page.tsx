'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Task = { id: string; task_name: string; task_date: string; start_time: string; end_time: string; status: string };
type CancellationRequest = {
  id: string;
  task_name: string;
  task_date: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  manager_note: string | null;
  created_at: string;
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

export default function PTCancellationPage() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', task_name: 'Warehouse Restocking', task_date: '2026-06-25', start_time: '08:00', end_time: '12:00', status: 'Approved' },
    { id: '2', task_name: 'Loading Dock Help', task_date: '2026-06-26', start_time: '07:00', end_time: '10:00', status: 'Approved' },
  ]);
  const [requests, setRequests] = useState<CancellationRequest[]>([
    { id: 'CR001', task_name: 'Customer Returns Sorting', task_date: '2026-06-22', reason: 'Had a prior commitment.', status: 'Approved', manager_note: 'OK this time.', created_at: '2026-06-21' },
  ]);
  const [loading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  async function submitRequest() {
    if (!selectedTaskId || !reason.trim()) { setFormError('Please select a task and provide a reason.'); return; }
    setSubmitting(true); setFormError(''); setFormSuccess('');
    try {
      const res = await fetch(`${API_URL}/api/casual/cancellations`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: selectedTaskId, reason }),
      });
      const d = await res.json();
      if (d.success) {
        setRequests(prev => [d.request, ...prev]);
        setFormSuccess('Cancellation request submitted successfully.');
        setShowForm(false);
        setSelectedTaskId(''); setReason('');
      } else { setFormError(d.message || 'Failed to submit.'); }
    } catch { setFormError('Could not reach the server.'); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">

      {formSuccess && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 font-medium">{formSuccess}</div>}

      {/* Request form */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Request Task Cancellation</h2>
            <p className="text-sm text-slate-500 mt-0.5">Submit a request to cancel an assigned task.</p>
          </div>
          <button onClick={() => { setShowForm(!showForm); setFormError(''); }}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors shadow-sm ${showForm ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-violet-600 text-white hover:bg-violet-700'}`}
          >{showForm ? 'Cancel' : 'New Request'}</button>
        </div>

        {showForm && (
          <div className="p-6 border-b border-slate-100 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Task <span className="text-rose-500">*</span></label>
              <select value={selectedTaskId} onChange={e => setSelectedTaskId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
              >
                <option value="">— Select a task —</option>
                {tasks.map(t => (
                  <option key={t.id} value={t.id}>{t.task_name} · {formatDate(t.task_date)} {formatTime(t.start_time)}–{formatTime(t.end_time)}</option>
                ))}
              </select>
              {tasks.length === 0 && <p className="text-xs text-slate-400 mt-1">No active tasks available to cancel.</p>}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reason <span className="text-rose-500">*</span></label>
              <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
                placeholder="Please explain why you need to cancel this task..."
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all resize-none"
              />
            </div>
            {formError && <p className="text-sm text-rose-600 font-medium">{formError}</p>}
            <button onClick={submitRequest} disabled={submitting}
              className="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 shadow-sm transition-colors disabled:opacity-60"
            >{submitting ? 'Submitting...' : 'Submit Request'}</button>
          </div>
        )}
      </div>

      {/* Past requests */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">My Cancellation Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Task</th>
                <th className="px-6 py-4 font-semibold">Task Date</th>
                <th className="px-6 py-4 font-semibold">Reason</th>
                <th className="px-6 py-4 font-semibold">Manager Note</th>
                <th className="px-6 py-4 font-semibold">Submitted</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 animate-pulse">Loading...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No cancellation requests yet.</td></tr>
              ) : requests.map(req => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{req.task_name}</td>
                  <td className="px-6 py-4 text-slate-600">{formatDate(req.task_date)}</td>
                  <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate">{req.reason}</td>
                  <td className="px-6 py-4 text-slate-400 italic text-xs">{req.manager_note || '—'}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(req.created_at)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      req.status === 'Pending'  ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20' :
                      req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' :
                                                  'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${req.status === 'Pending' ? 'bg-amber-500' : req.status === 'Approved' ? 'bg-emerald-500' : 'bg-rose-500'}`}/>
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
