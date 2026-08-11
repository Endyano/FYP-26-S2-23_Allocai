'use client';

import { useEffect, useState } from 'react';
import { apiFetch, apiPost } from '@/lib/api';

type Staff = { company_member_id: string; full_name: string };
type Skillset = { skillset_id: string; skillset_name: string };
type Assignment = { staff_skillset_id: string; company_member_id: string; full_name: string; skillset_id: string; skillset_name: string };

export default function SkillsetsPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [skillsets, setSkillsets] = useState<Skillset[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [assignModal, setAssignModal] = useState<Staff | null>(null);
  const [selectedSkillset, setSelectedSkillset] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function loadAll() {
    setLoading(true);
    setError('');
    const [staffRes, skillRes, assignRes] = await Promise.all([
      apiFetch<{ staff: Staff[] }>('/api/manager/staff'),
      apiFetch<{ skillsets: Skillset[] }>('/api/manager/skillsets'),
      apiFetch<{ assignments: Assignment[] }>('/api/manager/staff-skillsets'),
    ]);
    if (staffRes.success) setStaff(staffRes.staff || []);
    else setError(staffRes.message || 'Could not load staff.');
    if (skillRes.success) setSkillsets(skillRes.skillsets || []);
    if (assignRes.success) setAssignments(assignRes.assignments || []);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function openAssign(member: Staff) {
    setAssignModal(member);
    setSelectedSkillset('');
    setSaveError('');
    setSaveSuccess('');
  }

  async function saveSkill() {
    if (!assignModal || !selectedSkillset) return;
    setSaving(true);
    setSaveError('');
    try {
      const result = await apiPost(
        `/api/manager/staff/${assignModal.company_member_id}/skillsets`,
        { skillset_id: selectedSkillset }
      );
      if (result.success) {
        setSaveSuccess('Skillset assigned.');
        setTimeout(() => { setAssignModal(null); setSaveSuccess(''); }, 1200);
        await loadAll();
      } else {
        setSaveError(result.message || 'Failed to save.');
      }
    } catch { setSaveError('Could not reach the server.'); }
    finally { setSaving(false); }
  }

  async function unassignSkill(staffSkillsetId: string) {
    setRemovingId(staffSkillsetId);
    try {
      const result = await apiFetch(`/api/manager/staff-skillsets/${staffSkillsetId}`, { method: 'DELETE' });
      if (result.success) await loadAll();
      else setError(result.message || 'Failed to remove skillset.');
    } catch { setError('Could not reach the server.'); }
    finally { setRemovingId(null); }
  }

  const filtered = staff.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">

      <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm border border-slate-200">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="Search staff..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>

      {error && <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium">{error}</div>}

      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Staff Skillset Assignments</h2>
          <p className="text-sm text-slate-500 mt-0.5">Assign skillsets to staff members.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Staff Member</th>
                <th className="px-6 py-4 font-semibold">Assigned Skillsets</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400 animate-pulse">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-500">No staff found.</td></tr>
              ) : filtered.map(member => {
                const memberAssignments = assignments
                  .filter(a => a.company_member_id === member.company_member_id);
                return (
                  <tr key={member.company_member_id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-700">
                          {member.full_name.charAt(0).toUpperCase()}
                        </div>
                        {member.full_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {memberAssignments.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {memberAssignments.map(a => (
                            <span key={a.staff_skillset_id} className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 pl-2 pr-1 py-0.5 text-xs font-medium">
                              {a.skillset_name}
                              <button
                                onClick={() => unassignSkill(a.staff_skillset_id)}
                                disabled={removingId === a.staff_skillset_id}
                                title="Unassign"
                                className="rounded-full hover:bg-rose-200 disabled:opacity-50 transition-colors p-0.5"
                              >
                                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">No skillsets assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openAssign(member)}
                        className="rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 shadow-sm transition-all opacity-0 group-hover:opacity-100"
                      >Assign Skillset</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Assign Skillset</h3>
                <p className="text-sm text-slate-500 mt-1 font-semibold text-slate-700">{assignModal.full_name}</p>
              </div>
              <button onClick={() => setAssignModal(null)} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full p-2 transition-colors border border-slate-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            {skillsets.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No skillsets available. Add them in Company Admin.</p>
            ) : (
              <select value={selectedSkillset} onChange={e => setSelectedSkillset(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-rose-400 focus:outline-none transition-all"
              >
                <option value="">— Select a skillset —</option>
                {skillsets.map(skill => <option key={skill.skillset_id} value={skill.skillset_id}>{skill.skillset_name}</option>)}
              </select>
            )}
            {saveError && <p className="mt-3 text-sm text-rose-600 font-medium">{saveError}</p>}
            {saveSuccess && <p className="mt-3 text-sm text-emerald-600 font-medium">{saveSuccess}</p>}
            <div className="mt-6 flex gap-3">
              <button onClick={saveSkill} disabled={saving || !selectedSkillset}
                className="rounded-xl bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 shadow-sm transition-colors disabled:opacity-60"
              >{saving ? 'Saving...' : 'Assign'}</button>
              <button onClick={() => setAssignModal(null)}
                className="rounded-xl bg-white border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
