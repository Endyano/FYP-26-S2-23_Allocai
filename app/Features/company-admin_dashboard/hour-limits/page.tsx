'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type PendingWorkRule = {
  staff_work_rule_id: string;
  company_member_id: string;
  proposal_status: 'pending' | 'approved' | 'rejected';
  current_max_working_hours: number | null;
  current_rule_period: string | null;
  proposed_max_working_hours: number;
  proposed_rule_period: string;
  proposed_notes: string | null;
  updated_at: string;
  staff_name: string;
  employee_type: 'full_time' | 'part_time' | null;
  requested_by_name: string | null;
  reviewed_by_name: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
  approved: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
  rejected: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatPeriod(period: string | null) {
  if (!period) return '—';
  return period.charAt(0).toUpperCase() + period.slice(1);
}

export default function HourLimitApprovalsPage() {
  const [rules, setRules] = useState<PendingWorkRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState<string | null>(null);
  const [confirmReject, setConfirmReject] = useState<PendingWorkRule | null>(null);
  const [actionError, setActionError] = useState('');

  async function loadAll() {
    setLoading(true);
    setError('');
    const result = await apiFetch<{ pending_work_rules?: PendingWorkRule[] }>('/api/company-admin/work-rules/pending');
    if (result.success) setRules(result.pending_work_rules || []);
    else setError(result.message || 'Could not load hour-limit proposals.');
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function approve(id: string) {
    setActingId(id);
    setActionError('');
    try {
      const result = await apiFetch(`/api/company-admin/work-rules/${id}/approve`, { method: 'PATCH' });
      if (result.success) await loadAll();
      else setActionError(result.message || 'Failed to approve.');
    } catch {
      setActionError('Could not reach the server.');
    } finally {
      setActingId(null);
    }
  }

  async function reject(id: string) {
    setActingId(id);
    setActionError('');
    try {
      const result = await apiFetch(`/api/company-admin/work-rules/${id}/reject`, { method: 'PATCH' });
      if (result.success) {
        setConfirmReject(null);
        await loadAll();
      } else {
        setActionError(result.message || 'Failed to reject.');
      }
    } catch {
      setActionError('Could not reach the server.');
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">

      <div className="rounded-2xl bg-white px-6 py-5 shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900">Hour Limit Approvals</h2>
        <p className="text-sm text-slate-500 mt-0.5">Review hour-limit changes managers have proposed for staff members before they take effect.</p>
      </div>

      {error && <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium">{error}</div>}

      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Staff Member</th>
                <th className="px-6 py-4 font-semibold">Current Limit</th>
                <th className="px-6 py-4 font-semibold">Proposed Limit</th>
                <th className="px-6 py-4 font-semibold">Notes</th>
                <th className="px-6 py-4 font-semibold">Requested By</th>
                <th className="px-6 py-4 font-semibold">Updated</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400 animate-pulse">Loading...</td></tr>
              ) : rules.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-500">No hour-limit proposals yet.</td></tr>
              ) : rules.map(rule => (
                <tr key={rule.staff_work_rule_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {rule.staff_name}
                    {rule.employee_type && (
                      <span className="ml-2 text-xs font-medium text-slate-400 capitalize">{rule.employee_type.replace('_', '-')}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {rule.current_max_working_hours != null
                      ? `${rule.current_max_working_hours}h / ${formatPeriod(rule.current_rule_period)}`
                      : <span className="text-slate-400 italic">None set</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-violet-700">{rule.proposed_max_working_hours}h / {formatPeriod(rule.proposed_rule_period)}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 max-w-[220px] truncate" title={rule.proposed_notes || ''}>
                    {rule.proposed_notes || <span className="text-slate-400 italic">—</span>}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{rule.requested_by_name || '—'}</td>
                  <td className="px-6 py-4 text-slate-500">{formatDate(rule.updated_at)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[rule.proposal_status]}`}>
                      {STATUS_LABELS[rule.proposal_status]}
                    </span>
                    {rule.proposal_status !== 'pending' && rule.reviewed_by_name && (
                      <p className="text-xs text-slate-400 mt-1">by {rule.reviewed_by_name}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {rule.proposal_status === 'pending' ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => approve(rule.staff_work_rule_id)} disabled={actingId === rule.staff_work_rule_id}
                          className="rounded-md bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition-all disabled:opacity-60"
                        >{actingId === rule.staff_work_rule_id ? 'Working...' : 'Approve'}</button>
                        <button onClick={() => { setConfirmReject(rule); setActionError(''); }} disabled={actingId === rule.staff_work_rule_id}
                          className="rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-200 shadow-sm transition-all disabled:opacity-60"
                        >Reject</button>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Confirm */}
      {confirmReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white px-10 py-10 rounded-3xl shadow-2xl w-full max-w-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Reject Proposal?</h3>
            <p className="text-center text-sm text-slate-500 mb-4">
              This will reject the proposed {confirmReject.proposed_max_working_hours}h / {formatPeriod(confirmReject.proposed_rule_period)} limit for {confirmReject.staff_name}.
            </p>
            {actionError && <p className="text-center text-sm text-rose-600 font-medium mb-4">{actionError}</p>}
            <div className="flex flex-col gap-3">
              <button onClick={() => reject(confirmReject.staff_work_rule_id)} disabled={actingId === confirmReject.staff_work_rule_id}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
              >{actingId === confirmReject.staff_work_rule_id ? 'Rejecting...' : 'Yes, reject proposal'}</button>
              <button onClick={() => { setConfirmReject(null); setActionError(''); }} className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold py-3 rounded-xl transition-colors">Back</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
