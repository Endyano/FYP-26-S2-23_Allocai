'use client';

import { useState } from 'react';

type WorkEntry = {
  id: string;
  task_name: string;
  task_date: string;
  start_time: string;
  end_time: string;
  hours_worked: number;
  status: string;
  department_name: string;
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

export default function FTHistoryPage() {
  const [history, setHistory] = useState<WorkEntry[]>([
    { id: 'H001', task_name: 'Cold Storage Inspection', task_date: '2026-06-24', start_time: '10:00', end_time: '12:00', hours_worked: 2, department_name: 'Quality Control', status: 'Completed' },
    { id: 'H002', task_name: 'Loading Dock Supervision', task_date: '2026-06-22', start_time: '07:00', end_time: '10:00', hours_worked: 3, department_name: 'Warehouse', status: 'Completed' },
    { id: 'H003', task_name: 'Inventory Check', task_date: '2026-06-18', start_time: '09:00', end_time: '13:00', hours_worked: 4, department_name: 'Warehouse', status: 'Completed' },
    { id: 'H004', task_name: 'Customer Delivery Assist', task_date: '2026-06-15', start_time: '08:00', end_time: '12:00', hours_worked: 4, department_name: 'Logistics', status: 'Completed' },
  ]);
  const [loading] = useState(false);
  const [error, setError] = useState('');
  const [monthFilter, setMonthFilter] = useState('');

  const months = Array.from(new Set(history.map(h => h.task_date?.slice(0, 7)).filter(Boolean))).sort().reverse();

  const filtered = monthFilter
    ? history.filter(h => h.task_date?.startsWith(monthFilter))
    : history;

  const totalHours = filtered.reduce((sum, h) => sum + (h.hours_worked || 0), 0);
  const completedCount = filtered.filter(h => h.status === 'Completed').length;

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Hours', value: totalHours.toFixed(1) + 'h', accent: 'border-t-emerald-500' },
          { label: 'Tasks Completed', value: completedCount, accent: 'border-t-sky-500' },
          { label: 'Total Records', value: filtered.length, accent: 'border-t-slate-400' },
        ].map(card => (
          <div key={card.label} className={`rounded-2xl bg-white p-5 shadow-sm border border-slate-200 border-t-4 ${card.accent}`}>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
            <p className="text-3xl font-black text-slate-900 mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold text-slate-600">Filter by month:</label>
        <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 outline-none focus:border-emerald-400 shadow-sm"
        >
          <option value="">All months</option>
          {months.map(m => {
            const [y, mo] = m.split('-');
            const label = new Date(Number(y), Number(mo) - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' });
            return <option key={m} value={m}>{label}</option>;
          })}
        </select>
      </div>

      {error && <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium">{error}</div>}

      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Task</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Time</th>
                <th className="px-6 py-4 font-semibold">Hours</th>
                <th className="px-6 py-4 font-semibold">Department</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 animate-pulse">Loading history...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No working history yet.</td></tr>
              ) : filtered.map(entry => (
                <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{entry.task_name}</td>
                  <td className="px-6 py-4 text-slate-600">{formatDate(entry.task_date)}</td>
                  <td className="px-6 py-4 text-slate-600">{formatTime(entry.start_time)} – {formatTime(entry.end_time)}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{entry.hours_worked?.toFixed(1) ?? '—'}h</td>
                  <td className="px-6 py-4 text-slate-600">{entry.department_name || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      entry.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' :
                      entry.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20' :
                      'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20'
                    }`}>{entry.status}</span>
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
