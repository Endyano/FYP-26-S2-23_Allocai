'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

type ReportRow = {
  id: string;
  full_name: string;
  monthly_hours: number;
  monthly_limit: number | null;
  over_limit: boolean;
  exceed_pct: number;
};

function getLastSixMonths() {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: d.toLocaleString('default', { month: 'long', year: 'numeric' }),
      year: d.getFullYear(),
      month: d.getMonth() + 1,
    });
  }
  return months;
}

export default function ReportsPage() {
  const months = getLastSixMonths();

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [report, setReport] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [threshold, setThreshold] = useState(90);
  const [thresholdInput, setThresholdInput] = useState(90);

  useEffect(() => {
    const saved = localStorage.getItem('allocai_alert_threshold');
    if (saved) {
      setThreshold(Number(saved));
      setThresholdInput(Number(saved));
    }
  }, []);

  useEffect(() => {
    fetchReport();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIdx]);

  async function fetchReport() {
    setLoading(true);
    setError('');
    const { year, month } = months[selectedIdx];
    try {
      const result = await apiFetch<{ report: ReportRow[] }>(`/api/manager/reports?year=${year}&month=${month}`);
      if (result.success) {
        setReport(result.report);
      } else {
        setError(result.message || 'Failed to load report.');
      }
    } catch {
      setError('Could not reach the server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  function saveThreshold() {
    setThreshold(thresholdInput);
    localStorage.setItem('allocai_alert_threshold', String(thresholdInput));
  }

  function exportCSV() {
    const { label } = months[selectedIdx];
    const header = ['Name', 'Hours This Month', 'Monthly Limit', 'Status'];
    const rows = report.map(r => [
      r.full_name,
      r.monthly_hours,
      r.monthly_limit,
      r.over_limit ? `Over Limit (+${r.exceed_pct}%)` : 'Within Limits',
    ]);
    const csv = [header, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `hours-report-${label.replace(' ', '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const atRisk = report.filter(r => {
    if (r.monthly_limit == null) return false;
    const usagePct = (r.monthly_hours / r.monthly_limit) * 100;
    return !r.over_limit && usagePct >= threshold;
  });

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">

      {/* Alert threshold config */}
      <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Automation Limits</h2>
          <p className="text-slate-500 text-sm max-w-md">
            Flag staff who are approaching their monthly hour limit. An alert badge will appear when usage reaches this threshold.
          </p>
        </div>

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex-1 w-full max-w-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-700">Alert Threshold</span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
            </span>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Threshold (%)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={thresholdInput}
                onChange={e => setThresholdInput(Number(e.target.value))}
                className="w-full bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 font-semibold"
              />
            </div>
            <button
              onClick={saveThreshold}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm active:scale-95"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* At-risk banner */}
      {atRisk.length > 0 && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 px-6 py-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-amber-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <p className="text-sm font-semibold text-amber-800">
            {atRisk.length} staff {atRisk.length === 1 ? 'member is' : 'members are'} approaching their limit ({threshold}% threshold): {atRisk.map(r => r.full_name).join(', ')}
          </p>
        </div>
      )}

      {/* Monthly hours table */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900">Monthly Hours Summary</h2>
          <div className="flex gap-3 items-center">
            <select
              value={selectedIdx}
              onChange={e => setSelectedIdx(Number(e.target.value))}
              className="bg-white border border-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm cursor-pointer"
            >
              {months.map((m, i) => (
                <option key={i} value={i}>{m.label}</option>
              ))}
            </select>
            <button
              onClick={exportCSV}
              disabled={loading || report.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm active:scale-95 flex items-center gap-2 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export CSV
            </button>
          </div>
        </div>

        {error && (
          <div className="px-6 py-4 bg-rose-50 border-b border-rose-200 text-sm text-rose-700 font-medium">{error}</div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Staff Name</th>
                <th className="px-6 py-4 font-semibold">Hours This Month</th>
                <th className="px-6 py-4 font-semibold">Monthly Limit</th>
                <th className="px-6 py-4 font-semibold">Usage</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400 animate-pulse">Loading report...</td>
                </tr>
              ) : report.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">No staff data for this month.</td>
                </tr>
              ) : (
                report.map(row => {
                  const hasLimit = row.monthly_limit != null;
                  const usagePct = hasLimit ? Math.min((row.monthly_hours / row.monthly_limit!) * 100, 100) : 0;
                  const nearLimit = hasLimit && usagePct >= threshold && !row.over_limit;

                  return (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                        {row.full_name}
                        {nearLimit && (
                          <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Near Limit</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-semibold">
                        {row.monthly_hours} <span className="text-slate-400 font-normal">hrs</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {hasLimit ? <>{row.monthly_limit} <span className="text-slate-400 font-normal">hrs</span></> : <span className="text-slate-400 italic">No limit set</span>}
                      </td>
                      <td className="px-6 py-4 w-48">
                        {hasLimit ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${row.over_limit ? 'bg-rose-500' : nearLimit ? 'bg-amber-400' : 'bg-emerald-500'}`}
                                style={{ width: `${usagePct}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-slate-500 w-10 text-right">{Math.round(usagePct)}%</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {!hasLimit ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 font-semibold border border-slate-200 text-xs">
                            No Limit Set
                          </span>
                        ) : row.over_limit ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 font-semibold border border-rose-100 text-xs">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                            Over Limit (+{row.exceed_pct}%)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-semibold border border-slate-200 text-xs">
                            <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            Within Limits
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
