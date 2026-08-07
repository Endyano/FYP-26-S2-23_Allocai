'use client';

import { useEffect, useState } from 'react';
import { apiFetch, apiPost } from '@/lib/api';

type Staff = {
  company_member_id: string;
  staff_profile_id: string;
  staff_id: string | null;
  full_name: string;
  email: string;
  role: string;
  member_status: string;
  employee_type: string | null;
  job_title: string | null;
  max_working_hours: number | null;
  current_working_hours: number | null;
  remaining_eligible_hours: number | null;
  eligibility_status: string | null;
  pending_max_working_hours: number | null;
  pending_rule_period: string | null;
};

type Skillset = { skillset_id: string; skillset_name: string };

export default function UsersPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [skillsets, setSkillsets] = useState<Skillset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [assignModal, setAssignModal] = useState<Staff | null>(null);
  const [selectedSkillset, setSelectedSkillset] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');

  const [hourModal, setHourModal] = useState<Staff | null>(null);
  const [hourMode, setHourMode] = useState<'propose' | 'override'>('propose');
  const [hourForm, setHourForm] = useState({ max_working_hours: '', rule_period: 'weekly', rule_notes: '' });
  const [savingHours, setSavingHours] = useState(false);
  const [hourError, setHourError] = useState('');
  const [hourSuccess, setHourSuccess] = useState('');

  async function loadStaff(search?: string) {
    setLoading(true);
    setError('');
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const result = await apiFetch<{ staff: Staff[] }>(`/api/manager/staff${query}`);
    if (result.success) setStaffList(result.staff || []);
    else setError(result.message || 'Could not load staff.');
    setLoading(false);
  }

  async function loadSkillsets() {
    const result = await apiFetch<{ skillsets: Skillset[] }>('/api/manager/skillsets');
    if (result.success) setSkillsets(result.skillsets || []);
  }

  useEffect(() => {
    loadStaff();
    loadSkillsets();
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => loadStaff(searchQuery), 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  function openAssign(staff: Staff) {
    setAssignModal(staff);
    setSelectedSkillset('');
    setAssignError('');
    setAssignSuccess('');
  }

  async function assignSkillset() {
    if (!assignModal || !selectedSkillset) return;
    setAssigning(true);
    setAssignError('');
    try {
      const result = await apiPost(
        `/api/manager/staff/${assignModal.company_member_id}/skillsets`,
        { skillset_id: selectedSkillset }
      );
      if (result.success) {
        setAssignSuccess('Skillset assigned.');
        setTimeout(() => setAssignModal(null), 1000);
      } else {
        setAssignError(result.message || 'Could not assign skillset.');
      }
    } catch {
      setAssignError('Could not reach the server.');
    } finally {
      setAssigning(false);
    }
  }

  function openHourModal(staff: Staff) {
    setHourModal(staff);
    setHourMode('propose');
    setHourForm({
      max_working_hours: staff.max_working_hours != null ? String(staff.max_working_hours) : '',
      rule_period: 'weekly',
      rule_notes: '',
    });
    setHourError('');
    setHourSuccess('');
  }

  async function submitHourLimit() {
    if (!hourModal) return;
    setSavingHours(true);
    setHourError('');
    try {
      const endpoint = hourMode === 'propose' ? 'propose' : 'override';
      const result = await apiPost(
        `/api/manager/staff/${hourModal.company_member_id}/work-rule/${endpoint}`,
        {
          max_working_hours: Number(hourForm.max_working_hours),
          rule_period: hourForm.rule_period,
          rule_notes: hourForm.rule_notes || null,
        }
      );
      if (result.success) {
        setHourSuccess(hourMode === 'propose' ? 'Submitted for admin approval.' : 'Hour limit overridden.');
        await loadStaff(searchQuery);
        setTimeout(() => setHourModal(null), 1200);
      } else {
        setHourError(result.message || 'Could not save hour limit.');
      }
    } catch {
      setHourError('Could not reach the server.');
    } finally {
      setSavingHours(false);
    }
  }

  const filtered = staffList;

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">

      {/* Search bar */}
      <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm border border-slate-200">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          type="text"
          placeholder="Search staff by name or ID..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium">{error}</div>
      )}

      {/* Staff table */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Employee Type</th>
                <th className="px-6 py-4 font-semibold">Hours (period)</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400 animate-pulse">Loading staff...</td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map(staff => (
                  <tr key={staff.company_member_id} className="transition-colors hover:bg-slate-50 group">
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                        {staff.full_name.charAt(0).toUpperCase()}
                      </div>
                      {staff.full_name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 capitalize">{staff.role.replace(/_/g, ' ')}</td>
                    <td className="px-6 py-4 text-slate-600 capitalize">{staff.employee_type?.replace(/_/g, ' ') || '—'}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <div>
                        {staff.max_working_hours != null
                          ? `${staff.current_working_hours ?? 0} / ${staff.max_working_hours} hrs`
                          : `${staff.current_working_hours ?? 0} hrs`}
                      </div>
                      {staff.pending_max_working_hours != null && (
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ring-amber-600/20">
                          Pending: {staff.pending_max_working_hours} hrs/{staff.pending_rule_period}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        staff.member_status === 'suspended'
                          ? 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20'
                          : 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${staff.member_status === 'suspended' ? 'bg-rose-500' : 'bg-emerald-500'}`}/>
                        {staff.member_status === 'suspended' ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => openAssign(staff)}
                          className="rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all"
                        >
                          Assign Skillset
                        </button>
                        <button
                          onClick={() => openHourModal(staff)}
                          className="rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all"
                        >
                          Set Hour Limit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    {searchQuery ? `No staff found matching "${searchQuery}"` : 'No staff members yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign skillset modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Assign Skillset</h3>
                <p className="text-sm text-slate-500 mt-1">Assigning to <span className="font-semibold text-indigo-600">{assignModal.full_name}</span></p>
              </div>
              <button onClick={() => setAssignModal(null)} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full p-2 transition-colors border border-slate-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Skillset</label>
              <select
                value={selectedSkillset}
                onChange={e => setSelectedSkillset(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
              >
                <option value="">— Select —</option>
                {skillsets.map(s => <option key={s.skillset_id} value={s.skillset_id}>{s.skillset_name}</option>)}
              </select>
            </div>

            {assignError && <p className="mt-3 text-sm text-rose-600 font-medium">{assignError}</p>}
            {assignSuccess && <p className="mt-3 text-sm text-emerald-600 font-medium">{assignSuccess}</p>}

            <div className="mt-6 flex gap-3">
              <button
                onClick={assignSkillset}
                disabled={assigning || !selectedSkillset}
                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 shadow-sm active:scale-95 disabled:opacity-60"
              >
                {assigning ? 'Assigning...' : 'Assign'}
              </button>
              <button onClick={() => setAssignModal(null)} className="rounded-xl bg-white border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hour limit modal */}
      {hourModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Set Hour Limit</h3>
                <p className="text-sm text-slate-500 mt-1">For <span className="font-semibold text-indigo-600">{hourModal.full_name}</span></p>
              </div>
              <button onClick={() => setHourModal(null)} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full p-2 transition-colors border border-slate-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Mode toggle */}
            <div className="flex gap-1.5 bg-slate-100 rounded-xl p-1.5 mb-5">
              <button
                onClick={() => setHourMode('propose')}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${hourMode === 'propose' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Propose (needs admin approval)
              </button>
              <button
                onClick={() => setHourMode('override')}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${hourMode === 'override' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Override now (e.g. OT)
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Max Hours</label>
                  <input
                    type="number"
                    min={1}
                    value={hourForm.max_working_hours}
                    onChange={e => setHourForm(f => ({ ...f, max_working_hours: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Period</label>
                  <select
                    value={hourForm.rule_period}
                    onChange={e => setHourForm(f => ({ ...f, rule_period: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-semibold focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="fortnightly">Fortnightly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {hourMode === 'override' ? 'Reason (required)' : 'Notes (optional)'}
                </label>
                <textarea
                  rows={2}
                  value={hourForm.rule_notes}
                  onChange={e => setHourForm(f => ({ ...f, rule_notes: e.target.value }))}
                  placeholder={hourMode === 'override' ? 'e.g. Approved overtime for this week' : ''}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none"
                />
              </div>
              {hourMode === 'override' && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  This takes effect immediately without admin approval — use it only for case-by-case exceptions.
                </p>
              )}
            </div>

            {hourError && <p className="mt-3 text-sm text-rose-600 font-medium">{hourError}</p>}
            {hourSuccess && <p className="mt-3 text-sm text-emerald-600 font-medium">{hourSuccess}</p>}

            <div className="mt-6 flex gap-3">
              <button
                onClick={submitHourLimit}
                disabled={savingHours || !hourForm.max_working_hours || (hourMode === 'override' && !hourForm.rule_notes.trim())}
                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 shadow-sm active:scale-95 disabled:opacity-60"
              >
                {savingHours ? 'Saving...' : hourMode === 'propose' ? 'Submit for Approval' : 'Apply Override'}
              </button>
              <button onClick={() => setHourModal(null)} className="rounded-xl bg-white border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
