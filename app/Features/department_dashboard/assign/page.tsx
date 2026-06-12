'use client';

import { useState } from 'react';

export default function AssignStaffPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
        
        <div className="mb-6 border-b border-slate-100 pb-4">
          <h3 className="text-xl font-bold text-slate-900">Task Assign: <span className="font-medium text-indigo-600">Draft Planning</span></h3>
          <p className="text-sm text-slate-500 mt-1">Search for an employee ID to check availability and assign this task.</p>
        </div>
        
        {/* Search Bar (Gaya Search Bar Utama Manager) */}
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 border border-slate-200 mb-8 max-w-xl focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
           <input 
             type="text" 
             placeholder="Enter Employee ID or Name..." 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 font-medium"
           />
        </div>

        {/* Results Area */}
        <div className="space-y-4 max-w-2xl">
          
          {/* Card Available (Bersih, menggunakan ring warna tipis) */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold">JD</div>
              <div>
                <h4 className="font-bold text-slate-900">John Doe <span className="text-xs font-normal text-slate-400">(ID: 001)</span></h4>
                <p className="text-xs font-semibold text-emerald-600 mt-0.5">Available for this shift</p>
              </div>
            </div>
            <button className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 text-xs font-semibold shadow-sm transition-all active:scale-95">
              Assign Task
            </button>
          </div>

          {/* Card Unavailable */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-5 opacity-70">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-sm font-bold">JD</div>
              <div>
                <h4 className="font-bold text-slate-700">John Doe <span className="text-xs font-normal text-slate-400">(ID: 002)</span></h4>
                <p className="text-xs font-semibold text-rose-500 mt-0.5">Unavailable (Max limit or off-schedule)</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}