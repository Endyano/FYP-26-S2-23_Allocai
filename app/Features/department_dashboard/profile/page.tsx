'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type Profile = {
  staff_id: string | null;
  job_title: string | null;
  employee_type: string | null;
  contact_number: string | null;
  profile_description: string | null;
  role: string;
  full_name: string;
  email: string;
  phone_number: string | null;
};

const EMPTY: Profile = {
  staff_id: null, job_title: null, employee_type: null, contact_number: null,
  profile_description: null, role: '', full_name: '', email: '', phone_number: null,
};

export default function FTProfilePage() {
  const [profile, setProfile] = useState<Profile>(EMPTY);
  const [form, setForm] = useState<Profile>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadProfile() {
      const result = await apiFetch<{ profile?: Profile; success: boolean; message?: string }>('/api/full-time-staff/profile');
      if (result.success && result.profile) {
        setProfile(result.profile);
        setForm(result.profile);
      } else {
        setError(result.message || 'Failed to load profile.');
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleSave() {
    setSaving(true); setError(''); setSuccess('');
    const result = await apiFetch<{ profile?: Profile; success: boolean; message?: string }>(
      '/api/full-time-staff/profile',
      {
        method: 'PUT',
        body: JSON.stringify({
          full_name: form.full_name,
          phone_number: form.phone_number,
          contact_number: form.contact_number,
          profile_description: form.profile_description,
        }),
      }
    );
    if (result.success) {
      setProfile(prev => ({ ...prev, ...result.profile }));
      setEditing(false);
      setSuccess('Profile updated successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.message || 'Failed to save.');
    }
    setSaving(false);
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
          {!loading && (!editing ? (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving}
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-60"
              >{saving ? 'Saving...' : 'Save Changes'}</button>
              <button onClick={() => { setForm(profile); setEditing(false); setError(''); }}
                className="rounded-xl bg-white border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >Cancel</button>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="px-8 py-16 text-center text-slate-400 animate-pulse">Loading profile...</div>
        ) : (
          <div className="p-8">
            {/* Avatar */}
            <div className="flex items-center gap-5 mb-8 pb-6 border-b border-slate-100">
              <div className="h-20 w-20 rounded-2xl bg-emerald-100 flex items-center justify-center text-3xl font-black text-emerald-700">
                {profile.full_name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{profile.full_name || '—'}</p>
                <p className="text-sm text-slate-500 mt-0.5 capitalize">{profile.role?.replace(/_/g, ' ') || 'Full Time Staff'}{profile.job_title ? ` · ${profile.job_title}` : ''}</p>
                {profile.staff_id && <p className="text-xs text-slate-400 mt-1">ID: {profile.staff_id}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Editable */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                {editing ? (
                  <input type="text" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                ) : <p className="mt-1 text-slate-800 font-medium">{profile.full_name || '—'}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</label>
                {editing ? (
                  <input type="tel" value={form.phone_number || ''} onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))} placeholder="+65 9XXX XXXX"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                ) : <p className="mt-1 text-slate-800 font-medium">{profile.phone_number || <span className="text-slate-400 italic">Not set</span>}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Number</label>
                {editing ? (
                  <input type="tel" value={form.contact_number || ''} onChange={e => setForm(f => ({ ...f, contact_number: e.target.value }))} placeholder="Alternate contact number"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                ) : <p className="mt-1 text-slate-800 font-medium">{profile.contact_number || <span className="text-slate-400 italic">Not set</span>}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
                <p className="mt-1 text-slate-800 font-medium">{profile.email || '—'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profile Description</label>
                {editing ? (
                  <textarea value={form.profile_description || ''} onChange={e => setForm(f => ({ ...f, profile_description: e.target.value }))} rows={3}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none"
                  />
                ) : <p className="mt-1 text-slate-800 font-medium">{profile.profile_description || <span className="text-slate-400 italic">Not set</span>}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
