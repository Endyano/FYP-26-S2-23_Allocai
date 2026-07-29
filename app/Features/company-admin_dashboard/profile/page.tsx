'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type CompanyProfile = {
  company_name: string;
  industry: string | null;
  company_email: string | null;
  company_phone: string | null;
  company_address: string | null;
};

const EMPTY_PROFILE: CompanyProfile = {
  company_name: '',
  industry: '',
  company_email: '',
  company_phone: '',
  company_address: '',
};

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState<CompanyProfile>(EMPTY_PROFILE);
  const [form, setForm] = useState<CompanyProfile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadProfile() {
    setLoading(true);
    const result = await apiFetch<{ company: CompanyProfile }>('/api/company-admin/company-profile');
    if (result.success && result.company) {
      const loaded = {
        company_name: result.company.company_name || '',
        industry: result.company.industry || '',
        company_email: result.company.company_email || '',
        company_phone: result.company.company_phone || '',
        company_address: result.company.company_address || '',
      };
      setProfile(loaded);
      setForm(loaded);
    } else {
      setError(result.message || 'Could not load company profile.');
    }
    setLoading(false);
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function handleSave() {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const result = await apiFetch<{ company: CompanyProfile }>('/api/company-admin/company-profile', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      if (result.success) {
        setProfile(result.company ?? form);
        setEditing(false);
        setSuccess('Company profile updated successfully.');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message || 'Failed to save.');
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setForm(profile);
    setEditing(false);
    setError('');
  }

  const field = (key: keyof CompanyProfile, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      {editing ? (
        <input
          type={type}
          value={form[key] || ''}
          placeholder={placeholder}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
        />
      ) : (
        <p className="mt-1 text-slate-800 font-medium">{profile[key] || <span className="text-slate-400 italic">Not set</span>}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">

      {success && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 font-medium">{success}</div>
      )}
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium">{error}</div>
      )}

      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Company Profile</h2>
            <p className="text-sm text-slate-500 mt-0.5">View and update your organisation&apos;s details.</p>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={cancelEdit}
                className="rounded-xl bg-white border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="px-8 py-16 text-center text-slate-400 animate-pulse">Loading profile...</div>
        ) : (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {field('company_name', 'Company Name', 'text', 'e.g. Harbour Foods Pte. Ltd.')}
            {field('industry', 'Industry', 'text', 'e.g. Food & Beverage')}
            {field('company_email', 'Company Email', 'email', 'admin@company.sg')}
            {field('company_phone', 'Phone Number', 'tel', '+65 6XXX XXXX')}
            <div className="md:col-span-2">
              {field('company_address', 'Address', 'text', 'Street, City, State')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
