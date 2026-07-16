'use client';

import { useState } from 'react';

type DisputeRequest = {
  id: string;
  staff_name: string;
  task_name: string;
  task_date: string;
  logged_hours: number;
  claimed_hours: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  manager_note: string | null;
  created_at: string;
};

function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<DisputeRequest[]>([
    { id: 'D001', staff_name: 'Priya Nair',        task_name: 'Delivery Fruit Run',    task_date: '2026-06-20', logged_hours: 3.0, claimed_hours: 4.5, reason: 'I started earlier than recorded due to loading delays.',          status: 'Pending',  manager_note: null,                        created_at: '2026-06-21' },
    { id: 'D002', staff_name: 'Kevin Loh Jun Hao', task_name: 'Cold Storage Sorting',  task_date: '2026-06-17', logged_hours: 2.5, claimed_hours: 4.0, reason: 'System logged me out early. I was still on shift.',               status: 'Approved', manager_note: 'Verified with site supervisor.', created_at: '2026-06-18' },
    { id: 'D003', staff_name: 'Rajan Kumar',        task_name: 'Warehouse Stock Count', task_date: '2026-06-15', logged_hours: 4.0, claimed_hours: 5.0, reason: 'Overtime was not captured as the task closed automatically.',     status: 'Rejected', manager_note: 'No supporting evidence provided.', created_at: '2026-06-16' },
  ]);

  const [statusFilter, setStatusFilter] = useState('All');
  const [reviewModal, setReviewModal] = useState<DisputeRequest | null>(null);
  const [note, setNote] = useState('');
  const [resolving, setResolving] = useState(false);

  function resolve(action: 'Approved' | 'Rejected') {
    if (!reviewModal) return;
    setResolving(true);
    setTimeout(() => {
      setDisputes(prev => prev.map(d =>
        d.id === reviewModal.id ? { ...d, status: action, manager_note: note } : d
      ));
      setReviewModal(null);
      setNote('');
      setResolving(false);
    }, 500);
  }

  const statuses = ['All', 'Pending', 'Approved', 'Rejected'];
  const counts = statuses.reduce((acc, s) => {
    acc[s] = s === 'All' ? disputes.length : disputes.filter(d => d.status === s).length;
    return acc;
  }, {} as Record<string, number>);
  const filtered = statusFilter === 'All' ? disputes : disputes.filter(d => d.status === statusFilter);
  const pendingCount = disputes.filter(d => d.status === 'Pending').length;

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">

      {/* Filter tabs */}
      <div className="flex gap-1.5 bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm w-fit">
        {statuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${statusFilter === s ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            {s} <span className="opacity-60">({counts[s]})</span>
          </button>
        ))}
      </div>

      {pendingCount > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 font-medium flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          {pendingCount} hour dispute {pendingCount === 1 ? 'request requires' : 'requests require'} your review.
        </div>
      )}

      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Staff</th>
                <th className="px-6 py-4 font-semibold">Task</th>
                <th className="px-6 py-4 font-semibold">Task Date</th>
                <th className="px-6 py-4 font-semibold">Logged Hrs</th>
                <th className="px-6 py-4 font-semibold">Claimed Hrs</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">No dispute requests.</td></tr>
              ) : filtered.map(req => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{req.staff_name}</td>
                  <td className="px-6 py-4 text-slate-600">{req.task_name}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(req.task_date)}</td>
                  <td className="px-6 py-4 text-slate-600">{req.logged_hours} hrs</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{req.claimed_hours} hrs</td>
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
                  <td className="px-6 py-4 text-right">
                    {req.status === 'Pending' ? (
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
            <h3 className="text-xl font-bold text-slate-900 mb-1">Review Hour Dispute</h3>
            <p className="text-sm text-slate-500 mb-4">
              <span className="font-semibold text-slate-700">{reviewModal.staff_name}</span> · {reviewModal.task_name} · {formatDate(reviewModal.task_date)}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-center">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Logged Hours</p>
                <p className="text-2xl font-black text-slate-900">{reviewModal.logged_hours}h</p>
              </div>
              <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-center">
                <p className="text-xs text-rose-500 font-semibold uppercase tracking-wider mb-1">Claimed Hours</p>
                <p className="text-2xl font-black text-rose-700">{reviewModal.claimed_hours}h</p>
              </div>
            </div>

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
              <button onClick={() => resolve('Approved')} disabled={resolving}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
              >{resolving ? '...' : 'Approve'}</button>
              <button onClick={() => resolve('Rejected')} disabled={resolving}
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
