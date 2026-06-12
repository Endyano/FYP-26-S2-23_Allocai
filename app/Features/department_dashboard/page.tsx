'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Task {
  id: number;
  task_name: string;
  status: string;
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

export default function ManageTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/department/tasks`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) setTasks(data.tasks || []);
      })
      .catch(() => {});
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: { preventDefault(): void }) {
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

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">

      {/* FORM CREATE TASK */}
      <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>

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
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe the task requirements..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none"></textarea>
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
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Staff ID</label>
            <input name="staff_id" value={form.staff_id} onChange={handleChange} type="text" placeholder="e.g. staff UUID" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scheduled Date</label>
            <input name="task_date" value={form.task_date} onChange={handleChange} type="date" required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Time</label>
            <input name="start_time" value={form.start_time} onChange={handleChange} type="time" required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">End Time</label>
            <input name="end_time" value={form.end_time} onChange={handleChange} type="time" required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" />
          </div>

          <div className="md:col-span-2 pt-2 flex gap-3">
            <button type="submit" disabled={submitting} className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 shadow-sm active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting ? 'Saving...' : 'Save Task'}
            </button>
            <button type="button" onClick={() => { setForm(emptyForm); setSubmitError(''); setSubmitSuccess(''); }} className="rounded-xl bg-white border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95">
              Cancel Changes
            </button>
          </div>
        </form>
      </div>

      {/* MANAGE EXISTING TASKS */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900">Manage Existing Tasks</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Task ID</th>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-medium">No tasks yet.</td>
                </tr>
              ) : tasks.map(task => (
                <tr key={task.id} className="transition-colors hover:bg-slate-50 group">
                  <td className="px-6 py-4 font-medium text-slate-500">#{task.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{task.task_name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      task.status === 'Completed'
                        ? 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20'
                        : 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${task.status === 'Completed' ? 'bg-sky-500' : 'bg-emerald-500'}`}></span>
                      {task.status === 'Completed' ? 'Completed' : task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button className="rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 shadow-sm transition-all">Cancel</button>
                      <button className="rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-200 shadow-sm transition-all">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
