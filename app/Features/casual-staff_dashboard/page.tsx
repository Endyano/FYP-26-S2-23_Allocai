'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type ScheduleItem = {
  allocation_id: string;
  task_title: string;
  task_date: string;
  start_time: string;
  end_time: string;
  priority_level: string;
  allocation_status: string;
};

type EligibilityHours = {
  max_working_hours: number | null;
  current_working_hours: number | null;
  remaining_eligible_hours: number | null;
  eligibility_status: string | null;
};

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' });
}

function formatTime(t: string) {
  if (!t) return '—';
  return t.slice(0, 5);
}

function calcHours(start: string, end: string) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff < 0) diff += 24 * 60;
  return (diff / 60).toFixed(1);
}

export default function CasualDashboard() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [hours, setHours] = useState<EligibilityHours | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [scheduleResult, historyResult, hoursResult] = await Promise.all([
        apiFetch<{ schedule?: ScheduleItem[] }>('/api/part-time-staff/schedule'),
        apiFetch<{ history?: ScheduleItem[] }>('/api/part-time-staff/tasks/history'),
        apiFetch<{ eligibility_hours?: EligibilityHours }>('/api/part-time-staff/eligibility-hours'),
      ]);
      setSchedule(scheduleResult.schedule ?? []);
      setCompletedCount((historyResult.history ?? []).filter(t => t.allocation_status === 'completed').length);
      setHours(hoursResult.eligibility_hours ?? null);
      setLoading(false);
    }
    loadData();
  }, []);

  const hoursUsed = hours?.current_working_hours ?? null;
  const hoursLimit = hours?.max_working_hours ?? null;
  const dashArrayValue = hoursUsed !== null && hoursLimit ? Math.min((hoursUsed / hoursLimit) * 100, 100) : 0;
  const upcomingCount = schedule.filter(s => s.allocation_status === 'accepted' || s.allocation_status === 'pending').length;

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative rounded-2xl bg-white p-6 shadow-sm border border-slate-200 border-t-4 border-t-indigo-500 overflow-hidden transition-all hover:shadow-md">
          <div className="relative z-10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Working Hours</h3>
            <p className="text-4xl font-black text-slate-900 mt-3">
              {loading ? <span className="text-slate-300 animate-pulse">—</span> : (hoursUsed ?? 0)}
              <span className="text-sm font-medium text-slate-400"> h</span>
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
              <div key={sched.allocation_id} className="rounded-2xl bg-slate-50 p-6 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    {sched.task_title}
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 capitalize">{sched.allocation_status}</span>
                  </h3>
                  <div className="flex items-center gap-3 mt-2 text-sm text-slate-600 font-medium">
                    <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-md">Date: <strong className="text-slate-900">{formatDate(sched.task_date)}</strong></span>
                    <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-md">Time: <strong className="text-slate-900">{formatTime(sched.start_time)} - {formatTime(sched.end_time)}</strong></span>
                    <span className="text-slate-500">({calcHours(sched.start_time, sched.end_time)} hrs)</span>
                  </div>
                </div>
                <div className="self-start md:self-auto">
                  <span className={`px-3 py-1.5 text-xs font-bold rounded-lg border capitalize ${
                    sched.priority_level === 'high' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    sched.priority_level === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}>
                    Priority: {sched.priority_level || '—'}
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
