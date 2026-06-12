'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DashboardPage() {
  const [totalStaff, setTotalStaff] = useState<number | null>(null);
  const [pendingTasks, setPendingTasks] = useState<number | null>(null);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/manager/stats`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTotalStaff(data.total_staff);
          setPendingTasks(data.pending_tasks);
        } else {
          setStatsError(true);
        }
      })
      .catch(() => setStatsError(true));
  }, []);

  const staffRingValue = totalStaff !== null ? Math.min((totalStaff / 200) * 100, 100) : 0;
  const pendingRingValue = pendingTasks !== null ? Math.min((pendingTasks / 50) * 100, 100) : 0;

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      {statsError && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium">
          Could not load dashboard stats. Make sure the backend is running.
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="relative rounded-2xl bg-white p-6 shadow-sm border border-slate-200 border-t-4 border-t-indigo-500 overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
          <div className="relative z-10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Casual Staff</h3>
            <p className="text-4xl font-black text-slate-900 mt-3">
              {totalStaff !== null ? totalStaff : <span className="text-slate-300 animate-pulse">—</span>}
            </p>
          </div>
          <svg className="absolute -right-4 -bottom-4 w-32 h-32 text-indigo-50 opacity-50" viewBox="0 0 36 36">
            <path className="text-slate-100" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
            <path className="text-indigo-400 animate-ring" strokeDasharray={`${staffRingValue}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
          </svg>
        </div>

        {/* Card 2 — Active Departments (no API yet, kept static) */}
        <div className="relative rounded-2xl bg-white p-6 shadow-sm border border-slate-200 border-t-4 border-t-emerald-500 overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
          <div className="relative z-10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Departments</h3>
            <p className="text-4xl font-black text-slate-900 mt-3">8 <span className="text-sm font-medium text-slate-400">/ 10</span></p>
          </div>
          <svg className="absolute -right-4 -bottom-4 w-32 h-32 text-emerald-50 opacity-50" viewBox="0 0 36 36">
            <path className="text-slate-100" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
            <path className="text-emerald-400 animate-ring" strokeDasharray="80, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
          </svg>
        </div>

        {/* Card 3 */}
        <div className="relative rounded-2xl bg-white p-6 shadow-sm border border-slate-200 border-t-4 border-t-rose-500 overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
          <div className="relative z-10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Tasks</h3>
            <p className="text-4xl font-black text-slate-900 mt-3">
              {pendingTasks !== null ? pendingTasks : <span className="text-slate-300 animate-pulse">—</span>}
            </p>
          </div>
          <svg className="absolute -right-4 -bottom-4 w-32 h-32 text-rose-50 opacity-50" viewBox="0 0 36 36">
            <path className="text-slate-100" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
            <path className="text-rose-400 animate-ring" strokeDasharray={`${pendingRingValue}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
          </svg>
        </div>
      </div>

      {/* Hour Dispute Requests — no backend endpoint yet */}
      <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Hour Dispute Requests</h2>
          <span className="bg-amber-100 text-amber-700 py-1 px-3 rounded-full text-xs font-bold">0 Pending</span>
        </div>
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
          <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <p className="text-slate-500 font-medium">All clear! No pending disputes.</p>
        </div>
      </div>
    </div>
  );
}
