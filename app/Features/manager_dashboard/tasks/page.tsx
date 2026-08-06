'use client';

import { useEffect, useState } from 'react';
import { apiFetch, apiPost } from '@/lib/api';

type Task = {
  task_id: string;
  task_title: string;
  task_description: string | null;
  priority_level: 'low' | 'medium' | 'high';
  task_status: 'draft' | 'open' | 'allocated' | 'completed' | 'cancelled';
  task_date: string;
  start_time: string;
  end_time: string;
  department_id: string | null;
  department_name: string | null;
  assigned_staff_name: string | null;
  required_skillset_id: string | null;
};

type Department = { department_id: string; department_name: string };
type Skillset = { skillset_id: string; skillset_name: string };
type Staff = {
  company_member_id: string;
  full_name: string;
  role: string;
  employee_type: 'full_time' | 'part_time' | null;
  remaining_eligible_hours: number | null;
};

const TIME_OPTIONS = Array.from({ length: 96 }, (_, i) => {
  const h = Math.floor(i / 4);
  const m = (i % 4) * 15;
  const value = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  const ampm = h >= 12 ? 'PM' : 'AM';
  return { value, label: `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}` };
});

const STATUS_STYLES: Record<string, string> = {
  open:      'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
  allocated: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
  completed: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20',
  cancelled: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20',
  draft:     'bg-slate-100 text-slate-600',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Open', allocated: 'Allocated', completed: 'Completed', cancelled: 'Cancelled', draft: 'Draft',
};

