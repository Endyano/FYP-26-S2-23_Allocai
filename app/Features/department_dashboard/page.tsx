'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

type Task = {
  allocation_id: string;
  task_title: string;
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

export default function FTDashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      const result = await apiFetch<{ tasks?: Task[] }>('/api/full-time-staff/tasks');
      setTasks(result.tasks ?? []);
      setLoading(false);
    }
    loadTasks();
  }, []);

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.allocation_status === 'pending').length;
  const acceptedTasks = tasks.filter(t => t.allocation_status === 'accepted').length;

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upcoming Tasks</p>
          <p className="text-4xl font-black text-slate-900 mt-2">{totalTasks}</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Response</p>
          <p className="text-4xl font-black text-amber-500 mt-2">{pendingTasks}</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Accepted</p>
          <p className="text-4xl font-black text-emerald-500 mt-2">{acceptedTasks}</p>
        </div>
      </div>

      {/* Upcoming Tasks */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Upcoming Tasks</h2>
          <Link href="/Features/department_dashboard/tasks" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Task</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Time</th>
                <th className="px-6 py-4 font-semibold">Priority</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 animate-pulse">Loading tasks...</td></tr>
              ) : tasks.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No upcoming tasks.</td></tr>
              ) : tasks.map(task => (
                <tr key={task.allocation_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{task.task_title}</td>
                  <td className="px-6 py-4 text-slate-600">{formatDate(task.task_date)}</td>
                  <td className="px-6 py-4 text-slate-600">{formatTime(task.start_time)} – {formatTime(task.end_time)}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
