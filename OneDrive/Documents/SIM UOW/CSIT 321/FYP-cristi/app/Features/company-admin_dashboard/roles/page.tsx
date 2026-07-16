'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Role = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  user_count: number;
};

type User = {
  id: string;
  full_name: string;
  email: string;
  role: string;
};

const ALL_PERMISSIONS = [
  'view_tasks',
  'create_tasks',
  'edit_tasks',
  'delete_tasks',
  'assign_tasks',
  'view_staff',
  'manage_staff',
  'view_reports',
  'manage_departments',
  'manage_skillsets',
  'view_audit_log',
];

const EMPTY_ROLE_FORM = { name: '', description: '', permissions: [] as string[] };

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([
    { id: 'R001', name: 'Manager', description: 'Full access to task management and staff oversight.', permissions: ['view_tasks','create_tasks','edit_tasks','delete_tasks','assign_tasks','view_staff','manage_staff','view_reports'], user_count: 2 },
    { id: 'R002', name: 'Full Time Staff', description: 'Can view and manage assigned tasks.', permissions: ['view_tasks','create_tasks','edit_tasks','view_staff'], user_count: 2 },
    { id: 'R003', name: 'Part Time Staff', description: 'View-only access to allocated tasks.', permissions: ['view_tasks'], user_count: 2 },
  ]);
  const [loading] = useState(false);
  const [error, setError] = useState('');

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState(EMPTY_ROLE_FORM);
  const [roleSaving, setRoleSaving] = useState(false);
  const [roleFormError, setRoleFormError] = useState('');

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignRole, setAssignRole] = useState<Role | null>(null);
  const [users, setUsers] = useState<User[]>([
    { id: 'U001', full_name: 'Ahmad Farid', email: 'farid@harbourfoods.sg', role: 'manager' },
    { id: 'U002', full_name: 'Wei Jie Lim', email: 'weijie@harbourfoods.sg', role: 'full_time_staff' },
    { id: 'U003', full_name: 'Rajan Kumar', email: 'rajan@harbourfoods.sg', role: 'part_time_staff' },
  ]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');

  function openCreate() {
    setEditingRole(null);
    setRoleForm(EMPTY_ROLE_FORM);
    setRoleFormError('');
    setShowRoleModal(true);
  }

  function openEdit(role: Role) {
    setEditingRole(role);
    setRoleForm({ name: role.name, description: role.description, permissions: role.permissions || [] });
    setRoleFormError('');
    setShowRoleModal(true);
  }

  function togglePermission(perm: string) {
    setRoleForm(f => ({
      ...f,
      permissions: f.permissions.includes(perm)
        ? f.permissions.filter(p => p !== perm)
        : [...f.permissions, perm],
    }));
  }

  async function saveRole() {
    if (!roleForm.name.trim()) { setRoleFormError('Role name is required.'); return; }
    setRoleSaving(true);
    setRoleFormError('');
    try {
      const url = editingRole
        ? `${API_URL}/api/company-admin/roles/${editingRole.id}`
        : `${API_URL}/api/company-admin/roles`;
      const res = await fetch(url, {
        method: editingRole ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleForm),
      });
      const d = await res.json();
      if (d.success) {
        if (editingRole) {
          setRoles(prev => prev.map(r => r.id === editingRole.id ? d.role : r));
        } else {
          setRoles(prev => [d.role, ...prev]);
        }
        setShowRoleModal(false);
      } else {
        setRoleFormError(d.message || 'Failed to save.');
      }
    } catch {
      setRoleFormError('Could not reach the server.');
    } finally {
      setRoleSaving(false);
    }
  }

  async function deleteRole(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`${API_URL}/api/company-admin/roles/${id}`, {
        method: 'DELETE', credentials: 'include',
      });
      const d = await res.json();
      if (d.success) setRoles(prev => prev.filter(r => r.id !== id));
    } catch {}
    finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  }

  function openAssign(role: Role) {
    setAssignRole(role);
    setSelectedUserId('');
    setAssignError('');
    setAssignSuccess('');
    setShowAssignModal(true);
  }

  async function assignRoleToUser() {
    if (!selectedUserId || !assignRole) return;
    setAssigning(true);
    setAssignError('');
    setAssignSuccess('');
    try {
      const res = await fetch(`${API_URL}/api/company-admin/roles/${assignRole.id}/assign`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: selectedUserId }),
      });
      const d = await res.json();
      if (d.success) {
        setAssignSuccess('Role assigned successfully.');
        setTimeout(() => { setShowAssignModal(false); setAssignSuccess(''); }, 1500);
      } else {
        setAssignError(d.message || 'Failed to assign role.');
      }
    } catch {
      setAssignError('Could not reach the server.');
    } finally {
      setAssigning(false);
    }
  }

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">

      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Roles</h2>
          <p className="text-sm text-slate-500 mt-0.5">Define roles and control access permissions.</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Role
        </button>
      </div>

      {error && <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium">{error}</div>}

      {/* Roles Grid */}
      {loading ? (
        <div className="rounded-2xl bg-white border border-slate-200 px-6 py-12 text-center text-slate-400 animate-pulse">Loading roles...</div>
      ) : roles.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 px-6 py-12 text-center text-slate-500">No roles defined yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map(role => (
            <div key={role.id} className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-700"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <h3 className="font-bold text-slate-900 capitalize">{role.name}</h3>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{role.description || <span className="italic">No description</span>}</p>
                </div>
                <span className="rounded-full bg-slate-100 text-slate-600 px-2.5 py-1 text-xs font-semibold whitespace-nowrap">{role.user_count ?? 0} users</span>
              </div>

              {role.permissions && role.permissions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions.slice(0, 5).map(p => (
                    <span key={p} className="rounded-full bg-indigo-50 text-indigo-700 px-2 py-0.5 text-xs font-medium">{p.replace(/_/g, ' ')}</span>
                  ))}
                  {role.permissions.length > 5 && (
                    <span className="rounded-full bg-slate-100 text-slate-500 px-2 py-0.5 text-xs font-medium">+{role.permissions.length - 5} more</span>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button onClick={() => openAssign(role)}
                  className="flex-1 rounded-xl bg-indigo-50 text-indigo-700 px-3 py-2 text-xs font-semibold hover:bg-indigo-100 transition-colors"
                >
                  Assign to User
                </button>
                <button onClick={() => openEdit(role)}
                  className="rounded-xl bg-slate-50 text-slate-700 px-3 py-2 text-xs font-semibold hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  Edit
                </button>
                <button onClick={() => setConfirmDeleteId(role.id)}
                  className="rounded-xl bg-rose-50 text-rose-700 px-3 py-2 text-xs font-semibold hover:bg-rose-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{editingRole ? 'Edit Role' : 'New Role'}</h3>
                <p className="text-sm text-slate-500 mt-1">Set a name and select the permissions for this role.</p>
              </div>
              <button onClick={() => setShowRoleModal(false)} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full p-2 transition-colors border border-slate-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role Name <span className="text-rose-500">*</span></label>
                <input type="text" placeholder="e.g. Warehouse Supervisor" value={roleForm.name}
                  onChange={e => setRoleForm(f => ({ ...f, name: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <input type="text" placeholder="Brief description..." value={roleForm.description}
                  onChange={e => setRoleForm(f => ({ ...f, description: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_PERMISSIONS.map(perm => (
                    <label key={perm} className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 cursor-pointer transition-all text-sm font-medium ${
                      roleForm.permissions.includes(perm)
                        ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}>
                      <input type="checkbox" checked={roleForm.permissions.includes(perm)} onChange={() => togglePermission(perm)} className="accent-indigo-600" />
                      {perm.replace(/_/g, ' ')}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            {roleFormError && <p className="mt-3 text-sm text-rose-600 font-medium">{roleFormError}</p>}
            <div className="mt-6 flex gap-3">
              <button onClick={saveRole} disabled={roleSaving}
                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-60"
              >
                {roleSaving ? 'Saving...' : editingRole ? 'Save Changes' : 'Create Role'}
              </button>
              <button onClick={() => setShowRoleModal(false)}
                className="rounded-xl bg-white border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Role Modal */}
      {showAssignModal && assignRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Assign Role</h3>
                <p className="text-sm text-slate-500 mt-1">Assign <span className="font-semibold text-indigo-600 capitalize">{assignRole.name}</span> to a user.</p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full p-2 transition-colors border border-slate-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select User</label>
              <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-semibold focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
              >
                <option value="">— Select a user —</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                ))}
              </select>
            </div>
            {assignError && <p className="mt-3 text-sm text-rose-600 font-medium">{assignError}</p>}
            {assignSuccess && <p className="mt-3 text-sm text-emerald-600 font-medium">{assignSuccess}</p>}
            <div className="mt-6 flex gap-3">
              <button onClick={assignRoleToUser} disabled={assigning || !selectedUserId}
                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-60"
              >
                {assigning ? 'Assigning...' : 'Assign Role'}
              </button>
              <button onClick={() => setShowAssignModal(false)}
                className="rounded-xl bg-white border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white px-10 py-10 rounded-3xl shadow-2xl w-full max-w-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-600"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Delete Role?</h3>
            <p className="text-center text-sm text-slate-500 mb-8">This will permanently remove this role. Users assigned to it will lose the role.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => deleteRole(confirmDeleteId)} disabled={deletingId === confirmDeleteId}
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
