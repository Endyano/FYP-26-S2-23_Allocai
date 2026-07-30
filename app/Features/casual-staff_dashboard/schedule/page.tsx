'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type ScheduleItem = {
  allocation_id: string;
  task_title: string;
  task_date: string;
  start_time: string;
  end_time: string;
  allocation_status: string;
  department_name: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-amber-50 text-amber-700 border-amber-200',
  accepted:  'bg-indigo-50 text-indigo-700 border-indigo-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

function formatTime(t: string) {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSchedule() {
      const result = await apiFetch<{ schedule?: ScheduleItem[] }>('/api/part-time-staff/schedule');
      setSchedule(result.schedule ?? []);
      setLoading(false);
    }
    loadSchedule();
  }, []);

  const grouped = schedule.reduce((acc, item) => {
    const key = item.task_date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, ScheduleItem[]>);

  const dates = Object.keys(grouped).sort();

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900">My Schedule</h2>
          <p className="text-sm text-slate-500 mt-0.5">Your allocated shifts, grouped by date.</p>
        </div>

        {loading ? (
          <div className="px-8 py-16 text-center text-slate-400 animate-pulse">Loading schedule...</div>
        ) : dates.length === 0 ? (
          <div className="px-8 py-16 text-center text-slate-500">No allocated shifts yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {dates.map(date => (
              <div key={date} className="p-6">
                <p className="text-sm font-bold text-slate-900 mb-3">
                  {new Date(date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <div className="space-y-2">
                  {grouped[date].map(item => (
                    <div key={item.allocation_id} className={`flex items-center justify-between gap-4 rounded-xl border p-4 ${STATUS_STYLES[item.allocation_status] || 'bg-slate-50 border-slate-200'}`}>
                      <div>
                        <p className="font-semibold text-slate-900">{item.task_title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.department_name || '—'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-700">{formatTime(item.start_time)} – {formatTime(item.end_time)}</p>
                        <p className="text-xs capitalize text-slate-500 mt-0.5">{item.allocation_status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
