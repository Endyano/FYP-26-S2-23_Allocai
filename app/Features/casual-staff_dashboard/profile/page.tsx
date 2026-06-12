'use client';

import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('allocai_user');
    if (saved) setUserName(saved.replace(/[._]/g, ' '));
  }, []);

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Profile</h1>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm max-w-2xl relative overflow-hidden">
        {/* Dekorasi aksen warna */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-sky-400"></div>

        <div className="flex items-center gap-5 mb-8 pt-4">
          <div className="h-20 w-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl font-black text-slate-400 shadow-inner">
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 capitalize">{userName || 'User'}</h2>
            <p className="text-sm font-medium text-slate-500">Casual Employee</p>
          </div>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
            <input 
              type="text" 
              defaultValue={userName}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</label>
              <input 
                type="text" 
                placeholder="+65..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
              <input 
                type="email" 
                placeholder="email@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Emergency Contact</label>
            <input 
              type="text" 
              placeholder="Name & Phone Number"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address</label>
            <textarea 
              rows={3}
              placeholder="Full residential address"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none" 
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-indigo-600/20 active:scale-95">
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}