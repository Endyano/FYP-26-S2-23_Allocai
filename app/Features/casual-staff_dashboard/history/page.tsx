'use client';

import { useState } from 'react';

const historyData = [
  { id: 1, date: 'May 10', task: 'Security Shift', hours: 8.0, status: 'Completed', action: 'Confirmed' },
  { id: 2, date: 'May 15', task: 'Delivery Fruit', hours: 4.1, status: 'Completed', action: 'Dispute' },
  { id: 3, date: 'May 17', task: 'Kitchen Assistant', hours: 3.4, status: 'Completed', action: 'Confirmed' },
];

export default function HistoryPage() {
  const [activeDispute, setActiveDispute] = useState<any | null>(null);

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Task</th>
                <th className="px-6 py-4 font-semibold">Hours</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {historyData.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-500">{row.date}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{row.task}</td>
                  <td className="px-6 py-4 text-slate-600">{row.hours} h</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {row.action === 'Confirmed' ? (
                      <span className="text-slate-400 font-semibold text-xs uppercase tracking-wider">Confirmed</span>
                    ) : (
                      <button 
                        onClick={() => setActiveDispute(row)}
                        className="rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-200 shadow-sm transition-all"
                      >
                        File Dispute
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activeDispute && (
        <div className="rounded-2xl bg-white p-8 shadow-md border border-slate-200 animate-[fadeIn_0.2s_ease-out] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
          
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Hour Dispute Request</h3>
              <p className="text-sm text-slate-500 mt-1">Disputing record for {activeDispute.task} ({activeDispute.date})</p>
            </div>
            <button onClick={() => setActiveDispute(null)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 max-w-xl">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Correct Hours</label>
              <input type="number" placeholder="e.g. 5.0" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Reason for Dispute</label>
              <textarea rows={3} placeholder="Explain why the tracked hours are incorrect..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all resize-none"></textarea>
            </div>
            <div className="flex gap-3 pt-2">
              <button className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 shadow-md shadow-slate-900/10 active:scale-95">Submit Dispute</button>
              <button onClick={() => setActiveDispute(null)} className="rounded-xl bg-white border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}