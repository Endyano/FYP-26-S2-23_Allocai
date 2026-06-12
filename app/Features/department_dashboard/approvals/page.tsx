'use client';

import { useState } from 'react';

const initialRequests = [
  { id: 1, task: 'Night Shift Security', requestedBy: 'John Doe', role: 'Casual Staff', reason: 'Need to early go back home' },
  { id: 2, date: 'May 15', task: 'Delivery Vegetables', requestedBy: 'Mike Johnson', role: 'Casual Staff', reason: 'Sick' },
];

export default function ApprovalsPage() {
  const [requests, setRequests] = useState(initialRequests);

  const handleAction = (id: number) => {
    setRequests(requests.filter(req => req.id !== id));
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
        
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Cancellation Request Approval</h3>
            <p className="text-sm text-slate-500 mt-1">Review requests from casual staff who wish to cancel their assigned shifts.</p>
          </div>
          <span className="bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20 py-1 px-3 rounded-full text-xs font-bold">
            {requests.length} Pending
          </span>
        </div>
        
        <div className="space-y-4 mt-4">
          {requests.length > 0 ? (
            requests.map((req) => (
              <div key={req.id} className="group rounded-xl border border-slate-200 bg-slate-50 p-6 transition-all hover:border-indigo-100 hover:bg-indigo-50/10 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-bold text-slate-900">Task: {req.task}</h4>
                    <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">Pending</span>
                  </div>
                  <p className="text-sm text-slate-500">Requested by: <span className="font-semibold text-slate-800">{req.requestedBy}</span> ({req.role})</p>
                  <p className="text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-200 italic">
                    "Reason: {req.reason}"
                  </p>
                </div>
                
                {/* Tombol aksi bergaya bersih dan profesional */}
                <div className="flex gap-2 self-start md:self-auto">
                  <button 
                    onClick={() => handleAction(req.id)}
                    className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-semibold shadow-sm transition-all active:scale-95"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleAction(req.id)}
                    className="rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 px-4 py-2 text-xs font-semibold shadow-sm transition-all active:scale-95"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
               <p className="text-slate-500 font-medium">No pending cancellation requests. All clear!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}