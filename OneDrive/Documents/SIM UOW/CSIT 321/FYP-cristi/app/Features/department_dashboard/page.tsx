'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const TIME_OPTIONS = Array.from({ length: 96 }, (_, i) => {
  const h = Math.floor(i / 4);
  const m = (i % 4) * 15;
  const value = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const display12 = h % 12 || 12;
  const label = `${display12}:${m.toString().padStart(2, '0')} ${ampm}`;
  return { value, label };
});

interface Task {
  id: number;
  task_name: string;
  description: string;
  priority: string;
  status: string;
  task_date: string;
  start_time: string;
  end_time: string;
  staff_id: string | null;
  assigned_staff_name: string | null;
}

interface FormState {
  task_name: string;
  description: string;
  priority: string;
  staff_id: string;
  task_date: string;
  start_time: string;
  end_time: string;
}

const emptyForm: FormState = {
  task_name: '',
  description: '',
  priority: 'Medium',
  staff_id: '',
  task_date: '',
  start_time: '',
  end_time: '',
};

const STATUS_STYLES: Record<string, string> = {
  Pending:   'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
  Approved:  'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
  Completed: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20',
  Cancelled: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20',
};

const DOT_STYLES: Record<string, string> = {
  Pending:   'bg-amber-500',
  Approved:  'bg-emerald-500',
  Completed: 'bg-sky-500',
  Cancelled: 'bg-rose-500',
};

export default function ManageTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, task_name: 'Assign Part-Time to Delivery', description: 'Allocate 2 part-time staff for morning route.', priority: 'High', status: 'Pending', task_date: '2026-06-25', start_time: '08:00', end_time: '12:00', staff_id: null, assigned_staff_name: null },
    { id: 2, task_name: 'Warehouse Restocking', description: 'Coordinate stock replenishment from cold storage.', priority: 'Medium', status: 'Approved', task_date: '2026-06-24', start_time: '09:00', end_time: '13:00', staff_id: 'PT01', assigned_staff_name: 'Rajan Kumar' },
    { id: 3, task_name: 'Loading Dock Supervision', description: 'Oversee loading of delivery trucks.', priority: 'Low', status: 'Completed', task_date: '2026-06-23', start_time: '07:00', end_time: '10:00', staff_id: 'PT02', assigned_staff_name: 'Priya Nair' },
  ]);
  const [loadError, setLoadError] = useState('');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');
    try {
      const res = await fetch(`${API_URL}/api/department/tasks`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setTasks(prev => [data.task, ...prev]);
        setForm(emptyForm);
        setSubmitSuccess('Task created successfully.');
      } else {
        setSubmitError(data.message || 'Failed to create task.');
      }
    } catch {
      setSubmitError('Could not reach the server.');
    } finally {
      setSubmitting(false);
    }
  }

  async function cancelTask(taskId: number) {
    setCancellingId(taskId);
    try {
      const res = await fetch(`${API_URL}/api/department/tasks/${taskId}/cancel`, {
        method: 'PATCH',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'Cancelled' } : t));
      }
    } catch {
      // silently fail
    } finally {
      setCancellingId(null);
    }
  }

  async function deleteTask(taskId: number) {
    setDeletingId(taskId);
    try {
      const res = await fetch(`${API_URL}/api/department/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
      }
    } catch {
      // silently fail
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  }

  function formatTime(t: string) {
    if (!t) return '—';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${m} ${ampm}`;
  }

  function formatDate(d: string) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">

      {/* CREATE TASK FORM */}
      <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />

        <div className="mb-6 border-b border-slate-100 pb-4">
          <h3 className="text-xl font-bold text-slate-900">Create / Edit Task Request</h3>
          <p className="text-sm text-slate-500 mt-1">Fill in the details to deploy a new task for casual employees.</p>
        </div>

        {submitError && (
          <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium">{submitError}</div>
        )}
        {submitSuccess && (
          <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 font-medium">{submitSuccess}</div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Task Title</label>
            <input name="task_name" value={form.task_name} onChange={handleChange} type="text" placeholder="Enter your task title" required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe the task requirements..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Priority Level</label>
            <div className="relative">
              <select name="priority" value={form.priority} onChange={handleChange} className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Staff ID <span className="normal-case font-normal text-slate-400">(optional)</span></label>
            <input name="staff_id" value={form.staff_id} onChange={handleChange} type="text" placeholder="Leave blank to assign later" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scheduled Date</label>
            <input name="task_date" value={form.task_date} onChange={handleChange} type="date" required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Time</label>
            <div className="relative">
              <select name="start_time" value={form.start_time} onChange={handleChange} required className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer">
                <option value="">— Select start time —</option>
                {TIME_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">End Time</label>
            <div className="relative">
              <select name="end_time" value={form.end_time} onChange={handleChange} required className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer">
                <option value="">— Select end time —</option>
                {TIME_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 pt-2 flex gap-3">
            <button type="submit" disabled={submitting} className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 shadow-sm active:scale-95 disabled:opacity-60">
              {submitting ? 'Saving...' : 'Save Task'}
            </button>
            <button type="button" onClick={() => { setForm(emptyForm); setSubmitError(''); setSubmitSuccess(''); }} className="rounded-xl bg-white border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95">
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* MANAGE EXISTING TASKS */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Manage Existing Tasks</h2>
          <span className="text-xs font-semibold text-slate-500">{tasks.length} total</span>
        </div>

        {loadError && (
          <div className="px-6 py-4 bg-rose-50 border-b border-rose-200 text-sm text-rose-700 font-medium">{loadError}</div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Task</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Time</th>
                <th className="px-6 py-4 font-semibold">Assigned To</th>
                <th className="px-6 py-4 font-semibold">Priority</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {tasks.length === 0 && !loadError ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400 font-medium">No tasks yet. Create one above.</td>
                </tr>
              ) : tasks.map(task => (
                <tr key={task.id} className="transition-colors hover:bg-slate-50 group">
                  <td className="px-6 py-4 font-medium text-slate-900 max-w-[180px] truncate">{task.task_name}</td>
                  <td className="px-6 py-4 text-slate-600">{formatDate(task.task_date)}</td>
                  <td className="px-6 py-4 text-slate-600">{formatTime(task.start_time)} – {formatTime(task.end_time)}</td>
                  <td className="px-6 py-4 text-slate-600">{task.assigned_staff_name || <span className="text-slate-400 italic">Unassigned</span>}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      task.priority === 'High' ? 'bg-rose-50 text-rose-700' :
                      task.priority === 'Medium' ? 'bg-amber-50 text-amber-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>{task.priority}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[task.status] || 'bg-slate-100 text-slate-600'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[task.status] || 'bg-slate-400'}`} />
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {task.status !== 'Cancelled' && task.status !== 'Completed' && (
                        <button
                          onClick={() => cancelTask(task.id)}
                          disabled={cancellingId === task.id}
                          className="rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-50 hover:border-amber-200 shadow-sm transition-all disabled:opacity-50"
                        >
                          {cancellingId === task.id ? '...' : 'Cancel'}
                        </button>
                      )}
                      <button
                        onClick={() => setConfirmDeleteId(task.id)}
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

      {/* DELETE CONFIRMATION MODAL */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white px-10 py-10 rounded-3xl shadow-2xl w-full max-w-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 mb-6">
              <svg className="w-7 h-7 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Delete Task?</h3>
            <p className="text-center text-sm text-slate-500 mb-8">This will permanently remove the task record.</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => deleteTask(confirmDeleteId)}
                disabled={deletingId === confirmDeleteId}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
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
