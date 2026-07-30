'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type HistoryEntry = {
  allocation_id: string;
  allocation_status: string;
  completed_at: string | null;
  task_title: string;
  task_date: string;
  start_time: string;
  end_time: string;
  department_name: string | null;
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
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [monthFilter, setMonthFilter] = useState('');

  useEffect(() => {
    async function loadHistory() {
      const result = await apiFetch<{ history?: HistoryEntry[]; success: boolean; message?: string }>('/api/full-time-staff/tasks/history');
      if (result.success) {
        setHistory(result.history ?? []);
      } else {
        setError(result.message || 'Failed to load history.');
      }
      setLoading(false);
    }
    loadHistory();
  }, []);

  const months = Array.from(new Set(history.map(h => h.task_date?.slice(0, 7)).filter(Boolean))).sort().reverse();

  const filtered = monthFilter
    ? history.filter(h => h.task_date?.startsWith(monthFilter))
    : history;

  const completedCount = filtered.filter(h => h.allocation_status === 'completed').length;
  const cancelledCount = filtered.filter(h => h.allocation_status === 'cancelled' || h.allocation_status === 'declined').length;

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Records', value: filtered.length, accent: 'border-t-slate-400' },
          { label: 'Completed', value: completedCount, accent: 'border-t-emerald-500' },
          { label: 'Declined / Cancelled', value: cancelledCount, accent: 'border-t-rose-500' },
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
                <th className="px-6 py-4 font-semibold">Department</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 animate-pulse">Loading history...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No working history yet.</td></tr>
              ) : filtered.map(entry => (
                <tr key={entry.allocation_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{entry.task_title}</td>
                  <td className="px-6 py-4 text-slate-600">{formatDate(entry.task_date)}</td>
                  <td className="px-6 py-4 text-slate-600">{formatTime(entry.start_time)} – {formatTime(entry.end_time)}</td>
                  <td className="px-6 py-4 text-slate-600">{entry.department_name || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                      entry.allocation_status === 'completed' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' :
                      entry.allocation_status === 'cancelled' || entry.allocation_status === 'declined' ? 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20' :
                      'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20'
                    }`}>{entry.allocation_status}</span>
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
