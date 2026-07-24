'use client';

import { useState } from 'react';

type Task = {
  id: string;
  task_name: string;
  description: string;
  task_date: string;
  start_time: string;
  end_time: string;
  priority: string;
  status: string;
  department_name: string;
};

const STATUS_STYLES: Record<string, string> = {
  Pending:   'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
  Approved:  'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
  Completed: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20',
  Cancelled: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20',
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
  const [tasks, setTasks] = useState<Task[]>([
    { id: 'T001', task_name: 'Morning Stock Check', description: 'Count all warehouse items.', task_date: '2026-06-25', start_time: '08:00', end_time: '12:00', priority: 'High', status: 'Approved', department_name: 'Warehouse' },
    { id: 'T002', task_name: 'Delivery Route A', description: 'Complete morning deliveries for zone A.', task_date: '2026-06-26', start_time: '09:00', end_time: '14:00', priority: 'Medium', status: 'Pending', department_name: 'Logistics' },
    { id: 'T003', task_name: 'Cold Storage Inspection', description: 'Check temperature logs.', task_date: '2026-06-24', start_time: '10:00', end_time: '12:00', priority: 'High', status: 'Completed', department_name: 'Quality Control' },
  ]);
  const [loading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const statuses = ['All', 'Pending', 'Approved', 'Completed', 'Cancelled'];
  const counts = statuses.reduce((acc, s) => {
    acc[s] = s === 'All' ? tasks.length : tasks.filter(t => t.status === s).length;
    return acc;
  }, {} as Record<string, number>);
  const filtered = statusFilter === 'All' ? tasks : tasks.filter(t => t.status === statusFilter);

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">

      {/* Filter tabs */}
      <div className="flex gap-1.5 bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm flex-wrap w-fit">
        {statuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${statusFilter === s ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 animate-pulse">Loading tasks...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No tasks found.</td></tr>
              ) : filtered.map(task => (
                <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{task.task_name}</p>
                    {task.description && <p className="text-xs text-slate-400 mt-0.5 max-w-[200px] truncate">{task.description}</p>}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{formatDate(task.task_date)}</td>
                  <td className="px-6 py-4 text-slate-600">{formatTime(task.start_time)} – {formatTime(task.end_time)}</td>
                  <td className="px-6 py-4 text-slate-600">{task.department_name || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      task.priority === 'High' ? 'bg-rose-50 text-rose-700' :
                      task.priority === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                    }`}>{task.priority}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[task.status] || 'bg-slate-100 text-slate-600'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        task.status === 'Pending' ? 'bg-amber-500' : task.status === 'Approved' ? 'bg-emerald-500' :
                        task.status === 'Completed' ? 'bg-sky-500' : 'bg-rose-500'
                      }`}/>
                      {task.status}
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
