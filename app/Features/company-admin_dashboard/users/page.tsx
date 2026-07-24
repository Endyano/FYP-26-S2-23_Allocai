'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type User = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  department: string;
  is_suspended: boolean;
  created_at: string;
};

function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([
    { id: 'U001', full_name: 'Ahmad Farid', email: 'farid@harbourfoods.sg', role: 'manager', department: 'Operations', is_suspended: false, created_at: '2025-08-15' },
    { id: 'U002', full_name: 'Wei Jie Lim', email: 'weijie@harbourfoods.sg', role: 'full_time_staff', department: 'Logistics', is_suspended: false, created_at: '2025-09-01' },
    { id: 'U003', full_name: 'Rajan Kumar', email: 'rajan@harbourfoods.sg', role: 'part_time_staff', department: 'Warehouse', is_suspended: false, created_at: '2025-10-20' },
    { id: 'U004', full_name: 'Mei Lin Chen', email: 'meilin@harbourfoods.sg', role: 'full_time_staff', department: 'Operations', is_suspended: true, created_at: '2025-07-10' },
    { id: 'U005', full_name: 'Hafiz Zulkifli', email: 'hafiz@harbourfoods.sg', role: 'manager', department: 'Logistics', is_suspended: false, created_at: '2026-01-05' },
    { id: 'U006', full_name: 'Priya Nair', email: 'priya@harbourfoods.sg', role: 'part_time_staff', department: 'Warehouse', is_suspended: false, created_at: '2026-02-18' },
  ]);
  const [loading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ full_name: '', email: '', role: 'manager' });
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  async function toggleSuspend(user: User) {
    try {
      const res = await fetch(`${API_URL}/api/company-admin/users/${user.id}/suspend`, {
        method: 'PATCH', credentials: 'include',
      });
      const d = await res.json();
      if (d.success) setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_suspended: d.is_suspended } : u));
    } catch {}
  }

  async function deleteUser(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`${API_URL}/api/company-admin/users/${id}`, {
        method: 'DELETE', credentials: 'include',
      });
      const d = await res.json();
      if (d.success) setUsers(prev => prev.filter(u => u.id !== id));
    } catch {}
    finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  }

  async function sendInvite() {
    setInviting(true);
    setInviteError('');
    setInviteSuccess('');
    try {
      const res = await fetch(`${API_URL}/api/company-admin/users/invite`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm),
      });
      const d = await res.json();
      if (d.success) {
        setInviteSuccess(`Invitation sent to ${inviteForm.email}.`);
        if (d.user) setUsers(prev => [d.user, ...prev]);
        setTimeout(() => { setShowInviteModal(false); setInviteSuccess(''); }, 1800);
      } else {
        setInviteError(d.message || 'Failed to send invitation.');
      }
    } catch {
      setInviteError('Could not reach the server.');
    } finally {
      setInviting(false);
    }
  }

  const roles = ['All', ...Array.from(new Set(users.map(u => u.role).filter(Boolean)))];

  const filtered = users.filter(u => {
    const matchSearch = u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-1 items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm border border-slate-200">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="rounded-2xl bg-white border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-indigo-400"
        >
          {roles.map(r => <option key={r}>{r}</option>)}
        </select>
        <button
          onClick={() => { setShowInviteModal(true); setInviteError(''); setInviteSuccess(''); setInviteForm({ full_name: '', email: '', role: 'manager' }); }}
          className="flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition-colors whitespace-nowrap"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Invite User
        </button>
      </div>

      {error && <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium">{error}</div>}

      {/* Table */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Department</th>
                <th className="px-6 py-4 font-semibold">Joined</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400 animate-pulse">Loading users...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">No users found.</td></tr>
              ) : filtered.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                        {user.full_name?.charAt(0).toUpperCase()}
                      </div>
                      {user.full_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-slate-100 text-slate-700 px-2.5 py-1 text-xs font-semibold capitalize">{user.role || '—'}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{user.department || '—'}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(user.created_at)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      user.is_suspended
                        ? 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20'
                        : 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${user.is_suspended ? 'bg-rose-500' : 'bg-emerald-500'}`}/>
                      {user.is_suspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleSuspend(user)}
                        className="rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-50 hover:border-amber-200 shadow-sm transition-all"
                      >
                        {user.is_suspended ? 'Unsuspend' : 'Suspend'}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(user.id)}
                        className="rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-200 shadow-sm transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Invite User</h3>
                <p className="text-sm text-slate-500 mt-1">Send an invitation to join the platform.</p>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full p-2 transition-colors border border-slate-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <input type="text" placeholder="e.g. Sarah Jenkins" value={inviteForm.full_name}
                  onChange={e => setInviteForm(f => ({ ...f, full_name: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <input type="email" placeholder="user@company.com" value={inviteForm.email}
                  onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role</label>
                <select value={inviteForm.role} onChange={e => setInviteForm(f => ({ ...f, role: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-semibold focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                >
                  <option value="manager">Manager</option>
                  <option value="full_time_staff">Full Time Staff</option>
                  <option value="part_time_staff">Part Time Staff</option>
                </select>
              </div>
            </div>
            {inviteError && <p className="mt-3 text-sm text-rose-600 font-medium">{inviteError}</p>}
            {inviteSuccess && <p className="mt-3 text-sm text-emerald-600 font-medium">{inviteSuccess}</p>}
            <div className="mt-6 flex gap-3">
              <button onClick={sendInvite} disabled={inviting}
                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-60"
              >
                {inviting ? 'Sending...' : 'Send Invitation'}
              </button>
              <button onClick={() => setShowInviteModal(false)}
                className="rounded-xl bg-white border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white px-10 py-10 rounded-3xl shadow-2xl w-full max-w-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-600"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Delete User?</h3>
            <p className="text-center text-sm text-slate-500 mb-8">This will permanently remove the user and all their data.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => deleteUser(confirmDeleteId)} disabled={deletingId === confirmDeleteId}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl shadow-sm transition-colors disabled:opacity-60"
              >
                {deletingId === confirmDeleteId ? 'Deleting...' : 'Yes, delete'}
              </button>
              <button onClick={() => setConfirmDeleteId(null)}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
