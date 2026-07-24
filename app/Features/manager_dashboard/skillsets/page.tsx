'use client';

import { useState } from 'react';

type Staff = { id: string; full_name: string; email: string; skillsets: string[] };
type Skillset = { id: string; name: string; category: string };

export default function SkillsetsPage() {
  const [staff, setStaff] = useState<Staff[]>([
    { id: 'S001', full_name: 'Ahmad Farid', email: 'farid@harbourfoods.sg', skillsets: ['SK01', 'SK03'] },
    { id: 'S002', full_name: 'Wei Jie Lim', email: 'weijie@harbourfoods.sg', skillsets: ['SK02', 'SK04'] },
    { id: 'S003', full_name: 'Rajan Kumar', email: 'rajan@harbourfoods.sg', skillsets: ['SK05'] },
    { id: 'S004', full_name: 'Priya Nair', email: 'priya@harbourfoods.sg', skillsets: [] },
  ]);
  const [skillsets, setSkillsets] = useState<Skillset[]>([
    { id: 'SK01', name: 'Forklift Operation', category: 'Warehouse' },
    { id: 'SK02', name: 'Cold Chain Management', category: 'Logistics' },
    { id: 'SK03', name: 'Food Safety Handling', category: 'Quality Control' },
    { id: 'SK04', name: 'Route Planning', category: 'Logistics' },
    { id: 'SK05', name: 'Inventory Counting', category: 'Warehouse' },
    { id: 'SK06', name: 'Customer Service', category: 'Operations' },
  ]);
  const [loading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [assignModal, setAssignModal] = useState<Staff | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  function openAssign(member: Staff) {
    setAssignModal(member);
    setSelectedSkills(member.skillsets || []);
    setSaveError('');
    setSaveSuccess('');
  }

  function toggleSkill(skillId: string) {
    setSelectedSkills(prev =>
      prev.includes(skillId) ? prev.filter(s => s !== skillId) : [...prev, skillId]
    );
  }

  async function saveSkills() {
    if (!assignModal) return;
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch(`${API_URL}/api/manager/staff/${assignModal.id}/skillsets`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillset_ids: selectedSkills }),
      });
      const d = await res.json();
      if (d.success) {
        setStaff(prev => prev.map(s => s.id === assignModal.id ? { ...s, skillsets: selectedSkills } : s));
        setSaveSuccess('Skillsets updated.');
        setTimeout(() => { setAssignModal(null); setSaveSuccess(''); }, 1200);
      } else {
        setSaveError(d.message || 'Failed to save.');
      }
    } catch { setSaveError('Could not reach the server.'); }
    finally { setSaving(false); }
  }

  const filtered = staff.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
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
          <p className="text-sm text-slate-500 mt-0.5">Assign or update skillsets for each staff member.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Staff Member</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Assigned Skillsets</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 animate-pulse">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">No staff found.</td></tr>
              ) : filtered.map(member => {
                const assignedNames = (member.skillsets || [])
                  .map(id => skillsets.find(s => s.id === id)?.name)
                  .filter(Boolean);
                return (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-700">
                          {member.full_name.charAt(0).toUpperCase()}
                        </div>
                        {member.full_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{member.email}</td>
                    <td className="px-6 py-4">
                      {assignedNames.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {assignedNames.map(name => (
                            <span key={name} className="rounded-full bg-rose-50 text-rose-700 px-2 py-0.5 text-xs font-medium">{name}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">No skillsets assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openAssign(member)}
                        className="rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 shadow-sm transition-all opacity-0 group-hover:opacity-100"
                      >Assign / Update</button>
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
                <h3 className="text-xl font-bold text-slate-900">Assign Skillsets</h3>
                <p className="text-sm text-slate-500 mt-1 font-semibold text-slate-700">{assignModal.full_name}</p>
              </div>
              <button onClick={() => setAssignModal(null)} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full p-2 transition-colors border border-slate-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            {skillsets.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No skillsets available. Add them in Company Admin.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {skillsets.map(skill => (
                  <label key={skill.id} className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 cursor-pointer transition-all text-sm font-medium ${
                    selectedSkills.includes(skill.id)
                      ? 'border-rose-400 bg-rose-50 text-rose-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}>
                    <input type="checkbox" checked={selectedSkills.includes(skill.id)} onChange={() => toggleSkill(skill.id)} className="accent-rose-600" />
                    <span>{skill.name}</span>
                  </label>
                ))}
              </div>
            )}
            {saveError && <p className="mt-3 text-sm text-rose-600 font-medium">{saveError}</p>}
            {saveSuccess && <p className="mt-3 text-sm text-emerald-600 font-medium">{saveSuccess}</p>}
            <div className="mt-6 flex gap-3">
              <button onClick={saveSkills} disabled={saving}
                className="rounded-xl bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 shadow-sm transition-colors disabled:opacity-60"
              >{saving ? 'Saving...' : 'Save Skillsets'}</button>
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
