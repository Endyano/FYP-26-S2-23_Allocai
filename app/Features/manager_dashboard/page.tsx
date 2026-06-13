'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const STATUS_STYLES: Record<string, string> = {
  Pending:   'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
  Approved:  'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
  Completed: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20',
  Cancelled: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20',
};

const DOT_STYLES: Record<string, string> = {
  Pending:   'bg-amber-500',
  Approved:  'bg-emerald-500',
  Completed: 'bg-sky-500',
  Cancelled: 'bg-rose-500',
};

function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DashboardPage() {
  const [totalStaff, setTotalStaff] = useState<number | null>(null);
  const [pendingTasks, setPendingTasks] = useState<number | null>(null);
  const [totalDepartments, setTotalDepartments] = useState<number | null>(null);
  const [statsError, setStatsError] = useState(false);

  const [tasks, setTasks] = useState<any[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [taskFilter, setTaskFilter] = useState('All');

  const [disputes, setDisputes] = useState<any[]>([]);
  const [disputesLoading, setDisputesLoading] = useState(true);
  const [resolveModal, setResolveModal] = useState<any | null>(null);
  const [resolveNote, setResolveNote] = useState('');
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/manager/stats`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTotalStaff(data.total_staff);
          setPendingTasks(data.pending_tasks);
          setTotalDepartments(data.total_departments);
        } else {
          setStatsError(true);
        }
      })
      .catch(() => setStatsError(true));

    fetch(`${API_URL}/api/manager/tasks`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => { if (data.success) setTasks(data.tasks || []); })
      .catch(() => {})
      .finally(() => setTasksLoading(false));

    fetch(`${API_URL}/api/manager/disputes`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => { if (data.success) setDisputes(data.disputes || []); })
      .catch(() => {})
      .finally(() => setDisputesLoading(false));
  }, []);

  async function resolveDispute(action: 'Approved' | 'Rejected') {
    if (!resolveModal) return;
    setResolving(true);
    try {
      const res = await fetch(`${API_URL}/api/manager/disputes/${resolveModal.id}/resolve`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, manager_note: resolveNote }),
      });
      const data = await res.json();
      if (data.success) {
        setDisputes(prev =>
          prev.map(d => d.id === resolveModal.id ? { ...d, status: action, manager_note: resolveNote } : d)
        );
        setResolveModal(null);
        setResolveNote('');
      }
    } catch {
      // silently fail
    } finally {
      setResolving(false);
    }
  }

  const staffRingValue   = totalStaff      !== null ? Math.min((totalStaff / 200) * 100, 100) : 0;
  const pendingRingValue = pendingTasks    !== null ? Math.min((pendingTasks / 50) * 100, 100) : 0;
  const deptRingValue    = totalDepartments !== null ? Math.min((totalDepartments / 10) * 100, 100) : 0;

  const filteredTasks = taskFilter === 'All' ? tasks : tasks.filter(t => t.status === taskFilter);
  const taskCounts = {
    All:       tasks.length,
    Pending:   tasks.filter(t => t.status === 'Pending').length,
    Approved:  tasks.filter(t => t.status === 'Approved').length,
    Completed: tasks.filter(t => t.status === 'Completed').length,
    Cancelled: tasks.filter(t => t.status === 'Cancelled').length,
  };

  const pendingDisputes = disputes.filter(d => d.status === 'Pending').length;

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      {statsError && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium">
          Could not load dashboard stats. Make sure the backend is running.
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative rounded-2xl bg-white p-6 shadow-sm border border-slate-200 border-t-4 border-t-indigo-500 overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
          <div className="relative z-10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Casual Staff</h3>
            <p className="text-4xl font-black text-slate-900 mt-3">
              {totalStaff !== null ? totalStaff : <span className="text-slate-300 animate-pulse">—</span>}
            </p>
          </div>
          <svg className="absolute -right-4 -bottom-4 w-32 h-32 opacity-50" viewBox="0 0 36 36">
            <path className="text-slate-100" stroke="currentColor" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
            <path className="text-indigo-400" stroke="currentColor" strokeDasharray={`${staffRingValue}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
          </svg>
        </div>

        <div className="relative rounded-2xl bg-white p-6 shadow-sm border border-slate-200 border-t-4 border-t-emerald-500 overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
          <div className="relative z-10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Departments</h3>
            <p className="text-4xl font-black text-slate-900 mt-3">
              {totalDepartments !== null ? totalDepartments : <span className="text-slate-300 animate-pulse">—</span>}
            </p>
          </div>
          <svg className="absolute -right-4 -bottom-4 w-32 h-32 opacity-50" viewBox="0 0 36 36">
            <path className="text-slate-100" stroke="currentColor" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
            <path className="text-emerald-400" stroke="currentColor" strokeDasharray={`${deptRingValue}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
          </svg>
        </div>

        <div className="relative rounded-2xl bg-white p-6 shadow-sm border border-slate-200 border-t-4 border-t-rose-500 overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
          <div className="relative z-10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Tasks</h3>
            <p className="text-4xl font-black text-slate-900 mt-3">
              {pendingTasks !== null ? pendingTasks : <span className="text-slate-300 animate-pulse">—</span>}
            </p>
          </div>
          <svg className="absolute -right-4 -bottom-4 w-32 h-32 opacity-50" viewBox="0 0 36 36">
            <path className="text-slate-100" stroke="currentColor" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
            <path className="text-rose-400" stroke="currentColor" strokeDasharray={`${pendingRingValue}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
          </svg>
        </div>
      </div>

      {/* Dispute Requests */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900">Hour Dispute Requests</h2>
            {pendingDisputes > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold px-2.5 py-0.5">
                {pendingDisputes} Pending
              </span>
            )}
            {!disputesLoading && pendingDisputes === 0 && (
              <span className="text-xs font-semibold text-slate-400">0 Pending</span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Staff</th>
                <th className="px-6 py-4 font-semibold">Task</th>
                <th className="px-6 py-4 font-semibold">Recorded</th>
                <th className="px-6 py-4 font-semibold">Claimed</th>
                <th className="px-6 py-4 font-semibold">Reason</th>
                <th className="px-6 py-4 font-semibold">Submitted</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {disputesLoading ? (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-slate-400 animate-pulse">Loading disputes...</td></tr>
              ) : disputes.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-slate-500">No dispute requests yet.</td></tr>
              ) : disputes.map(dispute => {
                const start = dispute.start_time || '';
                const end = dispute.end_time || '';
                let recordedHrs = '—';
                if (start && end) {
                  const [sh, sm] = start.split(':').map(Number);
                  const [eh, em] = end.split(':').map(Number);
                  recordedHrs = ((eh * 60 + em - (sh * 60 + sm)) / 60).toFixed(1) + 'h';
                }
                return (
                  <tr key={dispute.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{dispute.staff_name}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <p>{dispute.task_name}</p>
                      <p className="text-xs text-slate-400">{formatDate(dispute.task_date)}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{recordedHrs}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {dispute.claimed_hours != null ? `${dispute.claimed_hours}h` : '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-[200px]">
                      <p className="truncate">{dispute.reason}</p>
                      {dispute.manager_note && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">Note: {dispute.manager_note}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(dispute.created_at)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        dispute.status === 'Pending'  ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20' :
                        dispute.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' :
                                                        'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          dispute.status === 'Pending' ? 'bg-amber-500' :
                          dispute.status === 'Approved' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`} />
                        {dispute.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {dispute.status === 'Pending' ? (
                        <button
                          onClick={() => { setResolveModal(dispute); setResolveNote(''); }}
                          className="rounded-md bg-slate-900 hover:bg-slate-700 text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition-all"
                        >
                          Resolve
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Done</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* All Tasks Overview */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">All Tasks Overview</h2>
            <p className="text-xs text-slate-500 mt-0.5">Latest 50 tasks across all departments</p>
          </div>
          <div className="flex gap-2 bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm flex-wrap">
            {(['All', 'Pending', 'Approved', 'Completed', 'Cancelled'] as const).map(f => (
              <button
                key={f}
                onClick={() => setTaskFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  taskFilter === f
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {f} <span className="opacity-60">({taskCounts[f as keyof typeof taskCounts]})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Task</th>
                <th className="px-6 py-4 font-semibold">Department</th>
                <th className="px-6 py-4 font-semibold">Assigned Staff</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Priority</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {tasksLoading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400 animate-pulse">Loading tasks...</td></tr>
              ) : filteredTasks.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-500">No tasks found.</td></tr>
              ) : filteredTasks.map(task => (
                <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{task.task_name}</td>
                  <td className="px-6 py-4 text-slate-600">{task.department_label || task.department_name || '—'}</td>
                  <td className="px-6 py-4 text-slate-600">{task.staff_name || <span className="text-slate-400 italic">Unassigned</span>}</td>
                  <td className="px-6 py-4 text-slate-600">{formatDate(task.task_date)}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolve dispute modal */}
      {resolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white px-8 py-8 rounded-3xl shadow-2xl w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-900 mb-1">Resolve Dispute</h3>
            <p className="text-sm text-slate-500 mb-1">
              <span className="font-semibold text-slate-700">{resolveModal.staff_name}</span>
              {' · '}{resolveModal.task_name}
            </p>
            <p className="text-sm text-slate-500 mb-1">
              Recorded: <span className="font-semibold text-slate-700">
                {(() => {
                  const [sh, sm] = (resolveModal.start_time || '0:0').split(':').map(Number);
                  const [eh, em] = (resolveModal.end_time   || '0:0').split(':').map(Number);
                  return ((eh * 60 + em - (sh * 60 + sm)) / 60).toFixed(1);
                })()}h
              </span>
              {resolveModal.claimed_hours != null && (
                <> · Claimed: <span className="font-semibold text-slate-700">{resolveModal.claimed_hours}h</span></>
              )}
            </p>
            <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-600 mb-5">
              <span className="font-semibold text-slate-700">Reason: </span>{resolveModal.reason}
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Manager note <span className="text-slate-400 font-normal">(optional)</span></label>
              <textarea
                value={resolveNote}
                onChange={e => setResolveNote(e.target.value)}
                placeholder="Add a note for the staff member..."
                rows={2}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => resolveDispute('Approved')}
                disabled={resolving}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
              >
                {resolving ? '...' : 'Approve'}
              </button>
              <button
                onClick={() => resolveDispute('Rejected')}
                disabled={resolving}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
              >
                {resolving ? '...' : 'Reject'}
              </button>
              <button
                onClick={() => setResolveModal(null)}
                disabled={resolving}
                className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-colors hover:bg-slate-50"
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
