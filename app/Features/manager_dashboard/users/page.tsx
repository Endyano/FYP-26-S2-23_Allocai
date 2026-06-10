'use client';

import { useState } from 'react';

const initialStaffData = [
  { id: 1, name: 'Endy', role: 'Department Staff', status: 'Suspended', phone: '+60 175397059', email: 'John18@gmail.com', hours: 50 },
  { id: 2, name: 'Justin', role: 'Department Staff', status: 'Active', phone: '', email: 'jane.smith@email.com', hours: 40 },
  { id: 3, name: 'Eric', role: 'Casual Employee', status: 'Suspended', phone: '', email: 'mike.j@email.com', hours: 20 },
  { id: 4, name: 'Yong qian', role: 'Casual Employee', status: 'Active', phone: '', email: 'steven.j@email.com', hours: 25 },
];

export default function UsersPage() {
  const [staffList, setStaffList] = useState(initialStaffData);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleStaffStatus = (id: number) => {
    setStaffList(staffList.map(staff => 
      staff.id === id 
        ? { ...staff, status: staff.status === 'Active' ? 'Suspended' : 'Active' } 
        : staff
    ));
  };

  const filteredStaff = staffList.filter(staff => 
    staff.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    staff.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Search Bar */}
      <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm border border-slate-200">
         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
         <input 
           type="text" 
           placeholder="Search staff by name or role..." 
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
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredStaff.length > 0 ? (
                filteredStaff.map((staff) => (
                  <tr key={staff.id} className="transition-colors hover:bg-slate-50 group">
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                        {staff.name.charAt(0)}
                      </div>
                      {staff.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{staff.role}</td>
                    
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleStaffStatus(staff.id)}
                        title="Click to toggle status"
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                          staff.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 hover:bg-emerald-100' 
                            : 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20 hover:bg-rose-100'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${staff.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {staff.status}
                      </button>
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button 
                          onClick={() => setEditingStaff(staff)}
                          className="rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all"
                        >
                          Edit
                        </button>
                        <button className="rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-50 hover:border-amber-200 shadow-sm transition-all">
                          Suspend
                        </button>
                        <button className="rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-200 shadow-sm transition-all">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                    No staff found matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Form Modal/Card */}
      {editingStaff && (
        <div className="rounded-2xl bg-white p-8 shadow-xl border border-slate-200 animate-[fadeIn_0.2s_ease-out] relative overflow-hidden mt-8 ring-1 ring-slate-900/5">
          {/* Accent Line */}
          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
          
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Edit Profile</h3>
              <p className="text-sm text-slate-500 mt-1">Updating details for <span className="font-semibold text-indigo-600">{editingStaff.name}</span></p>
            </div>
            <button onClick={() => setEditingStaff(null)} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full p-2 transition-colors border border-slate-200">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
              <input type="text" defaultValue={editingStaff.name} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Number</label>
              <input type="text" defaultValue={editingStaff.phone} placeholder="+65..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
              <input type="email" defaultValue={editingStaff.email} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role</label>
              <div className="relative">
                <select defaultValue={editingStaff.role} className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer">
                  <option>Department Staff</option>
                  <option>Casual Employee</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Max Weekly Hours</label>
              <div className="relative w-1/2">
                <input type="number" defaultValue={editingStaff.hours} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" />
                <span className="absolute right-4 top-2.5 text-sm font-medium text-slate-400">hours</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button onClick={() => setEditingStaff(null)} className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 shadow-sm active:scale-95">Save Changes</button>
            <button onClick={() => setEditingStaff(null)} className="rounded-xl bg-white border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95">Cancel</button>
          </div>
        </div>
      )}

    </div>
  );
}