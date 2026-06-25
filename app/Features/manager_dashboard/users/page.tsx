'use client';

import { useState } from 'react';

type Staff = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_suspended: boolean;
  max_weekly_hours: number;
};

const MOCK_STAFF: Staff[] = [
  { id: 'FT-001', full_name: 'Wei Jie Lim',          email: 'weijie@harbourfoods.sg',  role: 'Full Time Staff', is_suspended: false, max_weekly_hours: 44 },
  { id: 'FT-002', full_name: 'Mei Lin Chen',          email: 'meilin@harbourfoods.sg',  role: 'Full Time Staff', is_suspended: true,  max_weekly_hours: 44 },
  { id: 'FT-003', full_name: 'Nurul Huda Binte Aziz', email: 'nurulhuda@harbourfoods.sg',role: 'Full Time Staff', is_suspended: false, max_weekly_hours: 44 },
  { id: 'PT-001', full_name: 'Priya Nair',            email: 'priya@harbourfoods.sg',   role: 'Part Time Staff', is_suspended: false, max_weekly_hours: 16 },
  { id: 'PT-002', full_name: 'Kevin Loh Jun Hao',     email: 'kevin@harbourfoods.sg',   role: 'Part Time Staff', is_suspended: false, max_weekly_hours: 16 },
];

export default function UsersPage() {
  const [staffList, setStaffList] = useState<Staff[]>(MOCK_STAFF);
  const [loading] = useState(false);
  const [error] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [editForm, setEditForm] = useState({ full_name: '', email: '', max_weekly_hours: 16 });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');


  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function openEdit(staff: Staff) {
    setEditingStaff(staff);
    setEditForm({ full_name: staff.full_name, email: staff.email, max_weekly_hours: staff.max_weekly_hours });
    setEditError('');
  }

  function saveEdit() {
    if (!editingStaff) return;
    setEditSaving(true);
    setTimeout(() => {
      setStaffList(prev => prev.map(s => s.id === editingStaff.id ? { ...s, ...editForm } : s));
      setEditingStaff(null);
      setEditSaving(false);
    }, 500);
  }

  function toggleSuspend(staff: Staff) {
    setStaffList(prev => prev.map(s => s.id === staff.id ? { ...s, is_suspended: !s.is_suspended } : s));
  }

  function deleteStaff(staffId: string) {
    setDeletingId(staffId);
    setTimeout(() => {
      setStaffList(prev => prev.filter(s => s.id !== staffId));
      setDeletingId(null);
      setConfirmDeleteId(null);
    }, 500);
  }


  const filtered = staffList.filter(s =>
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">

      {/* Search bar */}
      <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm border border-slate-200">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          type="text"
          placeholder="Search staff by name or email..."
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
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Max Hours/Week</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400 animate-pulse">Loading staff...</td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map(staff => (
                  <tr key={staff.id} className="transition-colors hover:bg-slate-50 group">
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                        {staff.full_name.charAt(0).toUpperCase()}
                      </div>
                      {staff.full_name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{staff.email}</td>
                    <td className="px-6 py-4 text-slate-600">{staff.max_weekly_hours} hrs</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        staff.is_suspended
                          ? 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20'
                          : 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${staff.is_suspended ? 'bg-rose-500' : 'bg-emerald-500'}`}/>
                        {staff.is_suspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => openEdit(staff)}
                          className="rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggleSuspend(staff)}
                          className="rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-50 hover:border-amber-200 shadow-sm transition-all"
                        >
                          {staff.is_suspended ? 'Unsuspend' : 'Suspend'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(staff.id)}
                          className="rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-200 shadow-sm transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    {searchQuery ? `No staff found matching "${searchQuery}"` : 'No staff members yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit modal */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Edit Staff</h3>
                <p className="text-sm text-slate-500 mt-1">Updating <span className="font-semibold text-indigo-600">{editingStaff.full_name}</span></p>
              </div>
              <button onClick={() => setEditingStaff(null)} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full p-2 transition-colors border border-slate-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Max Weekly Hours</label>
                <input
                  type="number"
                  min={1}
                  value={editForm.max_weekly_hours}
                  onChange={e => setEditForm(f => ({ ...f, max_weekly_hours: Number(e.target.value) }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>
            </div>

            {editError && <p className="mt-3 text-sm text-rose-600 font-medium">{editError}</p>}

            <div className="mt-6 flex gap-3">
              <button
                onClick={saveEdit}
                disabled={editSaving}
                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 shadow-sm active:scale-95 disabled:opacity-60"
              >
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setEditingStaff(null)} className="rounded-xl bg-white border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Delete confirmation modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white px-10 py-10 rounded-3xl shadow-2xl w-full max-w-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-600"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Delete Staff?</h3>
            <p className="text-center text-sm text-slate-500 mb-8">This will permanently remove the staff member and all their assigned tasks.</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => deleteStaff(confirmDeleteId)}
                disabled={deletingId === confirmDeleteId}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl shadow-sm transition-colors disabled:opacity-60"
              >
                {deletingId === confirmDeleteId ? 'Deleting...' : 'Yes, delete'}
              </button>
              <button onClick={() => setConfirmDeleteId(null)} className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold py-3 rounded-xl transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
