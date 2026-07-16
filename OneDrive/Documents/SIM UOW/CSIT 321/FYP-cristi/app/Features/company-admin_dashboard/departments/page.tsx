'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Department = {
  id: string;
  name: string;
  description: string;
  manager_name: string;
  staff_count: number;
  created_at: string;
};

const EMPTY_FORM = { name: '', description: '' };

function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([
    { id: 'D001', name: 'Operations', description: 'Oversees day-to-day business operations and staff coordination.', manager_name: 'Ahmad Farid', staff_count: 8, created_at: '2025-01-10' },
    { id: 'D002', name: 'Logistics', description: 'Handles delivery routes, fleet management, and supply chain.', manager_name: 'Hafiz Zulkifli', staff_count: 6, created_at: '2025-01-10' },
    { id: 'D003', name: 'Warehouse', description: 'Manages stock receiving, storage, and inventory control.', manager_name: null, staff_count: 5, created_at: '2025-03-22' },
    { id: 'D004', name: 'Quality Control', description: 'Ensures all food products meet safety and quality standards.', manager_name: null, staff_count: 3, created_at: '2025-06-01' },
  ]);
  const [loading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  }

  function openEdit(dept: Department) {
    setEditing(dept);
    setForm({ name: dept.name, description: dept.description });
    setFormError('');
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { setFormError('Department name is required.'); return; }
    setSaving(true);
    setFormError('');
    try {
      const url = editing
        ? `${API_URL}/api/company-admin/departments/${editing.id}`
        : `${API_URL}/api/company-admin/departments`;
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (d.success) {
        if (editing) {
          setDepartments(prev => prev.map(dept => dept.id === editing.id ? d.department : dept));
        } else {
          setDepartments(prev => [d.department, ...prev]);
        }
        setShowModal(false);
      } else {
        setFormError(d.message || 'Failed to save.');
      }
    } catch {
      setFormError('Could not reach the server.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteDepartment(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`${API_URL}/api/company-admin/departments/${id}`, {
        method: 'DELETE', credentials: 'include',
      });
      const d = await res.json();
      if (d.success) setDepartments(prev => prev.filter(dept => dept.id !== id));
    } catch {}
    finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  }

  const filtered = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-1 items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm border border-slate-200">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Search departments..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition-colors whitespace-nowrap"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Department
        </button>
      </div>

      {error && <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium">{error}</div>}

      {/* Table */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Department</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold">Manager</th>
                <th className="px-6 py-4 font-semibold">Staff Count</th>
                <th className="px-6 py-4 font-semibold">Created</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 animate-pulse">Loading departments...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No departments found.</td></tr>
              ) : filtered.map(dept => (
                <tr key={dept.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-sky-100 flex items-center justify-center text-xs font-bold text-sky-700">
                        {dept.name?.charAt(0).toUpperCase()}
                      </div>
                      {dept.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{dept.description || '—'}</td>
                  <td className="px-6 py-4 text-slate-600">{dept.manager_name || <span className="italic text-slate-400">Unassigned</span>}</td>
                  <td className="px-6 py-4 text-slate-600">{dept.staff_count ?? '—'}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(dept.created_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(dept)}
                        className="rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 shadow-sm transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(dept.id)}
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

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{editing ? 'Edit Department' : 'New Department'}</h3>
                <p className="text-sm text-slate-500 mt-1">{editing ? `Editing "${editing.name}"` : 'Create a new department for your company.'}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full p-2 transition-colors border border-slate-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department Name <span className="text-rose-500">*</span></label>
                <input type="text" placeholder="e.g. Inventory & Logistics" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea placeholder="Brief description of this department..." value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none"
                />
              </div>
            </div>
            {formError && <p className="mt-3 text-sm text-rose-600 font-medium">{formError}</p>}
            <div className="mt-6 flex gap-3">
              <button onClick={handleSave} disabled={saving}
                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Department'}
              </button>
              <button onClick={() => setShowModal(false)}
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
            <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Delete Department?</h3>
            <p className="text-center text-sm text-slate-500 mb-8">This will permanently remove the department.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => deleteDepartment(confirmDeleteId)} disabled={deletingId === confirmDeleteId}
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
