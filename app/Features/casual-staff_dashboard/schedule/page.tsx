'use client';

import { useState } from 'react';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function SchedulePage() {
  const [schedule, setSchedule] = useState(
    daysOfWeek.map(day => ({
      day,
      status: 'Available',
      from: '',
      to: ''
    }))
  );

  const updateStatus = (index: number, newStatus: string) => {
    const updated = [...schedule];
    updated[index].status = newStatus;
    if (newStatus === 'Unavailable') {
      updated[index].from = '';
      updated[index].to = '';
    }
    setSchedule(updated);
  };

  const updateTime = (index: number, field: 'from' | 'to', value: string) => {
    const updated = [...schedule];
    updated[index][field] = value;
    setSchedule(updated);
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900">Weekly Availability</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Day</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">From</th>
                <th className="px-6 py-4 font-semibold">To</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {schedule.map((row, idx) => (
                <tr key={row.day} className="transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{row.day}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updateStatus(idx, 'Available')}
                        className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                          row.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        Available
                      </button>
                      <button 
                        onClick={() => updateStatus(idx, 'Unavailable')}
                        className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                          row.status === 'Unavailable' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        Unavailable
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="time" 
                      value={row.from}
                      onChange={(e) => updateTime(idx, 'from', e.target.value)}
                      disabled={row.status === 'Unavailable'}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="time" 
                      value={row.to}
                      onChange={(e) => updateTime(idx, 'to', e.target.value)}
                      disabled={row.status === 'Unavailable'}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 border-t border-slate-200 bg-slate-50/50 flex justify-end">
          <button className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 shadow-md shadow-slate-900/10 active:scale-95">
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  );
}