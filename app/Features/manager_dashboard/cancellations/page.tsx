'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type CancellationRequest = {
  cancellation_request_id: string;
  requested_by_name: string;
  task_title: string | null;
  task_date: string | null;
  reason: string;
  request_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  manager_note: string | null;
};

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CancellationsPage() {
  const [requests, setRequests] = useState<CancellationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [reviewModal, setReviewModal] = useState<CancellationRequest | null>(null);
  const [note, setNote] = useState('');
  const [resolving, setResolving] = useState(false);

  async function loadRequests() {
    setLoading(true);
    setError('');
    const result = await apiFetch<{ cancellation_requests: CancellationRequest[] }>('/api/manager/cancellation-requests');
    if (result.success) setRequests(result.cancellation_requests || []);
    else setError(result.message || 'Could not load requests.');
    setLoading(false);
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function resolve(action: 'approved' | 'rejected') {
    if (!reviewModal) return;
    setResolving(true);
    try {
      const result = await apiFetch(
        `/api/manager/cancellation-requests/${reviewModal.cancellation_request_id}/resolve`,
        { method: 'PATCH', body: JSON.stringify({ action, manager_note: note }) }
      );
      if (result.success) {
        setReviewModal(null);
        setNote('');
        await loadRequests();
      }
    } catch {}
    finally { setResolving(false); }
  }

  const statuses = ['All', 'pending', 'approved', 'rejected'];
  const counts = statuses.reduce((acc, s) => {
    acc[s] = s === 'All' ? requests.length : requests.filter(r => r.request_status === s).length;
    return acc;
  }, {} as Record<string, number>);
  const filtered = statusFilter === 'All' ? requests : requests.filter(r => r.request_status === statusFilter);
  const pendingCount = requests.filter(r => r.request_status === 'pending').length;

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">

      {/* Filter tabs */}
      <div className="flex gap-1.5 bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm w-fit">
        {statuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${statusFilter === s ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            {s} <span className="opacity-60">({counts[s]})</span>
          </button>
        ))}
      </div>

      {pendingCount > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 font-medium flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          {pendingCount} cancellation {pendingCount === 1 ? 'request requires' : 'requests require'} your review.
        </div>
      )}

      {error && <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium">{error}</div>}

      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Staff</th>
                <th className="px-6 py-4 font-semibold">Task</th>
                <th className="px-6 py-4 font-semibold">Task Date</th>
                <th className="px-6 py-4 font-semibold">Reason</th>
                <th className="px-6 py-4 font-semibold">Submitted</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400 animate-pulse">Loading requests...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">No cancellation requests.</td></tr>
              ) : filtered.map(req => (
                <tr key={req.cancellation_request_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{req.requested_by_name}</td>
                  <td className="px-6 py-4 text-slate-600">{req.task_title || '—'}</td>
                  <td className="px-6 py-4 text-slate-600">{formatDate(req.task_date)}</td>
                  <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate">{req.reason}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(req.created_at)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      req.request_status === 'pending'  ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20' :
                      req.request_status === 'approved' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' :
                                                  'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${req.request_status === 'pending' ? 'bg-amber-500' : req.request_status === 'approved' ? 'bg-emerald-500' : 'bg-rose-500'}`}/>
                      {req.request_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {req.request_status === 'pending' ? (
                      <button onClick={() => { setReviewModal(req); setNote(''); }}
                        className="rounded-md bg-slate-900 hover:bg-slate-700 text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition-all"
                      >Review</button>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Done</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-1">Review Cancellation</h3>
            <p className="text-sm text-slate-500 mb-4">
              <span className="font-semibold text-slate-700">{reviewModal.requested_by_name}</span> · {reviewModal.task_title || '—'} · {formatDate(reviewModal.task_date)}
            </p>
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-600 mb-5">
              <span className="font-semibold text-slate-700">Reason: </span>{reviewModal.reason}
            </div>
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Manager note <span className="text-slate-400 font-normal">(optional)</span></label>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                placeholder="Add a note for the staff member..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => resolve('approved')} disabled={resolving}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
              >{resolving ? '...' : 'Approve'}</button>
              <button onClick={() => resolve('rejected')} disabled={resolving}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
              >{resolving ? '...' : 'Reject'}</button>
              <button onClick={() => setReviewModal(null)} disabled={resolving}
                className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-colors hover:bg-slate-50"
              >Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