const EMPTY_FORM = {
  task_title: '', task_description: '', priority_level: 'medium', department_id: '',
  required_skillset_id: '', task_date: '', start_time: '', end_time: '',
};

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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [skillsets, setSkillsets] = useState<Skillset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftDescription, setDraftDescription] = useState('');
  const [drafting, setDrafting] = useState(false);
  const [draftError, setDraftError] = useState('');
  const [draftSourceText, setDraftSourceText] = useState<string | null>(null);

  const [assignTask, setAssignTask] = useState<Task | null>(null);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assignSaving, setAssignSaving] = useState(false);
  const [assignError, setAssignError] = useState('');

  async function loadAll() {
    setLoading(true);
    setError('');
    const [tasksRes, deptRes, skillRes] = await Promise.all([
      apiFetch<{ tasks: Task[] }>('/api/manager/tasks'),
      apiFetch<{ departments: Department[] }>('/api/manager/departments'),
      apiFetch<{ skillsets: Skillset[] }>('/api/manager/skillsets'),
    ]);
    if (tasksRes.success) setTasks(tasksRes.tasks || []);
    else setError(tasksRes.message || 'Could not load tasks.');
    if (deptRes.success) setDepartments(deptRes.departments || []);
    if (skillRes.success) setSkillsets(skillRes.skillsets || []);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function openCreate() {
    setEditingTask(null);
    setForm(EMPTY_FORM);
    setDraftSourceText(null);
    setFormError('');
    setFormSuccess('');
    setShowModal(true);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setDraftSourceText(null);
    setForm({
      task_title: task.task_title,
      task_description: task.task_description || '',
      priority_level: task.priority_level,
      department_id: task.department_id || '',
      required_skillset_id: task.required_skillset_id || '',
      task_date: task.task_date,
      start_time: task.start_time?.slice(0, 5) || '',
      end_time: task.end_time?.slice(0, 5) || '',
    });
    setFormError('');
    setFormSuccess('');
    setShowModal(true);
  }

  function openDraftModal() {
    setDraftDescription('');
    setDraftError('');
    setShowDraftModal(true);
  }

  async function handleDraft() {
    if (!draftDescription.trim()) {
      setDraftError('Please describe the task you need.');
      return;
    }
    setDrafting(true);
    setDraftError('');
    const result = await apiPost<{
      draft?: {
        task_title: string;
        task_description: string;
        task_date: string;
        start_time: string;
        end_time: string;
        priority_level: string;
        department_id: string | null;
        required_skillset_id: string | null;
      };
    }>('/api/manager/tasks/draft', { description: draftDescription.trim() });

    if (result.success && result.draft) {
      setEditingTask(null);
      setForm({
        task_title: result.draft.task_title,
        task_description: result.draft.task_description,
        priority_level: result.draft.priority_level,
        department_id: result.draft.department_id || '',
        required_skillset_id: result.draft.required_skillset_id || '',
        task_date: result.draft.task_date,
        start_time: result.draft.start_time,
        end_time: result.draft.end_time,
      });
      setDraftSourceText(draftDescription.trim());
      setFormError('');
      setFormSuccess('');
      setShowDraftModal(false);
      setShowModal(true);
    } else {
      setDraftError(result.message || 'Could not generate a draft. Please try again.');
    }
    setDrafting(false);
  }

  async function openAssignModal(task: Task) {
    setAssignTask(task);
    setSelectedStaffId('');
    setAssignError('');
    setStaffLoading(true);
    const result = await apiFetch<{ staff?: Staff[] }>('/api/manager/staff');
    setStaffList(result.success ? result.staff || [] : []);
    setStaffLoading(false);
  }

  async function handleAssign() {
    if (!assignTask || !selectedStaffId) {
      setAssignError('Please select a staff member.');
      return;
    }
    setAssignSaving(true);
    setAssignError('');
    const result = await apiFetch<{ success: boolean; message?: string }>(
      `/api/manager/tasks/${assignTask.task_id}/assign`,
      { method: 'POST', body: JSON.stringify({ assigned_to: selectedStaffId }) }
    );
    if (result.success) {
      setAssignTask(null);
      await loadAll();
    } else {
      setAssignError(result.message || 'Failed to assign task.');
    }
    setAssignSaving(false);
  }

  async function handleSave() {
    if (!form.task_title.trim() || !form.department_id || !form.task_date || !form.start_time || !form.end_time) {
      setFormError('Title, department, date, and times are required.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        task_title: form.task_title,
        task_description: form.task_description || null,
        priority_level: form.priority_level,
        department_id: form.department_id,
        required_skillset_id: form.required_skillset_id || null,
        task_date: form.task_date,
        start_time: form.start_time,
        end_time: form.end_time,
        ...(!editingTask && draftSourceText
          ? { origin: 'ai_nl', source_text: draftSourceText }
          : {}),
      };

      const result = editingTask
        ? await apiFetch<{ task: Task }>(`/api/manager/tasks/${editingTask.task_id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          })
        : await apiPost<{ task: Task }>('/api/manager/tasks', payload);

      if (result.success) {
        setFormSuccess(editingTask ? 'Task updated.' : 'Task created.');
        setTimeout(() => { setShowModal(false); setFormSuccess(''); }, 1000);
        await loadAll();
      } else {
        setFormError(result.message || 'Failed to save.');
      }
    } catch {
      setFormError('Could not reach the server.');
    } finally {
      setSaving(false);
    }
  }

  async function cancelTask(id: string) {
    setActingId(id);
    try {
      const result = await apiFetch(`/api/manager/tasks/${id}/cancel`, { method: 'PATCH' });
      if (result.success) await loadAll();
    } catch {}
    finally { setActingId(null); setConfirmCancelId(null); }
  }

  const statuses = ['All', 'open', 'allocated', 'completed', 'cancelled'];
  const counts = statuses.reduce((acc, s) => {
    acc[s] = s === 'All' ? tasks.length : tasks.filter(t => t.task_status === s).length;
    return acc;
  }, {} as Record<string, number>);
  const filtered = statusFilter === 'All' ? tasks : tasks.filter(t => t.task_status === statusFilter);

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="flex gap-1.5 bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm flex-wrap">
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${statusFilter === s ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              {s === 'All' ? 'All' : STATUS_LABELS[s]} <span className="opacity-60">({counts[s]})</span>
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={openDraftModal}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 2v4"/><circle cx="18" cy="6" r="3"/></svg>
            Draft with AI
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-rose-700 transition-colors whitespace-nowrap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Task
          </button>
        </div>
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
                <tr key={task.task_id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-900 max-w-[180px] truncate">{task.task_title}</td>
                  <td className="px-6 py-4 text-slate-600">{formatDate(task.task_date)}</td>
                  <td className="px-6 py-4 text-slate-600">{formatTime(task.start_time)} – {formatTime(task.end_time)}</td>
                  <td className="px-6 py-4 text-slate-600">{task.assigned_staff_name || <span className="italic text-slate-400">Unassigned</span>}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${task.priority_level === 'high' ? 'bg-rose-50 text-rose-700' : task.priority_level === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                      {task.priority_level}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[task.task_status] || 'bg-slate-100 text-slate-600'}`}>
                      {STATUS_LABELS[task.task_status] || task.task_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {task.task_status === 'open' && (
                        <button onClick={() => openAssignModal(task)}
                          className="rounded-md bg-slate-900 hover:bg-slate-700 text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition-all"
                        >Assign</button>
                      )}
                      {task.task_status !== 'cancelled' && task.task_status !== 'completed' && (
                        <button onClick={() => openEdit(task)}
                          className="rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 shadow-sm transition-all"
                        >Edit</button>
                      )}
                      {task.task_status !== 'cancelled' && task.task_status !== 'completed' && (
                        <button onClick={() => setConfirmCancelId(task.task_id)}
                          className="rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-50 hover:border-amber-200 shadow-sm transition-all"
                        >Cancel</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Modal */}
      {assignTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Assign Task</h3>
                <p className="text-sm text-slate-500 mt-1">{assignTask.task_title} · {formatDate(assignTask.task_date)} {formatTime(assignTask.start_time)}–{formatTime(assignTask.end_time)}</p>
              </div>
              <button onClick={() => setAssignTask(null)} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full p-2 transition-colors border border-slate-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Staff Member <span className="text-rose-500">*</span></label>
            {staffLoading ? (
              <p className="mt-2 text-sm text-slate-400 animate-pulse">Loading staff...</p>
            ) : staffList.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No active full-time or part-time staff found.</p>
            ) : (
              <div className="mt-2 space-y-2 max-h-72 overflow-y-auto">
                {staffList.map(s => (
                  <label key={s.company_member_id}
                    className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all ${selectedStaffId === s.company_member_id ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input type="radio" name="assign-staff" value={s.company_member_id}
                        checked={selectedStaffId === s.company_member_id}
                        onChange={() => setSelectedStaffId(s.company_member_id)}
                        className="shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{s.full_name}</p>
                        <p className="text-xs text-slate-500 capitalize">
                          {s.employee_type ? s.employee_type.replace('_', '-') : s.role.replace(/_/g, ' ')}
                          {s.remaining_eligible_hours != null ? ` · ${s.remaining_eligible_hours}h remaining` : ''}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {assignError && <p className="mt-3 text-sm text-rose-600 font-medium">{assignError}</p>}

            <div className="mt-6 flex gap-3">
              <button onClick={handleAssign} disabled={assignSaving || staffLoading}
                className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 shadow-sm transition-colors disabled:opacity-60"
              >{assignSaving ? 'Assigning...' : 'Assign Task'}</button>
              <button onClick={() => setAssignTask(null)}
                className="rounded-xl bg-white border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Draft with AI Modal */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Draft a Task with AI</h3>
                <p className="text-sm text-slate-500 mt-1">Describe what you need in plain English — you can edit everything before creating it.</p>
              </div>
              <button onClick={() => setShowDraftModal(false)} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full p-2 transition-colors border border-slate-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <textarea
              value={draftDescription}
              onChange={e => setDraftDescription(e.target.value)}
              rows={4}
              placeholder="e.g. Need someone to cover the evening kitchen shift this Friday, urgent, 4pm to 9pm"
              disabled={drafting}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 font-medium focus:bg-white focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-400/10 transition-all resize-none disabled:opacity-60"
            />
            {draftError && <p className="mt-3 text-sm text-rose-600 font-medium">{draftError}</p>}
            <div className="mt-6 flex gap-3">
              <button onClick={handleDraft} disabled={drafting}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {drafting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
                    Drafting...
                  </>
                ) : 'Generate Draft'}
              </button>
              <button onClick={() => setShowDraftModal(false)}
                className="rounded-xl bg-white border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{editingTask ? 'Edit Task' : 'Create Task Request'}</h3>
                <p className="text-sm text-slate-500 mt-1">{editingTask ? `Editing "${editingTask.task_title}"` : 'Fill in the task details.'}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full p-2 transition-colors border border-slate-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Task Title <span className="text-rose-500">*</span></label>
                <input type="text" value={form.task_title} onChange={e => setForm(f => ({ ...f, task_title: e.target.value }))} placeholder="e.g. Restock Aisle 3"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-400/10 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea value={form.task_description} onChange={e => setForm(f => ({ ...f, task_description: e.target.value }))} rows={2} placeholder="Task details..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-400/10 transition-all resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department <span className="text-rose-500">*</span></label>
                  <select value={form.department_id} onChange={e => setForm(f => ({ ...f, department_id: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-rose-400 focus:outline-none transition-all"
                  >
                    <option value="">— Select —</option>
                    {departments.map(d => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Required Skillset</label>
                  <select value={form.required_skillset_id} onChange={e => setForm(f => ({ ...f, required_skillset_id: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-rose-400 focus:outline-none transition-all"
                  >
                    <option value="">None</option>
                    {skillsets.map(s => <option key={s.skillset_id} value={s.skillset_id}>{s.skillset_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</label>
                  <select value={form.priority_level} onChange={e => setForm(f => ({ ...f, priority_level: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-rose-400 focus:outline-none transition-all"
                  >
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
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
            <p className="text-center text-sm text-slate-500 mb-8">This will mark the task as cancelled.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => cancelTask(confirmCancelId)} disabled={actingId === confirmCancelId}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
              >{actingId === confirmCancelId ? 'Cancelling...' : 'Yes, cancel task'}</button>
              <button onClick={() => setConfirmCancelId(null)} className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold py-3 rounded-xl transition-colors">Back</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
