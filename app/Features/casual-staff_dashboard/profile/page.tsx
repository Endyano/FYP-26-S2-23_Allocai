'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Profile = {
  full_name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  employee_id: string;
  joined_date: string;
};

const MOCK: Profile = { full_name: 'Rajan Kumar', email: 'rajan@harbourfoods.sg', phone: '+65 9876 5432', department: 'Warehouse', role: 'Part Time Staff', employee_id: 'PT-003', joined_date: '2025-10-20' };

export default function PTProfilePage() {
  const [profile, setProfile] = useState<Profile>(MOCK);
  const [form, setForm] = useState<Profile>(MOCK);
  const [loading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSave() {
    setSaving(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`${API_URL}/api/casual_staff/profile`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: form.full_name, phone: form.phone }),
      });
      const d = await res.json();
      if (d.success) {
        setProfile(d.profile ?? form);
        setEditing(false);
        setSuccess('Profile updated successfully.');
        localStorage.setItem('allocai_user', form.full_name.trim());
        setTimeout(() => setSuccess(''), 3000);
      } else { setError(d.message || 'Failed to save.'); }
    } catch { setError('Could not reach the server.'); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {success && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 font-medium">{success}</div>}
      {error && <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium">{error}</div>}

      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">My Profile</h2>
            <p className="text-sm text-slate-500 mt-0.5">View and update your personal details.</p>
          </div>
          {!editing ? (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving}
                className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors shadow-sm disabled:opacity-60"
              >{saving ? 'Saving...' : 'Save Changes'}</button>
              <button onClick={() => { setForm(profile); setEditing(false); setError(''); }}
                className="rounded-xl bg-white border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >Cancel</button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="px-8 py-16 text-center text-slate-400 animate-pulse">Loading profile...</div>
        ) : (
          <div className="p-8">
            {/* Avatar */}
            <div className="flex items-center gap-5 mb-8 pb-6 border-b border-slate-100">
              <div className="h-20 w-20 rounded-2xl bg-violet-100 flex items-center justify-center text-3xl font-black text-violet-700">
                {profile.full_name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{profile.full_name || '—'}</p>
                <p className="text-sm text-slate-500 mt-0.5">{profile.role || 'Part Time Staff'} · {profile.department || '—'}</p>
                <p className="text-xs text-slate-400 mt-1">ID: {profile.employee_id || '—'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Editable fields */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                {editing ? (
                  <input type="text" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
                  />
                ) : <p className="mt-1 text-slate-800 font-medium">{profile.full_name || '—'}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</label>
                {editing ? (
                  <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+65 9XXX XXXX"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
                  />
                ) : <p className="mt-1 text-slate-800 font-medium">{profile.phone || <span className="text-slate-400 italic">Not set</span>}</p>}
              </div>
              {/* Read-only fields */}
              {([
                ['Email', profile.email],
                ['Department', profile.department],
                ['Role', profile.role],
                ['Joined', profile.joined_date ? new Date(profile.joined_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'],
              ] as [string, string][]).map(([label, val]) => (
                <div key={label}>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
                  <p className="mt-1 text-slate-800 font-medium">{val || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
