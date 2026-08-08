'use client';

import { useEffect, useState } from 'react';
import { apiFetch, apiPost } from '@/lib/api';

type Task = {
  task_id: string;
  task_title: string;
  department_name: string | null;
  assigned_staff_name: string | null;
  task_date: string;
  priority_level: 'low' | 'medium' | 'high';
  task_status: 'draft' | 'open' | 'allocated' | 'completed' | 'cancelled';
};

type AllocationStatusCount = {
  allocation_status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  total: number;
};

type Dispute = {
  dispute_request_id: string;
  full_name: string;
  task_title: string | null;
  hours_worked: number | null;
  requested_hours: number;
  reason: string;
  dispute_status: 'pending' | 'approved' | 'rejected';
  manager_note: string | null;
  created_at: string;
};

const STATUS_STYLES: Record<string, string> = {
  open:      'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
  allocated: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
  completed: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20',
  cancelled: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20',
  draft:     'bg-slate-100 text-slate-600',
};

const DOT_STYLES: Record<string, string> = {
  open:      'bg-amber-500',
  allocated: 'bg-emerald-500',
  completed: 'bg-sky-500',
  cancelled: 'bg-rose-500',
  draft:     'bg-slate-400',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  allocated: 'Allocated',
  completed: 'Completed',
  cancelled: 'Cancelled',
  draft: 'Draft',
};

