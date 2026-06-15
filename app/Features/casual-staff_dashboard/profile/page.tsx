'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProfilePage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/casual_staff/profile`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.profile) {
          setFullName(data.profile.full_name || '');
          setEmail(data.profile.email || data.profile.username || '');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setErrorMsg('Full name and email are required.');
      return;
    }
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await fetch(`${API_URL}/api/casual_staff/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Profile updated successfully.');
        localStorage.setItem('allocai_user', fullName.trim());
      } else {
        setErrorMsg(data.message || 'Failed to update profile.');
      }
    } catch {
      setErrorMsg('Could not reach the server.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Profile</h1>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm max-w-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-sky-400"></div>

        <div className="flex items-center gap-5 mb-8 pt-4">
          <div className="h-20 w-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl font-black text-slate-400 shadow-inner">
            {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{fullName || 'User'}</h2>
            <p className="text-sm font-medium text-slate-500">Casual Employee</p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 font-medium">{successMsg}</div>
        )}
        {errorMsg && (
          <div className="mb-6 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium">{errorMsg}</div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              value={loading ? '' : fullName}
              onChange={e => { setFullName(e.target.value); setSuccessMsg(''); setErrorMsg(''); }}
              disabled={loading}
              placeholder={loading ? 'Loading...' : 'Enter your full name'}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all disabled:opacity-50"
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
                value={loading ? '' : email}
                onChange={e => { setEmail(e.target.value); setSuccessMsg(''); setErrorMsg(''); }}
                disabled={loading}
                placeholder={loading ? 'Loading...' : 'Enter your email'}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all disabled:opacity-50"
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
            <button
              type="submit"
              disabled={saving || loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-indigo-600/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
