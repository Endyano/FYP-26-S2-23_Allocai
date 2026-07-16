'use client';

import { useState } from 'react';
import Link from 'next/link';

const STATUS_STYLES: Record<string, string> = {
  Pending:   'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
  Approved:  'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
  Completed: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20',
  Cancelled: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatTime(t: string) {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

const MOCK_TASKS = [
  { id: 'T001', task_name: 'Morning Stock Check',     task_date: '2026-06-26', start_time: '08:00', end_time: '12:00', priority: 'High',   status: 'Approved'  },
  { id: 'T002', task_name: 'Delivery Route A',        task_date: '2026-06-27', start_time: '09:00', end_time: '14:00', priority: 'Medium', status: 'Pending'   },
  { id: 'T003', task_name: 'Cold Storage Inspection', task_date: '2026-06-24', start_time: '10:00', end_time: '12:00', priority: 'High',   status: 'Completed' },
];

export default function FTDashboardPage() {
  const [tasks] = useState(MOCK_TASKS);

  const totalTasks    = tasks.length;
  const pendingTasks  = tasks.filter(t => t.status === 'Pending').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Tasks</p>
          <p className="text-4xl font-black text-slate-900 mt-2">{totalTasks}</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending</p>
          <p className="text-4xl font-black text-amber-500 mt-2">{pendingTasks}</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed</p>
          <p className="text-4xl font-black text-emerald-500 mt-2">{completedTasks}</p>
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
              {tasks.map(task => (
                <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{task.task_name}</td>
                  <td className="px-6 py-4 text-slate-600">{formatDate(task.task_date)}</td>
                  <td className="px-6 py-4 text-slate-600">{formatTime(task.start_time)} – {formatTime(task.end_time)}</td>
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
