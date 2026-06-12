'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Staff = {
  id: string;
  full_name: string;
  email: string;
  is_suspended: boolean;
  allocated_hours: number;
  max_weekly_hours: number;
};

type Task = {
  id: number;
  task_name: string;
  task_date: string;
  staff_id: string | null;
};

export default function AssignStaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadError, setLoadError] = useState('');

  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/department/staff`, { credentials: 'include' }).then(r => r.json()),
      fetch(`${API_URL}/api/department/tasks`, { credentials: 'include' }).then(r => r.json()),
    ]).then(([staffData, tasksData]) => {
      if (staffData.success) setStaffList(staffData.staff);
      else setLoadError('Could not load staff list.');
      if (tasksData.success) setTasks(tasksData.tasks || []);
    }).catch(() => setLoadError('Could not reach the server.'));
  }, []);

  const unassignedTasks = tasks.filter(t => !t.staff_id && t.task_name);

  const filtered = staffList.filter(s =>
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function isAvailable(staff: Staff) {
    return !staff.is_suspended && staff.allocated_hours < staff.max_weekly_hours;
  }

  function usagePercent(staff: Staff) {
    return Math.min(Math.round((staff.allocated_hours / staff.max_weekly_hours) * 100), 100);
  }

  function openAssignModal(staff: Staff) {
    setSelectedStaff(staff);
    setSelectedTaskId('');
    setAssignError('');
    setAssignSuccess('');
  }

  async function confirmAssign() {
    if (!selectedStaff || !selectedTaskId) return;
    setAssigning(true);
    setAssignError('');
    setAssignSuccess('');

    try {
      const res = await fetch(`${API_URL}/api/department/tasks/${selectedTaskId}/assign`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff_id: selectedStaff.id }),
      });
      const data = await res.json();

      if (data.success) {
        setAssignSuccess(`${selectedStaff.full_name} has been assigned successfully.`);
        // Update local tasks list so the task no longer shows as unassigned
        setTasks(prev => prev.map(t =>
          t.id === Number(selectedTaskId) ? { ...t, staff_id: selectedStaff.id, status: 'Approved' } : t
        ));
        setSelectedTaskId('');
      } else {
        setAssignError(data.message || 'Failed to assign staff.');
      }
    } catch {
      setAssignError('Could not reach the server.');
    } finally {
      setAssigning(false);
    }
  }

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200">

        <div className="mb-6 border-b border-slate-100 pb-4">
          <h3 className="text-xl font-bold text-slate-900">Assign Staff to Task</h3>
          <p className="text-sm text-slate-500 mt-1">Search for a casual staff member and assign them to one of your tasks.</p>
        </div>

        {loadError && (
          <div className="mb-6 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium">{loadError}</div>
        )}

        {/* Search */}
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 border border-slate-200 mb-8 max-w-xl focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 font-medium"
          />
        </div>

        {/* Staff list */}
        <div className="space-y-3 max-w-2xl">
          {filtered.length === 0 && !loadError && (
            <p className="text-slate-400 text-sm text-center py-8">No staff found.</p>
          )}

          {filtered.map(staff => {
            const available = isAvailable(staff);
            const pct = usagePercent(staff);

            return (
              <div
                key={staff.id}
                className={`flex items-center justify-between rounded-xl border p-5 transition-all ${
                  available
                    ? 'border-slate-200 bg-white hover:border-slate-300'
                    : 'border-slate-100 bg-slate-50/50 opacity-70'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${available ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                    {staff.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{staff.full_name}</h4>
                    <p className={`text-xs font-semibold mt-0.5 ${available ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {staff.is_suspended
                        ? 'Suspended — not available'
                        : available
                          ? `Available · ${staff.allocated_hours}/${staff.max_weekly_hours} hrs used`
                          : `At limit · ${staff.allocated_hours}/${staff.max_weekly_hours} hrs used`}
                    </p>
                    {/* Hours bar */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="w-32 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct >= 100 ? 'bg-rose-400' : pct >= 80 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400">{pct}%</span>
                    </div>
                  </div>
                </div>

                {available && (
                  <button
                    onClick={() => openAssignModal(staff)}
                    className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 text-xs font-semibold shadow-sm transition-all active:scale-95"
                  >
                    Assign Task
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ASSIGN MODAL */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Assign Task</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Assigning to <span className="font-semibold text-indigo-600">{selectedStaff.full_name}</span>
                </p>
              </div>
              <button onClick={() => setSelectedStaff(null)} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full p-2 transition-colors border border-slate-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select a Task</label>
                {unassignedTasks.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-500 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
                    No unassigned tasks. Create a task first from Manage Tasks.
                  </p>
                ) : (
                  <div className="relative mt-1">
                    <select
                      value={selectedTaskId}
                      onChange={e => setSelectedTaskId(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer"
                    >
                      <option value="">— Select a task —</option>
                      {unassignedTasks.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.task_name} ({t.task_date})
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {assignError && <p className="mt-3 text-sm text-rose-600 font-medium">{assignError}</p>}
            {assignSuccess && <p className="mt-3 text-sm text-emerald-600 font-medium">{assignSuccess}</p>}

            <div className="mt-6 flex gap-3">
              <button
                onClick={confirmAssign}
                disabled={assigning || !selectedTaskId || unassignedTasks.length === 0}
                className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 shadow-sm active:scale-95 disabled:opacity-50"
              >
                {assigning ? 'Assigning...' : 'Confirm Assignment'}
              </button>
              <button onClick={() => setSelectedStaff(null)} className="rounded-xl bg-white border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
