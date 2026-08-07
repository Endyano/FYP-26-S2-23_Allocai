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
  accepted:  'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
  completed: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20',
  declined:  'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20',
  cancelled: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20',
};
const STATUS_DOTS: Record<string, string> = {
  pending: 'bg-amber-500', accepted: 'bg-emerald-500', completed: 'bg-sky-500',
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

export default function FTAssignedTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [actingOn, setActingOn] = useState<string | null>(null);

  async function loadTasks() {
    setLoading(true);
    const [current, history] = await Promise.all([
      apiFetch<{ tasks?: Task[]; success: boolean; message?: string }>('/api/full-time-staff/tasks'),
      apiFetch<{ history?: Task[]; success: boolean; message?: string }>('/api/full-time-staff/tasks/history'),
    ]);
    if (current.success && history.success) {
      const merged = [...(current.tasks ?? []), ...(history.history ?? [])];
      const deduped = Array.from(new Map(merged.map(t => [t.allocation_id, t])).values());
      setTasks(deduped);
      setError('');
    } else {
      setError(current.message || history.message || 'Failed to load tasks.');
    }
    setLoading(false);
  }

  useEffect(() => { loadTasks(); }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) { loadTasks(); return; }
    setLoading(true);
    const result = await apiFetch<{ tasks?: Task[]; success: boolean; message?: string }>(
      `/api/full-time-staff/tasks/search?search=${encodeURIComponent(search.trim())}`
    );
    if (result.success) {
      setTasks(result.tasks ?? []);
      setError('');
    } else {
      setError(result.message || 'Search failed.');
    }
    setLoading(false);
  }

  async function respond(allocationId: string, action: 'accept' | 'decline' | 'complete') {
    setActingOn(allocationId);
    setError('');
    const result = await apiFetch<{ success: boolean; message?: string }>(
      `/api/full-time-staff/allocations/${allocationId}/${action}`,
      { method: 'PATCH' }
    );
    if (result.success) {
      loadTasks();
    } else {
      setError(result.message || 'Action failed.');
    }
    setActingOn(null);
  }

  const statuses = ['All', 'pending', 'accepted', 'completed', 'declined', 'cancelled'];
  const counts = statuses.reduce((acc, s) => {
    acc[s] = s === 'All' ? tasks.length : tasks.filter(t => t.allocation_status === s).length;
    return acc;
  }, {} as Record<string, number>);
  const filtered = statusFilter === 'All' ? tasks : tasks.filter(t => t.allocation_status === statusFilter);

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by task name, description, or department..."
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-400 shadow-sm"
        />
        <button type="submit" className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors shadow-sm">
          Search
        </button>
        {search && (
          <button type="button" onClick={() => { setSearch(''); loadTasks(); }} className="rounded-xl bg-white border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            Clear
          </button>
        )}
      </form>

      {/* Filter tabs */}
      <div className="flex gap-1.5 bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm flex-wrap w-fit">
        {statuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${statusFilter === s ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            {s} <span className="opacity-60">({counts[s]})</span>
          </button>
        ))}
      </div>

      {error && <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium">{error}</div>}

      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">My Assigned Tasks</h2>
          <span className="text-xs text-slate-400">{filtered.length} tasks</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Task</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Time</th>
                <th className="px-6 py-4 font-semibold">Department</th>
                <th className="px-6 py-4 font-semibold">Priority</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400 animate-pulse">Loading tasks...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">No tasks found.</td></tr>
              ) : filtered.map(task => (
                <tr key={task.allocation_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{task.task_title}</p>
                    {task.task_description && <p className="text-xs text-slate-400 mt-0.5 max-w-[200px] truncate">{task.task_description}</p>}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{formatDate(task.task_date)}</td>
                  <td className="px-6 py-4 text-slate-600">{formatTime(task.start_time)} – {formatTime(task.end_time)}</td>
                  <td className="px-6 py-4 text-slate-600">{task.department_name || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      task.priority_level === 'high' ? 'bg-rose-50 text-rose-700' :
                      task.priority_level === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                    }`}>{task.priority_level || '—'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[task.allocation_status] || 'bg-slate-100 text-slate-600'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOTS[task.allocation_status] || 'bg-slate-400'}`}/>
                      {task.allocation_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {task.allocation_status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          disabled={actingOn === task.allocation_id}
                          onClick={() => respond(task.allocation_id, 'accept')}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-60"
                        >Accept</button>
                        <button
                          disabled={actingOn === task.allocation_id}
                          onClick={() => respond(task.allocation_id, 'decline')}
                          className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60"
                        >Decline</button>
                      </div>
                    )}
                    {task.allocation_status === 'accepted' && (
                      <button
                        disabled={actingOn === task.allocation_id}
                        onClick={() => respond(task.allocation_id, 'complete')}
                        className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 transition-colors disabled:opacity-60"
                      >Mark Complete</button>
                    )}
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
