'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type Staff = {
  company_member_id: string;
  full_name: string;
  role: string;
  employee_type: string | null;
  max_working_hours: number | null;
  current_working_hours: number | null;
  remaining_eligible_hours: number | null;
  eligibility_status: string | null;
  pending_max_working_hours: number | null;
  pending_rule_period: string | null;
};

function statusStyle(status: string | null) {
  switch (status) {
    case 'at_limit':
      return 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20';
    case 'eligible':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

function statusLabel(status: string | null) {
  switch (status) {
    case 'at_limit': return 'At Limit';
    case 'eligible': return 'Eligible';
    default: return 'No Limit Set';
  }
}

function barColor(pct: number) {
  if (pct >= 100) return 'bg-rose-500';
  if (pct >= 80) return 'bg-amber-500';
  return 'bg-emerald-500';
}

export default function HoursDashboardPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'usage'>('usage');

  async function load() {
    setLoading(true);
    setError('');
    const result = await apiFetch<{ staff: Staff[] }>('/api/manager/staff');
    if (result.success) setStaffList(result.staff || []);
    else setError(result.message || 'Could not load staff hours.');
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const withHours = staffList.map(s => {
    const current = s.current_working_hours ?? 0;
    const max = s.max_working_hours;
    const pct = max ? Math.min((current / max) * 100, 999) : 0;
    return { ...s, current, max, pct };
  });

  const sorted = [...withHours].sort((a, b) =>
    sortBy === 'name' ? a.full_name.localeCompare(b.full_name) : b.pct - a.pct
  );

  const atLimitCount = withHours.filter(s => s.eligibility_status === 'at_limit').length;
  const nearLimitCount = withHours.filter(s => s.eligibility_status === 'eligible' && s.pct >= 80).length;
  const pendingCount = withHours.filter(s => s.pending_max_working_hours != null).length;

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">

      <div className="rounded-2xl bg-white px-6 py-5 shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900">Hours Dashboard</h2>
        <p className="text-sm text-slate-500 mt-0.5">Track how each staff member's logged hours compare to their working-hour limit.</p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">At Limit</p>
          <p className="text-3xl font-black text-rose-600 mt-2">{atLimitCount}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Near Limit</p>
          <p className="text-3xl font-black text-amber-600 mt-2">{nearLimitCount}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Proposals</p>
          <p className="text-3xl font-black text-slate-900 mt-2">{pendingCount}</p>
        </div>
      </div>

      {error && <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium">{error}</div>}

      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Staff Hours</h3>
          <div className="flex gap-1.5 bg-slate-100 rounded-xl p-1.5">
            <button onClick={() => setSortBy('usage')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${sortBy === 'usage' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >Highest Usage</button>
            <button onClick={() => setSortBy('name')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${sortBy === 'name' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >Name</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Staff Member</th>
                <th className="px-6 py-4 font-semibold">Employee Type</th>
                <th className="px-6 py-4 font-semibold w-64">Usage</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 animate-pulse">Loading...</td></tr>
              ) : sorted.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">No staff members yet.</td></tr>
              ) : sorted.map(s => (
                <tr key={s.company_member_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{s.full_name}</td>
                  <td className="px-6 py-4 text-slate-600 capitalize">{s.employee_type?.replace('_', '-') || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden min-w-[100px]">
                        <div className={`h-full rounded-full ${barColor(s.pct)}`} style={{ width: `${Math.min(s.pct, 100)}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-slate-600 shrink-0">
                        {s.max != null ? `${s.current}/${s.max}h` : `${s.current}h`}
                      </span>
                    </div>
                    {s.pending_max_working_hours != null && (
                      <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-violet-50 text-violet-700 px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ring-violet-600/20">
                        Pending: {s.pending_max_working_hours}h/{s.pending_rule_period}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle(s.eligibility_status)}`}>
                      {statusLabel(s.eligibility_status)}
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
