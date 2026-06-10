'use client';

import { useState } from 'react';

const initialDisputes = [
  { id: 1, name: 'John Doe', claimed: 8, tracked: 6.5, reason: "System did not record 1.5 hours", status: 'Pending' },
  { id: 2, name: 'Jane Smith', claimed: 8, tracked: 6.5, reason: "System did not record 1.5 hours", status: 'Pending' },
];

export default function DashboardPage() {
  const [disputes, setDisputes] = useState(initialDisputes);

  const resolveDispute = (id: number) => {
    setDisputes(disputes.filter(d => d.id !== id));
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="relative rounded-2xl bg-white p-6 shadow-sm border border-slate-200 border-t-4 border-t-indigo-500 overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
          <div className="relative z-10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Casual Staff</h3>
            <p className="text-4xl font-black text-slate-900 mt-3">124</p>
          </div>
          <svg className="absolute -right-4 -bottom-4 w-32 h-32 text-indigo-50 opacity-50" viewBox="0 0 36 36">
            <path className="text-slate-100" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
            <path className="text-indigo-400 animate-ring" strokeDasharray="75, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
          </svg>
        </div>
        
        {/* Card 2 */}
        <div className="relative rounded-2xl bg-white p-6 shadow-sm border border-slate-200 border-t-4 border-t-emerald-500 overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
          <div className="relative z-10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Departments</h3>
            <p className="text-4xl font-black text-slate-900 mt-3">8 <span className="text-sm font-medium text-slate-400">/ 10</span></p>
          </div>
          <svg className="absolute -right-4 -bottom-4 w-32 h-32 text-emerald-50 opacity-50" viewBox="0 0 36 36">
            <path className="text-slate-100" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
            <path className="text-emerald-400 animate-ring" strokeDasharray="80, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
          </svg>
        </div>
        
        {/* Card 3 */}
        <div className="relative rounded-2xl bg-white p-6 shadow-sm border border-slate-200 border-t-4 border-t-rose-500 overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
          <div className="relative z-10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Tasks</h3>
            <p className="text-4xl font-black text-slate-900 mt-3">32</p>
          </div>
           <svg className="absolute -right-4 -bottom-4 w-32 h-32 text-rose-50 opacity-50" viewBox="0 0 36 36">
            <path className="text-slate-100" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
            <path className="text-rose-400 animate-ring" strokeDasharray="30, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
          </svg>
        </div>
      </div>

      {/* Hour Dispute Requests */}
      <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
         <div className="flex items-center justify-between mb-6">
           <h2 className="text-xl font-bold text-slate-900">Hour Dispute Requests</h2>
           <span className="bg-amber-100 text-amber-700 py-1 px-3 rounded-full text-xs font-bold">{disputes.length} Pending</span>
         </div>
         
         {disputes.length > 0 ? (
           <div className="space-y-4">
             {disputes.map(dispute => (
               <div key={dispute.id} className="group rounded-2xl bg-slate-50 p-6 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      {dispute.name}
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">{dispute.status}</span>
                    </h3>
                    <div className="flex items-center gap-3 mt-2 text-sm text-slate-600 font-medium">
                      <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-md">Claimed: <strong className="text-slate-900">{dispute.claimed}h</strong></span>
                      <span className="text-slate-300">→</span>
                      <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-md">Tracked: <strong className="text-slate-900">{dispute.tracked}h</strong></span>
                    </div>
                    <p className="text-slate-500 text-sm mt-3 italic flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      "{dispute.reason}"
                    </p>
                  </div>
                  
                  <div className="flex gap-2 self-start md:self-auto opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                    <button onClick={() => resolveDispute(dispute.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm active:scale-95 flex items-center gap-1.5">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      Approve
                    </button>
                    <button onClick={() => resolveDispute(dispute.id)} className="bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm active:scale-95">
                      Reject
                    </button>
                  </div>
               </div>
             ))}
           </div>
         ) : (
           <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
             <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
             <p className="text-slate-500 font-medium">All clear! No pending disputes.</p>
           </div>
         )}
      </div>
    </div>
  );
}