'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  const ampm = h >= 12 ? 'PM' : 'AM';
  return { value: `${String(h).padStart(2, '0')}:${m}`, label: `${h % 12 || 12}:${m} ${ampm}` };
});

type DayAvailability = { available: boolean; start_time: string; end_time: string };
type Availability = Record<string, DayAvailability>;

const defaultDay = (): DayAvailability => ({ available: false, start_time: '09:00', end_time: '17:00' });

export default function FTAvailabilityPage() {
  const [availability, setAvailability] = useState<Availability>({
    Monday:    { available: true,  start_time: '09:00', end_time: '17:00' },
    Tuesday:   { available: false, start_time: '09:00', end_time: '17:00' },
    Wednesday: { available: true,  start_time: '09:00', end_time: '17:00' },
    Thursday:  { available: false, start_time: '09:00', end_time: '17:00' },
    Friday:    { available: true,  start_time: '09:00', end_time: '17:00' },
    Saturday:  { available: false, start_time: '09:00', end_time: '17:00' },
    Sunday:    { available: false, start_time: '09:00', end_time: '17:00' },
  });
  const [loading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function toggleDay(day: string) {
    setAvailability(prev => ({ ...prev, [day]: { ...prev[day], available: !prev[day].available } }));
  }

  function updateTime(day: string, field: 'start_time' | 'end_time', value: string) {
    setAvailability(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  }

  async function handleSave() {
    setSaving(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`${API_URL}/api/staff/availability`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability }),
      });
      const d = await res.json();
      if (d.success) { setSuccess('Availability updated successfully.'); setTimeout(() => setSuccess(''), 3000); }
      else setError(d.message || 'Failed to save.');
    } catch { setError('Could not reach the server.'); }
    finally { setSaving(false); }
  }

  const availableCount = DAYS.filter(d => availability[d]?.available).length;

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {success && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 font-medium">{success}</div>}
      {error && <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium">{error}</div>}

      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">My Availability</h2>
            <p className="text-sm text-slate-500 mt-0.5">Set your available days and working hours. <span className="font-semibold text-emerald-600">{availableCount} day{availableCount !== 1 ? 's' : ''} selected.</span></p>
          </div>
          <button onClick={handleSave} disabled={saving || loading}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-60"
          >{saving ? 'Saving...' : 'Save Availability'}</button>
        </div>

        {loading ? (
          <div className="px-8 py-12 text-center text-slate-400 animate-pulse">Loading...</div>
        ) : (
          <div className="p-6 space-y-3">
            {DAYS.map(day => {
              const dayData = availability[day];
              return (
                <div key={day} className={`rounded-2xl border p-4 transition-all ${dayData.available ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200 bg-slate-50/50'}`}>
                  <div className="flex items-center justify-between gap-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div
                        onClick={() => toggleDay(day)}
                        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${dayData.available ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${dayData.available ? 'translate-x-5' : ''}`}/>
                      </div>
                      <span className={`text-sm font-semibold ${dayData.available ? 'text-slate-900' : 'text-slate-400'}`}>{day}</span>
                    </label>

                    {dayData.available && (
                      <div className="flex items-center gap-3">
                        <select value={dayData.start_time} onChange={e => updateTime(day, 'start_time', e.target.value)}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-emerald-400"
                        >
                          {TIME_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        <span className="text-slate-400 text-sm font-medium">to</span>
                        <select value={dayData.end_time} onChange={e => updateTime(day, 'end_time', e.target.value)}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-emerald-400"
                        >
                          {TIME_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                    )}
                    {!dayData.available && (
                      <span className="text-xs text-slate-400 font-medium italic">Not available</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
