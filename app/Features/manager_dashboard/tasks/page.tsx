'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Task = {
  id: string;
  task_name: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  status: string;
  task_date: string;
  start_time: string;
  end_time: string;
  staff_name: string | null;
  department_name: string | null;
};

const TIME_OPTIONS = Array.from({ length: 96 }, (_, i) => {
  const h = Math.floor(i / 4);
  const m = (i % 4) * 15;
  const value = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  const ampm = h >= 12 ? 'PM' : 'AM';
  return { value, label: `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}` };
});

const STATUS_STYLES: Record<string, string> = {
  Pending:   'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
  Approved:  'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
  Completed: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20',
  Cancelled: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20',
};

const EMPTY_FORM = { task_name: '', description: '', priority: 'Medium', task_date: '', start_time: '', end_time: '' };

function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatTime(t: string) {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', task_name: 'Morning Stock Check', description: 'Count all warehouse items and update inventory sheet.', priority: 'High', status: 'Pending', task_date: '2026-06-25', start_time: '08:00', end_time: '12:00', staff_name: null, department_name: null },
    { id: '2', task_name: 'Delivery Route A', description: 'Complete morning deliveries for zone A customers.', priority: 'Medium', status: 'Approved', task_date: '2026-06-25', start_time: '09:00', end_time: '14:00', staff_name: 'Wei Jie Lim', department_name: null },
    { id: '3', task_name: 'Cold Storage Inspection', description: 'Verify temperature logs and check for expiry.', priority: 'High', status: 'Completed', task_date: '2026-06-24', start_time: '10:00', end_time: '12:00', staff_name: 'Priya Nair', department_name: null },
    { id: '4', task_name: 'Inventory Reconciliation', description: 'Match physical stock count with system records.', priority: 'Low', status: 'Pending', task_date: '2026-06-26', start_time: '14:00', end_time: '17:00', staff_name: null, department_name: null },
    { id: '5', task_name: 'Customer Returns Processing', description: 'Process and document all returned goods.', priority: 'Medium', status: 'Cancelled', task_date: '2026-06-23', start_time: '13:00', end_time: '15:00', staff_name: 'Hafiz Zulkifli', department_name: null },
  ]);
  const [loading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  function openCreate() {
    setEditingTask(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setFormSuccess('');
    setShowModal(true);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setForm({
      task_name: task.task_name,
      description: task.description || '',
      priority: task.priority,
      task_date: task.task_date,
      start_time: task.start_time,
      end_time: task.end_time,
    });
    setFormError('');
    setFormSuccess('');
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.task_name.trim() || !form.task_date || !form.start_time || !form.end_time) {
      setFormError('Title, date, and times are required.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const url = editingTask
        ? `${API_URL}/api/manager/tasks/${editingTask.id}`
        : `${API_URL}/api/manager/tasks`;
      const res = await fetch(url, {
        method: editingTask ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (d.success) {
        if (editingTask) {
          setTasks(prev => prev.map(t => t.id === editingTask.id ? d.task : t));
        } else {
          setTasks(prev => [d.task, ...prev]);
        }
        setFormSuccess(editingTask ? 'Task updated.' : 'Task created.');
        setTimeout(() => { setShowModal(false); setFormSuccess(''); }, 1000);
      } else {
        setFormError(d.message || 'Failed to save.');
      }
    } catch { setFormError('Could not reach the server.'); }
    finally { setSaving(false); }
  }

  async function cancelTask(id: string) {
    setActingId(id);
    try {
      const res = await fetch(`${API_URL}/api/manager/tasks/${id}/cancel`, { method: 'PATCH', credentials: 'include' });
      const d = await res.json();
      if (d.success) setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'Cancelled' } : t));
    } catch {}
    finally { setActingId(null); setConfirmCancelId(null); }
  }

  async function deleteTask(id: string) {
    setActingId(id);
    try {
      const res = await fetch(`${API_URL}/api/manager/tasks/${id}`, { method: 'DELETE', credentials: 'include' });
      const d = await res.json();
      if (d.success) setTasks(prev => prev.filter(t => t.id !== id));
    } catch {}
    finally { setActingId(null); setConfirmDeleteId(null); }
  }

  const statuses = ['All', 'Pending', 'Approved', 'Completed', 'Cancelled'];
  const counts = statuses.reduce((acc, s) => {
    acc[s] = s === 'All' ? tasks.length : tasks.filter(t => t.status === s).length;
    return acc;
  }, {} as Record<string, number>);
  const filtered = statusFilter === 'All' ? tasks : tasks.filter(t => t.status === statusFilter);

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="flex gap-1.5 bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm flex-wrap">
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${statusFilter === s ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              {s} <span className="opacity-60">({counts[s]})</span>
            </button>
          ))}
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-rose-700 transition-colors whitespace-nowrap"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Task
        </button>
      </div>

      {error && <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium">{error}</div>}

      {/* Table */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Task</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Time</th>
                <th className="px-6 py-4 font-semibold">Assigned Staff</th>
                <th className="px-6 py-4 font-semibold">Priority</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400 animate-pulse">Loading tasks...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">No tasks found.</td></tr>
              ) : filtered.map(task => (
                <tr key={task.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-900 max-w-[180px] truncate">{task.task_name}</td>
                  <td className="px-6 py-4 text-slate-600">{formatDate(task.task_date)}</td>
                  <td className="px-6 py-4 text-slate-600">{formatTime(task.start_time)} – {formatTime(task.end_time)}</td>
                  <td className="px-6 py-4 text-slate-600">{task.staff_name || <span className="italic text-slate-400">Unassigned</span>}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${task.priority === 'High' ? 'bg-rose-50 text-rose-700' : task.priority === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[task.status] || 'bg-slate-100 text-slate-600'}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(task)}
                        className="rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 shadow-sm transition-all"
                      >Edit</button>
                      {task.status !== 'Cancelled' && task.status !== 'Completed' && (
                        <button onClick={() => setConfirmCancelId(task.id)}
                          className="rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-50 hover:border-amber-200 shadow-sm transition-all"
                        >Cancel</button>
                      )}
                      <button onClick={() => setConfirmDeleteId(task.id)}
                        className="rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-200 shadow-sm transition-all"
                      >Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{editingTask ? 'Edit Task' : 'Create Task Request'}</h3>
                <p className="text-sm text-slate-500 mt-1">{editingTask ? `Editing "${editingTask.task_name}"` : 'Fill in the task details.'}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full p-2 transition-colors border border-slate-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Task Title <span className="text-rose-500">*</span></label>
                <input type="text" value={form.task_name} onChange={e => setForm(f => ({ ...f, task_name: e.target.value }))} placeholder="e.g. Restock Aisle 3"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-400/10 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Task details..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-400/10 transition-all resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-rose-400 focus:outline-none transition-all"
                  >
                    <option>Low</option><option>Medium</option><option>High</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date <span className="text-rose-500">*</span></label>
                  <input type="date" value={form.task_date} onChange={e => setForm(f => ({ ...f, task_date: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-rose-400 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Time <span className="text-rose-500">*</span></label>
                  <select value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-rose-400 focus:outline-none transition-all"
                  >
                    <option value="">— Select —</option>
                    {TIME_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">End Time <span className="text-rose-500">*</span></label>
                  <select value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-rose-400 focus:outline-none transition-all"
                  >
                    <option value="">— Select —</option>
                    {TIME_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
            {formError && <p className="mt-3 text-sm text-rose-600 font-medium">{formError}</p>}
            {formSuccess && <p className="mt-3 text-sm text-emerald-600 font-medium">{formSuccess}</p>}
            <div className="mt-6 flex gap-3">
              <button onClick={handleSave} disabled={saving}
                className="rounded-xl bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 shadow-sm transition-colors disabled:opacity-60"
              >{saving ? 'Saving...' : editingTask ? 'Save Changes' : 'Create Task'}</button>
              <button onClick={() => setShowModal(false)}
                className="rounded-xl bg-white border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirm */}
      {confirmCancelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white px-10 py-10 rounded-3xl shadow-2xl w-full max-w-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Cancel Task?</h3>
            <p className="text-center text-sm text-slate-500 mb-8">This will mark the task as Cancelled.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => cancelTask(confirmCancelId)} disabled={actingId === confirmCancelId}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
              >{actingId === confirmCancelId ? 'Cancelling...' : 'Yes, cancel task'}</button>
              <button onClick={() => setConfirmCancelId(null)} className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold py-3 rounded-xl transition-colors">Back</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white px-10 py-10 rounded-3xl shadow-2xl w-full max-w-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-rose-600"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Delete Task?</h3>
            <p className="text-center text-sm text-slate-500 mb-8">This will permanently remove the task record.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => deleteTask(confirmDeleteId)} disabled={actingId === confirmDeleteId}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
              >{actingId === confirmDeleteId ? 'Deleting...' : 'Yes, delete'}</button>
              <button onClick={() => setConfirmDeleteId(null)} className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold py-3 rounded-xl transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
