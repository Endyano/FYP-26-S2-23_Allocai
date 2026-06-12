'use client';

import { useState } from 'react';

const initialTasks = [
  { id: '001', name: 'Hall Cleaning', deadline: '19/05/2026', status: 'Available' },
  { id: '002', name: 'Kitchen Help', deadline: '17/05/2026', status: 'In Progress' },
  { id: '003', name: 'Inventory Check', deadline: '15/05/2026', status: 'Completed' },
  { id: '004', name: 'Event Setup', deadline: '29/05/2026', status: 'Available' },
  { id: '007', name: 'Trash Removal', deadline: '23/05/2026', status: 'In Progress' },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = tasks.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm border border-slate-200">
         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
         <input 
           type="text" 
           placeholder="Search available tasks..." 
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
         />
      </div>

      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">Task Name</th>
                <th className="px-6 py-4 font-semibold">Deadline</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="transition-colors hover:bg-slate-50 group">
                  <td className="px-6 py-4 font-medium text-slate-500">{task.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{task.name}</td>
                  <td className="px-6 py-4 text-slate-600">{task.deadline}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold border ${
                      task.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      task.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {task.status === 'Available' && (
                        <button className="rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 shadow-sm transition-all">Accept</button>
                      )}
                      {task.status === 'In Progress' && (
                        <>
                          <button className="rounded-md bg-emerald-500 text-white border border-emerald-600 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-600 shadow-sm transition-all">Complete</button>
                          <button className="rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-200 shadow-sm transition-all">Cancel</button>
                        </>
                      )}
                      {task.status === 'Completed' && (
                        <span className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase">Done</span>
                      )}
                    </div>
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