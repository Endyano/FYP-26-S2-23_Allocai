'use client';

import { useState } from 'react';

const initialReports = [
  { id: 1, name: 'John Doe', hours: 48, overLimit: false },
  { id: 2, name: 'Jane Smith', hours: 58, overLimit: true, exceedAmount: '16%' },
  { id: 3, name: 'Mike Johnson', hours: 30, overLimit: false },
];

export default function ReportsPage() {
  const [alertThreshold, setAlertThreshold] = useState(90);

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      {/* Report & Automation Config */}
      <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Automation Limits</h2>
          <p className="text-slate-500 text-sm max-w-md">
            Configure when the system should automatically alert you regarding casual staff working hours.
          </p>
        </div>
        
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex-1 w-full max-w-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-700">Email Alerts</span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
            </span>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Threshold (%)</label>
              <input 
                type="number" 
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(Number(e.target.value))}
                className="w-full bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 font-semibold" 
              />
            </div>
            <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm active:scale-95">Save</button>
          </div>
        </div>
      </div>

      {/* Monthly Hours Summary Table */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900">Monthly Hours Summary</h2>
          <div className="flex gap-3 items-center">
            <select className="bg-white border border-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm cursor-pointer">
              <option>May 2026</option>
              <option>June 2026</option>
            </select>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm active:scale-95 flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Staff Name</th>
                <th className="px-6 py-4 font-semibold">Total Hours</th>
                <th className="px-6 py-4 font-semibold">Status Limit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initialReports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{report.name}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{report.hours} <span className="text-slate-400 font-normal">hrs</span></td>
                  <td className="px-6 py-4">
                    {report.overLimit ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 font-semibold border border-rose-100">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        Over Limit ({report.exceedAmount})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                        <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        Within Limits
                      </span>
                    )}
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