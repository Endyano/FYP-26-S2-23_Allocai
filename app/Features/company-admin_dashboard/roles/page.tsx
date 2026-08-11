'use client';

import { useEffect, useState } from 'react';
import { apiFetch, apiPost } from '@/lib/api';

type Permission = { permission_id: string; permission_key: string; description: string | null };

type Role = {
  role_id: string;
  role_name: string;
  role_description: string | null;
  is_system_role: boolean;
  permissions: Permission[];
};

type Employee = {
  company_member_id: string;
  full_name: string;
  email: string;
  role: string;
};

const EMPTY_ROLE_FORM = { role_name: '', role_description: '', permission_ids: [] as string[] };

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState(EMPTY_ROLE_FORM);
  const [roleSaving, setRoleSaving] = useState(false);
  const [roleFormError, setRoleFormError] = useState('');

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignRole, setAssignRole] = useState<Role | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');
  const [confirmingChange, setConfirmingChange] = useState(false);

  async function loadAll() {
    setLoading(true);
    setError('');
    const [rolesRes, permsRes, employeesRes] = await Promise.all([
      apiFetch<{ roles: Role[] }>('/api/company-admin/roles'),
      apiFetch<{ permissions: Permission[] }>('/api/company-admin/permissions'),
      apiFetch<{ employees: Employee[] }>('/api/company-admin/employees'),
    ]);
    if (rolesRes.success) setRoles(rolesRes.roles || []);
    else setError(rolesRes.message || 'Could not load roles.');
    if (permsRes.success) setPermissions(permsRes.permissions || []);
    if (employeesRes.success) setEmployees(employeesRes.employees || []);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function openCreate() {
    setEditingRole(null);
    setRoleForm(EMPTY_ROLE_FORM);
    setRoleFormError('');
    setShowRoleModal(true);
  }

  function openEdit(role: Role) {
    setEditingRole(role);
    setRoleForm({
      role_name: role.role_name,
      role_description: role.role_description || '',
      permission_ids: role.permissions.map(p => p.permission_id),
    });
    setRoleFormError('');
    setShowRoleModal(true);
  }

  function togglePermission(permissionId: string) {
    setRoleForm(f => ({
      ...f,
      permission_ids: f.permission_ids.includes(permissionId)
        ? f.permission_ids.filter(p => p !== permissionId)
        : [...f.permission_ids, permissionId],
    }));
  }

  async function saveRole() {
    if (!roleForm.role_name.trim()) { setRoleFormError('Role name is required.'); return; }
    setRoleSaving(true);
    setRoleFormError('');
    try {
      let result;
      if (editingRole) {
        result = await apiFetch<{ role: Role }>(`/api/company-admin/roles/${editingRole.role_id}`, {
          method: 'PUT',
          body: JSON.stringify(roleForm),
        });
      } else {
        // create_role only accepts name/description; permissions are attached
        // via a follow-up update once the role exists.
        const createResult = await apiPost<{ role: Role }>('/api/company-admin/roles', {
          role_name: roleForm.role_name,
          role_description: roleForm.role_description,
        });
        if (createResult.success && roleForm.permission_ids.length > 0) {
          result = await apiFetch<{ role: Role }>(`/api/company-admin/roles/${createResult.role.role_id}`, {
            method: 'PUT',
            body: JSON.stringify({ permission_ids: roleForm.permission_ids }),
          });
        } else {
          result = createResult;
        }
      }

      if (result.success) {
        setShowRoleModal(false);
        await loadAll();
      } else {
        setRoleFormError(result.message || 'Failed to save.');
      }
    } catch {
      setRoleFormError('Could not reach the server.');
    } finally {
      setRoleSaving(false);
    }
  }

  function openAssign(role: Role) {
    setAssignRole(role);
    setSelectedMemberId('');
    setAssignError('');
    setAssignSuccess('');
    setConfirmingChange(false);
    setShowAssignModal(true);
  }

  const selectedMember = employees.find(e => e.company_member_id === selectedMemberId) || null;
  const targetRoleName = assignRole?.role_name.replace(/_/g, ' ') || '';
  const hasRoleConflict = !!selectedMember && !!selectedMember.role && selectedMember.role !== assignRole?.role_name;

  function handleAssignClick() {
    if (hasRoleConflict && !confirmingChange) {
      setConfirmingChange(true);
      return;
    }
    assignRoleToMember();
  }

  async function assignRoleToMember() {
    if (!selectedMemberId || !assignRole) return;
    setAssigning(true);
    setAssignError('');
    setAssignSuccess('');
    try {
      const result = await apiPost(`/api/company-admin/employees/${selectedMemberId}/roles`, {
        role_id: assignRole.role_id,
      });
      if (result.success) {
        setAssignSuccess('Role assigned successfully.');
        setConfirmingChange(false);
        setTimeout(() => { setShowAssignModal(false); setAssignSuccess(''); }, 1500);
        loadAll();
      } else {
        setAssignError(result.message || 'Failed to assign role.');
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
            <div key={role.role_id} className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-700"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <h3 className="font-bold text-slate-900 capitalize">{role.role_name.replace(/_/g, ' ')}</h3>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{role.role_description || <span className="italic">No description</span>}</p>
                </div>
                {role.is_system_role && (
                  <span className="rounded-full bg-slate-100 text-slate-600 px-2.5 py-1 text-xs font-semibold whitespace-nowrap">System</span>
                )}
              </div>

              {role.permissions && role.permissions.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions.map(p => (
                    <span
                      key={p.permission_id}
                      title={p.description || undefined}
                      className="rounded-full bg-indigo-50 text-indigo-700 px-2 py-0.5 text-xs font-medium cursor-help"
                    >
                      {p.permission_key.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No permissions assigned.</p>
              )}

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button onClick={() => openAssign(role)}
                  className="flex-1 rounded-xl bg-indigo-50 text-indigo-700 px-3 py-2 text-xs font-semibold hover:bg-indigo-100 transition-colors"
                >
                  Assign to Employee
                </button>
                {!role.is_system_role && (
                  <button onClick={() => openEdit(role)}
                    className="rounded-xl bg-slate-50 text-slate-700 px-3 py-2 text-xs font-semibold hover:bg-slate-100 transition-colors border border-slate-200"
                  >
                    Edit
                  </button>
                )}
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
                <input type="text" placeholder="e.g. Warehouse Supervisor" value={roleForm.role_name}
                  onChange={e => setRoleForm(f => ({ ...f, role_name: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <input type="text" placeholder="Brief description..." value={roleForm.role_description}
                  onChange={e => setRoleForm(f => ({ ...f, role_description: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Permissions</label>
                {permissions.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">No permissions available.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {permissions.map(perm => (
                      <label key={perm.permission_id} className={`flex items-start gap-2.5 rounded-xl border px-3 py-2.5 cursor-pointer transition-all ${
                        roleForm.permission_ids.includes(perm.permission_id)
                          ? 'border-indigo-400 bg-indigo-50'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}>
                        <input
                          type="checkbox"
                          checked={roleForm.permission_ids.includes(perm.permission_id)}
                          onChange={() => togglePermission(perm.permission_id)}
                          className="accent-indigo-600 mt-0.5"
                        />
                        <span>
                          <span className={`block text-sm font-semibold capitalize ${
                            roleForm.permission_ids.includes(perm.permission_id) ? 'text-indigo-700' : 'text-slate-700'
                          }`}>
                            {perm.permission_key.replace(/_/g, ' ')}
                          </span>
                          {perm.description && (
                            <span className="block text-xs text-slate-500 mt-0.5">{perm.description}</span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
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
                <p className="text-sm text-slate-500 mt-1">Assign <span className="font-semibold text-indigo-600 capitalize">{assignRole.role_name.replace(/_/g, ' ')}</span> to an employee.</p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full p-2 transition-colors border border-slate-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Employee</label>
              <select value={selectedMemberId} onChange={e => { setSelectedMemberId(e.target.value); setConfirmingChange(false); setAssignError(''); }}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-semibold focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
              >
                <option value="">— Select an employee —</option>
                {employees.map(e => (
                  <option key={e.company_member_id} value={e.company_member_id}>
                    {e.full_name} ({e.email}){e.role ? ` — currently ${e.role.replace(/_/g, ' ')}` : ''}
                  </option>
                ))}
              </select>
            </div>
            {hasRoleConflict && (
              <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                <span className="font-semibold">{selectedMember?.full_name}</span> is currently <span className="font-semibold capitalize">{selectedMember?.role.replace(/_/g, ' ')}</span>. Assigning <span className="font-semibold capitalize">{targetRoleName}</span> will remove their current role — are you sure?
              </div>
            )}
            {assignError && <p className="mt-3 text-sm text-rose-600 font-medium">{assignError}</p>}
            {assignSuccess && <p className="mt-3 text-sm text-emerald-600 font-medium">{assignSuccess}</p>}
            <div className="mt-6 flex gap-3">
              <button onClick={handleAssignClick} disabled={assigning || !selectedMemberId}
                className={`rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors disabled:opacity-60 ${
                  hasRoleConflict && confirmingChange ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {assigning ? 'Assigning...' : hasRoleConflict && confirmingChange ? 'Yes, Change Role' : hasRoleConflict ? 'Continue' : 'Assign Role'}
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
    </div>
  );
}
