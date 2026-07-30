'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type AvailabilitySlot = {
  availability_id: string;
  available_date: string;
  start_time: string;
  end_time: string;
  availability_status: 'available' | 'unavailable';
};

type EligibilityHours = {
  max_working_hours: number | null;
  current_working_hours: number | null;
  remaining_eligible_hours: number | null;
};

function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}
function formatTime(t: string) {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

export default function PTAvailabilityPage() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [hours, setHours] = useState<EligibilityHours | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [availableDate, setAvailableDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [status, setStatus] = useState<'available' | 'unavailable'>('available');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    const [slotsResult, hoursResult] = await Promise.all([
      apiFetch<{ availability?: AvailabilitySlot[] }>('/api/part-time-staff/availability'),
      apiFetch<{ eligibility_hours?: EligibilityHours }>('/api/part-time-staff/eligibility-hours'),
    ]);
    setSlots(slotsResult.availability ?? []);
    setHours(hoursResult.eligibility_hours ?? null);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function handleAdd() {
    if (!availableDate) { setError('Please select a date.'); return; }
    setSaving(true); setError(''); setSuccess('');
    const result = await apiFetch<{ success: boolean; message?: string }>('/api/part-time-staff/availability', {
      method: 'POST',
      body: JSON.stringify({
        available_date: availableDate,
        start_time: startTime,
        end_time: endTime,
        availability_status: status,
      }),
    });
    if (result.success) {
      setSuccess('Availability slot added.');
      setShowForm(false);
      setAvailableDate(''); setStartTime('09:00'); setEndTime('17:00'); setStatus('available');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.message || 'Failed to add availability.');
    }
    setSaving(false);
  }

  async function handleDelete(availabilityId: string) {
    setDeletingId(availabilityId);
    const result = await apiFetch<{ success: boolean; message?: string }>(
      `/api/part-time-staff/availability/${availabilityId}`,
      { method: 'DELETE' }
    );
    if (result.success) {
      loadData();
    } else {
      setError(result.message || 'Failed to remove slot.');
    }
    setDeletingId(null);
  }

  const hoursUsed = hours?.current_working_hours ?? null;
  const hoursLimit = hours?.max_working_hours ?? null;
  const remaining = hours?.remaining_eligible_hours ?? null;
  const usagePct = hoursLimit && hoursUsed !== null ? Math.min((hoursUsed / hoursLimit) * 100, 100) : 0;

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">

      {/* Hours summary */}
      {hoursLimit !== null && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Remaining Eligible Hours</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{remaining ?? '—'}<span className="text-lg font-semibold text-slate-400">h</span></p>
              <p className="text-xs text-slate-400 mt-0.5">of {hoursLimit}h limit</p>
            </div>
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
              <path className="text-slate-100" stroke="currentColor" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3"/>
              <path className={usagePct >= 90 ? 'text-rose-400' : 'text-violet-400'} stroke="currentColor" strokeDasharray={`${usagePct}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3"/>
            </svg>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className={`h-full rounded-full transition-all ${usagePct >= 90 ? 'bg-rose-400' : 'bg-violet-400'}`} style={{ width: `${usagePct}%` }}/>
          </div>
        </div>
      )}

      {success && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 font-medium">{success}</div>}
      {error && <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium">{error}</div>}

      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">My Availability</h2>
            <p className="text-sm text-slate-500 mt-0.5">{slots.length} slot{slots.length !== 1 ? 's' : ''} on record.</p>
          </div>
          <button onClick={() => { setShowForm(!showForm); setError(''); }}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors shadow-sm ${showForm ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-violet-600 text-white hover:bg-violet-700'}`}
          >{showForm ? 'Cancel' : 'Add Slot'}</button>
        </div>

        {showForm && (
          <div className="p-6 border-b border-slate-100 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date <span className="text-rose-500">*</span></label>
                <input type="date" value={availableDate} onChange={e => setAvailableDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Time</label>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">End Time</label>
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value as 'available' | 'unavailable')}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            </div>
            <button onClick={handleAdd} disabled={saving}
              className="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 shadow-sm transition-colors disabled:opacity-60"
            >{saving ? 'Saving...' : 'Add Slot'}</button>
          </div>
        )}

        {loading ? (
          <div className="px-8 py-12 text-center text-slate-400 animate-pulse">Loading...</div>
        ) : slots.length === 0 ? (
          <div className="px-8 py-12 text-center text-slate-500">No availability slots added yet.</div>
        ) : (
          <div className="p-6 space-y-3">
            {slots.map(slot => (
              <div key={slot.availability_id} className={`rounded-2xl border p-4 transition-all flex items-center justify-between gap-4 flex-wrap ${slot.availability_status === 'available' ? 'border-violet-200 bg-violet-50/40' : 'border-slate-200 bg-slate-50/50'}`}>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-semibold ${slot.availability_status === 'available' ? 'text-slate-900' : 'text-slate-400'}`}>{formatDate(slot.available_date)}</span>
                  <span className="text-sm text-slate-500">{formatTime(slot.start_time)} – {formatTime(slot.end_time)}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${slot.availability_status === 'available' ? 'bg-violet-100 text-violet-700' : 'bg-slate-200 text-slate-600'}`}>
                    {slot.availability_status}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(slot.availability_id)}
                  disabled={deletingId === slot.availability_id}
                  className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors disabled:opacity-60"
                >
                  {deletingId === slot.availability_id ? 'Removing...' : 'Remove'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
