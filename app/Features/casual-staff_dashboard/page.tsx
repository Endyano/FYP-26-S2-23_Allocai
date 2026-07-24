'use client';

import { useState } from 'react';

interface ScheduleItem {
  id: number;
  task_name: string;
  task_date: string;
  start_time: string;
  end_time: string;
  priority: string;
  status: string;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' });
}

function formatTime(t: string) {
  return t.slice(0, 5).replace(':', '');
}

function calcHours(start: string, end: string) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff < 0) diff += 24 * 60;
  return (diff / 60).toFixed(1);
}

function isThisWeek(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return date >= monday && date <= sunday;
}

export default function CasualDashboard() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([
    { id: 1, task_name: 'Warehouse Restocking', task_date: '2026-06-25', start_time: '08:00', end_time: '12:00', priority: 'Medium', status: 'Approved' },
    { id: 2, task_name: 'Loading Dock Help', task_date: '2026-06-26', start_time: '07:00', end_time: '10:00', priority: 'High', status: 'Approved' },
    { id: 3, task_name: 'Stock Count Assist', task_date: '2026-06-24', start_time: '09:00', end_time: '13:00', priority: 'Low', status: 'Completed' },
  ]);
  const [hoursUsed] = useState<number>(6);
  const [maxWeeklyHours] = useState<number>(16);
  const [loading] = useState(false);

  const hoursLimit = maxWeeklyHours ?? 16;
  const dashArrayValue = hoursUsed !== null ? Math.min((hoursUsed / hoursLimit) * 100, 100) : 0;
  const completedCount = schedule.filter(s => s.status === 'Completed').length;
  const upcomingCount = schedule.filter(s => s.status === 'Approved').length;

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative rounded-2xl bg-white p-6 shadow-sm border border-slate-200 border-t-4 border-t-indigo-500 overflow-hidden transition-all hover:shadow-md">
          <div className="relative z-10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hours This Week</h3>
            <p className="text-4xl font-black text-slate-900 mt-3">
              {hoursUsed !== null ? hoursUsed : <span className="text-slate-300 animate-pulse">—</span>}
              <span className="text-sm font-medium text-slate-400"> / {maxWeeklyHours ?? '—'}h</span>
            </p>
          </div>
          <svg className="absolute -right-4 -bottom-4 w-32 h-32 text-indigo-50 opacity-50" viewBox="0 0 36 36">
            <path className="text-slate-100" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
            <path className="text-indigo-400 animate-ring" strokeDasharray={`${dashArrayValue}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
          </svg>
        </div>

        <div className="relative rounded-2xl bg-white p-6 shadow-sm border border-slate-200 border-t-4 border-t-emerald-500 overflow-hidden transition-all hover:shadow-md">
          <div className="relative z-10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tasks Completed</h3>
            <p className="text-4xl font-black text-slate-900 mt-3">
              {loading ? <span className="text-slate-300 animate-pulse">—</span> : completedCount}
            </p>
          </div>
          <svg className="absolute -right-4 -bottom-4 w-32 h-32 text-emerald-50 opacity-50" viewBox="0 0 36 36">
            <path className="text-slate-100" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
            <path className="text-emerald-400 animate-ring" strokeDasharray={`${Math.min((completedCount / 20) * 100, 100)}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
          </svg>
        </div>

        <div className="relative rounded-2xl bg-white p-6 shadow-sm border border-slate-200 border-t-4 border-t-sky-500 overflow-hidden transition-all hover:shadow-md">
          <div className="relative z-10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upcoming Tasks</h3>
            <p className="text-4xl font-black text-slate-900 mt-3">
              {loading ? <span className="text-slate-300 animate-pulse">—</span> : upcomingCount}
            </p>
          </div>
          <svg className="absolute -right-4 -bottom-4 w-32 h-32 text-sky-50 opacity-50" viewBox="0 0 36 36">
            <path className="text-slate-100" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
            <path className="text-sky-400 animate-ring" strokeDasharray={`${Math.min((upcomingCount / 10) * 100, 100)}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
          </svg>
        </div>
      </div>

      {/* Your Schedule List */}
      <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Your Schedule</h2>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="rounded-2xl bg-slate-100 h-24 animate-pulse" />
            ))}
          </div>
        ) : schedule.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
            <p className="text-slate-500 font-medium">No upcoming tasks scheduled.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {schedule.map(sched => (
              <div key={sched.id} className="rounded-2xl bg-slate-50 p-6 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    {sched.task_name}
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">{sched.status}</span>
                  </h3>
                  <div className="flex items-center gap-3 mt-2 text-sm text-slate-600 font-medium">
                    <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-md">Date: <strong className="text-slate-900">{formatDate(sched.task_date)}</strong></span>
                    <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-md">Time: <strong className="text-slate-900">{formatTime(sched.start_time)} - {formatTime(sched.end_time)}</strong></span>
                    <span className="text-slate-500">({calcHours(sched.start_time, sched.end_time)} hrs)</span>
                  </div>
                </div>
                <div className="self-start md:self-auto">
                  <span className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${
                    sched.priority === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    sched.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}>
                    Priority: {sched.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
