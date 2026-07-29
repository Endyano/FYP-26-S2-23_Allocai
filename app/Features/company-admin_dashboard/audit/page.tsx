'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type AuditEntry = {
  audit_log_id: string;
  changed_by_name: string | null;
  changed_by_email: string | null;
  action_type: string;
  target_table: string;
  target_record_id: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  created_at: string;
};

type Employee = { user_id: string; full_name: string };

const ACTION_STYLES: Record<string, string> = {
  create:  'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
  update:  'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20',
  delete:  'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20',
  suspend: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
  assign:  'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-600/20',
};

function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function DiffView({ before, after }: { before: Record<string, unknown> | null; after: Record<string, unknown> | null }) {
  if (!before && !after) return <p className="text-slate-400 text-xs italic">No details recorded.</p>;

  const keys = Array.from(new Set([
    ...Object.keys(before || {}),
    ...Object.keys(after || {}),
  ]));

  return (
    <div className="text-xs font-mono space-y-1">
      {keys.map(key => {
        const prev = before?.[key];
        const next = after?.[key];
        const changed = JSON.stringify(prev) !== JSON.stringify(next);
        return (
          <div key={key} className={`flex gap-2 ${changed ? '' : 'opacity-40'}`}>
            <span className="text-slate-500 min-w-[120px]">{key}:</span>
            {before && (
              <span className="text-rose-600 line-through">{prev != null ? String(prev) : '—'}</span>
            )}
            {before && after && <span className="text-slate-400">→</span>}
            {after && (
              <span className="text-emerald-600">{next != null ? String(next) : '—'}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [userFilter, setUserFilter] = useState('');

  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function loadEmployees() {
    const result = await apiFetch<{ employees: Employee[] }>('/api/company-admin/employees');
    if (result.success) setEmployees(result.employees || []);
  }

  async function loadLogs() {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (userFilter) params.set('user_id', userFilter);
    if (dateFrom) params.set('start_date', dateFrom);
    if (dateTo) params.set('end_date', dateTo);
    const query = params.toString() ? `?${params.toString()}` : '';
    const result = await apiFetch<{ audit_logs: AuditEntry[] }>(`/api/company-admin/audit-logs${query}`);
    if (result.success) setEntries(result.audit_logs || []);
    else setError(result.message || 'Could not load audit log.');
    setLoading(false);
  }

  useEffect(() => {
    loadEmployees();
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = entries.filter(e => {
    const q = search.toLowerCase();
    return (
      e.changed_by_name?.toLowerCase().includes(q) ||
      e.action_type?.toLowerCase().includes(q) ||
      e.target_table?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">

      {/* Filters */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
        <h2 className="text-sm font-bold text-slate-700 mb-4">Filter Audit Log</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 col-span-1 sm:col-span-2 lg:col-span-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="Search log..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">From date</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">To date</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">By user</label>
            <select value={userFilter} onChange={e => setUserFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400"
            >
              <option value="">All users</option>
              {employees.map(u => <option key={u.user_id} value={u.user_id}>{u.full_name}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={loadLogs}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Apply Filters
          </button>
          <button onClick={() => { setDateFrom(''); setDateTo(''); setUserFilter(''); setSearch(''); loadLogs(); }}
            className="rounded-xl bg-white border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium">{error}</div>}

      {/* Log entries */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">System Change History</h2>
          <span className="text-xs text-slate-400">{filtered.length} entries</span>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-slate-400 animate-pulse">Loading audit log...</div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500">No audit entries found.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(entry => (
              <div key={entry.audit_log_id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0 mt-0.5">
                      {entry.changed_by_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900 text-sm">{entry.changed_by_name || 'Unknown'}</span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${ACTION_STYLES[entry.action_type?.toLowerCase()] || 'bg-slate-100 text-slate-600'}`}>
                          {entry.action_type}
                        </span>
                        <span className="text-slate-500 text-sm">
                          <span className="font-medium text-slate-700 capitalize">{entry.target_table?.replace(/_/g, ' ')}</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{entry.changed_by_email} · {formatDate(entry.created_at)}</p>
                    </div>
                  </div>
                  {(entry.old_value || entry.new_value) && (
                    <button
                      onClick={() => setExpandedId(expandedId === entry.audit_log_id ? null : entry.audit_log_id)}
                      className="flex-shrink-0 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {expandedId === entry.audit_log_id ? 'Hide' : 'Details'}
                    </button>
                  )}
                </div>

                {expandedId === entry.audit_log_id && (
                  <div className="mt-4 ml-11 rounded-xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Before / After</p>
                    <DiffView before={entry.old_value} after={entry.new_value} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