function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DashboardPage() {
  const [staffCount, setStaffCount] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [taskFilter, setTaskFilter] = useState('All');

  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [disputesLoading, setDisputesLoading] = useState(true);
  const [resolveModal, setResolveModal] = useState<Dispute | null>(null);
  const [resolveNote, setResolveNote] = useState('');
  const [resolving, setResolving] = useState(false);

  const [allocationStatus, setAllocationStatus] = useState<AllocationStatusCount[]>([]);
  const [allocationStatusLoading, setAllocationStatusLoading] = useState(true);

  async function loadStaff() {
    const result = await apiFetch<{ staff: unknown[] }>('/api/manager/staff');
    if (result.success) setStaffCount(result.staff.length);
  }

  async function loadTasks() {
    setTasksLoading(true);
    const result = await apiFetch<{ tasks: Task[] }>('/api/manager/tasks');
    if (result.success) setTasks(result.tasks || []);
    setTasksLoading(false);
  }

  async function loadDisputes() {
    setDisputesLoading(true);
    const result = await apiFetch<{ disputes: Dispute[] }>('/api/manager/disputes');
    if (result.success) setDisputes(result.disputes || []);
    setDisputesLoading(false);
  }

  async function loadAllocationStatus() {
    setAllocationStatusLoading(true);
    const result = await apiFetch<{ allocation_status: AllocationStatusCount[] }>('/api/manager/allocation-status');
    if (result.success) setAllocationStatus(result.allocation_status || []);
    setAllocationStatusLoading(false);
  }

  useEffect(() => {
    loadStaff();
    loadTasks();
    loadDisputes();
    loadAllocationStatus();
  }, []);

  async function resolveDispute(action: 'approved' | 'rejected') {
    if (!resolveModal) return;
    setResolving(true);
    try {
      const result = await apiFetch<{ message?: string }>(
        `/api/manager/disputes/${resolveModal.dispute_request_id}/resolve`,
        {
          method: 'PATCH',
          body: JSON.stringify({ action, manager_note: resolveNote }),
        }
      );
      if (result.success) {
        setResolveModal(null);
        setResolveNote('');
        await loadDisputes();
      }
    } catch {
      // silently fail
    } finally {
      setResolving(false);
    }
  }

  const totalDepartments = new Set(
    tasks.map((t) => t.department_name).filter(Boolean)
  ).size;
  const pendingTasksCount = tasks.filter((t) => t.task_status === 'open').length;

  const staffRingValue   = staffCount !== null ? Math.min((staffCount / 200) * 100, 100) : 0;
  const pendingRingValue = Math.min((pendingTasksCount / 50) * 100, 100);
  const deptRingValue    = Math.min((totalDepartments / 10) * 100, 100);

  const allocationCountFor = (status: AllocationStatusCount['allocation_status']) =>
    allocationStatus.find((a) => a.allocation_status === status)?.total ?? 0;
  const pendingResponses = allocationCountFor('pending');

  const filteredTasks = taskFilter === 'All' ? tasks : tasks.filter((t) => t.task_status === taskFilter);
  const taskCounts = {
    All: tasks.length,
    open: tasks.filter((t) => t.task_status === 'open').length,
    allocated: tasks.filter((t) => t.task_status === 'allocated').length,
    completed: tasks.filter((t) => t.task_status === 'completed').length,
    cancelled: tasks.filter((t) => t.task_status === 'cancelled').length,
  };

  const pendingDisputes = disputes.filter((d) => d.dispute_status === 'pending').length;

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative rounded-2xl bg-white p-6 shadow-sm border border-slate-200 border-t-4 border-t-indigo-500 overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
          <div className="relative z-10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Staff</h3>
            <p className="text-4xl font-black text-slate-900 mt-3">
              {staffCount !== null ? staffCount : <span className="text-slate-300 animate-pulse">—</span>}
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
            <p className="text-4xl font-black text-slate-900 mt-3">{totalDepartments}</p>
          </div>
          <svg className="absolute -right-4 -bottom-4 w-32 h-32 opacity-50" viewBox="0 0 36 36">
            <path className="text-slate-100" stroke="currentColor" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
            <path className="text-emerald-400" stroke="currentColor" strokeDasharray={`${deptRingValue}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
          </svg>
        </div>

        <div className="relative rounded-2xl bg-white p-6 shadow-sm border border-slate-200 border-t-4 border-t-rose-500 overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
          <div className="relative z-10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open Tasks</h3>
            <p className="text-4xl font-black text-slate-900 mt-3">{pendingTasksCount}</p>
          </div>
          <svg className="absolute -right-4 -bottom-4 w-32 h-32 opacity-50" viewBox="0 0 36 36">
            <path className="text-slate-100" stroke="currentColor" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
            <path className="text-rose-400" stroke="currentColor" strokeDasharray={`${pendingRingValue}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
          </svg>
        </div>
      </div>

      {/* Staff Response Status */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Staff Response Status</h2>
            <p className="text-xs text-slate-500 mt-0.5">How staff have responded to their task assignments, company-wide</p>
          </div>
          {!allocationStatusLoading && pendingResponses > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold px-2.5 py-0.5">
              {pendingResponses} Awaiting Response
            </span>
          )}
        </div>

        {allocationStatusLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {([
              { status: 'pending' as const, label: 'Pending', accent: 'text-amber-600 bg-amber-50 border-amber-200' },
              { status: 'accepted' as const, label: 'Accepted', accent: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
              { status: 'declined' as const, label: 'Declined', accent: 'text-rose-600 bg-rose-50 border-rose-200' },
              { status: 'completed' as const, label: 'Completed', accent: 'text-sky-600 bg-sky-50 border-sky-200' },
              { status: 'cancelled' as const, label: 'Cancelled', accent: 'text-slate-500 bg-slate-50 border-slate-200' },
            ]).map(({ status, label, accent }) => (
              <div key={status} className={`rounded-2xl border p-4 ${accent}`}>
                <p className="text-2xl font-black">{allocationCountFor(status)}</p>
                <p className="text-xs font-bold uppercase tracking-wider mt-1">{label}</p>
              </div>
            ))}
          </div>
        )}
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
              ) : disputes.map(dispute => (
                <tr key={dispute.dispute_request_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{dispute.full_name}</td>
                  <td className="px-6 py-4 text-slate-600">
                    <p>{dispute.task_title || '—'}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {dispute.hours_worked != null ? `${dispute.hours_worked}h` : '—'}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {dispute.requested_hours != null ? `${dispute.requested_hours}h` : '—'}
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
                      dispute.dispute_status === 'pending'  ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20' :
                      dispute.dispute_status === 'approved' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' :
                                                      'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        dispute.dispute_status === 'pending' ? 'bg-amber-500' :
                        dispute.dispute_status === 'approved' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`} />
                      {dispute.dispute_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {dispute.dispute_status === 'pending' ? (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* All Tasks Overview */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">All Tasks Overview</h2>
            <p className="text-xs text-slate-500 mt-0.5">Tasks across all departments</p>
          </div>
          <div className="flex gap-2 bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm flex-wrap">
            {(['All', 'open', 'allocated', 'completed', 'cancelled'] as const).map(f => (
              <button
                key={f}
                onClick={() => setTaskFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  taskFilter === f
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {f === 'All' ? 'All' : STATUS_LABELS[f]} <span className="opacity-60">({taskCounts[f as keyof typeof taskCounts]})</span>
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
                <tr key={task.task_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{task.task_title}</td>
                  <td className="px-6 py-4 text-slate-600">{task.department_name || '—'}</td>
                  <td className="px-6 py-4 text-slate-600">{task.assigned_staff_name || <span className="text-slate-400 italic">Unassigned</span>}</td>
                  <td className="px-6 py-4 text-slate-600">{formatDate(task.task_date)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                      task.priority_level === 'high'   ? 'bg-rose-50 text-rose-700' :
                      task.priority_level === 'medium' ? 'bg-amber-50 text-amber-700' :
                                                   'bg-slate-100 text-slate-600'
                    }`}>{task.priority_level}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[task.task_status] || 'bg-slate-100 text-slate-600'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[task.task_status] || 'bg-slate-400'}`} />
                      {STATUS_LABELS[task.task_status] || task.task_status}
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
              <span className="font-semibold text-slate-700">{resolveModal.full_name}</span>
              {' · '}{resolveModal.task_title || '—'}
            </p>
            <p className="text-sm text-slate-500 mb-1">
              Recorded: <span className="font-semibold text-slate-700">
                {resolveModal.hours_worked != null ? resolveModal.hours_worked : '—'}h
              </span>
              {resolveModal.requested_hours != null && (
                <> · Claimed: <span className="font-semibold text-slate-700">{resolveModal.requested_hours}h</span></>
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
                onClick={() => resolveDispute('approved')}
                disabled={resolving}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
              >
                {resolving ? '...' : 'Approve'}
              </button>
              <button
                onClick={() => resolveDispute('rejected')}
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
